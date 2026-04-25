import type { SmeRiskScore } from "@/lib/sme-risk";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";

export function SmeRiskCard({ risk }: { risk: SmeRiskScore }) {
  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" /> SME IPO Risk Score
        </h2>
        <span className={`badge ${risk.bandColorClass}`}>{risk.bandLabel}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-bold text-indigo-700 tabular-nums">{risk.score}</span>
        <span className="text-sm text-gray-500">/ 100</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full ${
            risk.band === "lower"
              ? "bg-green-500"
              : risk.band === "moderate"
              ? "bg-yellow-500"
              : risk.band === "elevated"
              ? "bg-orange-500"
              : "bg-red-500"
          }`}
          style={{ width: `${risk.score}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {risk.factors.map((f, i) => {
          const isPos = f.delta > 0;
          const isNeg = f.delta < 0;
          const Icon = isPos ? TrendingUp : isNeg ? TrendingDown : null;
          return (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded flex-shrink-0 ${
                  isPos ? "bg-green-100 text-green-700" : isNeg ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {Icon ? <Icon className="w-3 h-3" /> : "·"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-gray-800">{f.label}</div>
                {f.detail ? <div className="text-gray-500 mt-0.5">{f.detail}</div> : null}
              </div>
              {f.delta !== 0 ? (
                <span className={`text-xs font-mono tabular-nums ${isPos ? "text-green-600" : "text-red-600"}`}>
                  {f.delta > 0 ? "+" : ""}{f.delta}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
        Heuristic score. Not a recommendation. Factors are derived from SEBI&apos;s own SME IPO risk patterns. Always
        do your own due diligence before applying.
      </p>
    </div>
  );
}
