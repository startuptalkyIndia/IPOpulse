import type { CalcBreakdownRow, CalcResult } from "../types";
import { round } from "./shared";

/* EMI — loan amortisation ------------------------------------------- */
export function emiCalc(i: Record<string, number>): CalcResult {
  const p = i.principal;
  const r = i.rate / 100 / 12;
  const n = i.years * 12;
  const emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - p;

  const breakdown: CalcBreakdownRow[] = [];
  let balance = p;
  let paidInterest = 0;
  for (let y = 1; y <= i.years; y++) {
    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      const principalPart = emi - interest;
      balance -= principalPart;
      paidInterest += interest;
    }
    breakdown.push({
      year: y,
      invested: round(paidInterest + (p - balance)),
      value: round(Math.max(balance, 0)),
      interest: round(paidInterest),
    });
  }

  return {
    primary: [
      { label: "Monthly EMI", value: round(emi), format: "currency" },
      { label: "Total interest", value: round(totalInterest), format: "currency" },
      { label: "Total payment", value: round(totalPayment), format: "currency" },
    ],
    donut: { invested: round(p), returns: round(totalInterest) },
    breakdown,
  };
}
