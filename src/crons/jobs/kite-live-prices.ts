/**
 * Real-time stock prices via Zerodha Kite Connect API.
 *
 * Kite Connect quote API:
 *   GET https://api.kite.trade/quote?i=NSE:HDFCBANK&i=NSE:RELIANCE&...
 *   Returns: last_price, ohlc, volume, net_change, depth, etc.
 *   Rate limit: 1 req/sec, max 500 instruments per call
 *
 * The access_token expires at midnight IST daily. Admin must paste a fresh
 * token each morning via /sup-min/kite-token.
 *
 * Falls back gracefully when no token is available (Yahoo v8 handles it).
 *
 * Schedule: every 5 minutes, 9:10 AM – 3:35 PM IST, Mon–Fri.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const KITE_API_KEY = process.env.KITE_API_KEY ?? "";

interface KiteQuote {
  last_price: number;
  volume: number;
  ohlc: { open: number; high: number; low: number; close: number };
  net_change: number;
}

async function getKiteToken(): Promise<string | null> {
  // Check DB first (admin-set via /sup-min/kite-token)
  try {
    const rows = await prisma.$queryRaw<Array<{ value: string; updated_at: Date }>>`
      SELECT value, updated_at FROM settings WHERE key = 'kite_access_token' LIMIT 1
    `;
    if (!rows.length) return process.env.KITE_ACCESS_TOKEN ?? null;

    const row = rows[0];
    const updatedAt = new Date(row.updated_at);
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    // Only use if updated today (tokens expire at midnight IST)
    if (updatedAt.toDateString() === nowIST.toDateString()) {
      return row.value;
    }
  } catch {
    // Settings table might not exist yet — fall back to env
  }
  return process.env.KITE_ACCESS_TOKEN ?? null;
}

function isMarketHours(): boolean {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay();
  if (day === 0 || day === 6) return false;
  const mins = ist.getHours() * 60 + ist.getMinutes();
  return mins >= 9 * 60 + 10 && mins <= 15 * 60 + 40;
}

async function fetchKiteQuotes(
  token: string,
  instruments: string[]
): Promise<Map<string, KiteQuote>> {
  const result = new Map<string, KiteQuote>();
  // Kite allows up to 500 instruments per request, batch in 400s to be safe
  const BATCH = 400;
  for (let i = 0; i < instruments.length; i += BATCH) {
    const batch = instruments.slice(i, i + BATCH);
    const params = batch.map((s) => `i=${encodeURIComponent(s)}`).join("&");
    const url = `https://api.kite.trade/quote?${params}`;
    try {
      const resp = await fetch(url, {
        headers: {
          "X-Kite-Version": "3",
          "Authorization": `token ${KITE_API_KEY}:${token}`,
        },
        signal: AbortSignal.timeout(10000),
      });
      if (resp.status === 403 || resp.status === 401) {
        console.warn("[kite-live] Token invalid or expired");
        return result; // Stop trying
      }
      if (!resp.ok) continue;
      const data = await resp.json() as { data?: Record<string, KiteQuote> };
      for (const [key, quote] of Object.entries(data.data ?? {})) {
        result.set(key, quote);
      }
      // Brief pause between batches
      if (i + BATCH < instruments.length) {
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch {
      continue;
    }
  }
  return result;
}

export async function ingestKiteLivePrices(): Promise<IngestionResult> {
  if (!isMarketHours()) {
    return { rowsIn: 0, notes: "Outside market hours — skipped." };
  }

  if (!KITE_API_KEY) {
    return { rowsIn: 0, notes: "KITE_API_KEY not configured." };
  }

  const token = await getKiteToken();
  if (!token) {
    return { rowsIn: 0, notes: "No Kite token available. Add via /sup-min/kite-token." };
  }

  // Get all active NSE companies
  const companies = await prisma.company.findMany({
    where: { active: true, nseSymbol: { not: null } },
    orderBy: { marketCap: "desc" },
    take: 1000,
    select: { id: true, nseSymbol: true },
  });

  if (companies.length === 0) return { rowsIn: 0, notes: "No companies." };

  const instruments = companies
    .filter((c) => c.nseSymbol)
    .map((c) => `NSE:${c.nseSymbol}`);

  const symbolToId = new Map(
    companies
      .filter((c) => c.nseSymbol)
      .map((c) => [`NSE:${c.nseSymbol}`, c.id])
  );

  const quotes = await fetchKiteQuotes(token, instruments);

  if (quotes.size === 0) {
    return { rowsIn: 0, notes: "Kite returned 0 quotes — token may be expired." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let upserted = 0;
  let errors = 0;

  for (const [instrument, quote] of quotes) {
    const companyId = symbolToId.get(instrument);
    if (!companyId || !quote.last_price) continue;
    try {
      await prisma.bhavcopyDaily.upsert({
        where: { companyId_date_source: { companyId, date: today, source: "kite" } },
        update: {
          close: quote.last_price,
          open: quote.ohlc.open,
          high: quote.ohlc.high,
          low: quote.ohlc.low,
          volume: BigInt(Math.round(quote.volume)),
        },
        create: {
          companyId,
          date: today,
          close: quote.last_price,
          open: quote.ohlc.open,
          high: quote.ohlc.high,
          low: quote.ohlc.low,
          volume: BigInt(Math.round(quote.volume)),
          source: "kite",
        },
      });
      upserted++;
    } catch {
      errors++;
    }
  }

  console.log(`[kite-live] Updated ${upserted} prices (${errors} errors) — ${quotes.size} quotes received`);
  return {
    rowsIn: upserted,
    rowsError: errors,
    notes: `Kite live: ${upserted} updated from ${quotes.size} real-time quotes`,
  };
}
