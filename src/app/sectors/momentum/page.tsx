export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Snowflake } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Sector Momentum Scorecard — fastest-rising Indian sectors",
  description:
    "Sector-by-sector momentum across 1W / 1M / 3M / 6M windows. Equal-weighted average return per sector based on BSE EOD bhavcopy. Identify hot and cold sectors at a glance.",
  alternates: { canonical: "/sectors/momentum" },
};

interface SectorRow {
  sector: string;
  count: number;
  return1w: number | null;
  return1m: number | null;
  return3m: number | null;
  return6m: number | null;
  composite: number;
}

async function avgReturnByDate(targetDate: Date) {
  const rows = await prisma.bhavcopyDaily.findMany({
    where: { date: targetDate },
    select: {
      close: true,
      open: true,
      companyId: true,
      company: { select: { sector: true } },
    },
  });
  return rows;
}

async function findClosestBhavDate(target: Date): Promise<Date | null> {
  const r = await prisma.bhavcopyDaily.findFirst({
    where: { date: { lte: target } },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  return r?.date ?? null;
}

export default async function SectorMomentumPage() {
  // Latest trading day
  const latest = await prisma.bhavcopyDaily.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (!latest) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sector Momentum Scorecard</h1>
        <div className="card text-center py-10 text-sm text-gray-500">
          No bhavcopy data yet. As ingestion catches up, sector momentum populates here.
        </div>
      </div>
    );
  }

  const todayMs = latest.date.getTime();
  const week = await findClosestBhavDate(new Date(todayMs - 7 * 86400000));
  const month = await findClosestBhavDate(new Date(todayMs - 30 * 86400000));
  const quarter = await findClosestBhavDate(new Date(todayMs - 90 * 86400000));
  const half = await findClosestBhavDate(new Date(todayMs - 180 * 86400000));

  const [todayRows, weekRows, monthRows, quarterRows, halfRows] = await Promise.all([
    avgReturnByDate(latest.date),
    week ? avgReturnByDate(week) : Promise.resolve([]),
    month ? avgReturnByDate(month) : Promise.resolve([]),
    quarter ? avgReturnByDate(quarter) : Promise.resolve([]),
    half ? avgReturnByDate(half) : Promise.resolve([]),
  ]);

  // Build sector-> average return
  function avgBySector(rows: typeof todayRows, baselineRows: typeof todayRows): Map<string, number> {
    if (rows.length === 0 || baselineRows.length === 0) return new Map();
    // Map company-sector pairs by joining on close column — bhavcopy doesn't
    // have companyId attribute on the select above; so we use sector grouping
    // directly. We compute avg pct change per sector for both dates, then
    // diff. Less precise than per-stock pairing but works at scale.
    // Approximate intraday change using open→close on the latest day. Not the
    // same as day-over-day (which we compute via periodReturnBySector below
    // for proper period returns), but a useful "today's session" view.
    const sectorAvg = (set: typeof todayRows) => {
      const byS = new Map<string, { sum: number; n: number }>();
      for (const r of set) {
        if (!r.company?.sector) continue;
        const close = Number(r.close);
        const open = Number(r.open);
        if (!open) continue;
        const pct = ((close - open) / open) * 100;
        if (!Number.isFinite(pct)) continue;
        const cur = byS.get(r.company.sector) ?? { sum: 0, n: 0 };
        cur.sum += pct;
        cur.n += 1;
        byS.set(r.company.sector, cur);
      }
      const out = new Map<string, number>();
      for (const [s, { sum, n }] of byS) if (n > 0) out.set(s, sum / n);
      return out;
    };
    // For periods: use cumulative change between today's close and baseline close
    // (we approximate by averaging today's % delta and the baseline's % delta is
    // not the right model; instead we compute period return per stock and avg).
    // We'll need a more direct approach: skip baselineRows here, and compute
    // period return outside this fn. For simplicity, this fn stays for 1d only.
    return sectorAvg(rows);
  }

  // 1-day return (average across sector) using today's prevClose snapshot
  const oneDay = avgBySector(todayRows, todayRows);

  // For longer periods, fetch close on baseline date + today's close per company
  const latestDate = latest.date; // capture for closure (latest is non-null past the early return)
  async function periodReturnBySector(baselineDate: Date | null): Promise<Map<string, number>> {
    if (!baselineDate) return new Map();
    const both = await prisma.bhavcopyDaily.findMany({
      where: { date: { in: [baselineDate, latestDate] } },
      select: { date: true, close: true, companyId: true, company: { select: { sector: true } } },
    });
    const byCompany = new Map<number, { base?: number; latest?: number; sector?: string }>();
    for (const r of both) {
      const cur = byCompany.get(r.companyId) ?? {};
      if (r.date.getTime() === baselineDate.getTime()) cur.base = Number(r.close);
      else cur.latest = Number(r.close);
      cur.sector = r.company?.sector ?? cur.sector;
      byCompany.set(r.companyId, cur);
    }
    const sectorBuckets = new Map<string, { sum: number; n: number }>();
    for (const v of byCompany.values()) {
      if (!v.base || !v.latest || !v.sector) continue;
      const pct = ((v.latest - v.base) / v.base) * 100;
      if (!Number.isFinite(pct)) continue;
      const cur = sectorBuckets.get(v.sector) ?? { sum: 0, n: 0 };
      cur.sum += pct;
      cur.n += 1;
      sectorBuckets.set(v.sector, cur);
    }
    const out = new Map<string, number>();
    for (const [s, { sum, n }] of sectorBuckets) if (n > 0) out.set(s, sum / n);
    return out;
  }

  const [w, m, q, h] = await Promise.all([
    periodReturnBySector(week),
    periodReturnBySector(month),
    periodReturnBySector(quarter),
    periodReturnBySector(half),
  ]);

  // Build rows
  const sectors = new Set<string>();
  for (const map of [oneDay, w, m, q, h]) for (const k of map.keys()) sectors.add(k);

  // Count companies per sector for context (use today's snapshot)
  const sectorCount = new Map<string, number>();
  for (const r of todayRows) {
    if (!r.company?.sector) continue;
    sectorCount.set(r.company.sector, (sectorCount.get(r.company.sector) ?? 0) + 1);
  }

  const rows: SectorRow[] = Array.from(sectors).map((s) => {
    const r1w = w.get(s) ?? null;
    const r1m = m.get(s) ?? null;
    const r3m = q.get(s) ?? null;
    const r6m = h.get(s) ?? null;
    // Composite weights recent windows higher
    const composite = (r1w ?? 0) * 3 + (r1m ?? 0) * 2 + (r3m ?? 0) * 1 + (r6m ?? 0) * 0.5;
    return { sector: s, count: sectorCount.get(s) ?? 0, return1w: r1w, return1m: r1m, return3m: r3m, return6m: r6m, composite };
  });

  // Filter sectors with too few stocks for stability
  const filtered = rows.filter((r) => r.count >= 3);
  filtered.sort((a, b) => b.composite - a.composite);
  const hottest = filtered.slice(0, 5);
  const coldest = filtered.slice(-5).reverse();

  function fmt(v: number | null): string {
    if (v == null || !Number.isFinite(v)) return "—";
    return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
  }
  function color(v: number | null): string {
    if (v == null) return "text-gray-400";
    return v >= 0 ? "text-green-600" : "text-red-600";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Sector Momentum Scorecard</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Equal-weighted average return per sector across 1W / 1M / 3M / 6M windows. Composite score weights recent
          performance higher — hot sectors at the top, cold at the bottom. As of {latest.date.toLocaleDateString("en-IN")}.
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-500">
            Sector momentum needs at least one prior bhavcopy snapshot. As ingestion catches up, this page fills.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> Hottest sectors</h3>
              <div className="divide-y divide-gray-100">
                {hottest.map((r) => (
                  <div key={r.sector} className="flex items-center justify-between py-2">
                    <div>
                      <Link href={`/sectors/${encodeURIComponent(r.sector.toLowerCase().replace(/\s+/g, "-"))}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">{r.sector}</Link>
                      <div className="text-[11px] text-gray-500">{r.count} companies</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold tabular-nums ${color(r.return1m)}`}>{fmt(r.return1m)} <span className="text-[11px] font-normal text-gray-500">1M</span></div>
                      <div className="text-[11px] text-gray-500 tabular-nums">3M {fmt(r.return3m)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1"><Snowflake className="w-4 h-4 text-blue-500" /> Coldest sectors</h3>
              <div className="divide-y divide-gray-100">
                {coldest.map((r) => (
                  <div key={r.sector} className="flex items-center justify-between py-2">
                    <div>
                      <Link href={`/sectors/${encodeURIComponent(r.sector.toLowerCase().replace(/\s+/g, "-"))}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">{r.sector}</Link>
                      <div className="text-[11px] text-gray-500">{r.count} companies</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold tabular-nums ${color(r.return1m)}`}>{fmt(r.return1m)} <span className="text-[11px] font-normal text-gray-500">1M</span></div>
                      <div className="text-[11px] text-gray-500 tabular-nums">3M {fmt(r.return3m)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="px-3 py-3">Sector</th>
                    <th className="px-3 py-3 text-right">Companies</th>
                    <th className="px-3 py-3 text-right">1W</th>
                    <th className="px-3 py-3 text-right">1M</th>
                    <th className="px-3 py-3 text-right">3M</th>
                    <th className="px-3 py-3 text-right">6M</th>
                    <th className="px-3 py-3 text-right">Composite</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.sector} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-sm">
                        <Link href={`/sectors/${encodeURIComponent(r.sector.toLowerCase().replace(/\s+/g, "-"))}`} className="font-medium text-gray-900 hover:text-indigo-600">{r.sector}</Link>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-600">{r.count}</td>
                      <td className={`px-3 py-2.5 text-xs text-right tabular-nums font-semibold ${color(r.return1w)}`}>{fmt(r.return1w)}</td>
                      <td className={`px-3 py-2.5 text-xs text-right tabular-nums font-semibold ${color(r.return1m)}`}>{fmt(r.return1m)}</td>
                      <td className={`px-3 py-2.5 text-xs text-right tabular-nums font-semibold ${color(r.return3m)}`}>{fmt(r.return3m)}</td>
                      <td className={`px-3 py-2.5 text-xs text-right tabular-nums font-semibold ${color(r.return6m)}`}>{fmt(r.return6m)}</td>
                      <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{r.composite.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <p className="text-[11px] text-gray-400 max-w-3xl">
        Sectors with fewer than 3 companies are excluded for stability. Returns are equal-weighted (not market-cap
        weighted) so emerging sectors with smaller stocks aren&apos;t under-represented. Composite = 3·1W + 2·1M + 1·3M + 0.5·6M.
      </p>
    </div>
  );
}
