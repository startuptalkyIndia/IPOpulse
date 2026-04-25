/**
 * Listing-gain predictor (heuristic).
 *
 * No ML training yet — uses a simple weighted formula tuned to historical
 * Indian IPO patterns:
 *   - GMP / issue price → biggest single signal
 *   - Subscription multiple (especially QIB) → confidence of demand
 *   - SME IPOs: skewed higher (historical median listing gain is much larger)
 *   - Mainboard mega-issues (>₹5,000 Cr): muted, listings tend to be flatter
 *
 * Returns a predicted listing-gain percentage along with confidence + drivers.
 */

export interface PredictorInput {
  type: string;
  issueSizeCr: number | null;
  priceBandHigh: number | null;
  totalSubX: number | null;
  qibX: number | null;
  retailX: number | null;
  latestGmp: number | null;
}

export interface PredictorOutput {
  predictedGainPct: number;
  predictedListingPrice: number | null;
  confidence: "low" | "moderate" | "high";
  drivers: { label: string; impact: number }[];
}

export function predictListingGain(i: PredictorInput): PredictorOutput | null {
  if (!i.priceBandHigh) return null;
  const drivers: { label: string; impact: number }[] = [];
  let pct = 0;

  // GMP signal
  if (i.latestGmp != null) {
    const gmpPct = (i.latestGmp / i.priceBandHigh) * 100;
    // Empirically GMP overestimates by ~25-30% on average; weight 0.7
    const contrib = gmpPct * 0.7;
    pct += contrib;
    drivers.push({ label: `GMP signal (₹${i.latestGmp.toFixed(0)} = ${gmpPct.toFixed(1)}% of issue)`, impact: contrib });
  }

  // Subscription signal
  if (i.totalSubX != null && i.totalSubX > 0) {
    let subContrib = 0;
    if (i.totalSubX >= 50) subContrib = 8;
    else if (i.totalSubX >= 20) subContrib = 5;
    else if (i.totalSubX >= 5) subContrib = 2;
    else if (i.totalSubX < 1.5) subContrib = -5;
    if (subContrib !== 0) {
      pct += subContrib;
      drivers.push({ label: `Total subscription ${i.totalSubX.toFixed(1)}x`, impact: subContrib });
    }
  }

  // QIB quality
  if (i.qibX != null) {
    if (i.qibX >= 30) {
      const c = +5;
      pct += c;
      drivers.push({ label: `Strong QIB demand (${i.qibX.toFixed(1)}x)`, impact: c });
    } else if (i.qibX < 1 && (i.retailX ?? 0) > 50) {
      const c = -8;
      pct += c;
      drivers.push({ label: "QIB under-subscribed; retail-only frenzy", impact: c });
    }
  }

  // Type adjustments
  if (i.type === "sme") {
    // SME IPOs historically pop more on listing day; bump 5-10%
    const c = +6;
    pct += c;
    drivers.push({ label: "SME IPO listing-day skew", impact: c });
  } else if (i.issueSizeCr != null && i.issueSizeCr > 5000) {
    // Mega mainboard issues tend to list flatter
    const c = -3;
    pct += c;
    drivers.push({ label: "Mega issue (>₹5,000 Cr) — historically muted listings", impact: c });
  }

  // Clamp to reasonable range
  pct = Math.max(-50, Math.min(150, pct));

  const predictedListingPrice = i.priceBandHigh * (1 + pct / 100);
  const drivenBy = drivers.length;
  const confidence: PredictorOutput["confidence"] =
    drivenBy >= 3 && i.latestGmp != null && i.totalSubX != null ? "high" : drivenBy >= 2 ? "moderate" : "low";

  return {
    predictedGainPct: Number(pct.toFixed(2)),
    predictedListingPrice: Math.round(predictedListingPrice),
    confidence,
    drivers,
  };
}
