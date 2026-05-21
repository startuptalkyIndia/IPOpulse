/**
 * Curated stock list category definitions.
 * Each category is rendered at /best-stocks/[slug] with DB-driven data.
 *
 * Data flows from bhavcopy_daily (prices) + companies (market cap, P/E, ROE).
 * No real-time data needed — daily-refreshed from EOD bhavcopy.
 */

export interface BestStocksCategory {
  slug: string;
  title: string;
  shortLabel: string;          // for cards/nav
  description: string;          // 1-line for SEO meta
  longDescription: string;      // intro paragraph on the page
  icon: string;                 // lucide name
  color: string;                // tailwind text/bg color class
  // Filter applied to DB query
  filter: {
    priceMin?: number;
    priceMax?: number;
    marketCapMin?: number;     // in crore
    marketCapMax?: number;
    peMin?: number;
    peMax?: number;
    roeMin?: number;
    sortBy: "marketCap" | "price" | "pe" | "roe" | "dividend" | "1y_return";
    sortOrder: "asc" | "desc";
    limit: number;
    excludeSme?: boolean;
  };
  keyMetric: string;             // What to highlight in the table
  expertNote: string;            // 1-paragraph context / warning
}

export const bestStocksCategories: BestStocksCategory[] = [
  {
    slug: "under-100",
    title: "Best Stocks Under ₹100 in India 2026 — NSE BSE List",
    shortLabel: "Under ₹100",
    description: "Top quality stocks under ₹100 on NSE/BSE in 2026. Curated from 2,300+ listed companies by market cap, fundamentals, and price.",
    longDescription: "Stocks under ₹100 are popular with retail investors because they appear 'affordable' — but remember, share price tells you nothing about value. A ₹50 stock isn't cheaper than a ₹5,000 stock; it's the market cap and earnings that matter. Below are companies trading under ₹100 sorted by market cap so you find genuine large/mid-caps, not just illiquid penny stocks.",
    icon: "Coins",
    color: "text-amber-600 bg-amber-50",
    filter: { priceMax: 100, marketCapMin: 1000, sortBy: "marketCap", sortOrder: "desc", limit: 50, excludeSme: true },
    keyMetric: "Market Cap",
    expertNote: "Low share price ≠ cheap stock. Always check P/E and market cap. Many sub-₹100 stocks are large companies with huge share counts (like Vodafone Idea, ITC, IRFC), not micro-caps."
  },
  {
    slug: "under-50",
    title: "Best Stocks Under ₹50 in India 2026 — Affordable Stock List",
    shortLabel: "Under ₹50",
    description: "Stocks trading under ₹50 on NSE/BSE — sorted by market cap with real-time prices and fundamentals.",
    longDescription: "Stocks under ₹50 include several large companies with very high share counts (PSU banks, Vodafone Idea, large NBFCs) — these are not penny stocks. The list below excludes SME stocks and shows only mainboard companies with at least ₹500 crore market cap.",
    icon: "Coins",
    color: "text-orange-600 bg-orange-50",
    filter: { priceMax: 50, marketCapMin: 500, sortBy: "marketCap", sortOrder: "desc", limit: 50, excludeSme: true },
    keyMetric: "Market Cap",
    expertNote: "Most stocks under ₹50 with large market cap are PSUs, public sector banks, or companies with face value of ₹1-₹2. They are not penny stocks — they have massive share counts."
  },
  {
    slug: "under-500",
    title: "Best Stocks Under ₹500 in India 2026 — Mainboard Companies",
    shortLabel: "Under ₹500",
    description: "Quality stocks under ₹500 — large and mid-caps with strong fundamentals. Updated daily from NSE/BSE bhavcopy.",
    longDescription: "The ₹500 price point captures a huge swath of Indian equities — from large-caps like ITC, ONGC, and Coal India to mid-caps and emerging companies. Filter by market cap and fundamentals to find quality.",
    icon: "Coins",
    color: "text-emerald-600 bg-emerald-50",
    filter: { priceMax: 500, marketCapMin: 5000, sortBy: "marketCap", sortOrder: "desc", limit: 100, excludeSme: true },
    keyMetric: "Market Cap",
    expertNote: "₹500 isn't a magic number — it's just a price filter. Always evaluate based on business quality, P/E, ROE, and growth, not the per-share price."
  },
  {
    slug: "penny-stocks",
    title: "Penny Stocks India 2026 — Low Price Stocks Under ₹20 NSE BSE",
    shortLabel: "Penny Stocks",
    description: "Penny stocks (under ₹20) on NSE/BSE India. WARNING: High risk, low liquidity, often manipulated. Educational reference only.",
    longDescription: "Penny stocks are typically defined as stocks trading under ₹20–₹50 with low market cap. They are extremely high-risk: low liquidity, easy to manipulate (pump-and-dump schemes), and often poor fundamentals. SEBI maintains ASM/GSM lists to monitor suspicious activity. The list below is for educational reference only — not a buy recommendation.",
    icon: "AlertTriangle",
    color: "text-red-600 bg-red-50",
    filter: { priceMax: 20, marketCapMax: 1000, sortBy: "marketCap", sortOrder: "desc", limit: 50, excludeSme: true },
    keyMetric: "Market Cap",
    expertNote: "⚠️ Penny stocks have wiped out more retail capital than any other category in India. 90%+ of pump-and-dump schemes target sub-₹50 stocks. Treat the below list as study material, not investment ideas."
  },
  {
    slug: "large-cap",
    title: "Best Large Cap Stocks India 2026 — Top 100 Companies by Market Cap",
    shortLabel: "Large Cap",
    description: "India's top 100 large-cap stocks ranked by market cap. Includes Reliance, TCS, HDFC Bank, Infosys, ICICI Bank and more.",
    longDescription: "Large-cap stocks (top 100 by market cap, > ₹20,000 crore typically) are India's most stable and liquid equities. SEBI mandates large-cap mutual funds to hold minimum 80% in these. They form the backbone of any long-term equity portfolio.",
    icon: "Building2",
    color: "text-indigo-600 bg-indigo-50",
    filter: { marketCapMin: 20000, sortBy: "marketCap", sortOrder: "desc", limit: 100, excludeSme: true },
    keyMetric: "Market Cap",
    expertNote: "Large-caps deliver 10–14% long-term CAGR with lower volatility than mid/small caps. Best starting point for new investors. Most Nifty 50 components qualify."
  },
  {
    slug: "mid-cap",
    title: "Best Mid Cap Stocks India 2026 — Rank 101-250 by Market Cap",
    shortLabel: "Mid Cap",
    description: "Top Indian mid-cap stocks — companies ranked 101-250 by market cap. Higher growth potential, moderate risk.",
    longDescription: "Mid-cap stocks (₹5,000-₹20,000 crore market cap, SEBI rank 101-250) offer growth potential between large-caps and small-caps. Many of tomorrow's large-caps are today's mid-caps — but they carry higher volatility and lower liquidity during stress periods.",
    icon: "TrendingUp",
    color: "text-violet-600 bg-violet-50",
    filter: { marketCapMin: 5000, marketCapMax: 20000, sortBy: "marketCap", sortOrder: "desc", limit: 100, excludeSme: true },
    keyMetric: "Market Cap",
    expertNote: "Mid-caps have historically delivered higher long-term returns than large-caps but with 1.5–2x more volatility. Best held for 7-10 year horizons through full market cycles."
  },
  {
    slug: "small-cap",
    title: "Best Small Cap Stocks India 2026 — High Growth Companies List",
    shortLabel: "Small Cap",
    description: "Top Indian small-cap stocks for 2026 — companies ranked 251+ by market cap with growth potential.",
    longDescription: "Small-cap stocks (typically below ₹5,000 crore market cap) offer the highest growth potential but also the highest risk. Many tomorrow's multi-baggers come from this segment — but most small-caps underperform or fail. Diversification across 20+ small-caps is critical.",
    icon: "Sparkles",
    color: "text-rose-600 bg-rose-50",
    filter: { marketCapMin: 1000, marketCapMax: 5000, sortBy: "marketCap", sortOrder: "desc", limit: 100, excludeSme: true },
    keyMetric: "Market Cap",
    expertNote: "Small-caps can fall 50–70% in market downturns. Only invest money you can leave for 7+ years. Allocate maximum 15-20% of total equity to small-caps."
  },
  {
    slug: "high-roe",
    title: "Highest ROE Stocks India 2026 — Best Capital Efficient Companies",
    shortLabel: "High ROE",
    description: "Companies with highest Return on Equity (ROE) in India — quality compounders identified by Warren Buffett's #1 metric.",
    longDescription: "Return on Equity (ROE) measures how efficiently a company generates profit from shareholders' capital. Warren Buffett's most cited metric — consistent 20%+ ROE indicates a quality business with competitive moats. Sustainable high ROE is the strongest predictor of long-term stock returns.",
    icon: "Award",
    color: "text-emerald-600 bg-emerald-50",
    filter: { roeMin: 18, sortBy: "roe", sortOrder: "desc", limit: 50, excludeSme: true },
    keyMetric: "ROE %",
    expertNote: "High ROE businesses (HDFC Bank, TCS, Nestle, HUL, Asian Paints) have historically been India's best long-term wealth creators. Always check that high ROE isn't from excessive leverage."
  },
  {
    slug: "low-pe",
    title: "Best Low P/E Stocks India 2026 — Undervalued Large Caps",
    shortLabel: "Low P/E",
    description: "Lowest P/E ratio stocks among large-caps — potentially undervalued businesses worth fundamental research.",
    longDescription: "Low P/E (Price-to-Earnings) ratio can indicate undervaluation — but it can also signal a 'value trap' (declining business). Use low P/E as a starting point for research, not a buy signal. Combine with ROE, debt levels, and earnings growth to find genuine value.",
    icon: "Scale",
    color: "text-blue-600 bg-blue-50",
    filter: { marketCapMin: 10000, peMin: 0.5, peMax: 18, sortBy: "pe", sortOrder: "asc", limit: 50, excludeSme: true },
    keyMetric: "P/E Ratio",
    expertNote: "PSU banks, oil & gas, and metal stocks often have low P/E due to cyclical earnings. Check if the company's earnings are stable or peaking before assuming low P/E = bargain."
  },
  {
    slug: "blue-chip",
    title: "Best Blue Chip Stocks India 2026 — Top 30 Most Trusted Companies",
    shortLabel: "Blue Chips",
    description: "India's most trusted blue-chip stocks — top 30 large-cap companies by market cap with consistent profits and dividends.",
    longDescription: "Blue-chip stocks are large, established, financially stable companies with consistent dividend payments and decades of track record. They are the equivalent of US S&P 500 Dividend Aristocrats — slower growth but rock-solid stability. Forms the foundation of conservative long-term portfolios.",
    icon: "Crown",
    color: "text-amber-600 bg-amber-50",
    filter: { marketCapMin: 50000, sortBy: "marketCap", sortOrder: "desc", limit: 30, excludeSme: true },
    keyMetric: "Market Cap",
    expertNote: "Blue-chips are slow but reliable. Expect 10-13% long-term CAGR with much lower drawdowns than the broader market. Best for first-time investors and conservative portfolios."
  },
];

export function getCategoryBySlug(slug: string): BestStocksCategory | undefined {
  return bestStocksCategories.find((c) => c.slug === slug);
}
