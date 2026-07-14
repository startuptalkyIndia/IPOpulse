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
 *   nse (official EOD) > bse > kite > fyers > yahoo > seed
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
const SRC_RANK = Prisma.raw(
  `CASE source WHEN 'nse' THEN 1 WHEN 'bse' THEN 2 WHEN 'kite' THEN 3 WHEN 'fyers' THEN 4 WHEN 'yahoo' THEN 5 ELSE 9 END`,
);

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
  { revalidate: PRICE_TTL, tags: ["bhavcopy"] },
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
  { revalidate: PRICE_TTL, tags: ["bhavcopy"] },
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
    WHERE date = ${date} ${idFilter}
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
  { revalidate: PRICE_TTL, tags: ["bhavcopy"] },
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

/**
 * Canonical time series per company from `fromDate` onward — ONE row per (company, date),
 * ascending by date. Use for technicals, sparklines, and 52-week ranges.
 */
export async function canonicalSeries(companyIds: number[], fromDate: Date): Promise<Map<number, CanonRow[]>> {
  const out = new Map<number, CanonRow[]>();
  if (!companyIds.length) return out;
  const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
    SELECT DISTINCT ON (company_id, date) company_id, date, close, open, high, low, volume, delivery_pct
    FROM bhavcopy_daily
    WHERE company_id IN (${Prisma.join(companyIds)}) AND date >= ${fromDate}
    ORDER BY company_id, date, ${SRC_RANK}
  `);
  for (const raw of rows) {
    const row = mapRow(raw);
    const arr = out.get(row.companyId) ?? [];
    arr.push(row);
    out.set(row.companyId, arr);
  }
  return out;
}

/** Canonical 52-week (or arbitrary window) high/low per company. */
export async function canonicalRange(
  companyIds: number[],
  fromDate: Date,
): Promise<Map<number, { min: number; max: number }>> {
  const out = new Map<number, { min: number; max: number }>();
  if (!companyIds.length) return out;
  const rows = await prisma.$queryRaw<Array<{ company_id: number | bigint; min_low: unknown; max_high: unknown }>>(
    Prisma.sql`
      SELECT company_id, MIN(low) AS min_low, MAX(high) AS max_high
      FROM (
        SELECT DISTINCT ON (company_id, date) company_id, date, low, high
        FROM bhavcopy_daily
        WHERE company_id IN (${Prisma.join(companyIds)}) AND date >= ${fromDate}
        ORDER BY company_id, date, ${SRC_RANK}
      ) canon
      GROUP BY company_id
    `,
  );
  for (const r of rows) out.set(Number(r.company_id), { min: toNum(r.min_low), max: toNum(r.max_high) });
  return out;
}

/** The single canonical row for one company on ITS OWN latest available day. */
export async function latestCanonicalRow(companyId: number): Promise<CanonRow | null> {
  const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
    SELECT DISTINCT ON (company_id) company_id, date, close, open, high, low, volume, delivery_pct
    FROM bhavcopy_daily
    WHERE company_id = ${companyId}
    ORDER BY company_id, date DESC, ${SRC_RANK}
  `);
  return rows.length ? mapRow(rows[0]) : null;
}
