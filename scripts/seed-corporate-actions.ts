/**
 * Seed representative corporate actions for UI testing.
 * Links to Company rows, upserting companies where needed.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const entries = [
  { company: "Reliance Industries", slug: "reliance-industries", type: "dividend", exOffset: 3, value: 10.0, purpose: "Interim dividend ₹10/share" },
  { company: "Tata Consultancy Services", slug: "tcs", type: "dividend", exOffset: 7, value: 27.0, purpose: "Interim dividend ₹27/share" },
  { company: "HDFC Bank", slug: "hdfc-bank", type: "dividend", exOffset: 14, value: 19.5, purpose: "Final dividend ₹19.5/share" },
  { company: "Infosys", slug: "infosys", type: "bonus", exOffset: 21, ratio: "1:1", purpose: "Bonus issue 1:1" },
  { company: "Bajaj Finance", slug: "bajaj-finance", type: "split", exOffset: 28, ratio: "1:2", purpose: "Stock split FV ₹2 → ₹1" },
  { company: "Wipro", slug: "wipro", type: "buyback", exOffset: -2, value: 600.0, purpose: "Buyback @ ₹600, ₹12,000 Cr size" },
  { company: "State Bank of India", slug: "sbi", type: "agm", exOffset: 35, purpose: "Annual General Meeting" },
  { company: "Asian Paints", slug: "asian-paints", type: "dividend", exOffset: 10, value: 21.0, purpose: "Final dividend ₹21/share" },
  { company: "Nestle India", slug: "nestle-india", type: "dividend", exOffset: 18, value: 8.5, purpose: "Interim dividend ₹8.5/share" },
  { company: "Bharti Airtel", slug: "bharti-airtel", type: "rights", exOffset: 40, ratio: "1:5", purpose: "Rights issue 1:5 @ ₹530" },
];

async function main() {
  console.log("Seeding corporate actions...");
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (const e of entries) {
    const company = await prisma.company.upsert({
      where: { slug: e.slug },
      update: {},
      create: { slug: e.slug, name: e.company, active: true, isSme: false },
    });
    const exDate = new Date(now.getTime() + e.exOffset * 86400000);
    const recordDate = new Date(exDate.getTime() + 86400000);
    const sourceId = `${e.slug}-${e.type}-${e.exOffset}`;

    await prisma.corporateAction.upsert({
      where: { source_sourceId: { source: "seed", sourceId } },
      update: { exDate, recordDate, ratio: e.ratio, value: e.value, purpose: e.purpose, actionType: e.type },
      create: {
        companyId: company.id,
        actionType: e.type,
        exDate,
        recordDate,
        ratio: e.ratio,
        value: e.value,
        purpose: e.purpose,
        source: "seed",
        sourceId,
      },
    });
    console.log(`  ✓ ${e.company} — ${e.type}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
