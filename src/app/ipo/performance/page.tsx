export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { latestTradingDate, canonicalCloseMap, canonicalSeries, canonicalCloseOnOrAfter } from "@/lib/price";
import { Sparkline } from "@/components/Sparkline";

export const metadata: Metadata = {
  title: "IPO Performance Tracker — Listing gains + 1M/3M/6M/1Y returns 2024-2026 | IPOpulse",
  description: "Every recently listed Indian IPO with its actual listing-day gain plus 1-month, 3-month, 6-month and 1-year post-listing returns. Filter by year. Best and worst IPO performers tracked daily from NSE bhavcopy.",
  alternates: { canonical: "/ipo/performance" },
};

interface SearchParams {
  year?: string;
  type?: string; // mainboard | sme | all
}

interface PerfRow {
  ipoSlug: string;
  ipoName: string;
  type: string;
  listingDate: Date;
  issuePrice: number;       // upper price band
  listingPrice: number;
  listingGainPct: number;
  currentPrice: number | null;
  ret1m: number | null;
  ret3m: number | null;
  ret6m: number | null;
  ret1y: number | null;
  retTotal: number | null;  // since listing
  spark: number[];
}

export default async function IpoPerformancePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filterYear = sp.year ? parseInt(sp.year, 10) : null;
  const filterType = sp.type === "mainboard" || sp.type === "sme" ? sp.type : "all";

  // ─── Build IPO query ────────────────────────────────────────────────────
  const yearWhere = filterYear
    ? { listingDate: { gte: new Date(filterYear, 0, 1), lt: new Date(filterYear + 1, 0, 1) } }
    : {};
  const typeWhere = filterType !== "all" ? { type: filterType } : {};

  const ipos = await prisma.ipo.findMany({
    where: {
      status: "listed",
      listingDate: { not: null },
      ...yearWhere,
      ...typeWhere,
    },
    orderBy: { listingDate: "desc" },
    take: 200,
    select: {
      slug: true, name: true, type: true, listingDate: true,
      priceBandHigh: true, nseSymbol: true, bseCode: true,
      listing: { select: { listingPrice: true, listingGainsPct: true } },
    },
  });

  // ─── Match IPOs to companies for post-listing prices ────────────────────
  const symbols = ipos.map(i => i.nseSymbol).filter((s): s is string => !!s);
  const companies = await prisma.company.findMany({
    where: { nseSymbol: { in: symbols }, active: true },
    select: { id: true, nseSymbol: true, slug: true },
  });
  const symbolToCo = new Map(companies.map(c => [c.nseSymbol!, c]));

  // ─── For each matched company, fetch prices ─────────────────────────────
  const coIds = companies.map(c => c.id);
  const oldestCutoff = new Date(); oldestCutoff.setDate(oldestCutoff.getDate() - 35);
  const sparkSeries = coIds.length > 0 ? await canonicalSeries(coIds, oldestCutoff) : new Map();
  const sparkMap = new Map<number, number[]>();
  for (const [cid, rows] of sparkSeries) sparkMap.set(cid, rows.map((r: { close: number }) => r.close));

  // Latest canonical price per company
  const latestBhavDate = await latestTradingDate();
  const latestMap = latestBhavDate && coIds.length > 0 ? await canonicalCloseMap(latestBhavDate, coIds) : new Map<number, number>();

  // For each IPO, fetch prices at specific intervals (1m/3m/6m/1y after listing)
  const perfRows: PerfRow[] = [];
  for (const ipo of ipos) {
    if (!ipo.listing || !ipo.listingDate || !ipo.priceBandHigh) continue;
    const co = ipo.nseSymbol ? symbolToCo.get(ipo.nseSymbol) : null;
    const issue = Number(ipo.priceBandHigh);
    const listingPrice = Number(ipo.listing.listingPrice);
    const listingGainPct = Number(ipo.listing.listingGainsPct);
    const current = co ? latestMap.get(co.id) ?? null : null;
    const spark = co ? sparkMap.get(co.id) ?? [] : [];

    // For interval returns, query close at listingDate + interval
    let ret1m = null, ret3m = null, ret6m = null, ret1y = null;
    if (co) {
      const intervals = [
        { days: 30, key: "ret1m" as const },
        { days: 90, key: "ret3m" as const },
        { days: 180, key: "ret6m" as const },
        { days: 365, key: "ret1y" as const },
      ];
      for (const iv of intervals) {
        const target = new Date(ipo.listingDate.getTime() + iv.days * 86400000);
        // Skip if interval target is in the future
        if (target > new Date()) continue;
        // Canonical price (best source) on/after the interval date — re-audit HIGH:
        // a plain findFirst picked an arbitrary source, corrupting published returns.
        const closeAt = await canonicalCloseOnOrAfter(co.id, target);
        if (closeAt != null) {
          const ret = ((closeAt - issue) / issue) * 100;
          if (iv.key === "ret1m") ret1m = ret;
          if (iv.key === "ret3m") ret3m = ret;
          if (iv.key === "ret6m") ret6m = ret;
          if (iv.key === "ret1y") ret1y = ret;
        }
      }
    }
    const retTotal = current ? ((current - issue) / issue) * 100 : null;

    perfRows.push({
      ipoSlug: ipo.slug, ipoName: ipo.name, type: ipo.type,
      listingDate: ipo.listingDate, issuePrice: issue,
      listingPrice, listingGainPct, currentPrice: current,
      ret1m, ret3m, ret6m, ret1y, retTotal, spark,
    });
  }

  // ─── Aggregate stats ────────────────────────────────────────────────────
  const allListingGains = perfRows.map(r => r.listingGainPct).filter((v): v is number => !isNaN(v));
  const positiveListings = allListingGains.filter(g => g > 0).length;
  const avgListingGain = allListingGains.length > 0
    ? allListingGains.reduce((s, x) => s + x, 0) / allListingGains.length : 0;
  const medianListingGain = allListingGains.length > 0
    ? [...allListingGains].sort((a, b) => a - b)[Math.floor(allListingGains.length / 2)] : 0;
  const successRate = perfRows.length > 0 ? (positiveListings / perfRows.length) * 100 : 0;

  // Top 5 best/worst by total return (since listing)
  const withRet = perfRows.filter(r => r.retTotal != null) as Array<PerfRow & { retTotal: number }>;
  const bestTotal = [...withRet].sort((a, b) => b.retTotal - a.retTotal).slice(0, 5);
  const worstTotal = [...withRet].sort((a, b) => a.retTotal - b.retTotal).slice(0, 5);

  // Available years for filter
  const yearAggregate = await prisma.ipo.findMany({
    where: { status: "listed", listingDate: { not: null } },
    orderBy: { listingDate: "desc" },
    select: { listingDate: true },
  });
  const yearSet = new Set(yearAggregate.map(r => r.listingDate?.getFullYear()).filter((y): y is number => !!y));
  const years = Array.from(yearSet).sort((a, b) => b - a);

  function PctCell({ v }: { v: number | null }) {
    if (v == null) return <span className="text-gray-400">—</span>;
    const positive = v >= 0;
    return (
      <span className={`tabular-nums font-medium ${positive ? "text-emerald-600" : "text-red-600"}`}>
        {positive ? "+" : ""}{v.toFixed(1)}%
      </span>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Link href="/ipo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> IPO dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">IPO Performance Tracker</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Every Indian IPO that has listed{filterYear ? ` in ${filterYear}` : ""}{filterType !== "all" ? ` (${filterType.toUpperCase()})` : ""} —
          listing day gain, plus 1-month, 3-month, 6-month, 1-year and total returns from issue price.
          Live current prices from NSE bhavcopy. Updated daily.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 items-center text-xs">
        <span className="text-gray-500 mr-1">Year:</span>
        <Link href={`/ipo/performance?type=${filterType}`}
          className={`px-3 py-1.5 rounded-full ${!filterYear ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          All
        </Link>
        {years.map(y => (
          <Link key={y} href={`/ipo/performance?year=${y}&type=${filterType}`}
            className={`px-3 py-1.5 rounded-full ${filterYear === y ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            {y}
          </Link>
        ))}
        <span className="text-gray-500 ml-3 mr-1">Type:</span>
        {(["all", "mainboard", "sme"] as const).map(t => (
          <Link key={t} href={`/ipo/performance?${filterYear ? `year=${filterYear}&` : ""}type=${t}`}
            className={`px-3 py-1.5 rounded-full ${filterType === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Link>
        ))}
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">IPOs Tracked</div>
          <div className="text-2xl font-bold text-indigo-700 tabular-nums">{perfRows.length}</div>
        </div>
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Avg Listing Gain</div>
          <div className={`text-2xl font-bold tabular-nums ${avgListingGain >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {avgListingGain >= 0 ? "+" : ""}{avgListingGain.toFixed(1)}%
          </div>
        </div>
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Median Listing Gain</div>
          <div className={`text-2xl font-bold tabular-nums ${medianListingGain >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {medianListingGain >= 0 ? "+" : ""}{medianListingGain.toFixed(1)}%
          </div>
        </div>
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Positive Listings</div>
          <div className="text-2xl font-bold text-violet-700 tabular-nums">{successRate.toFixed(0)}%</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{positiveListings} of {perfRows.length}</div>
        </div>
      </div>

      {/* Best / Worst performers since listing */}
      {bestTotal.length > 0 && worstTotal.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Top 5 Performers (Total Return Since Listing)
            </h3>
            {bestTotal.map(r => (
              <div key={r.ipoSlug} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-100 last:border-b-0">
                <Link href={`/ipo/${r.ipoSlug}`} className="text-gray-700 hover:text-indigo-600 truncate flex-1">{r.ipoName}</Link>
                <span className="text-emerald-700 font-semibold tabular-nums ml-2">+{r.retTotal.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Bottom 5 Performers (Total Return Since Listing)
            </h3>
            {worstTotal.map(r => (
              <div key={r.ipoSlug} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-100 last:border-b-0">
                <Link href={`/ipo/${r.ipoSlug}`} className="text-gray-700 hover:text-indigo-600 truncate flex-1">{r.ipoName}</Link>
                <span className="text-red-700 font-semibold tabular-nums ml-2">{r.retTotal.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main performance table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-3 py-3">IPO</th>
                <th className="px-3 py-3 text-right">Issue Price</th>
                <th className="px-3 py-3 text-right">Listing Date</th>
                <th className="px-3 py-3 text-right">Listing Gain</th>
                <th className="px-3 py-3 text-center">30D</th>
                <th className="px-3 py-3 text-right">CMP</th>
                <th className="px-3 py-3 text-right">1M</th>
                <th className="px-3 py-3 text-right">3M</th>
                <th className="px-3 py-3 text-right">6M</th>
                <th className="px-3 py-3 text-right">1Y</th>
                <th className="px-3 py-3 text-right" title="Total return from issue price to current">Total</th>
              </tr>
            </thead>
            <tbody>
              {perfRows.map(r => (
                <tr key={r.ipoSlug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm">
                    <Link href={`/ipo/${r.ipoSlug}`} className="font-medium text-gray-900 hover:text-indigo-600">{r.ipoName}</Link>
                    <div className="text-[10px] text-gray-400 mt-0.5 uppercase">{r.type}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">₹{r.issuePrice.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-3 text-xs text-right text-gray-500 tabular-nums">
                    {r.listingDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="px-3 py-3 text-right text-sm"><PctCell v={r.listingGainPct} /></td>
                  <td className="px-3 py-3 text-center">
                    <Sparkline values={r.spark} width={60} height={20} />
                  </td>
                  <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-900">
                    {r.currentPrice ? `₹${r.currentPrice.toFixed(0)}` : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-right"><PctCell v={r.ret1m} /></td>
                  <td className="px-3 py-3 text-xs text-right"><PctCell v={r.ret3m} /></td>
                  <td className="px-3 py-3 text-xs text-right"><PctCell v={r.ret6m} /></td>
                  <td className="px-3 py-3 text-xs text-right"><PctCell v={r.ret1y} /></td>
                  <td className="px-3 py-3 text-sm text-right font-semibold"><PctCell v={r.retTotal} /></td>
                </tr>
              ))}
              {perfRows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-12 text-center text-sm text-gray-500">
                    No listed IPOs match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Returns calculated from issue price to current EOD close (from NSE bhavcopy). 1M/3M/6M/1Y intervals are the first
        trading day on or after the listing date + interval. Returns may show — when the interval has not yet elapsed or
        when the IPO is not mapped to a company in our database. Updated daily from NSE bhavcopy at 7 PM IST.
      </p>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/ipo/listed" className="text-indigo-600 hover:text-indigo-800">→ All listed IPOs</Link>
        <Link href="/ipo/gmp-accuracy" className="text-indigo-600 hover:text-indigo-800">→ GMP accuracy scorecard</Link>
        <Link href="/ipo/stats" className="text-indigo-600 hover:text-indigo-800">→ IPO statistics</Link>
      </div>
    </div>
  );
}
