/**
 * Curated registry of financial products that pay affiliate commissions
 * (personal loan, home loan, savings account / neobank, business loan, car loan).
 * Inspired by BankTalky's services-page structure.
 *
 * Pricing reflects April 2026 published rates. Always link out via the
 * partner — we earn ₹150-₹2,000 per qualifying lead/disbursement.
 */

export type FinanceCategory = "personal-loan" | "home-loan" | "savings-account" | "business-loan" | "car-loan";

export interface FinanceCategoryMeta {
  slug: FinanceCategory;
  title: string;
  shortTitle: string;
  description: string;
  heroIntro: string;
  iconName: string;
  faq: { q: string; a: string }[];
}

export interface FinanceProduct {
  category: FinanceCategory;
  slug: string;
  brand: string;
  productName: string;
  rateLabel: string;            // headline rate / interest / cashback
  rateNumeric?: number;
  fee: string;
  highlight: string;            // 2-3 word badge ("Lowest rate")
  features: string[];
  bestFor: string;
  ctaUrl: string;
  payoutInr: number;            // ~ ₹ payout to IPOpulse per qualified action
}

export const financeCategories: FinanceCategoryMeta[] = [
  {
    slug: "personal-loan",
    title: "Personal Loan",
    shortTitle: "Personal Loan",
    description: "Compare unsecured personal loans across India's top NBFCs and banks. Interest 10.5%–24%, tenure up to 7 years.",
    heroIntro:
      "An unsecured personal loan covers emergencies, weddings, travel, education, or debt consolidation. Approved in 24–48 hours with minimal documents (PAN, Aadhaar, last 3 months salary slips, last 6 months bank statement, employment proof). Rates depend on your CIBIL (750+ gets best), income, employer category, and existing relationship with the lender. Indian retail personal loan book has crossed ₹13 lakh crore in 2026, growing 22% YoY — the fastest segment of bank credit, driven heavily by app-based small-ticket fintech lending. Smart use cases: debt consolidation (replacing 36% credit card debt with 14% personal loan saves significant interest), one-time medical emergency, planned wedding or home renovation with a clear repayment plan. Avoid using personal loans for vacations, gadget purchases, gifts, or topping up daily expenses — these create EMI burden without building any asset. Watch-outs that catch first-time borrowers: processing fees of 1–3% deducted upfront from the disbursement, mandatory loan-protection insurance pitched by some banks (usually decline politely — adds 1.5–4% to effective cost), foreclosure penalty of 2–5% on outstanding principal at most lenders, and 6–12 month prepayment lock-in periods. Always read the Key Facts Statement (KFS — mandatory under RBI's Digital Lending Guidelines from 2023) before signing. Use our personal loan EMI calculator to compute exact monthly outflow before applying, and shop with at least 3 lenders since rate offers can vary by 3–5% across banks for the same applicant.",
    iconName: "Wallet",
    faq: [
      { q: "What's a typical personal loan rate in India?", a: "PSU banks: 10.5–13%. Private banks: 11–16%. NBFCs / fintechs: 13–24%. CIBIL 750+ unlocks the lowest end of each band." },
      { q: "How fast can I get the money?", a: "Pre-approved customers see disbursement in 4–24 hours. New customers typically 2–5 days after KYC + income verification." },
      { q: "Are there foreclosure charges?", a: "Most lenders charge 2–5% of outstanding for closing within 6–12 months. After lock-in, partial prepayment is usually free or 1–2%." },
      { q: "What CIBIL do I need?", a: "Most lenders need 700+. Below 650 gets rejected by major banks but NBFCs/fintechs may approve at 16-24%." },
    ],
  },
  {
    slug: "home-loan",
    title: "Home Loan",
    shortTitle: "Home Loan",
    description: "Compare home loans across HDFC, SBI, ICICI, Axis. Interest 8.25%–9.75%, tenure up to 30 years, women borrowers get 0.05% lower.",
    heroIntro:
      "A home loan typically runs 15–30 years at floating rate (linked to RBI's repo rate via the bank's RLLR — Repo Linked Lending Rate). Tax: ₹2L deduction on interest under Section 24(b) for self-occupied property, ₹1.5L on principal under 80C, and an additional ₹1.5L on interest under Section 80EEA for first-time buyers (subject to property value under ₹45L and loan sanction during specific window — check current rules). Floating-rate home loans for individuals have ZERO prepayment penalty per RBI rule (October 2019 onwards) — making aggressive principal prepayment one of the most powerful wealth-building moves a salaried Indian can execute. For a ₹50 lakh, 20-year home loan at 8.5%, prepaying just ₹1 lakh in year 1 saves roughly ₹3.4 lakh in total interest over the loan's life; the same ₹1L prepaid in year 15 saves only ~₹50,000. The first 5–7 years of a home loan are when 70–80% of every EMI is interest, so this is when prepayment has its largest absolute impact. Practical tips: women co-applicants get 0.05–0.10% lower rates at most banks (use this even on jointly-purchased property); compare PSU banks (SBI, BoB, Canara, PNB) against private (HDFC, ICICI, Axis, Kotak) — PSUs often have lowest headline rates but private lenders are faster on disbursement; check effective rate including processing fee, technical/legal charges, and CERSAI registration; avoid bundled mandatory insurance — buy independent term cover separately. Use our EMI calculator to model before signing, and run a balance transfer comparison every 2–3 years if the gap between your current rate and prevailing market rates exceeds 0.5% on a 15+ year tenure — it usually pays back the transfer fee in 4–8 months.",
    iconName: "Home",
    faq: [
      { q: "What's the lowest home loan rate?", a: "Public sector banks (SBI, BoB) often have lowest at 8.25–8.75% for women, 8.30–8.80% otherwise. Private banks 8.5–9.5%." },
      { q: "How much loan can I get?", a: "Banks lend up to 90% of property value (LTV) for ≤₹30L, 80% for ₹30L–75L, 75% for >₹75L. EMI typically capped at 50–60% of net monthly income." },
      { q: "Should I choose floating or fixed?", a: "Floating in 95%+ cases — tracks repo rate, no prepayment penalty for individuals. Fixed only if you're certain rates will rise sharply." },
      { q: "Can I switch lenders later (balance transfer)?", a: "Yes — 0.5–1% processing fee, but if existing rate vs new rate gap is >0.5% on a 15+ year tenure, transfer pays back in months." },
    ],
  },
  {
    slug: "savings-account",
    title: "Savings Account / Neobank",
    shortTitle: "Savings Account",
    description: "Zero-balance neobank accounts (Jupiter, Fi, NiyoX), high-interest savings (IDFC FIRST, Bandhan), salary accounts. UPI + debit card included.",
    heroIntro:
      "Neobanks (Jupiter, Fi Money, NiyoX, Slice, Freo) offer ₹0 minimum balance, instant video-KYC account opening (under 5 minutes), free Visa or RuPay debit card, and 6–7% interest on idle balance through underlying banking partner FDs. Traditional banks (HDFC, ICICI, Axis, SBI, Kotak) require ₹10,000–₹50,000 average monthly balance but offer FD-linked sweep features, branch banking access, and broader product ecosystems (credit cards, loans, demat). Choosing the right savings account can quietly add ₹15,000–₹50,000 per year to your wealth versus a default low-yield account, mostly through interest differential and avoided fees. Key things to compare: actual interest rate (regular savings rate is 2.5–4%; high-yield neobanks pay 6–7%; daily balance over a tier-break may pay differently), free monthly transactions (UPI is unlimited at most banks but ATM withdrawals are typically capped at 5/month before ₹15–25 per transaction), debit card type (regular vs platinum vs signature — affects insurance cover, lounge access, FX markup), and bundled products (some accounts include free term insurance, accident cover, or zero-fee credit card). Safety: neobanks are partnered with regulated banks (Jupiter with Federal Bank, NiyoX with Equitas SFB, Fi Money with Federal Bank) — your deposits get DICGC insurance up to ₹5 lakh per bank, identical to traditional bank deposits. For high balances above ₹5 lakh, split across 2–3 banks to maximize DICGC coverage. Evaluate IDFC FIRST Bank, Bandhan Bank, AU Small Finance Bank, and Equitas SFB for competitive 6–7.5% savings rates on balances up to ₹10–20 lakh — vs the 3–4% you typically get at large private banks. Auto-sweep FD features (HDFC SmartFlex, ICICI iWish, Axis Multiplier) automatically convert excess balance above a threshold into FDs, recovering the rate gap without manual effort.",
    iconName: "Landmark",
    faq: [
      { q: "Are neobanks safe?", a: "Yes — neobanks are partnered with regulated banks (Jupiter with Federal Bank, NiyoX with Equitas SFB). Your deposits get DICGC insurance up to ₹5L per bank, same as a regular bank." },
      { q: "What's the catch?", a: "Most cap free transactions / ATM withdrawals (e.g., 5/month). Beyond cap, ₹15-25 per transaction. Read the fine print." },
      { q: "Can I get a salary account at a neobank?", a: "Yes, NiyoX and Jupiter both offer salary accounts. Your employer needs to add the bank's IFSC. Some companies still mandate ICICI/HDFC/SBI." },
      { q: "Best account for high balance?", a: "IDFC FIRST Bank pays 6–7.5% on savings up to ₹10L (vs 3-4% at HDFC/ICICI). Bandhan and AU SFB also pay 6%+. Compare auto-sweep options if you keep >₹5L idle." },
    ],
  },
  {
    slug: "business-loan",
    title: "Business Loan",
    shortTitle: "Business Loan",
    description: "Working capital, term loans, machinery loans, MSME loans, and invoice discounting from Bajaj, Lendingkart, FlexiLoans, IIFL. Interest 12%–24%.",
    heroIntro:
      "Business loans for MSMEs, proprietorships, partnerships, LLPs, and private limited companies cover working capital, term loans, machinery purchases, expansion capex, GST input financing, invoice discounting, and merchant cash advances. Most lenders need 2 years' ITR + 1 year bank statements + GST returns + business vintage proof. Ticket sizes range ₹50,000 (microloans for kirana stores via fintechs) to ₹50 lakh unsecured, and ₹5 crore+ secured against property or machinery. Interest rates depend heavily on revenue, vintage, collateral, and credit profile: bank rates 12–16%, NBFC rates 14–22%, fintech rates 18–28% for unsecured, secured rates 1–3% lower across each segment. The Indian MSME credit gap remains around ₹25 lakh crore — one of the largest in the world — which explains why so many fintechs have entered this space (Lendingkart, FlexiLoans, Razorpay Capital, Indifi, ZipLoan, NeoGrowth). For most business owners, the cheapest formal credit available is via the CGTMSE scheme (Credit Guarantee for Micro and Small Enterprises) — collateral-free loans up to ₹5 crore at PSU banks where the government guarantees 75–85% of the loan, allowing banks to lend at near-personal-loan rates with no collateral required. Apply through any nationalized bank or via Udyam-registered MSME portal. Mudra loans (Shishu ₹50K, Kishore ₹5L, Tarun ₹10L) are useful for the smallest businesses. Smart working capital management: stagger your repayments, use invoice discounting for B2B receivables (RXIL, M1xchange marketplaces) instead of taking term debt, keep at least 60 days of expense buffer in liquid form, and resist the temptation to overborrow during good months — most MSME defaults happen because owners borrowed against cyclical highs. GST registration is mandatory for businesses with turnover above ₹40 lakh (₹20L for services); most lenders require GST history to underwrite.",
    iconName: "Briefcase",
    faq: [
      { q: "Can I get a business loan without collateral?", a: "Yes, NBFCs (Lendingkart, FlexiLoans, ZipLoan) and fintechs offer unsecured up to ₹25-50L. Secured loans (against property/machinery) get lower rates and higher ticket sizes." },
      { q: "What ITR / turnover do I need?", a: "Minimum 2 years ITR + ₹15-20L annual turnover for unsecured. Banks may need 3 years. Newer fintechs (Razorpay Capital, FlexiLoans) work with 1 year for established cash flow." },
      { q: "Is GST registration mandatory?", a: "Required by most lenders for businesses with turnover >₹40L. Helps establish revenue and unlock better rates." },
    ],
  },
  {
    slug: "car-loan",
    title: "Car Loan",
    shortTitle: "Car Loan",
    description: "New and used car loans from HDFC, ICICI, SBI, BoB. Interest 8.75%–13%, tenure 1–8 years. Up to 90% on-road financing.",
    heroIntro:
      "Banks finance up to 90% of on-road price for new cars (typically 80–85% for used cars 5+ years old, 70% for cars older than 8 years). EMIs start as low as ₹1,800 per ₹1 lakh borrowed at 8.75% for 5-year tenure. Most lenders charge 1–2% prepayment fee on car loans (unlike home loans where RBI bans foreclosure penalties on individual floating-rate loans). Compare offers across PSU banks (SBI, BoB, Canara, PNB) at 8.75–9.5%, private banks (HDFC, ICICI, Axis, Kotak) at 9–11%, and NBFCs (Bajaj Finserv, TVS Credit, Mahindra Finance, Cholamandalam) at 11–14%. Existing salary account customers usually unlock 0.25–0.50% rate concession. Ideal car loan structure for any middle-class Indian family: down payment ≥ 20% of on-road price, loan tenure ≤ 5 years (avoid 6–7 year tenures even though they reduce EMI — total interest paid jumps significantly and you risk being underwater on the loan vs car's market value), EMI ≤ 10% of monthly take-home pay, and combined with all other EMIs ≤ 40%. Cars depreciate ~30% in year 1 and ~50% by year 4, so longer tenures often mean you owe more than the car is worth (negative equity), trapping you if you want to sell mid-loan. Hidden costs to budget beyond the loan EMI: insurance (3–4% of vehicle value annually for comprehensive cover), road tax and registration (8–12% of ex-showroom in most states), maintenance (₹15,000–₹30,000/year for sedans, more for premium SUVs), fuel, parking, and depreciation. Total annual cost of running a ₹10 lakh car often exceeds ₹2 lakh excluding the loan EMI itself. For used cars, prefer certified pre-owned programs from Maruti True Value, Mahindra First Choice, Hyundai H-Promise, or OLX Autos for warranty-backed purchases. Always run our Car Loan EMI Calculator before committing — model 4-year and 5-year scenarios and compare total interest outgo to make an informed choice.",
    iconName: "Car",
    faq: [
      { q: "How much can I borrow?", a: "Up to 90% of the on-road price for new cars from PSU banks, 85–90% from private. Used cars (>5 years old): 70–80% of the certified value." },
      { q: "What's a typical car loan rate?", a: "PSU banks: 8.75–9.5% (new). Private: 9–11%. NBFCs / used car: 11–14%. Existing customer relationships and salary accounts unlock 0.25–0.5% discount." },
      { q: "What tenure should I pick?", a: "5 years sweet spot. Cars depreciate 30% in year 1, 50% by year 4 — longer tenures often mean you owe more than the car is worth (negative equity)." },
    ],
  },
];

