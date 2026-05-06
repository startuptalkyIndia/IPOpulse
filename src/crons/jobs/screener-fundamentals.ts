/**
 * Screener Fundamentals via Yahoo Finance
 * ----------------------------------------
 * Fetches P/E, P/B, ROE, D/E, EPS, book value, dividend yield, and market cap
 * for the top 1,000 active companies from Yahoo Finance's quoteSummary API.
 *
 * Free, no auth. Data is ~15-min delayed for prices, fundamentals are daily.
 * Runs nightly at 10:30 PM IST after markets close.
 *
 * Yahoo Finance symbol format:
 *   NSE: {SYMBOL}.NS    e.g. RELIANCE.NS
 *   BSE: {CODE}.BO      e.g. 500325.BO
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const YF_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

interface YFSummaryResponse {
  quoteSummary?: {
    result?: Array<{
      defaultKeyStatistics?: {
        trailingEps?: { raw?: number };
        bookValue?: { raw?: number };
        priceToBook?: { raw?: number };
        beta?: { raw?: number };
      };
      financialData?: {
        debtToEquity?: { raw?: number };
        returnOnEquity?: { raw?: number };
        currentPrice?: { raw?: number };
      };
      summaryDetail?: {
        trailingPE?: { raw?: number };
        forwardPE?: { raw?: number };
        dividendYield?: { raw?: number };
        marketCap?: { raw?: number };
      };
    }>;
    error?: unknown;
  };
}

interface Fundamentals {
  peRatio: number | null;
  pbRatio: number | null;
  roePercent: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;
  eps: number | null;
  bookValue: number | null;
  marketCapCr: number | null;
}

async function fetchFundamentals(symbol: string): Promise<Fundamentals | null> {
  const modules = "defaultKeyStatistics,financialData,summaryDetail";
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}&corsDomain=finance.yahoo.com`;

  try {
    const res = await fetch(url, {
      headers: YF_HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const data: YFSummaryResponse = await res.json();
    const result = data?.quoteSummary?.result?.[0];
    if (!result) return null;

    const ks = result.defaultKeyStatistics ?? {};
    const fd = result.financialData ?? {};
    const sd = result.summaryDetail ?? {};

    const marketCapRaw = sd.marketCap?.raw;
    // Yahoo returns market cap in absolute INR — convert to crore (÷1 crore)
    const marketCapCr = marketCapRaw ? marketCapRaw / 1e7 : null;

    // ROE from Yahoo is a decimal fraction (0.25 = 25%) — convert to %
    const roeRaw = fd.returnOnEquity?.raw;
    const roePercent = roeRaw != null ? roeRaw * 100 : null;

    // Dividend yield is also a fraction
    const dyRaw = sd.dividendYield?.raw;
    const dividendYield = dyRaw != null ? dyRaw * 100 : null;

    return {
      peRatio: sd.trailingPE?.raw ?? null,
      pbRatio: ks.priceToBook?.raw ?? null,
      roePercent,
      debtToEquity: fd.debtToEquity?.raw ?? null,
      dividendYield,
      eps: ks.trailingEps?.raw ?? null,
      bookValue: ks.bookValue?.raw ?? null,
      marketCapCr,
    };
  } catch {
    return null;
  }
}

export async function ingestScreenerFundamentals(): Promise<IngestionResult> {
  // Fetch top 1000 companies ordered by market cap (we'll skip those with no symbol)
  const companies = await prisma.company.findMany({
    where: {
      active: true,
      OR: [{ nseSymbol: { not: null } }, { bseCode: { not: null } }],
    },
    select: { id: true, nseSymbol: true, bseCode: true },
    orderBy: { marketCap: "desc" },
    take: 1000,
  });

  let rowsIn = 0;
  let errors = 0;

  for (const co of companies) {
    // Prefer NSE symbol; fall back to BSE code
    const symbol = co.nseSymbol
      ? `${co.nseSymbol}.NS`
      : co.bseCode
      ? `${co.bseCode}.BO`
      : null;
    if (!symbol) continue;

    const fund = await fetchFundamentals(symbol);
    if (!fund) {
      errors++;
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    // Only update fields that came back non-null to avoid clobbering good data
    const data: Record<string, unknown> = { fundamentalsAt: new Date() };
    if (fund.peRatio != null) data.peRatio = fund.peRatio;
    if (fund.pbRatio != null) data.pbRatio = fund.pbRatio;
    if (fund.roePercent != null) data.roePercent = fund.roePercent;
    if (fund.debtToEquity != null) data.debtToEquity = fund.debtToEquity;
    if (fund.dividendYield != null) data.dividendYield = fund.dividendYield;
    if (fund.eps != null) data.eps = fund.eps;
    if (fund.bookValue != null) data.bookValue = fund.bookValue;
    if (fund.marketCapCr != null) data.marketCap = fund.marketCapCr;

    await prisma.company.update({ where: { id: co.id }, data });
    rowsIn++;

    // 250ms between requests to stay polite
    await new Promise((r) => setTimeout(r, 250));
  }

  return {
    rowsIn,
    rowsError: errors,
    notes: errors > 0 ? `${errors} symbols had no Yahoo data` : undefined,
  };
}
