export interface REIT {
  slug: string;
  name: string;
  type: "REIT" | "InvIT";
  exchange: "NSE" | "BSE";
  symbol: string;
  sponsor: string;
  sector: string;
  aum: string;
  distributionYield: string;
  unitPrice: number;
  listingDate: string;
  description: string;
  properties: string;
  topTenants?: string[];
  learnMore: string;
  nseUrl?: string;
}

export const reits: REIT[] = [
  {
    slug: "embassy-office-parks",
    name: "Embassy Office Parks REIT",
    type: "REIT",
    exchange: "NSE",
    symbol: "EMBASSY",
    sponsor: "Embassy Group & Blackstone",
    sector: "Office",
    aum: "₹45,400 Cr",
    distributionYield: "6.4%",
    unitPrice: 362,
    listingDate: "2019-04-01",
    description:
      "India's first and largest REIT, with a Grade-A office portfolio across Bengaluru, Mumbai, Pune, NCR, and Hyderabad. Hosts marquee global MNCs and technology companies.",
    properties: "45M sq ft across Bengaluru, Mumbai, Pune, NCR",
    topTenants: ["JP Morgan", "Google", "IBM", "Nokia", "WeWork", "Cognizant"],
    learnMore: "/learn/what-is-reit",
    nseUrl: "https://www.nseindia.com/get-quotes/equity?symbol=EMBASSY",
  },
  {
    slug: "mindspace-business-parks",
    name: "Mindspace Business Parks REIT",
    type: "REIT",
    exchange: "NSE",
    symbol: "MINDSPACE",
    sponsor: "K Raheja Corp & Blackstone",
    sector: "Office",
    aum: "₹32,600 Cr",
    distributionYield: "6.8%",
    unitPrice: 318,
    listingDate: "2020-08-07",
    description:
      "Premium Grade-A office REIT with parks across Hyderabad, Mumbai, Pune, and Chennai. Known for campus-style IT parks with large floor plates.",
    properties: "32M sq ft across Hyderabad, Mumbai, Pune, Chennai",
    topTenants: ["Accenture", "Barclays", "Qualcomm", "Amazon", "Schlumberger"],
    learnMore: "/learn/what-is-reit",
    nseUrl: "https://www.nseindia.com/get-quotes/equity?symbol=MINDSPACE",
  },
  {
    slug: "brookfield-india-reit",
    name: "Brookfield India Real Estate Trust",
    type: "REIT",
    exchange: "NSE",
    symbol: "BIRET",
    sponsor: "Brookfield Asset Management",
    sector: "Office",
    aum: "₹16,200 Cr",
    distributionYield: "7.4%",
    unitPrice: 274,
    listingDate: "2021-02-17",
    description:
      "Office REIT sponsored by global alternative asset manager Brookfield. Portfolio concentrated in Gurugram, Noida, Mumbai, and Kolkata with high occupancy from global captives.",
    properties: "18.7M sq ft across Gurugram, Noida, Mumbai, Kolkata",
    topTenants: ["Cognizant", "Wipro", "TCS", "Accenture", "Bank of America"],
    learnMore: "/learn/what-is-reit",
    nseUrl: "https://www.nseindia.com/get-quotes/equity?symbol=BIRET",
  },
  {
    slug: "nexus-select-trust",
    name: "Nexus Select Trust",
    type: "REIT",
    exchange: "NSE",
    symbol: "NEXUS",
    sponsor: "Blackstone",
    sector: "Retail",
    aum: "₹15,800 Cr",
    distributionYield: "6.1%",
    unitPrice: 132,
    listingDate: "2023-05-19",
    description:
      "India's first retail REIT, owning 17 operational Grade-A urban consumption centres (malls) across 14 major cities. Beneficiary of India's rising consumer spending.",
    properties: "17 malls across Bengaluru, Mumbai, Hyderabad, Chennai, Pune, Ahmedabad and more",
    topTenants: ["H&M", "Zara", "Apple", "PVR Cinemas", "Food Court anchors"],
    learnMore: "/learn/what-is-reit",
    nseUrl: "https://www.nseindia.com/get-quotes/equity?symbol=NEXUS",
  },
];

