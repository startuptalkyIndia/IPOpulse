export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { canonicalCloseMap } from "@/lib/price";
import { formatCurrency } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Stock Ticker — 2,500+ NSE/BSE listed companies with live prices",
  description:
    "Browse every NSE/BSE listed company. Daily prices, 52-week range, sector, market cap. Fast, mobile-first stock research hub.",
};

export default async function TickerPage() {
  const latestBhav = await prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
  const prevBhav = latestBhav
    ? await prisma.bhavcopyDaily.findFirst({ where: { date: { lt: latestBhav.date } }, orderBy: { date: "desc" }, select: { date: true } })
    : null;

  const [companies, todayMap, prevMap] = await Promise.all([
    prisma.company.findMany({
      where: { active: true, isSme: false },
      orderBy: { marketCap: "desc" },
      take: 500,
      select: { id: true, slug: true, name: true, nseSymbol: true, bseCode: true, sector: true, marketCap: true },
    }),
    latestBhav ? canonicalCloseMap(latestBhav.date) : new Map<number, number>(),
    prevBhav ? canonicalCloseMap(prevBhav.date) : new Map<number, number>(),
  ]);

  const enriched = companies.map(c => {
    const ltp  = todayMap.get(c.id) ?? null;
    const prev = prevMap.get(c.id)  ?? null;
    const chg  = ltp && prev ? ((ltp - prev) / prev) * 100 : null;
    return { ...c, ltp, chg };
  });

  const withPrices = enriched.filter(c => c.ltp != null);
  const topGainers = [...withPrices].sort((a, b) => (b.chg ?? -999) - (a.chg ?? -999)).slice(0, 10);
  const topLosers  = [...withPrices].sort((a, b) => (a.chg ??  999) - (b.chg ??  999)).slice(0, 10);
  const priceDate  = latestBhav ? new Date(latestBhav.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Stock Ticker</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          {withPrices.length.toLocaleString()} companies with {priceDate} prices · Click any for chart, news, 52W range
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold text-indigo-700">{withPrices.length.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">With prices today</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-emerald-600">{withPrices.filter(c => (c.chg ?? 0) > 0).length}</div>
          <div className="text-xs text-gray-500 mt-1">Gainers</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-500">{withPrices.filter(c => (c.chg ?? 0) < 0).length}</div>
          <div className="text-xs text-gray-500 mt-1">Losers</div>
        </div>
        <Link href="/screener" className="card text-center hover:border-indigo-300 transition group">
          <div className="text-2xl font-bold text-gray-600 group-hover:text-indigo-700">Filter →</div>
          <div className="text-xs text-gray-500 mt-1">Open Screener</div>
        </Link>
      </div>

      {/* Gainers + Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Top Gainers", icon: TrendingUp, color: "text-emerald-500", items: topGainers, positive: true },
          { title: "Top Losers",  icon: TrendingDown, color: "text-red-500",     items: topLosers,  positive: false },
        ].map(({ title, icon: Icon, color, items, positive }) => (
          <div key={title} className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} /> {title}
            </h2>
            <div className="space-y-1">
              {items.map(c => (
                <Link key={c.slug} href={`/ticker/${c.slug}`} className="flex items-center justify-between py-1.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{c.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{c.nseSymbol}</div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-sm font-semibold tabular-nums text-gray-700">₹{c.ltp?.toLocaleString("en-IN")}</div>
                    <div className={`text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
                      {positive ? "+" : ""}{c.chg?.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* All companies */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Top 200 by market cap</h2>
          <Link href="/screener" className="text-sm text-indigo-600 hover:text-indigo-800">Advanced screener →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Company</th>
                <th className="px-3 py-2.5">Symbol</th>
                <th className="px-3 py-2.5">Sector</th>
                <th className="px-3 py-2.5 text-right">LTP</th>
                <th className="px-3 py-2.5 text-right">1D %</th>
                <th className="px-3 py-2.5 text-right">Mkt Cap</th>
              </tr>
            </thead>
            <tbody>
              {enriched.slice(0, 200).map((c, i) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link href={`/ticker/${c.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">{c.name}</Link>
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-gray-500">{c.nseSymbol ?? c.bseCode ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{c.sector ?? "—"}</td>
                  <td className="px-3 py-2 text-sm text-right tabular-nums text-gray-700">
                    {c.ltp ? `₹${c.ltp.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className={`px-3 py-2 text-xs text-right tabular-nums font-medium ${
                    c.chg == null ? "text-gray-400" : c.chg >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {c.chg != null ? `${c.chg >= 0 ? "+" : ""}${c.chg.toFixed(2)}%` : "—"}
                  </td>
                  <td className="px-3 py-2 text-sm text-right tabular-nums text-gray-700">
                    {c.marketCap ? formatCurrency(Number(c.marketCap) * 10000000) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
