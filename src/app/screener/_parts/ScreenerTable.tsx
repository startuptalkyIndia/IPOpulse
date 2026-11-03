"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { ScreenerCompany } from "./types";
import { GRADE_BADGE_COLORS } from "./constants";

export function ScreenerTable({ filtered }: { filtered: ScreenerCompany[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3 text-center" title="Composite Durability/Valuation/Momentum score — objective math, not advice">Quality</th>
              <th className="px-3 py-3">Sector</th>
              <th className="px-3 py-3 text-right">Market cap</th>
              <th className="px-3 py-3 text-right">LTP</th>
              <th className="px-3 py-3 text-right">1D %</th>
              <th className="px-3 py-3 text-right">52W Range</th>
              <th className="px-3 py-3 text-right">P/E</th>
              <th className="px-3 py-3 text-right">ROE %</th>
              <th className="px-3 py-3 text-right" title="Year-on-year revenue growth from annual financials">Rev YoY</th>
              <th className="px-3 py-3 text-right" title="1-year price return">1Y</th>
              <th className="px-3 py-3 text-center" title="Weinstein stage: 2=uptrend, 4=downtrend">Stage</th>
              <th className="px-3 py-3 text-right" title="14-period Relative Strength Index">RSI</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.slug} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/ticker/${c.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {c.name}
                    </Link>
                    {c.isMoat && <span title={c.moatNote ?? "Economic moat"} className="text-amber-500 text-xs">🏰</span>}
                    {c.cyclicalPeak && <span title="Cyclical-peak risk" className="text-xs">🌀</span>}
                    {(c.roeConsistentYrs ?? 0) >= 4 && <span title={`ROE ≥15% for ${c.roeConsistentYrs} years — consistent compounder`} className="text-emerald-600 text-xs">✓</span>}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{c.symbol ?? "—"}</div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {c.qualityGrade ? (
                    <span
                      title={`Quality Score: ${c.qualityOverall}/100`}
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${GRADE_BADGE_COLORS[c.qualityGrade] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                    >
                      {c.qualityGrade}
                    </span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{c.sector ?? "—"}</td>
                <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-900">
                  {c.marketCapCr ? formatCurrency(c.marketCapCr * 10000000) : "—"}
                </td>
                <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-700">
                  {c.ltp != null ? `₹${c.ltp.toLocaleString("en-IN")}` : "—"}
                </td>
                <td className={`px-3 py-2.5 text-xs text-right tabular-nums font-medium ${
                  c.chg1d == null ? "text-gray-400" : c.chg1d >= 0 ? "text-emerald-600" : "text-red-500"
                }`}>
                  {c.chg1d != null ? `${c.chg1d >= 0 ? "+" : ""}${c.chg1d.toFixed(2)}%` : "—"}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {c.ltp && c.high52w && c.low52w && c.high52w !== c.low52w ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-400 rounded-full"
                          style={{ width: `${Math.round(((c.ltp - c.low52w) / (c.high52w - c.low52w)) * 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-gray-400 tabular-nums">
                        ₹{c.low52w.toFixed(0)} – ₹{c.high52w.toFixed(0)}
                      </div>
                    </div>
                  ) : "—"}
                </td>
                <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{c.peRatio != null ? c.peRatio.toFixed(1) : "—"}</td>
                <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{c.roePercent != null ? c.roePercent.toFixed(1) : "—"}</td>
                <td className={`px-3 py-2.5 text-xs text-right tabular-nums ${
                  c.revYoy != null ? (c.revYoy >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium") : "text-gray-400"
                }`}>
                  {c.revYoy != null ? `${c.revYoy >= 0 ? "+" : ""}${c.revYoy.toFixed(1)}%` : "—"}
                </td>
                <td className={`px-3 py-2.5 text-xs text-right tabular-nums ${
                  c.ret1y != null ? (c.ret1y >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium") : "text-gray-400"
                }`}>
                  {c.ret1y != null ? `${c.ret1y >= 0 ? "+" : ""}${c.ret1y.toFixed(0)}%` : "—"}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {c.weinsteinStage != null ? (
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      c.weinsteinStage === 2 ? "bg-emerald-100 text-emerald-700" :
                      c.weinsteinStage === 1 ? "bg-blue-100 text-blue-700" :
                      c.weinsteinStage === 3 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>{c.weinsteinStage}</span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className={`px-3 py-2.5 text-xs text-right tabular-nums ${
                  c.rsi == null ? "text-gray-400" : c.rsi >= 70 ? "text-red-600" : c.rsi <= 30 ? "text-emerald-600" : "text-gray-700"
                }`}>
                  {c.rsi != null ? c.rsi.toFixed(0) : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-12 text-center text-sm text-gray-500">
                  No companies match these filters. Reset to see all.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
