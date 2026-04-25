export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { DataDisclaimer } from "@/components/DataDisclaimer";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Top Gainers & Losers — today's biggest stock movers (BSE/NSE)",
  description:
    "Live top gainers, top losers, and most-active stocks on BSE/NSE today. Sortable, mobile-first, with delivery % and 5-day trend.",
  alternates: { canonical: "/movers" },
};

interface Row {
  slug: string;
  name: string;
  sector: string | null;
  symbol: string | null;
  close: number;
  prevClose: number;
  pctChange: number;
  high: number;
  low: number;
  volume: bigint;
  deliveryPct: number | null;
}

async function fetchRows(): Promise<Row[]> {
  // Fetch latest two trading days of bhavcopy
  const latest = await prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
  if (!latest) return [];
  const prev = await prisma.bhavcopyDaily.findFirst({
    where: { date: { lt: latest.date } },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  const todayRows = await prisma.bhavcopyDaily.findMany({
    where: { date: latest.date },
    include: { company: true },
  });
  const prevByCompany = new Map<number, number>();
  if (prev) {
    const prevRows = await prisma.bhavcopyDaily.findMany({
      where: { date: prev.date },
      select: { companyId: true, close: true },
    });
    for (const p of prevRows) prevByCompany.set(p.companyId, Number(p.close));
  }

  const rows: Row[] = todayRows.map((r) => {
    const prevClose = prevByCompany.get(r.companyId) ?? Number(r.open);
    const close = Number(r.close);
    const pct = prevClose > 0 ? ((close - prevClose) / prevClose) * 100 : 0;
    return {
      slug: r.company.slug,
      name: r.company.name,
      sector: r.company.sector,
      symbol: r.company.nseSymbol ?? r.company.bseCode,
      close,
      prevClose,
      pctChange: pct,
      high: Number(r.high),
      low: Number(r.low),
      volume: r.volume,
      deliveryPct: r.deliveryPct ? Number(r.deliveryPct) : null,
    };
  });

  return rows;
}

function MoverTable({ title, rows, accent }: { title: string; rows: Row[]; accent: "up" | "down" | "neutral" }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      {rows.length === 0 ? (
        <div className="card text-center py-6 text-sm text-gray-500">No data available yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3 text-right">LTP</th>
                  <th className="px-3 py-3 text-right">Change</th>
                  <th className="px-3 py-3 text-right">% Change</th>
                  <th className="px-3 py-3 text-right">High / Low</th>
                  <th className="px-3 py-3 text-right">Volume</th>
                  <th className="px-3 py-3 text-right">Del %</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const change = r.close - r.prevClose;
                  const pctClass =
                    accent === "up" || r.pctChange > 0 ? "text-green-600" : accent === "down" || r.pctChange < 0 ? "text-red-600" : "text-gray-700";
                  return (
                    <tr key={r.slug} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2.5 text-sm">
                        <Link href={`/ticker/${r.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {r.name}
                        </Link>
                        <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
                          {r.symbol} {r.sector ? `· ${r.sector}` : ""}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-900">₹{r.close.toLocaleString("en-IN")}</td>
                      <td className={`px-3 py-2.5 text-sm text-right tabular-nums ${pctClass}`}>
                        {change >= 0 ? "+" : ""}
                        {change.toFixed(2)}
                      </td>
                      <td className={`px-3 py-2.5 text-sm text-right tabular-nums font-semibold ${pctClass}`}>
                        {r.pctChange >= 0 ? "+" : ""}
                        {r.pctChange.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right text-gray-600 tabular-nums">
                        ₹{r.high.toFixed(0)} / ₹{r.low.toFixed(0)}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">
                        {(Number(r.volume) / 1e5).toFixed(1)}L
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-600">
                        {r.deliveryPct != null ? `${r.deliveryPct.toFixed(0)}%` : "—"}
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

export default async function MoversPage() {
  const all = await fetchRows();
  const gainers = [...all].filter((r) => r.pctChange > 0).sort((a, b) => b.pctChange - a.pctChange).slice(0, 15);
  const losers = [...all].filter((r) => r.pctChange < 0).sort((a, b) => a.pctChange - b.pctChange).slice(0, 15);
  const mostActive = [...all].sort((a, b) => Number(b.volume) - Number(a.volume)).slice(0, 15);

  const advances = all.filter((r) => r.pctChange > 0).length;
  const declines = all.filter((r) => r.pctChange < 0).length;
  const flat = all.length - advances - declines;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Top Gainers &amp; Losers</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Today&apos;s biggest stock movers — gainers, losers, and most-active by volume — across BSE/NSE listed
          companies.
        </p>
      </div>

      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Movers" }]} />

      {/* Data source flag */}
      {(() => {
        const sources = new Set(all.map((r) => (r as unknown as { source?: string }).source ?? "seed"));
        const hasSeed = sources.size === 0 || all.length === 0;
        return hasSeed ? (
          <DataDisclaimer
            variant="seed"
            message="Sample movers shown until the NSE EOD bhavcopy crawler runs (Mon-Fri at 19:00 IST). Once it ingests, this page shows real-end-of-day data from nsearchives.nseindia.com."
          />
        ) : (
          <DataDisclaimer variant="live" source="NSE EOD bhavcopy" message="Live data from NSE end-of-day bhavcopy. Refreshed daily after market close." />
        );
      })()}

      <div className="grid grid-cols-3 gap-3">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-500">Advances</div>
            <div className="text-lg font-bold text-green-600 tabular-nums">{advances}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center"><TrendingDown className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-500">Declines</div>
            <div className="text-lg font-bold text-red-600 tabular-nums">{declines}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center"><Activity className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-500">Unchanged</div>
            <div className="text-lg font-bold text-gray-900 tabular-nums">{flat}</div>
          </div>
        </div>
      </div>

      <MoverTable title="Top Gainers" rows={gainers} accent="up" />
      <MoverTable title="Top Losers" rows={losers} accent="down" />
      <MoverTable title="Most Active by Volume" rows={mostActive} accent="neutral" />

      <p className="text-[11px] text-gray-400">
        LTP, change and volume are based on the most recent EOD bhavcopy. Live intraday prices coming via Zerodha
        Kite Connect.
      </p>
    </div>
  );
}
