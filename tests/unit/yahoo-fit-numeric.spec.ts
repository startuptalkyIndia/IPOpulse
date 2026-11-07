import { describe, it, expect } from "vitest";
import { fitNumeric } from "@/crons/jobs/yahoo-fundamentals";

describe("fitNumeric", () => {
  it("keeps values inside numeric(8,2)", () => {
    expect(fitNumeric(999999.99, 8, 2)).toBe(999999.99);
    expect(fitNumeric(-12.5, 8, 2)).toBe(-12.5);
  });
  it("drops values that would overflow", () => {
    expect(fitNumeric(1000000, 8, 2)).toBeNull();
    expect(fitNumeric(-5e7, 8, 2)).toBeNull();
    expect(fitNumeric(10000, 6, 2)).toBeNull();
  });
  it("drops null and non-finite", () => {
    expect(fitNumeric(null, 8, 2)).toBeNull();
    expect(fitNumeric(Infinity, 8, 2)).toBeNull();
  });
});
