/**
 * Indian stock price ingestion via Yahoo Finance v8 chart API.
 *
 * v7 quote API deprecated/blocked (returns 401). Switched to v8 chart API
 * which is per-symbol but works reliably from cloud IPs with no auth.
 *
 * v8 URL: https://query2.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d
 * Returns: regularMarketPrice, open, high, low, volume via chart metadata
 *
 * Fetches top 500 companies concurrently (10 workers, 100ms delay between batches).
 * 500 symbols ≈ 60 seconds total. Runs every 15 min during market hours.
 *
 * Schedule: every 15 min, 9:10am – 3:50pm IST, Mon–Fri.
 */

import { prisma } from "@/lib/db";

interface YahooV8Meta {
  symbol: string;
  regularMarketPrice: number;
  regularMarketVolume: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  chartPreviousClose: number;
}

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Fetch a single symbol via Yahoo Finance v8 chart API */
async function fetchV8Chart(yahooSymbol: string): Promise<YahooV8Meta | null> {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d&includePrePost=false&events=`;
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const data = await resp.json() as {
      chart?: { result?: Array<{ meta?: Partial<YahooV8Meta> }> };
    };
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    return {
      symbol: meta.symbol ?? yahooSymbol,
      regularMarketPrice: meta.regularMarketPrice,
      regularMarketVolume: meta.regularMarketVolume ?? 0,
      regularMarketOpen: meta.regularMarketOpen ?? meta.regularMarketPrice,
      regularMarketDayHigh: meta.regularMarketDayHigh ?? meta.regularMarketPrice,
      regularMarketDayLow: meta.regularMarketDayLow ?? meta.regularMarketPrice,
      chartPreviousClose: meta.chartPreviousClose ?? meta.regularMarketPrice,
    };
  } catch {
    return null;
  }
}

/** Fetch a batch of symbols concurrently (up to `concurrency` at a time) */
async function fetchBatch(
  symbols: string[],
  concurrency = 10
): Promise<Map<string, YahooV8Meta>> {
  const result = new Map<string, YahooV8Meta>();
  for (let i = 0; i < symbols.length; i += concurrency) {
    const chunk = symbols.slice(i, i + concurrency);
    const results = await Promise.all(chunk.map(fetchV8Chart));
    for (let j = 0; j < chunk.length; j++) {
      const meta = results[j];
      if (meta) result.set(chunk[j], meta);
    }
    // Polite delay between batches
    if (i + concurrency < symbols.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return result;
}

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

  // Top 500 active companies with NSE symbol
  const companies = await prisma.company.findMany({
    where: { active: true, nseSymbol: { not: null } },
    orderBy: { marketCap: "desc" },
    take: 500,
    select: { id: true, nseSymbol: true },
  });

  if (companies.length === 0) return { rowsIn: 0, notes: "No companies with NSE symbols." };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const symbolToId = new Map<string, number>();
  const yahooSymbols: string[] = [];
  for (const co of companies) {
    if (!co.nseSymbol) continue;
    const ySym = `${co.nseSymbol}.NS`;
    yahooSymbols.push(ySym);
    symbolToId.set(ySym, co.id);
  }

  const quotes = await fetchBatch(yahooSymbols, 10);

  let upserted = 0;
  let errors = 0;

  for (const [ySym, meta] of quotes) {
    const companyId = symbolToId.get(ySym);
    if (!companyId) continue;
    try {
      await prisma.bhavcopyDaily.upsert({
        where: { companyId_date_source: { companyId, date: today, source: "yahoo" } },
        update: {
          close: meta.regularMarketPrice,
          open: meta.regularMarketOpen,
          high: meta.regularMarketDayHigh,
          low: meta.regularMarketDayLow,
          volume: BigInt(Math.round(meta.regularMarketVolume)),
        },
        create: {
          companyId,
          date: today,
          close: meta.regularMarketPrice,
          open: meta.regularMarketOpen,
          high: meta.regularMarketDayHigh,
          low: meta.regularMarketDayLow,
          volume: BigInt(Math.round(meta.regularMarketVolume)),
          source: "yahoo",
        },
      });
      upserted++;
    } catch {
      errors++;
    }
  }

  console.log(`[yahoo-prices] v8: ${upserted} updated, ${errors} errors from ${quotes.size} quotes (${yahooSymbols.length} requested)`);
  return {
    rowsIn: upserted,
    rowsError: errors,
    notes: `Yahoo v8: ${upserted}/${yahooSymbols.length} updated in ~${Math.round(yahooSymbols.length / 10 * 0.2)}s`,
  };
}
