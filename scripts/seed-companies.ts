/**
 * Seed top 30 Indian listed companies so /ticker has content.
 * Live prices come later via Zerodha Kite Connect.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const companies = [
  // Top 30 by market cap + sector diversity
  { name: "Reliance Industries", slug: "reliance-industries", bseCode: "500325", nseSymbol: "RELIANCE", sector: "Oil & Gas", industry: "Diversified", marketCap: 1950000 },
  { name: "Tata Consultancy Services", slug: "tcs", bseCode: "532540", nseSymbol: "TCS", sector: "IT", industry: "IT Services", marketCap: 1520000 },
  { name: "HDFC Bank", slug: "hdfc-bank", bseCode: "500180", nseSymbol: "HDFCBANK", sector: "Banking", industry: "Private Bank", marketCap: 1385000 },
  { name: "ICICI Bank", slug: "icici-bank", bseCode: "532174", nseSymbol: "ICICIBANK", sector: "Banking", industry: "Private Bank", marketCap: 890000 },
  { name: "Bharti Airtel", slug: "bharti-airtel", bseCode: "532454", nseSymbol: "BHARTIARTL", sector: "Telecom", industry: "Telecom Services", marketCap: 920000 },
  { name: "Infosys", slug: "infosys", bseCode: "500209", nseSymbol: "INFY", sector: "IT", industry: "IT Services", marketCap: 720000 },
  { name: "State Bank of India", slug: "sbi", bseCode: "500112", nseSymbol: "SBIN", sector: "Banking", industry: "PSU Bank", marketCap: 710000 },
  { name: "Hindustan Unilever", slug: "hindustan-unilever", bseCode: "500696", nseSymbol: "HINDUNILVR", sector: "FMCG", industry: "Personal Products", marketCap: 620000 },
  { name: "Life Insurance Corporation", slug: "lic", bseCode: "543736", nseSymbol: "LICI", sector: "Insurance", industry: "Life Insurance", marketCap: 600000 },
  { name: "ITC", slug: "itc", bseCode: "500875", nseSymbol: "ITC", sector: "FMCG", industry: "Diversified", marketCap: 580000 },
  { name: "Larsen & Toubro", slug: "larsen-toubro", bseCode: "500510", nseSymbol: "LT", sector: "Infrastructure", industry: "Construction", marketCap: 530000 },
  { name: "HCL Technologies", slug: "hcl-technologies", bseCode: "532281", nseSymbol: "HCLTECH", sector: "IT", industry: "IT Services", marketCap: 470000 },
  { name: "Bajaj Finance", slug: "bajaj-finance", bseCode: "500034", nseSymbol: "BAJFINANCE", sector: "Financial Services", industry: "NBFC", marketCap: 455000 },
  { name: "Maruti Suzuki", slug: "maruti-suzuki", bseCode: "532500", nseSymbol: "MARUTI", sector: "Auto", industry: "Passenger Vehicles", marketCap: 400000 },
  { name: "Sun Pharmaceutical", slug: "sun-pharma", bseCode: "524715", nseSymbol: "SUNPHARMA", sector: "Pharma", industry: "Pharmaceuticals", marketCap: 395000 },
  { name: "Asian Paints", slug: "asian-paints", bseCode: "500820", nseSymbol: "ASIANPAINT", sector: "Paints", industry: "Consumer Durables", marketCap: 290000 },
  { name: "Tata Motors", slug: "tata-motors", bseCode: "500570", nseSymbol: "TATAMOTORS", sector: "Auto", industry: "Commercial Vehicles", marketCap: 310000 },
  { name: "Nestle India", slug: "nestle-india", bseCode: "500790", nseSymbol: "NESTLEIND", sector: "FMCG", industry: "Packaged Foods", marketCap: 250000 },
  { name: "Wipro", slug: "wipro", bseCode: "507685", nseSymbol: "WIPRO", sector: "IT", industry: "IT Services", marketCap: 265000 },
  { name: "UltraTech Cement", slug: "ultratech-cement", bseCode: "532538", nseSymbol: "ULTRACEMCO", sector: "Cement", industry: "Cement", marketCap: 330000 },
  { name: "Adani Enterprises", slug: "adani-enterprises", bseCode: "512599", nseSymbol: "ADANIENT", sector: "Infrastructure", industry: "Diversified", marketCap: 385000 },
  { name: "Kotak Mahindra Bank", slug: "kotak-mahindra-bank", bseCode: "500247", nseSymbol: "KOTAKBANK", sector: "Banking", industry: "Private Bank", marketCap: 370000 },
  { name: "Axis Bank", slug: "axis-bank", bseCode: "532215", nseSymbol: "AXISBANK", sector: "Banking", industry: "Private Bank", marketCap: 360000 },
  { name: "Titan Company", slug: "titan-company", bseCode: "500114", nseSymbol: "TITAN", sector: "Consumer Durables", industry: "Jewellery", marketCap: 300000 },
  { name: "Bajaj Finserv", slug: "bajaj-finserv", bseCode: "532978", nseSymbol: "BAJAJFINSV", sector: "Financial Services", industry: "Holding Company", marketCap: 280000 },
  { name: "Power Grid Corp", slug: "power-grid-corp", bseCode: "532898", nseSymbol: "POWERGRID", sector: "Power", industry: "Transmission", marketCap: 295000 },
  { name: "NTPC", slug: "ntpc", bseCode: "532555", nseSymbol: "NTPC", sector: "Power", industry: "Power Generation", marketCap: 340000 },
  { name: "Mahindra & Mahindra", slug: "mahindra-mahindra", bseCode: "500520", nseSymbol: "M&M", sector: "Auto", industry: "Utility Vehicles", marketCap: 385000 },
  { name: "DMart (Avenue Supermarts)", slug: "avenue-supermarts", bseCode: "540376", nseSymbol: "DMART", sector: "Retail", industry: "Supermarket", marketCap: 260000 },
  { name: "Zomato", slug: "zomato", bseCode: "543320", nseSymbol: "ZOMATO", sector: "Consumer Services", industry: "Food Delivery", marketCap: 285000 },
];

async function main() {
  console.log("Seeding top 30 companies...");
  for (const c of companies) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: c,
      create: { ...c, active: true, isSme: false },
    });
    console.log(`  ✓ ${c.name}`);
  }
  console.log(`Done. ${companies.length} companies in master.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
