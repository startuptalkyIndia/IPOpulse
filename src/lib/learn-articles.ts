export interface Article {
  slug: string;
  title: string;
  description: string;
  readingTime: number; // minutes
  publishedAt: string; // ISO date string
  content: string; // HTML with <h2>, <p>, <ul>, <strong>
  faq: Array<{ q: string; a: string }>;
  relatedSlugs: string[];
}

export const articles: Article[] = [
  {
    slug: "ipo-gmp",
    title: "What is IPO GMP (Grey Market Premium)?",
    description:
      "Learn what Grey Market Premium (GMP) means for IPOs, how it is calculated, and whether you should trust it before applying for an IPO in India.",
    readingTime: 5,
    publishedAt: "2026-01-10",
    relatedSlugs: ["ipo-allotment", "how-to-apply-ipo", "mainboard-vs-sme"],
    content: `
<h2>What is IPO GMP?</h2>
<p>Grey Market Premium (GMP) is the unofficial price at which IPO shares are traded <strong>before they are listed</strong> on stock exchanges like NSE or BSE. This trading happens in an unregulated, informal market commonly called the grey market or <em>kostak</em> market. SEBI does not regulate these transactions, and there is no legal protection for buyers or sellers.</p>

<h2>How is GMP Calculated?</h2>
<p>GMP is typically quoted as a premium over the IPO issue price. For example, if a company sets its IPO price at ₹200 per share and the grey market premium is ₹50, the expected listing price is ₹250. The percentage GMP would be 25% in this case.</p>
<ul>
  <li><strong>Expected Listing Price = Issue Price + GMP</strong></li>
  <li><strong>GMP % = (GMP / Issue Price) × 100</strong></li>
</ul>
<p>Grey market dealers — often called <em>hawaladars</em> in informal investor circles — set these rates based on demand signals, subscription numbers, and general market sentiment.</p>

<h2>Where Does GMP Data Come From?</h2>
<p>GMP is sourced from informal networks of brokers, dealers, and investors who actively participate in pre-listing trading. Websites like IPOpulse collect and track GMP trends daily, usually sourced from multiple grey market operators across cities like Ahmedabad, Mumbai, Surat, and Jaipur — known hubs for grey market activity.</p>

<h2>Should You Trust GMP?</h2>
<p>GMP is a sentiment indicator, not a guarantee. Historically, there is a moderate correlation between high GMP and strong listing gains — particularly for heavily oversubscribed mainboard IPOs. However, GMP can shift dramatically in the 24–48 hours before listing due to:</p>
<ul>
  <li>Broader market sell-offs or rallies</li>
  <li>Negative news about the company or sector</li>
  <li>Grey market operator manipulation</li>
  <li>Sudden change in retail investor sentiment</li>
</ul>
<p>For example, several SME IPOs in 2024–25 showed GMP of over 100% before listing but corrected sharply on listing day. Mainboard IPOs with GMP above 30% have a stronger (but still imperfect) track record of positive listing performance.</p>

<h2>Kostak Rate vs Subject to Sauda</h2>
<p>Two terms are common in grey market conversations. <strong>Kostak rate</strong> is the price at which someone buys the entire IPO application from you — so you get a fixed profit regardless of allotment. <strong>Subject to Sauda</strong> is a deal where you sell your application contingent on receiving allotment. Both are technically outside SEBI regulations.</p>

<h2>GMP Accuracy on IPOpulse</h2>
<p>IPOpulse tracks GMP at listing for every IPO and compares it to the actual listing price to calculate GMP accuracy. Our data for 2024–25 shows GMP was directionally accurate (i.e., positive GMP = positive listing gain) in roughly 72% of mainboard IPOs and around 60% of SME IPOs.</p>
    `,
    faq: [
      {
        q: "Is trading in the grey market legal?",
        a: "Grey market trading is not regulated by SEBI and has no legal protection. It is not explicitly banned but exists in a legal grey zone. If a deal goes wrong, you have no recourse.",
      },
      {
        q: "When does GMP peak for an IPO?",
        a: "GMP usually peaks around the last day of IPO subscription or one day before listing, when demand signals are clearest.",
      },
      {
        q: "Can GMP be negative?",
        a: "Yes. A negative GMP (sometimes called 'discount') suggests the grey market expects the IPO to list below the issue price — a bearish signal.",
      },
      {
        q: "Is GMP reliable for SME IPOs?",
        a: "SME GMP is less reliable because volumes are thin and easier to manipulate. Always check subscription numbers and fundamentals alongside GMP.",
      },
    ],
  },
  {
    slug: "ipo-allotment",
    title: "How to Check IPO Allotment Status",
    description:
      "Step-by-step guide to checking your IPO allotment status on the BSE website, registrar portals (KFintech, Linkintime), and using your PAN number.",
    readingTime: 4,
    publishedAt: "2026-01-15",
    relatedSlugs: ["ipo-gmp", "how-to-apply-ipo", "mainboard-vs-sme"],
    content: `
<h2>When is IPO Allotment Done?</h2>
<p>After an IPO subscription window closes, the registrar processes all bids and assigns shares via a lottery (for retail investors) within <strong>6 business days</strong> as mandated by SEBI. The exact allotment date is published in the IPO prospectus and available on BSE/NSE websites.</p>

<h2>How to Check Allotment on BSE Website</h2>
<p>The BSE website is one of the easiest ways to check allotment status without needing to register anywhere.</p>
<ul>
  <li>Go to <strong>bseindia.com → Investors → IPO → Basis of Allotment</strong></li>
  <li>Select the IPO name from the dropdown</li>
  <li>Enter your <strong>application number</strong> or <strong>PAN</strong> or <strong>DP/Client ID</strong></li>
  <li>Click Submit — you will see if shares are allotted or not</li>
</ul>

<h2>Check via Registrar Portals</h2>
<p>Each IPO has a designated registrar who manages allotment. The two most common registrars in India are:</p>
<ul>
  <li><strong>KFintech</strong> (formerly Karvy) — visit kfintech.com/ipostatus</li>
  <li><strong>Link Intime India</strong> — visit linkintime.co.in</li>
  <li><strong>Bigshare Services</strong> — visit bigshareonline.com</li>
  <li><strong>Cameo Corporate Services</strong> — visit cameoindia.com</li>
</ul>
<p>On these portals, you can search by PAN number, application number, or your Demat account number. Results are typically available from the allotment date by 6 PM IST.</p>

<h2>Checking via UPI App</h2>
<p>If you applied through a UPI-linked brokerage (like Zerodha, Groww, or Upstox), you can also see allotment status directly in the brokerage app under the IPO section. The app will reflect shares credited to your Demat account on the allotment date.</p>

<h2>What Happens After Allotment?</h2>
<p>If you receive allotment, shares are credited to your Demat account <strong>1 business day before listing</strong>. Your blocked ASBA amount is debited from your bank on the same day. If you do not receive allotment, the blocked funds are unblocked and returned to your savings account within 1-2 business days.</p>

<h2>Using IPOpulse Allotment Tracker</h2>
<p>IPOpulse provides direct links to all registrar portals for every active IPO. Visit <strong>/ipo/allotment</strong> and select the IPO to be redirected to the correct registrar with pre-filled IPO details.</p>
    `,
    faq: [
      {
        q: "Can I check allotment using just my PAN number?",
        a: "Yes. BSE, KFintech, and Linkintime all support PAN-based allotment lookup. This is the simplest method.",
      },
      {
        q: "What is a basis of allotment document?",
        a: "The Basis of Allotment is a SEBI-mandated document published by the registrar after allotment. It shows how many lots were allotted per category (retail, HNI, QIB) and the lottery ratios.",
      },
      {
        q: "I was not allotted shares. When will my money return?",
        a: "For ASBA applications, funds are unblocked within 1 business day of allotment. For UPI-based applications, the refund timeline may be up to 2 business days.",
      },
      {
        q: "Can I check allotment status before the official allotment date?",
        a: "No. Results are only available on or after the allotment date. Any third-party site claiming to show results earlier is misleading.",
      },
    ],
  },
  {
    slug: "mainboard-vs-sme",
    title: "Mainboard vs SME IPO — Key Differences",
    description:
      "Understand the key differences between Mainboard and SME IPOs in India — eligibility, lot size, risks, subscription rules, and listing exchanges.",
    readingTime: 5,
    publishedAt: "2026-01-20",
    relatedSlugs: ["ipo-gmp", "ipo-allotment", "drhp-guide"],
    content: `
<h2>What is a Mainboard IPO?</h2>
<p>A Mainboard IPO is a public offering by a company that meets SEBI's minimum eligibility criteria for listing on NSE (National Stock Exchange) or BSE (Bombay Stock Exchange) — the primary, large-cap exchanges in India. Mainboard companies typically have a post-issue paid-up capital of at least ₹10 crore and a minimum issue size of ₹10 crore as mandated under SEBI (ICDR) Regulations.</p>

<h2>What is an SME IPO?</h2>
<p>An SME (Small and Medium Enterprise) IPO is a public offering by a smaller company listed on dedicated SME platforms: <strong>NSE Emerge</strong> or <strong>BSE SME</strong>. The eligibility bar is lower — typically post-issue capital between ₹1 crore and ₹25 crore, and a track record of at least 3 years with positive net worth.</p>

<h2>Key Differences at a Glance</h2>
<ul>
  <li><strong>Exchange:</strong> Mainboard lists on NSE/BSE Main Board; SME lists on NSE Emerge or BSE SME</li>
  <li><strong>Minimum Application:</strong> Mainboard retail minimum is usually ₹15,000 (1 lot); SME minimum application is ₹1 lakh (SEBI mandated from 2024)</li>
  <li><strong>Listing Liquidity:</strong> Mainboard shares have high daily trading volume; SME shares can have very thin liquidity, making exit difficult</li>
  <li><strong>DRHP/RHP Review:</strong> Mainboard requires a full SEBI observation letter (30-day window); SME only requires merchant banker review</li>
  <li><strong>Subscription Categories:</strong> Mainboard has QIB (50%), HNI/NII (15%), Retail (35%); SME has QIB (50%), HNI/NII (50%) — no separate retail reservation</li>
  <li><strong>Lock-in for Promoters:</strong> Mainboard requires 3-year lock-in on promoter shares; SME requires 3 years on 20% promoter holding</li>
</ul>

<h2>Risk Profile</h2>
<p>SME IPOs carry substantially higher risk than mainboard IPOs. Key reasons:</p>
<ul>
  <li><strong>Less regulatory scrutiny:</strong> SEBI does not directly vet SME prospectuses the same way it does mainboard filings</li>
  <li><strong>Thin liquidity:</strong> After listing, it may be impossible to sell SME shares at fair value for weeks</li>
  <li><strong>Valuation risk:</strong> Many SME IPOs price at very high P/E multiples relative to their earnings history</li>
  <li><strong>Promoter-driven demand:</strong> Subscription numbers can be artificially inflated by promoter-linked entities in SME IPOs</li>
</ul>

<h2>When Do SME IPOs Migrate to Main Board?</h2>
<p>After 2 years of listing on SME platforms, companies with a paid-up capital of ₹10 crore or more can apply to migrate to the main board. This migration typically unlocks higher liquidity and institutional interest — making early SME investors potentially significant beneficiaries if the company grows into its valuation.</p>

<h2>Which Should You Apply For?</h2>
<p>For retail investors with limited capital or risk tolerance, mainboard IPOs with strong fundamentals are generally safer. SME IPOs can offer outsized gains but also carry the risk of complete capital loss. SEBI's 2024 rule raising the minimum SME application to ₹1 lakh was specifically intended to prevent small investors from inadvertently taking on SME-level risk.</p>
    `,
    faq: [
      {
        q: "Can I apply for an SME IPO through UPI?",
        a: "Yes, but note that the minimum application amount for SME IPOs is ₹1 lakh as of SEBI's 2024 circular. Make sure your UPI limit supports this amount.",
      },
      {
        q: "Are SME IPO shares listed the same way as mainboard?",
        a: "They list on BSE SME or NSE Emerge — separate segments from the main board. Trading happens on these platforms, and circuit filters are typically ±5% on listing day.",
      },
      {
        q: "Is the allotment process different for SME IPOs?",
        a: "The basic ASBA/UPI process is the same. However, since there is no retail category for SME IPOs, allotment is pro-rata (not lottery-based) for HNI applicants.",
      },
      {
        q: "How do I find out if an IPO is mainboard or SME?",
        a: "Check the IPO detail page on IPOpulse — each IPO is clearly labeled 'Mainboard' or 'SME'. The listing exchange is also mentioned.",
      },
    ],
  },
  {
    slug: "drhp-guide",
    title: "What is DRHP and How to Read It",
    description:
      "A practical guide to understanding the Draft Red Herring Prospectus (DRHP) — what it contains, key sections to read before applying for an IPO, and red flags to watch for.",
    readingTime: 6,
    publishedAt: "2026-01-25",
    relatedSlugs: ["mainboard-vs-sme", "how-to-apply-ipo", "pe-ratio"],
    content: `
<h2>What is a DRHP?</h2>
<p>The <strong>Draft Red Herring Prospectus (DRHP)</strong> is a document filed by a company with SEBI before launching an IPO. It contains detailed financial and business information about the company. The word "draft" indicates that the final IPO price and number of shares are not yet fixed — hence "red herring." After SEBI reviews and issues observations, the company files the final <strong>RHP (Red Herring Prospectus)</strong> with actual price band details.</p>

<h2>Where Can You Find the DRHP?</h2>
<p>DRHPs are publicly available on:</p>
<ul>
  <li>SEBI's website at sebi.gov.in under the Offer Documents section</li>
  <li>BSE website under IPO filings</li>
  <li>The company's own IPO microsite (usually linked from news articles)</li>
  <li>IPOpulse's DRHP AI Search at /ipo/drhp — where you can ask questions directly about any uploaded DRHP</li>
</ul>

<h2>Key Sections to Read</h2>
<p>A DRHP can run 400–700 pages. You don't need to read all of it. Focus on these sections:</p>
<ul>
  <li><strong>Objects of the Issue:</strong> What will the company do with IPO proceeds? Look for specific uses like debt repayment, capex, or working capital. Be cautious if a large portion goes to Offer for Sale (OFS) — that's existing investors cashing out, not growth capital.</li>
  <li><strong>Risk Factors:</strong> Usually the longest section. Look for concentration risk (one customer = 50% revenue), regulatory risks, litigation, and related-party transactions.</li>
  <li><strong>Financial Statements:</strong> Revenue growth over 3 years, EBITDA margins, PAT trend, debt-to-equity ratio, and return on equity (ROE). Negative cash flow from operations despite profits is a red flag.</li>
  <li><strong>Promoter Background:</strong> Who are the promoters? Do they have past SEBI violations, criminal cases, or bankruptcy history?</li>
  <li><strong>Offer Details:</strong> Fresh issue vs OFS split. Fresh issue = money goes to company; OFS = money goes to selling shareholders.</li>
</ul>

<h2>Understanding the Offer for Sale (OFS)</h2>
<p>An OFS is when existing shareholders (promoters, PE investors, or early employees) sell their shares through the IPO. A large OFS component means the company itself is not raising fresh capital — only existing investors are exiting. While this is not inherently bad (PE funds routinely exit via IPOs), an IPO that is 100% OFS with no fresh issue raises questions about why the company needs to list at all.</p>

<h2>Financial Red Flags in a DRHP</h2>
<ul>
  <li>Revenue restated in multiple years (possible accounting adjustment)</li>
  <li>High related-party transactions — loans to promoter entities, purchases from promoter companies at above-market rates</li>
  <li>Contingent liabilities that could crystallize post-listing</li>
  <li>Net cash flow negative despite reported profits (sign of working capital strain)</li>
  <li>Very high accounts receivable relative to revenue (aggressive revenue recognition)</li>
</ul>

<h2>DRHP vs RHP</h2>
<p>The RHP is the final document filed after SEBI observations. It includes the price band, lot size, and actual subscription dates. Always read the RHP before applying — DRHPs sometimes have changes incorporated based on SEBI feedback or updated financials.</p>
    `,
    faq: [
      {
        q: "Is reading the DRHP mandatory before applying for an IPO?",
        a: "Not mandatory, but strongly recommended for HNI investors or anyone investing ₹5 lakh or more. At minimum, check the Objects of Issue and Financial Statements sections.",
      },
      {
        q: "What is SEBI's observation letter?",
        a: "After reviewing the DRHP, SEBI issues an 'observation letter' — not an approval, but a confirmation that the document meets disclosure requirements. SEBI does not validate the quality of the business.",
      },
      {
        q: "Can I use AI to read a DRHP?",
        a: "Yes. IPOpulse's DRHP AI Search allows you to ask natural language questions about any DRHP in our database — like 'what is the revenue breakdown?' or 'who are the top customers?'",
      },
      {
        q: "How long does SEBI take to review a DRHP?",
        a: "SEBI typically issues observations within 30 days of DRHP filing for mainboard IPOs. After that, the company has 12 months to open the IPO.",
      },
    ],
  },
  {
    slug: "how-to-apply-ipo",
    title: "How to Apply for IPO (ASBA / UPI)",
    description:
      "Complete step-by-step guide to applying for an IPO in India using ASBA through your bank or UPI through a brokerage app like Zerodha, Groww, or Upstox.",
    readingTime: 5,
    publishedAt: "2026-02-01",
    relatedSlugs: ["ipo-allotment", "ipo-gmp", "mainboard-vs-sme"],
    content: `
<h2>Two Ways to Apply for an IPO in India</h2>
<p>In India, retail investors can apply for IPOs through two approved mechanisms:</p>
<ul>
  <li><strong>ASBA</strong> (Application Supported by Blocked Amount) — through your bank's net banking portal or physical branch</li>
  <li><strong>UPI-based ASBA</strong> — through a registered stock broker app (Zerodha, Groww, Upstox, AngelOne, etc.) using your UPI ID</li>
</ul>
<p>Both methods work on the same principle: your application amount is <strong>blocked</strong> (not debited) from your bank account until allotment. You continue earning interest on blocked funds.</p>

<h2>Applying via UPI (Broker App) — Recommended for Retail</h2>
<p>This is the fastest and most popular method:</p>
<ul>
  <li>Open your broker app (e.g., Zerodha Kite, Groww, Upstox)</li>
  <li>Navigate to the IPO section — look for "Apply" next to the open IPO</li>
  <li>Enter the lot quantity (minimum 1 lot, typically 15–20 shares for mainboard)</li>
  <li>Select Cut-off Price (recommended) or specify a price within the band</li>
  <li>Enter your UPI ID linked to a savings bank account</li>
  <li>Click Submit — you will receive a UPI mandate request on your UPI app</li>
  <li>Approve the mandate in your UPI app (BHIM, Google Pay, PhonePe etc.) — funds are blocked but not debited</li>
</ul>
<p><strong>Important:</strong> UPI mandates must be approved within 30 minutes of raising, otherwise the application is rejected. Check your UPI app immediately after submitting.</p>

<h2>Applying via ASBA Through Bank</h2>
<ul>
  <li>Log in to your bank's net banking portal</li>
  <li>Go to Investments → IPO (available in SBI, HDFC, ICICI, Axis, Kotak etc.)</li>
  <li>Select the IPO, enter DP ID and Client ID from your Demat account</li>
  <li>Enter application amount and PAN</li>
  <li>Submit — funds are blocked via ASBA</li>
</ul>

<h2>How Many Lots Can You Apply For?</h2>
<p>Retail Individual Investors (RII) can apply for a maximum of ₹2 lakh worth of shares per PAN card. To maximize allotment probability, most retail investors apply for <strong>1 lot only</strong> — since allotment for oversubscribed IPOs is by lottery, and each application (regardless of number of lots) gets one lottery entry.</p>

<h2>What is Cut-off Price?</h2>
<p>Selecting "Cut-off Price" means you agree to pay whatever price is discovered within the price band. This is the recommended option for retail investors — it ensures your application is not rejected due to price band changes. If you specify a price (e.g., ₹195 in a band of ₹190–200), your application is rejected if the final price is above ₹195.</p>

<h2>Key Documents Required</h2>
<ul>
  <li>Active Demat account (linked to your PAN)</li>
  <li>Savings bank account (for ASBA fund blocking)</li>
  <li>UPI ID registered on the same bank account</li>
  <li>PAN card</li>
</ul>

<h2>After Applying</h2>
<p>After submitting, your application is visible in the NSE/BSE portal under your PAN within 1 business day. You can modify or withdraw your application before the IPO closes. After the IPO closes, you cannot cancel the application.</p>
    `,
    faq: [
      {
        q: "Can I apply for the same IPO from multiple Demat accounts?",
        a: "No. SEBI prohibits multiple applications from the same PAN number. Multiple applications from the same PAN are rejected. Family members with different PANs can each apply separately.",
      },
      {
        q: "What is the UPI limit for IPO applications?",
        a: "The default UPI transaction limit for IPO mandates was raised to ₹5 lakh per SEBI guidelines in 2021. Some banks may still show ₹2 lakh as the individual transaction limit — contact your bank if you face issues.",
      },
      {
        q: "Can I apply at market open on Day 1 of the IPO?",
        a: "IPO subscriptions are open throughout all three days (usually 10 AM to 5 PM). You can apply any time during these hours. Last-day applications carry the risk of UPI app congestion.",
      },
      {
        q: "What happens if I enter the wrong UPI ID?",
        a: "The mandate request will fail to reach you, and your application will not be processed. Always double-check your UPI ID before submitting.",
      },
    ],
  },
  {
    slug: "fii-dii-guide",
    title: "FII vs DII — What Institutional Flow Means for Markets",
    description:
      "Understand what FII (Foreign Institutional Investors) and DII (Domestic Institutional Investors) buying and selling means for Indian stock markets and individual stocks.",
    readingTime: 5,
    publishedAt: "2026-02-10",
    relatedSlugs: ["bulk-block-deals", "52-week-high-low", "pe-ratio"],
    content: `
<h2>Who Are FIIs and DIIs?</h2>
<p><strong>FIIs (Foreign Institutional Investors)</strong> are overseas entities — mutual funds, pension funds, hedge funds, insurance companies, sovereign wealth funds — registered with SEBI to invest in Indian markets. Since 2014, SEBI reclassified them as <strong>FPIs (Foreign Portfolio Investors)</strong>, but FII remains the popular term.</p>
<p><strong>DIIs (Domestic Institutional Investors)</strong> are Indian entities investing on behalf of Indian savers — mutual funds (like SBI MF, HDFC MF), insurance companies (LIC, New India Assurance), and pension funds (EPFO, NPS Trust).</p>

<h2>Why Does FII/DII Flow Matter?</h2>
<p>FIIs and DIIs collectively own 30–40% of the free float in Indian equities. Their buying and selling at scale moves markets. On days when FIIs buy ₹5,000 crore of Indian equities, Nifty typically rallies 0.5–1.5%. When FIIs pull out ₹10,000+ crore in a single session, markets tend to fall sharply.</p>

<h2>FII vs DII — Behavioral Differences</h2>
<ul>
  <li><strong>FIIs are more volatile:</strong> They react quickly to global factors — US Fed rate decisions, China slowdown, dollar strength, emerging market risk-off moods. In FY2022-23, FIIs pulled ₹1.2 lakh crore out of Indian equities during global rate hike fears.</li>
  <li><strong>DIIs are countercyclical:</strong> Domestic mutual funds, driven by SIP inflows (now ₹23,000 crore/month as of early 2026), typically buy on FII sell-offs. This "DII cushion" has reduced the depth of market crashes significantly since 2020.</li>
  <li><strong>LIC is a special case:</strong> LIC, with ₹40+ lakh crore AUM, is the largest single institutional investor in India. Its buying provides a strong floor under PSU stocks.</li>
</ul>

<h2>How to Read FII/DII Data</h2>
<p>NSE publishes FII and DII net buy/sell data daily after 3:30 PM IST. IPOpulse aggregates this at /fii-dii with historical charts. Key metrics to track:</p>
<ul>
  <li><strong>Net buy (positive):</strong> Institutions bought more than they sold — bullish signal</li>
  <li><strong>Net sell (negative):</strong> Institutions sold more than they bought — bearish signal for that day</li>
  <li><strong>Trend over 5/10 days:</strong> Sustained FII buying over 10+ consecutive sessions is a stronger bullish signal than a single day of buying</li>
</ul>

<h2>FII Flows and the Rupee Connection</h2>
<p>Heavy FII buying requires FIIs to convert USD to INR — which strengthens the rupee. Conversely, FII selling triggers dollar buying, weakening the rupee. Watch the USD/INR rate alongside FII flow data for a fuller picture of institutional sentiment.</p>

<h2>Sector-Level FII Flows</h2>
<p>NSDL publishes sector-level FPI allocation data monthly. Sectors with rising FII allocation — typically IT, financials, consumer — often see a valuation premium. IPOpulse tracks sector-level FPI flows at /sectors/fpi-flows.</p>
    `,
    faq: [
      {
        q: "Where is FII/DII data published?",
        a: "NSE publishes daily FII/DII net buy-sell data at nseindia.com. NSDL publishes monthly sector-level FPI data. IPOpulse aggregates and charts both.",
      },
      {
        q: "Does FII buying always lead to market gains?",
        a: "Not always. FII buying is a positive signal, but if global sentiment turns negative mid-session, gains can be erased. Use it as one of several indicators, not a standalone signal.",
      },
      {
        q: "What is the DII SIP cushion?",
        a: "Systematic Investment Plan (SIP) inflows — around ₹23,000 crore/month in 2026 — give domestic mutual funds consistent cash to deploy. This creates steady buying pressure regardless of market levels, acting as a cushion during FII sell-offs.",
      },
      {
        q: "Can I track FII positions in specific stocks?",
        a: "Yes. Shareholding patterns (quarterly) show FPI/FII % in individual stocks. BSE publishes bulk deal and block deal data for large institutional transactions. Both are available on IPOpulse.",
      },
    ],
  },
  {
    slug: "bulk-block-deals",
    title: "What is Bulk Deal vs Block Deal",
    description:
      "Understand the difference between bulk deals and block deals in Indian stock markets — what they signal, who participates, and how to track them for trading insights.",
    readingTime: 4,
    publishedAt: "2026-02-15",
    relatedSlugs: ["fii-dii-guide", "52-week-high-low", "insider-trading"],
    content: `
<h2>What is a Bulk Deal?</h2>
<p>A <strong>bulk deal</strong> is any transaction where a single entity buys or sells shares worth more than <strong>0.5% of the total equity</strong> of a company in a single trading session. Bulk deals are executed through normal market hours on the regular trading screen. Both BSE and NSE mandate disclosure of bulk deals before the end of the trading day.</p>

<h2>What is a Block Deal?</h2>
<p>A <strong>block deal</strong> is a large transaction — minimum 5 lakh shares or ₹5 crore worth — executed in a dedicated <strong>Block Deal Window</strong> separate from the normal trading session. BSE and NSE open this window twice daily:</p>
<ul>
  <li>Morning window: 8:45 AM to 9:00 AM (15 minutes before market open)</li>
  <li>Afternoon window: 2:05 PM to 2:20 PM</li>
</ul>
<p>Block deals are typically arranged between two large institutional investors — a seller and a buyer — at an agreed price, which must be within ±1% of the previous close or volume-weighted average price (VWAP).</p>

<h2>Key Differences</h2>
<ul>
  <li><strong>Execution:</strong> Bulk deals on normal market screen; block deals on dedicated window</li>
  <li><strong>Minimum size:</strong> Bulk = 0.5% of equity; Block = 5 lakh shares or ₹5 crore</li>
  <li><strong>Price impact:</strong> Bulk deals can move prices; block deals minimize price impact via off-market window</li>
  <li><strong>Participants:</strong> Both institutions and large retail investors for bulk; mainly institutions for block</li>
</ul>

<h2>What Do They Signal?</h2>
<p>Large block deals are often PE funds exiting (sell side) or new institutions entering (buy side). A strategic buyer entering via block deal — particularly an FII buying a sizeable stake — is often bullish for the stock. Conversely, a promoter selling in bulk is worth investigating — it may signal reduced promoter confidence.</p>
<p>Not all bulk/block deals are negative exits. Common situations include:</p>
<ul>
  <li>Index rebalancing — passive funds must buy/sell to match index weights</li>
  <li>Stake transfer between arms of a fund house (not an open market sell)</li>
  <li>ESOP exercise by employees (bulk buy by employees at strike price)</li>
</ul>

<h2>Tracking Bulk and Block Deals on IPOpulse</h2>
<p>IPOpulse aggregates daily bulk and block deal data from BSE and NSE at /deals/bulk and /deals/block. Data includes buyer/seller name, quantity traded, price, and company name — allowing you to spot institutional activity patterns in real time.</p>
    `,
    faq: [
      {
        q: "Are bulk deals always disclosed on the same day?",
        a: "BSE and NSE mandate disclosure before end of trading session (3:30 PM). The data is typically available by 6–7 PM on the exchange websites.",
      },
      {
        q: "Can retail investors participate in block deals?",
        a: "Technically yes, if they meet the minimum trade size (5 lakh shares or ₹5 crore). In practice, block deals are almost entirely institutional.",
      },
      {
        q: "What does 'promoter selling bulk' mean for a stock?",
        a: "It depends on context. If promoters are selling small percentages to fund business needs, it may be neutral. Large promoter sell-offs (5%+) can signal reduced confidence or liquidity needs — worth investigating.",
      },
      {
        q: "Do bulk deals affect my ability to buy or sell shares normally?",
        a: "No. Bulk deals on the main screen are normal market transactions. Block deals happen in a separate window and don't affect the regular order book.",
      },
    ],
  },
  {
    slug: "sip-guide",
    title: "SIP Calculator Guide — How SIP Returns Work",
    description:
      "Learn how Systematic Investment Plan (SIP) returns work, the power of compounding, and how to use IPOpulse's SIP calculator to plan your mutual fund investments.",
    readingTime: 5,
    publishedAt: "2026-02-20",
    relatedSlugs: ["pe-ratio", "fii-dii-guide", "52-week-high-low"],
    content: `
<h2>What is SIP?</h2>
<p>A <strong>Systematic Investment Plan (SIP)</strong> is a method of investing a fixed amount in a mutual fund at regular intervals — typically monthly. Unlike a lumpsum investment, SIP spreads your purchases across market levels, reducing the impact of short-term volatility through <strong>rupee-cost averaging</strong>.</p>

<h2>How SIP Returns Are Calculated</h2>
<p>SIP returns are typically expressed as <strong>XIRR</strong> (Extended Internal Rate of Return) rather than simple percentage returns, because each SIP installment has a different investment duration. For example, your first SIP installment (invested 10 years ago) compounds for the full 10 years, while last month's installment has only 1 month of growth.</p>
<p>The SIP return formula computes the single annual rate that makes the net present value of all cash flows (installments) equal to the current portfolio value. This is XIRR.</p>

<h2>The Power of Compounding in SIPs</h2>
<p>Consider investing ₹10,000 per month for 20 years at 12% annual return (approximate long-term Nifty 50 CAGR):</p>
<ul>
  <li>Total investment: ₹24 lakh</li>
  <li>Estimated corpus: approximately ₹91 lakh</li>
  <li>Returns earned: approximately ₹67 lakh — nearly 2.8x your principal</li>
</ul>
<p>This illustrates the power of staying invested over long periods. Starting at age 25 vs age 35 can result in a 2x–3x larger corpus by retirement, even with identical monthly contributions, due to the extra decade of compounding.</p>

<h2>Rupee-Cost Averaging Explained</h2>
<p>When markets fall, your fixed SIP amount buys more units. When markets rise, it buys fewer units. Over time, your average cost per unit becomes lower than the average market price — this is rupee-cost averaging. It removes the need to time the market.</p>
<p>Example: ₹5,000/month in a fund with NAV of ₹100 in January buys 50 units. In February, NAV drops to ₹80 — the same ₹5,000 buys 62.5 units. Average cost = ₹5,000 × 2 / (50 + 62.5) = ₹88.9, which is below the average of ₹100 and ₹80 (₹90).</p>

<h2>Step-Up SIP</h2>
<p>A step-up (or top-up) SIP increases your monthly investment by a fixed percentage each year — typically 10–15% to match salary increments. A step-up SIP of ₹10,000/month growing at 10% per year can generate significantly more wealth than a flat SIP over 15–20 years.</p>

<h2>Which SIP Amount Should You Start With?</h2>
<p>Financial planners generally recommend investing 15–20% of monthly income via SIP. Use IPOpulse's SIP calculator at /calculators/sip to simulate corpus projections with your actual income, investment amount, and expected returns.</p>
    `,
    faq: [
      {
        q: "What return rate should I assume for SIP projections?",
        a: "For Nifty 50 index funds: 10–12% is a reasonable long-term assumption based on 20-year historical CAGR. For active large-cap funds: 12–14%. For mid/small-cap funds: 14–16%, with higher volatility.",
      },
      {
        q: "Can SIP lose money?",
        a: "Yes, in the short term. Equity SIPs can show negative returns over 1–3 year horizons if markets are in a downturn. Over 7–10 year horizons, the probability of negative XIRR becomes very low based on historical data.",
      },
      {
        q: "What happens if I miss a SIP installment?",
        a: "Missing one SIP installment does not penalize you. The next installment simply triggers as scheduled. Your bank may charge a small bounce fee if ECS debit fails.",
      },
      {
        q: "Is SIP only for mutual funds?",
        a: "SIP is primarily used for mutual funds in India. Some platforms now offer SIP-like features for stocks (e.g., Zerodha's baskets), but these are not technically SIPs — they are recurring stock purchase orders.",
      },
    ],
  },
  {
    slug: "pe-ratio",
    title: "Understanding P/E Ratio for Indian Stocks",
    description:
      "A beginner's guide to the Price-to-Earnings (P/E) ratio — what it means, how to use it for Indian stocks and IPOs, and its limitations as a valuation tool.",
    readingTime: 5,
    publishedAt: "2026-03-01",
    relatedSlugs: ["fii-dii-guide", "drhp-guide", "52-week-high-low"],
    content: `
<h2>What is the P/E Ratio?</h2>
<p>The <strong>Price-to-Earnings (P/E) ratio</strong> is the most widely used stock valuation metric. It tells you how much investors are willing to pay for every ₹1 of a company's earnings.</p>
<p><strong>P/E = Market Price per Share / Earnings per Share (EPS)</strong></p>
<p>Example: A stock trading at ₹500 with an EPS of ₹25 has a P/E of 20. This means investors are paying ₹20 for every ₹1 of earnings.</p>

<h2>Trailing vs Forward P/E</h2>
<ul>
  <li><strong>Trailing P/E (TTM):</strong> Uses actual earnings from the last 12 months. More reliable but backward-looking.</li>
  <li><strong>Forward P/E:</strong> Uses analyst estimates of next year's earnings. More relevant for high-growth companies but based on projections that can be wrong.</li>
</ul>

<h2>What is a "Good" P/E for Indian Stocks?</h2>
<p>There is no universal "good" P/E — it varies significantly by sector, growth rate, and market cycle. As of early 2026, benchmark P/E levels in India:</p>
<ul>
  <li><strong>Nifty 50:</strong> Typically trades at 20–25x trailing P/E</li>
  <li><strong>Banking stocks:</strong> 10–15x is common (lower due to credit risk)</li>
  <li><strong>FMCG / Consumer goods:</strong> 40–60x (premium for predictable earnings)</li>
  <li><strong>IT services (TCS, Infosys):</strong> 25–35x (quality premium)</li>
  <li><strong>PSU stocks:</strong> 5–12x (discount for governance risk)</li>
</ul>

<h2>P/E in IPO Valuation</h2>
<p>For IPOs, the DRHP typically includes a peer comparison table showing P/E ratios of listed competitors. Compare the IPO's asking P/E to its peers. An IPO pricing at a significant premium to established peers needs to justify the premium with superior growth, margins, or market position.</p>
<p>Be cautious of IPOs where the company was loss-making or had one-time gains inflating EPS — this makes the P/E appear artificially low.</p>

<h2>Limitations of P/E</h2>
<ul>
  <li><strong>Doesn't account for debt:</strong> A highly leveraged company can show a deceptively low P/E. Use EV/EBITDA (Enterprise Value to EBITDA) for debt-heavy sectors.</li>
  <li><strong>Useless for loss-making companies:</strong> Startups, new-age tech companies, and pre-profit IPOs cannot be valued by P/E. Use Price-to-Sales (P/S) or EV/Revenue instead.</li>
  <li><strong>Cyclical companies need sector adjustment:</strong> For commodity, metals, and real estate companies, earnings fluctuate wildly with cycles — P/E should be compared over a full cycle, not just peak earnings.</li>
  <li><strong>Manipulation via one-time items:</strong> Accounting adjustments, asset sales, or deferred tax reversals can inflate EPS in a single quarter, deflating P/E artificially.</li>
</ul>

<h2>PEG Ratio — P/E Adjusted for Growth</h2>
<p>The PEG ratio = P/E / Expected EPS growth rate. A PEG below 1 is generally considered undervalued relative to growth. For example, a stock at P/E 30 with 35% expected EPS growth has a PEG of 0.86 — potentially attractive. PEG is more useful than raw P/E for high-growth sectors like technology and specialty chemicals.</p>
    `,
    faq: [
      {
        q: "Should I only buy stocks with low P/E?",
        a: "Not necessarily. Low P/E can indicate undervaluation, but often reflects genuine business problems. High P/E for a high-growth company can still be justified. Always combine P/E with growth rates, debt levels, and ROE.",
      },
      {
        q: "What is the Nifty 50 P/E right now?",
        a: "Nifty 50 P/E is published daily by NSE. It fluctuates between 15x and 30x historically, with above 25x considered expensive and below 18x considered cheap based on historical averages.",
      },
      {
        q: "Can P/E be negative?",
        a: "Yes, when a company reports a loss (negative EPS). Negative P/E is meaningless — use other metrics like EV/Revenue or Price-to-Book for such companies.",
      },
      {
        q: "Is P/E useful for banks?",
        a: "Banks are better valued using Price-to-Book (P/B) ratio because their earnings are heavily influenced by provisioning and credit cycles. P/B compares market cap to book value (net assets).",
      },
    ],
  },
  {
    slug: "52-week-high-low",
    title: "52-Week High/Low — Trading Strategy",
    description:
      "Understand what 52-week highs and lows mean for Indian stocks, common trading strategies around these levels, and why they matter as psychological price barriers.",
    readingTime: 4,
    publishedAt: "2026-03-10",
    relatedSlugs: ["pe-ratio", "fii-dii-guide", "bulk-block-deals"],
    content: `
<h2>What is a 52-Week High/Low?</h2>
<p>A <strong>52-week high</strong> is the highest price at which a stock has traded in the past 52 weeks (1 year). A <strong>52-week low</strong> is the lowest price over the same period. These levels are widely tracked because they represent significant psychological price barriers — levels at which many investors made buy or sell decisions.</p>

<h2>Why 52-Week Highs Matter</h2>
<p>When a stock breaks above its 52-week high, it often signals strong momentum — the stock has overcome all selling pressure from the past year. Technically, there are no sellers with large losses sitting above the current price, which can lead to accelerated upward movement. This "breakout" is a common trigger for momentum traders.</p>
<p>Research on US and Indian markets shows stocks hitting 52-week highs tend to <strong>outperform the market over the next 3–6 months</strong> more often than not — a phenomenon called the 52-week high effect.</p>

<h2>Why 52-Week Lows Matter</h2>
<p>A stock at a 52-week low has significant downward pressure — many holders are in loss and may sell on any recovery (supply overhang). However, 52-week lows also attract value investors and contrarian traders who look for oversold opportunities.</p>
<p>For retail investors, 52-week lows can be a buying opportunity IF the fundamental reason for the decline is temporary — but it can also be a value trap if the business is structurally deteriorating.</p>

<h2>Common Trading Strategies</h2>
<ul>
  <li><strong>Breakout buying:</strong> Buy when a stock clears its 52-week high on high volume — the assumption is momentum will continue. Stop-loss is set just below the breakout level.</li>
  <li><strong>Mean reversion:</strong> Buy near 52-week lows when the company fundamentals remain intact. This requires more patience and higher risk tolerance.</li>
  <li><strong>Avoid buying at 52-week highs without confirmation:</strong> False breakouts are common. Wait for 2–3 days of sustained trading above the 52-week high before entering, especially for mid and small-cap stocks with thin volumes.</li>
</ul>

<h2>Index 52-Week High as Market Indicator</h2>
<p>The number of stocks hitting 52-week highs vs lows on any given day is a useful market breadth indicator. When Nifty rallies but fewer stocks are hitting new 52-week highs (declining breadth), it may signal the rally is narrowing — a potential warning sign. IPOpulse tracks market breadth including 52-week high/low counts at /market/breadth.</p>

<h2>52-Week High/Low for IPO Stocks</h2>
<p>For recently listed IPOs, the listing price effectively becomes the starting point for the 52-week range. IPOs that list at a premium and then steadily trend higher through their first year of listing often continue to outperform — early listing performance is a reasonable predictor of medium-term returns for fundamental businesses.</p>
    `,
    faq: [
      {
        q: "Where can I find a list of stocks at 52-week highs in India?",
        a: "NSE and BSE publish daily lists of 52-week high/low stocks. IPOpulse aggregates this data at /movers/52-week with filters by exchange, market cap, and sector.",
      },
      {
        q: "Is buying at a 52-week high risky?",
        a: "All stock buying carries risk. Breakout buying at 52-week highs works best for stocks with strong volume confirmation and improving fundamentals. It fails when the breakout is driven purely by speculation without earnings support.",
      },
      {
        q: "What does it mean when Nifty hits a 52-week high?",
        a: "When Nifty hits a 52-week high, it signals strong market momentum and positive institutional participation. Historically, Nifty 52-week highs are followed by further gains more often than sharp reversals.",
      },
      {
        q: "Should I sell when a stock hits a 52-week high?",
        a: "Not automatically. Selling winners too early is a common investor mistake. Evaluate the company's growth runway, current valuation vs earnings, and whether the fundamentals justify continued holding.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string): Article[] {
  const article = getArticle(slug);
  if (!article) return [];
  return articles.filter(
    (a) => article.relatedSlugs.includes(a.slug) && a.slug !== slug
  );
}
