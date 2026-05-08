/**
 * NSE Historical FII/DII Backfill
 * ---------------------------------
 * Fetches historical FII/DII cash flows from the NSE API using the same
 * session-cookie approach as the daily cron (which now works even from cloud IPs).
 *
 * NSE's fiidiiTradeReact API returns data for specific date ranges.
 * We fetch month-by-month going back 2 years.
 *
 * Run once from /sup-min/ingestion after first deploy.
 */

import { prisma } from "@/lib/db";
import { fetchNseFiiDii } from "@/lib/scrapers/nse";
import type { IngestionResult } from "../runIngestion";

function parseNseDate(s: string): Date {
  const [d, m, y] = s.split("-");
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  return new Date(Number(y), months[m] ?? 0, Number(d));
}

function formatNseDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }).replace(/ /g, "-");
}

async function fetchFiiDiiForRange(from: Date, to: Date) {
  // Temporarily override the fetchNseFiiDii to pass date params
  // NSE API: /api/fiidiiTradeReact doesn't take date params — it returns most recent
  // But /api/historical/fii-dii-trading-activity?from=DD-Mon-YYYY&to=DD-Mon-YYYY does
  const { buildNseSession } = await import("@/lib/scrapers/nse");
  const { client } = await buildNseSession();
  const path = `/api/historical/fii-dii-trading-activity?from=${formatNseDate(from)}&to=${formatNseDate(to)}`;
  try {
    const { data } = await client.get<
      Array<{ category: string; date: string; buyValue: string; sellValue: string; netValue: string }>
    >(`https://www.nseindia.com${path}`, {
      headers: { Referer: "https://www.nseindia.com/" },
      validateStatus: (s) => s < 500,
    });
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export async function ingestHistoricalFiiDii(): Promise<IngestionResult> {
  const existing = await prisma.fiiDiiDaily.findMany({ select: { date: true } });
  const existingDates = new Set(existing.map((r) => r.date.toISOString().slice(0, 10)));

  let rowsIn = 0;
  const today = new Date();

  // Fetch 2 years of data month by month
  for (let monthsBack = 1; monthsBack <= 24; monthsBack++) {
    const toDate = new Date(today);
    toDate.setMonth(toDate.getMonth() - (monthsBack - 1));
    toDate.setDate(1);
    toDate.setDate(0); // last day of previous month
    if (monthsBack === 1) toDate.setTime(today.getTime());

    const fromDate = new Date(toDate);
    fromDate.setDate(1);

    const rows = await fetchFiiDiiForRange(fromDate, toDate);
    if (!rows.length) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    // Group by date
    const byDate = new Map<string, { date: Date; fiiBuy?: number; fiiSell?: number; fiiNet?: number; diiBuy?: number; diiSell?: number; diiNet?: number }>();
    for (const r of rows) {
      const date = parseNseDate(r.date);
      const key = date.toISOString().slice(0, 10);
      if (existingDates.has(key)) continue;
      const entry = byDate.get(key) ?? { date };
      const isFii = r.category.toUpperCase().includes("FII") || r.category.toUpperCase().includes("FPI");
      if (isFii) {
        entry.fiiBuy = Number(r.buyValue);
        entry.fiiSell = Number(r.sellValue);
        entry.fiiNet = Number(r.netValue);
      } else {
        entry.diiBuy = Number(r.buyValue);
        entry.diiSell = Number(r.sellValue);
        entry.diiNet = Number(r.netValue);
      }
      byDate.set(key, entry);
    }

    for (const [key, v] of byDate) {
      await prisma.fiiDiiDaily.upsert({
        where: { date_segment: { date: v.date, segment: "cash" } },
        update: { fiiBuy: v.fiiBuy, fiiSell: v.fiiSell, fiiNet: v.fiiNet, diiBuy: v.diiBuy, diiSell: v.diiSell, diiNet: v.diiNet },
        create: { date: v.date, segment: "cash", fiiBuy: v.fiiBuy, fiiSell: v.fiiSell, fiiNet: v.fiiNet, diiBuy: v.diiBuy, diiSell: v.diiSell, diiNet: v.diiNet },
      });
      existingDates.add(key);
      rowsIn++;
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  return { rowsIn, notes: `Backfilled ${rowsIn} FII/DII records` };
}
