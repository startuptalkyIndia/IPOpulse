export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Market Breadth — NSE advance/decline, new highs/lows, circuit breakers",
  description: "Daily NSE market breadth: advance/decline ratio, new 52-week highs and lows, stocks hitting upper and lower circuits. The health of the market beyond the index.",
  alternates: { canonical: "/market/breadth" },
};

export default async function MarketBreadthPage() {
  const latestDate = await prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
  if (!latestDate) return <div className="max-w-4xl mx-auto px-4 py-10 text-sm text-gray-500">No bhavcopy data yet. Populates after first ingestion.</div>;

  const todayRows = await prisma.bhavcopyDaily.findMany({
    where: { date: latestDate.date },
    select: { close: true, open: true, high: true, low: true, volume: true, companyId: true, company: { select: { name: true, nseSymbol: true, sector: true } } },
  });

  // Compute breadth metrics
  let advances = 0, declines = 0, unchanged = 0;
  const circuits52High: typeof todayRows = [];
  const circuits52Low: typeof todayRows = [];
  const upperCircuit: typeof todayRows = [];
  const lowerCircuit: typeof todayRows = [];

  // 52-week high/low from bhavcopy (approx: need 52w data; use available window)
  const oneYearAgo = new Date(latestDate.date.getTime() - 365 * 86400000);
  const fiftyTwoWeekRange = await prisma.bhavcopyDaily.groupBy({
    by: ["companyId"],
    where: { date: { gte: oneYearAgo } },
    _max: { close: true },
    _min: { close: true },
  });
  const rangeByCompany = new Map(fiftyTwoWeekRange.map((r) => [r.companyId, { max: Number(r._max.close ?? 0), min: Number(r._min.close ?? 0) }]));

  for (const row of todayRows) {
    const close = Number(row.close);
    const open = Number(row.open);
    const high = Number(row.high);
    const low = Number(row.low);

    // Advance/decline
    if (close > open) advances++;
    else if (close < open) declines++;
    else unchanged++;

    // Circuit breakers: close == high (upper circuit) or close == low (lower circuit)
    if (high > 0 && Math.abs(close - high) / high < 0.001) upperCircuit.push(row);
    if (low > 0 && Math.abs(close - low) / low < 0.001) lowerCircuit.push(row);

    // 52w high/low
    const range = rangeByCompany.get(row.companyId);
    if (range) {
      if (Math.abs(close - range.max) / range.max < 0.005) circuits52High.push(row);
      if (Math.abs(close - range.min) / range.min < 0.005) circuits52Low.push(row);
    }
  }

  const total = advances + declines + unchanged;
  const adRatio = declines > 0 ? (advances / declines).toFixed(2) : "∞";
  const sentiment = advances > declines * 1.5 ? "Bullish" : declines > advances * 1.5 ? "Bearish" : "Neutral";
  const sentimentColor = sentiment === "Bullish" ? "text-green-600" : sentiment === "Bearish" ? "text-red-600" : "text-yellow-600";
  const dateLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(latestDate.date);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Market Breadth</h1>
        <p className="text-sm text-gray-600">{dateLabel} · {total} NSE-listed stocks tracked</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card"><div className="text-xs text-gray-500">Advances</div><div className="text-2xl font-bold text-green-600 mt-0.5">{advances}</div></div>
        <div className="card"><div className="text-xs text-gray-500">Declines</div><div className="text-2xl font-bold text-red-600 mt-0.5">{declines}</div></div>
        <div className="card"><div className="text-xs text-gray-500">A/D Ratio</div><div className="text-2xl font-bold text-indigo-700 mt-0.5">{adRatio}</div></div>
        <div className="card"><div className="text-xs text-gray-500">Sentiment</div><div className={`text-xl font-bold mt-0.5 ${sentimentColor}`}>{sentiment}</div></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card bg-green-50 border-green-200"><div className="text-xs text-green-700">52-week highs</div><div className="text-2xl font-bold text-green-700 mt-0.5">{circuits52High.length}</div></div>
        <div className="card bg-red-50 border-red-200"><div className="text-xs text-red-700">52-week lows</div><div className="text-2xl font-bold text-red-700 mt-0.5">{circuits52Low.length}</div></div>
        <div className="card bg-green-50 border-green-200"><div className="text-xs text-green-700">Upper circuit</div><div className="text-2xl font-bold text-green-700 mt-0.5">{upperCircuit.length}</div></div>
        <div className="card bg-red-50 border-red-200"><div className="text-xs text-red-700">Lower circuit</div><div className="text-2xl font-bold text-red-700 mt-0.5">{lowerCircuit.length}</div></div>
      </div>

      {/* Circuit breakers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-green-800 mb-2">🟢 Upper circuit stocks ({upperCircuit.slice(0,20).length})</h3>
          <div className="divide-y divide-gray-100 text-sm">
            {upperCircuit.slice(0, 20).map((r) => (
              <div key={r.companyId} className="flex justify-between py-1.5">
                <span className="text-gray-900 font-medium">{r.company.name}</span>
                <span className="text-green-600 font-semibold tabular-nums">₹{Number(r.close).toFixed(2)}</span>
              </div>
            ))}
            {upperCircuit.length === 0 && <div className="text-gray-400 py-2 text-center">None today</div>}
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-red-800 mb-2">🔴 Lower circuit stocks ({lowerCircuit.slice(0,20).length})</h3>
          <div className="divide-y divide-gray-100 text-sm">
            {lowerCircuit.slice(0, 20).map((r) => (
              <div key={r.companyId} className="flex justify-between py-1.5">
                <span className="text-gray-900 font-medium">{r.company.name}</span>
                <span className="text-red-600 font-semibold tabular-nums">₹{Number(r.close).toFixed(2)}</span>
              </div>
            ))}
            {lowerCircuit.length === 0 && <div className="text-gray-400 py-2 text-center">None today</div>}
          </div>
        </div>
      </div>

      {/* 52-week breakouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">📈 52-week high breakouts</h3>
          <div className="divide-y divide-gray-100 text-sm">
            {circuits52High.slice(0, 15).map((r) => (
              <div key={r.companyId} className="flex justify-between py-1.5">
                <div><span className="text-gray-900 font-medium">{r.company.name}</span><span className="text-[11px] text-gray-400 ml-2">{r.company.sector}</span></div>
                <span className="text-green-600 font-semibold tabular-nums">₹{Number(r.close).toFixed(2)}</span>
              </div>
            ))}
            {circuits52High.length === 0 && <div className="text-gray-400 py-2 text-center">None today</div>}
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">📉 52-week low breakdowns</h3>
          <div className="divide-y divide-gray-100 text-sm">
            {circuits52Low.slice(0, 15).map((r) => (
              <div key={r.companyId} className="flex justify-between py-1.5">
                <div><span className="text-gray-900 font-medium">{r.company.name}</span><span className="text-[11px] text-gray-400 ml-2">{r.company.sector}</span></div>
                <span className="text-red-600 font-semibold tabular-nums">₹{Number(r.close).toFixed(2)}</span>
              </div>
            ))}
            {circuits52Low.length === 0 && <div className="text-gray-400 py-2 text-center">None today</div>}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">Data from NSE EOD bhavcopy. Circuit breakers computed as close ≈ intraday high/low (within 0.1%). 52-week range uses all available bhavcopy history.</p>
    </div>
  );
}
