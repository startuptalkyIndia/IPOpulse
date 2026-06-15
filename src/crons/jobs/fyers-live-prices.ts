/**
 * Real-time stock prices via Fyers API v3 — a Kite-backup live source.
 *
 * Fyers data/quotes returns last price + OHLC + volume for NSE:SYM-EQ symbols.
 * Needs a daily access_token (admin logs in via /sup-min/fyers-token) AND the
 * app must have the Data API permission. Skips gracefully when either is
 * missing, so the existing Yahoo/Kite pipeline keeps serving prices.
 *
 * Writes into bhavcopy_daily with source "fyers" for today's date.
 * Schedule: every 5 min, 9:10 AM – 3:40 PM IST, Mon–Fri.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { getFyersToken, fetchFyersQuotes, FYERS_APP_ID } from "@/lib/fyers";

function isMarketHours(): boolean {
  const ist = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay();
  if (day === 0 || day === 6) return false;
  const mins = ist.getHours() * 60 + ist.getMinutes();
  return mins >= 9 * 60 + 10 && mins <= 15 * 60 + 40;
}

export async function ingestFyersLivePrices(): Promise<IngestionResult> {
  if (!isMarketHours()) return { rowsIn: 0, notes: "Outside market hours — skipped." };
  if (!FYERS_APP_ID) return { rowsIn: 0, notes: "FYERS_APP_ID not configured." };

  const token = await getFyersToken();
  if (!token) return { rowsIn: 0, notes: "No Fyers token. Add via /sup-min/fyers-token." };

  const companies = await prisma.company.findMany({
    where: { active: true, nseSymbol: { not: null } },
    orderBy: { marketCap: "desc" },
    take: 1000,
    select: { id: true, nseSymbol: true },
  });
  if (companies.length === 0) return { rowsIn: 0, notes: "No companies." };

  // Fyers NSE equity symbol format: "NSE:SBIN-EQ"
  const symbolToId = new Map<string, number>();
  const symbols: string[] = [];
  for (const c of companies) {
    const sym = `NSE:${c.nseSymbol}-EQ`;
    symbols.push(sym);
    symbolToId.set(sym, c.id);
  }

  const quotes = await fetchFyersQuotes(token, symbols);
  if (quotes.size === 0) {
    return { rowsIn: 0, notes: "Fyers returned 0 quotes — token expired or app lacks Data API permission." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let upserted = 0;
  let errors = 0;
  for (const [sym, q] of quotes) {
    const companyId = symbolToId.get(sym);
    if (!companyId || q.lp == null) continue;
    try {
      await prisma.bhavcopyDaily.upsert({
        where: { companyId_date_source: { companyId, date: today, source: "fyers" } },
        update: {
          close: q.lp,
          open: q.open_price ?? q.lp,
          high: q.high_price ?? q.lp,
          low: q.low_price ?? q.lp,
          volume: BigInt(Math.round(q.volume ?? 0)),
        },
        create: {
          companyId,
          date: today,
          close: q.lp,
          open: q.open_price ?? q.lp,
          high: q.high_price ?? q.lp,
          low: q.low_price ?? q.lp,
          volume: BigInt(Math.round(q.volume ?? 0)),
          source: "fyers",
        },
      });
      upserted++;
    } catch {
      errors++;
    }
  }

  console.log(`[fyers-live] Updated ${upserted} prices (${errors} errors) from ${quotes.size} quotes`);
  return {
    rowsIn: upserted,
    rowsError: errors,
    notes: `Fyers live: ${upserted} updated from ${quotes.size} real-time quotes`,
  };
}
