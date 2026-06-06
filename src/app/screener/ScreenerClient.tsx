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
  revYoy?: number | null;
  profitYoy?: number | null;
  rsi?: number | null;
  weinsteinStage?: number | null;
  ret1m?: number | null;
  ret1y?: number | null;
  roeConsistentYrs?: number | null;
  isMoat?: boolean;
  moatNote?: string | null;
  cyclicalPeak?: boolean;
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

type SortKey = "marketCap" | "pe" | "roe" | "divYield" | "chg1d" | "chg1d_asc" | "vol" | "near52wLow" | "near52wHigh";

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

  // Signal filters (from Stock Analysis merge)
  const [moatOnly, setMoatOnly] = useState(false);
  const [uptrendOnly, setUptrendOnly] = useState(false);       // Weinstein stage 2
  const [compounderOnly, setCompounderOnly] = useState(false); // ROE >=15% for 4+ yrs

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
        // Signal filters
        if (moatOnly && !c.isMoat) return false;
        if (uptrendOnly && c.weinsteinStage !== 2) return false;
        if (compounderOnly && (c.roeConsistentYrs ?? 0) < 4) return false;
        return true;
      });

    // Sort
    const compare = (a: ScreenerCompany, b: ScreenerCompany) => {
      const get = (c: ScreenerCompany) => {
        if (sortBy === "marketCap") return c.marketCapCr ?? -1;
        if (sortBy === "pe") return c.peRatio ?? 99999;
        if (sortBy === "roe") return c.roePercent ?? -1;
        if (sortBy === "divYield") return c.dividendYield ?? -1;
        if (sortBy === "chg1d") return c.chg1d ?? -999;
        if (sortBy === "chg1d_asc") return c.chg1d ?? 999;
        if (sortBy === "vol") return c.volume ?? -1;
        // 52W proximity: (ltp - low52w) / (high52w - low52w), 0=at low, 1=at high
        if (sortBy === "near52wLow" || sortBy === "near52wHigh") {
          if (!c.ltp || !c.high52w || !c.low52w || c.high52w === c.low52w) return 0.5;
          return (c.ltp - c.low52w) / (c.high52w - c.low52w);
        }
        return 0;
      };
      const av = get(a);
      const bv = get(b);
      return (sortBy === "pe" || sortBy === "chg1d_asc" || sortBy === "near52wLow") ? av - bv : bv - av;
    };
    return result.sort(compare).slice(0, 200);
  }, [seed, search, sector, mcapBand, type, peMax, roeMin, debtMax, divMin, requireFundamentals, moatOnly, uptrendOnly, compounderOnly, sortBy]);

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
      setPeMax("20"); setRoeMin("15"); setDebtMax("1"); setRequireFundamentals(true);
    } else if (name === "growth") {
      setRoeMin("18"); setDebtMax("0.5"); setRequireFundamentals(true);
    } else if (name === "dividend") {
      setDivMin("3"); setDebtMax("1"); setRequireFundamentals(true);
    } else if (name === "lowdebt") {
      setDebtMax("0.3"); setRequireFundamentals(true);
    } else if (name === "highMcapLowPE") {
      setMcapBand("large"); setPeMax("25"); setRequireFundamentals(true); setSortBy("pe");
    } else if (name === "near52wLow") {
      setSortBy("near52wLow");
    } else if (name === "near52wHigh") {
      setSortBy("near52wHigh");
    } else if (name === "highRoe") {
      setRoeMin("20"); setRequireFundamentals(true); setSortBy("roe");
    } else if (name === "highDiv") {
      setDivMin("2.5"); setRequireFundamentals(true); setSortBy("divYield");
    }
    setShowFundamentals(true);
  }

  return (
    <div className="space-y-4">

      {/* Quick Screens — prominent preset tiles */}
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
            <option value="near52wLow">Near 52W Low ↑</option>
            <option value="near52wHigh">Near 52W High ↓</option>
            <option value="chg1d">Top gainers (1D) ↓</option>
            <option value="chg1d_asc">Top losers (1D) ↑</option>
            <option value="pe">P/E low→high</option>
            <option value="roe">ROE % ↓</option>
            <option value="divYield">Dividend yield ↓</option>
            <option value="vol">Volume ↓</option>
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
                <th className="px-3 py-3 text-right">52W Range</th>
                <th className="px-3 py-3 text-right">P/E</th>
                <th className="px-3 py-3 text-right">ROE %</th>
                <th className="px-3 py-3 text-right" title="Year-on-year revenue growth from annual financials">Rev YoY</th>
                <th className="px-3 py-3 text-right" title="1-year price return">1Y</th>
                <th className="px-3 py-3 text-center" title="Weinstein stage: 2=uptrend, 4=downtrend">Stage</th>
                <th className="px-3 py-3 text-right" title="14-period Relative Strength Index">RSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.slug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/ticker/${c.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {c.name}
                      </Link>
                      {c.isMoat && <span title={c.moatNote ?? "Economic moat"} className="text-amber-500 text-xs">🏰</span>}
                      {c.cyclicalPeak && <span title="Cyclical-peak risk" className="text-xs">🌀</span>}
                      {(c.roeConsistentYrs ?? 0) >= 4 && <span title={`ROE ≥15% for ${c.roeConsistentYrs} years — consistent compounder`} className="text-emerald-600 text-xs">✓</span>}
                    </div>
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
                  <td className="px-3 py-2.5 text-right">
                    {c.ltp && c.high52w && c.low52w && c.high52w !== c.low52w ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-400 rounded-full"
                            style={{ width: `${Math.round(((c.ltp - c.low52w) / (c.high52w - c.low52w)) * 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 tabular-nums">
                          ₹{c.low52w.toFixed(0)} – ₹{c.high52w.toFixed(0)}
                        </div>
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{c.peRatio != null ? c.peRatio.toFixed(1) : "—"}</td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{c.roePercent != null ? c.roePercent.toFixed(1) : "—"}</td>
                  <td className={`px-3 py-2.5 text-xs text-right tabular-nums ${
                    c.revYoy != null ? (c.revYoy >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium") : "text-gray-400"
                  }`}>
                    {c.revYoy != null ? `${c.revYoy >= 0 ? "+" : ""}${c.revYoy.toFixed(1)}%` : "—"}
                  </td>
                  <td className={`px-3 py-2.5 text-xs text-right tabular-nums ${
                    c.ret1y != null ? (c.ret1y >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium") : "text-gray-400"
                  }`}>
                    {c.ret1y != null ? `${c.ret1y >= 0 ? "+" : ""}${c.ret1y.toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {c.weinsteinStage != null ? (
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        c.weinsteinStage === 2 ? "bg-emerald-100 text-emerald-700" :
                        c.weinsteinStage === 1 ? "bg-blue-100 text-blue-700" :
                        c.weinsteinStage === 3 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>{c.weinsteinStage}</span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className={`px-3 py-2.5 text-xs text-right tabular-nums ${
                    c.rsi == null ? "text-gray-400" : c.rsi >= 70 ? "text-red-600" : c.rsi <= 30 ? "text-emerald-600" : "text-gray-700"
                  }`}>
                    {c.rsi != null ? c.rsi.toFixed(0) : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-12 text-center text-sm text-gray-500">
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
        Fundamentals (P/E, ROE, D/E) shown for the top 200 companies by market cap. Updated quarterly.
      </p>
    </div>
  );
}
