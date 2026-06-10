/**
 * Indian stock price ingestion via Yahoo Finance — intraday refresher.
 *
 * History: v7 quote API → 401. Anonymous v8 chart API → now 429 rate-limited
 * from cloud IPs. The only reliable path is the yahoo-finance2 client, which
 * maintains a cookie + crumb session (same client that powers the weekly
 * fundamentals sync, proven to work at 2,300-company scale).
 *
 * Uses yahoo-finance2's quote() in batches of 50 symbols per call.
 * Top 300 companies by market cap → ~6 API calls per run.
 *
 * Schedule: every 15 min, 9:10am – 3:50pm IST, Mon–Fri.
 * Writes into bhavcopy_daily with source "yahoo" for today's date, so pages
 * show near-live prices during market hours; the official NSE bhavcopy
 * provides canonical EOD data after close.
 */

import { prisma } from "@/lib/db";

interface YfQuote {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketVolume?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
}

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 800;

function isMarketHours(): boolean {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay();
  if (day === 0 || day === 6) return false;
  const mins = ist.getHours() * 60 + ist.getMinutes();
  return mins >= 9 * 60 + 10 && mins <= 15 * 60 + 50;
}

export async function ingestYahooPrices(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  if (!isMarketHours()) {
    return { rowsIn: 0, notes: "Outside market hours — skipped." };
  }

  // Top 300 active companies with NSE symbol (most-viewed stocks)
  const companies = await prisma.company.findMany({
    where: { active: true, nseSymbol: { not: null } },
    orderBy: { marketCap: "desc" },
    take: 300,
    select: { id: true, nseSymbol: true },
  });
  if (companies.length === 0) return { rowsIn: 0, notes: "No companies with NSE symbols." };

  const symbolToId = new Map<string, number>();
  const symbols: string[] = [];
  for (const co of companies) {
    const ySym = `${co.nseSymbol}.NS`;
    symbols.push(ySym);
    symbolToId.set(ySym, co.id);
  }

  // Cookie/crumb-authenticated client — survives where anonymous v8 gets 429
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const YahooFinance = require("yahoo-finance2").default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yf: any = new YahooFinance();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let upserted = 0;
  let errors = 0;
  let fetched = 0;

  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);
    let quotes: YfQuote[] = [];
    try {
      const res = await yf.quote(batch);
      quotes = Array.isArray(res) ? res : [res];
    } catch {
      errors++;
      continue;
    }
    fetched += quotes.length;

    for (const q of quotes) {
      const sym = q.symbol ?? "";
      const companyId = symbolToId.get(sym);
      if (!companyId || q.regularMarketPrice == null) continue;
      try {
        const price = q.regularMarketPrice;
        await prisma.bhavcopyDaily.upsert({
          where: { companyId_date_source: { companyId, date: today, source: "yahoo" } },
          update: {
            close: price,
            open: q.regularMarketOpen ?? price,
            high: q.regularMarketDayHigh ?? price,
            low: q.regularMarketDayLow ?? price,
            volume: BigInt(Math.round(q.regularMarketVolume ?? 0)),
          },
          create: {
            companyId,
            date: today,
            close: price,
            open: q.regularMarketOpen ?? price,
            high: q.regularMarketDayHigh ?? price,
            low: q.regularMarketDayLow ?? price,
            volume: BigInt(Math.round(q.regularMarketVolume ?? 0)),
            source: "yahoo",
          },
        });
        upserted++;
      } catch {
        errors++;
      }
    }

    if (i + BATCH_SIZE < symbols.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  console.log(`[yahoo-prices] yf2: ${upserted} updated, ${errors} errors from ${fetched} quotes (${symbols.length} requested)`);
  return {
    rowsIn: upserted,
    rowsError: errors,
    notes: `yahoo-finance2: ${upserted}/${symbols.length} updated (${fetched} quotes fetched)`,
  };
}
