/**
 * Screener Fundamentals — Nightly Yahoo Finance Sync
 * ────────────────────────────────────────────────────────────────
 * Two-pass approach for maximum data coverage:
 *
 * Pass 1 (fast batch, ~50 symbols/req):
 *   Yahoo v7 finance/quote — returns PE, PB, EPS, dividendYield, marketCap,
 *   bookValue, sharesOutstanding, returnOnEquity, debtToEquity for most stocks.
 *   Processes all 2,300+ active companies in ~40 seconds.
 *
 * Pass 2 (slow individual, yahoo-finance2 library, only for companies still
 *   missing ROE / sharesOutstanding after Pass 1):
 *   Uses quoteSummary (v10) which yahoo-finance2 authenticates automatically.
 *   Rate: 1 req/1.5s. Caps at PASS2_MAX_COMPANIES per run to avoid long runtime.
 *
 * After both passes, recalculates market_cap for ALL companies with
 *   sharesOutstanding using latest bhavcopy close:
 *   market_cap_crore = shares_outstanding × close / 10,000,000
 *
 * Runs: nightly at 10:30 PM IST (weekdays) via scheduler.ts
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
// Shared + canonical market-cap recalc (audit MEDIUM M3: this file used to carry
// a byte-identical copy that joined bhavcopy by date only → arbitrary source price).
import { recalcMarketCap } from "./yahoo-fundamentals";
export { recalcMarketCap };

const YF_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 500;
const PASS2_MAX_COMPANIES = 200; // limit slow pass to prevent timeout
const PASS2_DELAY_MS = 1500;

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
  sharesOutstanding?: number;
  returnOnEquity?: number;   // ratio, e.g. 0.18 = 18%
  debtToEquity?: number;     // ratio
}

// ─── Pass 1: Batch v7 quote API ─────────────────────────────────────────────

async function fetchBatchQuotes(symbols: string[]): Promise<YFQuote[]> {
  const fields = [
    "trailingPE", "priceToBook", "epsTrailingTwelveMonths",
    "trailingAnnualDividendYield", "dividendYield",
    "marketCap", "fiftyTwoWeekHigh", "fiftyTwoWeekLow",
    "bookValue", "sharesOutstanding",
    "returnOnEquity", "debtToEquity",
  ].join(",");

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}&fields=${fields}`;
  try {
    const res = await fetch(url, { headers: YF_HEADERS, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.quoteResponse?.result ?? []) as YFQuote[];
  } catch {
    return [];
  }
}

// ─── Pass 2: yahoo-finance2 quoteSummary for missing ROE / shares ──────────

async function fetchQuoteSummary(yahooSymbol: string): Promise<{
  sharesOutstanding?: number;
  roePercent?: number;
  debtToEquity?: number;
  operatingMargin?: number;
  netMargin?: number;
} | null> {
  try {
    // v3 API requires `new YahooFinance()` instantiation
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const YahooFinance = require("yahoo-finance2").default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yf: any = new YahooFinance();
    const result = await yf.quoteSummary(yahooSymbol, {
      modules: ["defaultKeyStatistics", "financialData"],
    });
    const ks = result?.defaultKeyStatistics ?? {};
    const fd = result?.financialData ?? {};
    return {
      sharesOutstanding: ks.sharesOutstanding ? Number(ks.sharesOutstanding) : undefined,
      roePercent: fd.returnOnEquity != null ? Number(fd.returnOnEquity) * 100 : undefined,
      debtToEquity: fd.debtToEquity != null ? Number(fd.debtToEquity) : undefined,
      operatingMargin: fd.operatingMargins != null ? Number(fd.operatingMargins) : undefined,
      netMargin: fd.profitMargins != null ? Number(fd.profitMargins) : undefined,
    };
  } catch {
    return null;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function ingestScreenerFundamentals(): Promise<IngestionResult> {
  const companies = await prisma.company.findMany({
    where: {
      active: true,
      OR: [{ nseSymbol: { not: null } }, { bseCode: { not: null } }],
    },
    select: { id: true, nseSymbol: true, bseCode: true, sharesOutstanding: true, roePercent: true },
    orderBy: { marketCap: "desc" },
    take: 2500,
  });

  let rowsIn = 0;
  let rowsError = 0;

  // Build symbol → company map
  const symbolMap = new Map<string, { id: number; hasShares: boolean; hasRoe: boolean }>();
  const symbolList: string[] = [];
  for (const co of companies) {
    const sym = co.nseSymbol ? `${co.nseSymbol}.NS` : co.bseCode ? `${co.bseCode}.BO` : null;
    if (!sym) continue;
    symbolMap.set(sym, {
      id: co.id,
      hasShares: co.sharesOutstanding != null,
      hasRoe: co.roePercent != null,
    });
    symbolList.push(sym);
  }

  // ── Pass 1: Batch v7 quotes ──────────────────────────────────────────────
  const pass2Needed: string[] = []; // symbols still missing sharesOutstanding after pass 1

  for (let i = 0; i < symbolList.length; i += BATCH_SIZE) {
    const batch = symbolList.slice(i, i + BATCH_SIZE);
    const quotes = await fetchBatchQuotes(batch);

    for (const q of quotes) {
      const info = symbolMap.get(q.symbol);
      if (!info) continue;

      const data: Record<string, unknown> = { fundamentalsAt: new Date() };
      if (q.trailingPE != null && isFinite(q.trailingPE)) data.peRatio = q.trailingPE;
      if (q.priceToBook != null && isFinite(q.priceToBook)) data.pbRatio = q.priceToBook;
      if (q.epsTrailingTwelveMonths != null) data.eps = q.epsTrailingTwelveMonths;
      if (q.bookValue != null) data.bookValue = q.bookValue;
      const dy = q.trailingAnnualDividendYield ?? q.dividendYield;
      if (dy != null && isFinite(dy)) data.dividendYield = dy * 100;
      // Market cap: absolute INR → Crore
      if (q.marketCap != null && q.marketCap > 0) data.marketCap = q.marketCap / 1e7;
      // Shares outstanding (raw integer)
      if (q.sharesOutstanding != null && q.sharesOutstanding > 0) {
        data.sharesOutstanding = BigInt(Math.round(q.sharesOutstanding));
        info.hasShares = true;
      }
      // ROE (ratio → %)
      if (q.returnOnEquity != null && isFinite(q.returnOnEquity)) {
        data.roePercent = q.returnOnEquity * 100;
        info.hasRoe = true;
      }
      if (q.debtToEquity != null && isFinite(q.debtToEquity)) {
        data.debtToEquity = q.debtToEquity;
      }

      if (Object.keys(data).length > 1) {
        await prisma.company.update({ where: { id: info.id }, data });
        rowsIn++;
      }

      // Queue for pass 2 if still missing shares outstanding (NSE stocks only)
      if (!info.hasShares && q.symbol.endsWith(".NS")) {
        pass2Needed.push(q.symbol);
      }
    }

    if (quotes.length === 0) rowsError++;
    await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
  }

  console.log(`[screener-fundamentals] Pass 1 done. Updated: ${rowsIn}, need pass 2: ${pass2Needed.length}`);

  // ── Pass 2: yahoo-finance2 quoteSummary for companies missing ROE/shares ─
  const pass2Symbols = pass2Needed.slice(0, PASS2_MAX_COMPANIES);

  for (const sym of pass2Symbols) {
    const info = symbolMap.get(sym);
    if (!info) continue;

    const result = await fetchQuoteSummary(sym);
    if (!result) { rowsError++; continue; }

    const data: Record<string, unknown> = { fundamentalsAt: new Date() };
    if (result.sharesOutstanding != null && result.sharesOutstanding > 0) {
      data.sharesOutstanding = BigInt(Math.round(result.sharesOutstanding));
    }
    if (result.roePercent != null) data.roePercent = Math.round(result.roePercent * 100) / 100;
    if (result.debtToEquity != null) data.debtToEquity = result.debtToEquity;
    if (result.operatingMargin != null) data.operatingMargin = result.operatingMargin;
    if (result.netMargin != null) data.netMargin = result.netMargin;

    if (Object.keys(data).length > 1) {
      await prisma.company.update({ where: { id: info.id }, data });
      rowsIn++;
    }

    await new Promise((r) => setTimeout(r, PASS2_DELAY_MS));
  }

  console.log(`[screener-fundamentals] Pass 2 done. Total updated: ${rowsIn}`);

  // ── Recalculate market_cap from shares × latest bhavcopy close ──────────
  await recalcMarketCap();

  return { rowsIn, rowsError };
}
