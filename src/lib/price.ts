/**
 * Canonical price layer — the SINGLE source of truth for stock prices.
 * ─────────────────────────────────────────────────────────────────
 * bhavcopy_daily stores up to one row per (company, date, SOURCE): the official
 * NSE EOD bhavcopy, BSE bhavcopy, and intraday broker/Yahoo snapshots all coexist.
 * Reading that table directly returns the SAME stock multiple times per day with
 * different prices, which corrupted movers, screener, best-stocks, technicals and
 * market-cap (audit CRIT-2). Every price read MUST go through these helpers so a
 * company has exactly ONE price per day, chosen by a fixed source precedence:
 *
 *   nse (official EOD) > bse > kite > fyers > yahoo
 *
 * `seed` rows are excluded from every query in this file, not merely
 * ranked last: they're one-time dev-bootstrap placeholder prices
 * (scripts/seed-bhavcopy.ts), not real EOD data. Ranking them last still let a
 * date with ONLY a seed row (no real source ingested for it) win via
 * DISTINCT ON, which silently fed fake highs into the 52-week range — found
 * 2026-09-26 via HDFC Bank showing a ₹1,838 "52-week high" (real: ~₹1,020)
 * traced to two 2026-04-24/25 seed rows. Confirmed no company relies solely
 * on seed rows for its price (every seeded company also has real data), so
 * excluding seed entirely is safe.
 *
 * Implemented with Postgres DISTINCT ON, which uses the existing
 * (company_id, date, source) unique index. The rank expression is a fixed
 * constant (no user input) so it is injection-safe.
 */

import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

// Data-layer cache TTL. Pages stay force-dynamic (no build-time prerender), but the
// hot price QUERIES are cached across requests so repeated hits don't re-scan the DB.
// 120s is fresher than the underlying data cadence (intraday cron = 15 min, EOD daily).
const PRICE_TTL = 120;

export const SOURCE_PRECEDENCE = ["nse", "bse", "kite", "fyers", "yahoo", "seed"] as const;

// Lower = preferred. Constant SQL — never interpolates user input.
// The ONE source-precedence definition. Exported so raw-SQL consumers order by the
// same rank instead of hand-copying the CASE (re-audit: it had drifted into 3 copies).
export const SRC_RANK = Prisma.raw(
  `CASE source WHEN 'nse' THEN 1 WHEN 'bse' THEN 2 WHEN 'kite' THEN 3 WHEN 'fyers' THEN 4 WHEN 'yahoo' THEN 5 ELSE 9 END`,
);

/** JS equivalent of SRC_RANK for callers picking a best row in application code. */
export function sourceRank(source: string): number {
  return (({ nse: 1, bse: 2, kite: 3, fyers: 4, yahoo: 5 }) as Record<string, number>)[source] ?? 9;
}

export interface CanonRow {
  companyId: number;
  date: Date;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: bigint;
  deliveryPct: number | null;
}

function toNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "object" && v !== null && "toNumber" in v) return (v as { toNumber(): number }).toNumber();
  return Number(v);
}
function toNumOrNull(v: unknown): number | null {
  if (v == null) return null;
  return toNum(v);
}

interface RawRow {
  company_id: number | bigint;
  date: Date;
  close: unknown;
  open: unknown;
  high: unknown;
  low: unknown;
  volume: bigint | string | null;
  delivery_pct: unknown;
}

function mapRow(r: RawRow): CanonRow {
  return {
    companyId: Number(r.company_id),
    date: r.date,
    close: toNum(r.close),
    open: toNum(r.open),
    high: toNum(r.high),
    low: toNum(r.low),
    volume: r.volume == null ? 0n : BigInt(r.volume),
    deliveryPct: toNumOrNull(r.delivery_pct),
  };
}

/** Latest trading day present in bhavcopy_daily (any source). Cached (tiny, frequent). */
const cachedLatestDate = unstable_cache(
  async () => {
    const r = await prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
    return r?.date ? r.date.toISOString() : null;
  },
  ["latest-trading-date"],
  { revalidate: PRICE_TTL },
);
export async function latestTradingDate(): Promise<Date | null> {
  const iso = await cachedLatestDate();
  return iso ? new Date(iso) : null;
}

