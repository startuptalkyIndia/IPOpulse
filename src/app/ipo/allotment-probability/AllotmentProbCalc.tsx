"use client";

import { useMemo, useState } from "react";
import { computeAllotmentProbability } from "@/lib/allotment-probability";
import { Dices, Info } from "lucide-react";

interface IpoSeed {
  slug: string;
  name: string;
  type: string;
  retailX: number;
  hniX: number;
  qibX: number;
  lotMinValue: number;
}

export function AllotmentProbCalc({ liveIpos }: { liveIpos: IpoSeed[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string>(liveIpos[0]?.slug ?? "");
  const [category, setCategory] = useState<"retail" | "shni" | "bhni" | "qib">("retail");
  const [subscriptionMultiple, setSubscriptionMultiple] = useState<number>(liveIpos[0]?.retailX ?? 8);
  const [lotsApplied, setLotsApplied] = useState<number>(1);

  const selected = liveIpos.find((i) => i.slug === selectedSlug);

  function pickCategory(c: typeof category) {
    setCategory(c);
    if (selected) {
      const newSub = c === "retail" ? selected.retailX : c === "qib" ? selected.qibX : selected.hniX;
      setSubscriptionMultiple(newSub);
    }
  }

  function pickIpo(slug: string) {
    setSelectedSlug(slug);
    const ipo = liveIpos.find((i) => i.slug === slug);
    if (ipo) {
      const newSub = category === "retail" ? ipo.retailX : category === "qib" ? ipo.qibX : ipo.hniX;
      setSubscriptionMultiple(newSub);
    }
  }

  const result = useMemo(
    () =>
      computeAllotmentProbability({
        category,
        subscriptionMultiple,
        lotsApplied,
        lotMinValue: selected?.lotMinValue ?? 14000,
      }),
    [category, subscriptionMultiple, lotsApplied, selected],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Inputs</h2>

        {liveIpos.length > 0 ? (
          <div>
            <label className="label">Pick a current IPO (optional)</label>
            <select className="input w-full" value={selectedSlug} onChange={(e) => pickIpo(e.target.value)}>
              <option value="">Custom — manual numbers</option>
              {liveIpos.map((i) => (
                <option key={i.slug} value={i.slug}>
                  {i.name} ({i.type === "sme" ? "SME" : "Mainboard"})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-4 gap-1">
            {(["retail", "shni", "bhni", "qib"] as const).map((c) => (
              <button
                key={c}
                onClick={() => pickCategory(c)}
                className={`text-xs font-medium px-2 py-1.5 rounded-lg border transition ${
                  category === c
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300"
                }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-700">Subscription multiple ({category.toUpperCase()})</label>
            <span className="text-sm font-semibold text-indigo-600 tabular-nums">{subscriptionMultiple.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={500}
            step={0.1}
            value={subscriptionMultiple}
            onChange={(e) => setSubscriptionMultiple(Number(e.target.value))}
            className="w-full accent-indigo-600 h-2"
          />
        </div>

        <div>
          <label className="label">Lots applied</label>
          <input
            type="number"
            min={1}
            max={20}
            value={lotsApplied}
            onChange={(e) => setLotsApplied(Math.max(1, Number(e.target.value)))}
            className="input w-full"
          />
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        <div className="card bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <Dices className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Allotment probability</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-500">Get any allotment</div>
              <div className="text-2xl font-bold text-green-600 tabular-nums mt-0.5">
                {((result.probabilityFullLot + result.probabilityPartial) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Get nothing</div>
              <div className="text-2xl font-bold text-red-600 tabular-nums mt-0.5">
                {(result.probabilityNone * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Expected lots</div>
              <div className="text-2xl font-bold text-indigo-700 tabular-nums mt-0.5">
                {result.expectedLots.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-600" /> What this means
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {result.notes.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-indigo-400">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
