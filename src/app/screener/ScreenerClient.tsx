"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, X, Sliders } from "lucide-react";
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
  chg1d?: number | null;
  high52w?: number | null;
  low52w?: number | null;
  peRatio?: number | null;
  pbRatio?: number | null;
  roePercent?: number | null;
  debtToEquity?: number | null;
  dividendYield?: number | null;
  eps?: number | null;
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

type SortKey = "marketCap" | "pe" | "roe" | "divYield" | "chg1d" | "chg1d_asc" | "vol";

export function ScreenerClient({ seed, sectors }: { seed: ScreenerCompany[]; sectors: string[] }) {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState<string>("any");
  const [mcapBand, setMcapBand] = useState<string>("any");
  const [type, setType] = useState<string>("any");

  // Fundamental filters
  const [showFundamentals, setShowFundamentals] = useState(false);
  const [peMax, setPeMax] = useState<string>("");
  const [roeMin, setRoeMin] = useState<string>("");
  const [debtMax, setDebtMax] = useState<string>("");
  const [divMin, setDivMin] = useState<string>("");
  const [requireFundamentals, setRequireFundamentals] = useState(false);

  const [sortBy, setSortBy] = useState<SortKey>("marketCap");

  const filtered = useMemo(() => {
    const band = MCAP_BANDS.find((b) => b.key === mcapBand) ?? MCAP_BANDS[0];
    const q = search.trim().toLowerCase();
    const peMaxN = peMax === "" ? null : Number(peMax);
    const roeMinN = roeMin === "" ? null : Number(roeMin);
    const debtMaxN = debtMax === "" ? null : Number(debtMax);
    const divMinN = divMin === "" ? null : Number(divMin);

    const result = seed
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

        // Fundamentals
        if (requireFundamentals && c.peRatio == null && c.roePercent == null) return false;
        if (peMaxN != null) {
          if (c.peRatio == null || c.peRatio > peMaxN || c.peRatio <= 0) return false;
        }
        if (roeMinN != null) {
          if (c.roePercent == null || c.roePercent < roeMinN) return false;
        }
        if (debtMaxN != null) {
          if (c.debtToEquity == null || c.debtToEquity > debtMaxN) return false;
        }
        if (divMinN != null) {
          if (c.dividendYield == null || c.dividendYield < divMinN) return false;
        }
        return true;
      });

    // Sort
    const compare = (a: ScreenerCompany, b: ScreenerCompany) => {
      const get = (c: ScreenerCompany) => {
        if (sortBy === "marketCap") return c.marketCapCr ?? -Infinity;
        if (sortBy === "pe") return c.peRatio ?? Infinity;
        if (sortBy === "roe") return c.roePercent ?? -Infinity;
        if (sortBy === "divYield") return c.dividendYield ?? -Infinity;
        if (sortBy === "chg1d") return c.chg1d ?? -Infinity;
        if (sortBy === "chg1d_asc") return c.chg1d ?? Infinity;
        if (sortBy === "vol") return c.volume ?? -Infinity;
        return 0;
      };
      const av = get(a);
      const bv = get(b);
      return (sortBy === "pe" || sortBy === "chg1d_asc") ? av - bv : bv - av;
    };
    return result.sort(compare).slice(0, 200);
  }, [seed, search, sector, mcapBand, type, peMax, roeMin, debtMax, divMin, requireFundamentals, sortBy]);

  function reset() {
    setSearch("");
    setSector("any");
    setMcapBand("any");
    setType("any");
    setPeMax("");
    setRoeMin("");
    setDebtMax("");
    setDivMin("");
    setRequireFundamentals(false);
    setSortBy("marketCap");
  }

  function applyPreset(name: string) {
    reset();
    if (name === "value") {
      setPeMax("20"); setRoeMin("15"); setDebtMax("1");
    } else if (name === "growth") {
      setRoeMin("18"); setDebtMax("0.5");
    } else if (name === "dividend") {
      setDivMin("3"); setDebtMax("1");
    } else if (name === "lowdebt") {
      setDebtMax("0.3");
    }
    setShowFundamentals(true);
  }

  const fundamentalsCount = seed.filter((c) => c.peRatio != null || c.roePercent != null).length;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setShowFundamentals((s) => !s)}
            className={`ml-auto md:ml-0 text-xs px-2 py-1 rounded-md inline-flex items-center gap-1 ${showFundamentals ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"}`}
          >
            <Sliders className="w-3 h-3" /> Fundamentals
          </button>
          <button onClick={reset} className="text-xs text-gray-500 hover:text-indigo-600 inline-flex items-center gap-1">
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

        {showFundamentals ? (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Fundamental ratios</span>
              <span className="text-[11px] text-gray-500">— ({fundamentalsCount} of {seed.length} companies have ratios populated)</span>
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
        ) : null}
      </div>

      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of {seed.length} companies
        </div>
        <div className="text-xs text-gray-500 inline-flex items-center gap-2">
          Sort by:
          <select className="input text-xs py-1" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
            <option value="marketCap">Market cap ↓</option>
            <option value="chg1d">Top gainers (1D) ↓</option>
            <option value="chg1d_asc">Top losers (1D) ↑</option>
            <option value="vol">Volume ↓</option>
            <option value="pe">P/E low→high</option>
            <option value="roe">ROE % ↓</option>
            <option value="divYield">Dividend yield ↓</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Sector</th>
                <th className="px-3 py-3 text-right">Market cap</th>
                <th className="px-3 py-3 text-right">LTP</th>
                <th className="px-3 py-3 text-right">1D %</th>
                <th className="px-3 py-3 text-right">52W H</th>
                <th className="px-3 py-3 text-right">52W L</th>
                <th className="px-3 py-3 text-right">P/E</th>
                <th className="px-3 py-3 text-right">ROE %</th>
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
                  <td className="px-3 py-2.5 text-xs text-gray-600">{c.sector ?? "—"}</td>
                  <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-900">
                    {c.marketCapCr ? formatCurrency(c.marketCapCr * 10000000) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-700">
                    {c.ltp != null ? `₹${c.ltp.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className={`px-3 py-2.5 text-xs text-right tabular-nums font-medium ${
                    c.chg1d == null ? "text-gray-400" : c.chg1d >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {c.chg1d != null ? `${c.chg1d >= 0 ? "+" : ""}${c.chg1d.toFixed(2)}%` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-600">
                    {c.high52w != null ? `₹${c.high52w.toFixed(0)}` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-600">
                    {c.low52w != null ? `₹${c.low52w.toFixed(0)}` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{c.peRatio != null ? c.peRatio.toFixed(1) : "—"}</td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{c.roePercent != null ? c.roePercent.toFixed(1) : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-sm text-gray-500">
                    No companies match these filters. Reset to see all.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-500">
        Prices from NSE EOD bhavcopy · 52W high/low from 12 months of daily data · 1D change vs previous close ·
        P/E and ROE populate automatically as data grows.
      </p>
    </div>
  );
}
