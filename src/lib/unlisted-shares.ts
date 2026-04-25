/**
 * Curated registry of popular pre-IPO / unlisted shares traded in the
 * Indian grey market. Each share carries quotes from 3-5 dealers; we
 * compute median + range to publish a fair price index nobody else
 * offers (UnlistedZone, Stockify, InCred, Sharescart all quote in
 * isolation).
 */

export interface DealerQuote {
  dealer: string;
  bid: number;
  ask: number;
  asOf: string; // YYYY-MM-DD
}

export interface UnlistedShare {
  slug: string;
  name: string;
  sector: string;
  faceValue: number;
  parentCompany?: string;
  description: string;
  ipoStatus: "drhp_filed" | "rumored" | "private" | "demerger";
  expectedIpoYear?: string;
  liquidity: "high" | "medium" | "low";
  quotes: DealerQuote[];
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface PriceIndex {
  median: number;
  bidMedian: number;
  askMedian: number;
  spread: number; // ask-median minus bid-median
  spreadPct: number;
  rangeLow: number;
  rangeHigh: number;
  rangePct: number; // (high-low)/median × 100
  asOf: string;
}

export function computeIndex(quotes: DealerQuote[]): PriceIndex | null {
  if (quotes.length === 0) return null;
  const bids = quotes.map((q) => q.bid);
  const asks = quotes.map((q) => q.ask);
  const mids = quotes.map((q) => (q.bid + q.ask) / 2);
  const m = median(mids);
  const bidMedian = median(bids);
  const askMedian = median(asks);
  const rangeLow = Math.min(...bids);
  const rangeHigh = Math.max(...asks);
  const asOf = quotes.map((q) => q.asOf).sort().reverse()[0];
  return {
    median: m,
    bidMedian,
    askMedian,
    spread: askMedian - bidMedian,
    spreadPct: m > 0 ? ((askMedian - bidMedian) / m) * 100 : 0,
    rangeLow,
    rangeHigh,
    rangePct: m > 0 ? ((rangeHigh - rangeLow) / m) * 100 : 0,
    asOf,
  };
}

export const unlistedShares: UnlistedShare[] = [
  {
    slug: "nse",
    name: "National Stock Exchange (NSE)",
    sector: "Capital Markets",
    faceValue: 1,
    description: "India's largest stock exchange. SEBI nudges have repeatedly delayed the IPO; the listing is widely expected once governance overhang clears.",
    ipoStatus: "rumored",
    expectedIpoYear: "2026-27",
    liquidity: "high",
    quotes: [
      { dealer: "UnlistedZone", bid: 1860, ask: 1920, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 1880, ask: 1950, asOf: "2026-04-25" },
      { dealer: "InCred Money", bid: 1900, ask: 1960, asOf: "2026-04-25" },
      { dealer: "Sharescart", bid: 1875, ask: 1925, asOf: "2026-04-25" },
    ],
  },
  {
    slug: "reliance-retail",
    name: "Reliance Retail",
    sector: "Retail",
    faceValue: 10,
    parentCompany: "Reliance Industries",
    description: "India's largest organised retail business. Reliance has signaled multiple times that an IPO/demerger is on the horizon.",
    ipoStatus: "demerger",
    expectedIpoYear: "2026-27",
    liquidity: "high",
    quotes: [
      { dealer: "UnlistedZone", bid: 1620, ask: 1680, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 1640, ask: 1690, asOf: "2026-04-25" },
      { dealer: "InCred Money", bid: 1635, ask: 1695, asOf: "2026-04-25" },
    ],
  },
  {
    slug: "reliance-jio",
    name: "Reliance Jio Infocomm",
    sector: "Telecom",
    faceValue: 10,
    parentCompany: "Reliance Industries",
    description: "India's largest telecom operator. Jio Platforms IPO/demerger expected in the next 12-24 months.",
    ipoStatus: "demerger",
    expectedIpoYear: "2026-27",
    liquidity: "high",
    quotes: [
      { dealer: "UnlistedZone", bid: 1430, ask: 1475, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 1450, ask: 1485, asOf: "2026-04-25" },
      { dealer: "InCred Money", bid: 1445, ask: 1490, asOf: "2026-04-25" },
      { dealer: "Sharescart", bid: 1425, ask: 1480, asOf: "2026-04-25" },
    ],
  },
  {
    slug: "tata-capital",
    name: "Tata Capital",
    sector: "NBFC",
    faceValue: 10,
    parentCompany: "Tata Sons",
    description: "Tata's NBFC arm. Recently filed DRHP — listed via mainboard IPO 2026.",
    ipoStatus: "drhp_filed",
    expectedIpoYear: "2026 (listed)",
    liquidity: "medium",
    quotes: [
      { dealer: "UnlistedZone", bid: 960, ask: 1010, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 975, ask: 1015, asOf: "2026-04-25" },
      { dealer: "InCred Money", bid: 985, ask: 1020, asOf: "2026-04-25" },
    ],
  },
  {
    slug: "swiggy",
    name: "Swiggy",
    sector: "Consumer Tech",
    faceValue: 1,
    description: "Food delivery, quick commerce (Instamart) and on-demand. Filed DRHP; listing imminent.",
    ipoStatus: "drhp_filed",
    expectedIpoYear: "2026",
    liquidity: "high",
    quotes: [
      { dealer: "UnlistedZone", bid: 395, ask: 415, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 400, ask: 420, asOf: "2026-04-25" },
      { dealer: "InCred Money", bid: 405, ask: 422, asOf: "2026-04-25" },
      { dealer: "Sharescart", bid: 398, ask: 418, asOf: "2026-04-25" },
    ],
  },
  {
    slug: "polymatech-electronics",
    name: "Polymatech Electronics",
    sector: "Semiconductor",
    faceValue: 10,
    description: "Indian semiconductor manufacturing — beneficiary of the India semiconductor mission. Filed DRHP in late 2025.",
    ipoStatus: "drhp_filed",
    liquidity: "low",
    quotes: [
      { dealer: "UnlistedZone", bid: 560, ask: 605, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 575, ask: 610, asOf: "2026-04-25" },
    ],
  },
  {
    slug: "ola-electric",
    name: "Ola Electric Technologies",
    sector: "EV / Auto",
    faceValue: 10,
    description: "Bhavish Aggarwal's EV company. Currently in live IPO window.",
    ipoStatus: "drhp_filed",
    expectedIpoYear: "2026 (live)",
    liquidity: "high",
    quotes: [
      { dealer: "UnlistedZone", bid: 85, ask: 92, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 86, ask: 93, asOf: "2026-04-25" },
      { dealer: "InCred Money", bid: 88, ask: 94, asOf: "2026-04-25" },
    ],
  },
  {
    slug: "studds-accessories",
    name: "Studds Accessories",
    sector: "Auto Ancillaries",
    faceValue: 5,
    description: "World's largest helmet manufacturer by volume. SEBI approval pending.",
    ipoStatus: "drhp_filed",
    expectedIpoYear: "2026",
    liquidity: "low",
    quotes: [
      { dealer: "UnlistedZone", bid: 1150, ask: 1220, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 1175, ask: 1230, asOf: "2026-04-25" },
    ],
  },
  {
    slug: "boat-imagine-marketing",
    name: "boAt (Imagine Marketing)",
    sector: "Consumer Electronics",
    faceValue: 10,
    description: "Audio products. Withdrew earlier IPO; refiling expected when consumer-tech valuations recover.",
    ipoStatus: "private",
    expectedIpoYear: "2027?",
    liquidity: "low",
    quotes: [
      { dealer: "UnlistedZone", bid: 200, ask: 230, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 210, ask: 235, asOf: "2026-04-25" },
    ],
  },
  {
    slug: "cii-corporate-india",
    name: "Care Health Insurance",
    sector: "Insurance",
    faceValue: 10,
    parentCompany: "Religare Enterprises",
    description: "Health insurer; IPO expected once parent's regulatory issues clear.",
    ipoStatus: "rumored",
    expectedIpoYear: "2026-27",
    liquidity: "low",
    quotes: [
      { dealer: "UnlistedZone", bid: 200, ask: 225, asOf: "2026-04-25" },
      { dealer: "Stockify", bid: 210, ask: 230, asOf: "2026-04-25" },
    ],
  },
];

export function getUnlistedBySlug(slug: string): UnlistedShare | undefined {
  return unlistedShares.find((u) => u.slug === slug);
}
