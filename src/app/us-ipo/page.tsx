export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "US IPO Tracker for Indians — upcoming and recent US IPOs with LRS guide",
  description:
    "Track upcoming and recent US IPOs. For Indian investors: how to invest via LRS, estimated post-TCS return, currency impact. Updated from SEC EDGAR filings.",
  alternates: { canonical: "/us-ipo" },
};

function formatUsd(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`;
  return `$${v.toFixed(0)}M`;
}

function fmtDate(d: Date | null): string {
  if (!d) return "TBA";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export default async function UsIpoPage() {
  const now = new Date();
  const past90 = new Date(now.getTime() - 90 * 86400000);

  const [upcoming, recent] = await Promise.all([
    prisma.usIpo.findMany({
      where: { status: { in: ["upcoming", "priced"] } },
      orderBy: { expectedDate: "asc" },
      take: 30,
    }),
    prisma.usIpo.findMany({
      where: { status: "trading", filedDate: { gte: past90 } },
      orderBy: { filedDate: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">US IPO Tracker</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Upcoming and recent US IPOs with an Indian investor lens — how to access via LRS, estimated
          post-TCS cost, and currency impact on returns. Data from SEC EDGAR S-1 filings (open, updated
          continuously).
        </p>
      </div>

      {/* How to invest callout */}
      <div className="card bg-indigo-50 border-indigo-200">
        <h2 className="text-sm font-semibold text-indigo-900 mb-2">How to invest in US IPOs from India</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-indigo-900">
          <div>
            <div className="font-semibold mb-1">Step 1 — Open a US brokerage</div>
            <p>Vested Finance, Stockal, INDmoney, or Interactive Brokers India all allow IPO applications. Vested supports most US IPOs directly.</p>
          </div>
          <div>
            <div className="font-semibold mb-1">Step 2 — Remit via LRS</div>
            <p>Up to $250K/year under RBI's Liberalised Remittance Scheme. TCS of 20% applies above ₹7L cumulative — reclaim in your ITR. <Link href="/calculators/lrs-tcs" className="underline">LRS calculator →</Link></p>
          </div>
          <div>
            <div className="font-semibold mb-1">Step 3 — Apply for IPO</div>
            <p>US IPO allotment is broker-dependent. Retail allocations are limited. Many investors prefer buying on listing day + 1 after the first-day pop settles.</p>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming US IPOs</h2>
        {upcoming.length === 0 ? (
          <div className="card text-center py-10 text-sm text-gray-500">
            No upcoming US IPOs in the EDGAR pipeline right now. The EDGAR cron runs every 6 hours.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase text-left">
                    <th className="px-3 py-3">Company</th>
                    <th className="px-3 py-3">Sector</th>
                    <th className="px-3 py-3">Exchange</th>
                    <th className="px-3 py-3 text-right">Raise (USD)</th>
                    <th className="px-3 py-3 text-right">Price range</th>
                    <th className="px-3 py-3">Expected</th>
                    <th className="px-3 py-3">S-1</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">{u.companyName}</td>
                      <td className="px-3 py-3 text-xs text-gray-600">{u.sector ?? "—"}</td>
                      <td className="px-3 py-3 text-xs text-gray-600">{u.exchange ?? "—"}</td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-900">{formatUsd(u.sizeUsdMn ? Number(u.sizeUsdMn) : null)}</td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">
                        {u.priceLow && u.priceHigh ? `$${Number(u.priceLow)}–$${Number(u.priceHigh)}` : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-700">{fmtDate(u.expectedDate)}</td>
                      <td className="px-3 py-3">
                        {u.s1Url ? (
                          <a href={u.s1Url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 text-xs">
                            S-1 <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Recently filed */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recently filed S-1s (last 90 days)</h2>
        {recent.length === 0 ? (
          <div className="card text-center py-8 text-sm text-gray-500">
            No recent S-1 filings indexed yet. The EDGAR crawler adds them continuously.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recent.map((r) => (
              <div key={r.id} className="card">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{r.companyName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {r.sector ?? "—"} · Filed {fmtDate(r.filedDate)} · {r.exchange ?? "US"}
                    </div>
                  </div>
                  {r.listingGainPct != null ? (
                    <div className={`text-sm font-bold tabular-nums ${Number(r.listingGainPct) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {Number(r.listingGainPct) >= 0 ? "+" : ""}{Number(r.listingGainPct).toFixed(1)}%
                    </div>
                  ) : null}
                </div>
                {r.s1Url ? (
                  <a href={r.s1Url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-indigo-600 hover:underline inline-flex items-center gap-1">
                    View S-1 filing <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Indian context */}
      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" /> Indian investor context
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900">What makes US IPOs attractive for Indians?</h3>
            <p className="text-gray-600 mt-1">Access to companies (AI infrastructure, biotech, SaaS) with no Indian equivalent. US IPO first-day returns average +15-20% historically (though 2022 saw negative average). The real edge is long-term holding in USD with rupee depreciation tailwind.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">The real cost</h3>
            <p className="text-gray-600 mt-1">TCS reclaim takes 6-12 months (until ITR filing + refund). Forex conversion fees at bank (0.5-2%). Brokerage on US platform ($0 at Vested, $1-5 elsewhere). For IPO allotments, add platform fee. Total real cost on ₹5L investment: roughly ₹8,000-15,000 one-way.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tax on exit</h3>
            <p className="text-gray-600 mt-1">US capital gains: India taxes at 12.5% LTCG (after 24 months) or slab rate (under 24 months). US has no capital gains tax for non-resident investors. DTAA prevents double taxation. Use our <Link href="/calculators/usd-returns" className="text-indigo-600 hover:underline">USD returns calculator</Link> to model post-tax returns.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
