"use client";

import type { Dispatch, SetStateAction } from "react";

interface QuickScreensProps {
  applyPreset: (name: string) => void;
  moatOnly: boolean;
  uptrendOnly: boolean;
  compounderOnly: boolean;
  setMoatOnly: Dispatch<SetStateAction<boolean>>;
  setUptrendOnly: Dispatch<SetStateAction<boolean>>;
  setCompounderOnly: Dispatch<SetStateAction<boolean>>;
}

export function QuickScreens({
  applyPreset, moatOnly, uptrendOnly, compounderOnly, setMoatOnly, setUptrendOnly, setCompounderOnly,
}: QuickScreensProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Screens</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {[
          { key: "highMcapLowPE", label: "High MktCap", sub: "Low P/E ≤25", color: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" },
          { key: "near52wLow",    label: "Near 52W Low", sub: "Bottom of range", color: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" },
          { key: "near52wHigh",   label: "Near 52W High", sub: "Top of range", color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" },
          { key: "highRoe",       label: "High ROE", sub: "ROE ≥20%", color: "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100" },
          { key: "highDiv",       label: "High Dividend", sub: "Yield ≥2.5%", color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => applyPreset(s.key)}
            className={`text-left p-3 rounded-xl border font-medium transition ${s.color}`}
          >
            <div className="text-sm font-bold">{s.label}</div>
            <div className="text-[11px] opacity-70 mt-0.5">{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Signal toggles (Stock Analysis merge) */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => setMoatOnly(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${moatOnly ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-white border-gray-200 text-gray-600 hover:bg-amber-50"}`}
        >
          🏰 Moat companies only
        </button>
        <button
          onClick={() => setUptrendOnly(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${uptrendOnly ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-white border-gray-200 text-gray-600 hover:bg-emerald-50"}`}
        >
          📈 In uptrend (Stage 2)
        </button>
        <button
          onClick={() => setCompounderOnly(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${compounderOnly ? "bg-indigo-100 border-indigo-300 text-indigo-800" : "bg-white border-gray-200 text-gray-600 hover:bg-indigo-50"}`}
        >
          ✓ Consistent compounder (ROE ≥15% × 4yr)
        </button>
      </div>
    </div>
  );
}
