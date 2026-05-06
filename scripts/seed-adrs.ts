/**
 * Seed the US ADR listings table with the canonical list of Indian companies
 * cross-listed on NYSE / NASDAQ as ADRs or ordinary shares.
 *
 * Run: npx tsx scripts/seed-adrs.ts
 *
 * Sources verified April 2026:
 *   NYSE / NASDAQ ADR programs for Indian companies
 *   BSE/NSE symbol mapping
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ADR_LISTINGS = [
  { companyName: "Infosys Limited", slug: "infosys-infy", nseSymbol: "INFY", bseCode: "500209", adrSymbol: "INFY", exchange: "NYSE", ratio: "1 ADR = 1 NSE share", sector: "IT Services" },
  { companyName: "Wipro Limited", slug: "wipro-wit", nseSymbol: "WIPRO", bseCode: "507685", adrSymbol: "WIT", exchange: "NYSE", ratio: "1 ADR = 1 NSE share", sector: "IT Services" },
  { companyName: "Tata Motors Limited", slug: "tatamotors-ttm", nseSymbol: "TATAMOTORS", bseCode: "500570", adrSymbol: "TTM", exchange: "NYSE", ratio: "1 ADR = 1 NSE share", sector: "Automobiles" },
  { companyName: "HDFC Bank Limited", slug: "hdfcbank-hdb", nseSymbol: "HDFCBANK", bseCode: "500180", adrSymbol: "HDB", exchange: "NYSE", ratio: "1 ADR = 3 NSE shares", sector: "Banking" },
  { companyName: "ICICI Bank Limited", slug: "icicibank-iby", nseSymbol: "ICICIBANK", bseCode: "532174", adrSymbol: "IBN", exchange: "NYSE", ratio: "1 ADR = 2 NSE shares", sector: "Banking" },
  { companyName: "Dr. Reddy's Laboratories", slug: "drreddys-rdy", nseSymbol: "DRREDDY", bseCode: "500124", adrSymbol: "RDY", exchange: "NYSE", ratio: "1 ADR = 1 NSE share", sector: "Pharma" },
  { companyName: "WNS (Holdings) Limited", slug: "wns-wns", nseSymbol: null, bseCode: null, adrSymbol: "WNS", exchange: "NYSE", ratio: "N/A (US-listed only)", sector: "BPO" },
  { companyName: "MakeMyTrip Limited", slug: "makemytrip-mmyt", nseSymbol: null, bseCode: null, adrSymbol: "MMYT", exchange: "NASDAQ", ratio: "N/A (US-listed only)", sector: "Travel" },
  { companyName: "Yatra Online Limited", slug: "yatra-ytra", nseSymbol: null, bseCode: null, adrSymbol: "YTRA", exchange: "NASDAQ", ratio: "N/A (US-listed only)", sector: "Travel" },
  { companyName: "Sify Technologies", slug: "sify-sify", nseSymbol: null, bseCode: null, adrSymbol: "SIFY", exchange: "NASDAQ", ratio: "N/A (US-listed only)", sector: "Internet" },
  { companyName: "EXL Service Holdings", slug: "exlservice-exls", nseSymbol: null, bseCode: null, adrSymbol: "EXLS", exchange: "NASDAQ", ratio: "N/A (US-listed only)", sector: "BPO" },
  { companyName: "ICICI Prudential Life Insurance", slug: "iciciprulife-ipru", nseSymbol: "ICICIPRULI", bseCode: "540133", adrSymbol: "IPRU", exchange: "OTC", ratio: "OTC only", sector: "Insurance" },
];

async function main() {
  console.log(`Seeding ${ADR_LISTINGS.length} ADR listings…`);
  let inserted = 0;
  for (const a of ADR_LISTINGS) {
    await prisma.usAdrlisting.upsert({
      where: { slug: a.slug },
      update: { companyName: a.companyName, nseSymbol: a.nseSymbol, bseCode: a.bseCode, exchange: a.exchange, ratio: a.ratio, sector: a.sector },
      create: a,
    });
    console.log(`  ✓ ${a.companyName} (${a.adrSymbol})`);
    inserted++;
  }
  console.log(`\n✅ Done. ${inserted} ADR listings seeded.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
