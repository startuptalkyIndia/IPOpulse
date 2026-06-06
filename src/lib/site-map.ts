/**
 * Canonical Site Map — single source of truth for navigation, the /explore hub,
 * and homepage module grouping.
 *
 * Organized by USER INTENT into 7 top-level sections. Each section has sub-groups
 * (for scannable dropdown columns + explore-page categories). Every route lives
 * in exactly one place so nothing is orphaned.
 */

export interface SiteLink {
  href: string;
  label: string;
  desc?: string;       // short description (shown on /explore)
  badge?: string;
}

export interface SiteSubGroup {
  title: string;       // column / category header
  links: SiteLink[];
}

export interface SiteSection {
  key: string;
  label: string;       // nav label
  href?: string;       // optional landing page for the section
  icon: string;        // lucide icon name
  blurb: string;       // one-line section description (shown on /explore)
  groups: SiteSubGroup[];
}

export const SITE_MAP: SiteSection[] = [
  // ─────────────────────────────────────────────────────────────── IPO
  {
    key: "ipo",
    label: "IPO",
    href: "/ipo",
    icon: "Rocket",
    blurb: "Live & upcoming IPOs, GMP, allotment, performance and analysis.",
    groups: [
      {
        title: "Current IPOs",
        links: [
          { href: "/ipo/live", label: "Live IPOs", desc: "Open for subscription now", badge: "🔴" },
          { href: "/ipo/upcoming", label: "Upcoming IPOs", desc: "Announced, opening soon" },
          { href: "/ipo/this-week", label: "This Week", desc: "IPOs opening or listing this week" },
          { href: "/ipo/closed", label: "Closed IPOs", desc: "Subscription closed, awaiting listing" },
          { href: "/ipo/listed", label: "Recently Listed", desc: "Listed in the last 12 months" },
          { href: "/ipo/sme", label: "SME IPOs", desc: "NSE Emerge & BSE SME issues" },
        ],
      },
      {
        title: "Track & Apply",
        links: [
          { href: "/ipo/calendar", label: "IPO Calendar", desc: "Full schedule of open/close/listing dates" },
          { href: "/ipo/allotment", label: "Allotment Status", desc: "Check allotment via registrar links" },
          { href: "/ipo/allotment-probability", label: "Allotment Probability", desc: "Estimate your allotment chances" },
          { href: "/ipo/gmp-accuracy", label: "GMP Accuracy", desc: "How accurate grey-market premium has been" },
          { href: "/ipo/anchor-lock-in", label: "Anchor Lock-in Calendar", desc: "When anchor shares unlock" },
        ],
      },
      {
        title: "Analysis & Performance",
        links: [
          { href: "/ipo/performance", label: "Performance Tracker", desc: "Listing + 1M/3M/6M/1Y returns", badge: "New" },
          { href: "/ipo/merchant-bankers", label: "Merchant Bankers", desc: "BRLM leaderboard by listing gain", badge: "New" },
          { href: "/ipo/by-sector", label: "IPOs by Sector", desc: "Which sectors deliver best gains", badge: "New" },
          { href: "/ipo/by-size", label: "IPOs by Size", desc: "Mega / large / mid / small buckets", badge: "New" },
          { href: "/ipo/stats", label: "IPO Statistics", desc: "Yearly trends & success rates" },
          { href: "/ipo/sme-risk", label: "SME Risk Scorecard", desc: "Risk score for every SME IPO" },
          { href: "/ipo/drhp", label: "DRHP AI Search", desc: "Ask questions about any prospectus" },
          { href: "/ipo/process", label: "How IPOs Work", desc: "Step-by-step IPO process guide" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── STOCKS
  {
    key: "stocks",
    label: "Stocks",
    href: "/ticker",
    icon: "LineChart",
    blurb: "Research any stock — screener, curated lists, technicals, ownership.",
    groups: [
      {
        title: "Research & Screen",
        links: [
          { href: "/ticker", label: "Stock Ticker", desc: "Search any NSE/BSE stock — full profile" },
          { href: "/screener", label: "Stock Screener", desc: "Filter 2,300+ stocks by 15+ metrics" },
          { href: "/best-stocks", label: "Best Stocks Lists", desc: "14 curated lists by price, cap, quality", badge: "14" },
          { href: "/movers", label: "Gainers / Losers", desc: "Today's biggest movers" },
          { href: "/compare/stocks", label: "Compare Stocks", desc: "Side-by-side fundamentals" },
        ],
      },
      {
        title: "Ownership & Quality",
        links: [
          { href: "/super-investor", label: "Super Investors", desc: "Track ace investor portfolios" },
          { href: "/shareholding", label: "Shareholding Patterns", desc: "Promoter, FII, DII holdings" },
          { href: "/screener/promoter", label: "High Promoter Holding", desc: "Stocks with >45% promoter stake" },
          { href: "/dividend-yield", label: "Dividend Yield", desc: "Highest dividend-paying stocks" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── MARKETS
  {
    key: "markets",
    label: "Markets",
    href: "/indices",
    icon: "Activity",
    blurb: "Indices, sectors, institutional flows, deals and market calendars.",
    groups: [
      {
        title: "Market Overview",
        links: [
          { href: "/indices", label: "Nifty Indices", desc: "100+ indices with P/E, 30D trends" },
          { href: "/sectors", label: "Sectors", desc: "Sector dashboards with aggregate stats" },
          { href: "/market/breadth", label: "Market Breadth", desc: "Advances vs declines, new highs/lows" },
          { href: "/daily-summary", label: "Daily Market Wrap", desc: "AI end-of-day summary" },
        ],
      },
      {
        title: "Institutional & Deals",
        links: [
          { href: "/fii-dii", label: "FII / DII Activity", desc: "Daily foreign & domestic flows" },
          { href: "/sectors/fpi-flows", label: "FPI Sector Flows", desc: "Where foreign money is moving" },
          { href: "/deals/bulk", label: "Bulk Deals", desc: "Large single-party transactions" },
          { href: "/deals/block", label: "Block Deals", desc: "Negotiated block-window deals" },
          { href: "/insider-trading", label: "Insider Trading", desc: "Promoter/insider buy-sell filings" },
        ],
      },
      {
        title: "Calendars",
        links: [
          { href: "/market/holidays", label: "Market Holidays", desc: "NSE/BSE trading holidays 2026" },
          { href: "/market/fo-expiry", label: "F&O Expiry Calendar", desc: "Futures & options expiry dates" },
          { href: "/market/economic-calendar", label: "Economic Calendar", desc: "RBI, inflation, GDP event dates" },
          { href: "/earnings-calendar", label: "Earnings Calendar", desc: "Upcoming quarterly results" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────── FUNDS & OTHER
  {
    key: "funds",
    label: "Funds & Bonds",
    href: "/mutual-funds",
    icon: "PiggyBank",
    blurb: "Mutual funds, REITs, gold bonds, NCDs, corporate actions & unlisted.",
    groups: [
      {
        title: "Mutual Funds",
        links: [
          { href: "/mutual-funds", label: "Mutual Funds", desc: "NAVs for every Indian scheme" },
          { href: "/mutual-funds/screener", label: "MF Screener", desc: "Filter funds by category & returns" },
          { href: "/mutual-funds/international", label: "International Funds", desc: "US & global equity funds from India" },
        ],
      },
      {
        title: "Fixed Income & Alt",
        links: [
          { href: "/reits", label: "REITs & InvITs", desc: "Real-estate & infra investment trusts" },
          { href: "/sgb", label: "Sovereign Gold Bonds", desc: "RBI gold bonds — live & past tranches" },
          { href: "/ncds", label: "NCDs", desc: "Non-convertible debenture issues" },
          { href: "/unlisted-shares", label: "Unlisted Shares", desc: "Pre-IPO / unlisted company prices" },
        ],
      },
      {
        title: "Corporate Actions",
        links: [
          { href: "/corporate-actions", label: "All Corporate Actions", desc: "Dividends, splits, bonus, buybacks" },
          { href: "/corporate-actions/rights-bonus", label: "Rights & Bonus", desc: "Rights issues & bonus shares" },
          { href: "/buybacks", label: "Buybacks", desc: "Share buyback offers" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── TOOLS
  {
    key: "tools",
    label: "Tools",
    href: "/calculators",
    icon: "Calculator",
    blurb: "Calculators, broker/card/insurance comparisons, and US market tools.",
    groups: [
      {
        title: "Compare",
        links: [
          { href: "/compare/brokers", label: "Stock Brokers", desc: "Compare brokerage & features", badge: "Top 6" },
          { href: "/compare/credit-cards", label: "Credit Cards", desc: "Best cards by category", badge: "Top 6" },
          { href: "/compare/insurance", label: "Insurance Plans", desc: "Term & health insurance compare" },
        ],
      },
      {
        title: "Calculators",
        links: [
          { href: "/calculators", label: "All Calculators", desc: "25+ financial calculators" },
          { href: "/calculators/sip", label: "SIP Calculator", desc: "Project mutual-fund SIP returns" },
          { href: "/calculators/emi", label: "EMI Calculator", desc: "Loan EMI & amortization" },
          { href: "/calculators/tax", label: "Income Tax Calculator", desc: "Old vs new regime" },
          { href: "/calculators/capital-gains", label: "Capital Gains Tax", desc: "LTCG / STCG on equity" },
          { href: "/calculators/stock-forecast", label: "FORE — Stock Returns", desc: "Forecast stock CAGR" },
        ],
      },
      {
        title: "US & Global",
        links: [
          { href: "/us-ipo", label: "US IPO Tracker", desc: "Latest US IPOs from SEC filings" },
          { href: "/us-listing", label: "Indian ADRs", desc: "Indian companies listed in the US" },
          { href: "/calculators/lrs-tcs", label: "LRS / TCS Calculator", desc: "Foreign-remittance tax" },
          { href: "/calculators/usd-returns", label: "USD Returns", desc: "Currency-adjusted returns" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── RESEARCH
  {
    key: "research",
    label: "Research",
    href: "/research",
    icon: "Newspaper",
    blurb: "Market news, AI research tools, sector momentum and watch lists.",
    groups: [
      {
        title: "News & Intel",
        links: [
          { href: "/news", label: "Market News", desc: "Live aggregated market headlines", badge: "Live" },
          { href: "/news/twitter", label: "Financial Twitter India", desc: "Top finance accounts to follow" },
          { href: "/research", label: "Research Hub", desc: "Curated research & insights" },
          { href: "/research/next-day", label: "Tomorrow's Watch List", desc: "AI stocks-to-watch tomorrow" },
        ],
      },
      {
        title: "AI Tools",
        links: [
          { href: "/sectors/momentum", label: "Sector Momentum", desc: "Which sectors are heating up" },
          { href: "/tools/concall-summary", label: "Concall AI", desc: "AI summaries of earnings calls" },
          { href: "/tools/promoter-check", label: "Promoter Check", desc: "Governance & pledge red flags" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── LEARN
  {
    key: "learn",
    label: "Learn",
    href: "/learn",
    icon: "GraduationCap",
    blurb: "65+ plain-English guides and a financial glossary.",
    groups: [
      {
        title: "Start Here",
        links: [
          { href: "/learn", label: "Learning Hub", desc: "All guides, organized by topic", badge: "65 guides" },
          { href: "/glossary", label: "Financial Glossary", desc: "90+ market terms explained", badge: "90+" },
        ],
      },
      {
        title: "Popular Guides",
        links: [
          { href: "/learn/what-is-demat-account", label: "What is a Demat Account?" },
          { href: "/learn/what-is-mutual-fund", label: "What is a Mutual Fund?" },
          { href: "/learn/pe-ratio", label: "Understanding P/E Ratio" },
          { href: "/learn/ipo-gmp", label: "What is IPO GMP?" },
          { href: "/learn/cagr-meaning", label: "What is CAGR?" },
          { href: "/learn/what-are-futures-options", label: "What is F&O?" },
        ],
      },
    ],
  },
];

/** All section keys/labels for quick nav rendering. */
export function getSectionLabels() {
  return SITE_MAP.map((s) => ({ key: s.key, label: s.label, href: s.href }));
}
