import type { PredictorOutput } from "@/lib/listing-predictor";
import { TrendingUp, ArrowRight } from "lucide-react";

export function ListingPredictorCard({ prediction }: { prediction: PredictorOutput }) {
  const positive = prediction.predictedGainPct >= 0;
  const confLabel = prediction.confidence === "high" ? "High confidence" : prediction.confidence === "moderate" ? "Moderate" : "Low";
  const confCls =
    prediction.confidence === "high"
      ? "bg-green-100 text-green-800"
      : prediction.confidence === "moderate"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> Listing-day Predictor
        </h2>
        <span className={`badge ${confCls}`}>{confLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Predicted listing price</div>
          <div className="text-lg font-bold text-indigo-700 tabular-nums">
            {prediction.predictedListingPrice != null ? `₹${prediction.predictedListingPrice}` : "—"}
          </div>
        </div>
        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Predicted gain</div>
          <div className={`text-lg font-bold tabular-nums ${positive ? "text-green-600" : "text-red-600"}`}>
            {positive ? "+" : ""}{prediction.predictedGainPct.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Drivers</div>
        {prediction.drivers.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-gray-700">{d.label}</span>
            <span className={`tabular-nums font-mono ${d.impact > 0 ? "text-green-600" : "text-red-600"}`}>
              {d.impact > 0 ? "+" : ""}{d.impact.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
        Heuristic prediction based on GMP, subscription, QIB demand and IPO size. Indicative only — markets can
        and do surprise. See <a href="/ipo/gmp-accuracy" className="underline">GMP Accuracy Scorecard</a> for how often these signals are off.
      </p>
    </div>
  );
}
