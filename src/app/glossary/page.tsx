import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Stock Market Glossary — 90+ Terms Defined for Indian Investors",
  description:
    "A comprehensive A–Z glossary of stock market, IPO, and investing terms used in India — from ASBA and DRHP to XIRR and yield. Plain English, no jargon.",
  alternates: { canonical: "/glossary" },
};

interface Term {
  term: string;
  definition: string;
  learnMore?: string; // link to /learn/slug
}

const glossary: Term[] = [
  // A
  { term: "ASBA", definition: "Application Supported by Blocked Amount. The mandatory method for IPO applications in India where your bank blocks the bid amount in your account. Funds are only debited on allotment; no interest is lost on unallotted amounts.", learnMore: "/learn/how-to-apply-ipo" },
  { term: "AGM", definition: "Annual General Meeting. The yearly mandatory shareholder meeting where the board presents audited results, declares final dividends, appoints auditors, and addresses shareholder queries." },
  { term: "AMC", definition: "Asset Management Company. The entity that manages mutual funds — e.g., SBI Mutual Fund, HDFC AMC, Nippon India, Kotak Mahindra AMC." },
  { term: "AMFI", definition: "Association of Mutual Funds in India. Industry body for mutual funds. Sets NAV standards, publishes monthly fund flows, and maintains the SEBI-mandated large/mid/small-cap stock list." },
  { term: "Anchor Investor", definition: "Qualified institutional buyer (QIB) who subscribes to an IPO one day before it opens, at the issue price. They are locked in for 30 days after listing. Strong anchor participation signals institutional conviction.", learnMore: "/learn/ipo-anchor-investors" },
  // B
  { term: "Block Deal", definition: "A large trade of minimum 5 lakh shares or ₹5 crore, executed during dedicated morning and afternoon windows (8:45–9:00 AM and 2:05–2:20 PM) to minimise price impact.", learnMore: "/learn/bulk-block-deals" },
  { term: "Bonus Share", definition: "Free additional shares given to existing shareholders by capitalising reserves. A 1:1 bonus doubles your share count but halves the price — total value unchanged.", learnMore: "/learn/rights-issue-bonus-share" },
  { term: "Book Value", definition: "Net asset value per share = (Total Assets − Total Liabilities) / Shares Outstanding. Also called shareholders' equity per share. P/B ratio compares market price to book value." },
  { term: "BSE", definition: "Bombay Stock Exchange. Asia's oldest exchange, established in 1875. Home to the Sensex (30-stock index). Around 5,000+ companies listed. BSE uses a T+1 settlement cycle." },
  { term: "Bulk Deal", definition: "A trade representing at least 0.5% of a company's total equity, executed on the normal trading screen (unlike block deals). Must be reported to exchanges by end of day.", learnMore: "/learn/bulk-block-deals" },
  // C
  { term: "CAGR", definition: "Compounded Annual Growth Rate. The rate at which an investment grows from start to end value, assuming reinvestment at the same rate. Formula: (End/Start)^(1/Years) − 1.", learnMore: "/learn/cagr-meaning" },
  { term: "Call Option", definition: "A derivative contract giving the buyer the right (not obligation) to purchase a stock or index at a specific price (strike) before expiry. Buyers profit when price rises above the strike + premium.", learnMore: "/learn/what-are-futures-options" },
  { term: "CDSL", definition: "Central Depository Services Limited. One of two depositories in India (alongside NSDL). Backed by BSE. Holds securities electronically for most discount brokers including Zerodha, Groww, Angel One." },
  { term: "Circuit Breaker", definition: "A market-wide trading halt triggered when the Sensex or Nifty 50 moves ±10%, ±15%, or ±20% from previous close. Duration varies from 45 minutes to rest of day depending on trigger level." },
  { term: "Circuit Limit", definition: "The maximum percentage price movement allowed for an individual stock in a single trading session. Stocks in different price bands have 2%, 5%, 10%, or 20% daily limits." },
  // D
  { term: "Demat Account", definition: "Dematerialised account that holds shares and securities electronically, replacing physical share certificates. Required for trading on NSE/BSE. Regulated by CDSL or NSDL.", learnMore: "/learn/what-is-demat-account" },
  { term: "Derivative", definition: "A financial contract whose value depends on an underlying asset (stock, index, commodity). Main types: futures, options, swaps. Traded on NSE (world's largest by volume).", learnMore: "/learn/what-are-futures-options" },
  { term: "DII", definition: "Domestic Institutional Investor. Indian institutional buyers including mutual funds, insurance companies (LIC, HDFC Life), pension funds, and banks. Their buying/selling impacts market sentiment.", learnMore: "/learn/fii-dii-guide" },
  { term: "Dividend", definition: "A portion of company profit distributed to shareholders. Types: interim (declared mid-year) and final (declared at AGM). Taxed at slab rate in the investor's hands since April 2020.", learnMore: "/learn/what-is-dividend" },
  { term: "Dividend Yield", definition: "Annual dividend per share divided by current share price, expressed as %. A 5% dividend yield means you earn ₹5 annually per ₹100 invested in the stock.", learnMore: "/learn/what-is-dividend" },
  { term: "DRHP", definition: "Draft Red Herring Prospectus. The preliminary IPO document filed with SEBI before an IPO. Contains business description, financials, risks, and use of proceeds. Publicly available on SEBI and BSE websites.", learnMore: "/learn/drhp-guide" },
  // E
  { term: "EBITDA", definition: "Earnings Before Interest, Taxes, Depreciation, and Amortisation. A measure of operating profitability before non-cash and financing items. Commonly used to compare companies across sectors." },
  { term: "EPS", definition: "Earnings Per Share = Net Profit / Total Shares Outstanding. The profitability allocated to each share. P/E ratio is Market Price / EPS. Diluted EPS accounts for future share issuances (options, convertibles)." },
  { term: "ELSS", definition: "Equity Linked Savings Scheme. A tax-saving mutual fund with minimum 80% equity exposure and a 3-year lock-in period. Investments up to ₹1.5 lakh per year are deductible under Section 80C.", learnMore: "/learn/what-is-mutual-fund" },
  { term: "ETF", definition: "Exchange-Traded Fund. A basket of securities (mirroring an index like Nifty 50) traded on exchange like a stock. Lower cost than active funds. Popular options: Nifty BeES, Nifty Next 50 ETF." },
  { term: "Ex-Dividend Date", definition: "The date on which a stock trades without the right to receive the upcoming dividend. Shares purchased on or after the ex-date do not qualify for the dividend. Price typically falls by approximately the dividend amount.", learnMore: "/learn/what-is-dividend" },
  // F
  { term: "F&O", definition: "Futures and Options. Derivatives segment on NSE. Used for hedging or speculation. Over 89% of retail F&O traders lose money per SEBI studies. Tax treatment: business income at slab rate.", learnMore: "/learn/what-are-futures-options" },
  { term: "FII / FPI", definition: "Foreign Institutional Investor / Foreign Portfolio Investor. Overseas investors registered with SEBI investing in Indian equities, bonds, or derivatives. Their net buying/selling is a key market indicator.", learnMore: "/learn/fii-dii-guide" },
  { term: "Face Value", definition: "The nominal value of a share as stated in the company's memorandum — typically ₹1, ₹2, or ₹10 in India. Dividends are declared as a % of face value. Not related to market price." },
  { term: "Free Float", definition: "The proportion of shares available for public trading, excluding promoter holdings, locked-in institutional holdings, and government stakes. Indices like Nifty use free-float market cap for index weightage." },
  { term: "Futures", definition: "A contract to buy/sell an asset at a specified price on a future date. Both buyer and seller are obligated to fulfil the contract. Marked to market daily. Requires margin payment.", learnMore: "/learn/what-are-futures-options" },
  // G
  { term: "GMP", definition: "Grey Market Premium. The price premium at which IPO shares trade in the unofficial grey market before official listing. A positive GMP suggests strong demand, but it is unregulated and speculative.", learnMore: "/learn/ipo-gmp" },
  { term: "G-Sec", definition: "Government Securities. Sovereign bonds issued by the Government of India. Traded on RBI's NDS-OM platform and NSE. Considered risk-free in Indian financial markets." },
  // H
  { term: "HDFC Bank", definition: "India's largest private sector bank by assets. One of the highest-weighted stocks in Nifty 50 and Sensex. Part of the HDFC Group following the merger with HDFC Ltd in 2023." },
  { term: "HNI", definition: "High Net-worth Individual. In IPO context, investors applying for more than ₹2 lakh are categorised as HNI / NII (Non-Institutional Investors). 15% of IPO issue is reserved for this category." },
  // I
  { term: "Index Fund", definition: "A mutual fund that passively tracks an index (e.g., Nifty 50, Sensex). Does not require active stock selection. Very low expense ratio (0.1–0.2%). Outperforms most active funds over 10+ year horizons." },
  { term: "IPO", definition: "Initial Public Offering. The first time a private company sells shares to the general public on a stock exchange. In India, mainboard IPOs require SEBI approval via DRHP filing." },
  { term: "IPO GMP", definition: "See GMP.", learnMore: "/learn/ipo-gmp" },
  { term: "IPO Subscription", definition: "The number of times an IPO is bid for relative to shares available. A 50× subscription means 50 times more bids than shares offered. Split into QIB, HNI, and Retail categories.", learnMore: "/learn/understanding-ipo-subscription" },
  // K
  { term: "KYC", definition: "Know Your Customer. Mandatory verification process for all financial accounts in India. Includes PAN, Aadhaar, photo, signature, and bank account verification. Required for demat accounts, mutual funds, and broking accounts." },
  { term: "Kostak Rate", definition: "In IPO grey market, the price at which someone buys your entire IPO application — guaranteeing you a fixed profit regardless of allotment. Example: Kostak of ₹1,000 means you get ₹1,000 profit per application." },
  // L
  { term: "LTCG", definition: "Long-Term Capital Gains. Equity gains on holdings of more than 1 year. Taxed at 12.5% on gains above ₹1.25 lakh per financial year (post July 2024 budget). No indexation benefit." },
  { term: "Lock-in Period", definition: "Period during which shares cannot be sold. For promoters in an IPO: 18 months post-listing. For anchor investors: 30 days post-listing. For ELSS funds: 3 years." },
  { term: "Lot Size", definition: "In IPO: minimum number of shares per application (bid lot). In F&O: minimum number of shares per derivative contract. Nifty 50 futures lot = 75 units; individual stocks vary." },
  // M
  { term: "Market Cap", definition: "Market Capitalisation = Share Price × Total Shares Outstanding. SEBI classifies companies as large-cap (top 100), mid-cap (101–250), and small-cap (251+) by market cap.", learnMore: "/learn/what-is-market-cap" },
  { term: "Mutual Fund", definition: "A pooled investment vehicle managed by an AMC that invests in stocks, bonds, or a mix. Investors own units proportional to their investment. Returns reflect portfolio performance minus expense ratio.", learnMore: "/learn/what-is-mutual-fund" },
  { term: "MD&A", definition: "Management Discussion and Analysis. A section of annual reports and quarterly filings where management explains business performance, risks, and outlook in narrative form." },
  // N
  { term: "NAV", definition: "Net Asset Value. Per-unit price of a mutual fund = (Total Assets − Liabilities) / Units Outstanding. Calculated daily after market close. A high NAV does not mean the fund is expensive.", learnMore: "/learn/what-is-mutual-fund" },
  { term: "NFO", definition: "New Fund Offer. The launch period of a new mutual fund scheme — similar to an IPO for a fund. NFOs are typically open for 15–30 days. Always check the fund category before investing in an NFO." },
  { term: "Nifty 50", definition: "India's benchmark equity index comprising 50 large-cap, highly liquid companies across 13 sectors. Maintained by NSE Indices Ltd. Free-float market-cap weighted. The primary barometer of Indian equities.", learnMore: "/learn/nifty-50-explained" },
  { term: "NSDL", definition: "National Securities Depository Limited. India's first depository, backed by NSE. Holds securities electronically. Used by full-service brokers like ICICI Direct, HDFC Securities, Kotak." },
  { term: "NSE", definition: "National Stock Exchange. India's largest exchange by daily turnover. Home to Nifty 50 index. World's largest exchange by derivatives contract volume. Established 1992; electronic trading since 1994." },
  // O
  { term: "OFS", definition: "Offer for Sale. In an IPO or follow-on, promoters or existing shareholders sell their existing shares to the public. No fresh money goes to the company — funds go to selling shareholders." },
  { term: "Open Interest", definition: "Total number of outstanding derivative contracts (futures or options) not yet settled. Rising OI with rising price = bullish; rising OI with falling price = bearish. Used by F&O traders to gauge market sentiment." },
  // P
  { term: "P/B Ratio", definition: "Price-to-Book Ratio = Market Price / Book Value per Share. Used to value asset-heavy companies (banks, NBFCs, manufacturing). P/B below 1 suggests the stock may be undervalued relative to assets.", learnMore: "/learn/pe-ratio" },
  { term: "P/E Ratio", definition: "Price-to-Earnings Ratio = Market Price / EPS. The most common valuation metric. Higher P/E implies higher growth expectations. Compare P/E within same sector; cross-sector comparison is misleading.", learnMore: "/learn/pe-ratio" },
  { term: "PAN", definition: "Permanent Account Number. A 10-character alphanumeric code issued by the Income Tax Department. Mandatory for all stock market transactions, IPO applications, and mutual fund investments in India." },
  { term: "Promoter", definition: "The founding shareholder(s) or controlling entities of a company. SEBI requires promoters to disclose their shareholding quarterly. High promoter pledge or declining promoter holding are red flags." },
  { term: "Promoter Pledge", definition: "When promoters pledge their shares as collateral to raise loans. If the stock falls and the promoter cannot repay, shares get sold — creating a vicious cycle. High pledge (>50% of promoter holding) is a serious risk indicator." },
  { term: "Put Option", definition: "A derivative contract giving the buyer the right (not obligation) to sell a stock or index at a specific price before expiry. Buyers profit when price falls below strike − premium.", learnMore: "/learn/what-are-futures-options" },
  // Q
  { term: "QIB", definition: "Qualified Institutional Buyer. SEBI-registered institutions: mutual funds, FPIs, insurance companies, banks. Get 50% of mainboard IPO allocation. Can bid above the issue price band." },
  // R
  { term: "Record Date", definition: "The date on which the shareholder register is checked to determine eligibility for dividends, bonus shares, rights issues, or AGM voting. You must hold shares in demat on this date.", learnMore: "/learn/what-is-dividend" },
  { term: "Rights Issue", definition: "Offer to existing shareholders to buy additional shares at a discounted price in proportion to their holdings. Used by companies to raise capital. Shareholders can exercise, sell (if listed), or ignore their rights.", learnMore: "/learn/rights-issue-bonus-share" },
  { term: "ROCE", definition: "Return on Capital Employed = EBIT / Capital Employed. Measures how efficiently a company uses all capital (equity + debt) to generate profit. Better than ROE for capital-intensive businesses.", learnMore: "/learn/what-is-roe-roce" },
  { term: "ROE", definition: "Return on Equity = Net Profit / Shareholders' Equity. Measures profitability on shareholder capital. 15%+ sustained ROE typically indicates a quality business.", learnMore: "/learn/what-is-roe-roce" },
  // S
  { term: "SEBI", definition: "Securities and Exchange Board of India. The market regulator. Oversees exchanges (NSE, BSE), brokers, mutual funds, depositories, and IPO process. Established 1988, statutory powers since 1992." },
  { term: "Sensex", definition: "BSE Sensitive Index. India's oldest stock market index comprising 30 large, actively traded companies on BSE. Free-float market-cap weighted. Calculated since 1986 (base year 1978–79 = 100)." },
  { term: "SGB", definition: "Sovereign Gold Bond. Government bonds denominated in grams of gold. Earn 2.5% annual interest + gold price appreciation. Exempt from capital gains tax if held till maturity (8 years). No storage risk like physical gold." },
  { term: "SIP", definition: "Systematic Investment Plan. A method of investing a fixed amount in mutual funds at regular intervals (weekly, monthly). Benefits from rupee-cost averaging. Ideal for long-term wealth creation.", learnMore: "/learn/sip-guide" },
  { term: "SME IPO", definition: "Small and Medium Enterprise IPO. Listed on NSE Emerge or BSE SME platforms. Smaller lot sizes, less stringent eligibility, higher risk, higher speculative activity. Not recommended without thorough due diligence.", learnMore: "/learn/mainboard-vs-sme" },
  { term: "Stock Split", definition: "Division of existing shares into multiple shares at proportionally lower price. A 2:1 split on a ₹500 share gives 2 shares at ₹250. Total value unchanged. Improves liquidity by lowering per-share price." },
  { term: "STCG", definition: "Short-Term Capital Gains. Equity gains on holdings under 1 year. Taxed at 20% (post July 2024 budget). No exemption threshold." },
  // T
  { term: "T+1 Settlement", definition: "Trade plus one day settlement cycle. If you buy shares on Monday, they appear in your demat on Tuesday. India moved fully to T+1 settlement in January 2023 — one of the fastest globally." },
  { term: "TDS", definition: "Tax Deducted at Source. On dividends exceeding ₹5,000/year: 10% TDS. On interest on NCDs: 10% TDS. Deducted by the company before payment. Claimed as credit in your income tax return." },
  // U
  { term: "UPI", definition: "Unified Payments Interface. Digital payment system used for IPO applications. After ASBA mandate removed the UPI cap restriction in 2022, UPI-based IPO applications can be made up to ₹5 lakh.", learnMore: "/learn/how-to-apply-ipo" },
  { term: "Unlisted Shares", definition: "Shares of companies not yet listed on NSE/BSE. Traded informally in OTC (over-the-counter) markets. Higher risk, illiquid, no regulatory price discovery. Popular ahead of high-profile IPOs." },
  // V
  { term: "Volume", definition: "Total number of shares traded in a given period. High volume on a price move confirms the move's strength. Low volume breakouts are often false. Volume is studied alongside price in technical analysis." },
  // W
  { term: "WACC", definition: "Weighted Average Cost of Capital. The average rate a company must pay to finance its operations, weighted by debt and equity proportions. ROCE above WACC = value creation. ROCE below WACC = value destruction." },
  // X
  { term: "XIRR", definition: "Extended Internal Rate of Return. The annualised return accounting for the timing of multiple cash flows. Used for SIP returns, where each installment has a different investment period. More accurate than CAGR for irregular cash flows.", learnMore: "/learn/sip-guide" },
  // Y
  { term: "Yield", definition: "Return generated by an investment, expressed as annual percentage. Dividend yield (dividends / price), bond yield (coupon / price or yield to maturity). Higher yield often implies higher risk." },
  // Z
  { term: "Zerodha", definition: "India's largest discount broker by active client count. Founded 2010. Offers Kite trading platform, Coin for mutual funds, and Varsity for financial education. Charges ₹20/order for equity intraday and F&O." },
];

