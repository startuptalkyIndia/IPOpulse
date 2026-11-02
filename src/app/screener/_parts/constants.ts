import type { ScreenerCompany } from "./types";

export const MCAP_BANDS: Array<{ key: string; label: string; min: number | null; max: number | null }> = [
  { key: "any", label: "Any size", min: null, max: null },
  { key: "large", label: "Large cap (>₹50,000 Cr)", min: 50000, max: null },
  { key: "mid", label: "Mid cap (₹15,000–50,000 Cr)", min: 15000, max: 50000 },
  { key: "small", label: "Small cap (₹3,000–15,000 Cr)", min: 3000, max: 15000 },
  { key: "micro", label: "Micro / SME (<₹3,000 Cr)", min: null, max: 3000 },
];

export const TYPE_OPTIONS = [
  { key: "any", label: "All" },
  { key: "mainboard", label: "Mainboard only" },
  { key: "sme", label: "SME only" },
];

// Custom filter builder — closes the "only 7 fixed filter fields" competitor
// gap (vs. Screener.in's full custom-formula query language) WITHOUT the
// injection/sandboxing risk of evaluating user-written formulas: no eval(),
// no arbitrary expression language — just pick a metric, an operator, a
// value, and stack as many as you want, ANDed together. Covers every numeric
// field already on ScreenerCompany, including fields the 4 fixed Fundamental
// inputs never exposed (EPS, RSI, 1M/1Y return, Quality Score, volume, etc.)
export const METRICS: Array<{ key: string; label: string; get: (c: ScreenerCompany) => number | null }> = [
  { key: "marketCapCr", label: "Market Cap (₹Cr)", get: (c) => c.marketCapCr ?? null },
  { key: "peRatio", label: "P/E Ratio", get: (c) => c.peRatio ?? null },
  { key: "pbRatio", label: "P/B Ratio", get: (c) => c.pbRatio ?? null },
  { key: "roePercent", label: "ROE %", get: (c) => c.roePercent ?? null },
  { key: "debtToEquity", label: "Debt/Equity", get: (c) => c.debtToEquity ?? null },
  { key: "dividendYield", label: "Dividend Yield %", get: (c) => c.dividendYield ?? null },
  { key: "eps", label: "EPS", get: (c) => c.eps ?? null },
  { key: "revYoy", label: "Revenue YoY %", get: (c) => c.revYoy ?? null },
  { key: "profitYoy", label: "Profit YoY %", get: (c) => c.profitYoy ?? null },
  { key: "rsi", label: "RSI (14)", get: (c) => c.rsi ?? null },
  { key: "chg1d", label: "1D Change %", get: (c) => c.chg1d ?? null },
  { key: "ret1m", label: "1M Return %", get: (c) => c.ret1m ?? null },
  { key: "ret1y", label: "1Y Return %", get: (c) => c.ret1y ?? null },
  { key: "roeConsistentYrs", label: "ROE Consistent Years", get: (c) => c.roeConsistentYrs ?? null },
  { key: "qualityOverall", label: "Quality Score", get: (c) => c.qualityOverall ?? null },
  { key: "volume", label: "Volume", get: (c) => c.volume ?? null },
];

export const OPERATORS: Array<{ key: string; label: string; test: (a: number, b: number) => boolean }> = [
  { key: "gt", label: ">", test: (a, b) => a > b },
  { key: "gte", label: "≥", test: (a, b) => a >= b },
  { key: "lt", label: "<", test: (a, b) => a < b },
  { key: "lte", label: "≤", test: (a, b) => a <= b },
  { key: "eq", label: "=", test: (a, b) => a === b },
  { key: "neq", label: "≠", test: (a, b) => a !== b },
];

export const GRADE_BADGE_COLORS: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "A": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "B": "bg-blue-50 text-blue-700 border-blue-200",
  "C": "bg-amber-50 text-amber-700 border-amber-200",
  "D": "bg-orange-50 text-orange-700 border-orange-200",
  "F": "bg-red-50 text-red-700 border-red-200",
};

export const SAVED_SCREENS_KEY = "ipopulse.screener.savedScreens.v1";
