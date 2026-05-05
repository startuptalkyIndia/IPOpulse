"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

interface Point {
  capturedAt: string;        // ISO date string from server
  retailX: number | null;
  hniX: number | null;
  qibX: number | null;
  totalX: number | null;
}

export function SubscriptionVelocity({ points }: { points: Point[] }) {
  if (points.length < 2) return null;

  const data = points
    .slice()
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
    .map((p) => ({
      label: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(p.capturedAt)),
      retail: p.retailX,
      hni: p.hniX,
      qib: p.qibX,
      total: p.totalX,
    }));

  const last = data[data.length - 1];
  const first = data[0];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 inline-flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> Subscription velocity
        </h3>
        <div className="text-[11px] text-gray-500">
          {data.length} snapshots from {first.label} → {last.label}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -8, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v) => `${v}×`} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e5e7eb" }}
            formatter={(value, name) => [`${Number(value).toFixed(2)}×`, String(name).toUpperCase()]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="retail" name="Retail" stroke="#16a34a" strokeWidth={2} dot={false} connectNulls />
          <Line type="monotone" dataKey="hni" name="HNI" stroke="#ca8a04" strokeWidth={2} dot={false} connectNulls />
          <Line type="monotone" dataKey="qib" name="QIB" stroke="#4f46e5" strokeWidth={2} dot={false} connectNulls />
          <Line type="monotone" dataKey="total" name="Total" stroke="#111827" strokeWidth={2} strokeDasharray="4 2" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-gray-500 mt-2">
        How subscription has built across categories during the IPO window. Useful for last-day applicants — high
        late-cycle QIB/HNI moves often signal strong listing demand.
      </p>
    </div>
  );
}
