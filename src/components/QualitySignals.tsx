import { ShieldCheck, Droplets, Repeat, TrendingUp } from "lucide-react";
import type { QualitySignals as QS, CyclicalRead } from "@/lib/quality-signals";

/**
 * Displays multi-year quality signals + cyclical-peak read.
 * Factual metrics (ROE consistency, revenue CAGR, cash-backed earnings) — not advice.
 */

export function QualitySignals({ q, cyclical }: { q: QS | null; cyclical: CyclicalRead | null }) {
  // Nothing to show if no quality data AND no cyclical read
  if (!q && !cyclical) return null;

  const cashColor =
    q?.cashBacked === "strong" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    q?.cashBacked === "ok" ? "text-amber-700 bg-amber-50 border-amber-200" :
    q?.cashBacked === "weak" ? "text-red-700 bg-red-50 border-red-200" :
    "text-gray-500 bg-gray-50 border-gray-200";

  const cashLabel =
    q?.cashBacked === "strong" ? "Fully cash-backed" :
    q?.cashBacked === "ok" ? "Mostly cash-backed" :
    q?.cashBacked === "weak" ? "Accrual-heavy (watch)" : "—";

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Quality Signals
        </h2>
        <span className="text-[10px] text-gray-400">Multi-year consistency · Source: Screener annual data</span>
      </div>

      {/* Cyclical warning banner */}
      {cyclical && (
        <div className={`card mb-3 ${cyclical.severity === "warning" ? "bg-amber-50 border-amber-300" : "bg-blue-50 border-blue-200"}`}>
          <div className="flex items-start gap-2">
            <span className="text-base flex-shrink-0">{cyclical.badge}</span>
            <p className={`text-xs leading-relaxed ${cyclical.severity === "warning" ? "text-amber-900" : "text-blue-900"}`}>
              <span className="font-semibold">{cyclical.severity === "warning" ? "Cyclical-Peak Risk: " : "Cyclical Sector: "}</span>
              {cyclical.message}
            </p>
          </div>
        </div>
      )}

      {q && (
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ROE consistency */}
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> ROE Consistency
              </div>
              <div className="text-lg font-bold text-gray-900">
                {q.roeGoodYears}/{q.roeYears} <span className="text-xs font-normal text-gray-500">years ≥15%</span>
              </div>
              {q.roeHistory.length > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  {q.roeHistory.slice(0, 5).reverse().map((r, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-6 h-1.5 rounded-full ${r >= 15 ? "bg-emerald-500" : r >= 10 ? "bg-amber-400" : "bg-red-400"}`} />
                      <span className="text-[8px] text-gray-400 mt-0.5">{r.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
              {q.roeConsistent && (
                <div className="text-[10px] text-emerald-600 font-medium mt-1">✓ Consistent compounder</div>
              )}
            </div>

            {/* Revenue CAGR */}
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Revenue Growth
              </div>
              <div className="text-lg font-bold text-gray-900">
                {q.revCagr != null ? `${q.revCagr >= 0 ? "+" : ""}${q.revCagr.toFixed(1)}%` : "—"}
                <span className="text-xs font-normal text-gray-500"> CAGR</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                Up {q.revGrowthYears} of last {q.revTotalYears} years
              </div>
            </div>

            {/* Cash-backed earnings */}
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Droplets className="w-3 h-3" /> Earnings Quality
              </div>
              <div className={`inline-block text-xs font-medium px-2 py-1 rounded border ${cashColor}`}>
                {cashLabel}
              </div>
              {q.ocfToNi != null && (
                <div className="text-[10px] text-gray-500 mt-1.5">
                  OCF / Net Profit = {q.ocfToNi.toFixed(2)}x
                  <span className="text-gray-400"> · {q.ocfPositiveYears}/{q.ocfTotalYears} yrs +ve cash flow</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-2">
        Quality signals derived from multi-year annual financials. ROE consistency = years with ≥15% return on equity.
        Cash-backed = operating cash flow vs reported net profit (≥1x means earnings are converted to real cash, not just accruals).
        Educational reference only — not investment advice.
      </p>
    </section>
  );
}
