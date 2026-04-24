"use client";

import { useState, useTransition } from "react";
import { saveGmpEntry } from "./actions";

interface IpoOption {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  priceBandHigh: number | null;
  recentGmp: {
    id: number;
    date: string;
    gmp: number;
    kostak: number | null;
    subjectToSauda: number | null;
    source: string;
    notes: string;
    enteredBy: string;
  }[];
}

export function GmpEntryForm({ ipos }: { ipos: IpoOption[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(ipos[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const selected = ipos.find((i) => i.id === selectedId) ?? null;
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(formData: FormData) {
    setMsg(null);
    startTransition(async () => {
      const res = await saveGmpEntry(formData);
      if (res.ok) setMsg({ kind: "success", text: "GMP saved." });
      else setMsg({ kind: "error", text: res.error ?? "Save failed" });
    });
  }

  if (ipos.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-gray-500">No active IPOs right now. Add IPOs first from /sup-min/ipos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* IPO picker */}
      <aside className="lg:col-span-2 space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase mb-2">Active IPOs</div>
        {ipos.map((ipo) => (
          <button
            key={ipo.id}
            onClick={() => setSelectedId(ipo.id)}
            className={`w-full text-left card transition ${
              selectedId === ipo.id ? "border-indigo-400 ring-2 ring-indigo-100" : "hover:border-indigo-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`badge ${
                ipo.status === "live" ? "bg-green-100 text-green-800" : ipo.status === "upcoming" ? "badge-info" : "badge-warning"
              }`}>
                {ipo.status}
              </span>
              <span className="text-[10px] uppercase text-gray-400">{ipo.type === "sme" ? "SME" : "Mainboard"}</span>
            </div>
            <div className="text-sm font-semibold text-gray-900">{ipo.name}</div>
            {ipo.recentGmp[0] ? (
              <div className="text-xs text-gray-500 mt-1">
                Last GMP: <span className="font-medium text-gray-700">₹{ipo.recentGmp[0].gmp}</span> on{" "}
                {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(ipo.recentGmp[0].date))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 mt-1">No GMP entries yet</div>
            )}
          </button>
        ))}
      </aside>

      {/* Entry form + recent history */}
      <div className="lg:col-span-3 space-y-4">
        {selected ? (
          <>
            <form action={onSubmit} className="card space-y-4">
              <input type="hidden" name="ipoId" value={selected.id} />
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                {selected.priceBandHigh ? (
                  <span className="text-xs text-gray-500">Issue price ₹{selected.priceBandHigh}</span>
                ) : null}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" name="date" defaultValue={today} required className="input w-full" />
                </div>
                <div>
                  <label className="label">GMP (₹)</label>
                  <input type="number" name="gmp" step="0.5" required className="input w-full" placeholder="e.g. 45" />
                </div>
                <div>
                  <label className="label">Kostak (₹, optional)</label>
                  <input type="number" name="kostak" step="0.5" className="input w-full" placeholder="e.g. 400" />
                </div>
                <div>
                  <label className="label">Subject-to-Sauda (₹, optional)</label>
                  <input type="number" name="subjectToSauda" step="0.5" className="input w-full" placeholder="e.g. 3500" />
                </div>
              </div>
              <div>
                <label className="label">Source (dealer name / desk)</label>
                <input type="text" name="source" className="input w-full" placeholder="e.g. Mumbai dealer" />
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea name="notes" rows={2} className="input w-full" placeholder="Any context, anomalies, subscription sentiment..." />
              </div>
              {msg ? (
                <div className={`text-sm rounded-lg px-3 py-2 ${msg.kind === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {msg.text}
                </div>
              ) : null}
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Saving..." : "Save GMP entry"}
              </button>
            </form>

            {/* Recent */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent GMP history — {selected.name}</h3>
              {selected.recentGmp.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No GMP entries yet for this IPO.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase text-left border-b border-gray-100">
                      <th className="py-2 pr-2">Date</th>
                      <th className="py-2 pr-2 text-right">GMP</th>
                      <th className="py-2 pr-2 text-right">Kostak</th>
                      <th className="py-2 pr-2">Source</th>
                      <th className="py-2">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.recentGmp.map((g) => (
                      <tr key={g.id} className="border-b border-gray-100">
                        <td className="py-2 pr-2 text-sm text-gray-700">
                          {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(g.date))}
                        </td>
                        <td className="py-2 pr-2 text-sm text-gray-900 text-right font-medium tabular-nums">₹{g.gmp}</td>
                        <td className="py-2 pr-2 text-sm text-gray-700 text-right tabular-nums">
                          {g.kostak != null ? `₹${g.kostak}` : "—"}
                        </td>
                        <td className="py-2 pr-2 text-xs text-gray-500">{g.source || "—"}</td>
                        <td className="py-2 text-xs text-gray-400">{g.enteredBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="card text-center py-10 text-sm text-gray-500">Pick an IPO to enter GMP.</div>
        )}
      </div>
    </div>
  );
}
