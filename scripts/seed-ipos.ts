/**
 * Seed representative IPO data so the UI has content during development.
 * Production data will come from BSE scraper + manual admin entry.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const D = (s: string) => new Date(s);

const ipos = [
  // LIVE — mainboard
  {
    name: "Tata Capital Limited",
    slug: "tata-capital-ipo",
    type: "mainboard",
    priceBandLow: 315,
    priceBandHigh: 331,
    lotSize: 45,
    issueSize: 15000,
    openDate: D("2026-04-22"),
    closeDate: D("2026-04-25"),
    allotmentDate: D("2026-04-28"),
    listingDate: D("2026-04-30"),
    registrar: "KFin Technologies",
    registrarUrl: "https://ris.kfintech.com/ipostatus/",
    leadManagers: "Kotak Mahindra Capital, Axis Capital, ICICI Securities",
    bseCode: "543998",
    nseSymbol: "TATACAPITAL",
    status: "live",
    faceValue: 10,
    objectsOfIssue: "Augmentation of Tier-I capital base to meet future capital requirements; General corporate purposes.",
    anchors: [
      { name: "Government of Singapore", allocation: 2500000, price: 331, value: 82.75 },
      { name: "Abu Dhabi Investment Authority", allocation: 2000000, price: 331, value: 66.20 },
      { name: "HDFC Mutual Fund", allocation: 1800000, price: 331, value: 59.58 },
      { name: "SBI Mutual Fund", allocation: 1600000, price: 331, value: 52.96 },
      { name: "ICICI Prudential MF", allocation: 1500000, price: 331, value: 49.65 },
    ],
    subscription: [
      { offsetDays: 0, retail: 0.34, hni: 0.15, qib: 0.08, total: 0.21 },
      { offsetDays: 1, retail: 1.45, hni: 0.88, qib: 0.92, total: 1.12 },
      { offsetDays: 2, retail: 2.31, hni: 1.67, qib: 1.85, total: 1.96 },
    ],
    gmp: [
      { offsetDays: -7, gmp: 28, source: "Unofficial dealer" },
      { offsetDays: -5, gmp: 35, source: "Unofficial dealer" },
      { offsetDays: -3, gmp: 42, source: "Unofficial dealer" },
      { offsetDays: -1, gmp: 48, source: "Unofficial dealer" },
      { offsetDays: 0, gmp: 52, source: "Unofficial dealer" },
      { offsetDays: 1, gmp: 58, source: "Unofficial dealer" },
      { offsetDays: 2, gmp: 61, source: "Unofficial dealer" },
    ],
  },

  // LIVE — mainboard #2
  {
    name: "Ola Electric Technologies",
    slug: "ola-electric-ipo",
    type: "mainboard",
    priceBandLow: 72,
    priceBandHigh: 76,
    lotSize: 195,
    issueSize: 6146,
    openDate: D("2026-04-24"),
    closeDate: D("2026-04-28"),
    allotmentDate: D("2026-04-29"),
    listingDate: D("2026-05-02"),
    registrar: "Link Intime India",
    registrarUrl: "https://linkintime.co.in/initial_offer/",
    leadManagers: "Kotak, Citi, BofA, Goldman Sachs",
    bseCode: "544225",
    nseSymbol: "OLAELEC",
    status: "live",
    faceValue: 10,
    objectsOfIssue: "Capital expenditure for expansion of cell manufacturing capacity; Research and product development; Debt repayment.",
    subscription: [
      { offsetDays: 0, retail: 0.21, hni: 0.08, qib: 0.05, total: 0.12 },
    ],
    gmp: [
      { offsetDays: -3, gmp: 8, source: "Unofficial dealer" },
      { offsetDays: -1, gmp: 12, source: "Unofficial dealer" },
      { offsetDays: 0, gmp: 15, source: "Unofficial dealer" },
    ],
  },

  // UPCOMING — mainboard
  {
    name: "Swiggy Limited",
    slug: "swiggy-ipo",
    type: "mainboard",
    priceBandLow: 371,
    priceBandHigh: 390,
    lotSize: 38,
    issueSize: 11327,
    openDate: D("2026-05-06"),
    closeDate: D("2026-05-08"),
    allotmentDate: D("2026-05-11"),
    listingDate: D("2026-05-13"),
    registrar: "Link Intime India",
    registrarUrl: "https://linkintime.co.in/initial_offer/",
    leadManagers: "Kotak, Citi, Jefferies, Avendus, JP Morgan, ICICI Securities",
    status: "upcoming",
    faceValue: 1,
    objectsOfIssue: "Debt repayment (₹164 Cr); Investment in Scootsy for cloud kitchen network expansion; Brand marketing; Tech & cloud infra; General corporate purposes.",
  },

  // UPCOMING — SME
  {
    name: "Kalpataru Projects International",
    slug: "kalpataru-projects-sme-ipo",
    type: "sme",
    priceBandLow: 95,
    priceBandHigh: 100,
    lotSize: 1200,
    issueSize: 42,
    openDate: D("2026-05-02"),
    closeDate: D("2026-05-06"),
    allotmentDate: D("2026-05-09"),
    listingDate: D("2026-05-12"),
    registrar: "Bigshare Services",
    registrarUrl: "https://www.bigshareonline.com/ipo_status.aspx",
    leadManagers: "Hem Securities",
    status: "upcoming",
    faceValue: 10,
    objectsOfIssue: "Working capital; General corporate purposes.",
  },

  // CLOSED — mainboard
  {
    name: "NTPC Green Energy",
    slug: "ntpc-green-energy-ipo",
    type: "mainboard",
    priceBandLow: 102,
    priceBandHigh: 108,
    lotSize: 138,
    issueSize: 10000,
    openDate: D("2026-04-15"),
    closeDate: D("2026-04-19"),
    allotmentDate: D("2026-04-22"),
    listingDate: D("2026-04-27"),
    registrar: "KFin Technologies",
    registrarUrl: "https://ris.kfintech.com/ipostatus/",
    leadManagers: "IDBI Capital, HDFC Bank, IIFL, Nuvama",
    bseCode: "544274",
    nseSymbol: "NTPCGREEN",
    status: "closed",
    faceValue: 10,
    subscription: [
      { offsetDays: 0, retail: 0.4, hni: 0.2, qib: 0.15, total: 0.26 },
      { offsetDays: 1, retail: 1.9, hni: 1.2, qib: 1.55, total: 1.55 },
      { offsetDays: 2, retail: 3.5, hni: 2.8, qib: 3.65, total: 3.25 },
      { offsetDays: 3, retail: 5.2, hni: 4.55, qib: 8.3, total: 6.12 },
    ],
    gmp: [
      { offsetDays: -5, gmp: 6, source: "Unofficial dealer" },
      { offsetDays: -2, gmp: 9, source: "Unofficial dealer" },
      { offsetDays: 0, gmp: 11, source: "Unofficial dealer" },
      { offsetDays: 2, gmp: 14, source: "Unofficial dealer" },
      { offsetDays: 4, gmp: 16, source: "Unofficial dealer" },
    ],
  },

  // LISTED — mainboard with good listing gain
  {
    name: "Bajaj Housing Finance",
    slug: "bajaj-housing-finance-ipo",
    type: "mainboard",
    priceBandLow: 66,
    priceBandHigh: 70,
    lotSize: 214,
    issueSize: 6560,
    openDate: D("2026-03-09"),
    closeDate: D("2026-03-11"),
    allotmentDate: D("2026-03-12"),
    listingDate: D("2026-03-16"),
    registrar: "KFin Technologies",
    registrarUrl: "https://ris.kfintech.com/ipostatus/",
    leadManagers: "Kotak, BofA Securities, Axis Capital, Goldman Sachs, SBI Capital",
    bseCode: "544252",
    nseSymbol: "BAJAJHFL",
    status: "listed",
    faceValue: 10,
    listing: {
      listingPrice: 150,
      listingGainsPct: 114.29,
      dayClose: 164.99,
      dayHigh: 170,
      dayLow: 148,
      gmpAtListing: 75,
    },
  },

  // LISTED — mainboard flat
  {
    name: "Hyundai Motor India",
    slug: "hyundai-motor-india-ipo",
    type: "mainboard",
    priceBandLow: 1865,
    priceBandHigh: 1960,
    lotSize: 7,
    issueSize: 27870,
    openDate: D("2026-03-15"),
    closeDate: D("2026-03-17"),
    allotmentDate: D("2026-03-18"),
    listingDate: D("2026-03-22"),
    registrar: "KFin Technologies",
    registrarUrl: "https://ris.kfintech.com/ipostatus/",
    leadManagers: "Kotak, Citi, JP Morgan, Morgan Stanley, HSBC",
    bseCode: "544238",
    nseSymbol: "HYUNDAI",
    status: "listed",
    faceValue: 10,
    listing: {
      listingPrice: 1931,
      listingGainsPct: -1.48,
      dayClose: 1820,
      dayHigh: 1968,
      dayLow: 1807,
      gmpAtListing: 25,
    },
  },

  // SME LISTED — strong gain
  {
    name: "Mamata Machinery",
    slug: "mamata-machinery-sme-ipo",
    type: "sme",
    priceBandLow: 230,
    priceBandHigh: 243,
    lotSize: 61,
    issueSize: 179,
    openDate: D("2026-02-19"),
    closeDate: D("2026-02-21"),
    allotmentDate: D("2026-02-24"),
    listingDate: D("2026-02-27"),
    registrar: "Link Intime India",
    registrarUrl: "https://linkintime.co.in/initial_offer/",
    leadManagers: "Beeline Capital",
    bseCode: "544295",
    nseSymbol: "MAMATA",
    status: "listed",
    faceValue: 10,
    listing: {
      listingPrice: 596,
      listingGainsPct: 145.27,
      dayClose: 625.7,
      dayHigh: 645,
      dayLow: 590,
      gmpAtListing: 350,
    },
  },
];

async function main() {
  console.log("Seeding IPOs...");
  for (const ipo of ipos) {
    const { anchors, subscription, gmp, listing, ...data } = ipo;
    const openDate = data.openDate;

    const record = await prisma.ipo.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });

    // Anchors
    if (anchors && anchors.length) {
      await prisma.ipoAnchor.deleteMany({ where: { ipoId: record.id } });
      for (const a of anchors) {
        await prisma.ipoAnchor.create({
          data: {
            ipoId: record.id,
            investorName: a.name,
            allocation: BigInt(a.allocation),
            pricePerShare: a.price,
            value: a.value,
          },
        });
      }
    }

    // Subscription — computed off openDate
    if (subscription && subscription.length && openDate) {
      await prisma.ipoSubscription.deleteMany({ where: { ipoId: record.id } });
      for (const s of subscription) {
        const captured = new Date(openDate.getTime() + s.offsetDays * 86400000);
        captured.setHours(17, 30, 0, 0); // 5:30 PM IST
        await prisma.ipoSubscription.create({
          data: {
            ipoId: record.id,
            capturedAt: captured,
            retailX: s.retail,
            hniX: s.hni,
            qibX: s.qib,
            totalX: s.total,
          },
        });
      }
    }

    // GMP — offsets from openDate
    if (gmp && gmp.length && openDate) {
      await prisma.ipoGmp.deleteMany({ where: { ipoId: record.id } });
      for (const g of gmp) {
        const d = new Date(openDate.getTime() + g.offsetDays * 86400000);
        d.setHours(0, 0, 0, 0);
        await prisma.ipoGmp.create({
          data: {
            ipoId: record.id,
            date: d,
            gmp: g.gmp,
            source: g.source,
            enteredBy: "seed",
          },
        });
      }
    }

    // Listing actuals
    if (listing) {
      await prisma.ipoListing.upsert({
        where: { ipoId: record.id },
        update: listing,
        create: { ipoId: record.id, ...listing },
      });
    }

    console.log(`  ✓ ${data.name}`);
  }
  console.log(`Done. Seeded ${ipos.length} IPOs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
