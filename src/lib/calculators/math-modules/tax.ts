import type { CalcResult } from "../types";
import { round } from "./shared";

/* Income Tax — India (old vs new regime FY 2025-26) ------------------ */
// Simplified: no complex deductions; standard deduction applied
export function taxCalc(i: Record<string, number>): CalcResult {
  const gross = i.grossIncome;
  const deductions80c = Math.min(i.deductions80c, 150000);
  const nps = Math.min(i.npsExtra, 50000);
  const hra = i.hraExempt;
  const other = i.otherDeductions;

  // New regime FY 2025-26 slabs (Budget 2024 update)
  const newStdDed = 75000;
  const newRegimeSlabs = [
    { upto: 300000, rate: 0 },
    { upto: 700000, rate: 0.05 },
    { upto: 1000000, rate: 0.1 },
    { upto: 1200000, rate: 0.15 },
    { upto: 1500000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ];

  // Old regime slabs (unchanged)
  const oldStdDed = 50000;
  const oldRegimeSlabs = [
    { upto: 250000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 1000000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ];

  function computeTax(taxable: number, slabs: typeof newRegimeSlabs) {
    if (taxable <= 0) return 0;
    let tax = 0;
    let prev = 0;
    for (const s of slabs) {
      if (taxable > s.upto) {
        tax += (s.upto - prev) * s.rate;
        prev = s.upto;
      } else {
        tax += (taxable - prev) * s.rate;
        break;
      }
    }
    return tax;
  }

  // New regime — only standard deduction
  const newTaxable = Math.max(gross - newStdDed, 0);
  let newTax = computeTax(newTaxable, newRegimeSlabs);
  // Section 87A rebate: if taxable ≤ 7L, tax up to ₹25k waived
  if (newTaxable <= 700000) newTax = 0;
  const newCess = newTax * 0.04;
  const newTotal = newTax + newCess;

  // Old regime — std ded + 80C + NPS + HRA + other
  const oldTaxable = Math.max(gross - oldStdDed - deductions80c - nps - hra - other, 0);
  let oldTax = computeTax(oldTaxable, oldRegimeSlabs);
  if (oldTaxable <= 500000) oldTax = 0; // 87A rebate old regime
  const oldCess = oldTax * 0.04;
  const oldTotal = oldTax + oldCess;

  const savings = oldTotal - newTotal;

  return {
    primary: [
      { label: "Tax — New regime", value: round(newTotal), format: "currency" },
      { label: "Tax — Old regime", value: round(oldTotal), format: "currency" },
      {
        label: savings >= 0 ? "New regime saves" : "Old regime saves",
        value: round(Math.abs(savings)),
        format: "currency",
      },
    ],
    secondary: [
      { label: "Taxable (New)", value: round(newTaxable), format: "currency" },
      { label: "Taxable (Old)", value: round(oldTaxable), format: "currency" },
    ],
  };
}

/* LTCG / STCG — capital gains tax on equity and debt */
export function ltcgStcgCalc(i: Record<string, number>): CalcResult {
  const buy = i.buyValue;
  const sell = i.sellValue;
  const isEquity = i.assetType === 0; // 0 equity, 1 debt
  const holdingMonths = i.holdingMonths;
  const gain = sell - buy;

  // Equity: STCG if held <12 months (20% from Jul 2024), LTCG if >=12 months (12.5% above 1.25L exempt)
  // Debt (post-Apr 2023): always at slab (we assume 30% top slab for simplicity)
  let tax = 0;
  let nature = "";
  let exempt = 0;
  let taxable = 0;
  if (isEquity) {
    if (holdingMonths < 12) {
      nature = "STCG on equity";
      taxable = Math.max(gain, 0);
      tax = taxable * 0.20;
    } else {
      nature = "LTCG on equity";
      exempt = Math.min(gain, 125000);
      taxable = Math.max(gain - 125000, 0);
      tax = taxable * 0.125;
    }
  } else {
    if (holdingMonths < 24) {
      nature = "STCG on debt (at slab)";
      taxable = Math.max(gain, 0);
      tax = taxable * 0.30;
    } else {
      nature = "LTCG on debt (post-Apr 2023: at slab, no indexation)";
      taxable = Math.max(gain, 0);
      tax = taxable * 0.30;
    }
  }
  const cess = tax * 0.04;
  const total = tax + cess;
  const netGain = gain - total;

  return {
    primary: [
      { label: "Tax payable", value: round(total), format: "currency" },
      { label: "Net gain after tax", value: round(netGain), format: "currency" },
      { label: "Gross gain", value: round(gain), format: "currency" },
    ],
    secondary: [
      { label: "Nature", value: 0, format: "plain" }, // placeholder; we show in label
      { label: "Taxable amount", value: round(taxable), format: "currency" },
      { label: "Exempt (₹1.25L)", value: round(exempt), format: "currency" },
      { label: "Cess @ 4%", value: round(cess), format: "currency" },
      { label: nature, value: round(tax), format: "currency" },
    ],
  };
}

/* HRA exemption — Section 10(13A) */
export function hraCalc(i: Record<string, number>): CalcResult {
  const basic = i.basic * 12;
  const daAnnual = (i.da || 0) * 12;
  const hraReceived = i.hraReceived * 12;
  const rentPaid = i.rent * 12;
  const isMetro = i.metro === 1;

  const salary = basic + daAnnual;
  const a = hraReceived;
  const b = isMetro ? salary * 0.5 : salary * 0.4;
  const c = Math.max(rentPaid - salary * 0.1, 0);
  const exempt = Math.min(a, b, c);
  const taxable = hraReceived - exempt;

  return {
    primary: [
      { label: "HRA exemption (yearly)", value: round(exempt), format: "currency" },
      { label: "Taxable HRA", value: round(taxable), format: "currency" },
      { label: "Monthly exemption", value: round(exempt / 12), format: "currency" },
    ],
    secondary: [
      { label: "HRA received (annual)", value: round(a), format: "currency" },
      { label: "50/40% of salary", value: round(b), format: "currency" },
      { label: "Rent − 10% salary", value: round(c), format: "currency" },
    ],
  };
}
