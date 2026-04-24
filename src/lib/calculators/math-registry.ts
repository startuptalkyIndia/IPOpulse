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
} from "./math";
import type { CalcResult } from "./types";

export const mathBySlug: Record<string, (i: Record<string, number>) => CalcResult> = {
  sip: sipCalc,
  "step-up-sip": stepUpSipCalc,
  lumpsum: lumpsumCalc,
  swp: swpCalc,
  emi: emiCalc,
  fd: fdCalc,
  ppf: ppfCalc,
  retirement: retirementCalc,
  tax: taxCalc,
  brokerage: brokerageCalc,
};
