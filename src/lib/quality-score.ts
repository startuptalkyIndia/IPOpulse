/**
 * Composite Quality Score — a single digestible score (Trendlyne DVM-style),
 * computed purely from fields already stored on Company (no new data source,
 * no schema change, no ingestion job). Added 2026-10-03 from a competitor gap
 * analysis: Trendlyne shows a Durability/Valuation/Momentum score per stock;
 * we previously only showed raw fundamentals, leaving a user to do this math
 * themselves for every company they scan.
 *
 * Three dimensions (0-100 each), an overall weighted score, a letter grade,
 * and a short green/red flag checklist — same spirit as Trendlyne's
 * Durability/Valuation/Momentum score and "Checklist" feature, built from
 * data we already have: ROE/ROCE/debt/margin for quality, P/E/P/B/dividend
 * yield for valuation, Weinstein stage/RSI/1Y return for momentum.
 *
 * This is objective math from stored ratios, not a recommendation — same
 * framing as technicals.ts's header comment.
 */

export interface QualityScoreInput {
  roePercent?: number | null;
  rocePercent?: number | null;
  debtToEquity?: number | null;
  operatingMargin?: number | null;
  roeConsistentYrs?: number | null;
  isMoat?: boolean | null;
  isCyclical?: boolean | null;
  cyclicalPeak?: boolean | null;
  peRatio?: number | null;
  pbRatio?: number | null;
  dividendYield?: number | null;
  rsi?: number | null;
  weinsteinStage?: number | null;
  ret1y?: number | null;
}

export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

export interface DimensionScore {
  score: number; // 0-100
  label: string;
}

export interface Flag {
  type: "green" | "red";
  text: string;
}

