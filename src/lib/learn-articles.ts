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
  // ── Advanced articles ────────────────────────────────────────────────────
  {
    slug: "what-is-allotment-probability",
    title: "IPO Allotment Probability — How to Maximise Your Chances",
    description: "Understand how IPO allotment works in India, what factors affect your chances, and practical strategies to improve allotment probability.",
    readingTime: 5,
    publishedAt: "2026-02-01",
    relatedSlugs: ["ipo-allotment", "how-to-apply-ipo", "mainboard-vs-sme"],
    content: `
<h2>How IPO Allotment Works</h2>
<p>IPO allotment in India is handled by the registrar (KFintech, Link Intime, Bigshare, Cameo) and follows SEBI regulations. For retail investors, the allotment process has two stages:</p>
<ul>
  <li><strong>Oversubscribed IPOs:</strong> SEBI mandates that each valid retail applicant gets at least one lot (if possible). A computerised lottery then allocates among eligible applicants.</li>
  <li><strong>Undersubscribed IPOs:</strong> All valid applicants get full allotment.</li>
</ul>
<h2>What Determines Your Allotment Probability</h2>
<p>For <strong>mainboard IPOs</strong>, retail quota is 35% of the total issue. If 10× oversubscribed with 10 lakh applications, your probability is roughly 1-in-10. Key factors:</p>
<ul>
  <li><strong>Number of applications:</strong> Higher total applications = lower individual probability in a lottery.</li>
  <li><strong>Issue size:</strong> Larger issues have more lots to distribute. A ₹10,000 Cr IPO with ₹3,500 Cr retail quota at ₹15,000 lot = ~2.3 lakh lots. If 23 lakh applications, 1-in-10 chance.</li>
  <li><strong>Category:</strong> HNI (₹2L-10L bids) and QIB are proportional allotment — bigger bid = more shares.</li>
</ul>
<h2>Practical Strategies to Increase Allotment Chances</h2>
<p><strong>1. Apply from multiple demat accounts:</strong> Apply via different family members' demat accounts (spouse, parents, adult children). Each PAN gets one application — one more PAN = one more lottery ticket.</p>
<p><strong>2. Apply at the cut-off price:</strong> Always bid at the upper end of the price band (cut-off). Applications at lower prices risk rejection if the issue prices at the top.</p>
<p><strong>3. Apply early:</strong> Apply on Day 1 or Day 2. Last-day server overload can cause UPI mandate failures.</p>
<p><strong>4. Minimum 1 lot per application:</strong> For retail, bidding more lots does not help — you still get one lot or nothing in an oversubscribed IPO.</p>
<p><strong>5. Target less hyped IPOs:</strong> SME IPOs and mid-sized mainboard IPOs are often less subscribed. Niche or boring businesses sometimes slip under the radar with better allotment odds.</p>
<h2>HNI Strategy — Bigger Bids Matter</h2>
<p>If you have ₹2 lakh or more to invest, HNI category (NII) offers proportional allotment. A ₹10L bid in a 10× subscribed HNI category gets the same allotment as 1/10th of that lot. The minimum NII application is ₹2,00,001.</p>
    `,
    faq: [
      { q: "Can I apply in multiple lots from one account?", a: "Yes, but for retail it rarely helps. In an oversubscribed IPO, each PAN gets a maximum of one lot regardless of how many lots you bid. Only in HNI category (>₹2L) does bidding more help." },
      { q: "Does the bank account matter for allotment?", a: "No. SEBI allotment is based on PAN + valid application. Any bank with ASBA facility works equally." },
      { q: "If allotted, when do shares credit to demat?", a: "Allotted shares credit to your demat account on T+1 after allotment date. Refunds for non-allotted amounts are released within 4 working days of allotment." },
      { q: "What if my UPI mandate is not approved?", a: "If UPI mandate is not approved before the close of bidding, your application is rejected. Always approve the mandate immediately after submitting." },
    ],
  },
  {
    slug: "nifty-50-explained",
    title: "Nifty 50 Explained — India's Benchmark Index",
    description: "What is Nifty 50, how is it calculated, what companies are in it, and how to invest in Nifty 50 via index funds and ETFs.",
    readingTime: 6,
    publishedAt: "2026-02-10",
    relatedSlugs: ["pe-ratio", "fii-dii-guide", "sip-guide"],
    content: `
<h2>What is Nifty 50?</h2>
<p>The <strong>Nifty 50</strong> (full name: NSE Nifty 50) is India's flagship stock market index, representing the 50 largest and most liquid companies listed on the National Stock Exchange (NSE). It is calculated and maintained by NSE Indices Limited.</p>
<p>Launched on <strong>April 22, 1996</strong> with a base value of 1,000, the Nifty 50 has grown to over 24,000 points as of 2026 — a ~24× return in 30 years, implying a CAGR of approximately 11-12% including dividends.</p>
<h2>How Nifty 50 is Calculated</h2>
<p>The index uses <strong>free-float market capitalisation</strong> weighted methodology. Larger companies have more influence. Formula:</p>
<p><strong>Index Value = (Current Market Cap of all 50 stocks) / (Base Market Cap) × Base Value (1000)</strong></p>
<p>Only the freely tradeable portion of shares (not held by promoters, government, or strategic investors) counts toward market cap.</p>
<h2>Sectoral Composition (approximate)</h2>
<ul>
  <li>Financial Services (Banks + NBFCs): ~35%</li>
  <li>IT / Technology: ~13%</li>
  <li>Oil & Gas: ~12%</li>
  <li>Consumer Goods (FMCG): ~9%</li>
  <li>Automobiles: ~7%</li>
  <li>Other sectors: ~24%</li>
</ul>
<h2>Nifty 50 P/E Ratio — What It Means</h2>
<p>The P/E ratio of Nifty 50 tells you how expensive the market is relative to earnings. Historical ranges:</p>
<ul>
  <li><strong>Below 16×:</strong> Historically cheap — good long-term buying opportunity</li>
  <li><strong>16–22×:</strong> Fairly valued — normal range</li>
  <li><strong>Above 25×:</strong> Stretched valuation — exercise caution</li>
</ul>
<p>Current Nifty 50 P/E is visible on IPOpulse's Indices page.</p>
<h2>How to Invest in Nifty 50</h2>
<p><strong>Index Mutual Funds:</strong> Lowest cost option. Mirae Asset Nifty 50 Index Fund, UTI Nifty 50 Index Fund, HDFC Index Fund Nifty 50 — expense ratios ~0.10-0.20%.</p>
<p><strong>ETFs:</strong> Nifty BeES (Nippon), HDFC Nifty 50 ETF — trade in real-time on NSE. Expense ratios ~0.05-0.10%.</p>
<p><strong>SIP route:</strong> Systematic Investment Plan in a Nifty 50 index fund is considered one of the simplest wealth creation strategies for Indian investors.</p>
    `,
    faq: [
      { q: "How often is Nifty 50 rebalanced?", a: "Nifty 50 composition is reviewed semi-annually (March and September) by NSE Indices. Companies meeting liquidity, free-float, and listing criteria are eligible." },
      { q: "What is the difference between Nifty 50 and Sensex?", a: "Sensex is BSE's index of 30 large-cap stocks. Nifty 50 covers 50 stocks on NSE. Both track large-cap India but Nifty 50 is more widely used for derivatives (F&O)." },
      { q: "Is Nifty 50 the best index to invest in?", a: "For most retail investors, Nifty 50 is an excellent choice — it's diversified, low-cost to replicate via index funds, and has a long track record. Nifty Next 50 adds the next tier of large-caps for slightly more growth potential." },
    ],
  },
  {
    slug: "how-gmp-predicts-listing",
    title: "How Accurate is IPO GMP for Predicting Listing Gain?",
    description: "A data-driven look at whether IPO grey market premium accurately predicts actual listing day performance. Historical accuracy analysis.",
    readingTime: 4,
    publishedAt: "2026-02-15",
    relatedSlugs: ["ipo-gmp", "mainboard-vs-sme", "ipo-allotment"],
    content: `
<h2>GMP vs Actual Listing — The Reality</h2>
<p>Grey market premium is widely watched but its <strong>predictive accuracy varies significantly</strong> depending on market conditions and IPO type.</p>
<h2>When GMP is Reliable</h2>
<p>GMP tends to be a reasonable indicator when:</p>
<ul>
  <li>The IPO is heavily subscribed (50×+ across all categories)</li>
  <li>GMP has been stable for 3-4 days before listing</li>
  <li>Market conditions are stable (no sudden FII sell-off)</li>
  <li>The issuer's business is well-understood by the market</li>
</ul>
<h2>When GMP Fails</h2>
<p>GMP frequently overestimates listing gains when:</p>
<ul>
  <li><strong>Market correction:</strong> A sudden Nifty fall on listing day overrides IPO-specific enthusiasm.</li>
  <li><strong>Weak anchor selloff:</strong> If anchor investors (lock-in ends after 30 days) are large sellers, pressure builds.</li>
  <li><strong>Small float:</strong> Thinly traded SME IPOs see GMP manipulated by a few operators.</li>
  <li><strong>Pre-open orders:</strong> Large sell orders in the pre-open session compress the listing price.</li>
</ul>
<h2>Average Accuracy (Historical)</h2>
<p>Based on mainboard IPOs 2022-2025:</p>
<ul>
  <li>GMP within <strong>±5 percentage points</strong> of actual listing gain: ~55% of IPOs</li>
  <li>GMP <strong>overestimated</strong> listing gain: ~30% of cases</li>
  <li>GMP <strong>underestimated</strong> listing gain: ~15% of cases</li>
</ul>
<p>IPOpulse tracks GMP accuracy on our <strong>GMP Accuracy Scorecard</strong> — comparing last-day GMP vs actual listing price for every listed IPO.</p>
<h2>Rule of Thumb</h2>
<p>Treat GMP as a <strong>sentiment indicator</strong>, not a price prediction. High GMP (30%+) with heavy QIB demand is historically bullish. Low GMP under 5% often means a flat or negative listing. Negative GMP is a strong warning sign.</p>
    `,
    faq: [
      { q: "Should I sell on listing day if GMP was high?", a: "Not necessarily. Some IPOs list below GMP but recover over weeks. If you believe in the business, consider holding. If you applied purely for listing gains, selling on listing day is rational but you may leave money on the table — or avoid a loss." },
      { q: "Who sets GMP?", a: "GMP is set by grey market operators (unofficial dealers) who trade IPO shares in the unregulated market. It's a supply-demand price between people who want to sell allotment rights and those who want to buy." },
    ],
  },
  {
    slug: "ipo-anchor-investors",
    title: "What are IPO Anchor Investors and Why Do They Matter?",
    description: "Learn who anchor investors are in an IPO, how they are allotted shares before the public issue, and what the 30-day and 90-day lock-in means for retail investors.",
    readingTime: 4,
    publishedAt: "2026-02-20",
    relatedSlugs: ["ipo-gmp", "how-to-apply-ipo", "drhp-guide"],
    content: `
<h2>Who are Anchor Investors?</h2>
<p>Anchor investors are large institutional investors — mutual funds, insurance companies, FPIs (Foreign Portfolio Investors) — that SEBI allows to bid for IPO shares <strong>one day before the public issue opens</strong>. This is called the anchor allotment.</p>
<p>SEBI introduced anchor investors in 2009 to build confidence in IPOs. When reputable institutions like HDFC MF, SBI MF, or foreign funds like Goldman Sachs back an IPO, it signals credibility to retail investors.</p>
<h2>Anchor Allocation Rules</h2>
<ul>
  <li>Anchors can be allotted up to <strong>60% of the QIB portion</strong> of any IPO</li>
  <li>Minimum application: ₹10 crore per anchor investor</li>
  <li>Minimum 2 anchor investors; maximum 15 for allotment up to ₹250 Cr</li>
  <li>Anchors are allotted at the <strong>upper end of the price band</strong></li>
</ul>
<h2>The Lock-in Period</h2>
<p>Anchor shares are locked — they cannot be sold immediately. SEBI rules (updated 2021):</p>
<ul>
  <li><strong>50% of anchor allocation:</strong> Locked for 90 days from listing</li>
  <li><strong>50% of anchor allocation:</strong> Locked for 30 days from listing</li>
</ul>
<p>This means on the 31st day after listing, 50% of anchor shares can hit the market. This often creates <strong>selling pressure around day 30</strong> — watch for this when holding an IPO stock.</p>
<h2>Quality of Anchors Matters</h2>
<p>Not all anchor participation is equal. Key questions:</p>
<ul>
  <li>Are domestic MFs (SBI, HDFC, Nippon) participating? They're long-term holders.</li>
  <li>Are FPIs present? Foreign institutional money signals global interest.</li>
  <li>Are obscure funds anchoring? Some promoter-friendly funds participate without intent to hold.</li>
</ul>
<p>Check anchor allotment letters on BSE/NSE on the day before an IPO opens. IPOpulse shows anchor investors on each IPO detail page.</p>
    `,
    faq: [
      { q: "Do anchor investors always profit?", a: "No. Anchors pay the issue price and are locked in. If the IPO lists down and stays below issue price, anchors also lose money on their allocation." },
      { q: "Is heavy anchor participation always good?", a: "Usually positive, but be cautious if the same 2-3 small funds appear repeatedly as anchors across many IPOs — this can indicate promoter connections rather than genuine institutional conviction." },
    ],
  },
  {
    slug: "understanding-ipo-subscription",
    title: "IPO Subscription Status — Retail, HNI, QIB Explained",
    description: "What retail, HNI, QIB and employee subscription numbers mean for an IPO and how to interpret subscription data to make better IPO decisions.",
    readingTime: 5,
    publishedAt: "2026-03-01",
    relatedSlugs: ["ipo-gmp", "what-is-allotment-probability", "how-to-apply-ipo"],
    content: `
<h2>The Three Investor Categories</h2>
<p>SEBI divides IPO investors into distinct categories, each with reserved quota:</p>
<ul>
  <li><strong>QIB (Qualified Institutional Buyers):</strong> 50% of net issue — mutual funds, banks, FPIs, insurance companies. Minimum investment ₹10 lakh (no upper limit). No refund if oversubscribed.</li>
  <li><strong>HNI / NII (Non-Institutional Investors):</strong> 15% of net issue — individuals applying above ₹2 lakh. Proportional allotment, not lottery.</li>
  <li><strong>Retail Individual Investors (RII):</strong> 35% of net issue — individuals applying up to ₹2 lakh. Lottery-based allotment if oversubscribed.</li>
</ul>
<h2>Reading Subscription Numbers</h2>
<p>Subscription data updates 3 times daily during the IPO window (9:30 AM, 1 PM, 5 PM on BSE/NSE). A "5× subscription" means 5× more bids than shares available in that category.</p>
<p><strong>What each number tells you:</strong></p>
<ul>
  <li><strong>QIB 50×+:</strong> Very strong institutional conviction. Almost always positive for listing.</li>
  <li><strong>HNI 30×+:</strong> Investors using leverage (bank funding) to bid. High HNI subscription drives high GMP but can lead to selling on listing when they repay loans.</li>
  <li><strong>Retail 2×-5×:</strong> Normal. Below 1× means the IPO may struggle to fully subscribe.</li>
</ul>
<h2>Day-Wise Subscription Pattern</h2>
<p>Day 1 subscriptions are typically lowest. Institutions and HNIs often bid on Day 2-3. Retail investors pile in on the last day after GMP rises. A strong Day 1 subscription (especially QIB on Day 1) is exceptionally bullish.</p>
<h2>Traps to Avoid</h2>
<ul>
  <li><strong>HNI-led subscription:</strong> Leverage-funded HNI bids inflate subscription. Post-listing, loan repayment forces selling. Look for QIB conviction to validate.</li>
  <li><strong>SME IPOs:</strong> 200× subscription looks exciting but is often from operators. Always check QIB participation and anchor quality.</li>
</ul>
    `,
    faq: [
      { q: "Where can I check live IPO subscription data?", a: "BSE and NSE publish subscription data 3 times daily on their websites. IPOpulse aggregates this on each IPO detail page." },
      { q: "Can retail subscription exceed QIB?", a: "Yes, retail can be 10× subscribed while QIB is 0.5×. This is usually a warning sign — institutions not participating despite retail FOMO. Proceed with caution." },
    ],
  },
  // ─── New articles ─────────────────────────────────────────────────────────
  {
    slug: "what-is-demat-account",
    title: "What is a Demat Account — And How to Open One in India",
    description:
      "Everything you need to know about demat accounts in India — what they hold, how to open one, annual charges, CDSL vs NSDL, and which broker to choose.",
    readingTime: 5,
    publishedAt: "2026-04-01",
    relatedSlugs: ["how-to-apply-ipo", "what-is-market-cap", "pe-ratio"],
    content: `
<h2>What is a Demat Account?</h2>
<p>A <strong>demat account</strong> (short for dematerialised account) holds your shares, bonds, ETFs, mutual fund units, and sovereign gold bonds in electronic form. Just like a bank account holds your money, a demat account holds your financial securities. Without one, you cannot buy or sell shares on NSE or BSE.</p>
<p>Before 1996, shares were held as physical certificates — paper documents that could be lost, forged, or damaged. SEBI mandated dematerialisation, and today 100% of trading is electronic.</p>

<h2>CDSL vs NSDL — Two Depositories</h2>
<p>India has two central depositories that actually hold your securities electronically:</p>
<ul>
  <li><strong>CDSL (Central Depository Services Limited):</strong> Promoted by BSE. Used by Zerodha, Groww, Angel One, and most discount brokers. Listed company — ticker CDSL on NSE.</li>
  <li><strong>NSDL (National Securities Depository Limited):</strong> Promoted by NSE. Used by ICICI Direct, HDFC Securities, Kotak Securities, and most bank-backed brokers.</li>
</ul>
<p>Your broker decides which depository you are on. For most retail investors, the choice is irrelevant — both depositories are equally safe and regulated by SEBI.</p>

<h2>What Can a Demat Account Hold?</h2>
<ul>
  <li>Equity shares (NSE/BSE listed companies)</li>
  <li>Preference shares</li>
  <li>Bonds and debentures</li>
  <li>Exchange-Traded Funds (ETFs)</li>
  <li>Sovereign Gold Bonds (SGBs)</li>
  <li>Government securities (G-Secs)</li>
  <li>Mutual fund units (only if held in demat form — optional)</li>
</ul>

<h2>Demat Account Charges</h2>
<p>Understanding charges prevents bill shock:</p>
<ul>
  <li><strong>Account opening fee:</strong> ₹0–₹500. Most discount brokers (Zerodha, Groww) offer free opening.</li>
  <li><strong>Annual Maintenance Charge (AMC):</strong> ₹0–₹750/year. Many brokers charge ₹300–₹400. Zerodha charges ₹300 after first year.</li>
  <li><strong>DP (Depository Participant) transaction charges:</strong> ₹13.5 + GST per debit transaction (sell side). This is charged by CDSL/NSDL regardless of broker.</li>
  <li><strong>Custodian fees:</strong> If you hold SGB, G-Secs — typically ₹0 to minimal.</li>
</ul>

<h2>How to Open a Demat Account</h2>
<p>Opening takes 10–30 minutes online (Aadhaar-linked, paperless). You need:</p>
<ul>
  <li>PAN card (mandatory)</li>
  <li>Aadhaar card (for e-KYC via OTP)</li>
  <li>Bank account details (cancelled cheque or bank statement)</li>
  <li>Signature (uploaded photo)</li>
  <li>Webcam or front camera for in-person verification (IPV)</li>
</ul>
<p>Popular choices: Zerodha (large discount broker, ₹20/trade), Groww (zero AMC first year, beginner-friendly), Angel One (₹20/order), ICICI Direct (full-service, higher cost but bank integration).</p>

<h2>One Demat, Multiple Trading Accounts?</h2>
<p>Yes. You can have demat accounts with multiple depositories (up to one CDSL + one NSDL) and link different trading accounts to each. Many investors hold a primary demat at one broker and a secondary at another for IPO allotment diversification (applying with different ASBA bank accounts).</p>
    `,
    faq: [
      {
        q: "Is a demat account and a trading account the same thing?",
        a: "No. A demat account stores your shares electronically. A trading account is used to place buy/sell orders on exchanges. You need both — brokers typically open both simultaneously.",
      },
      {
        q: "Can I have a demat account without a trading account?",
        a: "Yes. If you only want to hold securities (e.g., you received shares as an off-market transfer), you can hold a demat account without actively trading.",
      },
      {
        q: "What happens to my demat account if my broker shuts down?",
        a: "Your securities are safe. They are held by CDSL/NSDL, not your broker. You can transfer them to another broker's demat account.",
      },
      {
        q: "Is there a minimum balance required in a demat account?",
        a: "No minimum balance of securities is required. You can have an empty demat account (though you'll still pay AMC).",
      },
    ],
  },
  {
    slug: "what-is-market-cap",
    title: "What is Market Cap? Large-Cap, Mid-Cap, Small-Cap Explained",
    description:
      "Market capitalisation (market cap) determines whether a stock is large-cap, mid-cap, or small-cap in India. Learn how it is calculated and what it means for risk and returns.",
    readingTime: 4,
    publishedAt: "2026-04-05",
    relatedSlugs: ["pe-ratio", "what-is-roe-roce", "what-is-mutual-fund"],
    content: `
<h2>What is Market Capitalisation?</h2>
<p><strong>Market capitalisation</strong> (market cap) is the total market value of a company's outstanding shares. It is calculated as:</p>
<ul>
  <li><strong>Market Cap = Current Share Price × Total Shares Outstanding</strong></li>
</ul>
<p>Example: If a company has 50 crore shares outstanding and each share trades at ₹200, its market cap is ₹10,000 crore (₹100 billion).</p>
<p>Market cap is the most widely used measure of a company's size in the stock market. It does not equal the company's book value, revenue, or profit.</p>

<h2>SEBI's Market Cap Classification for India</h2>
<p>SEBI mandates a specific classification for Indian mutual funds, revised annually by AMFI (Association of Mutual Funds in India):</p>
<ul>
  <li><strong>Large-Cap:</strong> Top 100 companies by market cap. Includes Reliance, TCS, HDFC Bank, Infosys, ICICI Bank. Generally ₹20,000+ crore.</li>
  <li><strong>Mid-Cap:</strong> Rank 101–250 by market cap. Companies like Persistent Systems, Thermax, Voltas. Generally ₹5,000–₹20,000 crore.</li>
  <li><strong>Small-Cap:</strong> Rank 251 and beyond. Generally below ₹5,000 crore. Includes several thousand companies on NSE/BSE.</li>
</ul>
<p>AMFI publishes this list every six months (January and July). A company can be reclassified up or down based on market cap movement.</p>

<h2>Free Float vs Full Market Cap</h2>
<p><strong>Full market cap</strong> uses all outstanding shares including promoter holdings. <strong>Free-float market cap</strong> only counts shares available for public trading (excludes promoter-locked shares). Nifty 50 and Sensex use free-float methodology to reflect actual tradeable size.</p>

<h2>What Market Cap Tells You About Risk</h2>
<ul>
  <li><strong>Large-cap:</strong> Established businesses, lower volatility, lower return potential, high liquidity. Best for conservative investors.</li>
  <li><strong>Mid-cap:</strong> Growth companies with moderate risk. Can outperform large-caps over long horizons. Less liquid during corrections.</li>
  <li><strong>Small-cap:</strong> Highest growth potential, highest volatility, lowest liquidity. Prices can fall 50%+ in market downturns. Suit experienced investors with long horizons.</li>
</ul>

<h2>Enterprise Value vs Market Cap</h2>
<p>Enterprise Value (EV) is a more complete measure of company worth: <strong>EV = Market Cap + Total Debt − Cash</strong>. It accounts for the fact that a buyer acquiring the company assumes its debt. EV/EBITDA is a common valuation ratio used alongside P/E.</p>

<h2>Market Cap and Index Eligibility</h2>
<p>Nifty 50 requires companies to be in the top 1.5× the required number by free-float market cap. Large free-float market cap = higher index weight = more passive fund buying = typically more stable price.</p>
    `,
    faq: [
      {
        q: "Does a higher market cap mean a better company?",
        a: "Not necessarily. Market cap reflects investor expectations, not fundamental quality. Some large-cap companies are expensive relative to earnings; some small-caps are undervalued gems.",
      },
      {
        q: "How do I find a company's market cap on IPOpulse?",
        a: "Every company ticker page on IPOpulse shows market cap in crore rupees. The screener also lets you filter by market cap range.",
      },
      {
        q: "What is nano-cap?",
        a: "Nano-cap typically refers to companies below ₹100–200 crore market cap. These are very high risk, often illiquid, and mostly found on the SME segment of NSE/BSE.",
      },
    ],
  },
  {
    slug: "what-is-dividend",
    title: "What is a Dividend? Dividend Yield, Ex-Date, Record Date Explained",
    description:
      "Learn how dividends work in India — interim vs final dividend, dividend yield, ex-dividend date, record date, and tax treatment for retail investors.",
    readingTime: 5,
    publishedAt: "2026-04-08",
    relatedSlugs: ["pe-ratio", "what-is-market-cap", "what-is-roe-roce"],
    content: `
<h2>What is a Dividend?</h2>
<p>A <strong>dividend</strong> is a portion of a company's profits paid to its shareholders. When a company earns a profit, it can either reinvest it (retained earnings) or distribute part of it to shareholders as dividends. Dividends are declared by the board of directors and approved by shareholders at the AGM or through board resolutions.</p>
<p>In India, dividends are paid in cash and credited directly to your bank account linked to your demat account (via ECS/NEFT). No action is required from investors — you simply need to hold the shares before the ex-dividend date.</p>

<h2>Interim vs Final Dividend</h2>
<ul>
  <li><strong>Interim Dividend:</strong> Paid during the financial year, before the annual accounts are finalised. Declared by the board without shareholder approval. Common in Q2 or Q3.</li>
  <li><strong>Final Dividend:</strong> Declared at the end of the financial year, approved at the AGM. Legally requires shareholder resolution.</li>
</ul>

<h2>Key Dates You Must Know</h2>
<ul>
  <li><strong>Declaration Date:</strong> Date the board announces the dividend amount.</li>
  <li><strong>Record Date:</strong> The cut-off date — you must hold shares in your demat account on this date to receive the dividend.</li>
  <li><strong>Ex-Dividend Date:</strong> One trading day before the record date (T+1 settlement). If you buy shares on or after the ex-date, you will not receive the current dividend. The share price typically drops by approximately the dividend amount on the ex-date.</li>
  <li><strong>Payment Date:</strong> Dividend is credited to your account. SEBI mandates payment within 30 days of the record date.</li>
</ul>

<h2>Dividend Yield</h2>
<p>Dividend Yield measures the annual dividend relative to the current share price:</p>
<ul>
  <li><strong>Dividend Yield = Annual Dividend Per Share / Current Share Price × 100</strong></li>
</ul>
<p>Example: If a company pays ₹20 annual dividend and the share trades at ₹500, yield = 4%. PSU companies (Coal India, Power Finance Corp) often yield 5–8%, making them attractive for income investors.</p>

<h2>Dividend Payout Ratio</h2>
<p>Payout ratio = Dividends Paid / Net Profit. A payout ratio of 40% means the company distributes 40% of profit as dividends and retains 60% for reinvestment. High-payout companies (70%+) include many PSUs and mature cash-generative businesses. Growth companies typically have low or zero payout.</p>

<h2>Dividend Taxation in India (Post April 2020)</h2>
<p>Since FY2020-21, dividends are <strong>taxable in the hands of the investor</strong> at the applicable income tax slab rate. TDS of 10% is deducted at source if dividends exceed ₹5,000 in a financial year. High-income investors (30% bracket) pay effectively 30% on dividends. This reduced the attractiveness of high-dividend stocks for HNIs compared to earlier when dividends were tax-free.</p>

<h2>Special Dividends and Buybacks</h2>
<p>Companies sometimes declare special one-time dividends from accumulated reserves or asset sales. Alternatively, companies prefer <strong>buybacks</strong> (repurchasing own shares) over dividends because buyback is taxed at a lower rate for companies and was previously tax-efficient for investors. Post-2024 budget changes, buyback tax has been shifted to investors — making dividends and buybacks more comparable from a tax perspective.</p>
    `,
    faq: [
      {
        q: "If I buy shares one day before the ex-date, do I get the dividend?",
        a: "Yes. Under T+1 settlement (which India implemented in 2023), buying shares one day before the ex-date gives you record date holding. But confirm your specific stock's settlement cycle.",
      },
      {
        q: "Does the share price always fall by the dividend amount on ex-date?",
        a: "Theoretically yes, but in practice the price adjusts approximately for the dividend, modified by market movements. Trying to arbitrage ex-dividend drops is generally unprofitable after transaction costs.",
      },
      {
        q: "Where can I find upcoming dividend dates?",
        a: "IPOpulse's Corporate Actions section lists upcoming dividend record dates, ex-dates, and payment amounts for all NSE/BSE listed companies.",
      },
    ],
  },
  {
    slug: "cagr-meaning",
    title: "What is CAGR? Compounded Annual Growth Rate Explained",
    description:
      "CAGR (Compounded Annual Growth Rate) is the most important return metric for long-term investors. Learn what it means, how to calculate it, and when to use it vs XIRR.",
    readingTime: 4,
    publishedAt: "2026-04-10",
    relatedSlugs: ["sip-guide", "pe-ratio", "what-is-mutual-fund"],
    content: `
<h2>What is CAGR?</h2>
<p><strong>CAGR (Compounded Annual Growth Rate)</strong> is the rate at which an investment grows from its beginning value to its ending value, assuming profits are reinvested at the same rate each year. It is the "smoothed" annual return — it ignores volatility and shows what constant annual rate would produce the same result.</p>
<p>Formula: <strong>CAGR = (Ending Value / Beginning Value) ^ (1 / Years) − 1</strong></p>
<p>Example: If ₹1 lakh grows to ₹2.5 lakh in 5 years → CAGR = (2.5) ^ (1/5) − 1 = 20.1% per year.</p>

<h2>Why CAGR is Better Than Simple Returns</h2>
<p>Simple return: ₹1 lakh → ₹2.5 lakh = 150% gain. This says nothing about how long it took. CAGR normalises for time, making different investments comparable:</p>
<ul>
  <li>Investment A: 100% return in 2 years → CAGR = 41%</li>
  <li>Investment B: 100% return in 10 years → CAGR = 7.2%</li>
</ul>
<p>Investment A is clearly superior — but simple percentage alone hides this.</p>

<h2>CAGR of Nifty 50 (Historical)</h2>
<ul>
  <li>10-year CAGR (2014–2024): approximately 12–13% per year</li>
  <li>20-year CAGR (2004–2024): approximately 14–15% per year</li>
  <li>30-year CAGR (1994–2024): approximately 12–13% per year</li>
</ul>
<p>These returns assume reinvestment of dividends (total return). Pure price CAGR is slightly lower. Historical CAGR is not a guarantee of future returns but is a useful benchmark.</p>

<h2>How to Use CAGR for Goal Planning</h2>
<p>Using the reverse CAGR formula, you can estimate how long it takes to double money at a given return rate — approximately following the <strong>Rule of 72</strong>:</p>
<ul>
  <li><strong>Years to double = 72 / CAGR%</strong></li>
  <li>At 12% CAGR: money doubles in 6 years</li>
  <li>At 15% CAGR: money doubles in 4.8 years</li>
  <li>At 7% (FD rates): money doubles in ~10 years</li>
</ul>

<h2>CAGR vs XIRR — When to Use Which</h2>
<ul>
  <li><strong>CAGR:</strong> Use when comparing point-to-point investment returns (one lump sum invested at one time, redeemed at one time). Great for mutual fund fact sheets, index performance, stocks.</li>
  <li><strong>XIRR:</strong> Use when there are multiple cash flows (monthly SIPs, irregular investments, partial redemptions). XIRR accounts for the timing of each cash flow. CAGR cannot handle this correctly.</li>
</ul>

<h2>Common CAGR Misconceptions</h2>
<ul>
  <li><strong>"CAGR of 25% means consistent 25% every year"</strong> — FALSE. CAGR is the geometric average. Years could be +80%, −30%, +45% — the CAGR is still calculated from start to end value only.</li>
  <li><strong>"Higher CAGR always means better investment"</strong> — FALSE. CAGR ignores volatility. A 25% CAGR investment with 60% drawdowns may not suit a conservative investor even though the numbers look great.</li>
</ul>
    `,
    faq: [
      {
        q: "How do I calculate CAGR in Excel or Google Sheets?",
        a: "=(End_Value/Start_Value)^(1/Years)-1. Enter as percentage format. For example: =(250000/100000)^(1/5)-1 = 0.201 = 20.1%.",
      },
      {
        q: "Can CAGR be negative?",
        a: "Yes. If your investment loses value overall, CAGR is negative. Example: ₹1 lakh shrinks to ₹70,000 in 3 years → CAGR = (0.7)^(1/3) − 1 = −10.8% per year.",
      },
      {
        q: "IPOpulse shows '3Y Return' — is that CAGR?",
        a: "Yes. When IPOpulse or any financial site shows a 3-year or 5-year return for a fund or stock, it is almost always stated as CAGR (annualised return), not cumulative return.",
      },
    ],
  },
  {
    slug: "what-is-mutual-fund",
    title: "What is a Mutual Fund? Types, NAV, and How to Invest in India",
    description:
      "A complete guide to mutual funds in India — what NAV means, types of mutual funds (equity, debt, hybrid), SIP vs lumpsum, and how SEBI categorises funds.",
    readingTime: 6,
    publishedAt: "2026-04-12",
    relatedSlugs: ["sip-guide", "cagr-meaning", "fii-dii-guide"],
    content: `
<h2>What is a Mutual Fund?</h2>
<p>A <strong>mutual fund</strong> is a pool of money collected from thousands of investors, professionally managed by a fund manager, and invested in a diversified portfolio of stocks, bonds, or other securities. Each investor owns units of the fund proportional to their investment. The fund's gains, losses, and income are shared proportionally.</p>
<p>In India, mutual funds are regulated by SEBI and managed by Asset Management Companies (AMCs) like SBI Mutual Fund, HDFC Mutual Fund, Nippon India, Kotak, Axis, and Mirae Asset.</p>

<h2>What is NAV?</h2>
<p><strong>NAV (Net Asset Value)</strong> is the per-unit price of the mutual fund. It is calculated daily after market close:</p>
<ul>
  <li><strong>NAV = (Total Assets − Liabilities) / Number of Units Outstanding</strong></li>
</ul>
<p>When you invest ₹10,000 in a fund with NAV ₹200, you get 50 units. When NAV rises to ₹250, your investment is worth ₹12,500. A higher NAV doesn't mean the fund is expensive — it simply means the fund is older and has grown. Always evaluate funds by returns, not NAV level.</p>

<h2>SEBI's Mutual Fund Categories</h2>
<p>SEBI mandated a rationalisation of fund categories in 2018. Key equity fund categories:</p>
<ul>
  <li><strong>Large-Cap Fund:</strong> Minimum 80% in top 100 companies. Lower risk, stable returns.</li>
  <li><strong>Mid-Cap Fund:</strong> Minimum 65% in 101–250 ranked companies. Higher growth, more volatile.</li>
  <li><strong>Small-Cap Fund:</strong> Minimum 65% in 251+ ranked companies. Highest risk/return.</li>
  <li><strong>Flexi-Cap Fund:</strong> No market-cap restriction. Manager allocates freely. Popular category.</li>
  <li><strong>ELSS (Tax-Saving Fund):</strong> 80% equity minimum, 3-year lock-in, ₹1.5 lakh tax deduction under Section 80C.</li>
  <li><strong>Index Fund/ETF:</strong> Passively tracks an index (Nifty 50, Sensex, Nifty Next 50). Zero fund manager risk, very low expense ratio (0.1–0.2%).</li>
</ul>

<h2>Equity vs Debt vs Hybrid Funds</h2>
<ul>
  <li><strong>Equity Funds:</strong> Invest primarily in stocks. Higher long-term returns (10–15% CAGR historically), higher short-term volatility. Suitable for 5+ year horizons.</li>
  <li><strong>Debt Funds:</strong> Invest in government bonds, corporate bonds, money market instruments. Lower returns (5–7%), lower risk. Suitable for 1–3 year horizons.</li>
  <li><strong>Hybrid Funds:</strong> Mix of equity and debt. Balanced Advantage Funds dynamically shift allocation between equity and debt based on market valuations.</li>
</ul>

<h2>SIP vs Lumpsum</h2>
<ul>
  <li><strong>SIP (Systematic Investment Plan):</strong> Fixed amount every month. Benefits from rupee-cost averaging. Ideal for salaried investors.</li>
  <li><strong>Lumpsum:</strong> One-time large investment. Best when markets have corrected significantly. Higher risk of buying at a peak.</li>
</ul>

<h2>Expense Ratio — The Silent Wealth Destroyer</h2>
<p>Expense ratio is the annual fee charged by the AMC, deducted from the fund's NAV daily. Even a small difference in expense ratio compounds significantly over decades:</p>
<ul>
  <li>Index fund: 0.1–0.2% expense ratio</li>
  <li>Active large-cap fund: 0.8–1.5%</li>
  <li>Active small-cap fund: 1.5–2.5%</li>
</ul>
<p>Over 20 years, a 1% higher expense ratio reduces your corpus by approximately 15–18%. This is why index funds often outperform active funds after expenses.</p>

<h2>Direct vs Regular Plans</h2>
<p>Every mutual fund has two variants: <strong>Direct Plan</strong> (invest directly with the AMC, no distributor commission, lower expense ratio by ~0.5–1%) and <strong>Regular Plan</strong> (purchased through a distributor/broker, who earns trail commission). Always choose Direct plans — the long-term saving is significant. Invest via platforms like MF Central, Coin by Zerodha, or AMC websites for Direct access.</p>
    `,
    faq: [
      {
        q: "Is investing in mutual funds safe?",
        a: "Equity mutual funds carry market risk — your capital can decline in the short term. Debt funds carry credit risk and interest rate risk. There is no capital guarantee. However, mutual funds are regulated by SEBI and are transparent — much safer than unregulated schemes.",
      },
      {
        q: "What is the minimum investment in a mutual fund?",
        a: "Most funds allow SIP starting at ₹100–₹500/month and lumpsum starting at ₹1,000–₹5,000. Some funds have higher minimums.",
      },
      {
        q: "Are mutual fund returns taxed?",
        a: "Equity fund LTCG (held 1+ year): 12.5% on gains above ₹1.25 lakh per year. STCG (held under 1 year): 20%. Debt fund gains are taxed at income tax slab rate regardless of holding period (post April 2023).",
      },
    ],
  },
  {
    slug: "rights-issue-bonus-share",
    title: "Rights Issue vs Bonus Share — Key Differences Explained",
    description:
      "What is a rights issue? What is a bonus share? Learn the key differences, their impact on share price and earnings per share, and how to respond as a retail investor.",
    readingTime: 5,
    publishedAt: "2026-04-15",
    relatedSlugs: ["what-is-dividend", "what-is-market-cap", "pe-ratio"],
    content: `
<h2>What is a Rights Issue?</h2>
<p>A <strong>rights issue</strong> is when a company offers existing shareholders the right to buy additional shares at a discounted price, in proportion to their current holdings. It is a way to raise fresh capital from existing shareholders rather than the open market.</p>
<p>Example: A 1:3 rights issue at ₹150 (current market price ₹200) means for every 3 shares you hold, you can buy 1 additional share at ₹150. You are not obligated — you can let the rights lapse or sell them in the market (if listed).</p>

<h2>Impact of Rights Issue on Share Price</h2>
<p>After a rights issue, the share price adjusts to account for the dilution. The theoretical ex-rights price is calculated as:</p>
<ul>
  <li><strong>Theoretical Ex-Rights Price = (N × Market Price + Rights Price) / (N + 1)</strong></li>
  <li>where N is the ratio (e.g., 3 for 1:3 rights issue)</li>
</ul>
<p>Using the example: (3 × 200 + 150) / 4 = ₹187.50. Shareholders who exercise rights should see no change in overall portfolio value at this price — but those who do NOT exercise rights will face dilution.</p>

<h2>Should You Exercise Rights?</h2>
<p>Generally yes, if you have conviction in the company's prospects. Reasons to exercise:</p>
<ul>
  <li>Discount to market price means immediate value accretion</li>
  <li>Not exercising dilutes your ownership percentage</li>
</ul>
<p>Reasons to sell rights (if listed on exchange) or let lapse:</p>
<ul>
  <li>Lack of liquidity to fund the purchase</li>
  <li>Loss of conviction in company fundamentals</li>
</ul>

<h2>What is a Bonus Share?</h2>
<p>A <strong>bonus share</strong> issue (also called a stock dividend) is when a company distributes free additional shares to existing shareholders by capitalising its accumulated reserves. No cash leaves the company.</p>
<p>Example: A 1:1 bonus means for every share you hold, you get 1 free share. If you held 100 shares at ₹500, after 1:1 bonus you have 200 shares at ₹250. Your total value remains unchanged — ₹50,000.</p>

<h2>Why Companies Issue Bonus Shares</h2>
<ul>
  <li>Signals confidence — management shows the company has strong reserves</li>
  <li>Makes shares more affordable by reducing price per share</li>
  <li>Improves liquidity of the stock</li>
  <li>Rewards loyal shareholders without cash outflow</li>
</ul>

<h2>Key Differences</h2>
<ul>
  <li><strong>Cash flow:</strong> Rights issue brings in cash to company; bonus share is a bookkeeping entry with no cash</li>
  <li><strong>Cost to shareholder:</strong> Rights require payment; bonus is free</li>
  <li><strong>EPS impact:</strong> Both dilute EPS (more shares outstanding) — but rights issue also adds to earnings (if capital deployed productively); bonus does not change earnings</li>
  <li><strong>Purpose:</strong> Rights = growth capital or debt repayment; Bonus = shareholder reward from reserves</li>
</ul>

<h2>Taxation</h2>
<p>Bonus shares: Received at zero cost. When sold, the entire sale proceeds are treated as capital gain. Holding period for LTCG is measured from the date of allotment of bonus shares, not the original shares.</p>
<p>Rights shares: Purchased at issue price (cost basis). Capital gain measured from date of purchase.</p>
    `,
    faq: [
      {
        q: "Do I need to do anything for a bonus share issue?",
        a: "No action required. Bonus shares are automatically credited to your demat account on the record date. Simply ensure you hold shares before the ex-date.",
      },
      {
        q: "Is a rights issue a sign of financial distress?",
        a: "Not necessarily. Rights issues are used for expansion, acquisitions, or debt reduction. However, if a company is consistently raising rights capital to repay debt rather than grow, it may indicate financial stress.",
      },
      {
        q: "Can I renounce my rights?",
        a: "Yes. You can sell your rights entitlement to another investor if the rights are listed on the exchange (Renouncement Form / RERF). Not all rights issues have listed rights.",
      },
    ],
  },
  {
    slug: "how-to-read-annual-report",
    title: "How to Read an Annual Report — Key Sections for Indian Investors",
    description:
      "A practical guide to reading Indian company annual reports — where to find financials, what the auditor's report reveals, how to spot red flags in MD&A, and key ratios to calculate.",
    readingTime: 6,
    publishedAt: "2026-04-18",
    relatedSlugs: ["what-is-roe-roce", "pe-ratio", "drhp-guide"],
    content: `
<h2>Why Read an Annual Report?</h2>
<p>An annual report is the most comprehensive, legally-mandated disclosure a company makes. Unlike quarterly results, which are brief, annual reports include audited financials, management commentary, risk disclosures, segment details, and corporate governance data. For a long-term investor, the annual report is the single most important document about a business.</p>

<h2>Where to Find Annual Reports</h2>
<ul>
  <li><strong>BSE:</strong> bseindia.com → Company Info → Annual Reports section</li>
  <li><strong>NSE:</strong> nseindia.com → Corporates → Annual Reports</li>
  <li><strong>Company website:</strong> Most IR (Investor Relations) sections post PDFs directly</li>
  <li><strong>SEBI SCORES / Stock Exchange filings:</strong> All mandatory disclosures appear within 24 hours of filing</li>
</ul>

<h2>Key Sections to Focus On</h2>
<p><strong>1. Management Discussion &amp; Analysis (MD&amp;A):</strong> The most readable section. Management explains business performance, industry conditions, strategy, and risks. Compare what management said last year against actual results — consistent delivery vs promises shows credibility.</p>
<p><strong>2. Auditor's Report:</strong> Read the first two paragraphs. If the auditor gives a "qualified opinion," an "adverse opinion," or an "emphasis of matter," investigate immediately. These are red flags. An unqualified (clean) opinion is what you want.</p>
<p><strong>3. Balance Sheet:</strong> Assets = Liabilities + Equity. Key items to check: debt levels (long-term borrowings), cash and cash equivalents, goodwill (check for impairment), accounts receivable (high receivables may indicate collection risk), and inventory.</p>
<p><strong>4. Profit &amp; Loss Statement:</strong> Revenue → Gross Profit → EBITDA → EBIT → PBT → PAT. Check revenue growth, gross margin trends, EBITDA margin, and whether PAT growth matches EBITDA growth (if not, check exceptional items or tax changes).</p>
<p><strong>5. Cash Flow Statement:</strong> The most manipulation-resistant statement. <strong>Operating Cash Flow (OCF) should be close to or higher than Net Profit.</strong> Companies that consistently show high profit but low OCF may be recognising revenue without receiving cash — a red flag.</p>

<h2>Red Flags to Watch For</h2>
<ul>
  <li><strong>Auditor qualification or change:</strong> If auditors resign or are changed frequently, investigate why</li>
  <li><strong>Rising receivables faster than revenue:</strong> May indicate aggressive revenue recognition</li>
  <li><strong>High related-party transactions:</strong> Promoters routing money through subsidiaries</li>
  <li><strong>Goodwill that keeps rising without acquisitions:</strong> May indicate accounting irregularities</li>
  <li><strong>Pledged promoter shares:</strong> Check Pledged Promoter Holdings table — high pledge (50%+) is very high risk</li>
  <li><strong>Employee count falling while revenue grows:</strong> May be unsustainable or indicate outsourcing risks</li>
</ul>

<h2>Key Ratios to Calculate From Annual Report</h2>
<ul>
  <li><strong>Return on Equity (ROE) = PAT / Shareholders' Equity</strong></li>
  <li><strong>Return on Capital Employed (ROCE) = EBIT / Capital Employed</strong></li>
  <li><strong>Debt-to-Equity = Total Debt / Shareholders' Equity</strong></li>
  <li><strong>Current Ratio = Current Assets / Current Liabilities</strong> (should be above 1.5)</li>
  <li><strong>Interest Coverage = EBIT / Interest Expense</strong> (should be above 3)</li>
</ul>

<h2>The One Question to Answer</h2>
<p>After reading the annual report, ask: <em>"Does management's story match what the numbers say?"</em> If management claims strong growth but cash flows are deteriorating, something doesn't add up. Always follow the cash.</p>
    `,
    faq: [
      {
        q: "How long does it take to read a full annual report?",
        a: "A thorough first read of a typical company's annual report takes 3–6 hours. Experienced analysts focus on key sections (MD&A, auditor's report, cash flows, notes) and can complete a review in 1–2 hours.",
      },
      {
        q: "Do I need an accounting background to read annual reports?",
        a: "Basic accounting literacy helps but isn't required. Understanding revenue, profit, debt, and cash flow concepts is enough to identify red flags. You don't need to understand every note to the accounts.",
      },
      {
        q: "Are standalone or consolidated financials more important?",
        a: "For companies with subsidiaries, always use consolidated financials — they include subsidiary revenues, profits, and debts. Standalone hides off-balance sheet exposure in subsidiaries.",
      },
    ],
  },
  {
    slug: "what-are-futures-options",
    title: "What are Futures and Options (F&O)? A Beginner's Guide for Indian Investors",
    description:
      "Futures and options are derivatives traded on NSE. Learn what call and put options mean, how futures contracts work, lot sizes, expiry, and whether F&O is suitable for you.",
    readingTime: 6,
    publishedAt: "2026-04-20",
    relatedSlugs: ["nifty-50-explained", "fii-dii-guide", "52-week-high-low"],
    content: `
<h2>What are Derivatives?</h2>
<p><strong>Derivatives</strong> are financial contracts whose value is derived from an underlying asset — typically a stock index (Nifty 50, Bank Nifty), individual stocks (around 200 stocks in F&O on NSE), commodities, or currencies. In India, NSE is the world's largest derivatives exchange by contract volume.</p>
<p>There are two main types of equity derivatives: <strong>Futures</strong> and <strong>Options</strong>.</p>

<h2>What is a Futures Contract?</h2>
<p>A <strong>futures contract</strong> is an agreement to buy or sell an asset at a predetermined price on a specific future date. Both parties are obligated — the buyer must buy, the seller must sell.</p>
<p>Example: Nifty 50 futures lot size = 75 units. If Nifty is at 24,000 and you buy 1 Nifty Futures lot, your contract value = 24,000 × 75 = ₹18 lakh. You pay margin (typically 10–15%), not the full value — roughly ₹1.8–2.7 lakh. If Nifty rises to 24,500, profit = 500 × 75 = ₹37,500. If it falls to 23,500, loss = 500 × 75 = ₹37,500.</p>
<p>Key features of futures:</p>
<ul>
  <li>Obligatory contract (unlike options)</li>
  <li>Daily mark-to-market (profits/losses settled daily to margin account)</li>
  <li>Expiry on last Thursday of every month (weekly expiry for Nifty Bank Nifty)</li>
  <li>High leverage — small margin controls large contract value</li>
</ul>

<h2>What are Options?</h2>
<p>An <strong>option</strong> gives the buyer the <em>right but not the obligation</em> to buy or sell the underlying at a specific price (strike price) before or on the expiry date. The buyer pays a premium for this right. The seller (writer) receives the premium and takes on the obligation.</p>
<ul>
  <li><strong>Call Option:</strong> Right to buy. You buy a call if you expect the underlying to rise.</li>
  <li><strong>Put Option:</strong> Right to sell. You buy a put if you expect the underlying to fall.</li>
</ul>
<p>Example: Nifty is at 24,000. You buy a Nifty 24,200 Call at ₹80 premium (lot = 75). Cost = ₹80 × 75 = ₹6,000. If Nifty rises to 24,500 at expiry, intrinsic value = 24,500 − 24,200 = ₹300. Profit = (₹300 − ₹80) × 75 = ₹16,500. If Nifty stays below 24,200, the call expires worthless and you lose ₹6,000.</p>

<h2>F&O Lot Sizes and Expiry</h2>
<p>SEBI sets minimum lot sizes to prevent excessive leverage. Nifty 50 lot = 75. Bank Nifty lot = 30. Individual stocks have varying lot sizes. Expiry: Monthly (last Thursday), Weekly (Nifty and Bank Nifty have weekly options on every Thursday). After the 2023 regulatory changes, weekly options for individual stocks were discontinued.</p>

<h2>Is F&O Suitable for You?</h2>
<p>SEBI data shows that over <strong>89% of individual F&O traders lose money</strong>. The average loss per losing trader is ₹1.1 lakh per year. F&O is a zero-sum game — your gain is another participant's loss. Market makers and institutions have significant informational and structural advantages.</p>
<p>F&O is suitable for experienced investors who need to <strong>hedge</strong> existing positions — for example, buying Nifty puts to protect a large equity portfolio against a market crash. It is not suitable for beginners as a wealth-building tool.</p>

<h2>F&O Taxation in India</h2>
<p>F&O trading is treated as <strong>business income</strong> in India, regardless of whether you hold shares for delivery. Profits are taxed at your applicable income tax slab rate. Losses can be carried forward for up to 8 years and set off against future business income. Tax audit is mandatory if F&O turnover exceeds ₹10 crore (or ₹2 crore if loss is claimed).</p>
    `,
    faq: [
      {
        q: "Can I lose more than my investment in F&O?",
        a: "For option buyers, maximum loss is the premium paid. For futures traders and option sellers, losses can exceed the margin deposited — you may receive margin calls requiring additional deposits.",
      },
      {
        q: "What is an option's theta decay?",
        a: "Theta is the daily time decay of an option's premium. As expiry approaches, options lose value rapidly even if the underlying doesn't move. This benefits option sellers but harms buyers — especially for weekly options close to expiry.",
      },
      {
        q: "Do I need special permission to trade F&O?",
        a: "You need F&O segment activation from your broker. Most brokers require you to confirm understanding of risks. SEBI's 2023 circular mandates a mandatory 'true to label' risk disclosure before F&O activation.",
      },
    ],
  },
  {
    slug: "what-is-roe-roce",
    title: "ROE vs ROCE — Which Profitability Ratio Matters More?",
    description:
      "ROE (Return on Equity) and ROCE (Return on Capital Employed) are the two most important profitability ratios for equity investors. Learn what each measures, how to calculate them, and when ROCE matters more than ROE.",
    readingTime: 5,
    publishedAt: "2026-04-22",
    relatedSlugs: ["pe-ratio", "what-is-market-cap", "how-to-read-annual-report"],
    content: `
<h2>Return on Equity (ROE)</h2>
<p><strong>ROE</strong> measures how much profit a company generates for every rupee of shareholders' equity (net worth). It answers: "How efficiently is management using shareholder capital?"</p>
<ul>
  <li><strong>ROE = Net Profit (PAT) / Shareholders' Equity × 100</strong></li>
</ul>
<p>Example: Company A has PAT of ₹100 crore and shareholders' equity of ₹500 crore → ROE = 20%.</p>
<p>A consistently high ROE (15%+) over 5–10 years suggests a business with competitive advantages (moats) — like strong brands, network effects, or cost advantages that allow superior returns.</p>
<p>Warren Buffett's first filter for any investment: <em>ROE consistently above 15% without excessive leverage.</em></p>

<h2>What "Without Excessive Leverage" Means</h2>
<p>The DuPont formula breaks ROE into three components:</p>
<ul>
  <li><strong>ROE = Net Profit Margin × Asset Turnover × Financial Leverage</strong></li>
  <li>or equivalently: ROE = (PAT/Sales) × (Sales/Assets) × (Assets/Equity)</li>
</ul>
<p>A company can boost ROE by taking on more debt (financial leverage). This makes ROE misleading for leveraged businesses. A bank or NBFC with 20% ROE funded mostly by deposits (effectively debt) cannot be compared directly to a software company with 20% ROE and zero debt. Always check the debt-to-equity ratio alongside ROE.</p>

<h2>Return on Capital Employed (ROCE)</h2>
<p><strong>ROCE</strong> measures return on all capital used — both equity and debt. It is a better measure for capital-intensive businesses (manufacturing, infrastructure, telecom) where debt funding is common.</p>
<ul>
  <li><strong>ROCE = EBIT / Capital Employed × 100</strong></li>
  <li>Capital Employed = Total Assets − Current Liabilities, or equivalently, Shareholders' Equity + Long-term Debt</li>
</ul>
<p>Example: EBIT ₹200 crore, Equity ₹500 crore, Long-term Debt ₹300 crore → Capital Employed = ₹800 crore → ROCE = 25%.</p>

<h2>When to Use ROE vs ROCE</h2>
<ul>
  <li><strong>Use ROCE</strong> for capital-intensive sectors: manufacturing, power, infrastructure, cement, metals, telecom. These businesses inherently carry debt to fund assets.</li>
  <li><strong>Use ROE</strong> for asset-light businesses: software, consumer brands, hospitals, financial services (with caution on leverage).</li>
  <li><strong>ROCE &gt; Cost of Capital</strong> (WACC) means the business is creating value. If ROCE is below cost of capital, the business is destroying shareholder value even if PAT is positive.</li>
</ul>

<h2>Indian Sector Benchmarks (Approximate)</h2>
<ul>
  <li>IT Services: ROE 20–40%, ROCE 25–45% (high asset-light returns)</li>
  <li>FMCG: ROE 30–60%, ROCE 35–60% (iconic consumer brands)</li>
  <li>Pharmaceuticals: ROE 15–25%, ROCE 15–25%</li>
  <li>Cement: ROE 12–20%, ROCE 12–18%</li>
  <li>Banks: ROE 12–20% (leverage makes ROCE irrelevant for banks; use ROA instead)</li>
  <li>Steel: ROE 8–20% (cyclical, varies widely)</li>
</ul>

<h2>Red Flags in ROE/ROCE Analysis</h2>
<ul>
  <li>ROE declining for 3+ consecutive years: Eroding competitive advantage</li>
  <li>High ROE but very low ROCE: Company funded by high debt — dangerous</li>
  <li>One-time exceptional items boosting PAT: Adjustments needed for true ROE</li>
  <li>Goodwill from acquisitions inflating assets: Reduces apparent ROCE if goodwill is large</li>
</ul>
    `,
    faq: [
      {
        q: "What is a good ROE for an Indian company?",
        a: "15%+ is the general benchmark. 20%+ sustained over 5 years indicates a high-quality business. Below 12% suggests poor capital allocation unless the sector inherently has low margins (utilities, commodities).",
      },
      {
        q: "Why don't banks have a meaningful ROCE?",
        a: "Banks use deposits (essentially debt) as their primary input. Capital Employed includes customer deposits which are liabilities, making ROCE misleading. Use Return on Assets (ROA) and ROE for banks instead.",
      },
      {
        q: "Where can I find ROE and ROCE data for Indian stocks?",
        a: "IPOpulse's screener shows ROE and other fundamentals for listed companies. You can filter stocks by ROE minimum to find high-quality businesses.",
      },
    ],
  },

  // ─── Round 2 articles ─────────────────────────────────────────────────────
  {
    slug: "what-is-sensex",
    title: "What is Sensex? BSE Sensex Explained for Beginners",
    description:
      "Sensex is India's oldest stock market index. Learn what the Sensex measures, how it is calculated, which 30 companies are in it, and how it differs from Nifty 50.",
    readingTime: 4,
    publishedAt: "2026-04-25",
    relatedSlugs: ["nifty-50-explained", "pe-ratio", "what-is-market-cap"],
    content: `
<h2>What is Sensex?</h2>
<p>The <strong>Sensex</strong> (Sensitive Index) is India's oldest and most widely followed stock market index. It tracks 30 large, financially sound, and actively traded companies listed on the <strong>Bombay Stock Exchange (BSE)</strong>. The Sensex was launched on 1 January 1986 with a base value of 100 (base year 1978–79), making it one of the oldest indices in Asia.</p>
<p>When you hear news anchors say "the market rose 500 points today," they are almost always referring to the Sensex. It is the single most popular barometer of Indian stock market health.</p>

<h2>How is Sensex Calculated?</h2>
<p>The Sensex uses a <strong>free-float market capitalisation-weighted</strong> methodology:</p>
<ul>
  <li>Only shares available for public trading (not held by promoters, government, or strategic holders) are counted in the free-float market cap</li>
  <li>Companies with larger free-float market caps have higher index weightage</li>
  <li>The index value = (Sum of free-float market caps of 30 companies) / Base market cap × 100</li>
</ul>
<p>Reliance Industries, HDFC Bank, and Infosys typically have the highest weights (5–12% each) due to their large free-float market caps.</p>

<h2>Which 30 Companies are in Sensex?</h2>
<p>The BSE Index Committee selects Sensex constituents based on free-float market cap, trading frequency, and sector representation. As of 2026, Sensex includes companies like Reliance Industries, TCS, HDFC Bank, Infosys, ICICI Bank, HUL, Bharti Airtel, ITC, L&T, Kotak Mahindra Bank, Bajaj Finance, Sun Pharma, Maruti Suzuki, Titan, Wipro, and others across banking, IT, energy, FMCG, and auto sectors.</p>
<p>The list is reviewed semi-annually. Companies are replaced if they no longer meet criteria.</p>

<h2>Sensex vs Nifty 50 — Key Differences</h2>
<ul>
  <li><strong>Exchange:</strong> Sensex = BSE. Nifty 50 = NSE</li>
  <li><strong>Number of stocks:</strong> Sensex = 30. Nifty 50 = 50</li>
  <li><strong>Base year:</strong> Sensex = 1978–79. Nifty = 3 November 1995</li>
  <li><strong>Methodology:</strong> Both use free-float market cap weighting</li>
  <li><strong>Correlation:</strong> Very high (>0.99). They move almost identically on most trading days</li>
  <li><strong>Derivatives:</strong> Sensex futures/options trade on BSE. Nifty futures/options trade on NSE (far more liquid)</li>
</ul>

<h2>What is a "Sensex Point"?</h2>
<p>One Sensex point represents a change in the aggregate free-float market capitalisation of the 30 companies. At Sensex levels of 80,000–90,000, a 1% move equals approximately 800–900 points. In earlier years (Sensex at 5,000), a 1% move was only 50 points — so raw point movements are meaningless without context. Always use percentage change.</p>

<h2>Sensex Milestones</h2>
<ul>
  <li>1,000 — July 1990</li>
  <li>10,000 — February 2006</li>
  <li>30,000 — February 2015</li>
  <li>50,000 — January 2021</li>
  <li>80,000 — June 2024</li>
</ul>
<p>The journey from 0 to 10,000 took 30 years. The journey from 50,000 to 80,000 took just 3.5 years — reflecting India's economic acceleration and increased retail participation post-COVID.</p>
    `,
    faq: [
      { q: "Is Sensex or Nifty more important?", a: "Both are important but Nifty 50 is more commonly used by institutional investors and F&O traders due to NSE's higher liquidity. Sensex remains more popular in media and among retail investors who use BSE." },
      { q: "Can I invest in Sensex directly?", a: "Yes, via Sensex ETFs (like Sensex BeES on BSE) or Sensex index funds from AMCs like HDFC, SBI, or Mirae Asset. These track the Sensex performance with very low expense ratios." },
      { q: "What causes the Sensex to fall?", a: "Global risk-off sentiment, FII selling, rising interest rates (RBI hike), poor corporate earnings, geopolitical events, or domestic economic data misses can cause the Sensex to fall." },
    ],
  },
  {
    slug: "what-is-stop-loss",
    title: "What is Stop Loss in Stock Market? Types and How to Set It",
    description:
      "A stop loss is a risk management tool that automatically sells your shares at a predetermined price to limit losses. Learn the types of stop losses, how to set them, and common mistakes to avoid.",
    readingTime: 5,
    publishedAt: "2026-04-27",
    relatedSlugs: ["52-week-high-low", "what-are-futures-options", "pe-ratio"],
    content: `
<h2>What is a Stop Loss?</h2>
<p>A <strong>stop loss</strong> is a pre-set instruction to your broker to sell a stock automatically when its price falls to a specific level — your "stop price." It limits your loss on a trade to a defined amount, removing the need to monitor positions constantly.</p>
<p>Example: You buy a stock at ₹500. You set a stop loss at ₹450 (10% below purchase price). If the stock falls to ₹450, your broker automatically sells it — capping your loss at ₹50 per share regardless of further declines.</p>

<h2>Types of Stop Loss Orders in India</h2>
<p><strong>1. Stop Loss Market (SL-M) Order:</strong> When the trigger price is hit, the order executes at the best available market price. Guarantees execution but not the exact price — in fast-moving markets, you may get a worse price (slippage).</p>
<p><strong>2. Stop Loss Limit (SL) Order:</strong> When the trigger price is hit, a limit order is placed at your specified limit price. You control the execution price but risk non-execution if the stock gaps past your limit.</p>
<p><strong>3. Trailing Stop Loss:</strong> The stop price moves up automatically as the stock rises — maintaining a fixed distance (₹ or %). If the stock goes from ₹500 to ₹600 with a trailing stop of ₹50, the stop moves from ₹450 to ₹550. Protects gains while allowing the stock to run.</p>

<h2>How to Place a Stop Loss on NSE/BSE</h2>
<p>On most Indian brokers (Zerodha Kite, Groww, Upstox):</p>
<ul>
  <li>Select your stock → click Sell</li>
  <li>Choose order type: SL or SL-M</li>
  <li>Enter <strong>Trigger Price</strong> (when the stop activates) and <strong>Limit Price</strong> (for SL orders)</li>
  <li>For SL: Limit price is slightly below trigger (e.g., Trigger ₹450, Limit ₹448) to ensure execution</li>
</ul>

<h2>How to Determine Stop Loss Levels</h2>
<p>Several methods:</p>
<ul>
  <li><strong>Percentage-based:</strong> Set stop at 5–15% below entry. Simple but ignores stock volatility.</li>
  <li><strong>Support level-based:</strong> Place stop just below a key support level (previous low, 52-week low). More technical but more meaningful.</li>
  <li><strong>ATR-based (Average True Range):</strong> Set stop at 1.5–2× ATR below entry. Accounts for normal volatility — avoids being stopped out by routine price fluctuations.</li>
  <li><strong>Risk-based:</strong> Risk no more than 1–2% of your portfolio on any single trade. If risk per share is ₹50 (stop at ₹450 for ₹500 entry), and portfolio is ₹10 lakh with 1% risk = ₹10,000 max loss → buy only 200 shares.</li>
</ul>

<h2>Common Stop Loss Mistakes</h2>
<ul>
  <li><strong>Moving stop loss wider after being triggered:</strong> "I'll just wait a bit more" — defeats the purpose entirely</li>
  <li><strong>Placing stop too tight:</strong> Normal intraday volatility hits your stop before the trade can work</li>
  <li><strong>Not using stop loss:</strong> The most expensive mistake retail traders make. "I'll sell manually" rarely works under emotional pressure</li>
  <li><strong>Assuming stop loss = guaranteed price:</strong> Gap-down openings can breach your stop and execute at much lower prices</li>
</ul>

<h2>Stop Loss for Long-Term Investors</h2>
<p>Stop losses are primarily for traders. Long-term investors (3–10 year horizon) typically do not use stop losses — a 15% correction in a fundamentally sound company may be a buying opportunity, not a sell signal. For long-term portfolios, the "stop loss" is a fundamental review process — sell when the investment thesis breaks, not when the price dips.</p>
    `,
    faq: [
      { q: "Does a stop loss guarantee no loss?", a: "No. In gap-down scenarios (stock opens much lower than previous close), your stop loss triggers but executes at the opening price, which could be far below your stop price." },
      { q: "Should I use stop loss for mutual funds?", a: "No. Mutual funds are priced at end-of-day NAV, and stop loss orders don't apply. For mutual fund risk management, use asset allocation and rebalancing instead." },
      { q: "What is a mental stop loss?", a: "A mental stop loss is a pre-decided price in your head (not entered on the system) at which you commit to selling. It requires strict discipline since the system won't enforce it." },
    ],
  },
  {
    slug: "what-is-ebitda",
    title: "What is EBITDA? Why It Matters and Its Limitations",
    description:
      "EBITDA measures operating profitability before financing and accounting decisions. Learn how to calculate EBITDA, what EBITDA margin means, and when to use EV/EBITDA vs P/E.",
    readingTime: 5,
    publishedAt: "2026-04-29",
    relatedSlugs: ["pe-ratio", "what-is-roe-roce", "how-to-read-annual-report"],
    content: `
<h2>What is EBITDA?</h2>
<p><strong>EBITDA</strong> stands for <strong>Earnings Before Interest, Taxes, Depreciation, and Amortisation</strong>. It measures a company's core operating profitability — how much profit is generated from operations before accounting for how the business is financed (interest), tax jurisdiction (taxes), or accounting for asset wear-and-tear (depreciation/amortisation).</p>
<p>Formula:</p>
<ul>
  <li><strong>EBITDA = Net Profit + Interest + Taxes + Depreciation + Amortisation</strong></li>
  <li>Or alternatively: EBITDA = Revenue − Operating Expenses (excluding D&amp;A)</li>
</ul>

<h2>Why Strip Out Interest, Tax, D&A?</h2>
<ul>
  <li><strong>Interest:</strong> Depends on how much debt the company has — a capital structure choice, not an operating performance indicator</li>
  <li><strong>Taxes:</strong> Vary by jurisdiction and tax strategy — two identical businesses in different states may have different tax rates</li>
  <li><strong>Depreciation &amp; Amortisation:</strong> Non-cash charges — reflect historical spending on assets, not current cash generation</li>
</ul>
<p>By stripping these out, EBITDA allows better comparison of operating performance across companies with different capital structures, tax situations, or depreciation policies.</p>

<h2>EBITDA Margin</h2>
<p>EBITDA Margin = EBITDA / Revenue × 100. This shows what percentage of revenue becomes operating profit.</p>
<ul>
  <li>IT Services: 20–30% EBITDA margin (asset-light, high billing rates)</li>
  <li>FMCG: 15–25%</li>
  <li>Pharma: 18–28%</li>
  <li>Cement: 20–30%</li>
  <li>Retail / E-commerce: 5–15%</li>
  <li>Telecom: 40–50% (high D&amp;A from network assets)</li>
</ul>
<p>Compare EBITDA margins within the same sector — cross-sector comparison is often meaningless.</p>

<h2>EV/EBITDA — The Most Common EBITDA Valuation Ratio</h2>
<p>EV/EBITDA (Enterprise Value to EBITDA) is the primary valuation multiple for M&amp;A and capital-intensive sectors. It avoids the capital structure distortion of P/E:</p>
<ul>
  <li><strong>EV/EBITDA &lt; 10×:</strong> Typically undervalued for quality businesses</li>
  <li><strong>EV/EBITDA 10–20×:</strong> Fair to slightly expensive</li>
  <li><strong>EV/EBITDA &gt; 20×:</strong> Premium valuation — requires strong growth justification</li>
</ul>
<p>Indian consumer companies (HUL, Nestlé) often trade at 30–50× EV/EBITDA due to their premium brand strength and predictable cash flows.</p>

<h2>Limitations of EBITDA</h2>
<p>Warren Buffett famously called EBITDA a "fraudulent metric" in capital-intensive industries:</p>
<ul>
  <li><strong>Ignores capital expenditure (capex):</strong> A company spending ₹500 crore on machinery every year must replace that machinery — depreciation reflects this real cost. Stripping D&amp;A pretends capex doesn't happen.</li>
  <li><strong>Ignores working capital:</strong> EBITDA says nothing about how much cash is tied up in inventory and receivables</li>
  <li><strong>Not a cash flow measure:</strong> Free Cash Flow (FCF) = Operating Cash Flow − Capex is a better measure of actual cash generation than EBITDA</li>
  <li><strong>Easy to manipulate:</strong> Accounting choices on what constitutes "exceptional items" can shift EBITDA numbers</li>
</ul>
<p>For asset-light businesses (IT, consumer internet), EBITDA is more meaningful. For manufacturing, infrastructure, or telecom companies, always check Free Cash Flow and return on capital alongside EBITDA.</p>
    `,
    faq: [
      { q: "Is EBITDA the same as operating profit?", a: "Not exactly. Operating profit (EBIT) includes depreciation and amortisation. EBITDA adds those back. Operating profit = EBITDA − D&A. Both exclude interest and tax." },
      { q: "Where do I find EBITDA in Indian company filings?", a: "Indian companies typically report PBDIT (Profit Before Depreciation, Interest, and Tax) in their P&L — this is essentially EBITDA. You can also calculate it: PAT + Tax + Interest + D&A." },
      { q: "Why do startups always quote EBITDA profitability?", a: "Because EBITDA excludes depreciation on large asset investments (like server infrastructure) and stock-based compensation (amortisation of ESOPs). It presents a more flattering picture of operational efficiency. Always check actual net profit and free cash flow." },
    ],
  },
  {
    slug: "what-is-book-value",
    title: "What is Book Value of a Share? P/B Ratio Explained",
    description:
      "Book value per share is the net worth of a company divided by its shares. Learn how to calculate book value, what P/B ratio means, and when book value matters (and when it doesn't) in stock valuation.",
    readingTime: 4,
    publishedAt: "2026-05-01",
    relatedSlugs: ["pe-ratio", "what-is-roe-roce", "what-is-market-cap"],
    content: `
<h2>What is Book Value?</h2>
<p><strong>Book value</strong> is the accounting value of a company — what shareholders would theoretically receive if the company were liquidated today and all assets sold and liabilities paid. It equals:</p>
<ul>
  <li><strong>Book Value = Total Assets − Total Liabilities</strong></li>
  <li><strong>Book Value Per Share (BVPS) = Book Value / Shares Outstanding</strong></li>
</ul>
<p>Example: If a company has ₹1,000 crore in assets, ₹400 crore in liabilities, and 10 crore shares outstanding — Book Value = ₹600 crore; BVPS = ₹60 per share.</p>
<p>Book value is essentially the shareholders' equity on the balance sheet, also called <strong>Net Worth</strong> in Indian accounting terminology.</p>

<h2>Price-to-Book Ratio (P/B)</h2>
<p><strong>P/B = Market Price Per Share / Book Value Per Share</strong></p>
<ul>
  <li><strong>P/B &lt; 1:</strong> Stock trades below book value — implies market expects losses, or assets are overstated, or the business is deeply undervalued. Common in PSU banks, steel companies during downturns.</li>
  <li><strong>P/B = 1:</strong> Stock trades at book value — market values the company exactly at its net assets.</li>
  <li><strong>P/B &gt; 1:</strong> Market assigns a premium for brand value, earnings power, or growth — the normal state for quality businesses.</li>
  <li><strong>P/B 5–30×:</strong> Normal for quality consumer companies, IT firms with intangible assets (software, brands) not fully captured on balance sheet.</li>
</ul>

<h2>When P/B is Most Useful</h2>
<p>P/B is most relevant for <strong>asset-heavy, balance-sheet-driven businesses</strong>:</p>
<ul>
  <li><strong>Banks and NBFCs:</strong> Book value represents loan portfolio net of NPAs. ROE/P/B framework is the standard bank valuation methodology. Price / Adjusted Book = Price / (Equity − Gross NPA × (1 − provision coverage))</li>
  <li><strong>Manufacturing companies:</strong> Large fixed assets (plant, machinery, land) are central to the business</li>
  <li><strong>Real estate companies:</strong> Land bank and property inventory are key assets</li>
</ul>

<h2>When P/B is Less Useful</h2>
<p>For <strong>asset-light businesses</strong>, book value is a poor indicator of true value:</p>
<ul>
  <li>IT companies (TCS, Infosys): Their main asset is human capital — not on the balance sheet</li>
  <li>Consumer brands (HUL, Asian Paints): Brand value worth thousands of crores doesn't appear on the balance sheet</li>
  <li>Platform businesses: Network effects and user bases have immense value not captured in book value</li>
</ul>
<p>These companies routinely trade at P/B of 10–50× because earnings power far exceeds tangible asset value.</p>

<h2>Tangible Book Value</h2>
<p>Tangible Book Value = Book Value − Goodwill − Intangible Assets. Goodwill arises from acquisitions (you paid ₹500 crore for a business worth ₹200 crore on books → ₹300 crore goodwill). If goodwill needs to be written off (impaired), book value falls sharply. Always check goodwill as a percentage of total book value — very high goodwill means the acquisition premium may be at risk.</p>
    `,
    faq: [
      { q: "Can a stock be overvalued if P/B is less than 1?", a: "Yes. Low P/B could mean the company is genuinely undervalued, or it could reflect a value trap — the business is earning below its cost of capital and book value is deteriorating. Always check ROE alongside P/B." },
      { q: "What is 'adjusted book value' for banks?", a: "Adjusted book value subtracts unprovisioned NPAs (bad loans) from reported book value. It's a more conservative measure of a bank's real net worth after potential loan losses." },
      { q: "Where can I find book value data on IPOpulse?", a: "The stock screener and individual ticker pages on IPOpulse show P/B ratio and other fundamental ratios where available." },
    ],
  },
  {
    slug: "what-is-nps",
    title: "What is NPS (National Pension System)? Returns, Tax Benefits Explained",
    description:
      "NPS is India's government-backed pension scheme offering market-linked returns and strong tax benefits under Section 80C and 80CCD. Learn how NPS works, Tier 1 vs Tier 2, and whether it suits you.",
    readingTime: 5,
    publishedAt: "2026-05-03",
    relatedSlugs: ["sip-guide", "cagr-meaning", "what-is-mutual-fund"],
    content: `
<h2>What is the National Pension System (NPS)?</h2>
<p>The <strong>National Pension System (NPS)</strong> is a government-sponsored, market-linked retirement savings scheme regulated by the <strong>Pension Fund Regulatory and Development Authority (PFRDA)</strong>. It was initially launched for government employees in 2004 and opened to all citizens in 2009. NPS is one of India's lowest-cost investment options and offers significant tax advantages.</p>

<h2>How NPS Works</h2>
<p>You contribute to NPS regularly. Your money is invested by professional pension fund managers (SBI, LIC, HDFC, ICICI, Kotak, UTI, and others) in a mix of equities, government bonds, corporate bonds, and alternative assets. Returns are market-linked — not guaranteed. At retirement (age 60):</p>
<ul>
  <li>You can withdraw up to <strong>60% of the corpus as a lump sum</strong> — tax-free</li>
  <li>The remaining <strong>40% must be used to purchase an annuity</strong> (monthly pension) — annuity income is taxable</li>
</ul>

<h2>Tier 1 vs Tier 2 Account</h2>
<ul>
  <li><strong>Tier 1 (Pension Account):</strong> Mandatory for NPS enrollment. Strict lock-in until age 60 (partial withdrawals allowed after 3 years for specific needs: medical, education, house purchase). Tax benefits apply here.</li>
  <li><strong>Tier 2 (Savings Account):</strong> Optional, voluntary savings with no lock-in. Withdraw anytime. No special tax benefit (except for government employees). Useful as a liquid investment account with slightly lower costs than mutual funds.</li>
</ul>

<h2>NPS Asset Classes</h2>
<ul>
  <li><strong>Class E (Equity):</strong> Index funds replicating Nifty 50 and Nifty Next 50. Maximum 75% allocation in active choice, reduces to 50% after age 50.</li>
  <li><strong>Class C (Corporate Bonds):</strong> AA+ and above rated bonds. Moderate risk.</li>
  <li><strong>Class G (Government Bonds):</strong> Sovereign securities. Lowest risk.</li>
  <li><strong>Class A (Alternative Assets):</strong> REITs, InvITs. Maximum 5% allowed.</li>
</ul>

<h2>NPS Tax Benefits — Significant and Unique</h2>
<ul>
  <li><strong>Section 80C:</strong> Up to ₹1.5 lakh deduction per year (combined with PPF, ELSS, etc.)</li>
  <li><strong>Section 80CCD(1B):</strong> Additional ₹50,000 deduction exclusively for NPS — over and above Section 80C. This is a unique NPS benefit no other instrument offers.</li>
  <li><strong>Total deduction possible:</strong> ₹2 lakh per year (₹1.5 lakh under 80C + ₹50,000 under 80CCD(1B))</li>
  <li><strong>Employer contribution:</strong> If your employer contributes to NPS, up to 10% of salary (14% for central government) is exempt under 80CCD(2) — no monetary limit. This is the most powerful NPS benefit.</li>
</ul>

<h2>Historical NPS Returns (Approximate)</h2>
<ul>
  <li>Tier 1 Equity (Class E): 12–14% CAGR over 10 years</li>
  <li>Corporate Bond (Class C): 7–8% CAGR</li>
  <li>Government Bond (Class G): 6–7.5% CAGR</li>
</ul>
<p>NPS equity funds track Nifty 50/Next 50 passively — returns closely mirror Nifty 50 CAGR minus a very small expense ratio (0.01–0.09%, among the lowest in the world).</p>

<h2>NPS vs PPF vs ELSS</h2>
<ul>
  <li><strong>PPF:</strong> Guaranteed 7.1% return, tax-free, 15-year lock-in. No market risk. Best for very conservative investors.</li>
  <li><strong>ELSS:</strong> Market-linked, 3-year lock-in, no restriction on withdrawal after lock-in. Better liquidity than NPS.</li>
  <li><strong>NPS:</strong> Market-linked, longest lock-in (until 60), but highest tax benefit. Best for investors who want a structured retirement corpus with tax efficiency.</li>
</ul>
    `,
    faq: [
      { q: "Can I withdraw from NPS before 60?", a: "Partial withdrawals (up to 25% of your contribution) are allowed after 3 years for specified purposes: education, marriage, house purchase, or medical treatment. Premature exit before 60 requires 80% to go into annuity (only 20% lump sum)." },
      { q: "Is NPS good for high-income earners?", a: "Yes. The ₹50,000 exclusive deduction under 80CCD(1B) is very valuable for those in 30% bracket — it saves ₹15,000 in tax per year. Employer contributions under 80CCD(2) with no limit make corporate NPS extremely tax-efficient." },
      { q: "Where do I open an NPS account?", a: "Via eNPS portal (enps.nsdl.com), your bank's internet banking, or any POP (Point of Presence) registered with PFRDA. Aadhaar-based eNPS takes 10–15 minutes." },
    ],
  },
  {
    slug: "what-is-reit",
    title: "What is a REIT? Real Estate Investment Trust in India Explained",
    description:
      "REITs allow retail investors to invest in commercial real estate and earn rental income without buying property. Learn about India's listed REITs, minimum investment, dividend yield, and tax treatment.",
    readingTime: 5,
    publishedAt: "2026-05-05",
    relatedSlugs: ["what-is-dividend", "what-is-mutual-fund", "pe-ratio"],
    content: `
<h2>What is a REIT?</h2>
<p>A <strong>Real Estate Investment Trust (REIT)</strong> is a company that owns, operates, or finances income-producing commercial real estate — offices, retail malls, warehouses, or data centres. REITs pool money from investors and distribute at least 90% of their rental income as dividends to unitholders. They trade on stock exchanges like regular stocks.</p>
<p>REITs allow retail investors to earn regular rental income from commercial real estate — an asset class previously accessible only to institutions or ultra-high-net-worth individuals.</p>

<h2>REITs Listed in India (as of 2026)</h2>
<ul>
  <li><strong>Embassy Office Parks REIT:</strong> India's first REIT (2019). 45+ million sq ft of office space across Bengaluru, Mumbai, Pune, and NCR. Tenants include Microsoft, JPMorgan, Google.</li>
  <li><strong>Mindspace Business Parks REIT:</strong> 32+ million sq ft office. Properties in Mumbai, Hyderabad, Pune, Chennai.</li>
  <li><strong>Brookfield India REIT:</strong> 14+ million sq ft of Grade A offices in Mumbai, Gurugram, Noida, Kolkata.</li>
  <li><strong>Nexus Select Trust REIT:</strong> India's first retail REIT (2023). 17 retail malls across 14 cities.</li>
</ul>

<h2>Minimum Investment in Indian REITs</h2>
<p>SEBI reduced the minimum lot for REITs from 200 units to 1 unit in 2022, making REITs accessible to retail investors. At a unit price of ₹300–₹400 (typical range), you can invest for as little as ₹300–₹400 — equivalent to any other NSE/BSE listed stock.</p>

<h2>How REITs Generate Returns</h2>
<ul>
  <li><strong>Distributions (like dividends):</strong> Quarterly rental income distributions — typically 5–8% distribution yield on cost</li>
  <li><strong>Capital appreciation:</strong> If property values and rentals grow over time, REIT unit prices appreciate</li>
  <li><strong>Total return:</strong> Embassy REIT has delivered approximately 8–12% total return annually since listing (distributions + price appreciation)</li>
</ul>

<h2>REIT Distributions — Tax Treatment</h2>
<p>REIT distributions have multiple components with different tax treatment:</p>
<ul>
  <li><strong>Interest income component:</strong> Taxed at slab rate</li>
  <li><strong>Dividend component:</strong> Taxed at slab rate</li>
  <li><strong>Repayment of SPV loan component:</strong> Tax-free</li>
  <li><strong>Return of capital:</strong> Reduces cost basis, taxed on final sale</li>
</ul>
<p>Overall, approximately 30–50% of REIT distributions are typically tax-free or tax-efficient, making the effective yield higher than stated.</p>

<h2>InvIT — Infrastructure Investment Trust</h2>
<p>InvITs are similar to REITs but invest in infrastructure assets: toll roads, power transmission lines, gas pipelines, renewable energy. Listed InvITs in India include IRB InvIT Fund, Powergrid InvIT, Indigrid, and National Highways Infra Trust. They offer higher yields (8–12%) but also higher risk than REITs.</p>

<h2>REIT vs Real Estate Direct Investment</h2>
<ul>
  <li><strong>Liquidity:</strong> REITs trade on exchange (sell in seconds); property takes months to sell</li>
  <li><strong>Entry amount:</strong> REITs from ₹300; property requires ₹50 lakh+</li>
  <li><strong>Maintenance:</strong> REITs are passive; property requires active management</li>
  <li><strong>Returns:</strong> Grade A commercial REITs often outperform residential property on rental yield</li>
  <li><strong>Diversification:</strong> One REIT gives exposure to 30–50 properties across cities</li>
</ul>
    `,
    faq: [
      { q: "Are REITs safe investments?", a: "REITs carry risk — unit prices fluctuate with property market conditions and interest rates. Rising interest rates typically compress REIT valuations (higher rates = lower property values + higher borrowing costs). They are safer than individual stocks but riskier than debt funds." },
      { q: "Do REITs pay monthly income?", a: "Indian REITs typically distribute quarterly (every 3 months), not monthly. The distribution amount varies each quarter based on rental collections." },
      { q: "How do I buy REITs in India?", a: "REITs trade on NSE and BSE like regular stocks. You can buy through any stock broker using your existing demat account. Search for 'EMBASSY', 'MINDSPACE', 'BIRET', or 'NEXUS' on your broker's platform." },
    ],
  },
  {
    slug: "what-is-index-fund",
    title: "What is an Index Fund? Why Low-Cost Index Investing Works in India",
    description:
      "Index funds passively track market indices like Nifty 50 with very low cost. Learn why index funds beat most active funds over the long run, how to choose one, and the best Nifty 50 index funds in India.",
    readingTime: 5,
    publishedAt: "2026-05-06",
    relatedSlugs: ["what-is-mutual-fund", "nifty-50-explained", "sip-guide"],
    content: `
<h2>What is an Index Fund?</h2>
<p>An <strong>index fund</strong> is a mutual fund or ETF that tracks the performance of a market index — like Nifty 50, Sensex, Nifty Next 50, or Nifty Midcap 150. The fund simply buys the same stocks in the same proportions as the index. No fund manager makes stock-picking decisions — it is <strong>passive investing</strong>.</p>
<p>Because there is no active research or frequent trading, index funds have dramatically lower expense ratios (0.1–0.2%) compared to actively managed funds (1–2%). This seemingly small difference compounds into lakhs of rupees over 20–30 years.</p>

<h2>Why Do Index Funds Beat Most Active Funds?</h2>
<p>SEBI data and SPIVA (S&P Indices vs Active) reports consistently show that 70–85% of actively managed large-cap funds underperform their benchmark index over 10-year periods, especially after expenses. Reasons:</p>
<ul>
  <li><strong>Expense ratio drag:</strong> A 1.5% annual fee is a massive headwind to beat in efficient markets</li>
  <li><strong>Market efficiency:</strong> Large-cap Indian stocks are extensively covered — it's very hard to consistently find mispriced stocks</li>
  <li><strong>Manager risk:</strong> Fund managers can retire, leave, or have bad years — index funds have no manager dependency</li>
  <li><strong>Tax efficiency:</strong> Low turnover = fewer capital gains events = lower tax drag</li>
</ul>

<h2>Best Nifty 50 Index Funds in India (2026)</h2>
<ul>
  <li>UTI Nifty 50 Index Fund — Expense ratio: ~0.18% (regular), ~0.10% (direct)</li>
  <li>HDFC Nifty 50 Index Fund — Low tracking error</li>
  <li>SBI Nifty Index Fund — Largest AUM</li>
  <li>Nippon India Nifty 50 Index Fund</li>
  <li>Mirae Asset Nifty 50 Index Fund</li>
</ul>
<p>For ETFs: Nifty BeES (Nippon), UTI Nifty 50 ETF, HDFC Nifty 50 ETF. ETFs have the lowest expense ratios (0.04–0.07%) but require a demat account and brokerage commissions per trade.</p>

<h2>Index Fund vs ETF — Which to Choose?</h2>
<ul>
  <li><strong>Index Fund (MF):</strong> Invest in any amount (even ₹100/month via SIP). No demat needed. NAV-based execution (end of day price). Direct plan available at very low cost.</li>
  <li><strong>ETF:</strong> Slightly cheaper expense ratio. Real-time pricing. Need demat + broker. Must buy whole units. Can have liquidity issues in smaller ETFs. Better for large lumpsum investors.</li>
</ul>
<p>For most retail investors doing monthly SIPs, <strong>Direct plan index mutual fund</strong> (not ETF) is the better choice due to convenience and SIP capability.</p>

<h2>Key Indices Available for Index Funds in India</h2>
<ul>
  <li><strong>Nifty 50:</strong> Top 50 large-cap companies. Best starting point for beginners.</li>
  <li><strong>Nifty Next 50:</strong> Companies ranked 51–100 by free-float market cap. More volatile but higher long-term return potential.</li>
  <li><strong>Nifty Midcap 150:</strong> Mid-cap index fund. Higher risk/return than Nifty 50.</li>
  <li><strong>Nifty Total Market:</strong> Covers large, mid, and small cap in one fund. True market-cap-weighted exposure to all of India.</li>
  <li><strong>Nasdaq 100:</strong> US tech giants (Apple, Microsoft, Nvidia). Available via Indian AMCs for international diversification.</li>
</ul>

<h2>The Boring Advantage of Index Funds</h2>
<p>Index funds never have explosive 50%+ single-year returns like some small-cap funds do — but they never have catastrophic manager-induced failures either. The boring consistency of tracking the market beats most alternatives. Warren Buffett's famous bet: he wagered that a Vanguard S&P 500 index fund would beat any actively managed hedge fund basket over 10 years. He won decisively.</p>
    `,
    faq: [
      { q: "Will an index fund lose money?", a: "Yes, in market downturns. Nifty 50 fell 38% in 2008, 26% in 2020. But it recovered and made new highs within 1–2 years. Over any 10-year SIP period in Indian markets, the probability of negative returns has historically been very low." },
      { q: "Is Nifty 50 index fund safe?", a: "It is market-risk safe — no fund manager risk, no concentration risk, no credit risk. It is not capital-guarantee safe — prices fluctuate daily. For capital protection, use FDs or PPF instead." },
      { q: "Should I only invest in index funds?", a: "Many experienced investors (including Sebi-registered advisors) recommend a core index fund portfolio (70–80%) with a small satellite allocation to select active funds or direct stocks. Beginners are often advised to start with 100% index funds." },
    ],
  },
  {
    slug: "debt-to-equity-ratio",
    title: "What is Debt-to-Equity Ratio? How to Analyse Company Debt",
    description:
      "Debt-to-equity ratio (D/E) measures how much debt a company uses relative to shareholder equity. Learn what a good D/E ratio is for Indian companies, sector benchmarks, and red flags to watch for.",
    readingTime: 5,
    publishedAt: "2026-05-07",
    relatedSlugs: ["what-is-roe-roce", "pe-ratio", "how-to-read-annual-report"],
    content: `
<h2>What is Debt-to-Equity Ratio?</h2>
<p>The <strong>Debt-to-Equity (D/E) ratio</strong> measures how much of a company's financing comes from debt relative to shareholders' equity (net worth). It shows how leveraged the company is:</p>
<ul>
  <li><strong>D/E Ratio = Total Debt / Shareholders' Equity</strong></li>
  <li>Total Debt = Short-term borrowings + Long-term borrowings (from balance sheet)</li>
</ul>
<p>Example: A company with ₹500 crore debt and ₹1,000 crore equity has D/E = 0.5×. For every ₹1 of equity, the company has ₹0.50 of debt.</p>

<h2>Interpreting D/E Ratio</h2>
<ul>
  <li><strong>D/E = 0:</strong> Debt-free company. No financial risk from borrowing. Common in IT companies (TCS, Infosys, HCL Tech).</li>
  <li><strong>D/E 0–0.5×:</strong> Very low leverage. Conservative, low financial risk.</li>
  <li><strong>D/E 0.5–1.5×:</strong> Moderate leverage. Acceptable for most sectors.</li>
  <li><strong>D/E 1.5–3×:</strong> High leverage. Acceptable for capital-intensive sectors (infra, power, telecom). Risky for consumer or technology companies.</li>
  <li><strong>D/E &gt; 3×:</strong> Very high leverage. Interest payments can strain profitability. Risk of default in downturns.</li>
</ul>

<h2>Sector-Specific D/E Benchmarks (India)</h2>
<p>D/E ratios must be compared within the same sector — what's normal in one industry is dangerous in another:</p>
<ul>
  <li><strong>IT Services:</strong> 0–0.1× (nearly debt-free)</li>
  <li><strong>FMCG:</strong> 0–0.5×</li>
  <li><strong>Pharma:</strong> 0.2–0.8×</li>
  <li><strong>Automobile:</strong> 0.5–1.5×</li>
  <li><strong>Cement:</strong> 0.3–1.5×</li>
  <li><strong>Power/Infrastructure:</strong> 2–5× (high but normal — long-duration assets funded by long-term debt)</li>
  <li><strong>Banks/NBFCs:</strong> D/E is not meaningful (their "debt" is customer deposits — their product). Use leverage ratio and Capital Adequacy Ratio (CAR) instead.</li>
</ul>

<h2>Interest Coverage Ratio — The Partner Metric</h2>
<p>D/E alone doesn't tell you if the company can afford its debt. Use the <strong>Interest Coverage Ratio</strong> alongside:</p>
<ul>
  <li><strong>Interest Coverage = EBIT / Interest Expense</strong></li>
  <li>Above 3×: Comfortable — earnings cover interest 3 times over</li>
  <li>Below 1.5×: Dangerous — small earnings decline could trigger default</li>
</ul>
<p>A company can have high D/E but strong interest coverage (infrastructure companies with predictable cash flows). Conversely, low D/E with poor coverage is also risky (if EBIT is volatile).</p>

<h2>Net Debt vs Gross Debt</h2>
<p>Always check <strong>Net Debt = Total Debt − Cash &amp; Cash Equivalents</strong>. A company with ₹1,000 crore debt but ₹800 crore cash has Net Debt of only ₹200 crore — effectively low leverage. Many cash-rich companies appear highly indebted on gross D/E but are actually conservatively financed. Net D/E gives a truer picture.</p>

<h2>D/E Red Flags to Watch</h2>
<ul>
  <li><strong>Rapidly increasing D/E:</strong> Company borrowing faster than growing equity — investigate why</li>
  <li><strong>Short-term debt funding long-term assets:</strong> Refinancing risk — company must keep rolling over loans</li>
  <li><strong>Pledged promoter shares:</strong> If promoters have pledged shares to raise personal loans, corporate D/E may understate true leverage</li>
  <li><strong>Off-balance sheet debt:</strong> Lease obligations (now on balance sheet post Ind AS 116) and guarantees for subsidiaries</li>
</ul>
    `,
    faq: [
      { q: "Is zero debt always good?", a: "Not necessarily. Conservative use of debt (at interest rates below return on capital) actually enhances equity returns — this is called financial leverage. Completely debt-free companies may be leaving value on the table if they have stable cash flows." },
      { q: "How do I find D/E ratio on IPOpulse?", a: "The stock screener on IPOpulse shows D/E ratio as a filter and display column. Individual company ticker pages also show key ratios." },
      { q: "Should I avoid all high-D/E companies?", a: "Not automatically. Infrastructure, power, and telecom companies inherently carry high debt. Evaluate whether the interest coverage is strong and cash flows are stable enough to service debt comfortably." },
    ],
  },
  {
    slug: "how-to-invest-in-gold",
    title: "How to Invest in Gold in India — Digital vs Physical vs ETF vs SGB",
    description:
      "Comparing all ways to invest in gold in India: physical gold, digital gold, gold ETFs, gold mutual funds, and Sovereign Gold Bonds (SGB). Tax treatment, costs, and which option suits different investors.",
    readingTime: 5,
    publishedAt: "2026-05-08",
    relatedSlugs: ["sip-guide", "what-is-mutual-fund", "cagr-meaning"],
    content: `
<h2>Why Invest in Gold?</h2>
<p>Gold has three roles in an Indian investment portfolio: inflation hedge, currency depreciation protection, and crisis insurance. When equity markets crash and the Indian rupee weakens, gold typically rises — providing a natural portfolio buffer. Most financial planners recommend 5–15% of portfolio in gold as a strategic allocation, not a primary wealth builder.</p>
<p>Over the long term (20 years), gold in India has delivered approximately 10–12% CAGR (including rupee depreciation against USD). This is comparable to Nifty 50 returns but with very different risk patterns.</p>

<h2>Option 1: Physical Gold (Jewellery / Coins / Bars)</h2>
<ul>
  <li><strong>Pros:</strong> Tangible, cultural comfort, no counterparty risk</li>
  <li><strong>Cons:</strong> Making charges (8–25% for jewellery — a massive drag on returns), storage/insurance cost, impurity risk, not easily liquidated at spot price</li>
  <li><strong>Best for:</strong> Purchase for consumption (weddings, ceremonies), not investment</li>
</ul>

<h2>Option 2: Digital Gold</h2>
<p>Offered by PhonePe, Paytm, Google Pay via MMTC-PAMP or SafeGold. You buy fractional gold digitally; physical gold stored in vault on your behalf.</p>
<ul>
  <li><strong>Pros:</strong> Small amounts (₹1), convenient, instant</li>
  <li><strong>Cons:</strong> Not regulated by SEBI or RBI (regulatory grey area), storage fees vary, maximum 5-year holding on some platforms, counterparty risk</li>
  <li><strong>Best for:</strong> Small gift purchases. Not ideal as long-term investment due to regulatory uncertainty.</li>
</ul>

<h2>Option 3: Gold ETFs</h2>
<p>Gold ETFs track domestic gold prices and trade on NSE/BSE like stocks. Each unit = 1 gram of gold (approximately). Backed by physical gold held by custodian.</p>
<ul>
  <li><strong>Pros:</strong> SEBI regulated, transparent pricing, high liquidity, no physical storage</li>
  <li><strong>Cons:</strong> Need demat account, brokerage costs, expense ratio 0.5–0.8%</li>
  <li><strong>Tax:</strong> LTCG (held 24+ months): 12.5%. STCG: slab rate. (Post July 2024 budget)</li>
  <li><strong>Best for:</strong> Investors with demat account wanting gold exposure</li>
</ul>

<h2>Option 4: Gold Mutual Funds (Fund of Funds)</h2>
<p>Invest in Gold ETFs through a mutual fund structure. Allows SIP without needing a demat account.</p>
<ul>
  <li><strong>Pros:</strong> SIP capability from ₹100, no demat needed</li>
  <li><strong>Cons:</strong> Higher expense ratio (0.1–0.2% fund + underlying ETF 0.5–0.8% = total 0.6–1%)</li>
  <li><strong>Tax:</strong> Same as Gold ETF</li>
  <li><strong>Best for:</strong> Investors wanting monthly SIP into gold without demat account</li>
</ul>

<h2>Option 5: Sovereign Gold Bonds (SGB) — Usually the Best Option</h2>
<p>Issued by the Reserve Bank of India on behalf of the Government of India. Denominated in grams of gold.</p>
<ul>
  <li><strong>Pros:</strong> 2.5% annual interest (taxable) PLUS gold price appreciation</li>
  <li><strong>Capital gains completely exempt if held to maturity (8 years)</strong> — the biggest advantage</li>
  <li>No storage risk, no making charges, government-guaranteed</li>
  <li>Can be sold on exchange before maturity (but capital gains apply)</li>
  <li><strong>Cons:</strong> 8-year maturity (5-year lock-in with early exit every 6 months from 5th year), limited issuance windows, secondary market liquidity is poor</li>
</ul>
<p>For long-term investors (5–8 year horizon), SGB is almost always the best gold investment in India — it offers gold returns + 2.5% extra interest + zero tax on maturity proceeds.</p>

<h2>Note on SGB availability:</h2>
<p>The Government of India paused fresh SGB issuance in 2024–25 due to high interest cost. Existing SGBs trade on NSE/BSE. Check with your broker for availability and whether new tranches are announced.</p>
    `,
    faq: [
      { q: "Is gold a good investment for wealth building?", a: "Gold is a store of value and hedge, not a wealth builder. Over very long periods, equities dramatically outperform gold. Use gold for portfolio protection (5–15% allocation), not as your primary wealth-building asset." },
      { q: "Can I convert SGB to physical gold at maturity?", a: "No. SGBs are redeemed in cash at prevailing gold price on maturity date. You receive the rupee equivalent of your gold holding." },
      { q: "Are gold ETFs better than digital gold?", a: "Yes, for investment purposes. Gold ETFs are SEBI-regulated, have clear tax treatment, and physical gold backing is audited. Digital gold's regulatory framework is less clear." },
    ],
  },
  {
    slug: "market-holidays-2026",
    title: "NSE BSE Market Holidays 2026 — Complete List of Stock Market Holidays",
    description:
      "Complete list of NSE and BSE trading holidays for 2026. Know which dates the Indian stock market will be closed for settlement and trading, including Saturday and Sunday market sessions.",
    readingTime: 3,
    publishedAt: "2026-01-01",
    relatedSlugs: ["what-is-sensex", "nifty-50-explained", "fii-dii-guide"],
    content: `
<h2>NSE/BSE Market Holidays 2026</h2>
<p>The <strong>National Stock Exchange (NSE)</strong> and <strong>Bombay Stock Exchange (BSE)</strong> follow the same holiday calendar, issued annually by the exchanges. The Indian stock market is typically closed on 10–14 trading days per year, in addition to all Saturdays and Sundays.</p>
<p>Below is the official list of NSE/BSE market holidays for 2026. On these days, no equity trading, F&O trading, or settlement takes place on the main cash and derivatives segments.</p>

<h2>2026 NSE/BSE Market Holidays (Equity Segment)</h2>
<ul>
  <li><strong>26 Jan (Mon) — Republic Day</strong></li>
  <li><strong>19 Feb (Thu) — Chhatrapati Shivaji Maharaj Jayanti</strong></li>
  <li><strong>26 Feb (Thu) — Mahashivratri</strong></li>
  <li><strong>20 Mar (Fri) — Holi</strong></li>
  <li><strong>2 Apr (Thu) — Ram Navami</strong></li>
  <li><strong>3 Apr (Fri) — Good Friday</strong></li>
  <li><strong>14 Apr (Tue) — Dr. Baba Saheb Ambedkar Jayanti / Mahavir Jayanti</strong></li>
  <li><strong>1 May (Fri) — Maharashtra Day / May Day</strong></li>
  <li><strong>15 Aug (Sat) — Independence Day</strong> (Saturday — exchange closed)</li>
  <li><strong>27 Aug (Thu) — Ganesh Chaturthi</strong></li>
  <li><strong>2 Oct (Fri) — Gandhi Jayanti / Dussehra</strong></li>
  <li><strong>22 Oct (Thu) — Diwali Laxmi Puja (Muhurat Trading)</strong> — special 60-minute muhurat session in the evening</li>
  <li><strong>23 Oct (Fri) — Diwali Balipratipada</strong></li>
  <li><strong>25 Nov (Wed) — Gurunanak Jayanti</strong></li>
  <li><strong>25 Dec (Fri) — Christmas</strong></li>
</ul>
<p>Note: The exact holiday list is issued by NSE/BSE each year and subject to change. Always verify with the exchange website (nseindia.com or bseindia.com) for the official notification before important trading decisions.</p>

<h2>Special Market Sessions</h2>
<p><strong>Muhurat Trading (Diwali):</strong> NSE and BSE conduct a special 60-minute evening trading session on Diwali (Laxmi Puja day) — typically 6:00–7:00 PM IST. Despite the market holiday, this symbolic session celebrates the new financial year in the Hindu calendar. Volume is low but sentiment-rich. Many investors make small equity purchases during Muhurat for auspicious reasons.</p>

<h2>Commodity and Currency Market Holidays</h2>
<p>MCX (commodity futures) and forex segments may have different trading windows and holiday calendars from equity markets. MCX typically trades Monday–Saturday with extended evening hours (up to 11:30 PM for metals and energy). Check MCX website for their specific holiday list.</p>

<h2>Pre-Market and Post-Market Sessions</h2>
<ul>
  <li><strong>Pre-open session:</strong> 9:00 AM – 9:15 AM (order collection and price discovery)</li>
  <li><strong>Normal market:</strong> 9:15 AM – 3:30 PM</li>
  <li><strong>Post-close session:</strong> 3:40 PM – 4:00 PM (closing price orders for delivery)</li>
</ul>

<h2>Settlement Calendar</h2>
<p>Under T+1 settlement (since January 2023), shares bought on a trading day are credited to your demat account the next business day. If you buy on a Friday before a Monday holiday, shares arrive in your demat on Tuesday (skipping the Monday holiday). SEBI may review moving to T+0 or instantaneous settlement in 2026–27.</p>
    `,
    faq: [
      { q: "Do all exchanges follow the same market holiday list?", a: "NSE and BSE equity segments follow the same holiday list. MCX (commodity) and BSE/NSE currency segments may have slightly different schedules — especially for commodity-specific festivals. Always verify on the respective exchange website." },
      { q: "What happens to pending SIP deductions on market holidays?", a: "Most AMCs process SIPs on the next trading day if the SIP date falls on a market holiday. Your investment is processed at the NAV of the next business day." },
      { q: "Can I place orders on market holidays?", a: "Some brokers accept after-market orders (AMO) even on holidays — these orders go into the system but execute on the next trading day when the market opens." },
    ],
  },
  // ─── Round 3 articles ─────────────────────────────────────────────────────
  {
    slug: "how-to-invest-in-stocks-beginners",
    title: "How to Invest in Stocks in India — Complete Beginner's Guide 2026",
    description: "A step-by-step guide for first-time stock market investors in India. Open a demat account, choose a broker, understand order types, and build your first portfolio.",
    readingTime: 7,
    publishedAt: "2026-05-10",
    relatedSlugs: ["what-is-demat-account", "pe-ratio", "what-is-mutual-fund"],
    content: `
<h2>Why Invest in Stocks?</h2>
<p>Over any 15–20 year period, Indian equities (as measured by Nifty 50) have delivered approximately 12–14% CAGR — significantly outpacing fixed deposits (6–7%), PPF (7.1%), and inflation (5–6%). Investing in stocks is not speculation — it is buying ownership in real businesses that grow over time.</p>
<p>However, the stock market carries real risk. Prices fall — sometimes sharply. The Nifty 50 fell 38% in 2008 and 26% in March 2020. Understanding this before you invest is essential.</p>

<h2>Step 1: Open a Demat + Trading Account</h2>
<p>You need two linked accounts — a demat account (holds your shares) and a trading account (places buy/sell orders). Most brokers open both simultaneously. Paperless process via Aadhaar OTP takes 15–30 minutes.</p>
<p>Choose a broker based on your needs:</p>
<ul>
  <li><strong>Beginners:</strong> Groww — zero AMC, simple app, ₹20/order</li>
  <li><strong>Active investors:</strong> Zerodha — best platform (Kite), ₹0 for delivery equity</li>
  <li><strong>F&O traders:</strong> Dhan or Upstox — TradingView integrated, free API</li>
</ul>
<p>Documents needed: PAN card, Aadhaar, bank account details, photo, signature.</p>

<h2>Step 2: Start With Mutual Funds, Not Direct Stocks</h2>
<p>Most financial planners recommend that beginners start with a Nifty 50 index fund via SIP before buying individual stocks. Why? Because picking individual stocks requires deep research, time, and experience. A Nifty 50 index fund gives you instant diversification across 50 large companies at a cost of 0.1–0.2% per year.</p>
<p>Once you have 6–12 months of market experience (watching how prices move, understanding news impact), graduate to individual stocks.</p>

<h2>Step 3: Understand Order Types Before Trading</h2>
<ul>
  <li><strong>Market Order:</strong> Buy/sell at the best available price right now. Fast execution, but price not guaranteed during volatile sessions.</li>
  <li><strong>Limit Order:</strong> Buy only if price falls to ₹X, sell only if price rises to ₹Y. You control the price but not the execution timing.</li>
  <li><strong>Stop Loss Order (SL-M):</strong> Automatically sell if price falls to your stop price. Essential for risk management.</li>
  <li><strong>After Market Order (AMO):</strong> Place orders outside trading hours (9:15 AM – 3:30 PM) — executes at next session's open.</li>
</ul>

<h2>Step 4: Pick Your First Stocks</h2>
<p>For beginners, the safest starting stocks are blue-chip, well-understood businesses in Nifty 50 with:</p>
<ul>
  <li>Market cap &gt; ₹50,000 crore (large, liquid, less volatile)</li>
  <li>Consistent profits for 5+ years</li>
  <li>Low debt (D/E ratio below 1 for non-financial companies)</li>
  <li>ROE above 15% consistently</li>
  <li>Business you understand and use daily</li>
</ul>
<p>Examples: HDFC Bank (banking), TCS (IT), HUL (consumer goods), Reliance (conglomerate), Sun Pharma (pharma). These are not recommendations — research each before investing.</p>

<h2>Step 5: Apply the Core Investing Rules</h2>
<ul>
  <li><strong>Diversify:</strong> Never put more than 10% of your equity portfolio in one stock. Own 15–25 companies across at least 5 sectors.</li>
  <li><strong>Never invest money you need in 1–3 years:</strong> Keep emergency fund in FD/liquid funds. Only invest long-term money in equities.</li>
  <li><strong>Don't check prices daily:</strong> Checking portfolio every day increases anxiety and leads to impulsive selling. Review quarterly.</li>
  <li><strong>Ignore tips:</strong> WhatsApp tips, YouTube recommendations, and Twitter stock calls are dangerous. Do your own research.</li>
  <li><strong>Start small:</strong> Begin with ₹5,000–₹10,000. Learn by doing. Increase as you gain confidence.</li>
</ul>

<h2>Step 6: Tax on Stock Profits</h2>
<ul>
  <li><strong>Short-Term Capital Gains (STCG):</strong> Sold within 1 year → taxed at 20%</li>
  <li><strong>Long-Term Capital Gains (LTCG):</strong> Held 1+ year → taxed at 12.5% on gains above ₹1.25 lakh per year</li>
  <li><strong>Dividends:</strong> Taxed at your income slab rate. TDS of 10% deducted by company.</li>
</ul>
<p>Use IPOpulse's Capital Gains calculator at /calculators/capital-gains to estimate tax on your investments.</p>
    `,
    faq: [
      { q: "How much money do I need to start investing in stocks?", a: "You can start with as little as ₹100 in mutual funds (SIP) or the cost of 1 share of any stock (which can be as low as ₹10 for penny stocks or ₹50,000 for MRF). Practically, starting with ₹5,000–₹10,000 gives you enough to buy 1–2 shares of decent companies." },
      { q: "Is it safe to invest in stocks in India?", a: "Stock markets are regulated by SEBI. Your shares are held in demat accounts with CDSL/NSDL — not at risk of broker fraud. However, stock prices can and do fall. The 'safety' depends on which stocks you buy, diversification, and your investment horizon." },
      { q: "Should I use a full-service broker or discount broker?", a: "For most retail investors, discount brokers (Zerodha, Groww, Upstox) offer everything needed at lower cost. Full-service brokers (ICICI Direct, HDFC Securities) make sense only if you need research reports, relationship manager support, or a 3-in-1 linked account." },
    ],
  },
  {
    slug: "what-is-circuit-limit",
    title: "What is Circuit Limit in Stock Market? Upper & Lower Circuit Explained",
    description: "Circuit limits prevent extreme stock price moves in a single day. Learn what upper circuit, lower circuit, and market-wide circuit breakers mean for Indian stocks on NSE/BSE.",
    readingTime: 4,
    publishedAt: "2026-05-10",
    relatedSlugs: ["what-is-stop-loss", "52-week-high-low", "how-to-invest-in-stocks-beginners"],
    content: `
<h2>What is a Circuit Limit?</h2>
<p>A <strong>circuit limit</strong> (also called price band or circuit breaker) is the maximum percentage a stock's price can move — up or down — in a single trading session. Once a stock hits its upper or lower circuit, trading is either halted or restricted to prevent panic buying or selling.</p>
<p>Circuit limits are set by SEBI and enforced by NSE and BSE. They exist to protect retail investors from extreme price manipulation and to give the market time to absorb new information rationally.</p>

<h2>Price Bands for Individual Stocks</h2>
<p>SEBI assigns individual stocks to different circuit filter categories based on trading activity, liquidity, and governance quality:</p>
<ul>
  <li><strong>No circuit (for derivatives-eligible stocks):</strong> Nifty 50 and most F&O stocks have no daily circuit limit — but still have market-wide circuit breakers (see below)</li>
  <li><strong>20% circuit:</strong> Most liquid non-F&O stocks on NSE/BSE</li>
  <li><strong>10% circuit:</strong> Mid-cap stocks with moderate liquidity</li>
  <li><strong>5% circuit:</strong> Less liquid stocks</li>
  <li><strong>2% circuit:</strong> Highly illiquid penny stocks or stocks under surveillance (ASM/GSM list)</li>
</ul>

<h2>Upper Circuit vs Lower Circuit</h2>
<ul>
  <li><strong>Upper Circuit:</strong> Stock has gained the maximum allowed percentage. There are only buyers at or above this price — sellers have disappeared. Trading continues but only buy orders are accepted. Example: Stock opens at ₹100 with 20% circuit. Upper circuit = ₹120. If it reaches ₹120, only buyers can place orders.</li>
  <li><strong>Lower Circuit:</strong> Stock has fallen the maximum allowed percentage. There are only sellers — buyers have disappeared. Example: Lower circuit = ₹80. Only sell orders accepted.</li>
</ul>
<p>A stock hitting consecutive upper circuits (several days in a row) is called a "multibagger momentum" scenario. Hitting consecutive lower circuits signals a crisis — promoter selling, fraud, or severe business deterioration.</p>

<h2>Market-Wide Circuit Breakers (Index Halt)</h2>
<p>SEBI also has index-level circuit breakers that halt ALL trading across NSE and BSE if Sensex or Nifty 50 moves by large percentages:</p>
<ul>
  <li><strong>10% move:</strong> 45-minute trading halt (if before 1 PM); 15 minutes (if between 1–2:30 PM); no halt if after 2:30 PM</li>
  <li><strong>15% move:</strong> 1 hour 45 minutes halt (if before 1 PM); 45 minutes (if between 1–2 PM); rest of day if after 2 PM</li>
  <li><strong>20% move:</strong> Trading halted for the rest of the day regardless of time</li>
</ul>
<p>Market-wide circuit breakers have triggered only a few times in Indian history — during the 2008 financial crisis and briefly in March 2020 COVID crash.</p>

<h2>ASM and GSM — Enhanced Surveillance</h2>
<p>Stocks showing unusual price or volume activity get placed under <strong>ASM (Additional Surveillance Measure)</strong> or <strong>GSM (Graded Surveillance Measure)</strong>. This reduces the circuit to 5% or 2% and may require enhanced margins (50–100% upfront margin). Check the NSE/BSE website for the current ASM/GSM list before trading small-cap stocks.</p>
    `,
    faq: [
      { q: "Can I buy a stock that's hitting upper circuit?", a: "Yes, but you may not get your order executed — only buyers exist, so you're in a queue. The stock opens the next day fresh, and if demand continues, it may hit the upper circuit again." },
      { q: "What happens after a stock is in lower circuit for days?", a: "Trading becomes very difficult — only sellers exist, no buyers. This often signals serious trouble. The stock may get suspended by SEBI if the circuit is triggered repeatedly or if fraud is suspected." },
      { q: "How do I know a stock's circuit limit?", a: "On NSE's website, search the stock and check 'Market Depth' — it shows the circuit limits. On most broker apps, the circuit filter appears in the stock's trade window." },
    ],
  },
  {
    slug: "what-is-eps",
    title: "What is EPS (Earnings Per Share)? How to Use It for Stock Valuation",
    description: "EPS (Earnings Per Share) is the profit allocated to each share. Learn basic vs diluted EPS, trailing vs forward EPS, and how EPS drives the P/E ratio used for stock valuation in India.",
    readingTime: 4,
    publishedAt: "2026-05-10",
    relatedSlugs: ["pe-ratio", "what-is-roe-roce", "what-is-market-cap"],
    content: `
<h2>What is EPS?</h2>
<p><strong>Earnings Per Share (EPS)</strong> measures how much net profit a company generates for each share outstanding. It is the fundamental building block for the P/E ratio — the most widely used stock valuation metric.</p>
<ul>
  <li><strong>EPS = Net Profit (PAT) / Total Shares Outstanding</strong></li>
</ul>
<p>Example: Reliance Industries has a net profit of ₹79,000 crore and 1,353 crore shares outstanding → EPS = ₹79,000 / 1,353 = ₹58.4 per share.</p>
<p>A higher EPS means the company is generating more profit per share — generally a positive indicator of financial health.</p>

<h2>Basic EPS vs Diluted EPS</h2>
<ul>
  <li><strong>Basic EPS:</strong> Uses the current shares outstanding. Simpler to calculate.</li>
  <li><strong>Diluted EPS:</strong> Accounts for all potential shares that could be created from ESOPs (Employee Stock Options), convertible bonds, and warrants. Diluted EPS is always ≤ Basic EPS, because more shares mean less profit per share. Always use diluted EPS for a conservative valuation.</li>
</ul>
<p>For companies with large ESOP programs (tech startups, new-age companies), the gap between basic and diluted EPS can be significant. Zomato, Paytm, and other new-age companies have large outstanding ESOPs that dilute per-share earnings.</p>

<h2>Trailing EPS vs Forward EPS</h2>
<ul>
  <li><strong>Trailing EPS (TTM):</strong> Based on the last 12 months of actual reported profits. Fact-based. Used to compute the trailing P/E ratio.</li>
  <li><strong>Forward EPS:</strong> Analysts' consensus estimate of EPS for the next 12 months. Used to compute the forward P/E. More relevant for growth stocks but involves estimation risk.</li>
</ul>
<p>When IPOpulse shows a P/E ratio, it is typically the trailing P/E (market price ÷ trailing 12-month EPS).</p>

<h2>How EPS Drives P/E</h2>
<p>P/E Ratio = Market Price / EPS. So:</p>
<ul>
  <li>If a stock trades at ₹500 and EPS is ₹25, P/E = 20x</li>
  <li>If EPS grows from ₹25 to ₹35 but the stock stays at ₹500, P/E compresses to 14.3x — the stock appears cheaper without moving</li>
  <li>If EPS falls from ₹25 to ₹15, P/E expands to 33x — stock looks more expensive even though price didn't change</li>
</ul>
<p>Strong EPS growth is what drives sustainable stock price appreciation over time. Companies that consistently grow EPS at 15–20% CAGR tend to be excellent long-term investments.</p>

<h2>EPS Red Flags</h2>
<ul>
  <li><strong>EPS boosted by exceptional items:</strong> If a company sold a factory or subsidiary, the one-time profit inflates EPS. Always check "adjusted EPS" excluding exceptionals.</li>
  <li><strong>EPS growing but cash flow declining:</strong> EPS can be manipulated via aggressive revenue recognition. If operating cash flow doesn't match EPS growth, investigate the accounts.</li>
  <li><strong>Negative EPS (losses):</strong> P/E ratio becomes meaningless. Use EV/Sales or Price/Book instead for loss-making companies.</li>
</ul>
    `,
    faq: [
      { q: "Is higher EPS always better?", a: "Higher EPS means more profit per share, which is generally good. But context matters — a company with ₹100 EPS growing at 5% per year is less attractive than one with ₹20 EPS growing at 30% per year." },
      { q: "Where can I find a company's EPS in India?", a: "EPS is disclosed in quarterly and annual results published on BSE/NSE. The IPOpulse stock screener and ticker pages show EPS where available for major companies." },
      { q: "What is a good EPS for Indian stocks?", a: "There's no universal benchmark — EPS depends on face value, sector, and market cap. What matters more is EPS growth rate (ideally 15%+ CAGR) and consistency (no sudden falls)." },
    ],
  },
  {
    slug: "what-is-smallcase",
    title: "What is Smallcase? How Thematic Investing Works in India",
    description: "Smallcase is a platform that bundles stocks into themed portfolios managed by SEBI-registered advisors. Learn how smallcases work, costs, returns, and how they compare to mutual funds.",
    readingTime: 5,
    publishedAt: "2026-05-10",
    relatedSlugs: ["what-is-mutual-fund", "what-is-index-fund", "how-to-invest-in-stocks-beginners"],
    content: `
<h2>What is Smallcase?</h2>
<p><strong>Smallcase</strong> is an investment platform (smallcase.com) that offers thematic portfolios of stocks and ETFs — curated and managed by SEBI-registered investment advisors or research analysts. Unlike mutual funds (which pool your money with others), smallcases hold actual shares and ETFs directly in YOUR demat account.</p>
<p>Examples of smallcase themes: "EV & New Energy," "Rural Revival," "Dividend Aristocrats," "All Weather Investing," "Top 100 Stocks," "Dividend Yield & Low Debt."</p>

<h2>How Smallcase Works</h2>
<ol>
  <li>Browse smallcases on smallcase.com or through broker app (Zerodha Kite, Groww, etc.)</li>
  <li>Choose a smallcase — see its constituent stocks, rationale, past returns, and minimum investment</li>
  <li>Invest (minimum ₹500–₹50,000 depending on smallcase)</li>
  <li>Shares of all constituent stocks are purchased in your demat account in the correct weights</li>
  <li>The manager rebalances periodically (monthly, quarterly) — you get rebalance notifications and can approve or decline</li>
</ol>

<h2>Smallcase vs Mutual Fund — Key Differences</h2>
<ul>
  <li><strong>Ownership:</strong> Smallcase → you own actual shares. Mutual fund → you own fund units (fund owns the shares).</li>
  <li><strong>Tax:</strong> Smallcase → each stock sale is a separate capital gains event (STCG/LTCG calculated stock-by-stock). Mutual fund → single capital gain on unit redemption.</li>
  <li><strong>Transparency:</strong> Smallcase → you see exact stocks. MF → disclosures monthly with 1-month lag.</li>
  <li><strong>Cost:</strong> Smallcase → subscription fee (₹99–₹999/month or ₹500–₹2,500/quarter) + brokerage per trade during rebalance. Mutual fund → expense ratio (deducted from NAV daily, no direct payment).</li>
  <li><strong>Flexibility:</strong> Smallcase → you can modify, add, or remove individual stocks. MF → no control over underlying stocks.</li>
</ul>

<h2>Types of Smallcases</h2>
<ul>
  <li><strong>Passive/Index-based:</strong> Tracks Nifty 50, equal-weight Nifty, etc. Low cost.</li>
  <li><strong>Factor-based:</strong> Quality, value, momentum, low volatility. Rules-based rebalancing.</li>
  <li><strong>Thematic:</strong> EV, rural, defence, financialization of savings. Higher risk, concentrated.</li>
  <li><strong>Managed by advisors:</strong> Run by SEBI-registered RAs or investment advisors. Requires subscription fee. Quality varies significantly.</li>
</ul>

<h2>Costs and What to Watch</h2>
<ul>
  <li>Subscription fees range from free (basic) to ₹2,000+/quarter for premium smallcases</li>
  <li>Every rebalance triggers brokerage charges — frequent rebalancers are expensive</li>
  <li>Past returns advertised are backtested or point-to-point — not guaranteed</li>
  <li>SEBI requires smallcase managers to be registered investment advisors or research analysts — verify registration before investing</li>
</ul>

<h2>Is Smallcase Right for You?</h2>
<p>Smallcase suits investors who: want stock-level ownership (not fund units), understand basic investing, can handle individual tax complexity at year-end, and want thematic exposure that mutual funds don't offer. For absolute beginners, a Nifty 50 index fund via SIP is simpler and cheaper than most smallcases.</p>
    `,
    faq: [
      { q: "Are smallcases safe?", a: "The platform is regulated and your stocks are in your own demat account — no counterparty risk. But the constituent stocks carry market risk. Concentrated thematic smallcases can lose 40–60% in sector downturns." },
      { q: "What is the minimum investment in smallcase?", a: "Varies by smallcase. Some start at ₹500, others require ₹50,000+. The minimum is determined by the price of all constituent stocks × their weight." },
      { q: "Can I exit a smallcase anytime?", a: "Yes. You can sell all constituent stocks (exit the smallcase) at any time during market hours. The sale is treated as individual stock sales in your demat account." },
    ],
  },
  {
    slug: "what-is-pledging-shares",
    title: "What is Pledging of Shares? Why High Promoter Pledge is Risky",
    description: "Share pledging happens when promoters borrow money using their own company shares as collateral. Learn how pledging works, what high promoter pledge means for investors, and famous pledge-related crashes in India.",
    readingTime: 5,
    publishedAt: "2026-05-10",
    relatedSlugs: ["how-to-read-annual-report", "what-is-roe-roce", "what-is-market-cap"],
    content: `
<h2>What is Share Pledging?</h2>
<p><strong>Share pledging</strong> occurs when a promoter (founder/controlling shareholder) of a company borrows money from banks or NBFCs by pledging (mortgaging) their own company shares as collateral. The lender (bank/NBFC) holds the shares as security and can sell them if the promoter defaults on the loan.</p>
<p>Example: Promoter of XYZ Ltd owns 60% stake worth ₹600 crore. They pledge 30% (worth ₹300 crore) to raise a ₹150 crore personal loan at 50% LTV (Loan-to-Value). The pledged shares remain in the promoter's name and count toward their shareholding — but they've been hypothecated to the lender.</p>

<h2>Why Do Promoters Pledge Shares?</h2>
<ul>
  <li>Fund personal expenses without selling shares (avoiding downward price pressure)</li>
  <li>Invest in group companies or start new ventures</li>
  <li>Meet margin calls or debt repayment obligations in other businesses</li>
  <li>Promoters with high-pledge situations often have personal financial stress or group-level debt problems</li>
</ul>

<h2>The Pledge-Default-Cascade Risk</h2>
<p>High pledging creates a dangerous feedback loop:</p>
<ol>
  <li>Stock price falls for any reason</li>
  <li>Pledged shares' collateral value falls below the required LTV threshold</li>
  <li>Lender issues a margin call — promoter must provide more shares or cash</li>
  <li>If promoter can't meet margin call, lender sells the pledged shares in the open market</li>
  <li>Selling pushes price down further → triggers more margin calls → more selling</li>
  <li>Spiral continues until promoter's stake is liquidated or company goes bankrupt</li>
</ol>
<p>Famous Indian examples: ADAG Group (Reliance Capital, Reliance Infrastructure), IL&FS, Yes Bank promoters, Dish TV, and many mid-cap/SME companies saw catastrophic pledge-driven crashes.</p>

<h2>How to Find Promoter Pledge Data</h2>
<p>SEBI mandates quarterly disclosure of pledged shares in the shareholding pattern. Find it:</p>
<ul>
  <li>BSE/NSE → Company filings → Shareholding Pattern (look for "Pledge/Encumbrance" column)</li>
  <li>IPOpulse's Shareholding tracker shows promoter pledge % for top companies</li>
  <li>Most screener tools allow filtering by max promoter pledge %</li>
</ul>

<h2>Red Flag Thresholds</h2>
<ul>
  <li><strong>0% pledge:</strong> Green flag — promoters have no debt against their shares</li>
  <li><strong>Below 20%:</strong> Acceptable — moderate, manageable</li>
  <li><strong>20–50%:</strong> Caution — understand why before investing</li>
  <li><strong>Above 50%:</strong> High risk — any stock price decline can trigger forced selling</li>
  <li><strong>Above 75%:</strong> Danger zone — promoter essentially has minimal real equity cushion</li>
</ul>

<h2>Pledging vs Margin Trading by Retail Investors</h2>
<p>Retail investors also "pledge" their own shares to get margin funding for intraday trading. This is a separate (but related) concept — you can pledge your portfolio stocks to Zerodha/Groww to get up to 50% margin for equity or F&O trading. If the pledged stock falls and you can't meet the margin requirement, your broker sells the pledged shares. Always understand the risk before pledging your own portfolio.</p>
    `,
    faq: [
      { q: "Is promoter pledging always bad?", a: "Not always. Short-term pledging for a specific purpose (business acquisition, capex) that is being repaid is manageable. Chronic high pledging (50%+ sustained over years) is a structural red flag." },
      { q: "What happens if a company's promoter pledge reaches 100%?", a: "The promoter has effectively lost control of those shares as collateral. Any default means the lender sells shares in the market, potentially causing a collapse in the promoter's stake and triggering SEBI open offer obligations if stake falls below 25%." },
      { q: "Where can I see pledge data quickly?", a: "IPOpulse's Shareholding page shows promoter pledge %. Screener.in and Trendlyne also track this. NSE/BSE shareholding pattern filings are the primary source — published quarterly within 21 days of quarter end." },
    ],
  },
  {
    slug: "what-is-sebi",
    title: "What is SEBI? India's Stock Market Regulator Explained",
    description: "SEBI (Securities and Exchange Board of India) regulates India's stock markets. Learn what SEBI does, its powers, how it protects investors, and major regulations that affect stock market participants.",
    readingTime: 5,
    publishedAt: "2026-05-10",
    relatedSlugs: ["how-to-invest-in-stocks-beginners", "what-is-demat-account", "ipo-gmp"],
    content: `
<h2>What is SEBI?</h2>
<p><strong>SEBI</strong> — the <strong>Securities and Exchange Board of India</strong> — is India's capital markets regulator, established in 1988 and granted statutory powers under the SEBI Act in 1992. It functions under the Ministry of Finance, Government of India, and is headquartered in Mumbai's Bandra-Kurla Complex (BKC).</p>
<p>SEBI's mission: <em>"To protect the interests of investors in securities and to promote the development of, and to regulate, the securities market."</em></p>

<h2>What Does SEBI Regulate?</h2>
<p>SEBI has authority over virtually every participant in India's capital markets:</p>
<ul>
  <li><strong>Stock exchanges:</strong> NSE, BSE, MCX, NCDEX — their rules, systems, and listing standards</li>
  <li><strong>Listed companies:</strong> Disclosure requirements, insider trading rules, corporate governance</li>
  <li><strong>Brokers and sub-brokers:</strong> Registration, compliance, client fund handling</li>
  <li><strong>Mutual funds:</strong> Fund registration, AMC regulations, NAV disclosure, expense ratio caps</li>
  <li><strong>Foreign Portfolio Investors (FPIs):</strong> Registration, investment limits, reporting</li>
  <li><strong>Investment advisers and research analysts:</strong> Registration, code of conduct, conflict of interest rules</li>
  <li><strong>Depositories:</strong> CDSL and NSDL are regulated by SEBI</li>
  <li><strong>IPOs:</strong> Prospectus requirements, pricing, allotment, listing timelines</li>
</ul>

<h2>Key SEBI Powers</h2>
<ul>
  <li><strong>Investigation:</strong> SEBI can investigate any entity for market manipulation, insider trading, or fraud</li>
  <li><strong>Penalty:</strong> Issue fines up to ₹25 crore or 3x the profits from violations</li>
  <li><strong>Ban:</strong> Bar individuals and companies from accessing securities markets</li>
  <li><strong>Disgorgement:</strong> Force bad actors to return ill-gotten gains to a fund for investor compensation</li>
  <li><strong>Search and seizure:</strong> With court approval, search premises and seize records</li>
</ul>

<h2>Major SEBI Regulations That Affect You</h2>
<ul>
  <li><strong>ASBA for IPOs:</strong> SEBI mandated ASBA (blocked amount) for all IPO applications — your money stays in your bank until allotment</li>
  <li><strong>T+1 settlement:</strong> SEBI moved India to T+1 (next-day) settlement — one of the fastest globally</li>
  <li><strong>F&O retail loss disclosure:</strong> SEBI requires brokers to show that 89% of F&O retail traders lose money — you see this warning before activating F&O</li>
  <li><strong>Mutual fund categorisation:</strong> SEBI's 2018 circular forced all MFs to have clearly defined, distinct categories — no more "flexi" fund names to mislead investors</li>
  <li><strong>Research analyst registration:</strong> Anyone providing stock tips publicly must register with SEBI as RA or face action</li>
  <li><strong>SME IPO tightening (2023–24):</strong> SEBI raised minimum application lots and required more diligence for SME IPO listings after manipulation concerns</li>
</ul>

<h2>How to Complain to SEBI</h2>
<p>If you face fraud by a broker, AMC, or listed company:</p>
<ol>
  <li>File a complaint on <strong>SEBI SCORES</strong> (scores.gov.in) — the official complaint portal</li>
  <li>SEBI forwards it to the relevant entity for resolution within 30 days</li>
  <li>If unresolved, SEBI takes direct action</li>
  <li>For broker disputes, also use your exchange's Investor Grievance Cell or IGRC</li>
</ol>
<p>SEBI SCORES has resolved over 7 lakh complaints since launch. Average resolution time is 30–45 days.</p>
    `,
    faq: [
      { q: "Is SEBI like the RBI for stock markets?", a: "Similar concept, different domain. RBI (Reserve Bank of India) regulates banks, NBFCs, and monetary policy. SEBI regulates capital markets — stocks, mutual funds, derivatives, and related intermediaries. Both are independent regulators under the Government of India." },
      { q: "Can SEBI cancel a listed company?", a: "SEBI can order suspension of trading in a stock. Actual delisting of a company requires exchange approval and compliance with delisting regulations. SEBI has suspended trading in companies found guilty of manipulation." },
      { q: "How does SEBI protect retail investors from pump-and-dump?", a: "SEBI monitors unusual price/volume patterns and investigates suspected pump-and-dump schemes. It also maintains ASM (Additional Surveillance Measure) and GSM (Graded Surveillance Measure) lists to restrict trading in suspicious stocks." },
    ],
  },
  {
    slug: "how-to-read-candlestick-charts",
    title: "How to Read Candlestick Charts — Beginner's Guide for Indian Traders",
    description: "Candlestick charts show open, high, low, and close prices visually. Learn to read basic candlestick patterns used by Indian traders — Doji, Hammer, Engulfing, and more.",
    readingTime: 6,
    publishedAt: "2026-05-10",
    relatedSlugs: ["what-is-stop-loss", "52-week-high-low", "what-is-circuit-limit"],
    content: `
<h2>What is a Candlestick Chart?</h2>
<p>A <strong>candlestick chart</strong> shows a stock's price movement over a given period (1 minute, 1 hour, 1 day, 1 week) using candle-shaped bars. Each candle shows four prices: <strong>Open, High, Low, Close (OHLC)</strong>.</p>
<p>Candlestick charts were invented by Japanese rice traders in the 18th century and became the global standard for price chart analysis. Every broker platform (Zerodha Kite, Groww, Upstox) displays them by default.</p>

<h2>Anatomy of a Candle</h2>
<ul>
  <li><strong>Body:</strong> The thick rectangular section between Open and Close prices</li>
  <li><strong>Upper shadow (wick):</strong> Thin line above the body — shows the Intraday High</li>
  <li><strong>Lower shadow (wick):</strong> Thin line below the body — shows the Intraday Low</li>
  <li><strong>Green/White candle:</strong> Close > Open — buyers were stronger (bullish session)</li>
  <li><strong>Red/Black candle:</strong> Close < Open — sellers were stronger (bearish session)</li>
</ul>
<p>A candle with a long green body and short wicks means the stock opened near its low and closed near its high — strong bullish session. A red candle with a long body means sellers dominated all day.</p>

<h2>Key Single-Candle Patterns</h2>
<p><strong>Doji:</strong> Open ≈ Close — body is very thin/absent. Represents indecision between buyers and sellers. A Doji after a trend suggests potential reversal.</p>
<p><strong>Hammer:</strong> Small body at the top, long lower shadow (2× body size). Appears after a downtrend. Means sellers pushed price down intraday but buyers recovered. Bullish reversal signal.</p>
<p><strong>Shooting Star:</strong> Small body at the bottom, long upper shadow. Appears after an uptrend. Means buyers pushed price up but sellers reversed it. Bearish reversal signal.</p>
<p><strong>Marubozu:</strong> Long body, no shadows at all. Strong momentum in one direction — bullish Marubozu (green, no wicks) means buyers controlled the entire session.</p>
<p><strong>Spinning Top:</strong> Small body, equal-length shadows above and below. Indecision — neither buyers nor sellers won decisively.</p>

<h2>Key Two-Candle Patterns</h2>
<p><strong>Bullish Engulfing:</strong> A large green candle completely covers the previous red candle. Bullish reversal — buyers overwhelmed previous day's sellers.</p>
<p><strong>Bearish Engulfing:</strong> A large red candle completely covers the previous green candle. Bearish reversal signal.</p>
<p><strong>Piercing Line:</strong> After a downtrend — red candle followed by green candle that opens below previous close but closes above the midpoint of the red candle. Moderate bullish reversal.</p>

<h2>Three-Candle Patterns</h2>
<p><strong>Morning Star:</strong> Three candles — long red, small candle (doji or spinning top), long green. Bullish reversal after downtrend — one of the strongest reversal signals.</p>
<p><strong>Evening Star:</strong> Opposite — long green, small candle, long red. Bearish reversal after uptrend.</p>
<p><strong>Three White Soldiers:</strong> Three consecutive green candles, each closing higher than the previous. Strong bullish momentum.</p>

<h2>Important Caveats for Indian Markets</h2>
<ul>
  <li>Candlestick patterns are probabilistic signals, not guarantees. Studies show even the best patterns succeed only 55–65% of the time.</li>
  <li>Always confirm patterns with volume — a Hammer on low volume is less reliable than on high volume</li>
  <li>Use patterns as one input alongside fundamentals and market context — not as standalone trading signals</li>
  <li>Over 89% of retail F&O traders in India lose money per SEBI data. Technical analysis alone does not consistently beat markets.</li>
</ul>
    `,
    faq: [
      { q: "What timeframe should I use for candlestick charts?", a: "For swing trading (holding days to weeks): daily charts. For positional trading (weeks to months): weekly charts. For intraday: 5-minute or 15-minute charts. Long-term investors should focus on weekly/monthly charts and fundamentals." },
      { q: "Which Indian brokers show candlestick charts?", a: "All major Indian brokers — Zerodha Kite, Groww, Upstox, Angel One, Dhan — show candlestick charts. Dhan has TradingView integrated (most advanced charting). Zerodha Kite also has TradingView charts for subscribers." },
      { q: "Are candlestick patterns reliable for Nifty 50 trading?", a: "Somewhat. Nifty 50 is highly liquid and efficient — simple patterns are often already priced in by institutions. Retail traders using textbook patterns often trade against well-capitalised institutions. Use patterns as context, not as primary entry signals." },
    ],
  },
  {
    slug: "what-is-portfolio-diversification",
    title: "What is Portfolio Diversification? Asset Allocation for Indian Investors",
    description: "Diversification reduces risk by spreading investments across asset classes, sectors, and geographies. Learn the right diversification strategy for Indian investors across equity, debt, gold, and international funds.",
    readingTime: 5,
    publishedAt: "2026-05-10",
    relatedSlugs: ["sip-guide", "what-is-mutual-fund", "how-to-invest-in-gold"],
    content: `
<h2>What is Diversification?</h2>
<p><strong>Portfolio diversification</strong> is the strategy of spreading investments across multiple assets, sectors, and geographies so that a loss in one area doesn't devastate your entire portfolio. The core idea: different assets often don't move together — when one falls, another may hold steady or rise.</p>
<p>Nobel laureate Harry Markowitz proved mathematically in 1952 that a diversified portfolio can achieve the same expected return with lower risk. This is the only "free lunch" in investing.</p>

<h2>Why Diversification Matters in India</h2>
<ul>
  <li>In 2008, Nifty 50 fell 52% but gold rose 30% — a diversified portfolio fell much less</li>
  <li>IT sector stocks fell 40%+ in 2022–23 while PSU banking stocks rose 50%+ — sector diversification protects</li>
  <li>INR depreciation hurts domestic assets but boosts international/USD investments</li>
  <li>Single-stock concentration is the most common wealth-destroyer — Satyam (2009 fraud), Yes Bank (2020 crisis), DHFL (2019 collapse) wiped out portfolios that were concentrated</li>
</ul>

<h2>Level 1 — Asset Class Diversification</h2>
<p>The most important layer. Spread across uncorrelated asset classes:</p>
<ul>
  <li><strong>Equity:</strong> Highest long-term returns, highest volatility. Nifty 50 CAGR ~12–14% over 20 years.</li>
  <li><strong>Debt/Fixed income:</strong> Lower returns (6–8%), stability. Government bonds, corporate bonds, liquid funds.</li>
  <li><strong>Gold:</strong> Crisis hedge. Performs well when equity and INR decline. 10–12% CAGR in INR over 20 years.</li>
  <li><strong>International equity:</strong> US, global markets. Provides USD hedge and global growth exposure.</li>
  <li><strong>Real estate (REITs):</strong> Commercial real estate income via listed REITs — liquid, dividend-paying.</li>
</ul>

<h2>Typical Asset Allocation by Age and Risk</h2>
<p>The "100 minus age" rule is a starting point — subtract your age from 100 to get equity allocation %:</p>
<ul>
  <li><strong>Age 25–35 (aggressive):</strong> 70–80% equity, 10% gold, 10–20% debt. High risk capacity, long time horizon.</li>
  <li><strong>Age 36–50 (moderate):</strong> 50–60% equity, 10–15% gold, 25–35% debt. Balancing growth and stability.</li>
  <li><strong>Age 51–60 (conservative):</strong> 30–40% equity, 10% gold, 50–60% debt. Capital preservation becomes priority.</li>
  <li><strong>Retired (60+):</strong> 20–30% equity (dividend stocks, balanced advantage funds), 15% gold, 55–65% debt/annuity.</li>
</ul>

<h2>Level 2 — Within Equity: Sector & Cap Diversification</h2>
<p>Don't put all equity in one sector or market cap segment:</p>
<ul>
  <li>Own stocks across at least 5–6 sectors (banking, IT, FMCG, healthcare, auto, infra)</li>
  <li>Mix large-cap (stability), mid-cap (growth), and optionally small-cap (high potential)</li>
  <li>For mutual fund portfolios: 1 large-cap index fund + 1 flexicap/multicap + 1 mid-cap fund covers most bases</li>
</ul>

<h2>Level 3 — Geographic Diversification</h2>
<p>Indian equities are 100% INR-denominated. As the rupee depreciates (long-term trend vs USD), your purchasing power for international goods declines. Allocating 10–20% to international funds (Nifty 50 equivalent in the US = S&P 500 or Nasdaq 100 via Indian mutual funds) provides natural currency hedge.</p>

<h2>The Diversification Paradox</h2>
<p>Over-diversification ("di-worse-ification") can actually hurt returns. Owning 100 stocks means you're essentially paying stock-picking costs for index-like returns. Most financial research suggests 15–25 well-chosen individual stocks provide 90%+ of diversification benefits. Beyond that, you're adding complexity without meaningful risk reduction.</p>
    `,
    faq: [
      { q: "Is a Nifty 50 index fund considered diversified?", a: "Yes — a single Nifty 50 index fund gives exposure to 50 companies across 13 sectors, which is very well diversified for equity. But it's still 100% Indian equity — add gold and international exposure for fuller diversification." },
      { q: "How often should I rebalance my portfolio?", a: "Annual rebalancing is sufficient for most long-term investors. If any asset class deviates more than 10–15% from target allocation (e.g., equity grew from 60% to 75% target), rebalance by selling the outperformer and buying underperformers." },
      { q: "Can mutual funds alone provide sufficient diversification?", a: "Yes. A simple 3-fund portfolio — Nifty 50 index fund + international fund (Nasdaq 100 or global) + short-duration debt fund — provides adequate diversification for most Indian retail investors with minimal cost and complexity." },
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
