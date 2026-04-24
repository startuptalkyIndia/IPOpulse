export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Stock Ticker — 5,500+ listed Indian companies | BSE & NSE",
  description:
    "Browse every BSE/NSE listed company. 10-year financials, ratios, shareholding, concall notes, peer comparison. Mobile-first stock research.",
};

export default async function TickerPage() {
  const companies = await prisma.company.findMany({
    where: { active: true, isSme: false },
    orderBy: { marketCap: "desc" },
    take: 200,
  });

  const bySector = companies.reduce<Record<string, typeof companies>>((acc, c) => {
    const s = c.sector ?? "Others";
    (acc[s] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Stock Ticker</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Every BSE/NSE listed company — with 10-year financials, ratios, shareholding, concall notes, and peer
          comparison. Clean, fast, mobile-first. Live prices wiring up via Zerodha Kite Connect.
        </p>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Top companies by market cap</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Company</th>
                <th className="px-3 py-2.5">Symbol</th>
                <th className="px-3 py-2.5">Sector</th>
                <th className="px-3 py-2.5 text-right">Mkt cap (Cr)</th>
              </tr>
            </thead>
            <tbody>
              {companies.slice(0, 30).map((c, i) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2.5 text-sm">
                    <Link href={`/ticker/${c.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-mono text-gray-500">{c.nseSymbol ?? c.bseCode ?? "—"}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{c.sector ?? "—"}</td>
                  <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-700">
                    {c.marketCap ? formatCurrency(Number(c.marketCap) * 10000000).replace("₹", "₹") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By sector */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Browse by sector</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(bySector)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([sector, list]) => (
              <div key={sector} className="card">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{sector}</h3>
                  <span className="text-xs text-gray-400">{list.length} companies</span>
                </div>
                <ul className="space-y-1">
                  {list.slice(0, 4).map((c) => (
                    <li key={c.id}>
                      <Link href={`/ticker/${c.slug}`} className="text-xs text-gray-700 hover:text-indigo-600">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
