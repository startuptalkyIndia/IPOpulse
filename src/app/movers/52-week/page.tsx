export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/db";
import { latestTradingDate, canonicalRowsForDate, canonicalRange } from "@/lib/price";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "52-Week High & Low Stocks India — BSE / NSE breakouts today",
  description:
    "Stocks hitting 52-week highs and 52-week lows on BSE/NSE today. With sector, market cap, and percentage change. Updated daily.",
  alternates: { canonical: "/movers/52-week" },
};

interface Row {
  slug: string;
  name: string;
  sector: string | null;
  symbol: string | null;
  close: number;
  high52: number;
  low52: number;
  fromHighPct: number;
  fromLowPct: number;
  marketCap: number | null;
}

async function fetchRows(): Promise<Row[]> {
  const latest = await latestTradingDate();
  if (!latest) return [];

  // Canonical (one row per company) — direct reads would duplicate per source.
  const todayRows = await canonicalRowsForDate(latest);
  const since = new Date(latest.getTime() - 365 * 86400000);
  const ids = todayRows.map((r) => r.companyId);
  const range = await canonicalRange(ids, since);
  const companies = await prisma.company.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true, name: true, sector: true, nseSymbol: true, bseCode: true, marketCap: true },
  });
  const coMap = new Map(companies.map((c) => [c.id, c]));

  const out: Row[] = [];
  for (const r of todayRows) {
    const co = coMap.get(r.companyId);
    if (!co) continue;
    const agg = range.get(r.companyId);
    const high52 = agg?.max || r.high;
    const low52 = agg?.min || r.low;
    out.push({
      slug: co.slug,
      name: co.name,
      sector: co.sector,
      symbol: co.nseSymbol ?? co.bseCode,
      close: r.close,
      high52,
      low52,
      fromHighPct: high52 > 0 ? ((r.close - high52) / high52) * 100 : 0,
      fromLowPct: low52 > 0 ? ((r.close - low52) / low52) * 100 : 0,
      marketCap: co.marketCap ? Number(co.marketCap) : null,
    });
  }
  return out;
}

function Table({ title, rows, accent }: { title: string; rows: Row[]; accent: "high" | "low" }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      {rows.length === 0 ? (
        <div className="card text-center py-8 text-sm text-gray-500">
          52-week high/low data requires 12 months of price history. Daily prices are being collected — this page will populate fully by November 2026.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3 text-right">LTP</th>
                  <th className="px-3 py-3 text-right">52w {accent === "high" ? "High" : "Low"}</th>
                  <th className="px-3 py-3 text-right">% from {accent === "high" ? "high" : "low"}</th>
                  <th className="px-3 py-3 text-right">Mkt cap (Cr)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const dist = accent === "high" ? r.fromHighPct : r.fromLowPct;
                  const cls = accent === "high" ? "text-green-600" : "text-red-600";
                  return (
                    <tr key={r.slug} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm">
                        <Link href={`/ticker/${r.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {r.name}
                        </Link>
                        <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{r.symbol} · {r.sector ?? "—"}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-900">₹{r.close.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">
                        ₹{(accent === "high" ? r.high52 : r.low52).toLocaleString("en-IN")}
                      </td>
                      <td className={`px-3 py-3 text-sm text-right tabular-nums font-semibold ${cls}`}>
                        {dist >= 0 ? "+" : ""}
                        {dist.toFixed(2)}%
                      </td>
                      <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">
                        {r.marketCap ? formatCurrency(r.marketCap * 10000000) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default async function FiftyTwoWeekPage() {
  const rows = await fetchRows();
  const nearHigh = [...rows]
    .filter((r) => r.fromHighPct >= -2)
    .sort((a, b) => b.fromHighPct - a.fromHighPct)
    .slice(0, 25);
  const nearLow = [...rows]
    .filter((r) => r.fromLowPct <= 5)
    .sort((a, b) => a.fromLowPct - b.fromLowPct)
    .slice(0, 25);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Link href="/movers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Top Gainers / Losers
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">52-Week High &amp; Low Stocks</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Stocks within 2% of their 52-week high (breakout candidates) and within 5% of their 52-week low
          (potential value or distress signals). Refreshed daily after market close.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-500">At/near 52w high</div>
            <div className="text-lg font-bold text-green-600 tabular-nums">{nearHigh.length}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center"><TrendingDown className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-500">At/near 52w low</div>
            <div className="text-lg font-bold text-red-600 tabular-nums">{nearLow.length}</div>
          </div>
        </div>
      </div>

      <Table title="At 52-week high (breakout candidates)" rows={nearHigh} accent="high" />
      <Table title="At 52-week low (value or distress)" rows={nearLow} accent="low" />
    </div>
  );
}
