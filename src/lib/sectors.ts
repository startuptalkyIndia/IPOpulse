export interface Sector {
  slug: string;
  name: string;
  niftyIndex?: string;
  description: string;
  topCompanies: string[]; // slugs
}

export const sectors: Sector[] = [
  {
    slug: "banking",
    name: "Banking",
    niftyIndex: "Nifty Bank",
    description: "Public and private sector banks. Largest sector in Nifty 50 by weight (~32%).",
    topCompanies: ["hdfc-bank", "icici-bank", "sbi", "kotak-mahindra-bank", "axis-bank"],
  },
  {
    slug: "it",
    name: "Information Technology",
    niftyIndex: "Nifty IT",
    description: "IT services + product companies. Large export earners; sensitive to US/Euro demand and USD/INR.",
    topCompanies: ["tcs", "infosys", "hcl-technologies", "wipro"],
  },
  {
    slug: "auto",
    name: "Automobile",
    niftyIndex: "Nifty Auto",
    description: "Passenger vehicles, commercial vehicles, 2-wheelers, and auto ancillaries.",
    topCompanies: ["maruti-suzuki", "tata-motors", "mahindra-mahindra"],
  },
  {
    slug: "pharma",
    name: "Pharmaceuticals",
    niftyIndex: "Nifty Pharma",
    description: "Generic manufacturing, branded formulations, and API/CDMO plays. Rupee hedge.",
    topCompanies: ["sun-pharma"],
  },
  {
    slug: "fmcg",
    name: "FMCG",
    niftyIndex: "Nifty FMCG",
    description: "Daily-use goods — packaged food, personal care, home care. Defensive, dividend-heavy.",
    topCompanies: ["hindustan-unilever", "itc", "nestle-india"],
  },
  {
    slug: "financial-services",
    name: "Financial Services",
    niftyIndex: "Nifty Financial Services",
    description: "NBFCs, asset managers, insurers, holding companies, capital markets.",
    topCompanies: ["bajaj-finance", "bajaj-finserv", "lic"],
  },
  {
    slug: "oil-gas",
    name: "Oil & Gas",
    description: "Upstream, downstream, gas transmission, and city gas distribution.",
    topCompanies: ["reliance-industries"],
  },
  {
    slug: "infrastructure",
    name: "Infrastructure",
    description: "Engineering, construction, EPC, and capital goods.",
    topCompanies: ["larsen-toubro", "adani-enterprises"],
  },
  {
    slug: "power",
    name: "Power & Utilities",
    description: "Generation, transmission, distribution, and renewable energy.",
    topCompanies: ["ntpc", "power-grid-corp"],
  },
  {
    slug: "telecom",
    name: "Telecom",
    description: "Mobile operators, fibre, enterprise connectivity.",
    topCompanies: ["bharti-airtel"],
  },
  {
    slug: "cement",
    name: "Cement",
    description: "Cement manufacturers — proxy for infrastructure and real estate.",
    topCompanies: ["ultratech-cement"],
  },
  {
    slug: "retail",
    name: "Retail",
    description: "Organised retail, supermarkets, and consumer durables.",
    topCompanies: ["avenue-supermarts", "titan-company"],
  },
];

export function getSectorBySlug(slug: string) {
  return sectors.find((s) => s.slug === slug);
}
