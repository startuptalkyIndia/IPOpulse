/**
 * Seed batch 2 — Nifty 100 expansion (50 more companies beyond the initial 30).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const companies = [
  { name: "Coal India", slug: "coal-india", bseCode: "533278", nseSymbol: "COALINDIA", sector: "Mining", industry: "Coal", marketCap: 285000 },
  { name: "Tech Mahindra", slug: "tech-mahindra", bseCode: "532755", nseSymbol: "TECHM", sector: "IT", industry: "IT Services", marketCap: 165000 },
  { name: "Tata Steel", slug: "tata-steel", bseCode: "500470", nseSymbol: "TATASTEEL", sector: "Metals", industry: "Steel", marketCap: 200000 },
  { name: "JSW Steel", slug: "jsw-steel", bseCode: "500228", nseSymbol: "JSWSTEEL", sector: "Metals", industry: "Steel", marketCap: 230000 },
  { name: "Hindalco", slug: "hindalco", bseCode: "500440", nseSymbol: "HINDALCO", sector: "Metals", industry: "Aluminium", marketCap: 180000 },
  { name: "Vedanta", slug: "vedanta", bseCode: "500295", nseSymbol: "VEDL", sector: "Metals", industry: "Diversified", marketCap: 195000 },
  { name: "Indian Oil Corp", slug: "indian-oil-corp", bseCode: "530965", nseSymbol: "IOC", sector: "Oil & Gas", industry: "Oil Marketing", marketCap: 215000 },
  { name: "BPCL", slug: "bpcl", bseCode: "500547", nseSymbol: "BPCL", sector: "Oil & Gas", industry: "Oil Marketing", marketCap: 145000 },
  { name: "ONGC", slug: "ongc", bseCode: "500312", nseSymbol: "ONGC", sector: "Oil & Gas", industry: "Upstream", marketCap: 350000 },
  { name: "GAIL India", slug: "gail-india", bseCode: "532155", nseSymbol: "GAIL", sector: "Oil & Gas", industry: "Gas Transmission", marketCap: 130000 },
  { name: "Eicher Motors", slug: "eicher-motors", bseCode: "505200", nseSymbol: "EICHERMOT", sector: "Auto", industry: "Two-wheelers", marketCap: 130000 },
  { name: "Bajaj Auto", slug: "bajaj-auto", bseCode: "532977", nseSymbol: "BAJAJ-AUTO", sector: "Auto", industry: "Two-wheelers", marketCap: 290000 },
  { name: "Hero MotoCorp", slug: "hero-motocorp", bseCode: "500182", nseSymbol: "HEROMOTOCO", sector: "Auto", industry: "Two-wheelers", marketCap: 95000 },
  { name: "TVS Motor", slug: "tvs-motor", bseCode: "532343", nseSymbol: "TVSMOTOR", sector: "Auto", industry: "Two-wheelers", marketCap: 165000 },
  { name: "Britannia Industries", slug: "britannia", bseCode: "500825", nseSymbol: "BRITANNIA", sector: "FMCG", industry: "Packaged Foods", marketCap: 130000 },
  { name: "Dabur India", slug: "dabur-india", bseCode: "500096", nseSymbol: "DABUR", sector: "FMCG", industry: "Personal Care", marketCap: 88000 },
  { name: "Marico", slug: "marico", bseCode: "531642", nseSymbol: "MARICO", sector: "FMCG", industry: "Personal Care", marketCap: 75000 },
  { name: "Godrej Consumer", slug: "godrej-consumer", bseCode: "532424", nseSymbol: "GODREJCP", sector: "FMCG", industry: "Personal Care", marketCap: 130000 },
  { name: "Tata Consumer", slug: "tata-consumer", bseCode: "500800", nseSymbol: "TATACONSUM", sector: "FMCG", industry: "Beverages", marketCap: 100000 },
  { name: "Adani Ports", slug: "adani-ports", bseCode: "532921", nseSymbol: "ADANIPORTS", sector: "Infrastructure", industry: "Ports", marketCap: 270000 },
  { name: "Adani Power", slug: "adani-power", bseCode: "533096", nseSymbol: "ADANIPOWER", sector: "Power", industry: "Power Generation", marketCap: 220000 },
  { name: "Adani Green Energy", slug: "adani-green-energy", bseCode: "541450", nseSymbol: "ADANIGREEN", sector: "Power", industry: "Renewables", marketCap: 200000 },
  { name: "Pidilite Industries", slug: "pidilite", bseCode: "500331", nseSymbol: "PIDILITIND", sector: "Chemicals", industry: "Adhesives", marketCap: 145000 },
  { name: "UPL", slug: "upl", bseCode: "512070", nseSymbol: "UPL", sector: "Chemicals", industry: "Agrochemicals", marketCap: 50000 },
  { name: "SRF", slug: "srf", bseCode: "503806", nseSymbol: "SRF", sector: "Chemicals", industry: "Specialty Chemicals", marketCap: 75000 },
  { name: "Cipla", slug: "cipla", bseCode: "500087", nseSymbol: "CIPLA", sector: "Pharma", industry: "Pharmaceuticals", marketCap: 130000 },
  { name: "Dr. Reddy's", slug: "dr-reddys", bseCode: "500124", nseSymbol: "DRREDDY", sector: "Pharma", industry: "Pharmaceuticals", marketCap: 110000 },
  { name: "Lupin", slug: "lupin", bseCode: "500257", nseSymbol: "LUPIN", sector: "Pharma", industry: "Pharmaceuticals", marketCap: 90000 },
  { name: "Apollo Hospitals", slug: "apollo-hospitals", bseCode: "508869", nseSymbol: "APOLLOHOSP", sector: "Healthcare", industry: "Hospitals", marketCap: 100000 },
  { name: "Max Healthcare", slug: "max-healthcare", bseCode: "543220", nseSymbol: "MAXHEALTH", sector: "Healthcare", industry: "Hospitals", marketCap: 110000 },
  { name: "Indusind Bank", slug: "indusind-bank", bseCode: "532187", nseSymbol: "INDUSINDBK", sector: "Banking", industry: "Private Bank", marketCap: 110000 },
  { name: "Punjab National Bank", slug: "pnb", bseCode: "532461", nseSymbol: "PNB", sector: "Banking", industry: "PSU Bank", marketCap: 130000 },
  { name: "Bank of Baroda", slug: "bank-of-baroda", bseCode: "532134", nseSymbol: "BANKBARODA", sector: "Banking", industry: "PSU Bank", marketCap: 130000 },
  { name: "Federal Bank", slug: "federal-bank", bseCode: "500469", nseSymbol: "FEDERALBNK", sector: "Banking", industry: "Private Bank", marketCap: 50000 },
  { name: "IDFC First Bank", slug: "idfc-first-bank", bseCode: "539437", nseSymbol: "IDFCFIRSTB", sector: "Banking", industry: "Private Bank", marketCap: 60000 },
  { name: "HDFC Life", slug: "hdfc-life", bseCode: "540777", nseSymbol: "HDFCLIFE", sector: "Insurance", industry: "Life Insurance", marketCap: 145000 },
  { name: "SBI Life", slug: "sbi-life", bseCode: "540719", nseSymbol: "SBILIFE", sector: "Insurance", industry: "Life Insurance", marketCap: 140000 },
  { name: "ICICI Lombard", slug: "icici-lombard", bseCode: "540716", nseSymbol: "ICICIGI", sector: "Insurance", industry: "General Insurance", marketCap: 90000 },
  { name: "BSE Limited", slug: "bse-limited", bseCode: "540577", nseSymbol: "BSE", sector: "Capital Markets", industry: "Exchange", marketCap: 55000 },
  { name: "Multi Commodity Exchange", slug: "mcx-india", bseCode: "534091", nseSymbol: "MCX", sector: "Capital Markets", industry: "Exchange", marketCap: 40000 },
  { name: "HDFC AMC", slug: "hdfc-amc", bseCode: "541729", nseSymbol: "HDFCAMC", sector: "Capital Markets", industry: "Asset Management", marketCap: 95000 },
  { name: "Nippon India AMC", slug: "nippon-amc", bseCode: "540767", nseSymbol: "NAM-INDIA", sector: "Capital Markets", industry: "Asset Management", marketCap: 35000 },
  { name: "Polycab", slug: "polycab", bseCode: "542652", nseSymbol: "POLYCAB", sector: "Industrials", industry: "Cables", marketCap: 110000 },
  { name: "Havells India", slug: "havells", bseCode: "517354", nseSymbol: "HAVELLS", sector: "Industrials", industry: "Electricals", marketCap: 110000 },
  { name: "Voltas", slug: "voltas", bseCode: "500575", nseSymbol: "VOLTAS", sector: "Consumer Durables", industry: "Air Conditioning", marketCap: 65000 },
  { name: "Bharat Electronics", slug: "bharat-electronics", bseCode: "500049", nseSymbol: "BEL", sector: "Defence", industry: "Electronics", marketCap: 200000 },
  { name: "HAL", slug: "hindustan-aeronautics", bseCode: "541154", nseSymbol: "HAL", sector: "Defence", industry: "Aerospace", marketCap: 250000 },
  { name: "Mazagon Dock", slug: "mazagon-dock", bseCode: "543237", nseSymbol: "MAZDOCK", sector: "Defence", industry: "Shipbuilding", marketCap: 65000 },
  { name: "Indigo (InterGlobe Aviation)", slug: "indigo-airlines", bseCode: "539448", nseSymbol: "INDIGO", sector: "Aviation", industry: "Airlines", marketCap: 160000 },
  { name: "Nykaa (FSN E-Commerce)", slug: "nykaa", bseCode: "543384", nseSymbol: "NYKAA", sector: "Consumer Tech", industry: "E-commerce", marketCap: 40000 },
];

async function main() {
  console.log(`Seeding ${companies.length} more companies...`);
  for (const c of companies) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: c,
      create: { ...c, active: true, isSme: false },
    });
  }
  const total = await prisma.company.count();
  console.log(`Done. Master now has ${total} companies.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
