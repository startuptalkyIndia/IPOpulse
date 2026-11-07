import { describe, it, expect, vi } from "vitest";
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
  it("drops NaN", () => {
    expect(fitNumeric(NaN, 8, 2)).toBeNull();
  });
  it("handles numeric(8,4) margins and rounds to scale", () => {
    expect(fitNumeric(0.2534, 8, 4)).toBe(0.2534);
    expect(fitNumeric(9999.9999, 8, 4)).toBe(9999.9999);
    expect(fitNumeric(10000, 8, 4)).toBeNull();
    expect(fitNumeric(9999.99996, 8, 4)).toBeNull(); // rounds up to 10000.0000
  });
  it("handles numeric(20,2) market cap", () => {
    expect(fitNumeric(1e18, 20, 2)).toBeNull();
    expect(fitNumeric(5e17, 20, 2)).toBe(5e17);
  });
  it("skips a value that rounds up to the limit", () => {
    expect(fitNumeric(999999.996, 8, 2)).toBeNull();
    expect(fitNumeric(999999.994, 8, 2)).toBe(999999.99);
  });
  it("warns once with the label when it skips, and not when it fits", () => {
    const w = vi.spyOn(console, "warn").mockImplementation(() => {});
    fitNumeric(5, 8, 2, "ABC.NS roePercent");
    expect(w).not.toHaveBeenCalled();
    fitNumeric(1e7, 8, 2, "ABC.NS roePercent");
    expect(w).toHaveBeenCalledTimes(1);
    expect(String(w.mock.calls[0][0])).toContain("ABC.NS roePercent");
    w.mockRestore();
  });
});
