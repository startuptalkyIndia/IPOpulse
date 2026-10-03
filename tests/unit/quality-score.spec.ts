import { describe, it, expect } from "vitest";
import { computeQualityScore } from "@/lib/quality-score";

describe("computeQualityScore", () => {
  it("returns null when fewer than 2 of the core fields (ROE, P/E, RSI) are present", () => {
    expect(computeQualityScore({})).toBeNull();
    expect(computeQualityScore({ roePercent: 15 })).toBeNull();
  });

  it("scores a high-quality, reasonably valued, uptrending stock near the top", () => {
    const result = computeQualityScore({
      roePercent: 25, rocePercent: 22, debtToEquity: 0.1, operatingMargin: 25,
      roeConsistentYrs: 6, isMoat: true,
      peRatio: 18, pbRatio: 3, dividendYield: 1,
      rsi: 55, weinsteinStage: 2, ret1y: 35,
    });
    expect(result).not.toBeNull();
    expect(result!.grade).toBe("A+");
    expect(result!.overall).toBeGreaterThan(85);
    expect(result!.quality.label).toBe("Strong");
    expect(result!.flags.some((f) => f.type === "green" && f.text.includes("High ROE"))).toBe(true);
    expect(result!.flags.some((f) => f.type === "green" && f.text.includes("moat"))).toBe(true);
  });

  it("scores a weak, overleveraged, downtrending stock near the bottom with red flags", () => {
    const result = computeQualityScore({
      roePercent: -5, debtToEquity: 3.5,
      peRatio: 80,
      rsi: 20, weinsteinStage: 4, ret1y: -30,
    });
    expect(result).not.toBeNull();
    expect(["D", "F"]).toContain(result!.grade);
    expect(result!.overall).toBeLessThan(40);
    expect(result!.flags.some((f) => f.type === "red" && f.text.includes("Negative ROE"))).toBe(true);
    expect(result!.flags.some((f) => f.type === "red" && f.text.includes("debt"))).toBe(true);
    expect(result!.flags.some((f) => f.type === "red" && f.text.includes("downtrend"))).toBe(true);
  });

  it("flags a cyclical stock at a cycle peak as a red flag even with decent ROE", () => {
    const result = computeQualityScore({
      roePercent: 18, peRatio: 20, rsi: 60,
      isCyclical: true, cyclicalPeak: true,
    });
    expect(result).not.toBeNull();
    expect(result!.flags.some((f) => f.type === "red" && f.text.includes("Cyclical"))).toBe(true);
  });

  it("stays neutral (score near 50 per dimension) when fields are missing, not biased high or low", () => {
    const result = computeQualityScore({ roePercent: null, peRatio: 20, rsi: 50 });
    expect(result).not.toBeNull();
    // Only peRatio feeds valuation meaningfully; quality/momentum should sit near the 50 baseline
    expect(result!.quality.score).toBe(50);
  });

  it("clamps scores to the 0-100 range even with extreme inputs", () => {
    const result = computeQualityScore({
      roePercent: 100, rocePercent: 100, debtToEquity: 0, operatingMargin: 100,
      roeConsistentYrs: 20, isMoat: true,
      peRatio: 1, pbRatio: 0.1, dividendYield: 10,
      rsi: 50, weinsteinStage: 2, ret1y: 500,
    });
    expect(result!.quality.score).toBeLessThanOrEqual(100);
    expect(result!.valuation.score).toBeLessThanOrEqual(100);
    expect(result!.momentum.score).toBeLessThanOrEqual(100);
    expect(result!.overall).toBeLessThanOrEqual(100);
  });
});
