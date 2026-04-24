"use client";

import { useMemo, useState } from "react";
import type { CalcMeta } from "@/lib/calculators/types";
import { NumberSliderInput } from "./NumberSliderInput";
import { ResultDonut } from "./ResultDonut";
import { BreakdownChart } from "./BreakdownChart";
import { formatByType } from "@/lib/format";
import { mathBySlug } from "@/lib/calculators/math-registry";

interface Props {
  config: CalcMeta;
}

export function CalculatorShell({ config }: Props) {
  const calcFn = mathBySlug[config.slug];
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(config.inputs.map((i) => [i.key, i.default])),
  );

  const result = useMemo(() => calcFn(values), [calcFn, values]);

  if (!calcFn) return <div className="card text-sm text-red-600">Calculator not available.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-2 card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inputs</h2>
        <div className="space-y-5">
          {config.inputs.map((input) => (
            <NumberSliderInput
              key={input.key}
              input={input}
              value={values[input.key]}
              onChange={(v) => setValues((s) => ({ ...s, [input.key]: v }))}
            />
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-4">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Result</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {result.primary.map((p) => (
              <div key={p.label} className="bg-indigo-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">{p.label}</div>
                <div className="text-lg font-bold text-indigo-700 tabular-nums mt-0.5">
                  {formatByType(p.value, p.format)}
                </div>
              </div>
            ))}
          </div>
          {result.secondary && result.secondary.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {result.secondary.map((s) => (
                <div key={s.label} className="text-xs">
                  <div className="text-gray-500">{s.label}</div>
                  <div className="font-semibold text-gray-900 tabular-nums mt-0.5">
                    {formatByType(s.value, s.format)}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {result.donut ? (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Composition</h3>
            <ResultDonut invested={result.donut.invested} returns={result.donut.returns} />
          </div>
        ) : null}

        {result.breakdown && result.breakdown.length > 1 ? (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Year-by-year growth</h3>
            <BreakdownChart data={result.breakdown} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
