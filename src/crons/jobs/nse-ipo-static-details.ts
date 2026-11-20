/**
 * IPO Static Details Backfill (lot size, issue size, face value, registrar,
 * lead managers) — added 2026-09-26.
 *
 * Found via a bug-sweep audit: 152-184 of 190 IPOs had these fields NULL
 * (confirmed via direct DB query, not a display bug). Root cause: nse-ipos.ts
 * only reads `/api/ipo-current-issue` and `/api/all-upcoming-issues`, and
 * neither of those NSE endpoints returns this data at all (verified live by
 * fetching each and inspecting the full JSON) — they only carry the live
 * issue list (price band, dates, subscription).
 *
 * This job reads a DIFFERENT NSE endpoint per-symbol,
 * `/api/ipo-detail?symbol=X` — the same "Issue Details" data NSE's own IPO
 * page renders, as a flat {title, value} list rather than structured JSON
 * (parsed by src/lib/scrapers/nse-ipo-detail.ts). Verified live against an
 * active issue (Moneyview), and two already-LISTED ones (Shiprocket, Milky
 * Mist) — the data persists after listing, so this backfills historical
 * IPOs too, not just current ones.
 *
 * BSE code is NOT in this data source (NSE has no reason to carry it) —
 * that gap remains open, tracked separately in TASKS.md.
 *
 * Runs against IPOs with a known nseSymbol but no lotSize yet. Capped per
 * run to stay polite to NSE and bound wall-time; re-running works through
 * the backlog the same way the insider-trading/super-investor backfills do.
 * An IPO with genuinely no data on NSE (very old, or NSE's records don't
 * cover it) keeps coming up empty on every run and is never marked as tried.
 * That is NOT harmless: on 2026-11-19, ~36 such rows filled the whole 40-row
 * batch every night, so fresh IPOs were never reached. The batch is therefore
 * split: most slots go to the newest candidates (fresh IPOs first), the rest
 * to a window that rotates daily through the older ones, so old fillable rows
 * still get their turn without a "tried" column.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { fetchNse } from "@/lib/nse-session";
import { parseIpoIssueDetails } from "@/lib/scrapers/nse-ipo-detail";

const MAX_PER_RUN = parseInt(process.env.IPO_STATIC_DETAILS_MAX_PER_RUN ?? "40", 10);

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function ingestIpoStaticDetails(): Promise<IngestionResult> {
  const where = { lotSize: null, nseSymbol: { not: null } } as const;
  const select = { id: true, nseSymbol: true } as const;
  // Newest first: fresh IPOs always have the highest ids. 3/4 of the batch.
  const newestSlots = Math.max(1, Math.ceil(MAX_PER_RUN * 0.75));
  const rotatingSlots = Math.max(0, MAX_PER_RUN - newestSlots);
  const newest = await prisma.ipo.findMany({ where, select, orderBy: { id: "desc" }, take: newestSlots });
  let candidates = newest;
  if (rotatingSlots > 0) {
    const total = await prisma.ipo.count({ where });
    const rest = total - newestSlots;
    if (rest > 0) {
      // Rotating window over the older candidates, advancing each day.
      const dayNumber = Math.floor(Date.now() / 86_400_000);
      const skip = newestSlots + ((dayNumber * rotatingSlots) % rest);
      const older = await prisma.ipo.findMany({ where, select, orderBy: { id: "desc" }, skip, take: rotatingSlots });
      const seen = new Set(newest.map((c) => c.id));
      candidates = [...newest, ...older.filter((c) => !seen.has(c.id))];
    }
  }

  let rowsIn = 0;
  let errors = 0;
  let noData = 0;
  let noLot = 0;

  for (const ipo of candidates) {
    if (!ipo.nseSymbol) continue;
    try {
      const detail = await fetchNse<{ issueInfo?: { dataList?: { title: string | null; value: string }[] } }>(
        `/api/ipo-detail?symbol=${encodeURIComponent(ipo.nseSymbol)}`,
      );
      const parsed = parseIpoIssueDetails(detail);
      const hasAny = Object.values(parsed).some((v) => v != null);
      if (!hasAny) {
        noData++;
        continue;
      }
      await prisma.ipo.update({
        where: { id: ipo.id },
        data: {
          ...(parsed.lotSize != null && { lotSize: parsed.lotSize }),
          ...(parsed.faceValue != null && { faceValue: parsed.faceValue }),
          ...(parsed.issueSizeCr != null && { issueSize: parsed.issueSizeCr }),
          ...(parsed.registrar && { registrar: parsed.registrar }),
          ...(parsed.leadManagers && { leadManagers: parsed.leadManagers }),
        },
      });
      // Only a lot size takes a row out of the candidate pool. A row that got
      // registrar/lead managers but no lot size used to count as "updated" every
      // night forever (Ardee, Xtranet, Aastha, CSM on 2026-11-21).
      if (parsed.lotSize != null) rowsIn++;
      else noLot++;
      await sleep(300); // be polite to NSE
    } catch (e) {
      errors++;
      console.warn(`[ipo_static_details] ${ipo.nseSymbol}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return {
    rowsIn,
    rowsError: errors,
    notes: `${rowsIn} IPOs got a lot size, ${noLot} had details but no lot size, ${noData} had no issueInfo on NSE, ${errors} errors (of ${candidates.length} candidates this run)`,
  };
}
