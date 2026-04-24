import type { CalcBreakdownRow, CalcResult } from "./types";

/* Generic helpers ----------------------------------------------------- */

const round = (n: number) => Math.round(n);

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

/* Brokerage — simplified per-broker delivery + intraday -------------- */
export interface BrokerSchedule {
  name: string;
  deliveryPct: number; // % of turnover
  deliveryFlat: number; // min flat per order
  deliveryCap: number; // per-order cap
  intradayPct: number;
  intradayFlat: number;
  intradayCap: number;
}

export const brokerSchedules: BrokerSchedule[] = [
  { name: "Zerodha", deliveryPct: 0, deliveryFlat: 0, deliveryCap: 0, intradayPct: 0.0003, intradayFlat: 20, intradayCap: 20 },
  { name: "Groww", deliveryPct: 0.001, deliveryFlat: 20, deliveryCap: 20, intradayPct: 0.0005, intradayFlat: 20, intradayCap: 20 },
  { name: "Upstox", deliveryPct: 0.00025, deliveryFlat: 20, deliveryCap: 20, intradayPct: 0.0005, intradayFlat: 20, intradayCap: 20 },
  { name: "Angel One", deliveryPct: 0, deliveryFlat: 0, deliveryCap: 0, intradayPct: 0.0003, intradayFlat: 20, intradayCap: 20 },
  { name: "ICICI Direct", deliveryPct: 0.0055, deliveryFlat: 35, deliveryCap: Infinity, intradayPct: 0.00275, intradayFlat: 35, intradayCap: Infinity },
  { name: "HDFC Securities", deliveryPct: 0.005, deliveryFlat: 25, deliveryCap: Infinity, intradayPct: 0.0005, intradayFlat: 25, intradayCap: Infinity },
];

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

/* F&O Margin — simplified SPAN+Exposure estimate */
export function fnoMarginCalc(i: Record<string, number>): CalcResult {
  const contractValue = i.lotSize * i.price;
  // Typical SPAN margin is 10–15% of contract value for index futures, 20% for stock futures
  const spanPct = i.instrumentType === 0 ? 0.12 : 0.20; // 0=index, 1=stock
  const exposurePct = i.instrumentType === 0 ? 0.03 : 0.05;
  const spanMargin = contractValue * spanPct;
  const exposureMargin = contractValue * exposurePct;
  const total = spanMargin + exposureMargin;
  const leverage = contractValue / total;

  return {
    primary: [
      { label: "Total margin required", value: round(total), format: "currency" },
      { label: "Contract value", value: round(contractValue), format: "currency" },
      { label: "Leverage", value: Number(leverage.toFixed(1)), format: "plain" },
    ],
    secondary: [
      { label: "SPAN margin", value: round(spanMargin), format: "currency" },
      { label: "Exposure margin", value: round(exposureMargin), format: "currency" },
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

export function brokerageCalc(i: Record<string, number>): CalcResult {
  const buyPrice = i.buyPrice;
  const sellPrice = i.sellPrice;
  const qty = i.quantity;
  const isIntraday = !!i.intraday;

  const buyTurnover = buyPrice * qty;
  const sellTurnover = sellPrice * qty;
  const totalTurnover = buyTurnover + sellTurnover;

  const sttRate = isIntraday ? 0.00025 : 0.001; // intraday on sell only; delivery on both
  const stt = isIntraday ? sellTurnover * sttRate : totalTurnover * sttRate;

  const exchangeTxn = totalTurnover * 0.0000297; // NSE
  const sebi = totalTurnover * 0.000001;
  const stampDuty = buyTurnover * (isIntraday ? 0.00003 : 0.00015);

  const perBroker = brokerSchedules.map((b) => {
    const bPct = isIntraday ? b.intradayPct : b.deliveryPct;
    const bFlat = isIntraday ? b.intradayFlat : b.deliveryFlat;
    const bCap = isIntraday ? b.intradayCap : b.deliveryCap;
    const buyBrokerage = Math.min(Math.max(buyTurnover * bPct, bFlat > 0 ? bFlat : 0), bCap);
    const sellBrokerage = Math.min(Math.max(sellTurnover * bPct, bFlat > 0 ? bFlat : 0), bCap);
    const brokerage = (bFlat === 0 && bPct === 0 ? 0 : buyBrokerage + sellBrokerage);
    const gst = (brokerage + exchangeTxn + sebi) * 0.18;
    const totalCost = brokerage + stt + exchangeTxn + sebi + stampDuty + gst;
    const gross = (sellPrice - buyPrice) * qty;
    const net = gross - totalCost;
    return { broker: b.name, brokerage: round(brokerage), totalCost: round(totalCost), netPnl: round(net) };
  });

  const best = perBroker.reduce((a, b) => (b.netPnl > a.netPnl ? b : a));

  return {
    primary: [
      { label: `Best: ${best.broker} net P&L`, value: best.netPnl, format: "currency" },
      { label: `Total charges (${best.broker})`, value: best.totalCost, format: "currency" },
      { label: "Gross P&L", value: round((sellPrice - buyPrice) * qty), format: "currency" },
    ],
    secondary: perBroker.map((p) => ({ label: p.broker, value: p.totalCost, format: "currency" as const })),
  };
}
