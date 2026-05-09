"use client";

import { useState, useMemo } from "react";
import { formatCurrencyFull } from "@/lib/format";

interface EquityState {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  holdingMonths: number;
}

interface DebtState {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  holdingMonths: number;
  slabRate: number;
}

const DEFAULT_EQUITY: EquityState = {
  buyPrice: 500,
  sellPrice: 750,
  quantity: 100,
  holdingMonths: 18,
};

const DEFAULT_DEBT: DebtState = {
  buyPrice: 1000,
  sellPrice: 1250,
  quantity: 500,
  holdingMonths: 30,
  slabRate: 20,
};

function calcEquity(s: EquityState) {
  const totalInvestment = s.buyPrice * s.quantity;
  const totalProceeds = s.sellPrice * s.quantity;
  const totalGain = totalProceeds - totalInvestment;
  const isLTCG = s.holdingMonths >= 12;

  let taxAmount = 0;
  let taxNote = "";
  if (totalGain <= 0) {
    taxAmount = 0;
    taxNote = "Loss — no tax";
  } else if (isLTCG) {
    const taxableGain = Math.max(totalGain - 125000, 0);
    taxAmount = taxableGain * 0.125;
    taxNote = `LTCG 12.5% on ₹${taxableGain.toLocaleString("en-IN")} (above ₹1.25L exemption)`;
  } else {
    taxAmount = totalGain * 0.20;
    taxNote = "STCG 20% flat (held < 12 months)";
  }

  const netProfit = totalGain - taxAmount;
  const effectiveTaxRate = totalGain > 0 ? (taxAmount / totalGain) * 100 : 0;

  return {
    totalInvestment,
    totalProceeds,
    totalGain,
    taxAmount,
    netProfit,
    effectiveTaxRate,
    isLTCG,
    taxNote,
  };
}

