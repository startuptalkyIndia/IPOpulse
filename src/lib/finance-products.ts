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
      "An unsecured personal loan covers emergencies, weddings, travel, education, or debt consolidation. Approved in 24–48 hours with minimal documents. Rates depend on your CIBIL (750+ gets best), income, and employer category.",
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
      "A home loan typically runs 15–30 years at floating rate. Tax: ₹2L deduction on interest under Section 24(b), ₹1.5L on principal under 80C. Floating-rate home loans for individuals have ZERO prepayment penalty per RBI rule.",
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
      "Neobanks (Jupiter, Fi, NiyoX) offer ₹0 minimum balance, instant account opening, free debit card, and 6–7% interest on idle balance. Traditional banks require ₹10,000–₹50,000 average balance but offer FD-linked sweep features.",
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
      "Business loans for MSMEs and proprietorships. Most lenders need 2 years' ITR + 1 year bank statements. Ticket sizes ₹50k to ₹50L. Interest depends on revenue, vintage, and collateral.",
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
      "Banks finance up to 90% of on-road price for new cars (typically 80–85% for used cars 5+ years old). EMIs start as low as ₹1,800 per ₹1 lakh borrowed at 8.75% for 5-year tenure. Most lenders charge 1–2% prepayment fee.",
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
