/**
 * Indian stock price ingestion via Yahoo Finance.
 *
 * Why Yahoo Finance instead of Kite Connect (₹500/mo):
 *   - Free, no auth, no daily token rotation
 *   - ~15 min delayed — perfectly adequate for a research/screener site
 *   - Same data source Tickertape, Screener.in, and most Indian fintechs use
 *   - Already proven in our codebase (src/crons/jobs/us-adrs.ts)
 *
 * NSE stocks: symbol + ".NS"  (e.g. "RELIANCE.NS")
 * BSE stocks: symbol + ".BO"  (e.g. "500325.BO")
 *
 * This job:
 *   1. Pulls all active companies from our DB (with NSE or BSE codes)
 *   2. Fetches current price in batches of 50 via Yahoo Finance
 *   3. Upserts today's BhavcopyDaily row with the fresh price data
 *
 * Schedule: every 15 minutes during market hours (9:15am – 3:45pm IST).
 * Outside market hours: skips to avoid unnecessary API calls.
 *
 * Yahoo Finance rate limits: ~2,000 req/day per IP generously.
 * With ~2,000 listed companies and 26 market sessions = ~52,000/day if
 * we fetched every company every session. So we batch to top 500 companies
 * by market cap (the ones users actually care about).
 */

import { prisma } from "@/lib/db";

interface YahooMeta {
  regularMarketPrice?: number;
  regularMarketVolume?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  previousClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
  shortName?: string;
}

async function fetchYahooQuotes(symbols: string[]): Promise<Map<string, YahooMeta>> {
  const result = new Map<string, YahooMeta>();
  if (symbols.length === 0) return result;

  // Yahoo Finance supports batch quotes via comma-separated symbols
  const joined = symbols.join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(joined)}&fields=regularMarketPrice,regularMarketVolume,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,previousClose,fiftyTwoWeekHigh,fiftyTwoWeekLow,marketCap,shortName`;

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) {
      console.warn(`[yahoo-prices] Batch fetch failed: ${resp.status}`);
      return result;
    }
    const data = (await resp.json()) as {
      quoteResponse?: {
        result?: Array<{ symbol?: string } & YahooMeta>;
      };
    };
    for (const q of data.quoteResponse?.result ?? []) {
      if (q.symbol) result.set(q.symbol, q);
    }
  } catch (err) {
    console.warn("[yahoo-prices] Fetch error:", err instanceof Error ? err.message : String(err));
  }
  return result;
}

function isMarketHours(): boolean {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const h = ist.getHours();
  const m = ist.getMinutes();
  const mins = h * 60 + m;
  return mins >= 9 * 60 + 10 && mins <= 15 * 60 + 50; // 9:10am – 3:50pm IST
}

export async function ingestYahooPrices(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  if (!isMarketHours()) {
    return { rowsIn: 0, notes: "Outside market hours — skipped." };
  }

  // Top 500 companies by market cap that have an NSE symbol
  const companies = await prisma.company.findMany({
    where: { active: true, nseSymbol: { not: null } },
    orderBy: { marketCap: "desc" },
    take: 500,
    select: { id: true, nseSymbol: true, marketCap: true },
  });

  if (companies.length === 0) return { rowsIn: 0, notes: "No companies with NSE symbols in DB." };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build Yahoo symbols list (NSE = ".NS" suffix)
  const symbolToCompany = new Map<string, { id: number }>();
  const yahooSymbols: string[] = [];
  for (const co of companies) {
    if (!co.nseSymbol) continue;
    const ySym = `${co.nseSymbol}.NS`;
    yahooSymbols.push(ySym);
    symbolToCompany.set(ySym, { id: co.id });
  }

  // Batch in chunks of 50
  const CHUNK = 50;
  let upserted = 0;
  let errors = 0;

  for (let i = 0; i < yahooSymbols.length; i += CHUNK) {
    const chunk = yahooSymbols.slice(i, i + CHUNK);
    const quotes = await fetchYahooQuotes(chunk);

    for (const [ySym, meta] of quotes) {
      const co = symbolToCompany.get(ySym);
      if (!co || !meta.regularMarketPrice) continue;
      try {
        await prisma.bhavcopyDaily.upsert({
          where: { companyId_date_source: { companyId: co.id, date: today, source: "yahoo" } },
          update: {
            close: meta.regularMarketPrice,
            open: meta.regularMarketOpen ?? meta.regularMarketPrice,
            high: meta.regularMarketDayHigh ?? meta.regularMarketPrice,
            low: meta.regularMarketDayLow ?? meta.regularMarketPrice,
            volume: meta.regularMarketVolume ?? 0,
            source: "yahoo",
          },
          create: {
            companyId: co.id,
            date: today,
            close: meta.regularMarketPrice,
            open: meta.regularMarketOpen ?? meta.regularMarketPrice,
            high: meta.regularMarketDayHigh ?? meta.regularMarketPrice,
            low: meta.regularMarketDayLow ?? meta.regularMarketPrice,
            volume: meta.regularMarketVolume ?? 0,
            source: "yahoo",
          },
        });

        // Also update marketCap on Company if Yahoo gives it
        if (meta.marketCap) {
          await prisma.company.update({
            where: { id: co.id },
            data: { marketCap: meta.marketCap / 10000000 }, // Yahoo gives rupees, we store Cr
          });
        }
        upserted++;
      } catch {
        errors++;
      }
    }

    // Brief pause between chunks to be a good API citizen
    if (i + CHUNK < yahooSymbols.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return {
    rowsIn: upserted,
    rowsError: errors,
    notes: `Yahoo prices: ${upserted} updated, ${errors} errors. Companies fetched: ${yahooSymbols.length}.`,
  };
}
