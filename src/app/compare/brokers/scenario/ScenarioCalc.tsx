"use client";

import { useMemo, useState } from "react";
import { brokers, type Broker } from "@/lib/compare-data";
import { formatCurrency } from "@/lib/format";

interface BrokerSchedule {
  amcAnnual: number;
  delivBrokerage: (turnover: number, orders: number) => number;
  intradayBrokerage: (turnover: number, orders: number) => number;
  fnoBrokerage: (orders: number) => number;
  dpChargePerScrip: number; // per-sell debit, ₹
}

// Embedded simplified rate cards (close to real fees as of Apr 2026)
const SCHEDULES: Record<string, BrokerSchedule> = {
  zerodha: { amcAnnual: 300, delivBrokerage: () => 0, intradayBrokerage: (_t, n) => Math.min(20 * n, 20 * n), fnoBrokerage: (n) => 20 * n, dpChargePerScrip: 13.5 },
  groww: { amcAnnual: 0, delivBrokerage: (t, n) => Math.min(20 * n, t * 0.001), intradayBrokerage: (t, n) => Math.min(20 * n, t * 0.0005), fnoBrokerage: (n) => 20 * n, dpChargePerScrip: 13.5 },
  upstox: { amcAnnual: 150, delivBrokerage: (t, n) => Math.min(20 * n, t * 0.00025), intradayBrokerage: (_t, n) => 20 * n, fnoBrokerage: (n) => 20 * n, dpChargePerScrip: 18.5 },
  "angel-one": { amcAnnual: 240, delivBrokerage: () => 0, intradayBrokerage: (_t, n) => 20 * n, fnoBrokerage: (n) => 20 * n, dpChargePerScrip: 13.5 },
  dhan: { amcAnnual: 0, delivBrokerage: () => 0, intradayBrokerage: (_t, n) => 20 * n, fnoBrokerage: (n) => 20 * n, dpChargePerScrip: 13.5 },
  "icici-direct": {
    amcAnnual: 700,
    delivBrokerage: (t) => t * 0.00275,
    intradayBrokerage: (t) => t * 0.00275,
    fnoBrokerage: (n) => 35 * n,
    dpChargePerScrip: 25,
  },
};

// Statutory charges (apply to all brokers)
function statutory(turnover: number, isIntraday: boolean, isFno: boolean): number {
  const stt = isFno ? turnover * 0.000125 : isIntraday ? turnover * 0.00025 : turnover * 0.001;
  const exchange = turnover * 0.0000297;
  const sebi = turnover * 0.000001;
  const stamp = turnover * (isIntraday || isFno ? 0.00003 : 0.00015);
  return stt + exchange + sebi + stamp;
}

interface Inputs {
  delivOrders: number;
  delivAvgValue: number;
  intradayOrders: number;
  intradayAvgValue: number;
  fnoOrders: number;
  sellsPerMonth: number;
}

const DEFAULT: Inputs = {
  delivOrders: 5,
  delivAvgValue: 25000,
  intradayOrders: 10,
  intradayAvgValue: 50000,
  fnoOrders: 0,
  sellsPerMonth: 3,
};

interface BrokerCost {
  broker: Broker;
  amc: number;
  brokerageDeliv: number;
  brokerageIntraday: number;
  brokerageFno: number;
  dp: number;
  statutory: number;
  gst: number;
  total: number;
}

function calcAnnual(broker: Broker, inputs: Inputs): BrokerCost {
  const sched = SCHEDULES[broker.slug];
  const months = 12;

  const delivTurnover = inputs.delivOrders * inputs.delivAvgValue * months;
  const intradayTurnover = inputs.intradayOrders * inputs.intradayAvgValue * months;
  const fnoTurnover = inputs.fnoOrders * 100000 * months; // assume ₹1L per F&O contract turnover

  const brokerageDeliv = sched.delivBrokerage(delivTurnover, inputs.delivOrders * months);
  const brokerageIntraday = sched.intradayBrokerage(intradayTurnover, inputs.intradayOrders * months);
  const brokerageFno = sched.fnoBrokerage(inputs.fnoOrders * months);
  const totalBrokerage = brokerageDeliv + brokerageIntraday + brokerageFno;

  const dp = sched.dpChargePerScrip * inputs.sellsPerMonth * months;

  const stat = statutory(delivTurnover, false, false) + statutory(intradayTurnover, true, false) + statutory(fnoTurnover, false, true);

  const exchangeOnly = (delivTurnover + intradayTurnover + fnoTurnover) * 0.0000297;
  const sebiOnly = (delivTurnover + intradayTurnover + fnoTurnover) * 0.000001;
  const gst = (totalBrokerage + exchangeOnly + sebiOnly) * 0.18;

  const total = sched.amcAnnual + totalBrokerage + dp + stat + gst;

  return {
    broker,
    amc: sched.amcAnnual,
    brokerageDeliv: Math.round(brokerageDeliv),
    brokerageIntraday: Math.round(brokerageIntraday),
    brokerageFno: Math.round(brokerageFno),
    dp: Math.round(dp),
    statutory: Math.round(stat),
    gst: Math.round(gst),
    total: Math.round(total),
  };
}

