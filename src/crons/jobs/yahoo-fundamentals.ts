/**
 * Yahoo Fundamentals Deep Sync — Weekly (Sunday 2 AM IST)
 * ─────────────────────────────────────────────────────────────────
 * Uses yahoo-finance2 (handles crumb/cookie auth automatically) to fetch
 * sharesOutstanding, ROE, D/E, operating/net margins for all NSE companies.
 * Runs at ~1 req/1.2s → ~47 min for 2,300 companies.
 * Only processes companies where fundamentalsAt < 6 days ago.
 * Ends with market_cap recalculation from shares × latest bhavcopy price.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const DELAY_MS = 1200;
const STALE_HOURS = 144; // 6 days — skip if updated recently

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function round2(v: number | undefined | null): number | null {
  if (v == null || !isFinite(v)) return null;
  return Math.round(v * 100) / 100;
}

export async function runYahooFundamentals(): Promise<IngestionResult> {
  const staleThreshold = new Date(Date.now() - STALE_HOURS * 3600 * 1000);

  const companies = await prisma.company.findMany({
    where: {
      nseSymbol: { not: null },
      active: true,
      isSme: false,
      OR: [{ fundamentalsAt: null }, { fundamentalsAt: { lt: staleThreshold } }],
    },
    select: { id: true, nseSymbol: true },
    orderBy: { id: "asc" },
  });

  console.log(`[yahoo-fundamentals] Processing ${companies.length} companies`);
  let rowsIn = 0;
  let rowsError = 0;

  // Import yahoo-finance2 at function scope so Next.js doesn't bundle it for client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const yf = require("yahoo-finance2").default as typeof import("yahoo-finance2").default;

  for (let i = 0; i < companies.length; i++) {
    const co = companies[i];
    const sym = `${co.nseSymbol}.NS`;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await yf.quoteSummary(sym, {
        modules: ["defaultKeyStatistics", "financialData", "summaryDetail"],
      });

      const ks = result?.defaultKeyStatistics ?? {};
      const fd = result?.financialData ?? {};
      const sd = result?.summaryDetail ?? {};

      const sharesOutstanding = ks.sharesOutstanding
        ? BigInt(Math.round(Number(ks.sharesOutstanding)))
        : null;
      const marketCapCr = sd.marketCap ? round2(Number(sd.marketCap) / 1e7) : null;
      const roePercent = fd.returnOnEquity != null ? round2(Number(fd.returnOnEquity) * 100) : null;
      const dividendYield = sd.dividendYield != null ? round2(Number(sd.dividendYield) * 100) : null;

      const data: Record<string, unknown> = { fundamentalsAt: new Date() };
      if (sharesOutstanding) data.sharesOutstanding = sharesOutstanding;
      if (marketCapCr) data.marketCap = marketCapCr;
      if (sd.trailingPE != null) data.peRatio = round2(Number(sd.trailingPE));
      if (ks.priceToBook != null) data.pbRatio = round2(Number(ks.priceToBook));
      if (roePercent !== null) data.roePercent = roePercent;
      if (dividendYield !== null) data.dividendYield = dividendYield;
      if (ks.trailingEps != null) data.eps = round2(Number(ks.trailingEps));
      if (ks.bookValue != null) data.bookValue = round2(Number(ks.bookValue));
      if (fd.debtToEquity != null) data.debtToEquity = round2(Number(fd.debtToEquity));
      if (fd.operatingMargins != null) data.operatingMargin = Number(fd.operatingMargins);
      if (fd.profitMargins != null) data.netMargin = Number(fd.profitMargins);

      await prisma.company.update({ where: { id: co.id }, data });
      rowsIn++;

      if (rowsIn % 100 === 0) {
        console.log(`[yahoo-fundamentals] ${rowsIn}/${companies.length} done, ${rowsError} errors`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("Not Found") && !msg.includes("No fundamentals")) {
        console.warn(`[yahoo-fundamentals] ${sym}: ${msg.slice(0, 80)}`);
      }
      rowsError++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`[yahoo-fundamentals] Done. updated=${rowsIn} failed=${rowsError}`);
  await recalcMarketCap();
  return { rowsIn, rowsError };
}

/**
 * Recalculate market_cap for all companies with sharesOutstanding
 * using latest bhavcopy close: market_cap_crore = shares × close / 10,000,000
 * Exported so the bhavcopy cron can call it after every daily download.
 */
export async function recalcMarketCap(): Promise<IngestionResult> {
  const latestBhav = await prisma.bhavcopyDaily.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });
  if (!latestBhav) return { rowsIn: 0 };

  const n = await prisma.$executeRaw`
    UPDATE companies c
    SET market_cap = ROUND((c.shares_outstanding::numeric * b.close) / 10000000, 2),
        updated_at = now()
    FROM bhavcopy_daily b
    WHERE b.company_id = c.id
      AND b.date = ${latestBhav.date}
      AND c.shares_outstanding IS NOT NULL
      AND c.shares_outstanding > 0
  `;

  console.log(`[recalcMarketCap] Updated market_cap for ${n} companies`);
  return { rowsIn: Number(n) };
}
