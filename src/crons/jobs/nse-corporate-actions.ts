/**
 * NSE Corporate Actions (bonus/split) ingestion — added 2026-10-03.
 *
 * Found live: bhavcopy_daily stores raw UNADJUSTED prices, and our existing
 * `corporate_actions` table (BSE-announcement sourced) missed real, confirmed
 * bonus issues entirely (e.g. HDFC Bank's 26-Aug-2025 1:1 bonus — zero rows
 * for it, despite NSE's own corporate-actions page showing it clearly). This
 * silently corrupted 52-week-range/return/technicals calculations for any
 * company with a split/bonus inside the active lookback window — caught live
 * on IRB Infrastructure's ticker page: the "1Y Return" stat tile showed
 * -59.9% against the Yahoo-sourced chart's correct -19.16% on the SAME page,
 * because of an untracked 30-Mar-2026 1:1 bonus.
 *
 * Reads NSE's own `/api/corporates-corporateActions` feed directly (the same
 * endpoint NSE's own corporate-actions page uses) and stores ONLY bonus/split
 * events with a mechanical, parseable adjustment factor (see
 * nse-corporate-actions.ts parser) — source='nse', distinct from the existing
 * source='bse' rows used for the dividend/AGM/board-meeting calendar display.
 * These NSE-sourced rows feed src/lib/price.ts's adjustment logic, applied in
 * canonicalSeries/canonicalRange so every return/technicals/52-week
 * calculation downstream is automatically correct — no per-caller changes
 * needed.
 *
 * Prioritizes companies never checked before (no source='nse' row yet) for
 * the initial backfill, capped per run; once a company has been checked,
 * re-checks the least-recently-checked ones to catch new future events.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { fetchNseArray } from "@/lib/nse-session";
import { parseCorporateActionSubject, parseNseCaDate } from "@/lib/scrapers/nse-corporate-actions";

const MAX_PER_RUN = parseInt(process.env.NSE_CA_MAX_PER_RUN ?? "150", 10);

interface NseCaRow {
  symbol?: string;
  subject?: string;
  exDate?: string;
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function ingestNseCorporateActions(): Promise<IngestionResult> {
  // Never-checked companies first (no nse-sourced row yet at all).
  const neverChecked = await prisma.company.findMany({
    where: { nseSymbol: { not: null }, active: true, corporateActions: { none: { source: "nse" } } },
    select: { id: true, nseSymbol: true },
    orderBy: { marketCap: "desc" },
    take: MAX_PER_RUN,
  });

  let candidates = neverChecked;
  if (candidates.length < MAX_PER_RUN) {
    // Fill the rest of this run's capacity with the least-recently-checked
    // companies, to catch NEW corporate actions for ones already covered once.
    const alreadyCheckedIds = new Set(neverChecked.map((c) => c.id));
    const staleChecked = await prisma.company.findMany({
      where: {
        nseSymbol: { not: null },
        active: true,
        id: { notIn: [...alreadyCheckedIds] },
        corporateActions: { some: { source: "nse" } },
      },
      select: {
        id: true, nseSymbol: true,
        corporateActions: { where: { source: "nse" }, orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
      take: 2000, // bounded candidate pool to sort in JS; real company count is ~2.6k
    });
    staleChecked.sort((a, b) => (a.corporateActions[0]?.createdAt.getTime() ?? 0) - (b.corporateActions[0]?.createdAt.getTime() ?? 0));
    candidates = [...candidates, ...staleChecked.slice(0, MAX_PER_RUN - candidates.length)];
  }

  let rowsIn = 0;
  let errors = 0;
  let companiesChecked = 0;

  for (const co of candidates) {
    if (!co.nseSymbol) continue;
    try {
      const rows = await fetchNseArray<NseCaRow>(
        `/api/corporates-corporateActions?index=equities&symbol=${encodeURIComponent(co.nseSymbol)}`,
      );
      for (const row of rows) {
        const parsed = parseCorporateActionSubject(row.subject ?? "");
        if (!parsed) continue;
        const exDate = parseNseCaDate(row.exDate);
        if (!exDate) continue;
        const sourceId = `${co.nseSymbol}-${row.exDate}-${parsed.actionType}`;
        await prisma.corporateAction.upsert({
          where: { source_sourceId: { source: "nse", sourceId } },
          create: {
            companyId: co.id,
            actionType: parsed.actionType,
            exDate,
            ratio: parsed.ratio,
            adjustmentFactor: parsed.adjustmentFactor,
            purpose: row.subject,
            source: "nse",
            sourceId,
          },
          update: {
            // Idempotent re-run; NSE doesn't revise these after the fact, but
            // keep it current if it ever does.
            adjustmentFactor: parsed.adjustmentFactor,
            purpose: row.subject,
          },
        });
        rowsIn++;
      }
      companiesChecked++;
      await sleep(250); // be polite to NSE
    } catch {
      errors++;
    }
  }

  return {
    rowsIn,
    rowsError: errors,
    notes: `${companiesChecked} companies checked (${neverChecked.length} new, ${companiesChecked - neverChecked.length} re-checked), ${rowsIn} bonus/split events upserted, ${errors} errors`,
  };
}
