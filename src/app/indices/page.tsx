export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Nifty Indices — live close, P/E, P/B, dividend yield for 100+ NSE indices",
  description:
    "All NSE Nifty indices: Nifty 50, Nifty Bank, Nifty IT, Nifty Auto, Midcap, Smallcap and 100+ more. Daily close, points change, P/E, P/B, dividend yield.",
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

  // Sort: priority first, then rest alphabetically
  const prioritySet = new Set(PRIORITY);
  const priority = PRIORITY.map(n => rows.find(r => r.indexName === n)).filter(Boolean) as typeof rows;
  const rest = rows.filter(r => !prioritySet.has(r.indexName));

  const dateLabel = new Date(latest.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  function Row({ r }: { r: typeof rows[0] }) {
    const chg = r.changePct ? Number(r.changePct) : null;
    const positive = chg != null && chg >= 0;
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.indexName}</td>
        <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-900 font-semibold">
          {Number(r.close).toLocaleString("en-IN")}
        </td>
        <td className="px-3 py-2.5 text-sm text-right tabular-nums">
          {r.pointsChg != null ? (
            <span className={positive ? "text-emerald-600" : "text-red-500"}>
              {positive ? "▲" : "▼"} {Math.abs(Number(r.pointsChg)).toFixed(2)}
            </span>
          ) : "—"}
        </td>
        <td className="px-3 py-2.5 text-sm text-right tabular-nums font-medium">
          {chg != null ? (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs ${positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(chg).toFixed(2)}%
            </span>
          ) : "—"}
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
          {rows.length} NSE indices · {dateLabel} · P/E, P/B and Dividend Yield from NSE official data
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Index</th>
                <th className="px-3 py-3 text-right">Close</th>
                <th className="px-3 py-3 text-right">Points</th>
                <th className="px-3 py-3 text-right">Change</th>
                <th className="px-3 py-3 text-right">P/E</th>
                <th className="px-3 py-3 text-right">P/B</th>
                <th className="px-3 py-3 text-right">Div Yield</th>
              </tr>
            </thead>
            <tbody>
              {priority.length > 0 && (
                <>
                  <tr className="bg-indigo-50">
                    <td colSpan={7} className="px-3 py-1.5 text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Key indices</td>
                  </tr>
                  {priority.map(r => <Row key={r.id} r={r} />)}
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">All indices</td>
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
        P/E uses trailing earnings · Not investment advice.
      </p>

      <div className="flex gap-3 flex-wrap">
        <Link href="/sectors" className="text-sm text-indigo-600 hover:text-indigo-800">→ Sector dashboards</Link>
        <Link href="/screener" className="text-sm text-indigo-600 hover:text-indigo-800">→ Stock screener</Link>
        <Link href="/fii-dii" className="text-sm text-indigo-600 hover:text-indigo-800">→ FII/DII flows</Link>
      </div>
    </div>
  );
}
