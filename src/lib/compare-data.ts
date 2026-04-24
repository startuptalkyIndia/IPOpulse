/**
 * Hand-curated comparison data. Rates/features were current as of 2026-04-25.
 * Affiliate links need to be swapped with real affiliate IDs when partnerships go live.
 */

export interface Broker {
  slug: string;
  name: string;
  type: "discount" | "full-service";
  accountOpening: string;
  amc: string;
  equityDelivery: string;
  equityIntraday: string;
  fno: string;
  features: string[];
  bestFor: string;
  ctaUrl: string;
}

export const brokers: Broker[] = [
  {
    slug: "zerodha",
    name: "Zerodha",
    type: "discount",
    accountOpening: "Free",
    amc: "₹300/yr",
    equityDelivery: "₹0",
    equityIntraday: "₹20/order (flat)",
    fno: "₹20/order (flat)",
    features: ["Kite platform (best-in-class)", "Console reporting", "Varsity education", "₹500/mo API access"],
    bestFor: "Serious retail investors & algo traders",
    ctaUrl: "https://zerodha.com/open-account/",
  },
  {
    slug: "groww",
    name: "Groww",
    type: "discount",
    accountOpening: "Free",
    amc: "Free",
    equityDelivery: "₹20/order or 0.1% (whichever lower)",
    equityIntraday: "₹20/order or 0.05%",
    fno: "₹20/order",
    features: ["Mobile-first UX", "Direct mutual funds", "IPO apply via UPI", "No AMC"],
    bestFor: "Beginners and mobile-only users",
    ctaUrl: "https://groww.in/",
  },
  {
    slug: "upstox",
    name: "Upstox",
    type: "discount",
    accountOpening: "Free",
    amc: "₹150/yr",
    equityDelivery: "₹20/order or 2.5%",
    equityIntraday: "₹20/order",
    fno: "₹20/order",
    features: ["API access (free)", "Upstox Pro platform", "Margin trading facility", "Backed by Ratan Tata"],
    bestFor: "Free API + intraday traders",
    ctaUrl: "https://upstox.com/",
  },
  {
    slug: "angel-one",
    name: "Angel One",
    type: "discount",
    accountOpening: "Free",
    amc: "₹240/yr (after Y1)",
    equityDelivery: "₹0",
    equityIntraday: "₹20/order",
    fno: "₹20/order",
    features: ["SmartAPI (free)", "Angel iTrade Prime", "Advisory reports", "Research desk"],
    bestFor: "Investors who want research reports",
    ctaUrl: "https://www.angelone.in/",
  },
  {
    slug: "dhan",
    name: "Dhan",
    type: "discount",
    accountOpening: "Free",
    amc: "Free",
    equityDelivery: "₹0 (up to ₹1 Cr)",
    equityIntraday: "₹20/order",
    fno: "₹20/order",
    features: ["Zero AMC", "TradingView integrated", "Options strategy builder", "Super-trader platform"],
    bestFor: "Options & F&O traders",
    ctaUrl: "https://dhan.co/",
  },
  {
    slug: "icici-direct",
    name: "ICICI Direct",
    type: "full-service",
    accountOpening: "₹975",
    amc: "₹700/yr",
    equityDelivery: "0.275% – 0.55%",
    equityIntraday: "0.275%",
    fno: "₹35 or 0.05% per lot",
    features: ["3-in-1 account", "Research reports", "Branch support", "Full margin funding"],
    bestFor: "ICICI banking customers",
    ctaUrl: "https://www.icicidirect.com/",
  },
];

export interface CreditCard {
  slug: string;
  name: string;
  issuer: string;
  annualFee: string;
  joiningFee: string;
  rewardsRate: string;
  bestFor: string;
  features: string[];
  eligibility: string;
  ctaUrl: string;
}

export const creditCards: CreditCard[] = [
  {
    slug: "hdfc-regalia-gold",
    name: "HDFC Regalia Gold",
    issuer: "HDFC Bank",
    annualFee: "₹2,500 (waived at ₹4L spend)",
    joiningFee: "₹2,500",
    rewardsRate: "4 points / ₹150",
    bestFor: "Everyday spends + travel",
    features: ["Priority Pass (lounge)", "Dining discounts", "Milestone benefits ₹1,500 voucher"],
    eligibility: "Salary ₹3L+/mo or ITR ₹12L+",
    ctaUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-gold-credit-card",
  },
  {
    slug: "amazon-pay-icici",
    name: "Amazon Pay ICICI",
    issuer: "ICICI Bank",
    annualFee: "Free (lifetime)",
    joiningFee: "Free",
    rewardsRate: "5% on Amazon (Prime), 3% non-Prime, 2% other online, 1% offline",
    bestFor: "Amazon shoppers",
    features: ["Lifetime free", "No minimum spend", "Auto-redemption as Amazon Pay balance"],
    eligibility: "Salary ₹20k+/mo",
    ctaUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/amazon-pay-credit-card",
  },
  {
    slug: "sbi-cashback",
    name: "SBI Cashback Card",
    issuer: "SBI Card",
    annualFee: "₹999 (waived at ₹2L spend)",
    joiningFee: "₹999",
    rewardsRate: "5% cashback on all online",
    bestFor: "Online shoppers",
    features: ["1% offline cashback", "Cashback auto-credit next statement", "No rotating categories"],
    eligibility: "Salary ₹35k+/mo",
    ctaUrl: "https://www.sbicard.com/en/personal/credit-cards/shopping/sbi-cashback-credit-card.page",
  },
  {
    slug: "axis-magnus",
    name: "Axis Magnus",
    issuer: "Axis Bank",
    annualFee: "₹12,500 (waived at ₹25L spend)",
    joiningFee: "₹12,500",
    rewardsRate: "12 points / ₹200 base; 35 points on travel",
    bestFor: "High-spend travellers",
    features: ["Unlimited lounge access", "Complimentary Priority Pass membership", "Concierge", "Buy-one-get-one movie tickets"],
    eligibility: "ITR ₹18L+ or premier banking relationship",
    ctaUrl: "https://www.axisbank.com/retail/cards/credit-card/magnus-credit-card",
  },
  {
    slug: "hdfc-millennia",
    name: "HDFC Millennia",
    issuer: "HDFC Bank",
    annualFee: "₹1,000 (waived at ₹1L)",
    joiningFee: "₹1,000",
    rewardsRate: "5% cashback on 10 popular merchants (Amazon, Flipkart, Swiggy…); 1% others",
    bestFor: "Millennials, multi-merchant online",
    features: ["8 airport lounge visits/year", "10% off dining via Swiggy Dineout", "Fuel surcharge waiver"],
    eligibility: "Salary ₹35k+/mo",
    ctaUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-credit-card",
  },
  {
    slug: "american-express-platinum-travel",
    name: "Amex Platinum Travel",
    issuer: "American Express",
    annualFee: "₹5,000 + GST",
    joiningFee: "₹3,500",
    rewardsRate: "1 MR point / ₹50; big milestone vouchers at ₹1.9L/₹4L spend",
    bestFor: "Travel milestone hunters",
    features: ["₹7,700 + ₹11,800 travel voucher on milestones", "Priority Pass 8 visits/yr", "Amex Travel Online bookings"],
    eligibility: "Salary ₹6L+/yr, good credit history",
    ctaUrl: "https://www.americanexpress.com/in/credit-cards/platinum-travel-credit-card/",
  },
];
