/**
 * Yahoo Fundamentals Deep Sync — Weekly (Sunday 2 AM IST)
 * ─────────────────────────────────────────────────────────────────
 * Uses yahoo-finance2 (handles crumb/cookie auth automatically) to fetch
 * sharesOutstanding, ROE, D/E, operating/net margins for all NSE companies.
 * Runs at ~1 req/1.2s → ~47 min for 2,300 companies.
 * Only processes companies where fundamentalsAt < 6 days ago.
 * Ends with market_cap recalculation from shares × latest bhavcopy price.
 *
 * Error handling (2026-08-19): a symbol Yahoo no longer serves — renamed,
 * demerged or delisted — fails forever. Because a failed fetch never stamps
 * `fundamentalsAt`, those symbols requeue every single day, and on a day when
 * the queue holds nothing else the run is 100% errors and the whole job is
 * recorded as FAILED. That is how a healthy job spent months looking broken and
 * masked real failures. Dead symbols are now counted separately from transient
 * ones: only transient errors fail the run, and the dead list is logged by name
 * because the actual cure is remapping the symbol (a data change a human must
 * approve), not retrying it.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { SRC_RANK } from "@/lib/price";

const DELAY_MS = 1200;
const STALE_HOURS = 144; // 6 days — skip if updated recently

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function round2(v: number | undefined | null): number | null {
  if (v == null || !isFinite(v)) return null;
  return Math.round(v * 100) / 100;
}

/**
 * Fit a value to a Postgres numeric(precision, scale) column: returns null when
 * it would overflow (a numeric-field-overflow rejects the WHOLE row update, so
 * one absurd ratio from a tiny-equity company used to lose every other field).
 * 2026-11-06: TIPSFILMS.NS hit numeric(8,2) with an absurd ROE/debt-to-equity.
 */
export function fitNumeric(
  v: number | null,
  precision: number,
  scale: number,
  label?: string,
): number | null {
  if (v == null || !isFinite(v)) return null;
  // Round to the column scale first: Postgres rounds on write, so 9999.99996 in
  // a (8,4) column becomes 10000.0000 and overflows even though it looked small.
  const f = Math.pow(10, scale);
  const rounded = Math.round(v * f) / f;
  const limit = Math.pow(10, precision - scale);
  if (Math.abs(rounded) < limit) return rounded;
  if (label) console.warn(`[yahoo-fundamentals] ${label}: value out of range for numeric(${precision},${scale}), field skipped`);
  return null;
}

/**
 * Does this error mean "Yahoo will never serve this symbol" rather than
 * "something went wrong just now"? Matched case-insensitively: Yahoo says
 * "Quote not found for symbol: X" — the old filter tested for "Not Found" and
 * so never actually matched.
 *
 * "Failed Yahoo Schema validation" counts as dead too: that is what a renamed
 * ticker returns (ZOMATO.NS after the Eternal rename), not a transient blip.
 */
