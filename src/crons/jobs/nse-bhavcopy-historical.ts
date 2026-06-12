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

  const existing = await prisma.bhavcopyDaily.findMany({
    where: { source: "nse" },
    select: { date: true },
    distinct: ["date"],
  });
  const existingDates = new Set(existing.map((r) => dateKey(r.date)));

  // Bulk-load the symbol→id map ONCE. Previously findUnique was called per
  // row (~2,300 rows × 30 days = 69k DB roundtrips → multi-hour runs).
  const companies = await prisma.company.findMany({
    where: { nseSymbol: { not: null } },
    select: { id: true, nseSymbol: true },
  });
  const symbolMap = new Map(companies.map((c) => [c.nseSymbol!, c.id]));

  let rowsIn = 0;
  let attempted = 0;
  let skipped = 0;
  let timedOut = false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
    if (existingDates.has(targetKey)) {
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

      if (existingDates.has(csvKey)) {
        // Already have this trading day under a different `target`; skip.
        existingDates.add(targetKey);
        skipped++;
        attempted++;
        continue;
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
        } catch {
          // single-row failure must not abort the whole day
        }
      }

      existingDates.add(csvKey);
      existingDates.add(targetKey);
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
