/**
 * US ADR / cross-listing price updater.
 *
 * For each row in UsAdrlisting, fetches:
 *   - NSE price from our latest bhavcopy (already in DB)
 *   - ADR price from Yahoo Finance query API (open, no auth)
 *
 * Computes premium/discount = (ADR_price_inr - NSE_price) / NSE_price * 100
 *
 * Seeded manually (see scripts/seed-adrs.ts) since the universe of Indian
 * companies with US listings is small (~12 companies) and stable.
 */

import { prisma } from "@/lib/db";

interface YahooQuote {
  regularMarketPrice?: number;
}

async function fetchAdrPrice(symbol: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IPOpulse/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { chart?: { result?: Array<{ meta?: YahooQuote }> } };
    return data.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
  } catch {
    return null;
  }
}

async function fetchUsdInr(): Promise<number | null> {
  try {
    const resp = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X?interval=1d&range=1d",
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; IPOpulse/1.0)" }, signal: AbortSignal.timeout(10000) }
    );
    const data = (await resp.json()) as { chart?: { result?: Array<{ meta?: YahooQuote }> } };
    return data.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
  } catch {
    return null;
  }
}

export async function updateUsAdrs(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  const adrs = await prisma.usAdrlisting.findMany({ where: { active: true } });
  if (adrs.length === 0) return { rowsIn: 0, notes: "No ADR listings seeded yet." };

  const usdInr = await fetchUsdInr();
  if (!usdInr) return { rowsIn: 0, notes: "USD/INR fetch failed." };

  // Latest bhavcopy date
  const latestBhav = await prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } });

  let updated = 0;
  let errors = 0;

  for (const adr of adrs) {
    try {
      const adrPriceUsd = await fetchAdrPrice(adr.adrSymbol);
      if (!adrPriceUsd) { errors++; continue; }

      const adrPriceInr = adrPriceUsd * usdInr;

      // Get NSE price from bhavcopy
      let nsePrice: number | null = null;
      if (adr.nseSymbol && latestBhav) {
        const co = await prisma.company.findFirst({ where: { nseSymbol: adr.nseSymbol }, select: { id: true } });
        if (co) {
          const bhav = await prisma.bhavcopyDaily.findFirst({
            where: { companyId: co.id, date: latestBhav.date },
            select: { close: true },
          });
          if (bhav) nsePrice = Number(bhav.close);
        }
      }

      // Ratio adjustment — ADR ratio stored as "1 ADR = N NSE shares"
      const ratioMatch = adr.ratio?.match(/(\d+\.?\d*)\s*NSE/i);
      const nseSharesToAdr = ratioMatch ? parseFloat(ratioMatch[1]) : 1;
      const nsePriceAdjusted = nsePrice ? nsePrice * nseSharesToAdr : null;

      const premiumPct =
        nsePriceAdjusted && adrPriceInr
          ? ((adrPriceInr - nsePriceAdjusted) / nsePriceAdjusted) * 100
          : null;

      await prisma.usAdrlisting.update({
        where: { id: adr.id },
        data: {
          adrPriceUsd,
          nsePrice: nsePrice,
          usdInrRate: usdInr,
          premiumPct,
          pricesAt: new Date(),
        },
      });
      updated++;
    } catch {
      errors++;
    }
  }

  return {
    rowsIn: updated,
    rowsError: errors,
    notes: `ADR prices: ${updated} updated at USD/INR ${usdInr?.toFixed(2)}.`,
  };
}
