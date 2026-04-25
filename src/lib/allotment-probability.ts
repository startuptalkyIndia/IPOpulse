/**
 * IPO allotment probability — based on actual SEBI IPO allotment rules.
 *
 * Key rule: Retail (≤ ₹2 lakh application) gets *one minimum lot per applicant*
 * if oversubscribed. So if subscription is X (≥1), probability of getting at
 * least one lot = 1/X.
 *
 * For HNI (₹2L–10L = small HNI / SHNI; >₹10L = big HNI / BHNI), allotment is
 * proportionate above the cut-off; we approximate as min(1, 1/subscriptionMult).
 *
 * For QIB, allotment is discretionary; show as proportionate.
 */

export interface AllotmentInput {
  category: "retail" | "shni" | "bhni" | "qib";
  subscriptionMultiple: number; // e.g. 8.5 = oversubscribed 8.5×
  lotsApplied: number; // 1, 2, 3...
  lotMinValue: number; // for retail this is ~14k–15k typically
}

export interface AllotmentOutput {
  probabilityFullLot: number; // 0..1 chance of getting at least one minimum lot
  probabilityPartial: number; // 0..1 chance of getting at least 1 lot but not all applied
  probabilityNone: number;
  expectedLots: number;
  notes: string[];
}

export function computeAllotmentProbability(i: AllotmentInput): AllotmentOutput {
  const notes: string[] = [];
  const sub = Math.max(i.subscriptionMultiple, 0.0001);

  if (i.category === "retail") {
    if (sub <= 1) {
      // Undersubscribed retail → everyone gets full
      return {
        probabilityFullLot: 1,
        probabilityPartial: 0,
        probabilityNone: 0,
        expectedLots: i.lotsApplied,
        notes: ["Retail under-subscribed — every applicant gets their full applied quantity."],
      };
    }
    // Retail oversubscribed: 1 minimum lot per applicant via lottery
    const pAny = Math.min(1, 1 / sub);
    notes.push(
      `Retail is ${sub.toFixed(2)}× subscribed. Each applicant has a ~${(pAny * 100).toFixed(1)}% chance of getting one minimum lot.`,
    );
    if (i.lotsApplied > 1) {
      notes.push(
        "You applied for more than 1 lot. SEBI rules: in oversubscribed retail, every successful applicant gets exactly 1 minimum lot — never partial more, never multiple.",
      );
    }
    notes.push("Applying multiple times from the same PAN is not allowed and will be rejected.");
    return {
      probabilityFullLot: i.lotsApplied === 1 ? pAny : 0,
      probabilityPartial: i.lotsApplied > 1 ? pAny : 0,
      probabilityNone: 1 - pAny,
      expectedLots: pAny, // exactly 1 lot when successful
      notes,
    };
  }

  if (i.category === "shni" || i.category === "bhni") {
    // HNI bidding allotment is proportionate above the cut-off subscription level
    if (sub <= 1) {
      return {
        probabilityFullLot: 1,
        probabilityPartial: 0,
        probabilityNone: 0,
        expectedLots: i.lotsApplied,
        notes: [`${i.category.toUpperCase()} undersubscribed — full allotment.`],
      };
    }
    const proportionalRatio = 1 / sub;
    notes.push(
      `${i.category === "shni" ? "Small HNI (₹2L–10L)" : "Big HNI (>₹10L)"} is ${sub.toFixed(2)}× subscribed. Allotment is proportionate.`,
    );
    notes.push(
      `Expected allotment: roughly ${(proportionalRatio * 100).toFixed(1)}% of your applied quantity.`,
    );
    return {
      probabilityFullLot: 0,
      probabilityPartial: 1,
      probabilityNone: 0,
      expectedLots: Math.max(1, Math.round(i.lotsApplied * proportionalRatio)),
      notes,
    };
  }

  // QIB
  notes.push("QIB allotment is at issuer's discretion within the QIB pool. Anchor portion (60% of QIB) is locked-in.");
  notes.push("This calculator is most useful for retail / HNI applicants. QIB outcomes vary by issue.");
  return {
    probabilityFullLot: 0.5,
    probabilityPartial: 0.4,
    probabilityNone: 0.1,
    expectedLots: i.lotsApplied / sub,
    notes,
  };
}
