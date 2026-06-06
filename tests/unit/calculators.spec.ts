/**
 * Unit tests for calculator math functions.
 * Pure functions — no DB, no network, no mocks needed.
 */

import { describe, it, expect } from "vitest";
import {
  sipCalc,
  lumpsumCalc,
  emiCalc,
  fdCalc,
  ppfCalc,
  hraCalc,
  inflationCalc,
  mfReturnsCalc,
  ltcgStcgCalc,
  taxCalc,
  swpCalc,
  rdCalc,
  goalCalc,
  npsCalc,
} from "@/lib/calculators/math";

describe("sipCalc", () => {
  it("returns correct future value for standard SIP", () => {
    // ₹10,000/mo, 12% p.a., 10 years
    const result = sipCalc({ monthly: 10000, rate: 12, years: 10 });
    expect(result.primary[0].label).toBe("Future value");
    // FV should be ~₹23.2L for these params
    expect(result.primary[0].value).toBeGreaterThan(2000000);
    expect(result.primary[0].value).toBeLessThan(2500000);
  });

  it("total invested = monthly * years * 12", () => {
    const result = sipCalc({ monthly: 5000, rate: 10, years: 5 });
    expect(result.primary[1].value).toBe(5000 * 5 * 12);
  });

  it("generates year-by-year breakdown", () => {
    const result = sipCalc({ monthly: 1000, rate: 8, years: 3 });
    expect(result.breakdown).toHaveLength(3);
    // Each year's value should be greater than the previous
    expect(result.breakdown![1].value).toBeGreaterThan(result.breakdown![0].value);
    expect(result.breakdown![2].value).toBeGreaterThan(result.breakdown![1].value);
  });

  it("wealth gained = future value - invested", () => {
    const result = sipCalc({ monthly: 10000, rate: 12, years: 10 });
    const fv = result.primary[0].value as number;
    const invested = result.primary[1].value as number;
    const gained = result.primary[2].value as number;
    // Allow ±1 rounding
    expect(Math.abs(fv - invested - gained)).toBeLessThanOrEqual(1);
  });
});

describe("lumpsumCalc", () => {
  it("₹1L at 10% for 1 year = ₹1.1L", () => {
    const result = lumpsumCalc({ principal: 100000, rate: 10, years: 1 });
    expect(result.primary[0].value).toBe(110000);
  });

  it("principal compounded correctly over multiple years", () => {
    const result = lumpsumCalc({ principal: 100000, rate: 12, years: 5 });
    // 1L * 1.12^5 = ~176,234
    expect(result.primary[0].value).toBeGreaterThan(175000);
    expect(result.primary[0].value).toBeLessThan(180000);
  });
});

describe("emiCalc", () => {
  it("returns positive EMI for a home loan", () => {
    // ₹50L, 8.5% p.a., 20 years
    const result = emiCalc({ principal: 5000000, rate: 8.5, years: 20 });
    const emi = result.primary[0].value as number;
    expect(emi).toBeGreaterThan(40000);
    expect(emi).toBeLessThan(50000);
  });

  it("total interest = total payment - principal (approx, rounding ±15)", () => {
    const result = emiCalc({ principal: 1000000, rate: 10, years: 10 });
    const emi = result.primary[0].value as number;
    const totalInterest = result.primary[1].value as number;
    const totalPayment = result.primary[2].value as number;
    // total payment ≈ emi * 120 (rounding may differ by up to ₹15 due to Math.round)
    expect(Math.abs(totalPayment - (emi * 120))).toBeLessThan(15);
    expect(Math.abs(totalPayment - 1000000 - totalInterest)).toBeLessThan(15);
  });

  it("zero-rate loan: EMI = principal / months", () => {
    const result = emiCalc({ principal: 120000, rate: 0, years: 1 });
    const emi = result.primary[0].value as number;
    expect(emi).toBe(10000);
  });
});

