/**
 * Compute Signals — nightly precompute of technicals + quality flags into Company columns.
 * ─────────────────────────────────────────────────────────────────
 * Computing technicals live for 100-row tables = 100 price queries per page load.
 * Instead, precompute once nightly and store on the Company row so tables just
 * read a column (fast, sortable, filterable).
 *
 * Per company it computes and writes:
 *  - Technicals (from bhavcopy): rsi, weinsteinStage, trendTemplate, relStrength,
 *    ret1m/3m/6m/1y
 *  - Quality (from annual_financials): roeConsistentYrs, revCagr, cashBacked
 *  - Static flags: isMoat + moatNote (from moats list), isCyclical, cyclicalPeak
 *
 * Runs nightly at 11:30 PM IST (after bhavcopy + fundamentals). ~2 min for 2,300 cos.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { computeTechnicals } from "@/lib/technicals";
import { computeQualitySignals, readCyclical } from "@/lib/quality-signals";
import { getMoat } from "@/lib/moats";

export async function computeSignals(): Promise<IngestionResult> {
  // Nifty 50 history for relative strength (shared across all companies)
  const techCutoff = new Date(); techCutoff.setDate(techCutoff.getDate() - 400);
  const niftyRows = await prisma.niftyIndex.findMany({
    where: { indexName: "Nifty 50", date: { gte: techCutoff } },
    orderBy: { date: "asc" },
    select: { close: true },
  });
  const niftyClose = niftyRows.map(r => Number(r.close));

  const companies = await prisma.company.findMany({
    where: { active: true },
    select: { id: true, nseSymbol: true, sector: true, industry: true },
  });

  let rowsIn = 0;
  let rowsError = 0;

  // Process in chunks to limit memory
  const CHUNK = 100;
  for (let off = 0; off < companies.length; off += CHUNK) {
    const chunk = companies.slice(off, off + CHUNK);
    const ids = chunk.map(c => c.id);

    // Bulk-fetch price history for this chunk
    const prices = await prisma.bhavcopyDaily.findMany({
      where: { companyId: { in: ids }, date: { gte: techCutoff } },
      orderBy: [{ companyId: "asc" }, { date: "asc" }],
      select: { companyId: true, close: true, high: true, low: true },
    });
    const priceMap = new Map<number, { close: number[]; high: number[]; low: number[] }>();
    for (const p of prices) {
      const e = priceMap.get(p.companyId) ?? { close: [], high: [], low: [] };
      e.close.push(Number(p.close));
      e.high.push(Number(p.high));
      e.low.push(Number(p.low));
      priceMap.set(p.companyId, e);
    }

    // Bulk-fetch annual financials for this chunk
    const annuals = await prisma.annualFinancial.findMany({
      where: { companyId: { in: ids } },
      orderBy: [{ companyId: "asc" }, { yearEnd: "desc" }],
      select: { companyId: true, sales: true, netProfit: true, roe: true, cashFromOps: true },
    });
    const annualMap = new Map<number, typeof annuals>();
    for (const a of annuals) {
      const arr = annualMap.get(a.companyId) ?? [];
      arr.push(a);
      annualMap.set(a.companyId, arr);
    }

    for (const c of chunk) {
      try {
        const px = priceMap.get(c.id);
        const tech = px && px.close.length >= 20
          ? computeTechnicals(px.close, px.high, px.low, niftyClose.length > 0 ? niftyClose : undefined)
          : null;

        const annualNewest = annualMap.get(c.id) ?? [];
        const quality = computeQualitySignals(
          annualNewest.map(a => ({
            sales: a.sales != null ? Number(a.sales) : null,
            netProfit: a.netProfit != null ? Number(a.netProfit) : null,
            roe: a.roe != null ? Number(a.roe) : null,
            cashFromOps: a.cashFromOps != null ? Number(a.cashFromOps) : null,
          }))
        );

        // Latest YoY revenue growth for cyclical read
        const latestRevGrowth = annualNewest.length >= 2 && annualNewest[0].sales && annualNewest[1].sales && Number(annualNewest[1].sales) > 0
          ? ((Number(annualNewest[0].sales) - Number(annualNewest[1].sales)) / Number(annualNewest[1].sales)) * 100
          : null;
        const cyclical = readCyclical(
          c.sector, c.industry, latestRevGrowth,
          tech?.ret6m ?? null, tech?.ret3m ?? null, tech?.stage ?? null,
        );

        const moatNote = getMoat(c.nseSymbol);

        await prisma.company.update({
          where: { id: c.id },
          data: {
            rsi: tech ? Math.round(tech.rsi * 100) / 100 : null,
            weinsteinStage: tech?.stage ?? null,
            trendTemplate: tech?.fullAnalysis ? tech.trendTemplate : null,
            relStrength: tech?.relStrength != null ? Math.round(tech.relStrength * 100) / 100 : null,
            ret1m: tech?.ret1m != null ? Math.round(tech.ret1m * 100) / 100 : null,
            ret3m: tech?.ret3m != null ? Math.round(tech.ret3m * 100) / 100 : null,
            ret6m: tech?.ret6m != null ? Math.round(tech.ret6m * 100) / 100 : null,
            ret1y: tech?.ret1y != null ? Math.round(tech.ret1y * 100) / 100 : null,
            roeConsistentYrs: quality?.roeGoodYears ?? null,
            revCagr: quality?.revCagr != null ? Math.round(quality.revCagr * 100) / 100 : null,
            cashBacked: quality?.cashBacked ?? null,
            isMoat: !!moatNote,
            moatNote: moatNote ?? null,
            isCyclical: !!cyclical,
            cyclicalPeak: cyclical?.severity === "warning",
            signalsAt: new Date(),
          },
        });
        rowsIn++;
      } catch {
        rowsError++;
      }
    }
  }

  console.log(`[compute-signals] Done. updated=${rowsIn} errors=${rowsError}`);
  return { rowsIn, rowsError };
}
