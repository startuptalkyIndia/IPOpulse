export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Insider Trading — promoter & director buy/sell disclosures (SAST)",
  description: "Promoter, director, and KMP buy/sell disclosures from SEBI SAST regulations. The most bullish signal in Indian markets: when a promoter buys their own stock at market price.",
  alternates: { canonical: "/insider-trading" },
};

export default async function InsiderTradingPage() {
  const past30 = new Date(Date.now() - 30 * 86400000);
  const [buys, sells, pledges] = await Promise.all([
    prisma.insiderTrade.findMany({ where: { date: { gte: past30 }, tradeType: "Buy" }, orderBy: [{ date: "desc" }, { valueLakh: "desc" }], take: 100 }),
    prisma.insiderTrade.findMany({ where: { date: { gte: past30 }, tradeType: "Sell" }, orderBy: [{ date: "desc" }, { valueLakh: "desc" }], take: 100 }),
    prisma.insiderTrade.findMany({ where: { date: { gte: past30 }, tradeType: { in: ["Pledge", "Revoke"] } }, orderBy: [{ date: "desc" }], take: 50 }),
  ]);

  const totalBuyValue = buys.reduce((s, r) => s + Number(r.valueLakh ?? 0), 0);
  const totalSellValue = sells.reduce((s, r) => s + Number(r.valueLakh ?? 0), 0);

  function fmtDate(d: Date) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(d); }
  function fmtLakh(v: number | null) { if (!v) return "—"; if (v >= 10000) return `₹${(v / 10000).toFixed(1)} Cr`; return `₹${v.toFixed(0)}L`; }

  function TradeTable({ rows, type }: { rows: typeof buys; type: string }) {
    if (!rows.length) return <div className="card text-center py-6 text-sm text-gray-500">No {type.toLowerCase()} disclosures in last 30 days.</div>;
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3 text-left">Date</th>
                <th className="px-3 py-3 text-left">Company</th>
                <th className="px-3 py-3 text-left">Acquirer</th>
                <th className="px-3 py-3 text-left">Category</th>
                <th className="px-3 py-3 text-right">Qty</th>
                <th className="px-3 py-3 text-right">Value</th>
                <th className="px-3 py-3 text-right">Post hold %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.date)}</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.companyName}<div className="text-[11px] text-gray-400 font-mono">{r.symbol}</div></td>
                  <td className="px-3 py-2.5 text-sm text-gray-700">{r.acquirerName}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{r.acquirerType}</td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums">{r.qty ? Number(r.qty).toLocaleString("en-IN") : "—"}</td>
                  <td className={`px-3 py-2.5 text-sm text-right tabular-nums font-semibold ${r.tradeType === "Buy" ? "text-green-600" : "text-red-600"}`}>{fmtLakh(r.valueLakh ? Number(r.valueLakh) : null)}</td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{r.postHoldingPct ? `${Number(r.postHoldingPct).toFixed(2)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Insider Trading Disclosures</h1>
        <p className="text-sm text-gray-600 max-w-3xl">Promoter, director, and KMP buy/sell disclosures under SEBI SAST regulations. Promoter buying at market price = highest conviction signal in Indian markets. Last 30 days.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card"><div className="text-xs text-gray-500">Insider buys (30d)</div><div className="text-xl font-bold text-green-600 mt-0.5">{buys.length}</div></div>
        <div className="card"><div className="text-xs text-gray-500">Buy value</div><div className="text-xl font-bold text-green-600 mt-0.5">{totalBuyValue >= 10000 ? `₹${(totalBuyValue / 10000).toFixed(1)} Cr` : `₹${totalBuyValue.toFixed(0)}L`}</div></div>
        <div className="card"><div className="text-xs text-gray-500">Insider sells (30d)</div><div className="text-xl font-bold text-red-600 mt-0.5">{sells.length}</div></div>
        <div className="card"><div className="text-xs text-gray-500">Sell value</div><div className="text-xl font-bold text-red-600 mt-0.5">{totalSellValue >= 10000 ? `₹${(totalSellValue / 10000).toFixed(1)} Cr` : `₹${totalSellValue.toFixed(0)}L`}</div></div>
      </div>

      {buys.length === 0 && sells.length === 0 ? (
        <div className="card text-center py-10 text-sm text-gray-500">No insider trades (promoter/director buying or selling) have been reported in the current period. Data sourced from NSE SAST disclosures.</div>
      ) : (
        <>
          <section><h2 className="text-lg font-semibold text-green-800 mb-2">🟢 Insider Buys — promoters & directors buying their own stock</h2><TradeTable rows={buys} type="Buy" /></section>
          <section><h2 className="text-lg font-semibold text-red-800 mb-2">🔴 Insider Sells</h2><TradeTable rows={sells} type="Sell" /></section>
          {pledges.length > 0 && <section><h2 className="text-lg font-semibold text-orange-800 mb-2">⚠️ Pledges &amp; Revocations</h2><TradeTable rows={pledges} type="Pledge" /></section>}
        </>
      )}

      <div className="card text-sm text-gray-700">
        <h2 className="font-semibold mb-2">Why insider trades matter</h2>
        <p className="text-gray-600">Under SEBI's SAST regulations, any promoter, director, or KMP must disclose every buy or sell within 2 trading days. A promoter buying at market price (no discount, no ESOP) is the single most bullish signal in Indian equity markets — they are spending real money because they believe the stock is undervalued.</p>
      </div>
    </div>
  );
}
