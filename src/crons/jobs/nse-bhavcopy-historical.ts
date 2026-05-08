/**
 * NSE Historical Bhavcopy Backfill
 * ----------------------------------
 * Fetches sec_bhavdata_full CSVs for past trading days from NSE archives
 * and upserts prices into bhavcopy_daily. Used to populate historical price
 * data for charts (target: 6 months = ~130 trading days).
 *
 * Same URL format as the daily cron but iterates over past dates.
 * Skips weekends, known market holidays, and dates already in DB.
 * Rate-limited: 1s between files to be polite.
 *
 * Triggerable from /sup-min/ingestion — run once to backfill.
 */

import axios from "axios";
import { prisma } from "@/lib/db";
import { fetchNseBhavcopy } from "@/lib/scrapers/nse-bhavcopy";
import type { IngestionResult } from "../runIngestion";

// How many past trading days to attempt (6 months ≈ 130)
const MAX_DAYS = parseInt(process.env.BHAVCOPY_BACKFILL_DAYS ?? "130", 10);

function isWeekend(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function subtractDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

export async function ingestHistoricalBhavcopy(): Promise<IngestionResult> {
  // Find dates already in DB so we can skip them
  const existing = await prisma.bhavcopyDaily.findMany({
    select: { date: true },
    distinct: ["date"],
  });
  const existingDates = new Set(existing.map((r) => r.date.toISOString().slice(0, 10)));

  let rowsIn = 0;
  let attempted = 0;
  let skipped = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysBack = 1;
  while (attempted < MAX_DAYS) {
    const target = subtractDays(today, daysBack);
    daysBack++;

    if (isWeekend(target)) continue;

    const dateKey = target.toISOString().slice(0, 10);
    if (existingDates.has(dateKey)) {
      skipped++;
      attempted++;
      continue;
    }

    try {
      const rows = await fetchNseBhavcopy(target);
      if (rows.length === 0) {
        // Likely a holiday or file not yet published — skip
        attempted++;
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      // Upsert all rows
      for (const row of rows) {
        const co = await prisma.company.findUnique({
          where: { nseSymbol: row.symbol },
          select: { id: true },
        });
        if (!co) continue;

        await prisma.bhavcopyDaily.upsert({
          where: { companyId_date_source: { companyId: co.id, date: target, source: "nse" } },
          create: {
            companyId: co.id,
            date: target,
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            volume: BigInt(Math.round(row.volume)),
            deliveryPct: row.deliveryPct ?? null,
            source: "nse",
          },
          update: {
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            volume: BigInt(Math.round(row.volume)),
            deliveryPct: row.deliveryPct ?? null,
          },
        });
        rowsIn++;
      }

      existingDates.add(dateKey);
      attempted++;
      await new Promise((r) => setTimeout(r, 1000)); // 1s between files
    } catch {
      attempted++;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return {
    rowsIn,
    notes: `Backfilled ${attempted} trading days (${skipped} already existed, ${rowsIn} rows upserted)`,
  };
}
