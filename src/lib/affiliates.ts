/**
 * Central affiliate registry.
 *
 * Replace `ref=IPOPULSE` placeholders with real affiliate IDs once Cuelinks /
 * INRDeals / direct broker partnerships are activated. The component layer
 * never hard-codes URLs — always go through `affiliateUrl(partner)`.
 *
 * Approximate India 2026 payouts captured here so we can priority-sort CTAs.
 */

export interface Affiliate {
  slug: string;
  name: string;
  category: "demat" | "credit-card" | "loan" | "insurance" | "tax" | "savings" | "investing";
  url: string;
  payoutType: "CPL" | "CPA" | "CPR" | "revshare";
  payoutInr: number; // approximate ₹ per successful conversion
  ctaShort: string; // 2-3 word CTA
  ctaLong: string;
  network?: "cuelinks" | "earnkaro" | "inrdeals" | "gromo" | "direct";
  partnerLogo?: string;
}

const REF = "IPOPULSE"; // placeholder until real partnership IDs go in

export const affiliates: Record<string, Affiliate> = {
  // Demat / brokers (highest payout)
  "angel-one": {
    slug: "angel-one",
    name: "Angel One",
    category: "demat",
    url: `https://www.angelone.in/open-demat-account?source=${REF}`,
    payoutType: "CPL",
    payoutInr: 750,
    ctaShort: "Open Free Demat",
    ctaLong: "Open free Demat in 5 mins · Angel One",
    network: "direct",
  },
  upstox: {
    slug: "upstox",
    name: "Upstox",
    category: "demat",
    url: `https://upstox.com/open-account/?f=${REF}`,
    payoutType: "CPA",
    payoutInr: 800,
    ctaShort: "Open Demat",
    ctaLong: "Open free Demat · Upstox (backed by Ratan Tata)",
    network: "earnkaro",
  },
  zerodha: {
    slug: "zerodha",
    name: "Zerodha",
    category: "demat",
    url: `https://zerodha.com/open-account/?c=${REF}`,
    payoutType: "revshare",
    payoutInr: 0,
    ctaShort: "Open Zerodha Demat",
    ctaLong: "Open Demat · Zerodha (India's #1 broker)",
    network: "direct",
  },
  groww: {
    slug: "groww",
    name: "Groww",
    category: "demat",
    url: `https://groww.in/?ref=${REF}`,
    payoutType: "CPA",
    payoutInr: 500,
    ctaShort: "Apply via Groww",
    ctaLong: "Open Demat & apply IPOs · Groww",
    network: "direct",
  },
  "5paisa": {
    slug: "5paisa",
    name: "5paisa",
    category: "demat",
    url: `https://www.5paisa.com/open-demat-account?ref=${REF}`,
    payoutType: "CPA",
    payoutInr: 600,
    ctaShort: "Open 5paisa Demat",
    ctaLong: "Open Demat · 5paisa",
    network: "cuelinks",
  },
  sharekhan: {
    slug: "sharekhan",
    name: "Sharekhan",
    category: "demat",
    url: `https://www.sharekhan.com/open-demat-account?ref=${REF}`,
    payoutType: "CPL",
    payoutInr: 1080,
    ctaShort: "Open Sharekhan Demat",
    ctaLong: "Open Demat · Sharekhan",
    network: "cuelinks",
  },
  dhan: {
    slug: "dhan",
    name: "Dhan",
    category: "demat",
    url: `https://dhan.co/?ref=${REF}`,
    payoutType: "CPA",
    payoutInr: 500,
    ctaShort: "Open Dhan Demat",
    ctaLong: "Open Demat · Dhan (built for traders)",
    network: "direct",
  },

  // Credit cards
  "hdfc-millennia": {
    slug: "hdfc-millennia",
    name: "HDFC Millennia",
    category: "credit-card",
    url: `https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-credit-card?ref=${REF}`,
    payoutType: "CPA",
    payoutInr: 1500,
    ctaShort: "Apply HDFC Millennia",
    ctaLong: "Apply HDFC Millennia · 5% cashback on Amazon, Flipkart, Swiggy",
    network: "direct",
  },
  "amazon-pay-icici": {
    slug: "amazon-pay-icici",
    name: "Amazon Pay ICICI",
    category: "credit-card",
    url: `https://www.icicibank.com/personal-banking/cards/credit-card/amazon-pay-credit-card?ref=${REF}`,
    payoutType: "CPA",
    payoutInr: 1200,
    ctaShort: "Apply Amazon Pay ICICI",
    ctaLong: "Apply Amazon Pay ICICI · Lifetime free, 5% on Amazon",
    network: "inrdeals",
  },
  "sbi-cashback": {
    slug: "sbi-cashback",
    name: "SBI Cashback",
    category: "credit-card",
    url: `https://www.sbicard.com/en/personal/credit-cards/shopping/sbi-cashback-credit-card.page?ref=${REF}`,
    payoutType: "CPA",
    payoutInr: 1400,
    ctaShort: "Apply SBI Cashback",
    ctaLong: "Apply SBI Cashback Card · 5% on all online",
    network: "inrdeals",
  },
  bankbazaar: {
    slug: "bankbazaar",
    name: "BankBazaar",
    category: "credit-card",
    url: `https://www.bankbazaar.com/credit-card.html?ref=${REF}`,
    payoutType: "CPL",
    payoutInr: 225,
    ctaShort: "Compare Credit Cards",
    ctaLong: "Compare 80+ credit cards · BankBazaar",
    network: "inrdeals",
  },

  // CIBIL / credit score
  paisabazaar: {
    slug: "paisabazaar",
    name: "Paisabazaar",
    category: "tax",
    url: `https://www.paisabazaar.com/credit-score/?ref=${REF}`,
    payoutType: "CPR",
    payoutInr: 20,
    ctaShort: "Check CIBIL Free",
    ctaLong: "Check your CIBIL score · Free, instant",
    network: "inrdeals",
  },

  // Loans
  bajaj: {
    slug: "bajaj",
    name: "Bajaj Finserv",
    category: "loan",
    url: `https://www.bajajfinserv.in/personal-loan?ref=${REF}`,
    payoutType: "CPL",
    payoutInr: 630,
    ctaShort: "Personal Loan from Bajaj",
    ctaLong: "Get a personal loan up to ₹40L · Bajaj Finserv",
    network: "cuelinks",
  },

  // Insurance
  "policybazaar-term": {
    slug: "policybazaar-term",
    name: "PolicyBazaar Term Insurance",
    category: "insurance",
    url: `https://www.policybazaar.com/life-insurance/term-insurance/?ref=${REF}`,
    payoutType: "CPL",
    payoutInr: 300,
    ctaShort: "Get Term Insurance",
    ctaLong: "Compare term plans · Save 50% on premium",
    network: "inrdeals",
  },

  // Tax filing
  cleartax: {
    slug: "cleartax",
    name: "ClearTax",
    category: "tax",
    url: `https://cleartax.in/s/income-tax-login?ref=${REF}`,
    payoutType: "CPA",
    payoutInr: 300,
    ctaShort: "File ITR Free",
    ctaLong: "File your ITR with ClearTax · CA-assisted available",
    network: "direct",
  },

  // Mutual funds (indirect — actually Groww demat)
  "groww-mf": {
    slug: "groww-mf",
    name: "Groww Mutual Funds",
    category: "investing",
    url: `https://groww.in/mutual-funds?ref=${REF}`,
    payoutType: "CPA",
    payoutInr: 500,
    ctaShort: "Start SIP free",
    ctaLong: "Start direct mutual fund SIP · Groww (zero commission)",
    network: "direct",
  },
};

export function affiliateUrl(slug: string): string | null {
  return affiliates[slug]?.url ?? null;
}

export function getAffiliate(slug: string): Affiliate | null {
  return affiliates[slug] ?? null;
}

export function topPayingDematBrokers(limit = 3): Affiliate[] {
  return Object.values(affiliates)
    .filter((a) => a.category === "demat")
    .sort((a, b) => b.payoutInr - a.payoutInr)
    .slice(0, limit);
}

export function affiliatesForCategory(category: Affiliate["category"]): Affiliate[] {
  return Object.values(affiliates)
    .filter((a) => a.category === category)
    .sort((a, b) => b.payoutInr - a.payoutInr);
}
