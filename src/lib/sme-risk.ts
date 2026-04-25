/**
 * SME IPO Risk Score — heuristic scoring engine.
 *
 * Inputs: an IPO record with subscriptions, anchors, basic numbers.
 * Output: 0-100 score (higher = lower risk) + color band + factor breakdown.
 *
 * The factors are based on patterns SEBI itself has flagged in SME IPOs:
 * - Very small issue size (< ₹30 Cr)  → pump candidate
 * - Excessive total subscription (>300x) → frenzy / circular bidding
 * - Weak QIB participation (< 1x QIB while retail >100x) → no institutional appetite
 * - Big lot value (> ₹2.5L) → restricts genuine retail
 * - No anchor investors → no institutional anchoring
 *
 * Strong-tier anchors (HDFC MF, SBI MF, ICICI Pru, Axis MF, Kotak MF, Mirae,
 * Nippon, ADIA, GIC Singapore, Government of Singapore) push score up.
 */

export interface SmeRiskInput {
  type: string;
  issueSizeCr: number | null;
  priceBandHigh: number | null;
  lotSize: number | null;
  latestSub: {
    retailX: number | null;
    hniX: number | null;
    qibX: number | null;
    totalX: number | null;
  } | null;
  anchorNames: string[];
  anchorTotalCr: number;
}

export interface SmeRiskFactor {
  label: string;
  delta: number; // signed contribution to score
  detail?: string;
}

export interface SmeRiskScore {
  score: number; // 0..100, higher = lower risk
  band: "lower" | "moderate" | "elevated" | "high";
  bandLabel: string;
  bandColorClass: string;
  factors: SmeRiskFactor[];
}

const STRONG_ANCHORS = [
  "hdfc", "sbi", "icici", "axis", "kotak", "mirae", "nippon",
  "adia", "abu dhabi", "gic", "government of singapore", "norges",
  "blackrock", "vanguard", "franklin", "aditya birla", "uti",
];

export function scoreSmeIpo(i: SmeRiskInput): SmeRiskScore {
  const factors: SmeRiskFactor[] = [];
  let score = 60; // neutral starting point for SME (slightly defensive)

  // Issue size
  if (i.issueSizeCr != null) {
    if (i.issueSizeCr < 25) {
      const d = -15;
      score += d;
      factors.push({ label: "Very small issue (<₹25 Cr)", delta: d, detail: "Small floats are easy to manipulate post-listing." });
    } else if (i.issueSizeCr < 50) {
      const d = -8;
      score += d;
      factors.push({ label: "Small issue (₹25–50 Cr)", delta: d });
    } else if (i.issueSizeCr >= 100) {
      const d = +8;
      score += d;
      factors.push({ label: "Healthy issue size (≥₹100 Cr)", delta: d });
    }
  }

  // Subscription patterns
  if (i.latestSub) {
    const total = i.latestSub.totalX ?? 0;
    const qib = i.latestSub.qibX ?? 0;
    const retail = i.latestSub.retailX ?? 0;

    if (total > 400) {
      const d = -18;
      score += d;
      factors.push({ label: "Frenzy subscription (>400x total)", delta: d, detail: "Extreme oversubscription often correlates with circular bidding and post-listing dumps." });
    } else if (total > 200) {
      const d = -10;
      score += d;
      factors.push({ label: "Heavy oversubscription (>200x)", delta: d });
    }

    if (qib >= 5) {
      const d = +12;
      score += d;
      factors.push({ label: "Strong QIB demand (≥5x)", delta: d, detail: "Institutional participation is a positive signal." });
    } else if (qib >= 2) {
      const d = +6;
      score += d;
      factors.push({ label: "Moderate QIB demand (≥2x)", delta: d });
    } else if (qib < 1 && retail > 50) {
      const d = -12;
      score += d;
      factors.push({ label: "Retail-only frenzy", delta: d, detail: "QIB <1x while retail >50x is a classic SME warning." });
    }
  } else {
    factors.push({ label: "Subscription data not yet available", delta: 0 });
  }

  // Lot value
  if (i.lotSize && i.priceBandHigh) {
    const lotValue = i.lotSize * i.priceBandHigh;
    if (lotValue > 250000) {
      const d = -8;
      score += d;
      factors.push({ label: `High lot value (₹${(lotValue / 1000).toFixed(0)}k)`, delta: d, detail: "Large lots restrict genuine retail and concentrate risk." });
    }
  }

  // Anchors
  if (i.anchorNames.length === 0) {
    const d = -10;
    score += d;
    factors.push({ label: "No anchor investors disclosed", delta: d, detail: "Lack of institutional anchoring is a yellow flag." });
  } else {
    const strong = i.anchorNames.filter((n) => STRONG_ANCHORS.some((a) => n.toLowerCase().includes(a)));
    if (strong.length > 0) {
      const d = +10;
      score += d;
      factors.push({
        label: `Tier-1 anchors: ${strong.slice(0, 3).join(", ")}${strong.length > 3 ? "…" : ""}`,
        delta: d,
        detail: "Marquee institutional names typically signal due-diligence rigour.",
      });
    } else {
      factors.push({ label: `${i.anchorNames.length} anchor(s) but no marquee names`, delta: 0 });
    }
    if (i.anchorTotalCr >= 25 && i.issueSizeCr && i.anchorTotalCr / i.issueSizeCr > 0.25) {
      const d = +5;
      score += d;
      factors.push({ label: "Anchor portion ≥25% of issue", delta: d });
    }
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  let band: SmeRiskScore["band"];
  let bandLabel: string;
  let bandColorClass: string;
  if (score >= 70) {
    band = "lower";
    bandLabel = "Lower risk";
    bandColorClass = "bg-green-100 text-green-800";
  } else if (score >= 50) {
    band = "moderate";
    bandLabel = "Moderate risk";
    bandColorClass = "bg-yellow-100 text-yellow-800";
  } else if (score >= 30) {
    band = "elevated";
    bandLabel = "Elevated risk";
    bandColorClass = "bg-orange-100 text-orange-800";
  } else {
    band = "high";
    bandLabel = "High risk";
    bandColorClass = "bg-red-100 text-red-800";
  }

  return { score, band, bandLabel, bandColorClass, factors };
}
