"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/format";

interface State {
  realizedSTCG: number;
  realizedLTCG: number;
  unrealizedSTLoss: number;
  unrealizedLTLoss: number;
}

const DEFAULT: State = {
  realizedSTCG: 200000,
  realizedLTCG: 300000,
  unrealizedSTLoss: 80000,
  unrealizedLTLoss: 60000,
};

export function TaxHarvesterCalc() {
  const [s, setS] = useState<State>(DEFAULT);

  const result = useMemo(() => {
    // FY 2025-26 rates
    const STCG_RATE = 0.20;
    const LTCG_RATE = 0.125;
    const LTCG_EXEMPT = 125000;
    const CESS = 0.04;

    const taxBeforeBase = (() => {
      const stTax = Math.max(s.realizedSTCG, 0) * STCG_RATE;
      const ltTaxable = Math.max(s.realizedLTCG - LTCG_EXEMPT, 0);
      const ltTax = ltTaxable * LTCG_RATE;
      return (stTax + ltTax) * (1 + CESS);
    })();

    // Strategy: harvest STCG losses first (they offset both STCG and LTCG, and STCG is taxed higher)
    let stCarry = s.unrealizedSTLoss;
    let ltCarry = s.unrealizedLTLoss;

    // Step 1: Use STT loss to offset STCG (highest-rate tax)
    let netSTCG = s.realizedSTCG;
    if (stCarry > 0 && netSTCG > 0) {
      const used = Math.min(stCarry, netSTCG);
      netSTCG -= used;
      stCarry -= used;
    }

    // Step 2: Use remaining STT loss to offset LTCG (above ₹1.25L)
    let netLTCG = s.realizedLTCG;
    if (stCarry > 0 && netLTCG > LTCG_EXEMPT) {
      const used = Math.min(stCarry, netLTCG - LTCG_EXEMPT);
      netLTCG -= used;
      stCarry -= used;
    }

    // Step 3: Use LT loss to offset remaining LTCG above exemption
    if (ltCarry > 0 && netLTCG > LTCG_EXEMPT) {
      const used = Math.min(ltCarry, netLTCG - LTCG_EXEMPT);
      netLTCG -= used;
      ltCarry -= used;
    }

    const stTaxAfter = Math.max(netSTCG, 0) * STCG_RATE;
    const ltTaxableAfter = Math.max(netLTCG - LTCG_EXEMPT, 0);
    const ltTaxAfter = ltTaxableAfter * LTCG_RATE;
    const taxAfter = (stTaxAfter + ltTaxAfter) * (1 + CESS);
    const saving = taxBeforeBase - taxAfter;

    const harvestedST = s.unrealizedSTLoss - stCarry;
    const harvestedLT = s.unrealizedLTLoss - ltCarry;

    return {
      taxBefore: Math.round(taxBeforeBase),
      taxAfter: Math.round(taxAfter),
      saving: Math.round(saving),
      harvestedST: Math.round(harvestedST),
      harvestedLT: Math.round(harvestedLT),
      netSTCG: Math.round(netSTCG),
      netLTCG: Math.round(netLTCG),
    };
  }, [s]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Your numbers</h2>
        <Field label="Realised STCG (this FY)" v={s.realizedSTCG} onChange={(v) => setS((p) => ({ ...p, realizedSTCG: v }))} />
        <Field label="Realised LTCG (this FY)" v={s.realizedLTCG} onChange={(v) => setS((p) => ({ ...p, realizedLTCG: v }))} />
        <Field label="Unrealised short-term LOSSES" v={s.unrealizedSTLoss} onChange={(v) => setS((p) => ({ ...p, unrealizedSTLoss: v }))} />
        <Field label="Unrealised long-term LOSSES" v={s.unrealizedLTLoss} onChange={(v) => setS((p) => ({ ...p, unrealizedLTLoss: v }))} />
      </div>

      <div className="lg:col-span-3 space-y-4">
        <div className="card bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-500">Tax without harvesting</div>
              <div className="text-xl font-bold text-gray-900 tabular-nums mt-0.5">{formatCurrency(result.taxBefore)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Tax after harvesting</div>
              <div className="text-xl font-bold text-gray-900 tabular-nums mt-0.5">{formatCurrency(result.taxAfter)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">You save</div>
              <div className="text-2xl font-bold text-green-600 tabular-nums mt-0.5">{formatCurrency(result.saving)}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">What to book before March 31</h3>
          <div className="space-y-3">
            {result.harvestedST > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center text-xs font-bold flex-shrink-0">ST</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Book {formatCurrency(result.harvestedST)} of short-term losses</div>
                  <div className="text-xs text-gray-600">Sells offsetting your STCG (20% rate). Highest-impact harvest.</div>
                </div>
              </div>
            ) : null}
            {result.harvestedLT > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-xs font-bold flex-shrink-0">LT</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Book {formatCurrency(result.harvestedLT)} of long-term losses</div>
                  <div className="text-xs text-gray-600">Offsets remaining LTCG above the ₹1.25L exemption (12.5% rate).</div>
                </div>
              </div>
            ) : null}
            {result.harvestedST === 0 && result.harvestedLT === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No harvestable benefit found — your gains are already shielded by the ₹1.25L exemption or you have
                no losses to book.
              </div>
            ) : null}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Net position after harvest</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-500">Net STCG taxable</div>
              <div className="font-semibold text-gray-900 tabular-nums">{formatCurrency(result.netSTCG)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Net LTCG taxable (after ₹1.25L exempt)</div>
              <div className="font-semibold text-gray-900 tabular-nums">{formatCurrency(Math.max(result.netLTCG - 125000, 0))}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, v, onChange }: { label: string; v: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-indigo-600 tabular-nums">{formatCurrency(v)}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={5000000}
          step={5000}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-indigo-600 h-2"
        />
        <input
          type="number"
          min={0}
          step={1000}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-28 border border-gray-300 rounded-lg px-2 py-1 text-sm text-right tabular-nums"
        />
      </div>
    </div>
  );
}
