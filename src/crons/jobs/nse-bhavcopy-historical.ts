/**
 * NSE Historical Bhavcopy Backfill
 * ----------------------------------
 * Fetches sec_bhavdata_full CSVs for past trading days from NSE archives
 * and upserts prices into bhavcopy_daily.
 *
 * Notes / past bugs (do not re-introduce):
 *   - fetchNseBhavcopy(target) walks back up to 6 days to tolerate
 *     holidays. Each returned row carries the ACTUAL CSV date in row.date.
 *     We MUST upsert using row.date, not `target`, otherwise rows from a
 *     trading day get duplicated under every holiday `target` walked through.
 *   - This job is long-running. We bulk-load the symbol→id map ONCE and
 *     bound total wall-time so a stuck NSE response cannot leave the
 *     ingestion_runs row in "running" forever.
 *   - (Fixed 2026-09-22, flagged 2026-08-19) Coverage MUST be tracked per
 *     (date, company), not per date alone. The old check skipped a whole
 *     trading day the moment ANY company had a row for it — so once the
 *     first ~30 days of history existed, re-running this job added nothing
 *     for a newly-added company (e.g. from nse_company_master), even though
 *     that company had zero historical rows. A date now only counts as
 *     "done" once every currently-known company has a row for it.
 *
 * Triggerable from /sup-min/ingestion.
 */

import { prisma } from "@/lib/db";
import { fetchNseBhavcopy } from "@/lib/scrapers/nse-bhavcopy";
import type { IngestionResult } from "../runIngestion";

const MAX_DAYS = parseInt(process.env.BHAVCOPY_BACKFILL_DAYS ?? "30", 10);
const MAX_WALL_MS = parseInt(process.env.BHAVCOPY_BACKFILL_MAX_MS ?? `${25 * 60 * 1000}`, 10);

function isWeekend(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function subtractDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function ingestHistoricalBhavcopy(): Promise<IngestionResult> {
  const startedAt = Date.now();

  // Bulk-load the symbol→id map ONCE. Previously findUnique was called per
  // row (~2,300 rows × 30 days = 69k DB roundtrips → multi-hour runs).
  const companies = await prisma.company.findMany({
    where: { nseSymbol: { not: null } },
    select: { id: true, nseSymbol: true },
  });
  const symbolMap = new Map(companies.map((c) => [c.nseSymbol!, c.id]));
  const allCompanyIds = [...new Set(companies.map((c) => c.id))];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Per-(date, company) coverage within the backfill window — see header
  // comment. A single query covering the whole window is far cheaper than
  // the multi-hour findUnique-per-row bug this file already fixed once.
  const windowStart = subtractDays(today, MAX_DAYS * 2 + 1);
  const existingRows = await prisma.bhavcopyDaily.findMany({
    where: { source: "nse", date: { gte: windowStart } },
    select: { date: true, companyId: true },
  });
  const existingByDate = new Map<string, Set<number>>();
  for (const r of existingRows) {
    const k = dateKey(r.date);
    let set = existingByDate.get(k);
    if (!set) {
      set = new Set();
      existingByDate.set(k, set);
    }
    set.add(r.companyId);
  }
  function dateFullyCovered(key: string): boolean {
    const set = existingByDate.get(key);
    if (!set) return false;
    for (const id of allCompanyIds) {
      if (!set.has(id)) return false;
    }
    return true;
  }
  function markCovered(key: string, companyId: number) {
    let set = existingByDate.get(key);
    if (!set) {
      set = new Set();
      existingByDate.set(key, set);
    }
    set.add(companyId);
  }

  let rowsIn = 0;
  let attempted = 0;
  let skipped = 0;
  let timedOut = false;

  let daysBack = 1;
  while (attempted < MAX_DAYS) {
    if (Date.now() - startedAt > MAX_WALL_MS) {
      timedOut = true;
      break;
    }

    const target = subtractDays(today, daysBack);
    daysBack++;
    // Hard upper bound on calendar walk, scaled to allow MAX_DAYS trading
    // days plus weekend/holiday slack (~1.5× covers India market).
    if (daysBack > MAX_DAYS * 2) break;

    if (isWeekend(target)) continue;

    const targetKey = dateKey(target);
    if (dateFullyCovered(targetKey)) {
      skipped++;
      attempted++;
      continue;
    }

    try {
      const rows = await fetchNseBhavcopy(target);
      if (rows.length === 0) {
        attempted++;
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      // CRITICAL: use rows[0].date (actual CSV date), not `target`. The
      // scraper may have walked back to find a published file.
      const csvDate = rows[0].date;
      csvDate.setHours(0, 0, 0, 0);
      const csvKey = dateKey(csvDate);

      if (dateFullyCovered(csvKey)) {
        // Already fully covered this trading day under a different `target`
        // walked earlier in this run; skip re-fetching/re-upserting.
        skipped++;
        attempted++;
        continue;
      }

      // Alias the holiday-shifted targetKey to the same coverage Set as the
      // real trading day, so future runs treat the holiday date as covered
      // too once the real day is (same optimization the old code had, now
      // correct per-company instead of a blanket "date exists" flag).
      if (targetKey !== csvKey) {
        let set = existingByDate.get(csvKey);
        if (!set) {
          set = new Set();
          existingByDate.set(csvKey, set);
        }
        existingByDate.set(targetKey, set);
      }

      for (const row of rows) {
        const companyId = symbolMap.get(row.symbol);
        if (!companyId) continue;
        try {
          await prisma.bhavcopyDaily.upsert({
            where: { companyId_date_source: { companyId, date: csvDate, source: "nse" } },
            create: {
              companyId,
              date: csvDate,
              open: row.open,
              high: row.high,
              low: row.low,
              close: row.close,
              volume: BigInt(Math.round(row.volume)),
              deliveryQty: row.deliveryQty != null ? BigInt(Math.round(row.deliveryQty)) : null,
              deliveryPct: row.deliveryPct ?? null,
              source: "nse",
            },
            update: {
              open: row.open,
              high: row.high,
              low: row.low,
              close: row.close,
              volume: BigInt(Math.round(row.volume)),
              deliveryQty: row.deliveryQty != null ? BigInt(Math.round(row.deliveryQty)) : null,
              deliveryPct: row.deliveryPct ?? null,
            },
          });
          rowsIn++;
          markCovered(csvKey, companyId);
        } catch {
          // single-row failure must not abort the whole day
        }
      }

      attempted++;
      await new Promise((r) => setTimeout(r, 1000));
    } catch {
      attempted++;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const notes = `Walked ${attempted} trading days (${skipped} already in DB, ${rowsIn} rows upserted)${
    timedOut ? ` — stopped early at wall-time cap ${MAX_WALL_MS}ms` : ""
  }`;
  return { rowsIn, notes };
}
