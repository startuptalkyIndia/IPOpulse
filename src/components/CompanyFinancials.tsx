"use client";

import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, BarChart3, Wallet, Layers, Activity } from "lucide-react";

// ─── Types (must match the server-side fetch in ticker page.tsx) ─────────────

export interface QuarterlyRow {
  quarter: string;
  sales: number | null;
  operatingProfit: number | null;
  opm: number | null;
  netProfit: number | null;
  eps: number | null;
}

export interface AnnualRow {
  fiscalYear: string;
  sales: number | null;
  operatingProfit: number | null;
  opm: number | null;
  netProfit: number | null;
  eps: number | null;
  dividendPayout: number | null;
  equityCapital: number | null;
  reserves: number | null;
  borrowings: number | null;
  fixedAssets: number | null;
  investments: number | null;
  otherAssets: number | null;
  totalAssets: number | null;
  cashFromOps: number | null;
  cashFromInvesting: number | null;
  cashFromFinancing: number | null;
  netCashFlow: number | null;
  roe: number | null;
  roce: number | null;
}

interface Props {
  quarters: QuarterlyRow[];   // newest last
  annual: AnnualRow[];        // newest last
}

const TABS = [
  { key: "quarterly", label: "Quarterly", icon: TrendingUp },
  { key: "pnl",       label: "P&L",       icon: BarChart3 },
  { key: "balance",   label: "Balance",   icon: Wallet },
  { key: "cashflow",  label: "Cash Flow", icon: Activity },
  { key: "ratios",    label: "Ratios",    icon: Layers },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function fmt(v: number | null | undefined, digits = 0): string {
  if (v == null) return "—";
  return v.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export function CompanyFinancials({ quarters, annual }: Props) {
  const [tab, setTab] = useState<TabKey>("quarterly");

  if (quarters.length === 0 && annual.length === 0) {
    return null; // Don't render if no data
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">Financials</h2>
        <span className="text-[10px] text-gray-400">Source: Screener.in · updated weekly</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto -mx-1 px-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-3 h-3" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        {tab === "quarterly" && <QuarterlyView rows={quarters} />}
        {tab === "pnl" && <AnnualPnLView rows={annual} />}
        {tab === "balance" && <BalanceSheetView rows={annual} />}
        {tab === "cashflow" && <CashFlowView rows={annual} />}
        {tab === "ratios" && <RatiosView rows={annual} />}
      </div>
    </section>
  );
}

// ─── Quarterly view ──────────────────────────────────────────────────────────

function QuarterlyView({ rows }: { rows: QuarterlyRow[] }) {
  if (rows.length === 0) return <Empty label="quarterly results" />;
  // Show last 8 quarters in chart
  const chartData = rows.slice(-8).map((r) => ({
    name: r.quarter.replace(/^(\w{3})\w*\s+(\d{4})$/, "$1 $2"),
    Sales: r.sales,
    "Net Profit": r.netProfit,
  }));
  const opmData = rows.slice(-8).map((r) => ({
    name: r.quarter.replace(/^(\w{3})\w*\s+(\d{4})$/, "$1 $2"),
    OPM: r.opm,
  }));

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">Sales & Net Profit (₹ Cr)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip wrapperClassName="!text-xs" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Sales" fill="#6366f1" />
              <Bar dataKey="Net Profit" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">Operating Margin %</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={opmData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip wrapperClassName="!text-xs" />
              <Line type="monotone" dataKey="OPM" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left px-2 py-2 font-medium">Metric (₹ Cr)</th>
              {rows.slice(-8).map((r) => <th key={r.quarter} className="text-right px-2 py-2 font-medium tabular-nums">{r.quarter}</th>)}
            </tr>
          </thead>
          <tbody>
            <FinRow label="Sales"          values={rows.slice(-8).map(r => r.sales)} />
            <FinRow label="Operating Profit" values={rows.slice(-8).map(r => r.operatingProfit)} />
            <FinRow label="OPM %"          values={rows.slice(-8).map(r => r.opm)} unit="%" />
            <FinRow label="Net Profit"     values={rows.slice(-8).map(r => r.netProfit)} highlight />
            <FinRow label="EPS (₹)"        values={rows.slice(-8).map(r => r.eps)} digits={2} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Annual P&L view ─────────────────────────────────────────────────────────

function AnnualPnLView({ rows }: { rows: AnnualRow[] }) {
  if (rows.length === 0) return <Empty label="annual P&L" />;
  const chartData = rows.slice(-10).map((r) => ({
    name: r.fiscalYear.replace(/^(\w{3})\w*\s+(\d{4})$/, "$2"),
    Sales: r.sales,
    "Net Profit": r.netProfit,
  }));

  return (
    <div>
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-500 mb-2">Annual Sales & Profit (₹ Cr, last 10 years)</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip wrapperClassName="!text-xs" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Sales" fill="#6366f1" />
            <Bar dataKey="Net Profit" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left px-2 py-2 font-medium">Metric (₹ Cr)</th>
              {rows.slice(-10).map((r) => <th key={r.fiscalYear} className="text-right px-2 py-2 font-medium tabular-nums">{r.fiscalYear}</th>)}
            </tr>
          </thead>
          <tbody>
            <FinRow label="Sales"          values={rows.slice(-10).map(r => r.sales)} />
            <FinRow label="Operating Profit" values={rows.slice(-10).map(r => r.operatingProfit)} />
            <FinRow label="OPM %"          values={rows.slice(-10).map(r => r.opm)} unit="%" />
            <FinRow label="Net Profit"     values={rows.slice(-10).map(r => r.netProfit)} highlight />
            <FinRow label="EPS (₹)"        values={rows.slice(-10).map(r => r.eps)} digits={2} />
            <FinRow label="Dividend Payout %" values={rows.slice(-10).map(r => r.dividendPayout)} unit="%" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Balance Sheet view ──────────────────────────────────────────────────────

function BalanceSheetView({ rows }: { rows: AnnualRow[] }) {
  if (rows.length === 0 || rows.every(r => r.totalAssets == null)) return <Empty label="balance sheet" />;

  const chartData = rows.slice(-10).map((r) => ({
    name: r.fiscalYear.replace(/^(\w{3})\w*\s+(\d{4})$/, "$2"),
    "Reserves": r.reserves,
    "Borrowings": r.borrowings,
  }));

  return (
    <div>
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-500 mb-2">Reserves vs Borrowings (₹ Cr)</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip wrapperClassName="!text-xs" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Reserves" fill="#10b981" />
            <Bar dataKey="Borrowings" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left px-2 py-2 font-medium">Metric (₹ Cr)</th>
              {rows.slice(-10).map((r) => <th key={r.fiscalYear} className="text-right px-2 py-2 font-medium tabular-nums">{r.fiscalYear}</th>)}
            </tr>
          </thead>
          <tbody>
            <FinRow label="Equity Capital" values={rows.slice(-10).map(r => r.equityCapital)} />
            <FinRow label="Reserves"       values={rows.slice(-10).map(r => r.reserves)} highlight />
            <FinRow label="Borrowings"     values={rows.slice(-10).map(r => r.borrowings)} />
            <FinRow label="Fixed Assets"   values={rows.slice(-10).map(r => r.fixedAssets)} />
            <FinRow label="Investments"    values={rows.slice(-10).map(r => r.investments)} />
            <FinRow label="Other Assets"   values={rows.slice(-10).map(r => r.otherAssets)} />
            <FinRow label="Total Assets"   values={rows.slice(-10).map(r => r.totalAssets)} highlight />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Cash Flow view ──────────────────────────────────────────────────────────

function CashFlowView({ rows }: { rows: AnnualRow[] }) {
  if (rows.length === 0 || rows.every(r => r.cashFromOps == null)) return <Empty label="cash flow" />;

  const chartData = rows.slice(-10).map((r) => ({
    name: r.fiscalYear.replace(/^(\w{3})\w*\s+(\d{4})$/, "$2"),
    "Operating": r.cashFromOps,
    "Investing": r.cashFromInvesting,
    "Financing": r.cashFromFinancing,
  }));

  return (
    <div>
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-500 mb-2">Cash Flow Breakdown (₹ Cr)</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip wrapperClassName="!text-xs" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Operating" fill="#10b981" />
            <Bar dataKey="Investing" fill="#6366f1" />
            <Bar dataKey="Financing" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left px-2 py-2 font-medium">Metric (₹ Cr)</th>
              {rows.slice(-10).map((r) => <th key={r.fiscalYear} className="text-right px-2 py-2 font-medium tabular-nums">{r.fiscalYear}</th>)}
            </tr>
          </thead>
          <tbody>
            <FinRow label="Cash from Ops"        values={rows.slice(-10).map(r => r.cashFromOps)} highlight />
            <FinRow label="Cash from Investing"  values={rows.slice(-10).map(r => r.cashFromInvesting)} />
            <FinRow label="Cash from Financing"  values={rows.slice(-10).map(r => r.cashFromFinancing)} />
            <FinRow label="Net Cash Flow"        values={rows.slice(-10).map(r => r.netCashFlow)} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Ratios view ─────────────────────────────────────────────────────────────

function RatiosView({ rows }: { rows: AnnualRow[] }) {
  if (rows.length === 0 || rows.every(r => r.roe == null)) return <Empty label="ratio trends" />;

  const chartData = rows.slice(-10).map((r) => ({
    name: r.fiscalYear.replace(/^(\w{3})\w*\s+(\d{4})$/, "$2"),
    ROE: r.roe,
    ROCE: r.roce,
  }));

  return (
    <div>
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-500 mb-2">ROE & ROCE Trend (last 10 years, %)</div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip wrapperClassName="!text-xs" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="ROE" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="ROCE" stroke="#6366f1" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left px-2 py-2 font-medium">Ratio</th>
              {rows.slice(-10).map((r) => <th key={r.fiscalYear} className="text-right px-2 py-2 font-medium tabular-nums">{r.fiscalYear}</th>)}
            </tr>
          </thead>
          <tbody>
            <FinRow label="ROE %"  values={rows.slice(-10).map(r => r.roe)}  unit="%" digits={1} highlight />
            <FinRow label="ROCE %" values={rows.slice(-10).map(r => r.roce)} unit="%" digits={1} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FinRow({
  label, values, unit = "", digits = 0, highlight = false,
}: { label: string; values: (number | null)[]; unit?: string; digits?: number; highlight?: boolean }) {
  return (
    <tr className={`border-b border-gray-100 ${highlight ? "bg-indigo-50/30 font-medium" : ""}`}>
      <td className="text-left px-2 py-2 text-gray-700">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="text-right px-2 py-2 tabular-nums text-gray-900">
          {v == null ? "—" : `${fmt(v, digits)}${unit}`}
        </td>
      ))}
    </tr>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-center py-10 text-xs text-gray-400">
      {label} data not yet captured for this company. Refreshes every Sunday for top 200 companies.
    </div>
  );
}
