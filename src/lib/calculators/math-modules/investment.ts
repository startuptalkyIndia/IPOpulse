import type { CalcBreakdownRow, CalcResult } from "../types";
import { round } from "./shared";

/* SIP — monthly investment with annual return ------------------------- */
export function sipCalc(i: Record<string, number>): CalcResult {
  const m = i.monthly;          // monthly investment
  const r = i.rate / 100 / 12;  // monthly rate
  const n = i.years * 12;       // months
  const fv = m * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const invested = m * n;
  const returns = fv - invested;

  const breakdown: CalcBreakdownRow[] = [];
  for (let y = 1; y <= i.years; y++) {
    const months = y * 12;
    const v = m * (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
    const inv = m * months;
    breakdown.push({ year: y, invested: round(inv), value: round(v), interest: round(v - inv) });
  }

  return {
    primary: [
      { label: "Future value", value: round(fv), format: "currency" },
      { label: "Total invested", value: round(invested), format: "currency" },
      { label: "Wealth gained", value: round(returns), format: "currency" },
    ],
    donut: { invested: round(invested), returns: round(returns) },
    breakdown,
  };
}

/* Step-up SIP — annual increment ------------------------------------- */
export function stepUpSipCalc(i: Record<string, number>): CalcResult {
  const baseMonthly = i.monthly;
  const annualStepPct = i.stepUp / 100;
  const r = i.rate / 100 / 12;
  let fv = 0;
  let invested = 0;
  const breakdown: CalcBreakdownRow[] = [];

  for (let y = 1; y <= i.years; y++) {
    const monthly = baseMonthly * Math.pow(1 + annualStepPct, y - 1);
    for (let m = 0; m < 12; m++) {
      const monthsLeft = (i.years - y) * 12 + (12 - m);
      fv += monthly * Math.pow(1 + r, monthsLeft);
      invested += monthly;
    }
    breakdown.push({ year: y, invested: round(invested), value: round(fv), interest: round(fv - invested) });
  }

  return {
    primary: [
      { label: "Future value", value: round(fv), format: "currency" },
      { label: "Total invested", value: round(invested), format: "currency" },
      { label: "Wealth gained", value: round(fv - invested), format: "currency" },
    ],
    donut: { invested: round(invested), returns: round(fv - invested) },
    breakdown,
  };
}

/* Lumpsum — one-time investment at compound rate --------------------- */
export function lumpsumCalc(i: Record<string, number>): CalcResult {
  const p = i.principal;
  const r = i.rate / 100;
  const n = i.years;
  const fv = p * Math.pow(1 + r, n);
  const returns = fv - p;

  const breakdown: CalcBreakdownRow[] = [];
  for (let y = 1; y <= n; y++) {
    const v = p * Math.pow(1 + r, y);
    breakdown.push({ year: y, invested: round(p), value: round(v), interest: round(v - p) });
  }

  return {
    primary: [
      { label: "Future value", value: round(fv), format: "currency" },
      { label: "Invested", value: round(p), format: "currency" },
      { label: "Wealth gained", value: round(returns), format: "currency" },
    ],
    donut: { invested: round(p), returns: round(returns) },
    breakdown,
  };
}

/* SWP — Systematic Withdrawal Plan ----------------------------------- */
export function swpCalc(i: Record<string, number>): CalcResult {
  let balance = i.principal;
  const w = i.monthlyWithdraw;
  const r = i.rate / 100 / 12;
  const n = i.years * 12;
  let totalWithdrawn = 0;
  const breakdown: CalcBreakdownRow[] = [];

  for (let m = 1; m <= n; m++) {
    balance = balance * (1 + r) - w;
    totalWithdrawn += w;
    if (balance < 0) balance = 0;
    if (m % 12 === 0) {
      const year = m / 12;
      breakdown.push({
        year,
        invested: round(totalWithdrawn),
        value: round(balance),
        interest: round(balance - (i.principal - totalWithdrawn)),
      });
    }
  }

  return {
    primary: [
      { label: "Final balance", value: round(balance), format: "currency" },
      { label: "Total withdrawn", value: round(totalWithdrawn), format: "currency" },
      { label: "Starting corpus", value: round(i.principal), format: "currency" },
    ],
    donut: { invested: round(totalWithdrawn), returns: round(Math.max(balance, 0)) },
    breakdown,
  };
}

/* FD — fixed deposit at compounding freq ----------------------------- */
export function fdCalc(i: Record<string, number>): CalcResult {
  const p = i.principal;
  const r = i.rate / 100;
  const n = i.compoundingsPerYear || 4; // default quarterly
  const t = i.years;
  const fv = p * Math.pow(1 + r / n, n * t);
  const interest = fv - p;

  const breakdown: CalcBreakdownRow[] = [];
  for (let y = 1; y <= t; y++) {
    const v = p * Math.pow(1 + r / n, n * y);
    breakdown.push({ year: y, invested: round(p), value: round(v), interest: round(v - p) });
  }

  return {
    primary: [
      { label: "Maturity value", value: round(fv), format: "currency" },
      { label: "Interest earned", value: round(interest), format: "currency" },
      { label: "Principal", value: round(p), format: "currency" },
    ],
    donut: { invested: round(p), returns: round(interest) },
    breakdown,
  };
}

/* PPF — 15-year government scheme, annual compounding ---------------- */
export function ppfCalc(i: Record<string, number>): CalcResult {
  const annual = i.yearly;
  const r = i.rate / 100;
  const years = i.years || 15;
  let balance = 0;
  let invested = 0;
  const breakdown: CalcBreakdownRow[] = [];

  for (let y = 1; y <= years; y++) {
    balance += annual;
    balance = balance * (1 + r);
    invested += annual;
    breakdown.push({ year: y, invested: round(invested), value: round(balance), interest: round(balance - invested) });
  }

  return {
    primary: [
      { label: "Maturity value", value: round(balance), format: "currency" },
      { label: "Total deposited", value: round(invested), format: "currency" },
      { label: "Interest earned", value: round(balance - invested), format: "currency" },
    ],
    donut: { invested: round(invested), returns: round(balance - invested) },
    breakdown,
  };
}

/* Retirement — corpus needed + monthly SIP to reach it --------------- */
export function retirementCalc(i: Record<string, number>): CalcResult {
  const currentAge = i.currentAge;
  const retireAge = i.retireAge;
  const lifeExpectancy = i.lifeExpectancy;
  const currentMonthlyExp = i.currentMonthlyExp;
  const inflation = i.inflation / 100;
  const preReturn = i.preReturn / 100;
  const postReturn = i.postReturn / 100;

  const yearsToRetire = retireAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retireAge;

  // Monthly expense at retirement
  const futureMonthlyExp = currentMonthlyExp * Math.pow(1 + inflation, yearsToRetire);
  const futureAnnualExp = futureMonthlyExp * 12;

  // Corpus required (annuity present value with real return)
  const realReturn = (1 + postReturn) / (1 + inflation) - 1;
  const corpusRequired =
    realReturn === 0
      ? futureAnnualExp * yearsInRetirement
      : futureAnnualExp * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);

  // Monthly SIP to reach corpus
  const rM = preReturn / 12;
  const nM = yearsToRetire * 12;
  const sipNeeded = (corpusRequired * rM) / ((Math.pow(1 + rM, nM) - 1) * (1 + rM));

  return {
    primary: [
      { label: "Corpus needed at retirement", value: round(corpusRequired), format: "currency" },
      { label: "Monthly SIP needed", value: round(sipNeeded), format: "currency" },
      { label: "Expense at retirement (monthly)", value: round(futureMonthlyExp), format: "currency" },
    ],
    secondary: [
      { label: "Years to retire", value: yearsToRetire, format: "plain" },
      { label: "Retirement duration (yrs)", value: yearsInRetirement, format: "plain" },
    ],
  };
}

