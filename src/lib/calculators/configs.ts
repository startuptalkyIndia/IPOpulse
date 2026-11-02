import type { CalcMeta } from "./types";
import { corePart } from "./config-parts/core";
import { retirementAndTaxPart } from "./config-parts/retirementAndTax";
import { capitalGainsAndLoansPart } from "./config-parts/capitalGainsAndLoans";
import { globalInvestingPart } from "./config-parts/globalInvesting";

// Calculator catalogue, assembled in the original order from ./config-parts.
export const calculators: CalcMeta[] = [...corePart];

calculators.push(...retirementAndTaxPart);

calculators.push(...capitalGainsAndLoansPart);

calculators.push(...globalInvestingPart);

export function getCalcBySlug(slug: string): CalcMeta | undefined {
  return calculators.find((c) => c.slug === slug);
}
