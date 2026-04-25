/**
 * Seed bhavcopy_daily with 2 days of representative OHLCV data for our
 * top 80 companies — enough for /movers (gainers, losers, most active).
 *
 * Real data will replace this once a BSE/NSE bhavcopy ingestion cron is wired.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Realistic-ish base prices for our seeded companies (₹ as of late Apr 2026)
const PRICES: Record<string, number> = {
  "reliance-industries": 1430,
  tcs: 4200,
  "hdfc-bank": 1820,
  "icici-bank": 1265,
  "bharti-airtel": 1640,
  infosys: 1735,
  sbi: 795,
  "hindustan-unilever": 2640,
  lic: 950,
  itc: 465,
  "larsen-toubro": 3850,
  "hcl-technologies": 1740,
  "bajaj-finance": 7350,
  "maruti-suzuki": 12700,
  "sun-pharma": 1645,
  "asian-paints": 3100,
  "tata-motors": 940,
  "nestle-india": 2550,
  wipro: 510,
  "ultratech-cement": 11400,
  "adani-enterprises": 3380,
  "kotak-mahindra-bank": 1860,
  "axis-bank": 1170,
  "titan-company": 3380,
  "bajaj-finserv": 1750,
  "power-grid-corp": 320,
  ntpc: 350,
  "mahindra-mahindra": 3100,
  "avenue-supermarts": 4000,
  zomato: 295,
  "coal-india": 460,
  "tech-mahindra": 1840,
  "tata-steel": 165,
  "jsw-steel": 940,
  hindalco: 800,
  vedanta: 525,
  "indian-oil-corp": 152,
  bpcl: 350,
  ongc: 280,
  "gail-india": 195,
  "eicher-motors": 4750,
  "bajaj-auto": 10250,
  "hero-motocorp": 4750,
  "tvs-motor": 3490,
  britannia: 5400,
  "dabur-india": 500,
  marico: 580,
  "godrej-consumer": 1265,
  "tata-consumer": 1080,
  "adani-ports": 1240,
  "adani-power": 580,
  "adani-green-energy": 1240,
  pidilite: 3180,
  upl: 660,
  srf: 2540,
  cipla: 1610,
  "dr-reddys": 1310,
  lupin: 2080,
  "apollo-hospitals": 7100,
  "max-healthcare": 1130,
  "indusind-bank": 1430,
  pnb: 105,
  "bank-of-baroda": 250,
  "federal-bank": 200,
  "idfc-first-bank": 86,
  "hdfc-life": 670,
  "sbi-life": 1395,
  "icici-lombard": 1900,
  "bse-limited": 4090,
  "mcx-india": 7950,
  "hdfc-amc": 4280,
  "nippon-amc": 545,
  polycab: 7180,
  havells: 1740,
  voltas: 1860,
  "bharat-electronics": 295,
  "hindustan-aeronautics": 4380,
  "mazagon-dock": 4730,
  "indigo-airlines": 4250,
  nykaa: 195,
};

// % moves to apply today (intentionally varied to make for an interesting board)
const TODAY_DELTAS: Record<string, number> = {
  // Big gainers
  "bse-limited": 7.4,
  "mazagon-dock": 6.2,
  "polycab": 5.8,
  "premier-energies": 5.3,
  "hindustan-aeronautics": 4.8,
  "adani-green-energy": 4.5,
  "bharat-electronics": 3.9,
  "tata-motors": 3.6,
  "havells": 3.3,
  "icici-lombard": 3.1,
  "icici-bank": 2.8,
  "infosys": 2.5,
  "hdfc-amc": 2.4,
  "tata-consumer": 2.2,
  "max-healthcare": 2.0,
  "tcs": 1.7,
  "axis-bank": 1.5,
  "voltas": 1.3,

  // Mild moves
  "reliance-industries": 0.9,
  "hdfc-bank": 0.6,
  "sbi": 0.4,
  "hindustan-unilever": 0.3,
  "ntpc": 0.2,
  "lic": 0.1,
  "bharti-airtel": -0.1,
  "asian-paints": -0.2,
  "ultratech-cement": -0.3,

  // Big losers
  "vedanta": -3.2,
  "adani-enterprises": -3.7,
  "ongc": -2.6,
  "coal-india": -2.4,
  "indigo-airlines": -4.6,
  "tata-steel": -2.9,
  "jsw-steel": -2.5,
  "hindalco": -2.1,
  "indian-oil-corp": -3.4,
  "bpcl": -2.7,
  "zomato": -3.9,
  "nykaa": -5.1,
  "pnb": -2.3,
  "bank-of-baroda": -1.9,
  "lupin": -1.6,
  "cipla": -1.2,
  "dr-reddys": -1.4,
  "hero-motocorp": -1.8,
  "wipro": -1.1,
};

// Realistic-ish daily volume buckets (in shares)
function volumeFor(slug: string, marketCapCr: number | null): number {
  // Heuristic: more liquid (high market cap) = larger volume; randomize a bit
  const base = marketCapCr && marketCapCr > 200000 ? 8_000_000 : marketCapCr && marketCapCr > 100000 ? 3_000_000 : 800_000;
  const noise = 0.5 + Math.abs(Math.sin(slug.length * 7)) * 1.4;
  return Math.round(base * noise);
}

async function main() {
  console.log("Seeding bhavcopy_daily for 2 days...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);

  let inserted = 0;
  for (const [slug, basePrice] of Object.entries(PRICES)) {
    const company = await prisma.company.findUnique({ where: { slug } });
    if (!company) continue;
    const yClose = basePrice;
    const deltaPct = TODAY_DELTAS[slug] ?? (Math.sin(slug.length * 11) * 1.2); // fallback small move
    const tClose = +(yClose * (1 + deltaPct / 100)).toFixed(2);
    const tOpen = +(yClose * (1 + deltaPct * 0.3 / 100)).toFixed(2);
    const tHigh = +Math.max(tOpen, tClose, yClose * (1 + (deltaPct + 0.4) / 100)).toFixed(2);
    const tLow = +Math.min(tOpen, tClose, yClose * (1 + (deltaPct - 0.4) / 100)).toFixed(2);
    const vol = volumeFor(slug, company.marketCap ? Number(company.marketCap) : null);
    const deliveryPct = 30 + (Math.abs(Math.cos(slug.length * 3)) * 50);

    // Yesterday — flat range close to yClose
    await prisma.bhavcopyDaily.upsert({
      where: { companyId_date_source: { companyId: company.id, date: yesterday, source: "seed" } },
      update: {},
      create: {
        companyId: company.id,
        date: yesterday,
        open: yClose * 0.998,
        high: yClose * 1.005,
        low: yClose * 0.995,
        close: yClose,
        volume: BigInt(Math.round(vol * 0.85)),
        deliveryQty: BigInt(Math.round(vol * 0.85 * (deliveryPct / 100))),
        deliveryPct: +deliveryPct.toFixed(2),
        source: "seed",
      },
    });

    // Today
    await prisma.bhavcopyDaily.upsert({
      where: { companyId_date_source: { companyId: company.id, date: today, source: "seed" } },
      update: { open: tOpen, high: tHigh, low: tLow, close: tClose, volume: BigInt(vol), deliveryPct: +deliveryPct.toFixed(2) },
      create: {
        companyId: company.id,
        date: today,
        open: tOpen,
        high: tHigh,
        low: tLow,
        close: tClose,
        volume: BigInt(vol),
        deliveryQty: BigInt(Math.round(vol * (deliveryPct / 100))),
        deliveryPct: +deliveryPct.toFixed(2),
        source: "seed",
      },
    });
    inserted++;
  }
  console.log(`Done. Seeded ${inserted} companies × 2 days.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
