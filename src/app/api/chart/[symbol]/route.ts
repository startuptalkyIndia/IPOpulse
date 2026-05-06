import { NextResponse } from "next/server";

/**
 * Historical OHLC chart data via Yahoo Finance.
 *
 * Replaces Kite Connect historical API (was ₹500/mo) — Yahoo Finance is free,
 * no auth, same data, slightly delayed on intraday but perfect for daily charts.
 *
 * Usage:
 *   GET /api/chart/RELIANCE?range=1y&interval=1d
 *   GET /api/chart/HDFCBANK?range=6mo&interval=1d
 *   GET /api/chart/NIFTY50?range=3mo&interval=1wk
 *
 * Supports:
 *   interval: 1d | 1wk | 1mo
 *   range:    5d | 1mo | 3mo | 6mo | 1y | 2y | 5y | max
 *
 * Automatically tries NSE (.NS) first, falls back to BSE (.BO).
 * Caches at CDN for 15 minutes to reduce Yahoo API calls.
 */

interface YahooResult {
  meta: {
    symbol: string;
    currency: string;
    regularMarketPrice: number;
    previousClose: number;
    chartPreviousClose: number;
  };
  timestamp: number[];
  indicators: {
    quote: Array<{
      open: number[];
      high: number[];
      low: number[];
      close: number[];
      volume: number[];
    }>;
  };
}

interface ChartPoint {
  t: number;   // Unix timestamp (ms)
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

async function fetchYahoo(symbol: string, range: string, interval: string): Promise<YahooResult | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 900 }, // 15-min CDN cache
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { chart?: { result?: YahooResult[] } };
    return data.chart?.result?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const url = new URL(request.url);
  const range = url.searchParams.get("range") ?? "1y";
  const interval = url.searchParams.get("interval") ?? "1d";

  const clean = symbol.toUpperCase().replace(/\.(NS|BO)$/i, "");

  // Try NSE first, then BSE
  let result = await fetchYahoo(`${clean}.NS`, range, interval);
  if (!result?.timestamp?.length) {
    result = await fetchYahoo(`${clean}.BO`, range, interval);
  }

  if (!result?.timestamp?.length) {
    return NextResponse.json({ error: `No data found for ${clean}` }, { status: 404 });
  }

  const quotes = result.indicators.quote[0];
  const points: ChartPoint[] = result.timestamp
    .map((t, i) => ({
      t: t * 1000,
      o: quotes.open[i],
      h: quotes.high[i],
      l: quotes.low[i],
      c: quotes.close[i],
      v: quotes.volume[i],
    }))
    .filter((p) => p.c != null && !isNaN(p.c));

  const latest = points[points.length - 1];
  const first = points[0];
  const changePct = first?.c > 0 ? ((latest.c - first.c) / first.c) * 100 : 0;

  return NextResponse.json(
    {
      symbol: clean,
      currency: result.meta.currency ?? "INR",
      ltp: result.meta.regularMarketPrice ?? latest?.c,
      prevClose: result.meta.previousClose,
      changePct: Math.round(changePct * 100) / 100,
      range,
      interval,
      points,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
      },
    },
  );
}