export interface QualityScore {
  overall: number; // 0-100
  grade: Grade;
  quality: DimensionScore;
  valuation: DimensionScore;
  momentum: DimensionScore;
  flags: Flag[];
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function labelFor(score: number): string {
  if (score >= 75) return "Strong";
  if (score >= 55) return "Good";
  if (score >= 40) return "Average";
  if (score >= 25) return "Weak";
  return "Poor";
}

function gradeFor(overall: number): Grade {
  if (overall >= 85) return "A+";
  if (overall >= 70) return "A";
  if (overall >= 55) return "B";
  if (overall >= 40) return "C";
  if (overall >= 25) return "D";
  return "F";
}

function scoreQuality(c: QualityScoreInput): number {
  let s = 50;
  if (c.roePercent != null) {
    if (c.roePercent >= 20) s += 25;
    else if (c.roePercent >= 15) s += 18;
    else if (c.roePercent >= 10) s += 8;
    else if (c.roePercent < 0) s -= 15;
  }
  if (c.rocePercent != null) {
    if (c.rocePercent >= 20) s += 10;
    else if (c.rocePercent >= 15) s += 6;
    else if (c.rocePercent >= 10) s += 2;
    else if (c.rocePercent < 0) s -= 10;
  }
  if (c.debtToEquity != null) {
    if (c.debtToEquity <= 0.3) s += 15;
    else if (c.debtToEquity <= 1) s += 8;
    else if (c.debtToEquity > 2) s -= 15;
  }
  if (c.operatingMargin != null) {
    if (c.operatingMargin >= 20) s += 10;
    else if (c.operatingMargin >= 10) s += 5;
    else if (c.operatingMargin < 0) s -= 10;
  }
  if (c.roeConsistentYrs != null) {
    if (c.roeConsistentYrs >= 5) s += 10;
    else if (c.roeConsistentYrs >= 3) s += 5;
  }
  if (c.isMoat) s += 10;
  if (c.isCyclical && c.cyclicalPeak) s -= 10;
  return clamp(s);
}

function scoreValuation(c: QualityScoreInput): number {
  let s = 50;
  if (c.peRatio != null && c.peRatio > 0) {
    if (c.peRatio < 15) s += 25;
    else if (c.peRatio < 25) s += 15;
    else if (c.peRatio < 40) s += 0;
    else if (c.peRatio < 60) s -= 15;
    else s -= 25;
  }
  if (c.pbRatio != null && c.pbRatio > 0) {
    if (c.pbRatio < 1) s += 15;
    else if (c.pbRatio < 3) s += 8;
    else if (c.pbRatio < 6) s -= 5;
    else s -= 15;
  }
  if (c.dividendYield != null) {
    if (c.dividendYield >= 3) s += 10;
    else if (c.dividendYield >= 1.5) s += 5;
  }
  return clamp(s);
}

function scoreMomentum(c: QualityScoreInput): number {
  let s = 50;
  if (c.weinsteinStage != null) {
    if (c.weinsteinStage === 2) s += 25;
    else if (c.weinsteinStage === 1) s += 5;
    else if (c.weinsteinStage === 3) s -= 10;
    else if (c.weinsteinStage === 4) s -= 25;
  }
  if (c.rsi != null) {
    if (c.rsi >= 45 && c.rsi <= 65) s += 15;
    else if (c.rsi > 65 && c.rsi <= 75) s += 5;
    else if (c.rsi > 75) s -= 10;
    else if (c.rsi < 30) s -= 5;
  }
  if (c.ret1y != null) {
    if (c.ret1y > 30) s += 20;
    else if (c.ret1y > 10) s += 10;
    else if (c.ret1y > 0) s += 5;
    else if (c.ret1y <= -15) s -= 15;
    else s -= 5;
  }
  return clamp(s);
}

function buildFlags(c: QualityScoreInput): Flag[] {
  const flags: Flag[] = [];
  if (c.roePercent != null && c.roePercent >= 20) flags.push({ type: "green", text: `High ROE (${c.roePercent.toFixed(1)}%)` });
  if (c.roePercent != null && c.roePercent < 0) flags.push({ type: "red", text: "Negative ROE" });
  if (c.debtToEquity != null && c.debtToEquity <= 0.3) flags.push({ type: "green", text: "Low debt (D/E ≤ 0.3)" });
  if (c.debtToEquity != null && c.debtToEquity > 2) flags.push({ type: "red", text: `High debt load (D/E ${c.debtToEquity.toFixed(1)})` });
  if (c.isMoat) flags.push({ type: "green", text: "Durable competitive moat" });
  if (c.roeConsistentYrs != null && c.roeConsistentYrs >= 5) flags.push({ type: "green", text: `Consistent high ROE for ${c.roeConsistentYrs}+ years` });
  if (c.weinsteinStage === 2) flags.push({ type: "green", text: "In confirmed uptrend (Stage 2)" });
  if (c.weinsteinStage === 4) flags.push({ type: "red", text: "In confirmed downtrend (Stage 4)" });
  if (c.isCyclical && c.cyclicalPeak) flags.push({ type: "red", text: "Cyclical business near a peak — buying high in the cycle" });
  if (c.peRatio != null && c.peRatio > 60) flags.push({ type: "red", text: `Very expensive valuation (P/E ${c.peRatio.toFixed(0)}x)` });
  if (c.peRatio != null && c.peRatio > 0 && c.peRatio < 15) flags.push({ type: "green", text: `Inexpensive valuation (P/E ${c.peRatio.toFixed(0)}x)` });
  return flags;
}

/**
 * Returns null when there isn't enough data to say anything meaningful —
 * same "fail gracefully, don't fake a score" rule as computeTechnicals.
 * Requires at least 2 of {roePercent, peRatio, rsi} to be non-null.
 */
export function computeQualityScore(c: QualityScoreInput): QualityScore | null {
  const coreFieldsPresent = [c.roePercent, c.peRatio, c.rsi].filter((v) => v != null).length;
  if (coreFieldsPresent < 2) return null;

  const quality = scoreQuality(c);
  const valuation = scoreValuation(c);
  const momentum = scoreMomentum(c);
  const overall = clamp(quality * 0.4 + valuation * 0.3 + momentum * 0.3);

  return {
    overall: Math.round(overall),
    grade: gradeFor(overall),
    quality: { score: Math.round(quality), label: labelFor(quality) },
    valuation: { score: Math.round(valuation), label: labelFor(valuation) },
    momentum: { score: Math.round(momentum), label: labelFor(momentum) },
    flags: buildFlags(c),
  };
}
