import {
  sipCalc,
  stepUpSipCalc,
  lumpsumCalc,
  swpCalc,
  emiCalc,
  fdCalc,
  ppfCalc,
  retirementCalc,
  taxCalc,
  brokerageCalc,
  npsCalc,
  rdCalc,
  hraCalc,
  inflationCalc,
  mfReturnsCalc,
  ltcgStcgCalc,
  fnoMarginCalc,
  goalCalc,
} from "./math";
import type { CalcResult } from "./types";

export const mathBySlug: Record<string, (i: Record<string, number>) => CalcResult> = {
  sip: sipCalc,
  "step-up-sip": stepUpSipCalc,
  lumpsum: lumpsumCalc,
  swp: swpCalc,
  emi: emiCalc,
  "car-loan-emi": emiCalc,      // same math, different config defaults & copy
  "personal-loan-emi": emiCalc, // same math, different config defaults & copy
  fd: fdCalc,
  ppf: ppfCalc,
  retirement: retirementCalc,
  tax: taxCalc,
  brokerage: brokerageCalc,
  nps: npsCalc,
  rd: rdCalc,
  hra: hraCalc,
  inflation: inflationCalc,
  "mf-returns": mfReturnsCalc,
  "ltcg-stcg": ltcgStcgCalc,
  "fno-margin": fnoMarginCalc,
  goal: goalCalc,
};
