/**
 * One-off seed: RBI repo rate history, MPC era only (Oct 2016 – present).
 *
 * Scope note: pre-MPC data (2000–2016) was checked against a public source
 * that had a confirmed 2-year gap (Mar 2011 → May 2013 missing entirely) —
 * rather than publish a dataset with a known hole, this seed is deliberately
 * limited to the Monetary Policy Committee era, which was cross-verified
 * against a second independent source (tradingeconomics.com) for the most
 * recent decisions (Apr/Jun/Aug 2026, all holds at 5.25%) with no gaps found.
 *
 * Idempotent — safe to re-run (upsert on effectiveDate).
 * Run: docker exec ipopulse-ipopulse-1 npx tsx scripts/seed-rbi-repo-rate.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Row {
  date: string; // YYYY-MM-DD
  rate: number;
  changeBps: number | null;
  note?: string;
}

const ROWS: Row[] = [
  { date: "2016-10-04", rate: 6.25, changeBps: null, note: "First decision under the newly formed Monetary Policy Committee (MPC)" },
  { date: "2017-08-02", rate: 6.0, changeBps: -25 },
  { date: "2018-06-06", rate: 6.25, changeBps: 25 },
  { date: "2018-08-01", rate: 6.5, changeBps: 25 },
  { date: "2019-02-07", rate: 6.25, changeBps: -25 },
  { date: "2019-04-04", rate: 6.0, changeBps: -25 },
  { date: "2019-06-06", rate: 5.75, changeBps: -25 },
  { date: "2019-08-07", rate: 5.4, changeBps: -35, note: "Unconventional 35 bps cut" },
  { date: "2019-10-04", rate: 5.15, changeBps: -25 },
  { date: "2020-03-27", rate: 4.4, changeBps: -75, note: "Emergency off-cycle cut — COVID-19" },
  { date: "2020-05-22", rate: 4.0, changeBps: -40, note: "Second emergency off-cycle cut — COVID-19" },
  { date: "2022-05-04", rate: 4.4, changeBps: 40, note: "Emergency off-cycle hike" },
  { date: "2022-06-08", rate: 4.9, changeBps: 50 },
  { date: "2022-08-05", rate: 5.4, changeBps: 50 },
  { date: "2022-09-30", rate: 5.9, changeBps: 50 },
  { date: "2022-12-07", rate: 6.25, changeBps: 35 },
  { date: "2023-02-08", rate: 6.5, changeBps: 25 },
  { date: "2025-02-07", rate: 6.25, changeBps: -25, note: "First cut after ~2 years held at 6.50%" },
  { date: "2025-04-09", rate: 6.0, changeBps: -25 },
  { date: "2025-06-06", rate: 5.5, changeBps: -50, note: "Jumbo 50 bps cut" },
  { date: "2025-12-05", rate: 5.25, changeBps: -25 },
];

async function main() {
  for (const r of ROWS) {
    await prisma.rbiRepoRate.upsert({
      where: { effectiveDate: new Date(r.date) },
      create: { effectiveDate: new Date(r.date), ratePercent: r.rate, changeBps: r.changeBps, note: r.note },
      update: { ratePercent: r.rate, changeBps: r.changeBps, note: r.note },
    });
  }
  const count = await prisma.rbiRepoRate.count();
  console.log(`RBI repo rate seed done. ${ROWS.length} rows upserted, ${count} total rows in table.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
