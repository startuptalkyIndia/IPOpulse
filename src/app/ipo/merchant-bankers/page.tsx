export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "IPO Merchant Banker Leaderboard 2024-2026 — Top BRLMs by Listing Performance | IPOpulse",
  description: "Ranking of Indian IPO merchant bankers (BRLMs) — Kotak Mahindra Capital, ICICI Securities, JM Financial, Axis Capital, Goldman Sachs and more — by number of IPOs handled and average listing day performance.",
  alternates: { canonical: "/ipo/merchant-bankers" },
};

// Normalize banker names (Screener.in style — collapse variations)
function normalizeBanker(raw: string): string {
  const s = raw.trim().toLowerCase();
  // Map common variants to canonical names
  const map: Record<string, string> = {
    "kotak": "Kotak Mahindra Capital",
    "kotak mahindra capital": "Kotak Mahindra Capital",
    "kotak mahindra": "Kotak Mahindra Capital",
    "icici": "ICICI Securities",
    "icici securities": "ICICI Securities",
    "axis": "Axis Capital",
    "axis capital": "Axis Capital",
    "axis bank": "Axis Capital",
    "jm": "JM Financial",
    "jm financial": "JM Financial",
    "sbi capital": "SBI Capital Markets",
    "sbi cap": "SBI Capital Markets",
    "sbi caps": "SBI Capital Markets",
    "sbi capital markets": "SBI Capital Markets",
    "iifl": "IIFL Securities",
    "iifl securities": "IIFL Securities",
    "iifl capital": "IIFL Securities",
    "hdfc": "HDFC Bank",
    "hdfc bank": "HDFC Bank",
    "hdfc securities": "HDFC Bank",
    "morgan stanley": "Morgan Stanley",
    "morgan stanley india": "Morgan Stanley",
    "goldman sachs": "Goldman Sachs",
    "goldman sachs india": "Goldman Sachs",
    "jp morgan": "JP Morgan",
    "jpmorgan": "JP Morgan",
    "bofa": "BofA Securities",
    "bofa securities": "BofA Securities",
    "bank of america": "BofA Securities",
    "citi": "Citi",
    "citigroup": "Citi",
    "citi india": "Citi",
    "hsbc": "HSBC Securities",
    "hsbc securities": "HSBC Securities",
    "edelweiss": "Edelweiss Financial",
    "edelweiss financial": "Edelweiss Financial",
    "ambit": "Ambit Capital",
    "ambit capital": "Ambit Capital",
    "centrum": "Centrum Capital",
    "nuvama": "Nuvama Wealth",
    "yes securities": "Yes Securities",
    "motilal oswal": "Motilal Oswal",
    "anand rathi": "Anand Rathi",
    "anand rathi advisors": "Anand Rathi",
    "anand rathi securities": "Anand Rathi",
    "beeline capital": "Beeline Capital",
    "fedex securities": "Fedex Securities",
    "khambatta securities": "Khambatta Securities",
  };
  if (map[s]) return map[s];
  // Fall back to title-case the raw
  return raw.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

interface BankerStats {
  name: string;
  totalIpos: number;
  mainboardIpos: number;
  smeIpos: number;
  avgListingGain: number;
  medianListingGain: number;
  positivePct: number;     // % of IPOs with positive listing gain
  bestGain: number;
  worstGain: number;
  recentSlugs: string[];   // recent IPO slugs for quick links
}

export default async function MerchantBankersPage() {
  const ipos = await prisma.ipo.findMany({
    where: {
      status: "listed",
      leadManagers: { not: null },
      listing: { isNot: null },
    },
    select: {
      slug: true, name: true, type: true, leadManagers: true,
      listingDate: true,
      listing: { select: { listingGainsPct: true } },
    },
    orderBy: { listingDate: "desc" },
    take: 500,
  });

  // ─── Aggregate stats per banker ─────────────────────────────────────────
  const statsMap = new Map<string, { gains: number[]; mainboard: number; sme: number; slugs: { slug: string; date: Date | null }[] }>();

  for (const ipo of ipos) {
    if (!ipo.leadManagers || !ipo.listing) continue;
    const gain = Number(ipo.listing.listingGainsPct);
    if (isNaN(gain)) continue;
    const bankers = ipo.leadManagers.split(",").map(s => s.trim()).filter(Boolean);
    for (const raw of bankers) {
      const canonical = normalizeBanker(raw);
      const cur = statsMap.get(canonical) ?? { gains: [], mainboard: 0, sme: 0, slugs: [] };
      cur.gains.push(gain);
      if (ipo.type === "sme") cur.sme++; else cur.mainboard++;
      cur.slugs.push({ slug: ipo.slug, date: ipo.listingDate });
      statsMap.set(canonical, cur);
    }
  }

  const allStats: BankerStats[] = Array.from(statsMap.entries()).map(([name, s]) => {
    const avg = s.gains.reduce((acc, x) => acc + x, 0) / s.gains.length;
    const sorted = [...s.gains].sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];
    const positivePct = (s.gains.filter(g => g > 0).length / s.gains.length) * 100;
    const recent = [...s.slugs]
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      .slice(0, 3)
      .map(x => x.slug);
    return {
      name,
      totalIpos: s.gains.length,
      mainboardIpos: s.mainboard,
      smeIpos: s.sme,
      avgListingGain: avg,
      medianListingGain: med,
      positivePct,
      bestGain: Math.max(...s.gains),
      worstGain: Math.min(...s.gains),
      recentSlugs: recent,
    };
  });

  // Only show bankers with at least 3 IPOs for statistical relevance
  const relevant = allStats.filter(s => s.totalIpos >= 3);
  // Sort by total IPOs (volume leaderboard)
  const byVolume = [...relevant].sort((a, b) => b.totalIpos - a.totalIpos).slice(0, 30);
  // Sort by avg listing gain (performance leaderboard, min 5 IPOs)
  const byPerf = [...relevant].filter(s => s.totalIpos >= 5).sort((a, b) => b.avgListingGain - a.avgListingGain).slice(0, 10);
  const worstPerf = [...relevant].filter(s => s.totalIpos >= 5).sort((a, b) => a.avgListingGain - b.avgListingGain).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/ipo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> IPO dashboard
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">IPO Merchant Banker Leaderboard</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Track record of Book Running Lead Managers (BRLMs) for Indian IPOs. Average listing gain and success rate
          across {ipos.length} listed IPOs. Helps assess whether an upcoming IPO&apos;s banker has a strong recent history.
        </p>
      </div>

      {/* Top performers and worst performers */}
      {byPerf.length > 0 && worstPerf.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Top Performers (Avg Listing Gain · Min 5 IPOs)
            </h3>
            {byPerf.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-100 last:border-b-0">
                <span className="text-gray-700">
                  <span className="text-gray-400 mr-1">{i + 1}.</span>
                  {s.name}
                  <span className="text-[10px] text-gray-400 ml-2">{s.totalIpos} IPOs</span>
                </span>
                <span className="text-emerald-700 font-semibold tabular-nums">+{s.avgListingGain.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Bottom Performers (Min 5 IPOs)
            </h3>
            {worstPerf.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-100 last:border-b-0">
                <span className="text-gray-700">
                  <span className="text-gray-400 mr-1">{i + 1}.</span>
                  {s.name}
                  <span className="text-[10px] text-gray-400 ml-2">{s.totalIpos} IPOs</span>
                </span>
                <span className={`font-semibold tabular-nums ${s.avgListingGain >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {s.avgListingGain >= 0 ? "+" : ""}{s.avgListingGain.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main table — by volume */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">All Active Merchant Bankers (Min 3 IPOs)</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Merchant Banker</th>
                  <th className="px-3 py-3 text-right">Total IPOs</th>
                  <th className="px-3 py-3 text-right">Mainboard</th>
                  <th className="px-3 py-3 text-right">SME</th>
                  <th className="px-3 py-3 text-right">Avg Listing Gain</th>
                  <th className="px-3 py-3 text-right">Median</th>
                  <th className="px-3 py-3 text-right">% Positive</th>
                  <th className="px-3 py-3 text-right">Best</th>
                </tr>
              </thead>
              <tbody>
                {byVolume.map((s, i) => (
                  <tr key={s.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">
                      {s.name}
                      {s.recentSlugs.length > 0 && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Recent: {s.recentSlugs.slice(0, 2).map(slug => (
                            <Link key={slug} href={`/ipo/${slug}`} className="hover:text-indigo-600 mr-2">{slug.replace(/-ipo$/, "")}</Link>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-indigo-700 font-semibold">{s.totalIpos}</td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">{s.mainboardIpos}</td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">{s.smeIpos}</td>
                    <td className={`px-3 py-3 text-sm text-right tabular-nums font-medium ${s.avgListingGain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {s.avgListingGain >= 0 ? "+" : ""}{s.avgListingGain.toFixed(1)}%
                    </td>
                    <td className={`px-3 py-3 text-xs text-right tabular-nums ${s.medianListingGain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {s.medianListingGain >= 0 ? "+" : ""}{s.medianListingGain.toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">
                      {s.positivePct.toFixed(0)}%
                    </td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-emerald-600">
                      +{s.bestGain.toFixed(0)}%
                    </td>
                  </tr>
                ))}
                {byVolume.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-12 text-center text-sm text-gray-500">
                      Not enough listed IPOs yet to compute leaderboard.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <p className="text-[11px] text-gray-400">
        Data: listing-day gain (% from upper band to listing price) aggregated by banker, normalized for common name variants
        (e.g. &quot;Kotak&quot; → &quot;Kotak Mahindra Capital&quot;). Only bankers with 3+ listed IPOs shown. Sourced from BSE filings.
        Not investment advice — past performance does not guarantee future results.
      </p>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/ipo/performance" className="text-indigo-600 hover:text-indigo-800">→ IPO performance tracker</Link>
        <Link href="/ipo/gmp-accuracy" className="text-indigo-600 hover:text-indigo-800">→ GMP accuracy scorecard</Link>
        <Link href="/ipo/sme-risk" className="text-indigo-600 hover:text-indigo-800">→ SME IPO risk scorecard</Link>
      </div>
    </div>
  );
}
