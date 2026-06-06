export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "IPO Performance by Sector India 2024-2026 — Which Sectors Deliver Best Listing Gains | IPOpulse",
  description: "Sector-wise breakdown of Indian IPO listing performance — IT, Banking, Pharma, Consumer, Specialty Chemicals and more. Compare average listing gain, success rate, and total capital raised per sector.",
  alternates: { canonical: "/ipo/by-sector" },
};

interface SectorStats {
  sector: string;
  total: number;
  mainboard: number;
  sme: number;
  positive: number;
  positivePct: number;
  avgGain: number;
  medianGain: number;
  bestGain: number;
  worstGain: number;
  totalCapital: number;        // ₹ crore
  recentIpos: { slug: string; name: string; gain: number }[];
}

export default async function IpoBySectorPage() {
  // Pull all listed IPOs + their listing + match to a company for sector inference
  const ipos = await prisma.ipo.findMany({
    where: { status: "listed", listing: { isNot: null } },
    select: {
      slug: true, name: true, type: true, nseSymbol: true, bseCode: true,
      issueSize: true, listingDate: true,
      listing: { select: { listingGainsPct: true } },
    },
    orderBy: { listingDate: "desc" },
  });

  const allSymbols = ipos.map(i => i.nseSymbol).filter((s): s is string => !!s);
  const companies = await prisma.company.findMany({
    where: { nseSymbol: { in: allSymbols } },
    select: { nseSymbol: true, sector: true },
  });
  const symbolToSector = new Map(companies.map(c => [c.nseSymbol!, c.sector]));

  // Group by inferred sector. IPOs without a matched company go under "Unmapped".
  const sectorBuckets = new Map<string, typeof ipos>();
  for (const ipo of ipos) {
    const sector = ipo.nseSymbol ? symbolToSector.get(ipo.nseSymbol) ?? "Unmapped" : "Unmapped";
    if (sector === "Unmapped") continue; // skip unmapped from rankings
    const arr = sectorBuckets.get(sector) ?? [];
    arr.push(ipo);
    sectorBuckets.set(sector, arr);
  }

  const allStats: SectorStats[] = Array.from(sectorBuckets.entries()).map(([sector, list]) => {
    const gains = list.map(i => Number(i.listing!.listingGainsPct)).filter(g => !isNaN(g));
    const sorted = [...gains].sort((a, b) => a - b);
    const med = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
    const positive = gains.filter(g => g > 0).length;
    const totalCapital = list.reduce((s, i) => s + (i.issueSize ? Number(i.issueSize) : 0), 0);
    const recentIpos = list
      .filter(i => i.listing)
      .sort((a, b) => (b.listingDate?.getTime() ?? 0) - (a.listingDate?.getTime() ?? 0))
      .slice(0, 3)
      .map(i => ({ slug: i.slug, name: i.name, gain: Number(i.listing!.listingGainsPct) }));
    return {
      sector,
      total: list.length,
      mainboard: list.filter(i => i.type === "mainboard").length,
      sme: list.filter(i => i.type === "sme").length,
      positive,
      positivePct: list.length > 0 ? (positive / list.length) * 100 : 0,
      avgGain: gains.length > 0 ? gains.reduce((s, x) => s + x, 0) / gains.length : 0,
      medianGain: med,
      bestGain: gains.length > 0 ? Math.max(...gains) : 0,
      worstGain: gains.length > 0 ? Math.min(...gains) : 0,
      totalCapital,
      recentIpos,
    };
  });

  // Only sectors with 2+ IPOs for statistical meaningfulness
  const sectorsRelevant = allStats.filter(s => s.total >= 2);
  // Sort by total IPOs (volume leaderboard)
  const byVolume = [...sectorsRelevant].sort((a, b) => b.total - a.total);
  // Top performers by average gain (min 3 IPOs)
  const byPerf = [...sectorsRelevant].filter(s => s.total >= 3).sort((a, b) => b.avgGain - a.avgGain).slice(0, 5);
  const worstPerf = [...sectorsRelevant].filter(s => s.total >= 3).sort((a, b) => a.avgGain - b.avgGain).slice(0, 5);

  const grandTotal = ipos.length;
  const grandCapital = ipos.reduce((s, i) => s + (i.issueSize ? Number(i.issueSize) : 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/ipo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> IPO dashboard
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">IPO Performance by Sector</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Which sectors are delivering the best IPO listing gains in India? Aggregated across {grandTotal} listed IPOs
          raising {formatCurrency(grandCapital * 10000000)} in total capital. Sector inferred from the listed company&apos;s
          NSE sector classification.
        </p>
      </div>

      {/* Top + bottom sectors by avg gain */}
      {byPerf.length > 0 && worstPerf.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Top Sectors by Avg Listing Gain (Min 3 IPOs)
            </h3>
            {byPerf.map((s, i) => (
              <div key={s.sector} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-100 last:border-b-0">
                <span className="text-gray-700">
                  <span className="text-gray-400 mr-1">{i + 1}.</span>
                  {s.sector}
                  <span className="text-[10px] text-gray-400 ml-2">{s.total} IPOs</span>
                </span>
                <span className="text-emerald-700 font-semibold tabular-nums">+{s.avgGain.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Weakest Sectors (Min 3 IPOs)
            </h3>
            {worstPerf.map((s, i) => (
              <div key={s.sector} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-100 last:border-b-0">
                <span className="text-gray-700">
                  <span className="text-gray-400 mr-1">{i + 1}.</span>
                  {s.sector}
                  <span className="text-[10px] text-gray-400 ml-2">{s.total} IPOs</span>
                </span>
                <span className={`font-semibold tabular-nums ${s.avgGain >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {s.avgGain >= 0 ? "+" : ""}{s.avgGain.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main sector table */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">All Sectors with 2+ Listed IPOs</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-3 py-3">Sector</th>
                  <th className="px-3 py-3 text-right">Total IPOs</th>
                  <th className="px-3 py-3 text-right">MB / SME</th>
                  <th className="px-3 py-3 text-right">Avg Listing Gain</th>
                  <th className="px-3 py-3 text-right">Median</th>
                  <th className="px-3 py-3 text-right">% Positive</th>
                  <th className="px-3 py-3 text-right">Capital Raised</th>
                  <th className="px-3 py-3 text-right">Best</th>
                </tr>
              </thead>
              <tbody>
                {byVolume.map((s) => (
                  <tr key={s.sector} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm">
                      <Link href={`/sectors/${s.sector.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        className="font-medium text-gray-900 hover:text-indigo-600">{s.sector}</Link>
                      {s.recentIpos.length > 0 && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Recent: {s.recentIpos.slice(0, 2).map((r, idx) => (
                            <span key={r.slug}>
                              <Link href={`/ipo/${r.slug}`} className="hover:text-indigo-600">{r.name.split(" ").slice(0, 2).join(" ")}</Link>
                              {idx < Math.min(s.recentIpos.length - 1, 1) ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-indigo-700 font-semibold">{s.total}</td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">{s.mainboard} / {s.sme}</td>
                    <td className={`px-3 py-3 text-sm text-right tabular-nums font-medium ${s.avgGain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {s.avgGain >= 0 ? "+" : ""}{s.avgGain.toFixed(1)}%
                    </td>
                    <td className={`px-3 py-3 text-xs text-right tabular-nums ${s.medianGain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {s.medianGain >= 0 ? "+" : ""}{s.medianGain.toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">
                      {s.positivePct.toFixed(0)}%
                    </td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">
                      {s.totalCapital > 0 ? formatCurrency(s.totalCapital * 10000000) : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-emerald-600">
                      +{s.bestGain.toFixed(0)}%
                    </td>
                  </tr>
                ))}
                {byVolume.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-12 text-center text-sm text-gray-500">
                      Not enough sector-mapped listed IPOs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <p className="text-[11px] text-gray-400">
        Sector inferred via the IPO&apos;s NSE symbol → matched company → company.sector. IPOs without a matched company in
        our database (typically very recent listings) are excluded from this aggregation. Click any sector to see all
        listed stocks in that sector with deep fundamentals.
      </p>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/ipo/performance" className="text-indigo-600 hover:text-indigo-800">→ IPO performance tracker</Link>
        <Link href="/ipo/merchant-bankers" className="text-indigo-600 hover:text-indigo-800">→ Merchant banker leaderboard</Link>
        <Link href="/sectors" className="text-indigo-600 hover:text-indigo-800">→ Sector dashboards</Link>
      </div>
    </div>
  );
}
