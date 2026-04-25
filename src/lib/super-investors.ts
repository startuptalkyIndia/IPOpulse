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
  {
    slug: "akash-bhanshali",
    name: "Akash Bhanshali",
    shortName: "Akash Bhanshali",
    bio: "Long-time value investor based in Mumbai. Concentrated portfolio focused on financials, capital goods, and select consumer names.",
    alive: true,
    approxPortfolioCr: 2200,
    holdings: [
      { company: "Carysil", pctHeld: 4.2, valueCr: 165, qoqChange: "same" },
      { company: "Tata Investment Corporation", pctHeld: 1.6, valueCr: 290, qoqChange: "same" },
      { company: "Lloyds Metals & Energy", pctHeld: 1.1, valueCr: 240, qoqChange: "added" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "sunil-singhania",
    name: "Sunil Singhania (Abakkus)",
    shortName: "Sunil Singhania",
    bio: "Founder of Abakkus Asset Manager. Former CIO of Reliance Mutual Fund. Multi-cap investor with strong process and concentrated bets.",
    alive: true,
    approxPortfolioCr: 8500,
    holdings: [
      { company: "Mastek", pctHeld: 2.0, valueCr: 165, qoqChange: "same" },
      { company: "Sarda Energy & Minerals", pctHeld: 5.4, valueCr: 410, qoqChange: "same" },
      { company: "HIL", pctHeld: 4.6, valueCr: 95, qoqChange: "added" },
      { company: "Technocraft Industries", pctHeld: 4.0, valueCr: 80, qoqChange: "new" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "porinju-veliyath",
    name: "Porinju Veliyath",
    shortName: "Porinju Veliyath",
    bio: "Kerala-based investor running Equity Intelligence India. Famous for spotting deeply-undervalued small caps and turnarounds.",
    alive: true,
    approxPortfolioCr: 240,
    holdings: [
      { company: "Aurum Proptech", pctHeld: 3.1, valueCr: 30, qoqChange: "same" },
      { company: "Kerala Ayurveda", pctHeld: 5.3, valueCr: 18, qoqChange: "added" },
      { company: "Ovobel Foods", pctHeld: 5.2, valueCr: 12, qoqChange: "same" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "ashish-dhawan",
    name: "Ashish Dhawan",
    shortName: "Ashish Dhawan",
    bio: "Ex-private equity heavyweight (ChrysCapital co-founder). Now invests via personal portfolio + philanthropy.",
    alive: true,
    approxPortfolioCr: 3900,
    holdings: [
      { company: "Quess Corp", pctHeld: 2.4, valueCr: 200, qoqChange: "same" },
      { company: "Glenmark Life Sciences", pctHeld: 1.7, valueCr: 165, qoqChange: "added" },
      { company: "Birlasoft", pctHeld: 1.3, valueCr: 175, qoqChange: "same" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "ramesh-damani",
    name: "Ramesh Damani",
    shortName: "Ramesh Damani",
    bio: "Veteran value investor + BSE board member. Known for long holding periods and patience-based stock picking.",
    alive: true,
    approxPortfolioCr: 320,
    holdings: [
      { company: "Hatsun Agro", pctHeld: 1.4, valueCr: 110, qoqChange: "same" },
      { company: "Aegis Logistics", pctHeld: 0.9, valueCr: 90, qoqChange: "same" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "madhusudan-kela",
    name: "Madhusudan Kela",
    shortName: "Madhusudan Kela",
    bio: "Founder of MK Ventures. Former Chief Investment Strategist at Reliance Capital. Multi-cap investor with focus on growth.",
    alive: true,
    approxPortfolioCr: 2400,
    holdings: [
      { company: "Choice International", pctHeld: 1.4, valueCr: 80, qoqChange: "same" },
      { company: "Dredging Corporation", pctHeld: 1.0, valueCr: 60, qoqChange: "added" },
      { company: "GMR Power", pctHeld: 1.2, valueCr: 110, qoqChange: "same" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "anil-goel",
    name: "Anil Kumar Goel",
    shortName: "Anil Goel",
    bio: "Sugar-sector specialist. Concentrated long-only bets on Indian sugar mill manufacturers and ancillaries.",
    alive: true,
    approxPortfolioCr: 480,
    holdings: [
      { company: "Triveni Engineering", pctHeld: 2.7, valueCr: 175, qoqChange: "same" },
      { company: "Dwarikesh Sugar", pctHeld: 4.8, valueCr: 70, qoqChange: "same" },
      { company: "Avadh Sugar", pctHeld: 7.6, valueCr: 130, qoqChange: "added" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "hiren-ved",
    name: "Hiren Ved (Alchemy Capital)",
    shortName: "Hiren Ved",
    bio: "Co-founder of Alchemy Capital. Mid-cap focus with structural growth themes — financials, healthcare, consumption.",
    alive: true,
    approxPortfolioCr: 6200,
    holdings: [
      { company: "Astral", pctHeld: 1.0, valueCr: 380, qoqChange: "same" },
      { company: "Rainbow Children's Medicare", pctHeld: 1.3, valueCr: 165, qoqChange: "added" },
    ],
    asOf: "Dec 2025 filings",
  },
  {
    slug: "basant-maheshwari",
    name: "Basant Maheshwari",
    shortName: "Basant Maheshwari",
    bio: "Author of 'The Thoughtful Investor.' Quality-and-growth investor. Vocal market educator on YouTube and Twitter.",
    alive: true,
    approxPortfolioCr: 380,
    holdings: [
      { company: "Page Industries", pctHeld: 0.6, valueCr: 110, qoqChange: "same" },
      { company: "ICICI Lombard", pctHeld: 0.3, valueCr: 95, qoqChange: "same" },
    ],
    asOf: "Dec 2025 filings",
  },
];

export function getInvestorBySlug(slug: string): SuperInvestor | undefined {
  return superInvestors.find((s) => s.slug === slug);
}
