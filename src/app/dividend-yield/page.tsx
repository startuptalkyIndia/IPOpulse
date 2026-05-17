"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useState, useMemo } from "react";
import { TrendingUp, Star, Info } from "lucide-react";

// Static metadata cannot be exported from a "use client" file — handled via generateMetadata in a server wrapper.
// We keep this as a client component for interactive filtering/sorting.

interface DividendStock {
  name: string;
  symbol: string;
  slug: string;
  sector: string;
  dividendYield: number;
  annualDividend: number;
  faceValue: number;
  payoutRatio: number;
  marketCapCr: number;
  peRatio: number;
  consecutiveYears: number;
  type: "PSU" | "Private" | "MNC";
  exDateApprox: string;
}

const DIVIDEND_STOCKS: DividendStock[] = [
  // PSU
  {
    name: "Coal India",
    symbol: "COALINDIA",
    slug: "coal-india",
    sector: "Mining",
    dividendYield: 8.5,
    annualDividend: 24.5,
    faceValue: 10,
    payoutRatio: 74,
    marketCapCr: 218000,
    peRatio: 8.5,
    consecutiveYears: 14,
    type: "PSU",
    exDateApprox: "Jan–Mar (Q3 results)",
  },
  {
    name: "ONGC",
    symbol: "ONGC",
    slug: "oil-and-natural-gas-corporation",
    sector: "Oil & Gas",
    dividendYield: 5.8,
    annualDividend: 11.25,
    faceValue: 5,
    payoutRatio: 42,
    marketCapCr: 250000,
    peRatio: 7.2,
    consecutiveYears: 22,
    type: "PSU",
    exDateApprox: "Jan–Feb (interim) + Jul (final)",
  },
  {
    name: "Indian Oil Corporation",
    symbol: "IOC",
    slug: "indian-oil-corporation",
    sector: "Oil & Gas",
    dividendYield: 6.2,
    annualDividend: 9.0,
    faceValue: 10,
    payoutRatio: 52,
    marketCapCr: 190000,
    peRatio: 8.4,
    consecutiveYears: 18,
    type: "PSU",
    exDateApprox: "Feb (interim) + Jul (final)",
  },
  {
    name: "BPCL",
    symbol: "BPCL",
    slug: "bharat-petroleum-corporation",
    sector: "Oil & Gas",
    dividendYield: 4.8,
    annualDividend: 13.0,
    faceValue: 10,
    payoutRatio: 48,
    marketCapCr: 152000,
    peRatio: 9.8,
    consecutiveYears: 16,
    type: "PSU",
    exDateApprox: "Feb (interim) + Jun (final)",
  },
  {
    name: "GAIL India",
    symbol: "GAIL",
    slug: "gail-india",
    sector: "Oil & Gas",
    dividendYield: 3.8,
    annualDividend: 6.5,
    faceValue: 10,
    payoutRatio: 38,
    marketCapCr: 110000,
    peRatio: 12.5,
    consecutiveYears: 20,
    type: "PSU",
    exDateApprox: "Jan (interim) + Jun (final)",
  },
  {
    name: "Power Grid Corporation",
    symbol: "POWERGRID",
    slug: "power-grid-corporation-of-india",
    sector: "Power",
    dividendYield: 3.6,
    annualDividend: 9.5,
    faceValue: 10,
    payoutRatio: 58,
    marketCapCr: 268000,
    peRatio: 16.8,
    consecutiveYears: 17,
    type: "PSU",
    exDateApprox: "Feb (interim) + Aug (final)",
  },
  {
    name: "NTPC",
    symbol: "NTPC",
    slug: "ntpc",
    sector: "Power",
    dividendYield: 2.8,
    annualDividend: 4.5,
    faceValue: 10,
    payoutRatio: 30,
    marketCapCr: 332000,
    peRatio: 17.5,
    consecutiveYears: 24,
    type: "PSU",
    exDateApprox: "Feb (interim) + Sep (final)",
  },
  {
    name: "Petronet LNG",
    symbol: "PETRONET",
    slug: "petronet-lng",
    sector: "Oil & Gas",
    dividendYield: 4.2,
    annualDividend: 9.0,
    faceValue: 10,
    payoutRatio: 44,
    marketCapCr: 56000,
    peRatio: 10.5,
    consecutiveYears: 12,
    type: "PSU",
    exDateApprox: "Mar (interim) + Jul (final)",
  },
  {
    name: "Bharat Electronics",
    symbol: "BEL",
    slug: "bharat-electronics",
    sector: "Defence",
    dividendYield: 0.9,
    annualDividend: 2.4,
    faceValue: 1,
    payoutRatio: 22,
    marketCapCr: 220000,
    peRatio: 52,
    consecutiveYears: 15,
    type: "PSU",
    exDateApprox: "Aug–Sep (final)",
  },
  {
    name: "Engineers India",
    symbol: "ENGINERSIN",
    slug: "engineers-india",
    sector: "Engineering",
    dividendYield: 3.8,
    annualDividend: 5.0,
    faceValue: 5,
    payoutRatio: 60,
    marketCapCr: 13500,
    peRatio: 16.2,
    consecutiveYears: 18,
    type: "PSU",
    exDateApprox: "Jul–Aug (final)",
  },
  // Private
  {
    name: "HCL Technologies",
    symbol: "HCLTECH",
    slug: "hcl-technologies",
    sector: "IT Services",
    dividendYield: 3.6,
    annualDividend: 48.0,
    faceValue: 2,
    payoutRatio: 72,
    marketCapCr: 468000,
    peRatio: 28.5,
    consecutiveYears: 12,
    type: "Private",
    exDateApprox: "Quarterly (Jan/Apr/Jul/Oct)",
  },
  {
    name: "Infosys",
    symbol: "INFY",
    slug: "infosys",
    sector: "IT Services",
    dividendYield: 2.9,
    annualDividend: 42.0,
    faceValue: 5,
    payoutRatio: 58,
    marketCapCr: 622000,
    peRatio: 24.8,
    consecutiveYears: 22,
    type: "Private",
    exDateApprox: "Quarterly (Jan/Apr/Oct) + final",
  },
  {
    name: "ITC",
    symbol: "ITC",
    slug: "itc",
    sector: "FMCG",
    dividendYield: 3.3,
    annualDividend: 15.5,
    faceValue: 1,
    payoutRatio: 80,
    marketCapCr: 520000,
    peRatio: 27.5,
    consecutiveYears: 25,
    type: "Private",
    exDateApprox: "Jul (final)",
  },
  {
    name: "Hero MotoCorp",
    symbol: "HEROMOTOCO",
    slug: "hero-motocorp",
    sector: "Automobiles",
    dividendYield: 3.1,
    annualDividend: 100.0,
    faceValue: 2,
    payoutRatio: 46,
    marketCapCr: 88000,
    peRatio: 21.5,
    consecutiveYears: 18,
    type: "Private",
    exDateApprox: "Jul–Aug (final) + special",
  },
  {
    name: "Bajaj Auto",
    symbol: "BAJAJ-AUTO",
    slug: "bajaj-auto",
    sector: "Automobiles",
    dividendYield: 1.6,
    annualDividend: 140.0,
    faceValue: 10,
    payoutRatio: 52,
    marketCapCr: 265000,
    peRatio: 32.5,
    consecutiveYears: 20,
    type: "Private",
    exDateApprox: "Jun–Jul (final)",
  },
  {
    name: "TCS",
    symbol: "TCS",
    slug: "tata-consultancy-services",
    sector: "IT Services",
    dividendYield: 1.6,
    annualDividend: 61.0,
    faceValue: 1,
    payoutRatio: 42,
    marketCapCr: 1310000,
    peRatio: 26.5,
    consecutiveYears: 18,
    type: "Private",
    exDateApprox: "Quarterly",
  },
  {
    name: "VST Industries",
    symbol: "VSTIND",
    slug: "vst-industries",
    sector: "FMCG",
    dividendYield: 2.8,
    annualDividend: 110.0,
    faceValue: 10,
    payoutRatio: 68,
    marketCapCr: 4800,
    peRatio: 24.2,
    consecutiveYears: 20,
    type: "Private",
    exDateApprox: "Jun–Jul (final) + special",
  },
  {
    name: "Hindustan Unilever",
    symbol: "HINDUNILVR",
    slug: "hindustan-unilever",
    sector: "FMCG",
    dividendYield: 1.7,
    annualDividend: 40.0,
    faceValue: 1,
    payoutRatio: 85,
    marketCapCr: 558000,
    peRatio: 54.0,
    consecutiveYears: 30,
    type: "Private",
    exDateApprox: "Biannual (Jun + Nov)",
  },
  // MNC
  {
    name: "Nestlé India",
    symbol: "NESTLEIND",
    slug: "nestle-india",
    sector: "FMCG",
    dividendYield: 1.8,
    annualDividend: 405.0,
    faceValue: 1,
    payoutRatio: 88,
    marketCapCr: 218000,
    peRatio: 70.5,
    consecutiveYears: 28,
    type: "MNC",
    exDateApprox: "Biannual (Jan + Jun)",
  },
  {
    name: "Colgate-Palmolive India",
    symbol: "COLPAL",
    slug: "colgate-palmolive-india",
    sector: "FMCG",
    dividendYield: 1.3,
    annualDividend: 38.0,
    faceValue: 1,
    payoutRatio: 70,
    marketCapCr: 56000,
    peRatio: 55.0,
    consecutiveYears: 32,
    type: "MNC",
    exDateApprox: "Biannual (Jun + Nov)",
  },
  {
    name: "Abbott India",
    symbol: "ABBOTINDIA",
    slug: "abbott-india",
    sector: "Pharmaceuticals",
    dividendYield: 0.5,
    annualDividend: 130.0,
    faceValue: 10,
    payoutRatio: 35,
    marketCapCr: 28000,
    peRatio: 42.5,
    consecutiveYears: 15,
    type: "MNC",
    exDateApprox: "Jul–Aug (final)",
  },
  {
    name: "Pfizer India",
    symbol: "PFIZER",
    slug: "pfizer-india",
    sector: "Pharmaceuticals",
    dividendYield: 0.6,
    annualDividend: 130.0,
    faceValue: 10,
    payoutRatio: 55,
    marketCapCr: 23000,
    peRatio: 38.2,
    consecutiveYears: 20,
    type: "MNC",
    exDateApprox: "Jun–Jul (final)",
  },
  {
    name: "SBI",
    symbol: "SBIN",
    slug: "state-bank-of-india",
    sector: "Banking",
    dividendYield: 2.0,
    annualDividend: 13.7,
    faceValue: 1,
    payoutRatio: 22,
    marketCapCr: 700000,
    peRatio: 11.0,
    consecutiveYears: 16,
    type: "PSU",
    exDateApprox: "May–Jun (final)",
  },
  {
    name: "Balmer Lawrie",
    symbol: "BALMLAWRIE",
    slug: "balmer-lawrie",
    sector: "Diversified",
    dividendYield: 3.5,
    annualDividend: 7.5,
    faceValue: 10,
    payoutRatio: 55,
    marketCapCr: 3500,
    peRatio: 11.5,
    consecutiveYears: 14,
    type: "PSU",
    exDateApprox: "Jul–Aug (final)",
  },
  {
    name: "Torrent Pharmaceuticals",
    symbol: "TORNTPHARM",
    slug: "torrent-pharmaceuticals",
    sector: "Pharmaceuticals",
    dividendYield: 1.4,
    annualDividend: 42.0,
    faceValue: 5,
    payoutRatio: 38,
    marketCapCr: 90000,
    peRatio: 34.5,
    consecutiveYears: 18,
    type: "Private",
    exDateApprox: "Jul–Aug (final)",
  },
];

