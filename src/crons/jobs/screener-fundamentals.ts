/**
 * Screener Fundamentals via Yahoo Finance Batch Quote API
 * --------------------------------------------------------
 * Uses the same v7/finance/quote batch endpoint as yahoo_prices (proven to work
 * from cloud servers). Fetches P/E, P/B, EPS, dividend yield, 52W high/low,
 * and market cap for all active companies in batches of 50.
 *
 * Note: quoteSummary (v10) returns ROE/D/E but gets 429 rate-limited from cloud.
 * The v7 batch quote returns P/E, P/B, EPS, dividend yield — good enough for screener.
 *
 * Runs nightly at 10:30 PM IST after markets close.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const YF_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

const BATCH_SIZE = 50;

interface YFQuote {
  symbol: string;
  trailingPE?: number;
  priceToBook?: number;
  epsTrailingTwelveMonths?: number;
  trailingAnnualDividendYield?: number;
  dividendYield?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  bookValue?: number;
}

async function fetchBatchQuotes(symbols: string[]): Promise<YFQuote[]> {
  const symbolStr = symbols.join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolStr)}&fields=trailingPE,priceToBook,epsTrailingTwelveMonths,trailingAnnualDividendYield,dividendYield,marketCap,fiftyTwoWeekHigh,fiftyTwoWeekLow,bookValue`;

  try {
    const res = await fetch(url, {
      headers: YF_HEADERS,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.quoteResponse?.result ?? []) as YFQuote[];
  } catch {
    return [];
  }
}

export async function ingestScreenerFundamentals(): Promise<IngestionResult> {
  const companies = await prisma.company.findMany({
    where: {
      active: true,
      OR: [{ nseSymbol: { not: null } }, { bseCode: { not: null } }],
    },
    select: { id: true, nseSymbol: true, bseCode: true },
    orderBy: { marketCap: "desc" },
    take: 2000,
  });

  let rowsIn = 0;
  let rowsError = 0;

  // Build symbol → companyId map
  const symbolMap = new Map<string, number>();
  const symbolList: string[] = [];
  for (const co of companies) {
    const sym = co.nseSymbol ? `${co.nseSymbol}.NS` : co.bseCode ? `${co.bseCode}.BO` : null;
    if (!sym) continue;
    symbolMap.set(sym, co.id);
    symbolList.push(sym);
  }

  // Process in batches
  for (let i = 0; i < symbolList.length; i += BATCH_SIZE) {
    const batch = symbolList.slice(i, i + BATCH_SIZE);
    const quotes = await fetchBatchQuotes(batch);

    for (const q of quotes) {
      const companyId = symbolMap.get(q.symbol);
      if (!companyId) continue;

      const data: Record<string, unknown> = { fundamentalsAt: new Date() };
      if (q.trailingPE != null && isFinite(q.trailingPE)) data.peRatio = q.trailingPE;
      if (q.priceToBook != null && isFinite(q.priceToBook)) data.pbRatio = q.priceToBook;
      if (q.epsTrailingTwelveMonths != null) data.eps = q.epsTrailingTwelveMonths;
      if (q.bookValue != null) data.bookValue = q.bookValue;
      // Yahoo dividend yield is already a fraction (0.02 = 2%) — convert to %
      const dy = q.trailingAnnualDividendYield ?? q.dividendYield;
      if (dy != null && isFinite(dy)) data.dividendYield = dy * 100;
      // Market cap in absolute INR → convert to crore
      if (q.marketCap != null && q.marketCap > 0) data.marketCap = q.marketCap / 1e7;

      if (Object.keys(data).length > 1) {
        await prisma.company.update({ where: { id: companyId }, data });
        rowsIn++;
      }
    }

    if (quotes.length === 0) rowsError++;

    // 400ms between batches to stay polite
    await new Promise((r) => setTimeout(r, 400));
  }

  return { rowsIn, rowsError };
}
