/**
 * Hand-curated registry of tracked "super investors". In the next phase, live
 * holdings will be pulled from BSE/NSE quarterly XBRL shareholding filings. For
 * Week 4, we render curated/representative seed data so the page has shape.
 */

export interface SuperInvestorHolding {
  company: string;
  pctHeld: number; // % of company held
  valueCr: number; // approximate value in ₹ crore
  qoqChange: "new" | "added" | "same" | "reduced" | "exited";
}

export interface SuperInvestor {
  slug: string;
  name: string;
  shortName: string;
  bio: string;
  alive: boolean;
  approxPortfolioCr: number;
  followers?: number;
  holdings: SuperInvestorHolding[];
  asOf: string;
}

export const superInvestors: SuperInvestor[] = [
  {
    slug: "rekha-jhunjhunwala",
    name: "Rekha Jhunjhunwala (RARE Family)",
    shortName: "Rekha Jhunjhunwala",
    bio: "Wife of the late Rakesh Jhunjhunwala (India's 'Big Bull'). Continues to manage the RARE family portfolio — among India's largest individual equity portfolios.",
    alive: true,
    approxPortfolioCr: 55000,
    holdings: [
      { company: "Titan Company", pctHeld: 5.35, valueCr: 18500, qoqChange: "same" },
      { company: "Star Health Insurance", pctHeld: 14.30, valueCr: 8400, qoqChange: "same" },
      { company: "Tata Motors", pctHeld: 1.14, valueCr: 5800, qoqChange: "same" },
      { company: "Metro Brands", pctHeld: 14.20, valueCr: 4700, qoqChange: "added" },
      { company: "Nazara Technologies", pctHeld: 10.10, valueCr: 900, qoqChange: "same" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "radhakishan-damani",
    name: "Radhakishan Damani",
    shortName: "R. Damani",
    bio: "Founder of DMart (Avenue Supermarts). India's 5th richest individual investor. Known for value investing, patience, and a deeply concentrated portfolio.",
    alive: true,
    approxPortfolioCr: 182000,
    holdings: [
      { company: "Avenue Supermarts (DMart)", pctHeld: 67.0, valueCr: 170000, qoqChange: "same" },
      { company: "VST Industries", pctHeld: 36.0, valueCr: 1900, qoqChange: "same" },
      { company: "India Cements", pctHeld: 5.4, valueCr: 450, qoqChange: "same" },
      { company: "Sundaram Finance", pctHeld: 2.1, valueCr: 350, qoqChange: "added" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "ashish-kacholia",
    name: "Ashish Kacholia",
    shortName: "Ashish Kacholia",
    bio: "Small-cap specialist. Known for spotting multi-baggers early. Runs Hungama Digital Services (entertainment portfolio).",
    alive: true,
    approxPortfolioCr: 2800,
    holdings: [
      { company: "Safari Industries", pctHeld: 3.4, valueCr: 280, qoqChange: "same" },
      { company: "Beta Drugs", pctHeld: 4.5, valueCr: 140, qoqChange: "added" },
      { company: "Shaily Engineering Plastics", pctHeld: 2.7, valueCr: 110, qoqChange: "same" },
      { company: "Balaji Amines", pctHeld: 2.2, valueCr: 95, qoqChange: "reduced" },
      { company: "NIIT Learning Systems", pctHeld: 4.8, valueCr: 180, qoqChange: "new" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "vijay-kedia",
    name: "Vijay Kedia",
    shortName: "Vijay Kedia",
    bio: "Managing director of Kedia Securities. SMILE philosophy: Small in size, Medium in experience, Large in aspiration, Extra-large in market potential.",
    alive: true,
    approxPortfolioCr: 1400,
    holdings: [
      { company: "Atul Auto", pctHeld: 18.2, valueCr: 350, qoqChange: "same" },
      { company: "Repro India", pctHeld: 7.1, valueCr: 95, qoqChange: "same" },
      { company: "Tejas Networks", pctHeld: 1.4, valueCr: 180, qoqChange: "reduced" },
      { company: "Mahindra Holidays", pctHeld: 1.3, valueCr: 120, qoqChange: "added" },
      { company: "Vaibhav Global", pctHeld: 1.2, valueCr: 70, qoqChange: "same" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "dolly-khanna",
    name: "Dolly & Rajiv Khanna",
    shortName: "Dolly Khanna",
    bio: "Chennai-based investor famous for spotting obscure small-cap multi-baggers. Portfolio managed by husband Rajiv. Known for quick rotation — entries and exits.",
    alive: true,
    approxPortfolioCr: 420,
    holdings: [
      { company: "Nitin Spinners", pctHeld: 1.8, valueCr: 40, qoqChange: "new" },
      { company: "Prakash Industries", pctHeld: 1.3, valueCr: 30, qoqChange: "same" },
      { company: "Pondy Oxides", pctHeld: 2.2, valueCr: 25, qoqChange: "added" },
      { company: "Rain Industries", pctHeld: 1.1, valueCr: 55, qoqChange: "same" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "mukul-agrawal",
    name: "Mukul Agrawal",
    shortName: "Mukul Agrawal",
    bio: "Mumbai-based super investor with concentrated small and midcap holdings. Portfolio valued at ₹5,000+ crore across 60+ names.",
    alive: true,
    approxPortfolioCr: 5400,
    holdings: [
      { company: "BSE Limited", pctHeld: 1.4, valueCr: 780, qoqChange: "added" },
      { company: "Radico Khaitan", pctHeld: 2.3, valueCr: 490, qoqChange: "same" },
      { company: "Fairchem Organics", pctHeld: 4.1, valueCr: 210, qoqChange: "same" },
      { company: "Hitachi Energy India", pctHeld: 0.9, valueCr: 350, qoqChange: "new" },
    ],
    asOf: "Dec 2025 filings",
  },
];

export function getInvestorBySlug(slug: string): SuperInvestor | undefined {
  return superInvestors.find((s) => s.slug === slug);
}