export function ScenarioCalc() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT);

  const results = useMemo(() => {
    return brokers.map((b) => calcAnnual(b, inputs)).sort((a, b) => a.total - b.total);
  }, [inputs]);

  const cheapest = results[0];
  const dearest = results[results.length - 1];
  const savings = dearest.total - cheapest.total;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your trading style</h2>
        <Field label="Delivery orders / month" v={inputs.delivOrders} onChange={(v) => setInputs((s) => ({ ...s, delivOrders: v }))} max={200} step={1} />
        <Field label="Avg delivery order value (₹)" v={inputs.delivAvgValue} onChange={(v) => setInputs((s) => ({ ...s, delivAvgValue: v }))} max={1000000} step={500} prefix="₹" />
        <Field label="Intraday orders / month" v={inputs.intradayOrders} onChange={(v) => setInputs((s) => ({ ...s, intradayOrders: v }))} max={1000} step={1} />
        <Field label="Avg intraday order value (₹)" v={inputs.intradayAvgValue} onChange={(v) => setInputs((s) => ({ ...s, intradayAvgValue: v }))} max={5000000} step={1000} prefix="₹" />
        <Field label="F&O orders / month" v={inputs.fnoOrders} onChange={(v) => setInputs((s) => ({ ...s, fnoOrders: v }))} max={500} step={1} />
        <Field label="Demat sells / month (DP charge)" v={inputs.sellsPerMonth} onChange={(v) => setInputs((s) => ({ ...s, sellsPerMonth: v }))} max={50} step={1} />
      </div>

      <div className="lg:col-span-3 space-y-4">
        <div className="card bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Cheapest for your style</div>
              <div className="text-xl font-bold text-gray-900">{cheapest.broker.name}</div>
              <div className="text-xs text-indigo-700 mt-1">{formatCurrency(cheapest.total)} per year</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">vs most expensive ({dearest.broker.name})</div>
              <div className="text-2xl font-bold text-green-600 tabular-nums">−{formatCurrency(savings)}</div>
              <div className="text-[11px] text-gray-500">/ year</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Broker</th>
                <th className="px-3 py-2.5 text-right">AMC</th>
                <th className="px-3 py-2.5 text-right">Brokerage</th>
                <th className="px-3 py-2.5 text-right">DP</th>
                <th className="px-3 py-2.5 text-right">Stat. + GST</th>
                <th className="px-3 py-2.5 text-right">Total / yr</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.broker.slug} className={`border-b border-gray-100 ${i === 0 ? "bg-green-50" : ""}`}>
                  <td className="px-3 py-2.5 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.broker.name}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700 text-right tabular-nums">{formatCurrency(r.amc)}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700 text-right tabular-nums">
                    {formatCurrency(r.brokerageDeliv + r.brokerageIntraday + r.brokerageFno)}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700 text-right tabular-nums">{formatCurrency(r.dp)}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700 text-right tabular-nums">{formatCurrency(r.statutory + r.gst)}</td>
                  <td className="px-3 py-2.5 text-sm text-right tabular-nums font-semibold text-gray-900">{formatCurrency(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed">
          Calculated using April 2026 published rate cards. Includes brokerage, AMC, DP charges (SELL only),
          STT, exchange transaction charges, SEBI turnover fee, stamp duty, and 18% GST. Excludes margin call
          charges, call-trade fees, and AMC-waiver promotions. Real costs may vary 5-10% depending on segment mix.
        </p>
      </div>
    </div>
  );
}

function Field({ label, v, onChange, max, step, prefix }: { label: string; v: number; onChange: (v: number) => void; max: number; step: number; prefix?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-indigo-600 tabular-nums">
          {prefix}
          {v.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input type="range" min={0} max={max} step={step} value={v} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-indigo-600 h-2" />
        <input type="number" min={0} max={max} step={step} value={v} onChange={(e) => onChange(Number(e.target.value))} className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm text-right tabular-nums" />
      </div>
    </div>
  );
}
