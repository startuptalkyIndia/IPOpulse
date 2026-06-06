/**
 * Quality Signals — multi-year consistency + cash-flow quality + cyclical-peak detection.
 *
 * Ported from the Stock Analysis quant system (deep_fundamentals.py + cyclical.py).
 * The "Buffett / Mukherjea test": a one-year ROE snapshot can be a fluke; a real
 * compounder shows CONSISTENT high ROE, steady revenue growth, and earnings BACKED
 * BY CASH (operating cash flow >= net income, not just accruals).
 *
 * All computed from annual_financials (Screener data) IPOpulse already has.
 * Factual metrics — not investment advice.
 */

export interface AnnualPoint {
  sales: number | null;
  netProfit: number | null;
  roe: number | null;          // already a % from Screener
  cashFromOps: number | null;
}

export interface QualitySignals {
  // Revenue consistency
  revCagr: number | null;       // compounded annual growth over the span
  revGrowthYears: number;       // # of YoY-up years
  revTotalYears: number;
  // ROE consistency
  roeHistory: number[];         // newest first
  roeGoodYears: number;         // # years with ROE >= 15%
  roeYears: number;
  roeConsistent: boolean;       // >=4 years of 15%+ ROE
  // Cash-flow quality
  ocfToNi: number | null;       // operating cash flow / net income (latest year both exist)
  cashBacked: "strong" | "ok" | "weak" | null;  // >1 strong, 0.6-1 ok, <0.6 weak
  ocfPositiveYears: number;
  ocfTotalYears: number;
}

const CYCLICAL_KEYWORDS = [
  "auto", "motorcycle", "vehicle", "steel", "iron", "aluminum", "aluminium", "copper", "zinc",
  "metal", "mining", "cement", "building material", "construction material", "oil", "gas",
  "petroleum", "refin", "coal", "chemical", "commodit", "paper", "packaging", "shipping", "marine",
  "real estate", "realty", "homebuild", "sugar", "tyre", "tire", "textile", "capital goods",
  "machinery", "infrastructure", "engineering", "airline", "hotel",
];

export interface CyclicalRead {
  badge: "🌀" | "🔄";
  severity: "warning" | "info";
  message: string;
}

/**
 * Compute multi-year quality signals from annual financials (newest first).
 */
export function computeQualitySignals(annual: AnnualPoint[]): QualitySignals | null {
  if (annual.length < 2) return null;

  // annual is newest-first. Revenue YoY-up count + CAGR over span.
  const rev = annual.map(a => a.sales).filter((v): v is number => v != null && v > 0);
  let revGrowthYears = 0;
  for (let i = 0; i < rev.length - 1; i++) {
    if (rev[i] > rev[i + 1]) revGrowthYears++;  // newer > older
  }
  const revTotalYears = Math.max(rev.length - 1, 0);
  let revCagr: number | null = null;
  if (rev.length >= 2) {
    const newest = rev[0];
    const oldest = rev[rev.length - 1];
    if (oldest > 0 && newest > 0) {
      revCagr = (Math.pow(newest / oldest, 1 / (rev.length - 1)) - 1) * 100;
    }
  }

  // ROE history
  const roeHistory = annual.map(a => a.roe).filter((v): v is number => v != null);
  const roeGoodYears = roeHistory.filter(r => r >= 15).length;
  const roeConsistent = roeGoodYears >= 4;

  // Cash-flow quality: OCF/NI for latest year where both exist
  let ocfToNi: number | null = null;
  for (const a of annual) {
    if (a.cashFromOps != null && a.netProfit != null && a.netProfit > 0) {
      ocfToNi = a.cashFromOps / a.netProfit;
      break;
    }
  }
  let cashBacked: "strong" | "ok" | "weak" | null = null;
  if (ocfToNi != null) {
    cashBacked = ocfToNi >= 1 ? "strong" : ocfToNi >= 0.6 ? "ok" : "weak";
  }
  const ocfValues = annual.map(a => a.cashFromOps).filter((v): v is number => v != null);
  const ocfPositiveYears = ocfValues.filter(v => v > 0).length;

  return {
    revCagr,
    revGrowthYears,
    revTotalYears,
    roeHistory,
    roeGoodYears,
    roeYears: roeHistory.length,
    roeConsistent,
    ocfToNi,
    cashBacked,
    ocfPositiveYears,
    ocfTotalYears: ocfValues.length,
  };
}

/**
 * Detect cyclical sector + possible peak-cycle earnings.
 * Returns null if not a cyclical sector.
 */
export function readCyclical(
  sector: string | null,
  industry: string | null,
  revGrowthPct: number | null,   // latest YoY revenue growth
  ret6m: number | null,
  ret3m: number | null,
  stage: number | null,
): CyclicalRead | null {
  const blob = `${industry ?? ""} ${sector ?? ""}`.toLowerCase();
  const isCyclical = CYCLICAL_KEYWORDS.some(k => blob.includes(k));
  if (!isCyclical) return null;

  const rg = revGrowthPct ?? 0;
  const falling =
    (ret6m != null && ret6m <= -8) ||
    (ret3m != null && ret3m <= -10) ||
    (stage === 3 || stage === 4);

  if (rg >= 12 && falling) {
    return {
      badge: "🌀",
      severity: "warning",
      message: `Cyclical-peak risk: strong revenue growth (+${rg.toFixed(0)}%) but the price is falling — the market may be pricing a cycle peak. A "cheap" P/E on peak earnings can be a value trap. Verify where the sector is in its cycle.`,
    };
  }
  return {
    badge: "🔄",
    severity: "info",
    message: "Cyclical sector — earnings rise and fall with the economic / commodity cycle, so today's growth and 'cheap' P/E may be near a cycle peak (fine if the cycle is still rising).",
  };
}
