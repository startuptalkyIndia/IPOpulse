import { Activity, TrendingUp, TrendingDown, Gauge } from "lucide-react";
import type { Technicals } from "@/lib/technicals";

/**
 * Displays objective technical indicators for a stock.
 * Factual math only (RSI, MAs, Weinstein stage, relative strength, returns) —
 * NOT investment advice. No buy/sell calls or target prices.
 */

function RetCell({ label, v }: { label: string; v: number | null }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-gray-500 uppercase">{label}</div>
      <div className={`text-sm font-semibold tabular-nums ${
        v == null ? "text-gray-400" : v >= 0 ? "text-emerald-600" : "text-red-600"
      }`}>
        {v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
      </div>
    </div>
  );
}

const STAGE_COLORS: Record<number, string> = {
  1: "bg-blue-50 text-blue-700 border-blue-200",
  2: "bg-emerald-50 text-emerald-700 border-emerald-200",
  3: "bg-amber-50 text-amber-700 border-amber-200",
  4: "bg-red-50 text-red-700 border-red-200",
};

function rsiZone(rsi: number): { label: string; color: string } {
  if (rsi >= 70) return { label: "Overbought", color: "text-red-600" };
  if (rsi <= 30) return { label: "Oversold", color: "text-emerald-600" };
  return { label: "Neutral", color: "text-gray-600" };
}

export function StockTechnicals({ t }: { t: Technicals }) {
  const rz = rsiZone(t.rsi);
  const maAbove = (ma: number | null) => ma != null && t.price > ma;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" /> Technical Indicators
        </h2>
        <span className="text-[10px] text-gray-400">
          {t.fullAnalysis ? "Full analysis" : `${t.daysOfData}d data — partial`} · objective math, not advice
        </span>
      </div>

      <div className="card space-y-4">
        {/* Multi-timeframe returns */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">Returns</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <RetCell label="1D" v={t.ret1d} />
            <RetCell label="1W" v={t.ret1w} />
            <RetCell label="1M" v={t.ret1m} />
            <RetCell label="3M" v={t.ret3m} />
            <RetCell label="6M" v={t.ret6m} />
            <RetCell label="1Y" v={t.ret1y} />
          </div>
        </div>

        {/* Stage + RSI + trend template + RS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
          {t.stage && (
            <div>
              <div className="text-[10px] text-gray-500 uppercase mb-1">Weinstein Stage</div>
              <span className={`inline-block text-xs font-medium px-2 py-1 rounded border ${STAGE_COLORS[t.stage]}`}>
                {t.stageLabel}
              </span>
            </div>
          )}
          <div>
            <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1"><Gauge className="w-3 h-3" /> RSI (14)</div>
            <div className="text-sm font-semibold tabular-nums text-gray-900">
              {t.rsi.toFixed(0)} <span className={`text-[10px] font-medium ${rz.color}`}>{rz.label}</span>
            </div>
          </div>
          {t.fullAnalysis && (
            <div>
              <div className="text-[10px] text-gray-500 uppercase mb-1">Trend Template</div>
              <div className="text-sm font-semibold tabular-nums text-gray-900">
                {t.trendTemplate}/7
                <span className="text-[10px] text-gray-400 ml-1">{t.trendTemplate >= 6 ? "strong" : t.trendTemplate >= 4 ? "moderate" : "weak"}</span>
              </div>
            </div>
          )}
          {t.relStrength != null && (
            <div>
              <div className="text-[10px] text-gray-500 uppercase mb-1">RS vs Nifty (3M)</div>
              <div className={`text-sm font-semibold tabular-nums ${t.relStrength >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {t.relStrength >= 0 ? "+" : ""}{t.relStrength.toFixed(1)}pp
                {t.relStrength > 0 ? <TrendingUp className="w-3 h-3 inline ml-1" /> : <TrendingDown className="w-3 h-3 inline ml-1" />}
              </div>
            </div>
          )}
        </div>

        {/* Moving averages */}
        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-2">Moving Averages (price vs MA)</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "20-DMA", ma: t.ma20 },
              { label: "50-DMA", ma: t.ma50 },
              { label: "150-DMA", ma: t.ma150 },
              { label: "200-DMA", ma: t.ma200 },
            ].map(({ label, ma }) => (
              <div key={label} className={`rounded-lg p-2 text-center ${ma == null ? "bg-gray-50" : maAbove(ma) ? "bg-emerald-50" : "bg-red-50"}`}>
                <div className="text-[10px] text-gray-500">{label}</div>
                <div className="text-xs font-semibold tabular-nums text-gray-900">
                  {ma != null ? `₹${ma.toFixed(0)}` : "—"}
                </div>
                {ma != null && (
                  <div className={`text-[9px] font-medium ${maAbove(ma) ? "text-emerald-600" : "text-red-600"}`}>
                    {maAbove(ma) ? "above" : "below"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 52W position + support/resistance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
          <div>
            <div className="text-[10px] text-gray-500 uppercase mb-0.5">From 52W High</div>
            <div className={`font-semibold tabular-nums ${t.fromHigh >= -5 ? "text-emerald-600" : "text-gray-700"}`}>{t.fromHigh.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase mb-0.5">From 52W Low</div>
            <div className="font-semibold tabular-nums text-gray-700">+{t.fromLow.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase mb-0.5">Support (20D)</div>
            <div className="font-semibold tabular-nums text-gray-700">₹{t.support20.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase mb-0.5">Resistance (20D)</div>
            <div className="font-semibold tabular-nums text-gray-700">₹{t.resist20.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-2">
        Technical indicators are objective calculations from historical EOD prices (RSI, moving averages, Weinstein stage,
        Minervini trend-template, relative strength). For educational reference only — not a buy/sell recommendation.
      </p>
    </section>
  );
}
