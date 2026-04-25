/**
 * Curated Indian insurance plan registry — Term Life + Health Insurance.
 * Premiums are illustrative for a healthy 30-year-old non-smoker (term)
 * and a 25-year-old individual (health). Real pricing varies — these are
 * indicative rates from public IRDAI-approved illustrations + comparison
 * sites as of April 2026.
 */

export interface TermPlan {
  slug: string;
  insurer: string;
  planName: string;
  coverCr: number; // sum assured in crores
  termYears: number;
  monthlyPremium: number; // ₹ for healthy 30M non-smoker
  claimSettlementPct: number; // FY24-25 IRDAI ratio
  highlights: string[];
  bestFor: string;
  ctaUrl: string;
}

export const termPlans: TermPlan[] = [
  {
    slug: "hdfc-life-click-2-protect",
    insurer: "HDFC Life",
    planName: "Click 2 Protect Super",
    coverCr: 1,
    termYears: 35,
    monthlyPremium: 1250,
    claimSettlementPct: 99.4,
    highlights: ["3 plan options", "Return of premium add-on", "Critical illness rider"],
    bestFor: "Highest claim settlement ratio in India",
    ctaUrl: "https://www.policybazaar.com/life-insurance/term-insurance/?ref=IPOPULSE",
  },
  {
    slug: "icici-pru-iprotect-smart",
    insurer: "ICICI Prudential",
    planName: "iProtect Smart",
    coverCr: 1,
    termYears: 35,
    monthlyPremium: 1180,
    claimSettlementPct: 98.5,
    highlights: ["7 plan options", "Lifetime cover option", "Accidental death benefit"],
    bestFor: "Customizable cover for varied needs",
    ctaUrl: "https://www.policybazaar.com/life-insurance/term-insurance/?ref=IPOPULSE",
  },
  {
    slug: "max-life-smart-secure-plus",
    insurer: "Max Life",
    planName: "Smart Secure Plus",
    coverCr: 1,
    termYears: 35,
    monthlyPremium: 1100,
    claimSettlementPct: 99.5,
    highlights: ["Joint life option", "Special exit value", "Terminal illness benefit"],
    bestFor: "Joint cover for couples",
    ctaUrl: "https://www.policybazaar.com/life-insurance/term-insurance/?ref=IPOPULSE",
  },
  {
    slug: "tata-aia-sampoorna-raksha",
    insurer: "Tata AIA",
    planName: "Sampoorna Raksha Supreme",
    coverCr: 1,
    termYears: 35,
    monthlyPremium: 1050,
    claimSettlementPct: 99.0,
    highlights: ["Multiple cover options", "Return of premium", "Premium waiver on disability"],
    bestFor: "Lowest premium among top insurers",
    ctaUrl: "https://www.policybazaar.com/life-insurance/term-insurance/?ref=IPOPULSE",
  },
  {
    slug: "lic-tech-term",
    insurer: "LIC",
    planName: "LIC Tech Term",
    coverCr: 1,
    termYears: 35,
    monthlyPremium: 1450,
    claimSettlementPct: 98.7,
    highlights: ["Government-owned trust factor", "Increasing/decreasing cover", "No agent middleman"],
    bestFor: "Trust factor / govt-backed",
    ctaUrl: "https://www.policybazaar.com/life-insurance/term-insurance/?ref=IPOPULSE",
  },
  {
    slug: "bajaj-allianz-life-smart-protect",
    insurer: "Bajaj Allianz",
    planName: "Smart Protect Goal",
    coverCr: 1,
    termYears: 35,
    monthlyPremium: 1080,
    claimSettlementPct: 99.0,
    highlights: ["Increasing sum assured", "Whole life option", "Return of premium variant"],
    bestFor: "Inflation-linked rising cover",
    ctaUrl: "https://www.policybazaar.com/life-insurance/term-insurance/?ref=IPOPULSE",
  },
];

export interface HealthPlan {
  slug: string;
  insurer: string;
  planName: string;
  coverLakh: number;
  monthlyPremium: number; // ₹ for 25M individual
  hospitalNetwork: number;
  claimSettlementPct: number;
  highlights: string[];
  bestFor: string;
  ctaUrl: string;
}

export const healthPlans: HealthPlan[] = [
  {
    slug: "hdfc-ergo-optima-secure",
    insurer: "HDFC ERGO",
    planName: "Optima Secure",
    coverLakh: 10,
    monthlyPremium: 750,
    hospitalNetwork: 13000,
    claimSettlementPct: 95.0,
    highlights: ["2x sum-insured boost", "100% restoration benefit", "No room rent capping"],
    bestFor: "Best overall — wide network, flexible cover",
    ctaUrl: "https://www.policybazaar.com/health-insurance/?ref=IPOPULSE",
  },
  {
    slug: "niva-bupa-reassure",
    insurer: "Niva Bupa (formerly Max Bupa)",
    planName: "ReAssure 2.0",
    coverLakh: 10,
    monthlyPremium: 690,
    hospitalNetwork: 10000,
    claimSettlementPct: 92.0,
    highlights: ["Unlimited restoration", "Lock-the-clock for cashless", "Live healthy discount"],
    bestFor: "Long-term holders — discounts increase with claim-free years",
    ctaUrl: "https://www.policybazaar.com/health-insurance/?ref=IPOPULSE",
  },
  {
    slug: "star-health-comprehensive",
    insurer: "Star Health",
    planName: "Family Health Optima",
    coverLakh: 10,
    monthlyPremium: 720,
    hospitalNetwork: 14000,
    claimSettlementPct: 91.5,
    highlights: ["Floater for entire family", "Auto-recharge of cover", "Vaccination & wellness coverage"],
    bestFor: "Family floater with broad in-network",
    ctaUrl: "https://www.policybazaar.com/health-insurance/?ref=IPOPULSE",
  },
  {
    slug: "icici-lombard-health-elite",
    insurer: "ICICI Lombard",
    planName: "Health Elite",
    coverLakh: 10,
    monthlyPremium: 780,
    hospitalNetwork: 11500,
    claimSettlementPct: 96.5,
    highlights: ["Highest ICICI Bank cashless network", "Add-on for international cover", "Maternity benefits"],
    bestFor: "ICICI banking customers, international travellers",
    ctaUrl: "https://www.policybazaar.com/health-insurance/?ref=IPOPULSE",
  },
  {
    slug: "care-supreme",
    insurer: "Care Health (Religare)",
    planName: "Care Supreme",
    coverLakh: 10,
    monthlyPremium: 660,
    hospitalNetwork: 7000,
    claimSettlementPct: 93.0,
    highlights: ["100% NCB on no-claim", "Air-ambulance cover", "Annual health check-up"],
    bestFor: "Lowest-premium quality cover",
    ctaUrl: "https://www.policybazaar.com/health-insurance/?ref=IPOPULSE",
  },
  {
    slug: "tata-aig-medicare-premier",
    insurer: "Tata AIG",
    planName: "MediCare Premier",
    coverLakh: 10,
    monthlyPremium: 800,
    hospitalNetwork: 10500,
    claimSettlementPct: 94.0,
    highlights: ["Global coverage option", "Maternity & infertility cover", "Reset benefit"],
    bestFor: "Premium feature set, expat-friendly",
    ctaUrl: "https://www.policybazaar.com/health-insurance/?ref=IPOPULSE",
  },
];
