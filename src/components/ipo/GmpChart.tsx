"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export interface GmpPoint {
  date: string;
  gmp: number;
  label: string;
}

interface Props {
  data: GmpPoint[];
  priceBandHigh?: number;
}

export function GmpChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-lg">
        No GMP data yet.
      </div>
    );
  }

  const avg = data.reduce((s, p) => s + p.gmp, 0) / data.length;

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gmpFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" fontSize={10} tickLine={false} />
          <YAxis fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            formatter={(value) => [`₹${Number(value)}`, "GMP"]}
            contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
          />
          <ReferenceLine y={avg} stroke="#9ca3af" strokeDasharray="3 3" label={{ value: `Avg ₹${Math.round(avg)}`, fontSize: 10, fill: "#9ca3af", position: "right" }} />
          <Area type="monotone" dataKey="gmp" stroke="#4f46e5" strokeWidth={2} fill="url(#gmpFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
