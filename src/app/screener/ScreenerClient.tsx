"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, X, Sliders, Download, Bookmark, Star } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { ScreenerCompany, CustomFilter, SortKey, SavedScreen } from "./_parts/types";
import { filterAndSort } from "./_parts/filtering";
import { exportCsv } from "./_parts/csv";
import { ScreenerTable } from "./_parts/ScreenerTable";
import { QuickScreens } from "./_parts/QuickScreens";
import { FundamentalsPanel } from "./_parts/FundamentalsPanel";
import { CustomFilterBuilder } from "./_parts/CustomFilterBuilder";
import {
  MCAP_BANDS,
  TYPE_OPTIONS,
  METRICS,
  OPERATORS,
  GRADE_BADGE_COLORS,
  SAVED_SCREENS_KEY,
} from "./_parts/constants";

export type { ScreenerCompany };

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

  // Custom filter builder — see METRICS/OPERATORS above
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [showCustomFilters, setShowCustomFilters] = useState(false);

  function addCustomFilter() {
    setCustomFilters((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, metric: METRICS[0].key, op: "gt", value: "" }]);
    setShowCustomFilters(true);
  }
  function updateCustomFilter(id: string, patch: Partial<CustomFilter>) {
    setCustomFilters((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function removeCustomFilter(id: string) {
    setCustomFilters((prev) => prev.filter((f) => f.id !== id));
  }

  // Saved screens — per-browser convenience (localStorage), not account state:
  // a filter combo someone wants to revisit, same idea as Screener.in's saved
  // screens. Never blocks rendering if storage is unavailable (private window,
  // blocked site data) — falls back to an empty list.
  const [savedScreens, setSavedScreens] = useState<SavedScreen[]>([]);
  const [screenName, setScreenName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_SCREENS_KEY);
      if (raw) setSavedScreens(JSON.parse(raw));
    } catch {
      // ignore — private window / blocked storage
    }
  }, []);

  function persistSavedScreens(next: SavedScreen[]) {
    setSavedScreens(next);
    try {
      localStorage.setItem(SAVED_SCREENS_KEY, JSON.stringify(next));
    } catch {
      // ignore — private window / blocked storage; the in-memory state above still updates
    }
  }

  function currentFilters(): SavedScreen["filters"] {
    return { search, sector, mcapBand, type, peMax, roeMin, debtMax, divMin, requireFundamentals, moatOnly, uptrendOnly, compounderOnly, sortBy, customFilters };
  }

  function saveCurrentScreen() {
    const name = screenName.trim();
    if (!name) return;
    const next = [...savedScreens.filter((s) => s.name !== name), { name, filters: currentFilters() }];
    persistSavedScreens(next);
    setScreenName("");
    setShowSaveInput(false);
  }

  function loadScreen(s: SavedScreen) {
    const f = s.filters;
    setSearch(f.search); setSector(f.sector); setMcapBand(f.mcapBand); setType(f.type);
    setPeMax(f.peMax); setRoeMin(f.roeMin); setDebtMax(f.debtMax); setDivMin(f.divMin);
    setRequireFundamentals(f.requireFundamentals);
    setMoatOnly(f.moatOnly); setUptrendOnly(f.uptrendOnly); setCompounderOnly(f.compounderOnly);
    setSortBy(f.sortBy);
    setCustomFilters(f.customFilters ?? []); // ?? [] guards screens saved before this field existed
    setShowFundamentals(true);
    if ((f.customFilters ?? []).length > 0) setShowCustomFilters(true);
  }

  function deleteScreen(name: string) {
    persistSavedScreens(savedScreens.filter((s) => s.name !== name));
  }

  const filteredAll = useMemo(() => {
    return filterAndSort(seed, { search, sector, mcapBand, type, peMax, roeMin, debtMax, divMin, requireFundamentals, moatOnly, uptrendOnly, compounderOnly, sortBy, customFilters });
  }, [seed, search, sector, mcapBand, type, peMax, roeMin, debtMax, divMin, requireFundamentals, moatOnly, uptrendOnly, compounderOnly, sortBy, customFilters]);

  // Table renders at most 200 rows for performance; CSV export uses the full
  // filtered set (filteredAll) below it, since a serious screener user filtering
  // down to, say, 350 mid-caps expects the export to have all 350, not just the
  // first 200 shown on screen.
  const filtered = useMemo(() => filteredAll.slice(0, 200), [filteredAll]);

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
    setCustomFilters([]);
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
      <QuickScreens
        applyPreset={applyPreset}
        moatOnly={moatOnly}
        uptrendOnly={uptrendOnly}
        compounderOnly={compounderOnly}
        setMoatOnly={setMoatOnly}
        setUptrendOnly={setUptrendOnly}
        setCompounderOnly={setCompounderOnly}
      />

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
          <button
            onClick={() => setShowSaveInput((s) => !s)}
            className="text-xs text-gray-500 hover:text-indigo-600 inline-flex items-center gap-1"
          >
            <Bookmark className="w-3 h-3" /> Save this screen
          </button>
        </div>

        {showSaveInput ? (
          <div className="flex items-center gap-2 mb-3 -mt-1">
            <input
              type="text"
              className="input flex-1 text-sm"
              placeholder="Name this screen, e.g. 'Low P/E large caps'"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveCurrentScreen(); }}
              autoFocus
            />
            <button onClick={saveCurrentScreen} className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
              Save
            </button>
          </div>
        ) : null}

        {savedScreens.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs text-gray-500 inline-flex items-center gap-1"><Star className="w-3 h-3" /> Saved:</span>
            {savedScreens.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1 text-[11px] bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-full pl-2.5 pr-1 py-1">
                <button onClick={() => loadScreen(s)} className="font-medium">{s.name}</button>
                <button onClick={() => deleteScreen(s.name)} className="text-gray-400 hover:text-red-600 px-1" aria-label={`Delete ${s.name}`}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

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
          <FundamentalsPanel
            peMax={peMax} setPeMax={setPeMax}
            roeMin={roeMin} setRoeMin={setRoeMin}
            debtMax={debtMax} setDebtMax={setDebtMax}
            divMin={divMin} setDivMin={setDivMin}
            requireFundamentals={requireFundamentals} setRequireFundamentals={setRequireFundamentals}
            applyPreset={applyPreset}
          />
        ) : null}

        {/* Custom filter builder — pick any metric + operator + value, stack as
            many as needed. Not a formula language (no eval, no cross-metric
            math) — deliberately scoped to avoid evaluating arbitrary
            user-written expressions, while still covering every numeric field
            the 4 fixed Fundamental inputs above don't (EPS, RSI, returns,
            Quality Score, volume, ...). */}
        <CustomFilterBuilder
          customFilters={customFilters}
          showCustomFilters={showCustomFilters}
          setShowCustomFilters={setShowCustomFilters}
          updateCustomFilter={updateCustomFilter}
          removeCustomFilter={removeCustomFilter}
          addCustomFilter={addCustomFilter}
        />
      </div>

      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="text-sm text-gray-600">
          {filteredAll.length > filtered.length ? (
            <>Showing top <span className="font-semibold text-gray-900">{filtered.length}</span> of <span className="font-semibold text-gray-900">{filteredAll.length}</span> matches ({seed.length} total)</>
          ) : (
            <>Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of {seed.length} companies</>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => exportCsv(filteredAll)}
            disabled={filteredAll.length === 0}
            className="text-xs font-medium text-gray-600 hover:text-indigo-700 inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            title={`Export all ${filteredAll.length} matching rows as CSV`}
          >
            <Download className="w-3.5 h-3.5" /> Export CSV{filteredAll.length > 0 ? ` (${filteredAll.length})` : ""}
          </button>
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
            <option value="quality">Quality Score ↓</option>
            </select>
          </div>
        </div>
      </div>

      <ScreenerTable filtered={filtered} />

      <p className="text-[11px] text-gray-500">
        Prices from NSE EOD bhavcopy · 52W high/low from 12 months of daily data · 1D change vs previous close ·
        Fundamentals (P/E, ROE, D/E) shown for the top 200 companies by market cap. Updated quarterly.
      </p>
    </div>
  );
}
