"use client";

import type { CalcInput } from "@/lib/calculators/types";
import { formatCurrency, formatPlain } from "@/lib/format";

interface Props {
  input: CalcInput;
  value: number;
  onChange: (v: number) => void;
}

export function NumberSliderInput({ input, value, onChange }: Props) {
  const displayValue = () => {
    if (input.format === "currency") return formatCurrency(value);
    if (input.format === "percent") return `${value}%`;
    if (input.format === "years") return `${value} yrs`;
    if (input.format === "months") return `${value} mo`;
    return formatPlain(value);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-700">{input.label}</label>
        <span className="text-sm font-semibold text-indigo-600 tabular-nums">{displayValue()}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={input.min}
          max={input.max}
          step={input.step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-indigo-600 h-2"
        />
        <input
          type="number"
          min={input.min}
          max={input.max}
          step={input.step}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!isNaN(n)) onChange(n);
          }}
          className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 tabular-nums">
        <span>{input.format === "currency" ? formatCurrency(input.min) : input.min}</span>
        <span>{input.format === "currency" ? formatCurrency(input.max) : input.max}</span>
      </div>
    </div>
  );
}
