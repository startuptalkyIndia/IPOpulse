"use client";

interface FundamentalsPanelProps {
  peMax: string;
  setPeMax: (v: string) => void;
  roeMin: string;
  setRoeMin: (v: string) => void;
  debtMax: string;
  setDebtMax: (v: string) => void;
  divMin: string;
  setDivMin: (v: string) => void;
  requireFundamentals: boolean;
  setRequireFundamentals: (v: boolean) => void;
  applyPreset: (name: string) => void;
}

export function FundamentalsPanel({
  peMax, setPeMax, roeMin, setRoeMin, debtMax, setDebtMax, divMin, setDivMin,
  requireFundamentals, setRequireFundamentals, applyPreset,
}: FundamentalsPanelProps) {
  return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Fundamental ratios</span>
          <span className="text-[11px] text-gray-500">— Top companies include P/E and ROE</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="label">P/E max</label>
            <input type="number" className="input w-full" placeholder="e.g. 25" value={peMax} onChange={(e) => setPeMax(e.target.value)} step="0.1" />
          </div>
          <div>
            <label className="label">ROE % min</label>
            <input type="number" className="input w-full" placeholder="e.g. 15" value={roeMin} onChange={(e) => setRoeMin(e.target.value)} step="0.1" />
          </div>
          <div>
            <label className="label">Debt/Equity max</label>
            <input type="number" className="input w-full" placeholder="e.g. 0.5" value={debtMax} onChange={(e) => setDebtMax(e.target.value)} step="0.1" />
          </div>
          <div>
            <label className="label">Dividend yield % min</label>
            <input type="number" className="input w-full" placeholder="e.g. 2" value={divMin} onChange={(e) => setDivMin(e.target.value)} step="0.1" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Quick presets:</span>
          <button onClick={() => applyPreset("value")} className="text-[11px] bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 px-2.5 py-1 rounded-full">Value (P/E&lt;20, ROE&gt;15, D/E&lt;1)</button>
          <button onClick={() => applyPreset("growth")} className="text-[11px] bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 px-2.5 py-1 rounded-full">Growth (ROE&gt;18, D/E&lt;0.5)</button>
          <button onClick={() => applyPreset("dividend")} className="text-[11px] bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 px-2.5 py-1 rounded-full">Dividend (yield&gt;3%, D/E&lt;1)</button>
          <button onClick={() => applyPreset("lowdebt")} className="text-[11px] bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 px-2.5 py-1 rounded-full">Low debt (D/E&lt;0.3)</button>
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-600 mt-3 cursor-pointer">
          <input type="checkbox" checked={requireFundamentals} onChange={(e) => setRequireFundamentals(e.target.checked)} className="rounded border-gray-300" />
          Hide companies without any ratios populated
        </label>
      </div>
  );
}
