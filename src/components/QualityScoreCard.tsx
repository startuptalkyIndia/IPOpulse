import { Award, Check, X } from "lucide-react";
import type { QualityScore } from "@/lib/quality-score";

/**
 * Displays the composite Quality Score (Durability/Valuation/Momentum, Trendlyne
 * DVM-style) — objective math from stored fundamentals and technicals, same
 * "not advice" framing as StockTechnicals. See src/lib/quality-score.ts.
 */

const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "A": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "B": "bg-blue-50 text-blue-700 border-blue-200",
  "C": "bg-amber-50 text-amber-700 border-amber-200",
  "D": "bg-orange-50 text-orange-700 border-orange-200",
  "F": "bg-red-50 text-red-700 border-red-200",
};

function barColor(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 55) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function DimensionBar({ title, score, label }: { title: string; score: number; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{title}</span>
        <span className="text-xs font-semibold text-gray-900">{label} · {score}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function QualityScoreCard({ q }: { q: QualityScore }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" /> Quality Score
        </h2>
        <span className="text-[10px] text-gray-400">Durability · Valuation · Momentum — objective math, not advice</span>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 ${GRADE_COLORS[q.grade]}`}>
            <span className="text-2xl font-bold">{q.grade}</span>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900">{q.overall}<span className="text-sm font-normal text-gray-400">/100</span></div>
            <div className="text-xs text-gray-500">Composite score: 40% quality, 30% valuation, 30% momentum</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DimensionBar title="Quality" score={q.quality.score} label={q.quality.label} />
          <DimensionBar title="Valuation" score={q.valuation.score} label={q.valuation.label} />
          <DimensionBar title="Momentum" score={q.momentum.score} label={q.momentum.label} />
        </div>

        {q.flags.length > 0 ? (
          <div className="pt-3 border-t border-gray-100 space-y-1.5">
            {q.flags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {f.type === "green" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <span className={f.type === "green" ? "text-gray-700" : "text-red-700"}>{f.text}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
