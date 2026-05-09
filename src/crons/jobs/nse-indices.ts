/**
 * NSE Index Daily Data Ingestion
 * --------------------------------
 * Downloads ind_close_all_DDMMYYYY.csv from NSE archives.
 * Contains 70+ indices: Nifty 50, Bank, IT, Auto, Pharma, etc.
 * Each row includes OHLC + Points/% change + Volume + P/E + P/B + Div Yield.
 *
 * This is the BEST free data source for:
 *  - Daily Nifty levels (homepage stats)
 *  - Sector-level P/E (Nifty Bank P/E, Nifty IT P/E, etc.)
 *  - Index performance comparison
 *
 * Schedule: daily at 4 PM IST (after market close, before bhavcopy)
 * URL: https://nsearchives.nseindia.com/content/indices/ind_close_all_DDMMYYYY.csv
 */

import axios from "axios";
import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function ddmmyyyy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

function parseDate(s: string): Date | null {
  // "08-05-2026" → Date
  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function num(s: string): number | null {
  if (!s || s.trim() === "-" || s.trim() === "") return null;
  const n = parseFloat(s.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

async function fetchIndexCsv(date: Date): Promise<string | null> {
  const url = `https://nsearchives.nseindia.com/content/indices/ind_close_all_${ddmmyyyy(date)}.csv`;
  try {
    const { data } = await axios.get<string>(url, {
      timeout: 20000,
      headers: { "User-Agent": UA, Referer: "https://www.nseindia.com/" },
    });
    return data;
  } catch {
    return null;
  }
}

export async function ingestNseIndices(): Promise<IngestionResult> {
  // Try today and yesterday (today's file may not be published until after close)
  const today = new Date();
  let csv = await fetchIndexCsv(today);
  let targetDate = today;

  if (!csv) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    csv = await fetchIndexCsv(yesterday);
    targetDate = yesterday;
  }

  // Try up to 5 past days (skip weekends / holidays)
  if (!csv) {
    for (let i = 2; i <= 6; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      csv = await fetchIndexCsv(d);
      if (csv) { targetDate = d; break; }
    }
  }

  if (!csv) return { rowsIn: 0, notes: "No NSE index CSV available for recent dates" };

  const lines = csv.trim().split("\n");
  if (lines.length < 2) return { rowsIn: 0, notes: "Empty CSV" };

  // Header: Index Name,Index Date,Open,High,Low,Close,Points Change,Change(%),Volume,Turnover (Rs. Cr.),P/E,P/B,Div Yield
  let rowsIn = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 6) continue;

    const indexName = cols[0].trim();
    const dateStr = cols[1].trim();
    const date = parseDate(dateStr) ?? targetDate;

    const open = num(cols[2]);
    const high = num(cols[3]);
    const low = num(cols[4]);
    const close = num(cols[5]);
    if (!open || !high || !low || !close) continue;

    const pointsChg = num(cols[6]);
    const changePct = num(cols[7]);
    const volume = cols[8] ? BigInt(Math.round(parseFloat(cols[8].replace(/,/g, "")) || 0)) : null;
    const turnoverCr = num(cols[9]);
    const pe = num(cols[10]);
    const pb = num(cols[11]);
    const divYield = num(cols[12]);

    await prisma.niftyIndex.upsert({
      where: { indexName_date: { indexName, date } },
      create: { indexName, date, open, high, low, close, pointsChg, changePct, volume: volume ?? undefined, turnoverCr, pe, pb, divYield },
      update: { open, high, low, close, pointsChg, changePct, volume: volume ?? undefined, turnoverCr, pe, pb, divYield },
    });
    rowsIn++;
  }

  return {
    rowsIn,
    notes: `${rowsIn} indices for ${targetDate.toISOString().slice(0, 10)}`,
  };
}