export const financeProducts: FinanceProduct[] = [
  // Personal Loans
  {
    category: "personal-loan",
    slug: "bajaj-personal-loan",
    brand: "Bajaj Finserv",
    productName: "Personal Loan",
    rateLabel: "From 10.99% p.a.",
    rateNumeric: 10.99,
    fee: "Up to 4.5% of loan amount",
    highlight: "Up to ₹40 lakh",
    features: ["Disbursal in 24 hours", "Pre-approved offers for existing customers", "No collateral", "Tenure 12-96 months", "EMI as low as ₹1,540 / lakh"],
    bestFor: "Big-ticket needs (₹5L+) with quick approval",
    ctaUrl: "https://www.bajajfinserv.in/personal-loan?ref=IPOPULSE",
    payoutInr: 630,
  },
  {
    category: "personal-loan",
    slug: "hdfc-personal-loan",
    brand: "HDFC Bank",
    productName: "Personal Loan",
    rateLabel: "From 10.5% p.a.",
    rateNumeric: 10.5,
    fee: "Up to 2.5%",
    highlight: "Lowest rates",
    features: ["Pre-approved in 60 seconds for existing customers", "Up to ₹40L", "Fixed monthly EMI", "Insta Loan available 24x7"],
    bestFor: "HDFC salary account holders / good CIBIL",
    ctaUrl: "https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan?ref=IPOPULSE",
    payoutInr: 600,
  },
  {
    category: "personal-loan",
    slug: "tata-capital-personal-loan",
    brand: "Tata Capital",
    productName: "Personal Loan",
    rateLabel: "From 10.99% p.a.",
    rateNumeric: 10.99,
    fee: "Up to 3%",
    highlight: "Tata trust",
    features: ["Up to ₹35L", "Tenure up to 6 years", "Doorstep documentation", "Foreclosure allowed after 6 EMIs"],
    bestFor: "Salaried with steady income",
    ctaUrl: "https://www.tatacapital.com/personal-loan.html?ref=IPOPULSE",
    payoutInr: 500,
  },

  // Home Loans
  {
    category: "home-loan",
    slug: "sbi-home-loan",
    brand: "SBI",
    productName: "Home Loan",
    rateLabel: "From 8.50% p.a.",
    rateNumeric: 8.5,
    fee: "0.35% (max ₹10,000)",
    highlight: "Lowest rate",
    features: ["Tenure up to 30 years", "Women borrowers: 0.05% lower", "Up to 90% LTV", "Zero prepayment fee on floating rate"],
    bestFor: "Lowest published rate among major banks",
    ctaUrl: "https://www.bankbazaar.com/home-loan.html?ref=IPOPULSE",
    payoutInr: 2000,
  },
  {
    category: "home-loan",
    slug: "hdfc-home-loan",
    brand: "HDFC Bank",
    productName: "Home Loan",
    rateLabel: "From 8.65% p.a.",
    rateNumeric: 8.65,
    fee: "0.5% (max ₹10,000)",
    highlight: "Top processing speed",
    features: ["End-to-end digital", "30-min sanction for HDFC customers", "30-year tenure", "Top-up facility"],
    bestFor: "Fastest sanction + execution",
    ctaUrl: "https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan?ref=IPOPULSE",
    payoutInr: 2000,
  },
  {
    category: "home-loan",
    slug: "icici-home-loan",
    brand: "ICICI Bank",
    productName: "Home Loan",
    rateLabel: "From 8.75% p.a.",
    rateNumeric: 8.75,
    fee: "0.5%",
    highlight: "Step-up EMI option",
    features: ["Income-tax assist tools", "iLens digital flow", "Step-up EMI for young borrowers", "30-year tenure"],
    bestFor: "Young salaried needing graduating EMI",
    ctaUrl: "https://www.icicibank.com/personal-banking/loans/home-loan?ref=IPOPULSE",
    payoutInr: 2000,
  },

  // Savings / neobank
  {
    category: "savings-account",
    slug: "jupiter-savings",
    brand: "Jupiter",
    productName: "Pro Salary / Savings",
    rateLabel: "Up to 7.25% p.a.",
    fee: "₹0 minimum balance",
    highlight: "₹0 maintenance",
    features: ["Federal Bank backed (DICGC ₹5L)", "Free Visa Platinum debit card", "Pots feature for goals", "Insta-rewards on UPI"],
    bestFor: "Zero-balance + UPI-heavy users",
    ctaUrl: "https://jupiter.money/?ref=IPOPULSE",
    payoutInr: 400,
  },
  {
    category: "savings-account",
    slug: "niyox-savings",
    brand: "NiyoX",
    productName: "Wealth + Savings",
    rateLabel: "Up to 7% p.a.",
    fee: "₹0",
    highlight: "Zero forex markup",
    features: ["Equitas SFB backed", "Forex markup ₹0 on debit (huge for travelers)", "Globally-accepted Visa", "Wealth feature for in-app investments"],
    bestFor: "Frequent international spenders",
    ctaUrl: "https://niyox.in/?ref=IPOPULSE",
    payoutInr: 200,
  },
  {
    category: "savings-account",
    slug: "idfc-first-savings",
    brand: "IDFC FIRST Bank",
    productName: "Premium Savings",
    rateLabel: "Up to 7.5% p.a.",
    rateNumeric: 7.5,
    fee: "₹10,000 AMB",
    highlight: "Top interest rate",
    features: ["7.5% on balance up to ₹10L", "Premium debit card with airport lounge", "Cashback on debit card", "Insta savings on FD bookings"],
    bestFor: "₹5L+ idle balance — best risk-adjusted return",
    ctaUrl: "https://www.idfcfirstbank.com/personal-banking/accounts/savings-account?ref=IPOPULSE",
    payoutInr: 400,
  },

  // Business loans
  {
    category: "business-loan",
    slug: "lendingkart-business-loan",
    brand: "Lendingkart",
    productName: "Business Loan (Unsecured)",
    rateLabel: "From 12% p.a.",
    rateNumeric: 12,
    fee: "2-3% processing",
    highlight: "Fast approval",
    features: ["Up to ₹2 Cr unsecured", "Disbursal in 72 hours", "1-3 year tenure", "GST + bank statements only — no balance sheet"],
    bestFor: "MSMEs needing working capital fast",
    ctaUrl: "https://www.lendingkart.com/business-loan?ref=IPOPULSE",
    payoutInr: 800,
  },
  {
    category: "business-loan",
    slug: "bajaj-business-loan",
    brand: "Bajaj Finserv",
    productName: "Business Loan",
    rateLabel: "From 13% p.a.",
    rateNumeric: 13,
    fee: "Up to 2%",
    highlight: "Up to ₹50L",
    features: ["Flexible repayment", "Pre-approved for existing customers", "Tenure up to 8 years", "Top-up available"],
    bestFor: "Established MSME with 3+ years vintage",
    ctaUrl: "https://www.bajajfinserv.in/business-loan?ref=IPOPULSE",
    payoutInr: 700,
  },
  {
    category: "business-loan",
    slug: "iifl-business-loan",
    brand: "IIFL Finance",
    productName: "Business Loan",
    rateLabel: "From 13.49% p.a.",
    rateNumeric: 13.49,
    fee: "1-2%",
    highlight: "Branch network",
    features: ["Up to ₹50L", "Doorstep documentation", "Tenure up to 60 months", "GST-based eligibility"],
    bestFor: "Tier-2/3 cities with branch presence",
    ctaUrl: "https://www.iifl.com/business-loans?ref=IPOPULSE",
    payoutInr: 600,
  },

  // Car loans
  {
    category: "car-loan",
    slug: "sbi-car-loan",
    brand: "SBI",
    productName: "Car Loan",
    rateLabel: "From 8.75% p.a.",
    rateNumeric: 8.75,
    fee: "0.5% (max ₹10,000)",
    highlight: "Lowest rate",
    features: ["Up to 90% on-road", "7-year tenure", "Women borrowers: 0.05% lower", "Zero foreclosure for floating-rate after 12 months"],
    bestFor: "Lowest cost overall",
    ctaUrl: "https://www.bankbazaar.com/car-loan.html?ref=IPOPULSE",
    payoutInr: 1000,
  },
  {
    category: "car-loan",
    slug: "hdfc-car-loan",
    brand: "HDFC Bank",
    productName: "Car Loan",
    rateLabel: "From 8.95% p.a.",
    rateNumeric: 8.95,
    fee: "0.5%",
    highlight: "Same-day sanction",
    features: ["Pre-approved for HDFC salary account", "100% on-road for select dealers", "Doorstep documentation", "EMI starts at ₹1,800/lakh"],
    bestFor: "HDFC customers + new cars",
    ctaUrl: "https://www.hdfcbank.com/personal/borrow/popular-loans/new-car-loan?ref=IPOPULSE",
    payoutInr: 1000,
  },
  {
    category: "car-loan",
    slug: "icici-car-loan",
    brand: "ICICI Bank",
    productName: "Car Loan",
    rateLabel: "From 9.10% p.a.",
    rateNumeric: 9.1,
    fee: "0.5-1%",
    highlight: "Used car friendly",
    features: ["New + used cars", "Up to 8-year tenure", "iMobile digital application", "Top-up loan against existing car"],
    bestFor: "Used car (3-7 years old)",
    ctaUrl: "https://www.icicibank.com/personal-banking/loans/car-loan?ref=IPOPULSE",
    payoutInr: 1000,
  },
];

export function getFinanceCategory(slug: string): FinanceCategoryMeta | undefined {
  return financeCategories.find((c) => c.slug === slug);
}

export function productsForCategory(slug: FinanceCategory): FinanceProduct[] {
  return financeProducts.filter((p) => p.category === slug);
}
