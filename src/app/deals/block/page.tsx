export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Block Deals Today — NSE block deal data, institutional trades",
  description: "NSE block deal data. Pre-negotiated large trades executed on the exchange in a 15-min window at the open. Reveals institutional accumulation and distribution.",
  alternates: { canonical: "/deals/block" },
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(d);
}

export default async function BlockDealsPage() {
  const past30 = new Date(Date.now() - 30 * 86400000);
  const deals = await prisma.blockDeal.findMany({
    where: { date: { gte: past30 } },
    orderBy: [{ date: "desc" }, { valueCr: "desc" }],
    take: 200,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Block Deals</h1>
        <p className="text-sm text-gray-600 max-w-3xl">Block deals are pre-negotiated large trades executed in a 15-minute window at 9:15am IST. Minimum order ₹10 Cr. Reveals institutional accumulation and distribution. <Link href="/deals/bulk" className="text-indigo-600 hover:underline">Bulk deals →</Link></p>
      </div>
      {deals.length === 0 ? (
        <div className="card text-center py-10 text-sm text-gray-500">No block deals (pre-negotiated institutional trades of ₹10 Cr or more) have been reported in the last 30 days. Block deal data is sourced from NSE/BSE end-of-day disclosures.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3 text-left">Date</th>
                  <th className="px-3 py-3 text-left">Company</th>
                  <th className="px-3 py-3 text-left">Client</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3 text-right">Qty</th>
                  <th className="px-3 py-3 text-right">Price</th>
                  <th className="px-3 py-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-xs text-gray-500">{fmtDate(d.date)}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{d.companyName}<div className="text-[11px] text-gray-400 font-mono">{d.symbol}</div></td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">{d.clientName}</td>
                    <td className="px-3 py-2.5 text-center"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d.dealType === "BUY" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{d.dealType}</span></td>
                    <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{Number(d.qty).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-900">₹{Number(d.price).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm text-right tabular-nums font-semibold text-gray-900">{d.valueCr ? `₹${Number(d.valueCr).toFixed(1)} Cr` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