function calcDebt(s: DebtState) {
  const totalInvestment = s.buyPrice * s.quantity;
  const totalProceeds = s.sellPrice * s.quantity;
  const totalGain = totalProceeds - totalInvestment;

  let taxAmount = 0;
  let taxNote = "";
  if (totalGain <= 0) {
    taxAmount = 0;
    taxNote = "Loss — no tax";
  } else {
    taxAmount = totalGain * (s.slabRate / 100);
    taxNote = `Taxed at ${s.slabRate}% slab rate (no indexation post April 2023)`;
  }

  const netProfit = totalGain - taxAmount;
  const effectiveTaxRate = totalGain > 0 ? (taxAmount / totalGain) * 100 : 0;

  return {
    totalInvestment,
    totalProceeds,
    totalGain,
    taxAmount,
    netProfit,
    effectiveTaxRate,
    taxNote,
  };
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-1 border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
        {prefix && <span className="bg-gray-50 px-2 py-2 text-sm text-gray-500 border-r border-gray-300">{prefix}</span>}
        <input
          type="number"
          min={min ?? 0}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 px-3 py-2 text-sm text-gray-900 focus:outline-none"
        />
        {suffix && <span className="bg-gray-50 px-2 py-2 text-sm text-gray-500 border-l border-gray-300">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight, positive, negative }: { label: string; value: string; highlight?: boolean; positive?: boolean; negative?: boolean }) {
  const valueColor = positive ? "text-green-600" : negative ? "text-red-600" : highlight ? "text-indigo-700" : "text-gray-900";
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 ${highlight ? "font-semibold" : ""}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${valueColor}`}>{value}</span>
    </div>
  );
}

export function CapitalGainsCalc() {
  const [equity, setEquity] = useState<EquityState>(DEFAULT_EQUITY);
  const [debt, setDebt] = useState<DebtState>(DEFAULT_DEBT);

  const eq = useMemo(() => calcEquity(equity), [equity]);
  const dt = useMemo(() => calcDebt(debt), [debt]);

  return (
    <div className="space-y-8">
      {/* Equity / Mutual Fund Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">EQ</div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Equity / Mutual Fund</h2>
            <p className="text-xs text-gray-500">Stocks, equity MFs, ETFs — post July 2024 Budget rates</p>
          </div>
          <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${equity.holdingMonths >= 12 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {equity.holdingMonths >= 12 ? "LTCG" : "STCG"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <NumberInput
              label="Buy price per share / unit (₹)"
              value={equity.buyPrice}
              onChange={(v) => setEquity((p) => ({ ...p, buyPrice: v }))}
              prefix="₹"
              min={0.01}
              step={0.01}
            />
            <NumberInput
              label="Sell price per share / unit (₹)"
              value={equity.sellPrice}
              onChange={(v) => setEquity((p) => ({ ...p, sellPrice: v }))}
              prefix="₹"
              min={0.01}
              step={0.01}
            />
            <NumberInput
              label="Quantity (shares / units)"
              value={equity.quantity}
              onChange={(v) => setEquity((p) => ({ ...p, quantity: v }))}
              suffix="units"
              min={1}
            />
            <NumberInput
              label="Holding period"
              value={equity.holdingMonths}
              onChange={(v) => setEquity((p) => ({ ...p, holdingMonths: v }))}
              suffix="months"
              min={1}
            />
            <div className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
              {equity.holdingMonths >= 12
                ? `Held ${equity.holdingMonths} months — qualifies as LTCG (≥ 12 months)`
                : `Held ${equity.holdingMonths} months — STCG (< 12 months)`}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Results</h3>
            <ResultRow label="Total investment" value={`₹${eq.totalInvestment.toLocaleString("en-IN")}`} />
            <ResultRow label="Total proceeds" value={`₹${eq.totalProceeds.toLocaleString("en-IN")}`} />
            <ResultRow
              label="Total gain / loss"
              value={`₹${eq.totalGain.toLocaleString("en-IN")}`}
              positive={eq.totalGain > 0}
              negative={eq.totalGain < 0}
            />
            <ResultRow label="Tax amount" value={`₹${Math.round(eq.taxAmount).toLocaleString("en-IN")}`} negative={eq.taxAmount > 0} />
            <ResultRow
              label="Net profit after tax"
              value={`₹${Math.round(eq.netProfit).toLocaleString("en-IN")}`}
              highlight
              positive={eq.netProfit > 0}
              negative={eq.netProfit < 0}
            />
            <ResultRow label="Effective tax rate" value={`${eq.effectiveTaxRate.toFixed(2)}%`} />
            <div className="mt-3 text-xs text-gray-500 bg-white rounded-lg px-3 py-2 border border-gray-200">
              {eq.taxNote}
            </div>
          </div>
        </div>
      </div>

      {/* Debt / Gold / Other Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">DT</div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Debt / Gold / Other</h2>
            <p className="text-xs text-gray-500">Debt MFs, Gold, REITs (non-equity) — post April 2023 rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <NumberInput
              label="Buy price per unit (₹)"
              value={debt.buyPrice}
              onChange={(v) => setDebt((p) => ({ ...p, buyPrice: v }))}
              prefix="₹"
              min={0.01}
              step={0.01}
            />
            <NumberInput
              label="Sell price per unit (₹)"
              value={debt.sellPrice}
              onChange={(v) => setDebt((p) => ({ ...p, sellPrice: v }))}
              prefix="₹"
              min={0.01}
              step={0.01}
            />
            <NumberInput
              label="Quantity (units)"
              value={debt.quantity}
              onChange={(v) => setDebt((p) => ({ ...p, quantity: v }))}
              suffix="units"
              min={1}
            />
            <NumberInput
              label="Holding period (for reference only)"
              value={debt.holdingMonths}
              onChange={(v) => setDebt((p) => ({ ...p, holdingMonths: v }))}
              suffix="months"
              min={1}
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Your income tax slab rate</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 30].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setDebt((p) => ({ ...p, slabRate: rate }))}
                    className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      debt.slabRate === rate
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-amber-400"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">No indexation benefit. All gains taxed at slab rate.</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Results</h3>
            <ResultRow label="Total investment" value={`₹${dt.totalInvestment.toLocaleString("en-IN")}`} />
            <ResultRow label="Total proceeds" value={`₹${dt.totalProceeds.toLocaleString("en-IN")}`} />
            <ResultRow
              label="Total gain / loss"
              value={`₹${dt.totalGain.toLocaleString("en-IN")}`}
              positive={dt.totalGain > 0}
              negative={dt.totalGain < 0}
            />
            <ResultRow label="Tax amount" value={`₹${Math.round(dt.taxAmount).toLocaleString("en-IN")}`} negative={dt.taxAmount > 0} />
            <ResultRow
              label="Net profit after tax"
              value={`₹${Math.round(dt.netProfit).toLocaleString("en-IN")}`}
              highlight
              positive={dt.netProfit > 0}
              negative={dt.netProfit < 0}
            />
            <ResultRow label="Effective tax rate" value={`${dt.effectiveTaxRate.toFixed(2)}%`} />
            <div className="mt-3 text-xs text-gray-500 bg-white rounded-lg px-3 py-2 border border-gray-200">
              {dt.taxNote}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
