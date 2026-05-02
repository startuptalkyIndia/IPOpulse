"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface Row {
  slug: string;
  name: string;
  type: string;
  priceHigh: number | null;
  listingDate: string | null;
  gmpAtListing: number | null;
  actualListingPct: number;
  predictedPct: number | null;
  error: number | null;
}

export function AccuracyAnalysis({ rows }: { rows: Row[] }) {
  const [filterType, setFilterType] = useState<"all" | "mainboard" | "sme">("all");
  const [filterErr, setFilterErr] = useState<"all" | "good" | "ok" | "bad">("all");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterType === "mainboard" && r.type === "sme") return false;
      if (filterType === "sme" && r.type !== "sme") return false;
      if (r.error == null) return filterErr === "all";
      const abs = Math.abs(r.error);
      if (filterErr === "good" && abs >= 5) return false;
      if (filterErr === "ok" && (abs < 5 || abs >= 15)) return false;
      if (filterErr === "bad" && abs < 15) return false;
      return true;
    });
  }, [rows, filterType, filterErr]);

  const withGmp = filtered.filter((r) => r.error != null);

  // Build histogram of error
  const histogram = useMemo(() => {
    const buckets = [
      { label: "≤−30%", min: -Infinity, max: -30 },
      { label: "−30 to −15%", min: -30, max: -15 },
      { label: "−15 to −5%", min: -15, max: -5 },
      { label: "−5 to +5%", min: -5, max: 5 },
      { label: "+5 to +15%", min: 5, max: 15 },
      { label: "+15 to +30%", min: 15, max: 30 },
      { label: "≥+30%", min: 30, max: Infinity },
    ];
    return buckets.map((b) => {
      const count = withGmp.filter((r) => {
        const e = r.error!;
        return e >= b.min && e < b.max;
      }).length;
      return { ...b, count };
    });
  }, [withGmp]);

  const maxCount = Math.max(...histogram.map((h) => h.count), 1);

  // Summary stats on filtered
  const avgAbsError = withGmp.length ? withGmp.reduce((s, r) => s + Math.abs(r.error ?? 0), 0) / withGmp.length : 0;
  const within10 = withGmp.filter((r) => Math.abs(r.error ?? 0) <= 10).length;
  const within10Pct = withGmp.length ? (within10 / withGmp.length) * 100 : 0;
  const overestimate = withGmp.filter((r) => (r.error ?? 0) > 0).length;
  const overestimatePct = withGmp.length ? (overestimate / withGmp.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">Filter:</span>
        <div className="inline-flex bg-gray-100 rounded-md p-0.5">
          {[
            { key: "all", label: "All" },
            { key: "mainboard", label: "Mainboard" },
            { key: "sme", label: "SME" },
          ].map((o) => (
            <button
              key={o.key}
              onClick={() => setFilterType(o.key as typeof filterType)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${filterType === o.key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="inline-flex bg-gray-100 rounded-md p-0.5">
          {[
            { key: "all", label: "Any error" },
            { key: "good", label: "<5pp" },
            { key: "ok", label: "5–15pp" },
            { key: "bad", label: ">15pp" },
          ].map((o) => (
            <button
              key={o.key}
              onClick={() => setFilterErr(o.key as typeof filterErr)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${filterErr === o.key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} of {rows.length} IPOs
        </span>
      </div>

      {/* Updated stats from filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card">
          <div className="text-xs text-gray-500">In selection</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{withGmp.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Avg abs error</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{avgAbsError.toFixed(1)}pp</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Within ±10pp</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{within10Pct.toFixed(0)}%</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">GMP overestimated</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{overestimatePct.toFixed(0)}%</div>
        </div>
      </div>

      {/* Histogram */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Distribution of prediction error</h3>
        <p className="text-xs text-gray-500 mb-3">
          Negative bars = GMP underestimated the actual gain (you got more than expected). Positive bars = GMP
          overestimated (listing was worse than the grey market predicted).
        </p>
        <div className="space-y-1.5">
          {histogram.map((h) => {
            const pct = (h.count / maxCount) * 100;
            const color = h.min >= -5 && h.max <= 5 ? "bg-green-400" : Math.abs(h.min) >= 30 || Math.abs(h.max) >= 30 ? "bg-red-400" : "bg-yellow-400";
            return (
              <div key={h.label} className="flex items-center gap-2">
                <div className="text-[11px] text-gray-600 w-24 text-right tabular-nums">{h.label}</div>
                <div className="flex-1 bg-gray-100 rounded h-5 overflow-hidden">
                  <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-gray-700 w-10 tabular-nums">{h.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-500">No IPOs match these filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Listed</th>
                  <th className="px-3 py-3 text-right">Issue price</th>
                  <th className="px-3 py-3 text-right">GMP at listing</th>
                  <th className="px-3 py-3 text-right">Predicted gain</th>
                  <th className="px-3 py-3 text-right">Actual gain</th>
                  <th className="px-3 py-3 text-right">Error</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const errColor = r.error == null ? "text-gray-400" : Math.abs(r.error) < 5 ? "text-green-600" : Math.abs(r.error) < 15 ? "text-yellow-600" : "text-red-600";
                  return (
                    <tr key={r.slug} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm">
                        <Link href={`/ipo/${r.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {r.name}
                        </Link>
                        <div className="text-[11px] text-gray-400 mt-0.5">{r.type === "sme" ? "SME" : "Mainboard"}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {r.listingDate ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "2-digit" }).format(new Date(r.listingDate)) : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-700 text-right tabular-nums">{r.priceHigh ? `₹${r.priceHigh}` : "—"}</td>
                      <td className="px-3 py-3 text-xs text-gray-700 text-right tabular-nums">{r.gmpAtListing != null ? `₹${r.gmpAtListing}` : "—"}</td>
                      <td className="px-3 py-3 text-xs text-gray-700 text-right tabular-nums">{r.predictedPct != null ? `${r.predictedPct >= 0 ? "+" : ""}${r.predictedPct.toFixed(1)}%` : "—"}</td>
                      <td className={`px-3 py-3 text-xs text-right tabular-nums font-semibold ${r.actualListingPct >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {r.actualListingPct >= 0 ? "+" : ""}{r.actualListingPct.toFixed(2)}%
                      </td>
                      <td className={`px-3 py-3 text-xs text-right tabular-nums font-medium ${errColor}`}>
                        {r.error == null ? "—" : `${r.error >= 0 ? "+" : ""}${r.error.toFixed(1)}pp`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