// Group by first letter
const grouped = glossary.reduce<Record<string, Term[]>>((acc, term) => {
  const letter = term.term[0].toUpperCase();
  if (!acc[letter]) acc[letter] = [];
  acc[letter].push(term);
  return acc;
}, {});

const letters = Object.keys(grouped).sort();

export default function GlossaryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-violet-600 bg-violet-50 px-3 py-1 rounded-full mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          {glossary.length} terms defined
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Stock Market Glossary
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          Plain-English definitions of investing, IPO, and market terms used on IPOpulse and across
          Indian financial media. Use Ctrl+F to search within this page.
        </p>
      </div>

      {/* Alphabet jump nav */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Term groups */}
      <div className="space-y-10">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b border-indigo-100 pb-2">
              {letter}
            </h2>
            <div className="space-y-4">
              {grouped[letter].map((term) => (
                <div key={term.term} className="flex gap-4">
                  <div className="min-w-0 flex-1">
                    <dt className="text-sm font-semibold text-gray-900">{term.term}</dt>
                    <dd className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                      {term.definition}
                      {term.learnMore && (
                        <Link
                          href={term.learnMore}
                          className="ml-1.5 text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                        >
                          Learn more →
                        </Link>
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-xl bg-indigo-50 border border-indigo-100 px-6 py-8 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Ready to Go Deeper?</h2>
        <p className="text-sm text-gray-600 mb-4">
          Our Learning Hub has full guides on IPO process, fundamentals, and market mechanics.
        </p>
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition"
        >
          <BookOpen className="w-4 h-4" />
          Browse Learning Hub
        </Link>
      </div>
    </div>
  );
}