/** Most recent trading day strictly before `before`. Cached by the `before` date. */
const cachedPrevDate = unstable_cache(
  async (beforeISO: string) => {
    const r = await prisma.bhavcopyDaily.findFirst({
      where: { date: { lt: new Date(beforeISO) } },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    return r?.date ? r.date.toISOString() : null;
  },
  ["prev-trading-date"],
  { revalidate: PRICE_TTL },
);
export async function prevTradingDate(before: Date): Promise<Date | null> {
  const iso = await cachedPrevDate(before.toISOString().slice(0, 10));
  return iso ? new Date(iso) : null;
}

// Serializable flat form (no Date/bigint/Map) so unstable_cache can store it.
interface FlatRow {
  companyId: number;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  deliveryPct: number | null;
}

async function queryRowsForDate(dateISO: string, idsCsv: string): Promise<FlatRow[]> {
  const date = new Date(dateISO);
  const ids = idsCsv ? idsCsv.split(",").map(Number) : undefined;
  const idFilter = ids && ids.length ? Prisma.sql`AND company_id IN (${Prisma.join(ids)})` : Prisma.empty;
  const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
    SELECT DISTINCT ON (company_id) company_id, close, open, high, low, volume, delivery_pct
    FROM bhavcopy_daily
    WHERE date = ${date} AND source != 'seed' ${idFilter}
    ORDER BY company_id, ${SRC_RANK}
  `);
  return rows.map((r) => ({
    companyId: Number(r.company_id),
    close: toNum(r.close),
    open: toNum(r.open),
    high: toNum(r.high),
    low: toNum(r.low),
    volume: r.volume == null ? "0" : String(r.volume),
    deliveryPct: toNumOrNull(r.delivery_pct),
  }));
}

// Cache the FULL-DAY (no company filter) scan — the hot, expensive path shared by
// movers/breadth/52-week/homepage/ticker-list. Stable key = the date. Id-scoped
// calls stay uncached (variable keys, and each is a smaller, targeted query).
const cachedRowsForDate = unstable_cache(
  (dateISO: string) => queryRowsForDate(dateISO, ""),
  ["canon-rows-for-date"],
  { revalidate: PRICE_TTL },
);

/** One canonical row per company for a given date (best source wins). */
export async function canonicalRowsForDate(date: Date, companyIds?: number[]): Promise<CanonRow[]> {
  if (companyIds && companyIds.length === 0) return [];
  const dateISO = date.toISOString().slice(0, 10);
  const flat =
    companyIds && companyIds.length
      ? await queryRowsForDate(dateISO, [...companyIds].sort((a, b) => a - b).join(","))
      : await cachedRowsForDate(dateISO);
  return flat.map((f) => ({
    companyId: f.companyId,
    date,
    close: f.close,
    open: f.open,
    high: f.high,
    low: f.low,
    volume: BigInt(f.volume),
    deliveryPct: f.deliveryPct,
  }));
}

/** company_id → canonical close for a given date. */
export async function canonicalCloseMap(date: Date, companyIds?: number[]): Promise<Map<number, number>> {
  const rows = await canonicalRowsForDate(date, companyIds);
  return new Map(rows.map((r) => [r.companyId, r.close]));
}

// ─── Corporate-action price adjustment ──────────────────────────────────────
// Found live 2026-10-03: bhavcopy_daily stores raw UNADJUSTED prices, so any
// calculation comparing prices ACROSS dates (returns, technicals, 52-week
// range) silently corrupts for a company with a bonus/split inside the
// window — e.g. IRB Infrastructure's "1Y Return" stat tile showed -59.9%
// against the Yahoo-sourced chart's correct -19.16% on the same page,
// because of an untracked 30-Mar-2026 1:1 bonus. A single-date read (today's
// LTP, yesterday's close for a 1D% calc) is NOT adjusted here — that's a
// real point-in-time price, and a naive "-50% today" on the literal ex-date
// is standard behavior even on Yahoo/Google Finance, not a bug.
//
// adjustmentFactor on a corporate_actions row (bonus/split only — see
// nse-corporate-actions.ts) means: multiply a price from BEFORE that exDate
// by this factor to make it comparable to a price from ON/AFTER that exDate.
// So a row dated `d` needs multiplying by the PRODUCT of every factor whose
// exDate is strictly after `d` (each such event sits between `d` and today).

export interface BonusSplitAction {
  exDate: Date;
  factor: number;
}

async function getBonusSplitActions(companyIds: number[]): Promise<Map<number, BonusSplitAction[]>> {
  const out = new Map<number, BonusSplitAction[]>();
  if (!companyIds.length) return out;
  const rows = await prisma.corporateAction.findMany({
    where: { companyId: { in: companyIds }, actionType: { in: ["bonus", "split"] }, adjustmentFactor: { not: null } },
    select: { companyId: true, exDate: true, adjustmentFactor: true },
    orderBy: { exDate: "asc" },
  });
  for (const r of rows) {
    if (!r.exDate || r.adjustmentFactor == null) continue;
    const arr = out.get(r.companyId) ?? [];
    arr.push({ exDate: r.exDate, factor: toNum(r.adjustmentFactor) });
    out.set(r.companyId, arr);
  }
  return out;
}

/** Product of every action's factor whose exDate is strictly after `asOf`. */
export function cumulativeFactorAfter(actions: BonusSplitAction[], asOf: Date): number {
  let factor = 1;
  for (const a of actions) {
    if (a.exDate.getTime() > asOf.getTime()) factor *= a.factor;
  }
  return factor;
}

function adjustRow(row: CanonRow, actions: BonusSplitAction[] | undefined): CanonRow {
  if (!actions || actions.length === 0) return row;
  const factor = cumulativeFactorAfter(actions, row.date);
  if (factor === 1) return row;
  return { ...row, close: row.close * factor, open: row.open * factor, high: row.high * factor, low: row.low * factor };
}

/**
 * Canonical time series per company from `fromDate` onward — ONE row per (company, date),
 * ascending by date. Use for technicals, sparklines, and 52-week ranges.
 * Adjusted for any bonus/split inside the range so cross-date comparisons
 * (returns, moving averages, RSI) aren't corrupted by a raw share-count jump.
 */
export async function canonicalSeries(companyIds: number[], fromDate: Date): Promise<Map<number, CanonRow[]>> {
  const out = new Map<number, CanonRow[]>();
  if (!companyIds.length) return out;
  const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
    SELECT DISTINCT ON (company_id, date) company_id, date, close, open, high, low, volume, delivery_pct
    FROM bhavcopy_daily
    WHERE company_id IN (${Prisma.join(companyIds)}) AND date >= ${fromDate} AND source != 'seed'
    ORDER BY company_id, date, ${SRC_RANK}
  `);
  const actionsByCompany = await getBonusSplitActions(companyIds);
  for (const raw of rows) {
    const mapped = mapRow(raw);
    const row = adjustRow(mapped, actionsByCompany.get(mapped.companyId));
    const arr = out.get(row.companyId) ?? [];
    arr.push(row);
    out.set(row.companyId, arr);
  }
  return out;
}

/**
 * Canonical 52-week (or arbitrary window) high/low per company.
 * The cached bulk query below reads RAW prices (fast, but wrong for a company
 * with a bonus/split inside the window) — corrected afterward ONLY for
 * companies that actually have one in range, so the hot path for the other
 * ~2,600 companies stays exactly as fast as before this fix.
 */
export async function canonicalRange(
  companyIds: number[],
  fromDate: Date,
): Promise<Map<number, { min: number; max: number }>> {
  const out = new Map<number, { min: number; max: number }>();
  if (!companyIds.length) return out;
  const fromISO = fromDate.toISOString().slice(0, 10);
  const idsCsv = [...companyIds].sort((a, b) => a - b).join(",");
  const rows = await cachedRange(fromISO, idsCsv);
  for (const r of rows) out.set(r.companyId, { min: r.min, max: r.max });

  const affected = await prisma.corporateAction.findMany({
    where: {
      companyId: { in: companyIds },
      actionType: { in: ["bonus", "split"] },
      adjustmentFactor: { not: null },
      exDate: { gte: fromDate },
    },
    select: { companyId: true },
    distinct: ["companyId"],
  });
  if (affected.length > 0) {
    const adjustedSeries = await canonicalSeries(affected.map((a) => a.companyId), fromDate);
    for (const [companyId, series] of adjustedSeries) {
      if (series.length === 0) continue;
      const min = Math.min(...series.map((r) => r.low));
      const max = Math.max(...series.map((r) => r.high));
      out.set(companyId, { min, max });
    }
  }
  return out;
}

interface RangeRow {
  companyId: number;
  min: number;
  max: number;
}

async function queryRange(fromDateISO: string, idsCsv: string): Promise<RangeRow[]> {
  const fromDate = new Date(fromDateISO);
  const companyIds = idsCsv.split(",").map(Number);
  const rows = await prisma.$queryRaw<Array<{ company_id: number | bigint; min_low: unknown; max_high: unknown }>>(
    Prisma.sql`
      SELECT company_id, MIN(low) AS min_low, MAX(high) AS max_high
      FROM (
        SELECT DISTINCT ON (company_id, date) company_id, date, low, high
        FROM bhavcopy_daily
        WHERE company_id IN (${Prisma.join(companyIds)}) AND date >= ${fromDate} AND source != 'seed'
        ORDER BY company_id, date, ${SRC_RANK}
      ) canon
      GROUP BY company_id
    `,
  );
  return rows.map((r) => ({ companyId: Number(r.company_id), min: toNum(r.min_low), max: toNum(r.max_high) }));
}

// Cache the expensive 52-week-range disk-sort query. Screener/best-stocks always call this
// with the FULL active-company id list and a daily-granularity cutoff, so the (fromISO, idsCsv)
// key is stable across requests within PRICE_TTL — confirmed via EXPLAIN ANALYZE 2026-09-26:
// this query alone took 1.26s uncached (external merge disk sort over ~560K rows) and ran on
// EVERY screener page load since it had no cache, unlike its sibling canonicalRowsForDate.
const cachedRange = unstable_cache(
  (fromDateISO: string, idsCsv: string) => queryRange(fromDateISO, idsCsv),
  ["canon-range"],
  { revalidate: PRICE_TTL },
);

/** The single canonical row for one company on ITS OWN latest available day. */
/**
 * Canonical close for a company on the FIRST trading day on/after `target`
 * (best source wins). Used for post-listing interval returns (1M/3M/6M/1Y) —
 * a cross-time comparison, so adjusted for any bonus/split since that date.
 */
export async function canonicalCloseOnOrAfter(companyId: number, target: Date): Promise<number | null> {
  const rows = await prisma.$queryRaw<Array<{ date: Date; close: unknown }>>(Prisma.sql`
    SELECT DISTINCT ON (company_id) date, close
    FROM bhavcopy_daily
    WHERE company_id = ${companyId} AND date >= ${target} AND source != 'seed'
    ORDER BY company_id, date ASC, ${SRC_RANK}
  `);
  if (!rows.length) return null;
  const actions = (await getBonusSplitActions([companyId])).get(companyId);
  const factor = actions ? cumulativeFactorAfter(actions, rows[0].date) : 1;
  return toNum(rows[0].close) * factor;
}

export async function latestCanonicalRow(companyId: number): Promise<CanonRow | null> {
  const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
    SELECT DISTINCT ON (company_id) company_id, date, close, open, high, low, volume, delivery_pct
    FROM bhavcopy_daily
    WHERE company_id = ${companyId} AND source != 'seed'
    ORDER BY company_id, date DESC, ${SRC_RANK}
  `);
  return rows.length ? mapRow(rows[0]) : null;
}
