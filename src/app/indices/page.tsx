export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { Sparkline } from "@/components/Sparkline";

export const metadata: Metadata = {
  title: "Nifty Indices — live close, P/E, P/B, dividend yield for 100+ NSE indices",
  description:
    "All NSE Nifty indices: Nifty 50, Nifty Bank, Nifty IT, Nifty Auto, Midcap, Smallcap and 100+ more. Daily close, points change, P/E, P/B, dividend yield, 30-day sparklines.",
  alternates: { canonical: "/indices" },
};

// Pin these at the top
const PRIORITY = [
  "Nifty 50", "Nifty Next 50", "Nifty 100", "Nifty 200", "Nifty 500",
  "Nifty Bank", "Nifty IT", "Nifty Auto", "Nifty Pharma", "Nifty FMCG",
  "Nifty Financial Services", "Nifty Metal", "Nifty Realty", "Nifty Media",
  "Nifty Midcap 50", "Nifty Smallcap 250",
];

export default async function IndicesPage() {
  const latest = await prisma.niftyIndex.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
  if (!latest) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Nifty Indices</h1>
        <p className="text-gray-500">Data loading — runs daily at 4 PM IST. Check back after market close.</p>
      </div>
    );
  }

  const rows = await prisma.niftyIndex.findMany({
    where: { date: latest.date },
    orderBy: { indexName: "asc" },
  });

  // ─── Fetch 30-day history for sparklines + 30D return ───────────────────
  const sparkCutoff = new Date(latest.date);
  sparkCutoff.setDate(sparkCutoff.getDate() - 35);
  const histRows = await prisma.niftyIndex.findMany({
    where: { date: { gte: sparkCutoff } },
    orderBy: [{ indexName: "asc" }, { date: "asc" }],
    select: { indexName: true, close: true },
  });
  const histMap = new Map<string, number[]>();
  for (const r of histRows) {
    const arr = histMap.get(r.indexName) ?? [];
    arr.push(Number(r.close));
    histMap.set(r.indexName, arr);
  }
  // Compute 30D return % per index
  const ret30dMap = new Map<string, number>();
  for (const [name, prices] of histMap.entries()) {
    if (prices.length < 2) continue;
    const ret = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
    ret30dMap.set(name, ret);
  }

  // ─── Top gainers / losers (today + 30D) ────────────────────────────────
  const sortedByToday = [...rows].filter(r => r.changePct != null).sort((a, b) => Number(b.changePct) - Number(a.changePct));
  const topGainers = sortedByToday.slice(0, 5);
  const topLosers = sortedByToday.slice(-5).reverse();
  const sorted30d = [...rows]
    .map(r => ({ row: r, ret: ret30dMap.get(r.indexName) }))
    .filter(x => x.ret != null) as Array<{ row: typeof rows[0]; ret: number }>;
  sorted30d.sort((a, b) => b.ret - a.ret);
  const top30dGainers = sorted30d.slice(0, 5);

  // Sort: priority first, then rest alphabetically
  const prioritySet = new Set(PRIORITY);
  const priority = PRIORITY.map(n => rows.find(r => r.indexName === n)).filter(Boolean) as typeof rows;
  const rest = rows.filter(r => !prioritySet.has(r.indexName));

  const dateLabel = new Date(latest.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  function Row({ r }: { r: typeof rows[0] }) {
    const chg = r.changePct ? Number(r.changePct) : null;
    const positive = chg != null && chg >= 0;
    const sparkValues = histMap.get(r.indexName) ?? [];
    const ret30d = ret30dMap.get(r.indexName);
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.indexName}</td>
        <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-900 font-semibold">
          {Number(r.close).toLocaleString("en-IN")}
        </td>
        <td className="px-3 py-2.5 text-sm text-right tabular-nums font-medium">
          {chg != null ? (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs ${positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(chg).toFixed(2)}%
            </span>
          ) : "—"}
        </td>
        <td className="px-3 py-2.5 text-center">
          <Sparkline values={sparkValues} width={70} height={22} />
        </td>
        <td className={`px-3 py-2.5 text-xs text-right tabular-nums font-medium ${
          ret30d != null
            ? ret30d >= 0 ? "text-emerald-600" : "text-red-600"
            : "text-gray-400"
        }`}>
          {ret30d != null ? `${ret30d >= 0 ? "+" : ""}${ret30d.toFixed(2)}%` : "—"}
        </td>
        <td className="px-3 py-2.5 text-xs text-right tabular-nums text-indigo-700 font-medium">
          {r.pe ? Number(r.pe).toFixed(2) : "—"}
        </td>
        <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-600">
          {r.pb ? Number(r.pb).toFixed(2) : "—"}
        </td>
        <td className="px-3 py-2.5 text-xs text-right tabular-nums text-emerald-700">
          {r.divYield ? `${Number(r.divYield).toFixed(2)}%` : "—"}
        </td>
      </tr>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Nifty Indices</h1>
        <p className="text-sm text-gray-600">
          {rows.length} NSE indices · {dateLabel} · P/E, P/B, Dividend Yield from NSE official data · 30-day sparklines
        </p>
      </div>

      {/* Top gainers / losers / 30D winners cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Top Gainers (Today)
          </h3>
          {topGainers.length === 0 ? <div className="text-xs text-gray-400">—</div> :
            topGainers.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1 text-xs">
                <span className="text-gray-700 truncate">{r.indexName}</span>
                <span className="text-emerald-700 font-semibold tabular-nums">+{Number(r.changePct).toFixed(2)}%</span>
              </div>
            ))}
        </div>
        <div className="card">
          <h3 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Top Losers (Today)
          </h3>
          {topLosers.length === 0 ? <div className="text-xs text-gray-400">—</div> :
            topLosers.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1 text-xs">
                <span className="text-gray-700 truncate">{r.indexName}</span>
                <span className="text-red-700 font-semibold tabular-nums">{Number(r.changePct).toFixed(2)}%</span>
              </div>
            ))}
        </div>
        <div className="card">
          <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Top 30D Performers
          </h3>
          {top30dGainers.length === 0 ? <div className="text-xs text-gray-400">—</div> :
            top30dGainers.map((x) => (
              <div key={x.row.id} className="flex items-center justify-between py-1 text-xs">
                <span className="text-gray-700 truncate">{x.row.indexName}</span>
                <span className={`font-semibold tabular-nums ${x.ret >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {x.ret >= 0 ? "+" : ""}{x.ret.toFixed(2)}%
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Index</th>
                <th className="px-3 py-3 text-right">Close</th>
                <th className="px-3 py-3 text-right">Today %</th>
                <th className="px-3 py-3 text-center">30D Trend</th>
                <th className="px-3 py-3 text-right">30D %</th>
                <th className="px-3 py-3 text-right">P/E</th>
                <th className="px-3 py-3 text-right">P/B</th>
                <th className="px-3 py-3 text-right">Div Yield</th>
              </tr>
            </thead>
            <tbody>
              {priority.length > 0 && (
                <>
                  <tr className="bg-indigo-50">
                    <td colSpan={8} className="px-3 py-1.5 text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Key indices</td>
                  </tr>
                  {priority.map(r => <Row key={r.id} r={r} />)}
                  <tr className="bg-gray-50">
                    <td colSpan={8} className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">All indices</td>
                  </tr>
                </>
              )}
              {rest.map(r => <Row key={r.id} r={r} />)}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Data sourced from NSE India (nsearchives.nseindia.com) · Updated daily at 4 PM IST after market close ·
        P/E uses trailing earnings · 30D return computed from index close 30 days ago vs latest · Not investment advice.
      </p>

      <div className="flex gap-3 flex-wrap">
        <Link href="/sectors" className="text-sm text-indigo-600 hover:text-indigo-800">→ Sector dashboards</Link>
        <Link href="/screener" className="text-sm text-indigo-600 hover:text-indigo-800">→ Stock screener</Link>
        <Link href="/fii-dii" className="text-sm text-indigo-600 hover:text-indigo-800">→ FII/DII flows</Link>
      </div>
    </div>
  );
}
