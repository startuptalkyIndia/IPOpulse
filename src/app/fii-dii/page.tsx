export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { FiiDiiChart } from "@/components/fii-dii/FiiDiiChart";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "FII DII Activity Today — daily flows, F&O participation, FPI AUC",
  description:
    "FII and DII daily cash activity, F&O client-type OI, and monthly FPI AUC from NSE & NSDL. 20-year history with sector-wise FPI flows.",
};

interface DayRow {
  date: string;
  fiiNet: number;
  diiNet: number;
}

function Card({ title, value, delta, isNet = true }: { title: string; value: number; delta?: string; isNet?: boolean }) {
  const positive = value >= 0;
  const Icon = !isNet ? TrendingUp : positive ? ArrowUpRight : ArrowDownRight;
  const color = !isNet ? "text-gray-700 bg-gray-50" : positive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{title}</span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className={`text-xl font-bold tabular-nums ${isNet ? (positive ? "text-green-600" : "text-red-600") : "text-gray-900"}`}>
        {positive || !isNet ? "" : ""}{formatCurrency(value)}
      </div>
      {delta ? <div className="text-xs text-gray-400 mt-0.5">{delta}</div> : null}
    </div>
  );
}

export default async function FiiDiiPage() {
  const cashRecent = await prisma.fiiDiiDaily.findMany({
    where: { segment: "cash" },
    orderBy: { date: "desc" },
    take: 30,
  });

  const today = cashRecent[0];
  const sortedAsc = [...cashRecent].reverse();
  const monthFiiNet = cashRecent.reduce((s, r) => s + Number(r.fiiNet ?? 0), 0);
  const monthDiiNet = cashRecent.reduce((s, r) => s + Number(r.diiNet ?? 0), 0);

  const chartData: DayRow[] = sortedAsc.map((r) => ({
    date: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(r.date),
    fiiNet: Number(r.fiiNet ?? 0),
    diiNet: Number(r.diiNet ?? 0),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">FII / DII Activity</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Daily foreign and domestic institutional flows in Indian equities. Sourced from NSE provisional
          data (daily cash) and NSDL (monthly FPI AUC with sector-wise breakdown).
        </p>
      </div>

      {today ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card title="FII net (today)" value={Number(today.fiiNet ?? 0)} />
          <Card title="DII net (today)" value={Number(today.diiNet ?? 0)} />
          <Card title="FII net (30d)" value={monthFiiNet} />
          <Card title="DII net (30d)" value={monthDiiNet} />
        </div>
      ) : (
        <div className="card text-center py-10 text-sm text-gray-500">
          Daily FII/DII data pipeline is wiring up. Check back once the NSE scraper cron goes live.
        </div>
      )}

      {chartData.length > 1 ? (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Daily net flow (last 30 days)</h2>
          <FiiDiiChart data={chartData} />
          <p className="text-[11px] text-gray-400 mt-2">
            Source: NSE provisional figures (`fiidiiTradeReact` endpoint). Values in ₹ crore.
          </p>
        </div>
      ) : null}

      {cashRecent.length > 0 ? (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Daily activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3 text-right">FII buy</th>
                  <th className="py-2 pr-3 text-right">FII sell</th>
                  <th className="py-2 pr-3 text-right">FII net</th>
                  <th className="py-2 pr-3 text-right">DII buy</th>
                  <th className="py-2 pr-3 text-right">DII sell</th>
                  <th className="py-2 text-right">DII net</th>
                </tr>
              </thead>
              <tbody>
                {cashRecent.map((r) => {
                  const fiiNet = Number(r.fiiNet ?? 0);
                  const diiNet = Number(r.diiNet ?? 0);
                  return (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="py-2.5 pr-3 text-sm text-gray-700">
                        {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(r.date)}
                      </td>
                      <td className="py-2.5 pr-3 text-sm text-gray-700 text-right tabular-nums">{formatCurrency(Number(r.fiiBuy ?? 0))}</td>
                      <td className="py-2.5 pr-3 text-sm text-gray-700 text-right tabular-nums">{formatCurrency(Number(r.fiiSell ?? 0))}</td>
                      <td className={`py-2.5 pr-3 text-sm text-right tabular-nums font-semibold ${fiiNet >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(fiiNet)}
                      </td>
                      <td className="py-2.5 pr-3 text-sm text-gray-700 text-right tabular-nums">{formatCurrency(Number(r.diiBuy ?? 0))}</td>
                      <td className="py-2.5 pr-3 text-sm text-gray-700 text-right tabular-nums">{formatCurrency(Number(r.diiSell ?? 0))}</td>
                      <td className={`py-2.5 text-sm text-right tabular-nums font-semibold ${diiNet >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(diiNet)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
