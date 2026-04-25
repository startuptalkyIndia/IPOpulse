/**
 * Curated registry of popular pre-IPO / unlisted shares traded in the
 * Indian grey market. Prices update manually as the market is fragmented
 * (UnlistedZone, InCred, Stockify, etc. all publish different numbers).
 */

export interface UnlistedShare {
  slug: string;
  name: string;
  sector: string;
  recentPrice: number;
  faceValue: number;
  parentCompany?: string;
  description: string;
  ipoStatus: "drhp_filed" | "rumored" | "private" | "demerger";
  expectedIpoYear?: string;
  asOf: string;
  liquidity: "high" | "medium" | "low";
}

export const unlistedShares: UnlistedShare[] = [
  {
    slug: "nse",
    name: "National Stock Exchange (NSE)",
    sector: "Capital Markets",
    recentPrice: 1900,
    faceValue: 1,
    description: "India's largest stock exchange. SEBI nudges have repeatedly delayed the IPO; the listing is widely expected once governance overhang clears.",
    ipoStatus: "rumored",
    expectedIpoYear: "2026-27",
    asOf: "Apr 2026",
    liquidity: "high",
  },
  {
    slug: "reliance-retail",
    name: "Reliance Retail",
    sector: "Retail",
    recentPrice: 1650,
    faceValue: 10,
    parentCompany: "Reliance Industries",
    description: "India's largest organised retail business. Reliance has signaled multiple times that an IPO/demerger is on the horizon.",
    ipoStatus: "demerger",
    expectedIpoYear: "2026-27",
    asOf: "Apr 2026",
    liquidity: "high",
  },
  {
    slug: "reliance-jio",
    name: "Reliance Jio Infocomm",
    sector: "Telecom",
    recentPrice: 1450,
    faceValue: 10,
    parentCompany: "Reliance Industries",
    description: "India's largest telecom operator. Jio Platforms IPO/demerger expected in the next 12-24 months.",
    ipoStatus: "demerger",
    expectedIpoYear: "2026-27",
    asOf: "Apr 2026",
    liquidity: "high",
  },
  {
    slug: "tata-capital",
    name: "Tata Capital",
    sector: "NBFC",
    recentPrice: 980,
    faceValue: 10,
    parentCompany: "Tata Sons",
    description: "Tata's NBFC arm. Recently filed DRHP — listed via mainboard IPO 2026.",
    ipoStatus: "drhp_filed",
    expectedIpoYear: "2026 (listed)",
    asOf: "Apr 2026",
    liquidity: "medium",
  },
  {
    slug: "swiggy",
    name: "Swiggy",
    sector: "Consumer Tech",
    recentPrice: 405,
    faceValue: 1,
    description: "Food delivery, quick commerce (Instamart) and on-demand. Filed DRHP; listing imminent.",
    ipoStatus: "drhp_filed",
    expectedIpoYear: "2026",
    asOf: "Apr 2026",
    liquidity: "high",
  },
  {
    slug: "polymatech-electronics",
    name: "Polymatech Electronics",
    sector: "Semiconductor",
    recentPrice: 580,
    faceValue: 10,
    description: "Indian semiconductor manufacturing — beneficiary of the India semiconductor mission. Filed DRHP in late 2025.",
    ipoStatus: "drhp_filed",
    asOf: "Apr 2026",
    liquidity: "low",
  },
  {
    slug: "ola-electric",
    name: "Ola Electric Technologies",
    sector: "EV / Auto",
    recentPrice: 88,
    faceValue: 10,
    description: "Bhavish Aggarwal's EV company. Currently in live IPO window.",
    ipoStatus: "drhp_filed",
    expectedIpoYear: "2026 (live)",
    asOf: "Apr 2026",
    liquidity: "high",
  },
  {
    slug: "studds-accessories",
    name: "Studds Accessories",
    sector: "Auto Ancillaries",
    recentPrice: 1180,
    faceValue: 5,
    description: "World's largest helmet manufacturer by volume. SEBI approval pending.",
    ipoStatus: "drhp_filed",
    expectedIpoYear: "2026",
    asOf: "Apr 2026",
    liquidity: "low",
  },
  {
    slug: "boat-imagine-marketing",
    name: "boAt (Imagine Marketing)",
    sector: "Consumer Electronics",
    recentPrice: 215,
    faceValue: 10,
    description: "Audio products. Withdrew earlier IPO; refiling expected when consumer-tech valuations recover.",
    ipoStatus: "private",
    expectedIpoYear: "2027?",
    asOf: "Apr 2026",
    liquidity: "low",
  },
  {
    slug: "cii-corporate-india",
    name: "Care Health Insurance",
    sector: "Insurance",
    recentPrice: 215,
    faceValue: 10,
    parentCompany: "Religare Enterprises",
    description: "Health insurer; IPO expected once parent's regulatory issues clear.",
    ipoStatus: "rumored",
    expectedIpoYear: "2026-27",
    asOf: "Apr 2026",
    liquidity: "low",
  },
];

export function getUnlistedBySlug(slug: string): UnlistedShare | undefined {
  return unlistedShares.find((u) => u.slug === slug);
}
