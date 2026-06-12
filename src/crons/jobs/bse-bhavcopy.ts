import { prisma } from "@/lib/db";
import { fetchBseBhavcopy } from "@/lib/scrapers/bse-bhavcopy";
import type { IngestionResult } from "../runIngestion";

/**
 * Pull BSE EOD bhavcopy CSV (cash market, equity) and upsert prices for
 * every company in our master keyed by bseCode (BSE scrip code).
 *
 * BSE covers ~1,500 stocks that are NOT on NSE (SME segment, BSE-only
 * smallcaps) — without this job those rows are invisible. Companies
 * dual-listed on NSE+BSE get a second row under source='bse'.
 */
export async function ingestBseBhavcopy(): Promise<IngestionResult> {
  const rows = await fetchBseBhavcopy(new Date());
  if (rows.length === 0) return { rowsIn: 0, notes: "no rows from BSE archive (holiday or 404)" };

  const companies = await prisma.company.findMany({
    where: { bseCode: { not: null } },
    select: { id: true, bseCode: true },
  });
  const scripMap = new Map(companies.map((c) => [c.bseCode!, c.id]));

  let rowsIn = 0;
  let rowsError = 0;
  for (const r of rows) {
    const companyId = scripMap.get(r.scripCode);
    if (!companyId) continue;
    try {
      await prisma.bhavcopyDaily.upsert({
        where: { companyId_date_source: { companyId, date: r.date, source: "bse" } },
        update: {
          open: r.open,
          high: r.high,
          low: r.low,
          close: r.close,
          volume: BigInt(Math.round(r.volume)),
        },
        create: {
          companyId,
          date: r.date,
          open: r.open,
          high: r.high,
          low: r.low,
          close: r.close,
          volume: BigInt(Math.round(r.volume)),
          source: "bse",
        },
      });
      rowsIn++;
    } catch {
      rowsError++;
    }
  }

  return {
    rowsIn,
    rowsError,
    notes: `BSE bhavcopy: ${rowsIn} upserted from ${rows.length} CSV rows`,
  };
}
