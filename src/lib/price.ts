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
import { prisma } from "@/lib/db";

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

/** Latest trading day present in bhavcopy_daily (any source). */
export async function latestTradingDate(): Promise<Date | null> {
  const r = await prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
  return r?.date ?? null;
}

/** Most recent trading day strictly before `before`. */
export async function prevTradingDate(before: Date): Promise<Date | null> {
  const r = await prisma.bhavcopyDaily.findFirst({
    where: { date: { lt: before } },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  return r?.date ?? null;
}

/** One canonical row per company for a given date (best source wins). */
export async function canonicalRowsForDate(date: Date, companyIds?: number[]): Promise<CanonRow[]> {
  if (companyIds && companyIds.length === 0) return [];
  const idFilter =
    companyIds && companyIds.length ? Prisma.sql`AND company_id IN (${Prisma.join(companyIds)})` : Prisma.empty;
  const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
    SELECT DISTINCT ON (company_id) company_id, date, close, open, high, low, volume, delivery_pct
    FROM bhavcopy_daily
    WHERE date = ${date} ${idFilter}
    ORDER BY company_id, ${SRC_RANK}
  `);
  return rows.map(mapRow);
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
