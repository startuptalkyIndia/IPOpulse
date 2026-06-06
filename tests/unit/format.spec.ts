/**
 * Unit tests for lib/format.ts — pure formatting helpers, no DB.
 */

import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCurrencyFull,
  formatPercent,
  formatPlain,
  formatByType,
} from "@/lib/format";

describe("formatCurrency", () => {
  it("returns — for non-finite values", () => {
    expect(formatCurrency(Infinity)).toBe("—");
    expect(formatCurrency(-Infinity)).toBe("—");
    expect(formatCurrency(NaN)).toBe("—");
  });

  it("formats values below 1 lakh as plain rupees", () => {
    expect(formatCurrency(50000)).toBe("₹50,000");
    expect(formatCurrency(99999)).toBe("₹99,999");
  });

  it("formats lakh range (1L–1Cr) with L suffix", () => {
    const result = formatCurrency(500000);
    expect(result).toMatch(/₹5\.00 L/);
  });

  it("formats crore range (1Cr+) with Cr suffix", () => {
    const result = formatCurrency(10000000);
    expect(result).toMatch(/Cr/);
  });

  it("formats lakh crore range", () => {
    const result = formatCurrency(1e12);
    expect(result).toMatch(/L Cr/);
  });

  it("handles negative values", () => {
    const result = formatCurrency(-50000);
    expect(result).toContain("₹");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });
});

describe("formatCurrencyFull", () => {
  it("formats with Indian locale separators", () => {
    expect(formatCurrencyFull(1500000)).toBe("₹15,00,000");
  });

  it("returns — for non-finite", () => {
    expect(formatCurrencyFull(Infinity)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("formats with 2 decimal places", () => {
    expect(formatPercent(12.345)).toBe("12.35%");
  });

  it("handles zero", () => {
    expect(formatPercent(0)).toBe("0.00%");
  });

  it("handles negative percent", () => {
    expect(formatPercent(-5.5)).toBe("-5.50%");
  });
});

describe("formatPlain", () => {
  it("formats with Indian locale separators (no ₹)", () => {
    const result = formatPlain(1500000);
    expect(result).toBe("15,00,000");
    expect(result).not.toContain("₹");
  });
});

describe("formatByType", () => {
  it("dispatches currency type to formatCurrency", () => {
    expect(formatByType(1000000, "currency")).toBe(formatCurrency(1000000));
  });

  it("dispatches percent type to formatPercent", () => {
    expect(formatByType(12.5, "percent")).toBe(formatPercent(12.5));
  });

  it("dispatches plain type to formatPlain", () => {
    expect(formatByType(9999, "plain")).toBe(formatPlain(9999));
  });
});
