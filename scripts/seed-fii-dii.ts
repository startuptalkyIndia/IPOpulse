/**
 * Seed representative FII/DII daily cash data for UI testing.
 * Will be replaced by NSE scraper cron.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding FII/DII daily (last 30 days)...");
  const now = new Date();
  now.setHours(18, 30, 0, 0);

  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    // skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    d.setHours(0, 0, 0, 0);

    // Representative-looking synthetic flows in ₹ crore
    const fiiNet = Math.round((Math.random() - 0.55) * 4000);
    const diiNet = Math.round((Math.random() - 0.35) * 3500);
    const fiiBuy = Math.round(8000 + Math.random() * 8000);
    const fiiSell = fiiBuy - fiiNet;
    const diiBuy = Math.round(6000 + Math.random() * 5000);
    const diiSell = diiBuy - diiNet;

    await prisma.fiiDiiDaily.upsert({
      where: { date_segment: { date: d, segment: "cash" } },
      update: { fiiBuy, fiiSell, fiiNet, diiBuy, diiSell, diiNet },
      create: {
        date: d,
        segment: "cash",
        fiiBuy,
        fiiSell,
        fiiNet,
        diiBuy,
        diiSell,
        diiNet,
      },
    });
  }
  console.log("FII/DII seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
