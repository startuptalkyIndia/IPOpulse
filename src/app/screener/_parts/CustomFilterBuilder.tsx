"use client";

import { Sliders, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { CustomFilter } from "./types";
import { METRICS, OPERATORS } from "./constants";

interface CustomFilterBuilderProps {
  customFilters: CustomFilter[];
  showCustomFilters: boolean;
  setShowCustomFilters: Dispatch<SetStateAction<boolean>>;
  updateCustomFilter: (id: string, patch: Partial<CustomFilter>) => void;
  removeCustomFilter: (id: string) => void;
  addCustomFilter: () => void;
}

export function CustomFilterBuilder({
  customFilters, showCustomFilters, setShowCustomFilters, updateCustomFilter, removeCustomFilter, addCustomFilter,
}: CustomFilterBuilderProps) {
  return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <button
            onClick={() => setShowCustomFilters((s) => !s)}
            className={`text-xs px-2 py-1 rounded-md inline-flex items-center gap-1 ${showCustomFilters ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"}`}
          >
            <Sliders className="w-3 h-3" /> Custom Filters{customFilters.length > 0 ? ` (${customFilters.length})` : ""}
          </button>
          <span className="text-[11px] text-gray-500">— build your own: any metric, any condition, as many as you want</span>
        </div>

        {showCustomFilters ? (
          <div className="space-y-2">
            {customFilters.map((cf) => (
              <div key={cf.id} className="flex items-center gap-2">
                <select
                  className="input text-xs py-1.5 flex-1"
                  value={cf.metric}
                  onChange={(e) => updateCustomFilter(cf.id, { metric: e.target.value })}
                >
                  {METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
                <select
                  className="input text-xs py-1.5 w-16"
                  value={cf.op}
                  onChange={(e) => updateCustomFilter(cf.id, { op: e.target.value })}
                >
                  {OPERATORS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
                <input
                  type="number"
                  className="input text-xs py-1.5 w-28"
                  placeholder="Value"
                  value={cf.value}
                  onChange={(e) => updateCustomFilter(cf.id, { value: e.target.value })}
                  step="any"
                />
                <button onClick={() => removeCustomFilter(cf.id)} className="text-gray-400 hover:text-red-600 flex-shrink-0" aria-label="Remove filter">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button onClick={addCustomFilter} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              + Add filter
            </button>
          </div>
        ) : null}
      </div>
  );
}