export function isDeadSymbol(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("quote not found") ||
    m.includes("not found") ||
    m.includes("no fundamentals") ||
    m.includes("schema validation")
  );
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
    select: { id: true, nseSymbol: true, yahooSymbol: true },
    orderBy: { id: "asc" },
  });

  console.log(`[yahoo-fundamentals] Processing ${companies.length} companies`);
  let rowsIn = 0;
  let rowsError = 0;      // transient only — these are real problems
  const deadSymbols: string[] = []; // gone from Yahoo; needs a symbol remap

  // Import yahoo-finance2 at function scope so Next.js doesn't bundle it for client
  // v3 API requires `new YahooFinance()` instantiation
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const YahooFinance = require("yahoo-finance2").default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yf: any = new YahooFinance();

  for (let i = 0; i < companies.length; i++) {
    const co = companies[i];
    const sym = `${co.yahooSymbol ?? co.nseSymbol}.NS`;

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
      { const v = fitNumeric(marketCapCr, 20, 2, `${sym} marketCap`); if (marketCapCr && v !== null) data.marketCap = v; }
      if (sd.trailingPE != null) { const v = fitNumeric(round2(Number(sd.trailingPE)), 10, 2, `${sym} peRatio`); if (v !== null) data.peRatio = v; }
      if (ks.priceToBook != null) { const v = fitNumeric(round2(Number(ks.priceToBook)), 10, 2, `${sym} pbRatio`); if (v !== null) data.pbRatio = v; }
      { const v = fitNumeric(roePercent, 8, 2, `${sym} roePercent`); if (v !== null) data.roePercent = v; }
      { const v = fitNumeric(dividendYield, 6, 2, `${sym} dividendYield`); if (v !== null) data.dividendYield = v; }
      if (ks.trailingEps != null) { const v = fitNumeric(round2(Number(ks.trailingEps)), 12, 2, `${sym} eps`); if (v !== null) data.eps = v; }
      if (ks.bookValue != null) { const v = fitNumeric(round2(Number(ks.bookValue)), 12, 2, `${sym} bookValue`); if (v !== null) data.bookValue = v; }
      if (fd.debtToEquity != null) { const v = fitNumeric(round2(Number(fd.debtToEquity)), 8, 2, `${sym} debtToEquity`); if (v !== null) data.debtToEquity = v; }
      if (fd.operatingMargins != null) { const v = fitNumeric(Number(fd.operatingMargins), 8, 4, `${sym} operatingMargin`); if (v !== null) data.operatingMargin = v; }
      if (fd.profitMargins != null) { const v = fitNumeric(Number(fd.profitMargins), 8, 4, `${sym} netMargin`); if (v !== null) data.netMargin = v; }

      await prisma.company.update({ where: { id: co.id }, data });
      rowsIn++;

      if (rowsIn % 100 === 0) {
        console.log(`[yahoo-fundamentals] ${rowsIn}/${companies.length} done, ${rowsError} errors`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (isDeadSymbol(msg)) {
        deadSymbols.push(co.nseSymbol!);
      } else {
        console.warn(`[yahoo-fundamentals] ${sym}: ${msg.slice(0, 80)}`);
        rowsError++;
      }
    }

    await sleep(DELAY_MS);
  }

  if (deadSymbols.length) {
    // Named, not just counted: each one is a company whose fundamentals have
    // been frozen since the rename, and the fix is a human-approved remap.
    console.warn(
      `[yahoo-fundamentals] ${deadSymbols.length} symbol(s) Yahoo no longer serves — these need remapping, retrying will not help: ${deadSymbols.join(", ")}`,
    );
  }
  console.log(
    `[yahoo-fundamentals] Done. updated=${rowsIn} transientErrors=${rowsError} deadSymbols=${deadSymbols.length}`,
  );
  await recalcMarketCap();
  return {
    rowsIn,
    rowsError,
    notes: deadSymbols.length
      ? `${deadSymbols.length} symbol(s) not served by Yahoo (need remap): ${deadSymbols.join(", ")}`
      : undefined,
  };
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

  // Use ONE canonical price per company (best source) — a plain join to
  // bhavcopy_daily would match multiple source rows and pick one arbitrarily.
  const n = await prisma.$executeRaw`
    UPDATE companies c
    SET market_cap = ROUND((c.shares_outstanding::numeric * canon.close) / 10000000, 2),
        "updatedAt" = now()
    FROM (
      SELECT DISTINCT ON (company_id) company_id, close
      FROM bhavcopy_daily
      WHERE date = ${latestBhav.date}
      ORDER BY company_id, ${SRC_RANK}
    ) canon
    WHERE canon.company_id = c.id
      AND c.shares_outstanding IS NOT NULL
      AND c.shares_outstanding > 0
  `;

  console.log(`[recalcMarketCap] Updated market_cap for ${n} companies`);
  return { rowsIn: Number(n) };
}