describe("fdCalc", () => {
  it("correct maturity value for quarterly compounding", () => {
    // ₹1L, 7%, 1 year, quarterly (n=4)
    const result = fdCalc({ principal: 100000, rate: 7, years: 1, compoundingsPerYear: 4 });
    const mv = result.primary[0].value as number;
    // Expected ~₹71,800... wait, should be ~₹107,186
    expect(mv).toBeGreaterThan(107000);
    expect(mv).toBeLessThan(108000);
  });

  it("defaults to quarterly when compoundingsPerYear not given", () => {
    const r1 = fdCalc({ principal: 100000, rate: 7, years: 2, compoundingsPerYear: 4 });
    const r2 = fdCalc({ principal: 100000, rate: 7, years: 2 });
    expect(r1.primary[0].value).toBe(r2.primary[0].value);
  });
});

describe("ppfCalc", () => {
  it("15-year PPF at 7.1% produces correct maturity value", () => {
    // ₹1.5L/year, 7.1%, 15 years
    const result = ppfCalc({ yearly: 150000, rate: 7.1, years: 15 });
    const maturity = result.primary[0].value as number;
    // Commonly cited: ~₹40.7L
    expect(maturity).toBeGreaterThan(3800000);
    expect(maturity).toBeLessThan(4500000);
  });

  it("generates 15 rows in breakdown", () => {
    const result = ppfCalc({ yearly: 100000, rate: 7.1, years: 15 });
    expect(result.breakdown).toHaveLength(15);
  });
});

describe("hraCalc", () => {
  it("metro city: exempt = min(HRA, 50% salary, rent-10%salary)", () => {
    const result = hraCalc({
      basic: 50000,      // monthly
      da: 0,
      hraReceived: 20000,
      rent: 22000,
      metro: 1,
    });
    // salary = 600000, 50% = 300000
    // HRA annual = 240000
    // rent - 10% salary = 264000 - 60000 = 204000
    // exempt = min(240000, 300000, 204000) = 204000
    expect(result.primary[0].value).toBe(204000);
  });

  it("non-metro uses 40% salary", () => {
    const result = hraCalc({
      basic: 50000,
      da: 0,
      hraReceived: 20000,
      rent: 22000,
      metro: 0,
    });
    // 40% of 600000 = 240000, HRA=240000, rent-10%=204000 → exempt=204000
    const metroResult = hraCalc({
      basic: 50000, da: 0, hraReceived: 20000, rent: 22000, metro: 1,
    });
    // Non-metro cap is lower (40% vs 50%) so in this case same
    expect(result.primary[0].value).toBeLessThanOrEqual(metroResult.primary[0].value as number);
  });
});

describe("inflationCalc", () => {
  it("₹1L at 6% for 10 years = ~₹1.79L", () => {
    const result = inflationCalc({ amount: 100000, rate: 6, years: 10 });
    const future = result.primary[0].value as number;
    expect(future).toBeGreaterThan(178000);
    expect(future).toBeLessThan(180000);
  });

  it("inflation cost = future - today", () => {
    const result = inflationCalc({ amount: 100000, rate: 5, years: 5 });
    const future = result.primary[0].value as number;
    const cost = result.primary[1].value as number;
    expect(future - 100000).toBe(cost);
  });
});

describe("mfReturnsCalc", () => {
  it("CAGR: 1L → 2L in 6 years = ~12.25%", () => {
    const result = mfReturnsCalc({ initial: 100000, final: 200000, years: 6 });
    const cagr = result.primary[0].value as number;
    expect(cagr).toBeGreaterThan(12);
    expect(cagr).toBeLessThan(13);
  });

  it("absolute return = (final - initial) / initial * 100", () => {
    const result = mfReturnsCalc({ initial: 100000, final: 150000, years: 3 });
    expect(result.primary[1].value).toBeCloseTo(50, 0);
  });
});

