export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { MonthlyIpoChart } from "./MonthlyChartLoader";

export const metadata: Metadata = {
  title: "Indian IPO Market Statistics 2026 — Performance, Trends & Data",
  description:
    "Live IPO market statistics for 2026 — total IPOs, funds raised, average listing gain, best and worst performers, monthly breakdown, and mainboard vs SME split.",
  alternates: { canonical: "/ipo/stats" },
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CURRENT_YEAR = 2026;

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function fmtCr(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L Cr`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K Cr`;
  return `₹${Math.round(n).toLocaleString("en-IN")} Cr`;
}

export default async function IpoStatsPage() {
  const yearStart = new Date(CURRENT_YEAR, 0, 1);
  const yearEnd = new Date(CURRENT_YEAR + 1, 0, 1);

  // Fetch all IPOs that listed in 2026
  const ipos = await prisma.ipo.findMany({
    where: {
      OR: [
        { listingDate: { gte: yearStart, lt: yearEnd } },
        { openDate: { gte: yearStart, lt: yearEnd } },
      ],
    },
    include: { listing: true },
    orderBy: { listingDate: "desc" },
  }).catch(() => []);

  // Aggregate stats
  const listed = ipos.filter((i) => i.listing);
  const totalIpos = ipos.length;
  const totalListedWithData = listed.length;

  // Total issue size
  const totalIssueCr = ipos.reduce((sum, i) => sum + Number(i.issueSize ?? 0), 0);

  // Avg listing gain
  const gains = listed.map((i) => Number(i.listing!.listingGainsPct));
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
  const positiveCount = gains.filter((g) => g > 0).length;
  const positiveRate = gains.length > 0 ? (positiveCount / gains.length) * 100 : 0;

  // Best / worst 5 performers
  const sortedByGain = [...listed].sort(
    (a, b) => Number(b.listing!.listingGainsPct) - Number(a.listing!.listingGainsPct)
  );
  const best5 = sortedByGain.slice(0, 5);
  const worst5 = sortedByGain.slice(-5).reverse();

  // Mainboard vs SME
  const mainboardCount = ipos.filter((i) => i.type === "mainboard").length;
  const smeCount = ipos.filter((i) => i.type === "sme").length;

  // Monthly breakdown — based on listing date or open date
  const monthlyCounts: Record<number, number> = {};
  for (let m = 0; m < 12; m++) monthlyCounts[m] = 0;
  for (const ipo of ipos) {
    const d = ipo.listingDate ?? ipo.openDate;
    if (d) {
      const month = new Date(d).getMonth();
      monthlyCounts[month] = (monthlyCounts[month] ?? 0) + 1;
    }
  }
  const monthlyData = MONTH_NAMES.map((month, i) => ({
    month,
    count: monthlyCounts[i] ?? 0,
  })).filter((_, i) => i <= new Date().getMonth()); // only show months up to current

  const heroStats = [
    {
      label: `IPOs in ${CURRENT_YEAR}`,
      value: totalIpos.toString(),
      sub: `${mainboardCount} mainboard, ${smeCount} SME`,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Total Funds Raised",
      value: totalIssueCr > 0 ? fmtCr(totalIssueCr) : "—",
      sub: "Combined issue size",
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Avg Listing Gain",
      value: totalListedWithData > 0 ? `${avgGain >= 0 ? "+" : ""}${fmt(avgGain)}%` : "—",
      sub: `${totalListedWithData} IPOs with listing data`,
      color: avgGain >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50",
    },
    {
      label: "Positive Listings",
      value: totalListedWithData > 0 ? `${fmt(positiveRate, 0)}%` : "—",
      sub: `${positiveCount} of ${totalListedWithData} listed`,
      color: "text-blue-600 bg-blue-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 w-fit">
          <BarChart2 className="w-3.5 h-3.5" />
          Live statistics
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Indian IPO Market Statistics {CURRENT_YEAR}
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Aggregated data for all mainboard and SME IPOs listed or open in {CURRENT_YEAR} —
          total count, funds raised, listing performance, and monthly breakdown.
        </p>
      </div>

      {/* Hero stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {heroStats.map((s) => (
          <div key={s.label} className="card">
            <div className={`text-2xl font-bold tabular-nums ${s.color.split(" ")[0]}`}>
              {s.value}
            </div>
            <div className="text-xs font-medium text-gray-700 mt-1">{s.label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Monthly breakdown chart */}
      {monthlyData.length > 0 && (
        <section className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Monthly IPO Activity — {CURRENT_YEAR}
          </h2>
          <MonthlyIpoChart data={monthlyData} />
          <p className="text-[11px] text-gray-400 mt-3">
            Count includes mainboard and SME IPOs by listing or open date.
          </p>
        </section>
      )}

      {/* Mainboard vs SME */}
      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Mainboard vs SME Split — {CURRENT_YEAR}
        </h2>
        <div className="flex gap-6 flex-wrap">
          <div>
            <div className="text-2xl font-bold text-indigo-600 tabular-nums">{mainboardCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Mainboard IPOs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 tabular-nums">{smeCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">SME IPOs</div>
          </div>
        </div>
        {totalIpos > 0 && (
          <div className="mt-4 h-3 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(mainboardCount / totalIpos) * 100}%` }}
            />
          </div>
        )}
        <div className="flex gap-4 mt-2 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            Mainboard {totalIpos > 0 ? `${Math.round((mainboardCount / totalIpos) * 100)}%` : ""}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            SME {totalIpos > 0 ? `${Math.round((smeCount / totalIpos) * 100)}%` : ""}
          </span>
        </div>
      </section>

      {/* Best performers */}
      {best5.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Best Performers — Top 5 by Listing Gain
          </h2>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-right px-4 py-3">Type</th>
                  <th className="text-right px-4 py-3">Issue Price</th>
                  <th className="text-right px-4 py-3">Listing Price</th>
                  <th className="text-right px-4 py-3">Listing Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {best5.map((ipo) => {
                  const gain = Number(ipo.listing!.listingGainsPct);
                  return (
                    <tr key={ipo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Link href={`/ipo/${ipo.slug}`} className="hover:text-indigo-600">
                          {ipo.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                            ipo.type === "sme"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {ipo.type === "sme" ? "SME" : "Mainboard"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                        {ipo.priceBandHigh ? `₹${Number(ipo.priceBandHigh).toFixed(0)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                        ₹{Number(ipo.listing!.listingPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-green-600">
                        +{fmt(gain)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Worst performers */}
      {worst5.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            Worst Performers — Bottom 5 by Listing Gain
          </h2>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-right px-4 py-3">Type</th>
                  <th className="text-right px-4 py-3">Issue Price</th>
                  <th className="text-right px-4 py-3">Listing Price</th>
                  <th className="text-right px-4 py-3">Listing Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {worst5.map((ipo) => {
                  const gain = Number(ipo.listing!.listingGainsPct);
                  return (
                    <tr key={ipo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Link href={`/ipo/${ipo.slug}`} className="hover:text-indigo-600">
                          {ipo.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                            ipo.type === "sme"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {ipo.type === "sme" ? "SME" : "Mainboard"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                        {ipo.priceBandHigh ? `₹${Number(ipo.priceBandHigh).toFixed(0)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                        ₹{Number(ipo.listing!.listingPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-red-600">
                        {fmt(gain)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Empty state if no data */}
      {totalIpos === 0 && (
        <div className="card text-center py-12">
          <BarChart2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            IPO statistics for {CURRENT_YEAR} will populate as IPOs are listed.
          </p>
          <Link
            href="/ipo"
            className="mt-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            View all IPOs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* CTA to full IPO list */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Data covers mainboard and SME IPOs tracked by IPOpulse. Listing gain calculated vs final
          issue price.
        </p>
        <Link
          href="/ipo"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Full IPO List <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
