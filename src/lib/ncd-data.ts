export interface NCD {
  slug: string;
  issuer: string;
  rating: string;
  ratingAgency: string;
  coupon: number; // annual %
  frequency: string;
  faceValue: number;
  issueDate: string;
  maturityDate: string;
  tenor: string;
  secured: boolean;
  listed: boolean;
  nseSymbol?: string;
  sector: string;
  description: string;
}

export const ncds: NCD[] = [
  {
    slug: "muthoot-finance-ncd-2024",
    issuer: "Muthoot Finance",
    rating: "AA+",
    ratingAgency: "CRISIL",
    coupon: 8.75,
    frequency: "Annual",
    faceValue: 1000,
    issueDate: "2024-04-15",
    maturityDate: "2027-04-15",
    tenor: "3 years",
    secured: true,
    listed: true,
    nseSymbol: "MUTHOOTFIN24",
    sector: "Gold NBFC",
    description:
      "Secured NCDs from India's largest gold loan NBFC. Backed by gold loan receivables. Strong track record of repayment.",
  },
  {
    slug: "shriram-finance-ncd-2024",
    issuer: "Shriram Finance",
    rating: "AA+",
    ratingAgency: "ICRA",
    coupon: 9.10,
    frequency: "Monthly",
    faceValue: 1000,
    issueDate: "2024-06-10",
    maturityDate: "2029-06-10",
    tenor: "5 years",
    secured: true,
    listed: true,
    nseSymbol: "SHRIRAMFIN24",
    sector: "Vehicle Finance NBFC",
    description:
      "Secured NCDs from Shriram Finance, a leading commercial vehicle and consumer finance NBFC. Monthly income option available.",
  },
  {
    slug: "mahindra-finance-ncd-2023",
    issuer: "Mahindra Finance",
    rating: "AAA",
    ratingAgency: "CRISIL",
    coupon: 8.05,
    frequency: "Annual",
    faceValue: 1000,
    issueDate: "2023-12-01",
    maturityDate: "2026-12-01",
    tenor: "3 years",
    secured: true,
    listed: true,
    nseSymbol: "MMFSL23",
    sector: "Vehicle Finance NBFC",
    description:
      "AAA-rated secured NCDs from Mahindra & Mahindra Financial Services. Primarily lends to rural and semi-urban vehicle buyers.",
  },
  {
    slug: "bajaj-finance-ncd-2024",
    issuer: "Bajaj Finance",
    rating: "AAA",
    ratingAgency: "CRISIL",
    coupon: 8.30,
    frequency: "Quarterly",
    faceValue: 1000,
    issueDate: "2024-03-18",
    maturityDate: "2027-03-18",
    tenor: "3 years",
    secured: false,
    listed: true,
    nseSymbol: "BAJFINANCE24",
    sector: "Consumer Finance NBFC",
    description:
      "Unsecured NCDs from Bajaj Finance, India's largest retail-focused NBFC. Quarterly interest payouts. Highest domestic credit rating.",
  },
  {
    slug: "tata-capital-ncd-2024",
    issuer: "Tata Capital Financial Services",
    rating: "AAA",
    ratingAgency: "CRISIL",
    coupon: 8.15,
    frequency: "Annual",
    faceValue: 1000,
    issueDate: "2024-02-05",
    maturityDate: "2029-02-05",
    tenor: "5 years",
    secured: true,
    listed: true,
    nseSymbol: "TATACAP24",
    sector: "Diversified NBFC",
    description:
      "Secured NCDs from the Tata Group's financial services arm. Offers housing, SME, and consumer loans. Backed by Tata Sons.",
  },
  {
    slug: "hdfc-ltd-ncd-legacy",
    issuer: "HDFC Ltd (Legacy)",
    rating: "AAA",
    ratingAgency: "CRISIL",
    coupon: 7.85,
    frequency: "Annual",
    faceValue: 1000,
    issueDate: "2022-08-15",
    maturityDate: "2026-08-15",
    tenor: "4 years",
    secured: true,
    listed: true,
    nseSymbol: "HDFC22NCD",
    sector: "Housing Finance",
    description:
      "Legacy secured NCDs issued by HDFC Ltd before its merger with HDFC Bank. Obligations transferred to HDFC Bank post-merger. Matures August 2026.",
  },
  {
    slug: "indiabulls-housing-ncd-2023",
    issuer: "Sammaan Capital (IndiaBulls HF)",
    rating: "AA",
    ratingAgency: "ICRA",
    coupon: 10.25,
    frequency: "Monthly",
    faceValue: 1000,
    issueDate: "2023-09-20",
    maturityDate: "2026-09-20",
    tenor: "3 years",
    secured: true,
    listed: true,
    nseSymbol: "SAMMAAN23",
    sector: "Housing Finance",
    description:
      "Secured NCDs from Sammaan Capital (rebranded from IndiaBulls Housing Finance). Higher yield reflects elevated risk vs AAA issuers. Monthly income option.",
  },
  {
    slug: "adani-ports-ncd-2024",
    issuer: "Adani Ports & SEZ",
    rating: "AA+",
    ratingAgency: "CARE",
    coupon: 8.90,
    frequency: "Annual",
    faceValue: 1000,
    issueDate: "2024-05-10",
    maturityDate: "2029-05-10",
    tenor: "5 years",
    secured: false,
    listed: true,
    nseSymbol: "ADANIPORTS24",
    sector: "Infrastructure / Ports",
    description:
      "Unsecured NCDs from Adani Ports, India's largest private port operator. Long tenure offers higher yield. Revenue backed by port concession agreements.",
  },
  {
    slug: "iifl-finance-ncd-2024",
    issuer: "IIFL Finance",
    rating: "AA",
    ratingAgency: "CRISIL",
    coupon: 9.60,
    frequency: "Quarterly",
    faceValue: 1000,
    issueDate: "2024-07-01",
    maturityDate: "2027-07-01",
    tenor: "3 years",
    secured: true,
    listed: true,
    nseSymbol: "IIFLFINANCE24",
    sector: "Retail NBFC",
    description:
      "Secured NCDs from IIFL Finance offering gold loans, home loans, and microfinance. Higher yield than AAA peers reflects AA rating.",
  },
  {
    slug: "piramal-capital-ncd-2023",
    issuer: "Piramal Capital & Housing Finance",
    rating: "AA",
    ratingAgency: "ICRA",
    coupon: 10.00,
    frequency: "Annual",
    faceValue: 1000,
    issueDate: "2023-11-15",
    maturityDate: "2027-11-15",
    tenor: "4 years",
    secured: true,
    listed: true,
    nseSymbol: "PIRAMALCAP23",
    sector: "Housing Finance",
    description:
      "Secured NCDs from Piramal Capital, offering real estate and housing finance. Higher yield premium reflects the wholesale lending segment exposure.",
  },
];

export const ratingColors: Record<string, { bg: string; text: string; label: string }> = {
  AAA:   { bg: "bg-green-100",  text: "text-green-800",  label: "AAA" },
  "AA+": { bg: "bg-teal-100",   text: "text-teal-800",   label: "AA+" },
  AA:    { bg: "bg-yellow-100", text: "text-yellow-800", label: "AA" },
  "AA-": { bg: "bg-orange-100", text: "text-orange-800", label: "AA-" },
  "A+":  { bg: "bg-amber-100",  text: "text-amber-800",  label: "A+" },
};

export function getRatingColor(rating: string) {
  return ratingColors[rating] ?? { bg: "bg-gray-100", text: "text-gray-700", label: rating };
}