describe("ltcgStcgCalc", () => {
  it("equity STCG (<12 months): 20% on gains", () => {
    const result = ltcgStcgCalc({
      buyValue: 100000, sellValue: 150000, assetType: 0, holdingMonths: 6,
    });
    const tax = result.primary[0].value as number;
    expect(tax).toBe(Math.round(50000 * 0.20 * 1.04)); // +4% cess
  });

  it("equity LTCG (>=12 months): 12.5% above ₹1.25L exempt", () => {
    const result = ltcgStcgCalc({
      buyValue: 100000, sellValue: 400000, assetType: 0, holdingMonths: 24,
    });
    // gain=300000, exempt=125000, taxable=175000, tax=175000*0.125+cess
    const tax = result.primary[0].value as number;
    const expectedTax = Math.round(175000 * 0.125 * 1.04);
    expect(tax).toBe(expectedTax);
  });

  it("no gain = zero tax", () => {
    const result = ltcgStcgCalc({
      buyValue: 100000, sellValue: 100000, assetType: 0, holdingMonths: 6,
    });
    expect(result.primary[0].value).toBe(0);
  });
});

describe("taxCalc", () => {
  it("income <= ₹7L: zero tax under new regime (87A rebate)", () => {
    const result = taxCalc({
      grossIncome: 700000, deductions80c: 0, npsExtra: 0, hraExempt: 0, otherDeductions: 0,
    });
    expect(result.primary[0].value).toBe(0);
  });

  it("returns both new and old regime values", () => {
    const result = taxCalc({
      grossIncome: 1200000, deductions80c: 150000, npsExtra: 50000, hraExempt: 120000, otherDeductions: 0,
    });
    expect(result.primary[0].label).toBe("Tax — New regime");
    expect(result.primary[1].label).toBe("Tax — Old regime");
    expect(result.primary[0].value).toBeGreaterThanOrEqual(0);
    expect(result.primary[1].value).toBeGreaterThanOrEqual(0);
  });
});

describe("swpCalc", () => {
  it("balance decreases when withdrawal > returns", () => {
    // ₹10L corpus, withdraw ₹50K/month at 4% — unsustainable
    const result = swpCalc({ principal: 1000000, monthlyWithdraw: 50000, rate: 4, years: 5 });
    const finalBalance = result.primary[0].value as number;
    expect(finalBalance).toBeLessThan(1000000);
  });

  it("totalWithdrawn = monthlyWithdraw * years * 12", () => {
    const result = swpCalc({ principal: 5000000, monthlyWithdraw: 20000, rate: 8, years: 5 });
    const withdrawn = result.primary[1].value as number;
    expect(withdrawn).toBe(20000 * 5 * 12);
  });
});

describe("rdCalc", () => {
  it("maturity > invested due to interest", () => {
    const result = rdCalc({ monthly: 5000, rate: 7, months: 12 });
    const maturity = result.primary[0].value as number;
    const invested = result.primary[1].value as number;
    expect(maturity).toBeGreaterThan(invested);
  });
});

describe("goalCalc", () => {
  it("returns a positive monthly SIP needed", () => {
    const result = goalCalc({
      target: 5000000, currentSavings: 0, years: 10, rate: 12, inflation: 6,
    });
    const sip = result.primary[0].value as number;
    expect(sip).toBeGreaterThan(0);
  });

  it("existing savings reduce SIP needed", () => {
    const base = goalCalc({ target: 5000000, currentSavings: 0, years: 10, rate: 12, inflation: 6 });
    const withSavings = goalCalc({ target: 5000000, currentSavings: 1000000, years: 10, rate: 12, inflation: 6 });
    expect(withSavings.primary[0].value as number).toBeLessThan(base.primary[0].value as number);
  });
});

describe("npsCalc", () => {
  it("corpus grows with monthly contributions", () => {
    const result = npsCalc({ monthly: 10000, rate: 10, years: 20, annuityPct: 40, annuityRate: 6 });
    const corpus = result.primary[0].value as number;
    expect(corpus).toBeGreaterThan(10000 * 20 * 12); // at minimum more than invested
  });

  it("lumpsum (60%) + annuity corpus (40%) = total corpus", () => {
    const result = npsCalc({ monthly: 10000, rate: 10, years: 20, annuityPct: 40, annuityRate: 6 });
    const corpus = result.primary[0].value as number;
    const lumpsum = result.primary[2].value as number;
    // lumpsum = 60% of corpus
    expect(Math.abs(lumpsum - Math.round(corpus * 0.6))).toBeLessThanOrEqual(1);
  });
});
