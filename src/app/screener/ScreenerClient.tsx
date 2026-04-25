"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, X } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export interface ScreenerCompany {
  slug: string;
  name: string;
  symbol: string | null;
  sector: string | null;
  industry: string | null;
  marketCapCr: number | null;
  isSme: boolean;
  ltp: number | null;
  volume: number | null;
}

const MCAP_BANDS: Array<{ key: string; label: string; min: number | null; max: number | null }> = [
  { key: "any", label: "Any size", min: null, max: null },
  { key: "large", label: "Large cap (>₹50,000 Cr)", min: 50000, max: null },
  { key: "mid", label: "Mid cap (₹15,000–50,000 Cr)", min: 15000, max: 50000 },
  { key: "small", label: "Small cap (₹3,000–15,000 Cr)", min: 3000, max: 15000 },
  { key: "micro", label: "Micro / SME (<₹3,000 Cr)", min: null, max: 3000 },
];

const TYPE_OPTIONS = [
  { key: "any", label: "All" },
  { key: "mainboard", label: "Mainboard only" },
  { key: "sme", label: "SME only" },
];

export function ScreenerClient({ seed, sectors }: { seed: ScreenerCompany[]; sectors: string[] }) {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState<string>("any");
  const [mcapBand, setMcapBand] = useState<string>("any");
  const [type, setType] = useState<string>("any");

  const filtered = useMemo(() => {
    const band = MCAP_BANDS.find((b) => b.key === mcapBand) ?? MCAP_BANDS[0];
    const q = search.trim().toLowerCase();
    return seed
      .filter((c) => {
        if (sector !== "any" && c.sector !== sector) return false;
        if (type === "mainboard" && c.isSme) return false;
        if (type === "sme" && !c.isSme) return false;
        if (q) {
          const matchesText =
            c.name.toLowerCase().includes(q) ||
            (c.symbol?.toLowerCase().includes(q) ?? false) ||
            (c.sector?.toLowerCase().includes(q) ?? false);
          if (!matchesText) return false;
        }
        if (band.min != null && (c.marketCapCr ?? 0) < band.min) return false;
        if (band.max != null && (c.marketCapCr ?? 0) > band.max) return false;
        return true;
      })
      .slice(0, 200);
  }, [seed, search, sector, mcapBand, type]);

  function reset() {
    setSearch("");
    setSector("any");
    setMcapBand("any");
    setType("any");
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          <button onClick={reset} className="ml-auto text-xs text-gray-500 hover:text-indigo-600 inline-flex items-center gap-1">
            <X className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Company / symbol"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Sector</label>
            <select className="input w-full" value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="any">All sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Market cap</label>
            <select className="input w-full" value={mcapBand} onChange={(e) => setMcapBand(e.target.value)}>
              {MCAP_BANDS.map((b) => (
                <option key={b.key} value={b.key}>{b.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Listing</label>
            <select className="input w-full" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of {seed.length} companies
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Sector / Industry</th>
                <th className="px-3 py-3 text-right">Market cap</th>
                <th className="px-3 py-3 text-right">LTP</th>
                <th className="px-3 py-3 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.slug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-sm">
                    <Link href={`/ticker/${c.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {c.name}
                    </Link>
                    <div className="text-[11px] text-gray-400 mt-0.5 font-mono">{c.symbol ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {c.sector ?? "—"} {c.industry ? `· ${c.industry}` : ""}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-900">
                    {c.marketCapCr ? formatCurrency(c.marketCapCr * 10000000) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-700">
                    {c.ltp != null ? `₹${c.ltp.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-600">
                    {c.volume != null ? `${(c.volume / 1e5).toFixed(1)}L` : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-sm text-gray-500">
                    No companies match these filters. Reset to see all.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
