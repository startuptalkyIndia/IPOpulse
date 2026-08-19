/**
 * GMP Tracker — auto-fills the ipo_gmp table from the GMP sources.
 * ─────────────────────────────────────────────────────────────────
 * Grey Market Premium is the #1 thing retail investors check before
 * applying to an IPO. The ipo_gmp table + GMP chart UI have existed since
 * launch but were fed only by the manual /sup-min/gmp admin page.
 *
 * Fetching + parsing lives in `src/lib/scrapers/gmp-sources.ts` (multi-source
 * with failover); this file owns only the DB side: matching scraped names to
 * our IPOs, creating BSE SME IPOs, and upserting one row per IPO per day.
 *
 * Matching: sources use short names ("Horizon Reclaim") vs our full names
 * ("Horizon Reclaim Limited") — same normalize + prefix strategy as
 * ipo-symbol-backfill. Only matches IPOs not yet listed/withdrawn, opened
 * (or opening) within a recent window, so stale rows can't mis-attach.
 *
 * Upserts one row per IPO per day (unique ipoId+date) → builds the GMP
 * trend history the chart needs. Runs every 4 hours.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { slugifyIpoName } from "@/lib/scrapers/bse-ipo";
import { normalizeCompanyName as normalize } from "@/lib/ipo-name-match";
import { fetchGmpRows } from "@/lib/scrapers/gmp-sources";

export async function trackGmp(): Promise<IngestionResult> {
  const { source, rows: scraped } = await fetchGmpRows();

  // Candidate IPOs: not yet listed/withdrawn, opening within ±45 days
  const windowStart = new Date(Date.now() - 45 * 86400000);
  const windowEnd = new Date(Date.now() + 45 * 86400000);
  const ipos = await prisma.ipo.findMany({
    where: {
      status: { in: ["upcoming", "live", "closed"] },
      OR: [
        { openDate: { gte: windowStart, lte: windowEnd } },
        { openDate: null },
      ],
    },
    select: { id: true, name: true },
  });

  const exactMap = new Map<string, number>();
  const normed: Array<{ id: number; norm: string; words: Set<string> }> = [];
  for (const ipo of ipos) {
    const n = normalize(ipo.name);
    if (n.length < 3) continue;
    exactMap.set(n, ipo.id);
    normed.push({ id: ipo.id, norm: n, words: new Set(n.split(" ").filter((w) => w.length > 1)) });
  }

  const today = new Date();
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  let upserted = 0;
  let unmatched = 0;
  let created = 0;
  let manualSkipped = 0;
  const unmatchedNames: string[] = [];

  for (const row of scraped) {
    const rowNorm = normalize(row.name);
    if (rowNorm.length < 3) continue;

    let ipoId = exactMap.get(rowNorm) ?? null;
    if (!ipoId) {
      const rowWords = rowNorm.split(" ").filter((w) => w.length > 1);
      const candidates = normed.filter((c) => {
        if (!(c.norm.startsWith(rowNorm) || rowNorm.startsWith(c.norm))) return false;
        const shared = rowWords.filter((w) => c.words.has(w)).length;
        // 2+ shared words, or a single-word name that prefix-matches exactly one IPO
        return shared >= 2 || (rowWords.length === 1 && c.words.size === 1);
      });
      if (candidates.length === 1) ipoId = candidates[0].id;
    }

    if (!ipoId) {
      // BSE SME IPOs never appear in the NSE feed (and BSE blocks cloud IPs),
      // so these pages are our only listing source for them. Create the IPO here.
      // NSE SME + Mainboard stay with nse_ipos to avoid duplicate records.
      const statusMap: Record<string, string> = { upcoming: "upcoming", open: "live", closed: "closed" };
      const mapped = statusMap[row.status.trim().toLowerCase()];
      if (/bse\s*sme/i.test(row.boardType) && mapped) {
        const nums = row.priceBand.replace(/,/g, "").match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
        const high = nums.length ? Math.max(...nums) : null;
        const low = nums.length ? Math.min(...nums) : null;
        const slug = slugifyIpoName(row.name, { suffix: "sme" });
        const createdIpo = await prisma.ipo.upsert({
          where: { slug },
          update: {},
          create: {
            name: row.name, slug, type: "sme", status: mapped,
            priceBandHigh: high, priceBandLow: low,
            openDate: row.openDate, closeDate: row.closeDate,
          },
        });
        ipoId = createdIpo.id;
        created++;
      } else {
        unmatched++;
        if (unmatchedNames.length < 5) unmatchedNames.push(row.name);
        continue;
      }
    }

    // Do NOT overwrite a GMP a human curated via /sup-min (audit HIGH: the
    // tracker silently clobbered manual entries). Manual rows have enteredBy =
    // an admin email; tracker rows have enteredBy = "gmp_tracker".
    const existing = await prisma.ipoGmp.findUnique({
      where: { ipoId_date: { ipoId, date } },
      select: { enteredBy: true },
    });
    if (existing && existing.enteredBy && existing.enteredBy !== "gmp_tracker") {
      manualSkipped++;
      continue;
    }

    await prisma.ipoGmp.upsert({
      where: { ipoId_date: { ipoId, date } },
      update: { gmp: row.gmp, source, enteredBy: "gmp_tracker" },
      create: { ipoId, date, gmp: row.gmp, source, enteredBy: "gmp_tracker" },
    });
    upserted++;
  }

  console.log(
    `[gmp-tracker] source=${source}: ${upserted} GMP rows upserted (${created} BSE SME IPOs created), ${unmatched} unmatched of ${scraped.length} scraped` +
      (unmatchedNames.length ? ` (unmatched: ${unmatchedNames.join(", ")})` : ""),
  );
  return {
    rowsIn: upserted,
    rowsError: 0,
    notes: `source=${source}; ${upserted}/${scraped.length} matched+saved${created ? `; ${created} BSE SME IPOs created` : ""}${manualSkipped ? `; ${manualSkipped} manual GMP preserved` : ""}${unmatched ? `; unmatched: ${unmatchedNames.join(", ")}${unmatched > 5 ? "…" : ""}` : ""}`,
  };
}