/* Goal-based SIP — what monthly SIP to hit a target amount */
export function goalCalc(i: Record<string, number>): CalcResult {
  const target = i.target;
  const currentSavings = i.currentSavings;
  const years = i.years;
  const rate = i.rate / 100;
  const inflation = i.inflation / 100;

  // Inflation-adjusted target
  const inflatedTarget = target * Math.pow(1 + inflation, years);
  // Future value of current savings
  const futureCurrent = currentSavings * Math.pow(1 + rate, years);
  const needed = Math.max(inflatedTarget - futureCurrent, 0);
  // Monthly SIP needed
  const r = rate / 12;
  const n = years * 12;
  const sipNeeded = needed * r / ((Math.pow(1 + r, n) - 1) * (1 + r));

  return {
    primary: [
      { label: "Monthly SIP needed", value: round(sipNeeded), format: "currency" },
      { label: `Inflation-adjusted target`, value: round(inflatedTarget), format: "currency" },
      { label: "Your current savings will grow to", value: round(futureCurrent), format: "currency" },
    ],
    secondary: [
      { label: "Target (today's ₹)", value: round(target), format: "currency" },
      { label: "Gap to cover", value: round(needed), format: "currency" },
    ],
  };
}

/* NPS — National Pension System, monthly contribution with equity/debt split */
export function npsCalc(i: Record<string, number>): CalcResult {
  const m = i.monthly;
  const rate = i.rate / 100 / 12;
  const n = i.years * 12;
  const fv = m * (((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate));
  const invested = m * n;
  const annuityPct = i.annuityPct / 100;
  const annuityCorpus = fv * annuityPct;
  const lumpsum = fv - annuityCorpus;
  const annuityRate = i.annuityRate / 100 / 12;
  const monthlyPension = annuityCorpus * annuityRate;
  const breakdown: CalcBreakdownRow[] = [];
  for (let y = 1; y <= i.years; y++) {
    const months = y * 12;
    const v = m * (((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate));
    const inv = m * months;
    breakdown.push({ year: y, invested: round(inv), value: round(v), interest: round(v - inv) });
  }
  return {
    primary: [
      { label: "Corpus at retirement", value: round(fv), format: "currency" },
      { label: "Monthly pension", value: round(monthlyPension), format: "currency" },
      { label: "Tax-free lumpsum (60%)", value: round(lumpsum), format: "currency" },
    ],
    secondary: [
      { label: "Total invested", value: round(invested), format: "currency" },
      { label: "Annuity purchase", value: round(annuityCorpus), format: "currency" },
    ],
    donut: { invested: round(invested), returns: round(fv - invested) },
    breakdown,
  };
}

/* RD — Recurring Deposit with quarterly compounding */
export function rdCalc(i: Record<string, number>): CalcResult {
  const m = i.monthly;
  const r = i.rate / 100;
  const n = i.months;
  // RD formula: M × [((1+r/4)^(4n/12) - 1) / (1 - (1+r/4)^(-1/3))]
  // Simplified: month-by-month compounding
  let fv = 0;
  for (let k = 1; k <= n; k++) {
    const monthsLeft = n - k + 1;
    fv += m * Math.pow(1 + r / 4, (monthsLeft / 12) * 4);
  }
  const invested = m * n;
  const interest = fv - invested;
  const breakdown: CalcBreakdownRow[] = [];
  for (let y = 1; y <= Math.ceil(n / 12); y++) {
    const months = Math.min(y * 12, n);
    let v = 0;
    for (let k = 1; k <= months; k++) {
      const monthsLeft = months - k + 1;
      v += m * Math.pow(1 + r / 4, (monthsLeft / 12) * 4);
    }
    breakdown.push({ year: y, invested: round(m * months), value: round(v), interest: round(v - m * months) });
  }
  return {
    primary: [
      { label: "Maturity value", value: round(fv), format: "currency" },
      { label: "Total deposited", value: round(invested), format: "currency" },
      { label: "Interest earned", value: round(interest), format: "currency" },
    ],
    donut: { invested: round(invested), returns: round(interest) },
    breakdown,
  };
}

/* Inflation — what today's expense costs in future */
export function inflationCalc(i: Record<string, number>): CalcResult {
  const today = i.amount;
  const rate = i.rate / 100;
  const years = i.years;
  const future = today * Math.pow(1 + rate, years);
  const erosion = future - today;
  const todayValueOfFuture = today / Math.pow(1 + rate, years);

  const breakdown: CalcBreakdownRow[] = [];
  for (let y = 1; y <= years; y++) {
    const v = today * Math.pow(1 + rate, y);
    breakdown.push({ year: y, invested: round(today), value: round(v), interest: round(v - today) });
  }

  return {
    primary: [
      { label: `In ${years} years, you'll need`, value: round(future), format: "currency" },
      { label: "Inflation cost", value: round(erosion), format: "currency" },
      { label: "Today's worth of future ₹", value: round(todayValueOfFuture), format: "currency" },
    ],
    donut: { invested: round(today), returns: round(erosion) },
    breakdown,
  };
}

/* MF Returns — simple CAGR calculator */
export function mfReturnsCalc(i: Record<string, number>): CalcResult {
  const initial = i.initial;
  const final = i.final;
  const years = i.years;
  const cagr = years > 0 ? Math.pow(final / initial, 1 / years) - 1 : 0;
  const absoluteReturn = ((final - initial) / initial) * 100;
  const gain = final - initial;

  return {
    primary: [
      { label: "CAGR (annualized)", value: cagr * 100, format: "percent" },
      { label: "Absolute return", value: absoluteReturn, format: "percent" },
      { label: "Total gain", value: round(gain), format: "currency" },
    ],
    secondary: [
      { label: "Initial", value: round(initial), format: "currency" },
      { label: "Final", value: round(final), format: "currency" },
    ],
  };
}
