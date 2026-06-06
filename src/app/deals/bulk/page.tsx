export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Bulk Deals Today — NSE bulk deal data, who bought what",
  description: "Live NSE bulk deal data. See which institutions, promoters, and large investors are buying or selling more than 0.5% of a company's shares. Updated daily after market close.",
  alternates: { canonical: "/deals/bulk" },
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export default async function BulkDealsPage() {
  const past30 = new Date(Date.now() - 30 * 86400000);
  const deals = await prisma.bulkDeal.findMany({
    where: { date: { gte: past30 } },
    orderBy: [{ date: "desc" }, { valueCr: "desc" }],
    take: 200,
  });

  const today = deals.filter((d) => d.date.toDateString() === new Date().toDateString());
  const past = deals.filter((d) => d.date.toDateString() !== new Date().toDateString());

  function DealTable({ rows }: { rows: typeof deals }) {
    if (!rows.length) return <div className="card text-center py-8 text-sm text-gray-500">No bulk deals in this period.</div>;
    return (
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
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{fmtDate(d.date)}</td>
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Bulk Deals</h1>
        <p className="text-sm text-gray-600 max-w-3xl">A bulk deal occurs when a single party trades more than 0.5% of a company's equity in a session. Required to be disclosed to NSE. Updated daily after 5pm. <Link href="/deals/block" className="text-indigo-600 hover:underline">Block deals →</Link></p>
      </div>
      {today.length > 0 && <><h2 className="text-lg font-semibold text-gray-900">Today</h2><DealTable rows={today} /></>}
      <h2 className="text-lg font-semibold text-gray-900">Last 30 days</h2>
      {deals.length === 0 ? (
        <div className="card text-center py-10 text-sm text-gray-500">
          No bulk deals (trades exceeding 0.5% of company equity) have been reported in the last 30 days. Bulk deal data is sourced from NSE/BSE end-of-day disclosures.
        </div>
      ) : <DealTable rows={past.slice(0, 100)} />}
    </div>
  );
}
