import type { CalcResult } from "../types";
import { round } from "./shared";

// ── LRS / TCS Calculator ─────────────────────────────────────────────────

export function lrsTcsCalc(v: Record<string, number>): CalcResult {
  const remittanceInr = v.remittanceInr ?? 500000;
  const priorRemittance = v.priorRemittanceInr ?? 0;
  const usdInr = v.usdInr ?? 84;
  const returnPct = (v.expectedReturnPct ?? 10) / 100;
  const depreciationPct = (v.inrDepreciationPct ?? 3) / 100;
  const years = v.holdingYears ?? 5;

  // TCS calculation
  const LRS_THRESHOLD = 700000;
  const TCS_RATE = 0.20;
  const cumulative = priorRemittance + remittanceInr;
  const taxableBase = Math.max(0, cumulative - Math.max(priorRemittance, LRS_THRESHOLD));
  const tcsDeducted = round(taxableBase * TCS_RATE);
  const netRemittance = remittanceInr - tcsDeducted;
  const investedUsd = netRemittance / usdInr;

  // Growth in USD over holding period
  const finalUsd = investedUsd * Math.pow(1 + returnPct, years);
  // Convert to INR at future USD/INR (with depreciation)
  const futureUsdInr = usdInr * Math.pow(1 + depreciationPct, years);
  const finalInr = finalUsd * futureUsdInr;

  // LTCG tax (12.5% on gains if held >24 months)
  const gainInr = Math.max(0, finalInr - netRemittance);
  const ltcgTax = years >= 2 ? gainInr * 0.125 : gainInr * 0.30; // slab approx for <2yr
  const postTaxInr = finalInr - ltcgTax;

  const effectiveCAGR = (Math.pow(postTaxInr / remittanceInr, 1 / years) - 1) * 100;

  return {
    primary: [
      { label: "Post-tax corpus (₹)", value: round(postTaxInr), format: "currency" },
      { label: "Effective CAGR (in ₹)", value: Math.round(effectiveCAGR * 10) / 10, format: "percent" },
      { label: "TCS deducted (refundable)", value: tcsDeducted, format: "currency" },
    ],
    secondary: [
      { label: "Net invested (after TCS)", value: netRemittance, format: "currency" },
      { label: "Pre-tax corpus", value: round(finalInr), format: "currency" },
      { label: "Capital gains tax", value: round(ltcgTax), format: "currency" },
    ],
    donut: { invested: remittanceInr, returns: round(postTaxInr - remittanceInr) },
  };
}

// ── USD Return Modeller ───────────────────────────────────────────────────

export function usdReturnsCalc(v: Record<string, number>): CalcResult {
  const investedInr = v.investmentInr ?? 1000000;
  const usdReturn = (v.usdReturnPct ?? 10) / 100;
  const inrDep = (v.inrDepreciationPct ?? 3) / 100;
  const years = v.years ?? 10;
  const niftyReturn = (v.niftyReturnPct ?? 12) / 100;

  // Combined INR return from USD investment = (1+USD)*(1+depreciation) - 1
  const combinedReturnRate = (1 + usdReturn) * (1 + inrDep) - 1;
  const usCorpus = round(investedInr * Math.pow(1 + combinedReturnRate, years));
  const usGain = usCorpus - investedInr;
  const ltcgTax = Math.max(0, usGain - 125000) * 0.125; // ₹1.25L exempt
  const usPostTax = round(usCorpus - ltcgTax);

  // Nifty 50 comparison
  const niftyCorpus = round(investedInr * Math.pow(1 + niftyReturn, years));
  const niftyGain = niftyCorpus - investedInr;
  const niftyTax = Math.max(0, niftyGain - 125000) * 0.125;
  const niftyPostTax = round(niftyCorpus - niftyTax);

  const usCAGR = Math.round(((Math.pow(usPostTax / investedInr, 1 / years) - 1) * 100) * 10) / 10;
  const niftyCAGR = Math.round(((Math.pow(niftyPostTax / investedInr, 1 / years) - 1) * 100) * 10) / 10;

  return {
    primary: [
      { label: "US investment post-tax (₹)", value: usPostTax, format: "currency" },
      { label: "Effective CAGR in ₹", value: usCAGR, format: "percent" },
      { label: "Nifty 50 equivalent", value: niftyPostTax, format: "currency" },
    ],
    secondary: [
      { label: "US pre-tax corpus", value: usCorpus, format: "currency" },
      { label: "LTCG tax on US gains", value: round(ltcgTax), format: "currency" },
      { label: "Nifty CAGR (post-tax)", value: niftyCAGR, format: "percent" },
    ],
    donut: { invested: investedInr, returns: usPostTax - investedInr },
  };
}
