import { prisma } from "@/lib/db";
import { fetchAmfiNavs } from "@/lib/scrapers/amfi";
import type { IngestionResult } from "../runIngestion";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/**
 * Ingest AMFI NAV file. Runs daily — full refresh of NAV for all funds.
 * Skips funds with NAV of 0 or invalid scheme codes.
 */
export async function ingestAmfiNavs(): Promise<IngestionResult> {
  const funds = await fetchAmfiNavs();
  if (funds.length === 0) return { rowsIn: 0, notes: "no funds parsed" };

  let rowsIn = 0;
  let rowsError = 0;

  // Batch: do upserts in groups of 100
  for (const f of funds) {
    if (!f.schemeCode || !f.schemeName || f.nav <= 0) {
      rowsError++;
      continue;
    }
    const slug = slugify(`${f.schemeName}-${f.schemeCode}`);
    try {
      await prisma.mutualFund.upsert({
        where: { schemeCode: f.schemeCode },
        update: {
          schemeName: f.schemeName,
          isinGrowth: f.isinGrowth ?? null,
          isinDivReinvest: f.isinDivReinvest ?? null,
          amc: f.amc ?? null,
          category: f.category ?? null,
          nav: f.nav,
          navAsOf: f.asOfDate,
          slug,
        },
        create: {
          schemeCode: f.schemeCode,
          schemeName: f.schemeName,
          isinGrowth: f.isinGrowth ?? null,
          isinDivReinvest: f.isinDivReinvest ?? null,
          amc: f.amc ?? null,
          category: f.category ?? null,
          nav: f.nav,
          navAsOf: f.asOfDate,
          slug,
        },
      });
      rowsIn++;
    } catch {
      rowsError++;
    }
  }

  return { rowsIn, rowsError, notes: `parsed ${funds.length}` };
}