type SortKey = "yield" | "years" | "marketCap";
type FilterType = "All" | "PSU" | "Private" | "MNC";

const ARISTOCRATS = DIVIDEND_STOCKS.filter((s) => s.consecutiveYears >= 10).map((s) => s.name);

export default function DividendYieldPage() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [sort, setSort] = useState<SortKey>("yield");

  const filtered = useMemo(() => {
    let list = filter === "All" ? DIVIDEND_STOCKS : DIVIDEND_STOCKS.filter((s) => s.type === filter);
    return [...list].sort((a, b) => {
      if (sort === "yield") return b.dividendYield - a.dividendYield;
      if (sort === "years") return b.consecutiveYears - a.consecutiveYears;
      return b.marketCapCr - a.marketCapCr;
    });
  }, [filter, sort]);

  const avgYield = (filtered.reduce((s, r) => s + r.dividendYield, 0) / filtered.length).toFixed(1);
  const aristocratCount = filtered.filter((s) => s.consecutiveYears >= 10).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Best Dividend Stocks India 2026
          </h1>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl">
          High dividend yield companies on NSE/BSE — curated list of consistent dividend payers. Ideal for
          passive income and retirement portfolios. Yields are approximate based on recent declared dividends.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">Companies listed</div>
          <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">Avg yield (filtered)</div>
          <div className="text-2xl font-bold text-indigo-600">{avgYield}%</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">Dividend Aristocrats</div>
          <div className="text-2xl font-bold text-yellow-600">{aristocratCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">Highest yield</div>
          <div className="text-2xl font-bold text-green-600">
            {Math.max(...filtered.map((s) => s.dividendYield)).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Aristocrats callout */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
        <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-yellow-900 mb-1">
            Dividend Aristocrats India — 10+ years of consistent dividends
          </div>
          <div className="text-xs text-yellow-800 leading-relaxed">
            {ARISTOCRATS.join(" · ")}
          </div>
        </div>
      </div>

      {/* Filter + Sort controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Type filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["All", "PSU", "Private", "MNC"] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === t
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Sort by:</span>
          {(
            [
              { key: "yield", label: "Yield %" },
              { key: "years", label: "Consistency" },
              { key: "marketCap", label: "Market Cap" },
            ] as { key: SortKey; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-2.5 py-1 rounded-md border transition-colors ${
                sort === key
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-3 py-3 w-8">#</th>
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3">Sector</th>
              <th className="px-3 py-3 text-right">Yield %</th>
              <th className="px-3 py-3 text-right">Annual ₹ Div</th>
              <th className="px-3 py-3 text-right">Payout %</th>
              <th className="px-3 py-3 text-right">P/E</th>
              <th className="px-3 py-3 text-right">Mkt Cap (₹Cr)</th>
              <th className="px-3 py-3 text-center">Type</th>
              <th className="px-3 py-3 text-right">Consistent For</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const isAristocrat = s.consecutiveYears >= 10;
              return (
                <tr key={s.slug} className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors">
                  <td className="px-3 py-3 text-xs text-gray-400 tabular-nums">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {isAristocrat && <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                      <div>
                        <Link
                          href={`/ticker/${s.slug}`}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                        >
                          {s.name}
                        </Link>
                        <div className="text-[11px] text-gray-400">{s.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{s.sector}</td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        s.dividendYield >= 5
                          ? "text-green-600"
                          : s.dividendYield >= 2.5
                          ? "text-indigo-600"
                          : "text-gray-700"
                      }`}
                    >
                      {s.dividendYield.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-gray-800 tabular-nums font-medium">
                    ₹{s.annualDividend.toFixed(1)}
                  </td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600 tabular-nums">
                    {s.payoutRatio}%
                  </td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600 tabular-nums">
                    {s.peRatio.toFixed(1)}x
                  </td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600 tabular-nums">
                    {s.marketCapCr >= 100000
                      ? `₹${(s.marketCapCr / 100000).toFixed(1)}L Cr`
                      : `₹${s.marketCapCr.toLocaleString("en-IN")} Cr`}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        s.type === "PSU"
                          ? "bg-blue-50 text-blue-700"
                          : s.type === "MNC"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {s.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-xs text-gray-600 tabular-nums">
                    {s.consecutiveYears} yrs
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info box */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed space-y-1.5">
          <p>
            <strong>Dividend yield</strong> = (Annual dividend per share / Current market price) × 100.
            Yields shown are approximate based on recently declared dividends and prevailing prices — they
            fluctuate daily as share prices change.
          </p>
          <p>
            <strong>Payout ratio</strong> = % of profits paid as dividends. A payout above 80% can be
            unsustainable; below 40% may indicate room for future increases.
          </p>
          <p>
            <strong>Ex-dividend date</strong> = You must buy the stock before this date to receive the
            dividend. Sellers after ex-date do not receive the declared dividend.
          </p>
          <p className="text-indigo-600">
            This is a curated educational list — not investment advice. Verify dividend declarations on{" "}
            <a
              href="https://www.bseindia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              BSE India
            </a>{" "}
            before investing.
          </p>
        </div>
      </div>

      {/* Learn more link */}
      <div className="text-center">
        <Link
          href="/learn/what-is-dividend"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Learn: What is a Dividend and how does dividend investing work? →
        </Link>
      </div>
    </div>
  );
}
