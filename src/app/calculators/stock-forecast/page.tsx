"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Info } from "lucide-react";

export default function StockForecastCalculator() {
  const [currentPrice, setCurrentPrice] = useState("780");
  const [currentEps, setCurrentEps] = useState("72");
  const [epsGrowth, setEpsGrowth] = useState("12");
  const [exitPE, setExitPE] = useState("20");
  const [years, setYears] = useState("5");
  const [dividendYield, setDividendYield] = useState("1.2");

  const result = useMemo(() => {
    const price = parseFloat(currentPrice);
    const eps = parseFloat(currentEps);
    const g = parseFloat(epsGrowth) / 100;
    const pe = parseFloat(exitPE);
    const yr = parseFloat(years);
    const div = parseFloat(dividendYield) / 100;

    if (!price || !eps || !yr || yr <= 0 || isNaN(g) || isNaN(pe)) return null;

    const futureEps = eps * Math.pow(1 + g, yr);
    const futurePrice = futureEps * pe;
    const totalDividends = price * div * yr; // simplified (no compounding of dividends)
    const totalReturn = ((futurePrice + totalDividends - price) / price) * 100;
    const cagr = (Math.pow(futurePrice / price, 1 / yr) - 1) * 100;
    const cagrWithDiv = (Math.pow((futurePrice + totalDividends) / price, 1 / yr) - 1) * 100;
    const currentPE = price / eps;
    const peExpansion = pe - currentPE;

    return {
      futureEps: futureEps.toFixed(2),
      futurePrice: futurePrice.toFixed(0),
      totalDividends: totalDividends.toFixed(0),
      totalReturn: totalReturn.toFixed(1),
      cagr: cagr.toFixed(1),
      cagrWithDiv: cagrWithDiv.toFixed(1),
      currentPE: currentPE.toFixed(1),
      peExpansion: peExpansion.toFixed(1),
      isGood: cagr >= 12,
    };
  }, [currentPrice, currentEps, epsGrowth, exitPE, years, dividendYield]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/calculators" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> All calculators
      </Link>

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <TrendingUp className="w-3.5 h-3.5" />
          FORE — Forecasted Returns Estimator
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Stock Return Forecast Calculator</h1>
        <p className="text-sm text-gray-600">
          Estimate the expected CAGR from a stock based on EPS growth and P/E re-rating. Uses the formula:
          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded ml-1">Future Price = Current EPS × (1+g)ⁿ × Exit P/E</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="card space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Input your assumptions</h2>

          <div>
            <label className="label flex items-center gap-1">
              Current Stock Price (₹)
              <span className="text-gray-400 text-[10px]">LTP from ticker</span>
            </label>
            <input type="number" className="input w-full" value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)} placeholder="e.g. 780" />
          </div>

          <div>
            <label className="label flex items-center gap-1">
              Current EPS (₹) — TTM
              <span className="text-gray-400 text-[10px]">From annual report / screener</span>
            </label>
            <input type="number" className="input w-full" value={currentEps}
              onChange={(e) => setCurrentEps(e.target.value)} placeholder="e.g. 72" />
            {currentPrice && currentEps && (
              <div className="text-[11px] text-gray-500 mt-1">
                Current P/E: {(parseFloat(currentPrice) / parseFloat(currentEps)).toFixed(1)}×
              </div>
            )}
          </div>

          <div>
            <label className="label">Expected EPS Growth Rate (% per year)</label>
            <input type="number" className="input w-full" value={epsGrowth}
              onChange={(e) => setEpsGrowth(e.target.value)} placeholder="e.g. 12" />
            <div className="text-[11px] text-gray-400 mt-1">
              Historical Nifty 50 EPS CAGR: ~12–14%. Use company-specific estimate.
            </div>
          </div>

          <div>
            <label className="label">Exit P/E Multiple (at which you&apos;ll sell)</label>
            <input type="number" className="input w-full" value={exitPE}
              onChange={(e) => setExitPE(e.target.value)} placeholder="e.g. 20" />
            <div className="text-[11px] text-gray-400 mt-1">
              Conservative: 15–20×. Fair: 20–25×. Premium: 30×+.
            </div>
          </div>

          <div>
            <label className="label">Investment Horizon (years)</label>
            <input type="number" className="input w-full" value={years}
              onChange={(e) => setYears(e.target.value)} placeholder="e.g. 5" min="1" max="30" />
          </div>

          <div>
            <label className="label">Expected Annual Dividend Yield (%) — optional</label>
            <input type="number" className="input w-full" value={dividendYield}
              onChange={(e) => setDividendYield(e.target.value)} placeholder="e.g. 1.5" step="0.1" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Main verdict */}
              <div className={`card border-2 ${result.isGood ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Expected CAGR (price only)</div>
                <div className={`text-4xl font-bold tabular-nums ${result.isGood ? "text-emerald-700" : "text-amber-700"}`}>
                  {result.cagr}%
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {result.isGood
                    ? "✅ Beats Nifty 50 long-term average (~12%)"
                    : "⚠️ Below Nifty 50 long-term average. Consider index fund instead."}
                </div>
                <div className="text-sm font-semibold text-gray-700 mt-2">
                  With dividends: <span className={result.isGood ? "text-emerald-700" : "text-amber-700"}>{result.cagrWithDiv}% CAGR</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="card">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Return breakdown</h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Current EPS", value: `₹${currentEps}` },
                    { label: `Future EPS (after ${years}yr at ${epsGrowth}% growth)`, value: `₹${result.futureEps}` },
                    { label: `Future Price (EPS × Exit P/E ${exitPE}×)`, value: `₹${Number(result.futurePrice).toLocaleString("en-IN")}`, highlight: true },
                    { label: `Dividend income (${years}yr × ${dividendYield}% yield)`, value: `₹${Number(result.totalDividends).toLocaleString("en-IN")}` },
                    { label: "Total return (price + dividends)", value: `${result.totalReturn}%`, highlight: true },
                    { label: "Current P/E", value: `${result.currentPE}×` },
                    { label: `P/E change (${result.currentPE}× → ${exitPE}×)`, value: `${parseFloat(result.peExpansion) >= 0 ? "+" : ""}${result.peExpansion}×`, cls: parseFloat(result.peExpansion) >= 0 ? "text-emerald-600" : "text-red-600" },
                  ].map((row) => (
                    <div key={row.label} className={`flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 ${row.highlight ? "bg-indigo-50 -mx-4 px-4 rounded" : ""}`}>
                      <span className="text-xs text-gray-600">{row.label}</span>
                      <span className={`text-sm font-semibold tabular-nums ${row.cls ?? (row.highlight ? "text-indigo-700" : "text-gray-900")}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card flex items-center justify-center h-40 text-sm text-gray-400">
              Fill in the inputs to see your forecasted returns
            </div>
          )}

          {/* How it works */}
          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">How FORE works</div>
                <div className="text-[11px] text-gray-500 leading-relaxed space-y-1">
                  <p>FORE (Forecasted Returns Estimator) uses the Peter Lynch / Benjamin Graham earnings power formula:</p>
                  <p className="font-mono bg-white px-2 py-1 rounded border text-indigo-700">Future Price = EPS × (1+g)ⁿ × Exit P/E</p>
                  <p>Two drivers of return: (1) EPS growth and (2) P/E expansion/contraction. If you pay 30× P/E for a company and it re-rates to 20×, that alone is a -33% loss even if EPS grows.</p>
                  <p className="text-amber-700">⚠️ This is a simplified model — does not account for dilution, debt changes, or sector rotation.</p>
                </div>
              </div>
            </div>
          </div>

          <Link href="/screener" className="block card hover:border-indigo-300 transition text-center">
            <div className="text-sm font-semibold text-gray-900">Find stocks with these metrics →</div>
            <div className="text-xs text-gray-500 mt-0.5">Use the screener to filter by P/E, ROE, market cap</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
