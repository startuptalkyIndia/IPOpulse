"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { CalcBreakdownRow } from "@/lib/calculators/types";
import { formatCurrency } from "@/lib/format";

interface Props {
  data: CalcBreakdownRow[];
}

export function BreakdownChart({ data }: Props) {
  if (!data || data.length === 0) return null;
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="investedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="year" tickFormatter={(v) => `Y${v}`} fontSize={11} tickLine={false} />
          <YAxis
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => (v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${v / 1000}k`)}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(year) => `Year ${year}`}
            contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="invested"
            name="Invested"
            stroke="#a5b4fc"
            fill="url(#investedFill)"
            strokeWidth={2}
          />
          <Line type="monotone" dataKey="value" name="Value" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
