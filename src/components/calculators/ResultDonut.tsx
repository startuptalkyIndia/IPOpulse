"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

interface Props {
  invested: number;
  returns: number;
  investedLabel?: string;
  returnsLabel?: string;
}

export function ResultDonut({
  invested,
  returns,
  investedLabel = "Invested",
  returnsLabel = "Returns",
}: Props) {
  const data = [
    { name: investedLabel, value: Math.max(invested, 0) },
    { name: returnsLabel, value: Math.max(returns, 0) },
  ];

  const COLORS = ["#c7d2fe", "#4f46e5"]; // indigo-200, indigo-600

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 -mt-4">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
            <span className="text-xs text-gray-500">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
