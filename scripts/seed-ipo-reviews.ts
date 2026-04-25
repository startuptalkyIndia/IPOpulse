/**
 * Seed broker-house reviews for current live IPOs.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const D = (s: string) => new Date(s);

const reviews = [
  // Tata Capital
  { ipoSlug: "tata-capital-ipo", brokerHouse: "Motilal Oswal", recommendation: "subscribe_long", rationale: "Strong NBFC franchise within Tata Group. Diversified loan book, premium valuation justified by parentage.", targetPrice: 380, publishedAt: D("2026-04-22") },
  { ipoSlug: "tata-capital-ipo", brokerHouse: "Anand Rathi", recommendation: "subscribe_long", rationale: "Quality NBFC with consistent ROA. Premium valuation but earnings momentum supports it.", publishedAt: D("2026-04-22") },
  { ipoSlug: "tata-capital-ipo", brokerHouse: "ICICI Securities", recommendation: "subscribe", rationale: "Good blend of growth and profitability. Recommend subscribing for both listing and long-term.", publishedAt: D("2026-04-22") },
  { ipoSlug: "tata-capital-ipo", brokerHouse: "SBI Securities", recommendation: "neutral", rationale: "Quality business but pricing leaves limited room for listing-day gains. Wait for post-listing dip.", publishedAt: D("2026-04-23") },

  // Ola Electric
  { ipoSlug: "ola-electric-ipo", brokerHouse: "Motilal Oswal", recommendation: "neutral", rationale: "Sector tailwind exists but cash burn and intense competition make near-term margin path unclear.", publishedAt: D("2026-04-23") },
  { ipoSlug: "ola-electric-ipo", brokerHouse: "Geojit", recommendation: "avoid", rationale: "Loss-making at scale, EV competition intensifying. Wait for visible profitability.", publishedAt: D("2026-04-24") },
  { ipoSlug: "ola-electric-ipo", brokerHouse: "Anand Rathi", recommendation: "subscribe_listing", rationale: "Listing-day pop possible given retail interest, but caution for long-term.", publishedAt: D("2026-04-23") },

  // Swiggy (upcoming)
  { ipoSlug: "swiggy-ipo", brokerHouse: "Kotak Securities", recommendation: "subscribe_long", rationale: "Quick commerce optionality and food delivery duopoly position make this a long-term consumer-tech play.", targetPrice: 450, publishedAt: D("2026-04-25") },
  { ipoSlug: "swiggy-ipo", brokerHouse: "Motilal Oswal", recommendation: "neutral", rationale: "Profitability path improving but valuation full. Apply only with long horizon.", publishedAt: D("2026-04-24") },

  // NTPC Green Energy
  { ipoSlug: "ntpc-green-energy-ipo", brokerHouse: "ICICI Securities", recommendation: "subscribe_long", rationale: "Largest renewable platform in India with PSU backing and strong PPA pipeline. Premium pricing justified.", publishedAt: D("2026-04-15") },
  { ipoSlug: "ntpc-green-energy-ipo", brokerHouse: "Anand Rathi", recommendation: "subscribe_long", rationale: "Renewable energy leader; valuation reasonable given growth runway.", publishedAt: D("2026-04-16") },

  // SME — Kalpataru Projects
  { ipoSlug: "kalpataru-projects-sme-ipo", brokerHouse: "SMC Global", recommendation: "neutral", rationale: "SME platform — proceed with caution. Small float and limited financial history.", publishedAt: D("2026-04-25") },
];

async function main() {
  console.log(`Seeding ${reviews.length} broker reviews...`);
  let inserted = 0;
  for (const r of reviews) {
    const ipo = await prisma.ipo.findUnique({ where: { slug: r.ipoSlug } });
    if (!ipo) {
      console.log(`  ⚠ IPO not found: ${r.ipoSlug}`);
      continue;
    }
    await prisma.ipoReview.create({
      data: {
        ipoId: ipo.id,
        brokerHouse: r.brokerHouse,
        recommendation: r.recommendation,
        rationale: r.rationale,
        targetPrice: r.targetPrice ?? null,
        publishedAt: r.publishedAt,
      },
    });
    inserted++;
  }
  console.log(`Done. Inserted ${inserted} reviews.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