export const invits: REIT[] = [
  {
    slug: "irb-invit-fund",
    name: "IRB InvIT Fund",
    type: "InvIT",
    exchange: "NSE",
    symbol: "IRB",
    sponsor: "IRB Infrastructure Developers",
    sector: "Roads",
    aum: "₹14,200 Cr",
    distributionYield: "9.2%",
    unitPrice: 58,
    listingDate: "2017-05-18",
    description:
      "India's first publicly listed InvIT, owning toll road assets across Maharashtra, Karnataka, Rajasthan, and Gujarat. Revenue is driven by traffic volumes on national highways.",
    properties: "16 toll-road projects covering ~3,200 km of national highways",
    learnMore: "/learn/what-is-reit",
    nseUrl: "https://www.nseindia.com/get-quotes/equity?symbol=IRB",
  },
  {
    slug: "powergrid-invit",
    name: "Powergrid Infrastructure Investment Trust",
    type: "InvIT",
    exchange: "NSE",
    symbol: "POWERGRID",
    sponsor: "Power Grid Corporation of India",
    sector: "Power Transmission",
    aum: "₹10,600 Cr",
    distributionYield: "8.1%",
    unitPrice: 97,
    listingDate: "2021-05-14",
    description:
      "InvIT backed by Power Grid Corporation of India, owning five inter-state power transmission assets. Revenue is regulated with long-term transmission service agreements.",
    properties: "5 transmission assets with ~3,698 circuit km of power lines",
    learnMore: "/learn/what-is-reit",
    nseUrl: "https://www.nseindia.com/get-quotes/equity?symbol=POWERGRID",
  },
  {
    slug: "indigrid",
    name: "IndiGrid InvIT (India Grid Trust)",
    type: "InvIT",
    exchange: "NSE",
    symbol: "INDIGRID",
    sponsor: "Sterlite Power",
    sector: "Power Transmission",
    aum: "₹17,400 Cr",
    distributionYield: "9.8%",
    unitPrice: 133,
    listingDate: "2017-06-21",
    description:
      "India's first power sector InvIT, owning inter-state high-voltage transmission lines. Portfolio has grown to become one of the largest privately operated transmission networks in India.",
    properties: "30+ transmission assets, ~8,200 circuit km of power lines across 13 states",
    learnMore: "/learn/what-is-reit",
    nseUrl: "https://www.nseindia.com/get-quotes/equity?symbol=INDIGRID",
  },
  {
    slug: "nhai-invit",
    name: "National Highways Infra Trust (NHAI InvIT)",
    type: "InvIT",
    exchange: "NSE",
    symbol: "NHAI_INV",
    sponsor: "National Highways Authority of India",
    sector: "Roads",
    aum: "₹9,800 Cr",
    distributionYield: "8.6%",
    unitPrice: 102,
    listingDate: "2021-11-19",
    description:
      "Government-backed InvIT sponsored by NHAI, owning operational toll road assets across five states. Offers quasi-sovereign credit quality with infrastructure-linked returns.",
    properties: "5 operational toll road projects covering ~682 km",
    learnMore: "/learn/what-is-reit",
    nseUrl: "https://www.nseindia.com/get-quotes/equity?symbol=NHAI_INV",
  },
  {
    slug: "bharat-highways-invit",
    name: "Bharat Highways InvIT",
    type: "InvIT",
    exchange: "NSE",
    symbol: "BHARAT_INV",
    sponsor: "Bharat Road Network",
    sector: "Roads",
    aum: "₹2,600 Cr",
    distributionYield: "10.1%",
    unitPrice: 94,
    listingDate: "2024-03-07",
    description:
      "Newest publicly listed road InvIT in India, owning operational NHAI HAM projects in Punjab, Uttar Pradesh, and Andhra Pradesh with annuity-based revenue.",
    properties: "4 HAM road projects covering ~519 km across 3 states",
    learnMore: "/learn/what-is-reit",
    nseUrl: "https://www.nseindia.com/get-quotes/equity?symbol=BHARAT_INV",
  },
];
