export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "IPOs by Issue Size India — Mega, Large, Mid, Small IPOs 2024-2026 | IPOpulse",
  description: "Indian IPOs categorized by issue size — mega IPOs (>₹5,000 Cr), large (₹1,000-5,000 Cr), mid (₹200-1,000 Cr), small (<₹200 Cr). Compare listing gains across size buckets to identify the best risk-return profile.",
  alternates: { canonical: "/ipo/by-size" },
};

interface SearchParams {
  bucket?: string;
}

const BUCKETS: Array<{ key: string; label: string; description: string; min: number | null; max: number | null }> = [
  { key: "mega",  label: "Mega (>₹5,000 Cr)",  description: "Mega-cap IPOs — typically large institutional issues like LIC, Tata Capital, NSE",
    min: 5000, max: null },
  { key: "large", label: "Large (₹1,000–5,000 Cr)", description: "Large IPOs with strong QIB participation and broad retail interest",
    min: 1000, max: 5000 },
  { key: "mid",   label: "Mid (₹200–1,000 Cr)", description: "Mid-size IPOs — common range for growth companies and most mainboard listings",
    min: 200, max: 1000 },
  { key: "small", label: "Small (<₹200 Cr)",   description: "Small mainboard IPOs and SME issues — higher growth potential but more volatile",
    min: null, max: 200 },
];

export default async function IpoBySizePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const activeBucket = BUCKETS.find(b => b.key === sp.bucket) ?? BUCKETS[0];

  // Pull all listed IPOs once for stat aggregation
  const allListed = await prisma.ipo.findMany({
    where: {
      status: "listed",
      listing: { isNot: null },
      issueSize: { not: null },
    },
    orderBy: { listingDate: "desc" },
    select: {
      slug: true, name: true, type: true,
      issueSize: true, priceBandHigh: true, listingDate: true,
      listing: { select: { listingGainsPct: true, listingPrice: true } },
    },
  });

  // Compute bucket stats for all 4 buckets
  const bucketStats = BUCKETS.map(b => {
    const inBucket = allListed.filter(ipo => {
      const sz = Number(ipo.issueSize);
      if (b.min != null && sz < b.min) return false;
      if (b.max != null && sz >= b.max) return false;
      return true;
    });
    const gains = inBucket.map(i => Number(i.listing!.listingGainsPct)).filter(g => !isNaN(g));
    const avg = gains.length > 0 ? gains.reduce((s, x) => s + x, 0) / gains.length : 0;
    const positive = gains.filter(g => g > 0).length;
    const totalCapital = inBucket.reduce((s, i) => s + (i.issueSize ? Number(i.issueSize) : 0), 0);
    return {
      ...b,
      total: inBucket.length,
      avgGain: avg,
      positivePct: gains.length > 0 ? (positive / gains.length) * 100 : 0,
      totalCapital,
    };
  });

  // Active bucket — fetch the IPOs in it
  const activeIpos = allListed.filter(ipo => {
    const sz = Number(ipo.issueSize);
    if (activeBucket.min != null && sz < activeBucket.min) return false;
    if (activeBucket.max != null && sz >= activeBucket.max) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/ipo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> IPO dashboard
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">IPOs by Issue Size</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Indian IPO listing performance grouped by issue size. Helps identify whether mega IPOs reliably outperform
          smaller issues, and where retail investors get the best risk-adjusted opportunities.
        </p>
      </div>

      {/* Bucket selector — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {bucketStats.map((b) => {
          const isActive = b.key === activeBucket.key;
          return (
            <Link
              key={b.key}
              href={`/ipo/by-size?bucket=${b.key}`}
              className={`card text-left hover:border-indigo-300 transition ${isActive ? "border-indigo-500 bg-indigo-50/40" : ""}`}
            >
              <div className={`text-[10px] uppercase tracking-wide font-bold mb-1 ${isActive ? "text-indigo-700" : "text-gray-400"}`}>
                {b.label}
              </div>
              <div className="text-2xl font-bold text-gray-900 tabular-nums">{b.total}</div>
              <div className="text-[10px] text-gray-500 mt-1">IPOs · Avg gain</div>
              <div className={`text-sm font-semibold tabular-nums mt-0.5 ${b.avgGain >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {b.avgGain >= 0 ? "+" : ""}{b.avgGain.toFixed(1)}%
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {b.positivePct.toFixed(0)}% positive · {b.totalCapital > 0 ? formatCurrency(b.totalCapital * 10000000) : "—"}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Active bucket details */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900">
          {activeBucket.label} — {activeIpos.length} IPOs
        </h2>
        <p className="text-xs text-gray-600 mt-1">{activeBucket.description}</p>
      </div>

      {/* Active bucket table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">IPO</th>
                <th className="px-3 py-3 text-right">Issue Size</th>
                <th className="px-3 py-3 text-right">Price Band Top</th>
                <th className="px-3 py-3 text-right">Listing Date</th>
                <th className="px-3 py-3 text-right">Listing Gain</th>
              </tr>
            </thead>
            <tbody>
              {activeIpos.map((ipo, i) => {
                const gain = Number(ipo.listing!.listingGainsPct);
                return (
                  <tr key={ipo.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3 text-sm">
                      <Link href={`/ipo/${ipo.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {ipo.name}
                      </Link>
                      <div className="text-[10px] text-gray-400 mt-0.5 uppercase">{ipo.type}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-900">
                      {ipo.issueSize ? formatCurrency(Number(ipo.issueSize) * 10000000) : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">
                      {ipo.priceBandHigh ? `₹${Number(ipo.priceBandHigh).toFixed(0)}` : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-500">
                      {ipo.listingDate ? ipo.listingDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                    </td>
                    <td className={`px-3 py-3 text-sm text-right tabular-nums font-medium ${gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {gain >= 0 ? "+" : ""}{gain.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              {activeIpos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-sm text-gray-500">
                    No IPOs in this size bucket yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/ipo/performance" className="text-indigo-600 hover:text-indigo-800">→ IPO performance tracker</Link>
        <Link href="/ipo/by-sector" className="text-indigo-600 hover:text-indigo-800">→ IPOs by sector</Link>
        <Link href="/ipo/merchant-bankers" className="text-indigo-600 hover:text-indigo-800">→ Merchant banker leaderboard</Link>
      </div>
    </div>
  );
}
