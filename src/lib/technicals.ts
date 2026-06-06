/**
 * Technical Indicators — objective math computed from daily close prices.
 *
 * Ported from the Stock Analysis quant system (top10.py technicals + levels.py).
 * These are factual calculations (RSI, moving averages, Weinstein stage,
 * Minervini trend-template, relative strength) — NOT buy/sell recommendations.
 *
 * Requires ~210+ daily closes for the full stage/trend-template analysis.
 * Gracefully returns partial data when fewer days are available.
 */

export interface Technicals {
  price: number;
  ma20: number | null;
  ma50: number | null;
  ma150: number | null;
  ma200: number | null;
  ma200Rising: boolean | null;   // 200-MA higher than ~1 month ago
  rsi: number;                   // 14-period RSI
  stage: 1 | 2 | 3 | 4 | null;   // Weinstein stage
  stageLabel: string;
  trendTemplate: number;         // Minervini trend-template score 0-7
  relStrength: number | null;    // 3-month return vs Nifty (percentage points)
  fromHigh: number;              // % from 52-week high (negative = below)
  fromLow: number;               // % above 52-week low
  high52w: number;
  low52w: number;
  // Multi-timeframe returns (%)
  ret1d: number | null;
  ret1w: number | null;
  ret1m: number | null;
  ret3m: number | null;
  ret6m: number | null;
  ret1y: number | null;
  // Support / resistance (volatility-aware)
  support20: number;
  resist20: number;
  atr: number;                   // 14-period Average True Range
  // Data quality
  daysOfData: number;
  fullAnalysis: boolean;         // true if >=210 days available
}

function sma(c: number[], period: number, endIdx: number): number | null {
  if (endIdx + 1 < period) return null;
  let sum = 0;
  for (let i = endIdx - period + 1; i <= endIdx; i++) sum += c[i];
  return sum / period;
}

function rsi(c: number[], period = 14): number {
  if (c.length < period + 1) return 50;
  let gain = 0, loss = 0;
  for (let k = c.length - period; k < c.length; k++) {
    const d = c[k] - c[k - 1];
    if (d > 0) gain += d; else loss -= d;
  }
  if (loss === 0) return 100;
  return 100 - 100 / (1 + (gain / period) / (loss / period));
}

function atr(high: number[], low: number[], close: number[], period = 14): number {
  const trs: number[] = [];
  for (let i = 1; i < close.length; i++) {
    const tr = Math.max(
      high[i] - low[i],
      Math.abs(high[i] - close[i - 1]),
      Math.abs(low[i] - close[i - 1]),
    );
    trs.push(tr);
  }
  if (trs.length < period) return trs.length ? trs.reduce((a, b) => a + b, 0) / trs.length : 0;
  return trs.slice(-period).reduce((a, b) => a + b, 0) / period;
}

const STAGE_LABELS: Record<number, string> = {
  1: "Stage 1 — Basing (accumulation)",
  2: "Stage 2 — Advancing (uptrend)",
  3: "Stage 3 — Topping (distribution)",
  4: "Stage 4 — Declining (downtrend)",
};

/**
 * Compute technical indicators.
 * @param close - daily close prices, oldest first
 * @param high  - daily highs (same length as close)
 * @param low   - daily lows (same length as close)
 * @param niftyClose - Nifty 50 daily closes for relative strength (oldest first); optional
 */
export function computeTechnicals(
  close: number[],
  high: number[],
  low: number[],
  niftyClose?: number[],
): Technicals | null {
  const n = close.length;
  if (n < 20) return null;

  const price = close[n - 1];
  const full = n >= 210;

  const ma20 = sma(close, 20, n - 1);
  const ma50 = sma(close, 50, n - 1);
  const ma150 = sma(close, 150, n - 1);
  const ma200 = sma(close, 200, n - 1);
  const ma200_1moAgo = sma(close, 200, n - 23); // 200-MA ~1 month ago for slope
  const ma200Rising = ma200 != null && ma200_1moAgo != null ? ma200 > ma200_1moAgo : null;

  const high52w = Math.max(...(high.length >= 252 ? high.slice(-252) : high));
  const low52w = Math.min(...(low.length >= 252 ? low.slice(-252) : low));

  // Minervini trend-template (0-7)
  let tt = 0;
  if (full && ma150 != null && ma200 != null) {
    if (price > ma150 && price > ma200) tt++;
    if (ma150 > ma200) tt++;
    if (ma200Rising) tt++;
    if (ma50 != null && ma50 > ma150 && ma150 > ma200) tt++;
    if (ma50 != null && price > ma50) tt++;
    if (price >= low52w * 1.30) tt++;
    if (price >= high52w * 0.75) tt++;
  }

  // Weinstein stage
  let stage: 1 | 2 | 3 | 4 | null = null;
  if (full && ma200 != null) {
    if (price > ma200 && ma200Rising) stage = 2;
    else if (price > ma200) stage = 1;
    else if (ma200_1moAgo != null && ma200 < ma200_1moAgo && price < ma200) stage = 4;
    else stage = 3;
  }

  // Relative strength vs Nifty (3-month, ~63 trading days)
  let relStrength: number | null = null;
  if (niftyClose && niftyClose.length >= 63 && n >= 63) {
    const stock3m = ((price - close[n - 63]) / close[n - 63]) * 100;
    const idx3m = ((niftyClose[niftyClose.length - 1] - niftyClose[niftyClose.length - 63]) / niftyClose[niftyClose.length - 63]) * 100;
    relStrength = stock3m - idx3m;
  }

  // Multi-timeframe returns
  const retAt = (daysBack: number): number | null => {
    if (n <= daysBack) return null;
    const prev = close[n - 1 - daysBack];
    return prev > 0 ? ((price - prev) / prev) * 100 : null;
  };

  return {
    price,
    ma20, ma50, ma150, ma200, ma200Rising,
    rsi: rsi(close),
    stage,
    stageLabel: stage ? STAGE_LABELS[stage] : "Insufficient history",
    trendTemplate: tt,
    relStrength,
    fromHigh: ((price - high52w) / high52w) * 100,
    fromLow: ((price - low52w) / low52w) * 100,
    high52w, low52w,
    ret1d: retAt(1),
    ret1w: retAt(5),
    ret1m: retAt(21),
    ret3m: retAt(63),
    ret6m: retAt(126),
    ret1y: retAt(252),
    support20: Math.min(...low.slice(-20)),
    resist20: Math.max(...high.slice(-20)),
    atr: atr(high, low, close),
    daysOfData: n,
    fullAnalysis: full,
  };
}
