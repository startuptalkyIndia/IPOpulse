import { describe, it, expect } from "vitest";
import { parseCorporateActionSubject, parseNseCaDate } from "@/lib/scrapers/nse-corporate-actions";

// Subject strings copied verbatim from NSE's live /api/corporates-corporateActions
// response for IRB, captured 2026-10-03 during the price-adjustment bug investigation.
describe("parseCorporateActionSubject", () => {
  it("parses a 1:1 bonus (IRB's real 2026-03-30 event)", () => {
    const res = parseCorporateActionSubject("Bonus 1:1");
    expect(res).toEqual({ actionType: "bonus", ratio: "1:1", adjustmentFactor: 0.5 });
  });

  it("parses a 1:2 bonus with the correct non-halving factor", () => {
    // 1 new share for every 2 held -> 3 total for every 2 -> factor = 2/3
    const res = parseCorporateActionSubject("Bonus 1:2");
    expect(res!.actionType).toBe("bonus");
    expect(res!.adjustmentFactor).toBeCloseTo(2 / 3, 6);
  });

  it("parses IRB's real 2023 face-value split (10:1)", () => {
    const res = parseCorporateActionSubject(
      "Face Value Split (Sub-Division) - From Rs 10/- Per Share To Re 1/- Per Share",
    );
    expect(res).toEqual({ actionType: "split", ratio: "10:1", adjustmentFactor: 0.1 });
  });

  it("returns null for dividends, AGMs, and other non-adjusting events", () => {
    expect(parseCorporateActionSubject("Interim Dividend - Re 0.05 Per Share")).toBeNull();
    expect(parseCorporateActionSubject(" Annual General Meeting")).toBeNull();
    expect(parseCorporateActionSubject("Demerger")).toBeNull();
    expect(parseCorporateActionSubject("Rights 1:5")).toBeNull();
  });
});

describe("parseNseCaDate", () => {
  it("parses NSE's DD-Mon-YYYY format", () => {
    const d = parseNseCaDate("26-Aug-2025");
    expect(d?.toISOString().slice(0, 10)).toBe("2025-08-26");
  });

  it("returns null for NSE's placeholder dash", () => {
    expect(parseNseCaDate("-")).toBeNull();
    expect(parseNseCaDate(null)).toBeNull();
    expect(parseNseCaDate(undefined)).toBeNull();
  });
});
