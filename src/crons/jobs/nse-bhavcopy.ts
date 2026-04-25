import { prisma } from "@/lib/db";
import { fetchNseBhavcopy } from "@/lib/scrapers/nse-bhavcopy";
import type { IngestionResult } from "../runIngestion";

/**
 * Pull NSE EOD bhavcopy CSV and upsert prices for every company in our master.
 * The CSV has all NSE-listed EQ/BE series stocks (~5,000+ rows).
 *
 * Match logic: by `nseSymbol` on Company. Skip rows without a matching company
 * (we only price companies in our master — this is a feature, not a bug).
 */
export async function ingestNseBhavcopy(): Promise<IngestionResult> {
  const rows = await fetchNseBhavcopy(new Date());
  if (rows.length === 0) return { rowsIn: 0, notes: "no rows from NSE archive (holiday or 404)" };

  // Pull existing companies keyed by nseSymbol
  const companies = await prisma.company.findMany({
    where: { nseSymbol: { not: null } },
    select: { id: true, nseSymbol: true },
  });
  const symbolMap = new Map(companies.map((c) => [c.nseSymbol!, c.id]));

  let rowsIn = 0;
  let rowsError = 0;
  for (const r of rows) {
    const companyId = symbolMap.get(r.symbol);
    if (!companyId) continue;
    try {
      await prisma.bhavcopyDaily.upsert({
        where: { companyId_date_source: { companyId, date: r.date, source: "nse" } },
        update: {
          open: r.open,
          high: r.high,
          low: r.low,
          close: r.close,
          volume: BigInt(Math.round(r.volume)),
          deliveryQty: r.deliveryQty != null ? BigInt(Math.round(r.deliveryQty)) : null,
          deliveryPct: r.deliveryPct,
        },
        create: {
          companyId,
          date: r.date,
          open: r.open,
          high: r.high,
          low: r.low,
          close: r.close,
          volume: BigInt(Math.round(r.volume)),
          deliveryQty: r.deliveryQty != null ? BigInt(Math.round(r.deliveryQty)) : null,
          deliveryPct: r.deliveryPct,
          source: "nse",
        },
      });
      rowsIn++;
    } catch {
      rowsError++;
    }
  }

  // Replace any seed rows with real data: delete seed rows on the same date that we just upserted real data for
  if (rowsIn > 0 && rows[0]?.date) {
    await prisma.bhavcopyDaily.deleteMany({ where: { date: rows[0].date, source: "seed" } });
  }

  return { rowsIn, rowsError, notes: `parsed ${rows.length} CSV rows, matched ${rowsIn}` };
}
