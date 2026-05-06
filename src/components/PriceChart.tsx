"use client";

import { useEffect, useState, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface ChartPoint { t: number; o: number; h: number; l: number; c: number; v: number; }

interface ChartData {
  symbol: string;
  ltp: number;
  prevClose: number;
  changePct: number;
  currency: string;
  points: ChartPoint[];
}

type Range = "5d" | "1mo" | "3mo" | "6mo" | "1y" | "5y";

const RANGES: { label: string; value: Range; interval: string }[] = [
  { label: "5D", value: "5d", interval: "1d" },
  { label: "1M", value: "1mo", interval: "1d" },
  { label: "3M", value: "3mo", interval: "1d" },
  { label: "6M", value: "6mo", interval: "1wk" },
  { label: "1Y", value: "1y", interval: "1wk" },
  { label: "5Y", value: "5y", interval: "1mo" },
];

function fmtDate(ts: number, range: Range): string {
  const d = new Date(ts);
  if (range === "5d") return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (range === "1mo" || range === "3mo") return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (range === "6mo" || range === "1y") return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function PriceChart({ symbol, name }: { symbol: string; name: string }) {
  const [range, setRange] = useState<Range>("1y");
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (r: Range) => {
    setLoading(true);
    setError(null);
    const cfg = RANGES.find((x) => x.value === r)!;
    try {
      const resp = await fetch(`/api/chart/${encodeURIComponent(symbol)}?range=${r}&interval=${cfg.interval}`);
      if (!resp.ok) throw new Error(`No price data for ${symbol}`);
      const json = await resp.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load chart");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => { load(range); }, [load, range]);

  const positive = (data?.changePct ?? 0) >= 0;
  const color = positive ? "#16a34a" : "#dc2626";
  const fillColor = positive ? "#dcfce7" : "#fee2e2";

  const chartData = (data?.points ?? []).map((p) => ({
    date: fmtDate(p.t, range),
    close: Math.round(p.c * 100) / 100,
    volume: p.v,
  }));

  return (
    <div className="card space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-gray-500">{name}</div>
          {data ? (
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-gray-900 tabular-nums">
                ₹{data.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-semibold inline-flex items-center gap-1 ${positive ? "text-green-600" : "text-red-600"}`}>
                {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {positive ? "+" : ""}{data.changePct.toFixed(2)}%
              </span>
              <span className="text-xs text-gray-400">(over {range})</span>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-400"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</div>
          ) : (
            <div className="text-sm text-gray-400 mt-1">{error ?? "—"}</div>
          )}
        </div>

        {/* Range selector */}
        <div className="inline-flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => { setRange(r.value); load(r.value); }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${range === r.value ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price chart */}
      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-300">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">{error ?? "No data available"}</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} width={55} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                formatter={(v) => [`₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, "Close"] as [string, string]}
              />
              <Area type="monotone" dataKey="close" stroke={color} strokeWidth={2} fill={`url(#gradient-${symbol})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Volume chart */}
          <ResponsiveContainer width="100%" height={50}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Bar dataKey="volume" fill="#e0e7ff" radius={[1, 1, 0, 0]} />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6, borderColor: "#e5e7eb" }}
                formatter={(v) => [`${(Number(v) / 1e5).toFixed(1)}L shares`, "Volume"] as [string, string]}
              />
            </BarChart>
          </ResponsiveContainer>

          <p className="text-[10px] text-gray-400">
            ~15 min delayed · Source: Yahoo Finance · {data?.currency ?? "INR"}
          </p>
        </>
      )}
    </div>
  );
}
