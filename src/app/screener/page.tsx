export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ScreenerClient, type ScreenerCompany } from "./ScreenerClient";

export const metadata: Metadata = {
  title: "Stock Screener India — filter 2,500+ stocks by sector, market cap, momentum",
  description:
    "Free Indian stock screener. Filter NSE/BSE companies by sector, market cap, 52-week high/low, 1-day change, volume. Mobile-first.",
  alternates: { canonical: "/screener" },
};

export default async function ScreenerPage() {
  const companies = await prisma.company.findMany({
    where: { active: true },
    select: {
      id: true, slug: true, name: true, sector: true, industry: true,
      nseSymbol: true, bseCode: true, marketCap: true, isSme: true,
      peRatio: true, pbRatio: true, roePercent: true, debtToEquity: true,
      dividendYield: true, eps: true,
    },
    orderBy: { marketCap: "desc" },
    take: 2000,
  });

  // Latest two trading days for 1D change + 52W data
  const [latestBhav, prevBhav] = await Promise.all([
    prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } }),
    prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, skip: 1, select: { date: true } }),
  ]);

  // Today's prices
  const todayPrices = latestBhav
    ? await prisma.bhavcopyDaily.findMany({
        where: { date: latestBhav.date },
        select: { companyId: true, close: true, high: true, low: true, volume: true },
      })
    : [];
  const todayMap = new Map(todayPrices.map((p) => [p.companyId, p]));

  // Yesterday's close for 1D change
  const prevPrices = prevBhav
    ? await prisma.bhavcopyDaily.findMany({
        where: { date: prevBhav.date },
        select: { companyId: true, close: true },
      })
    : [];
  const prevMap = new Map(prevPrices.map((p) => [p.companyId, Number(p.close)]));

  // 52W high/low from bhavcopy (last 252 trading days)
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const yearData = await prisma.bhavcopyDaily.groupBy({
    by: ["companyId"],
    where: { date: { gte: cutoff } },
    _max: { high: true },
    _min: { low: true },
  });
  const yearMap = new Map(yearData.map((r) => [r.companyId, {
    high52w: r._max.high ? Number(r._max.high) : null,
    low52w: r._min.low ? Number(r._min.low) : null,
  }]));

  const seed: ScreenerCompany[] = companies.map((c) => {
    const today = todayMap.get(c.id);
    const prevClose = prevMap.get(c.id) ?? null;
    const close = today ? Number(today.close) : null;
    const chg1d = close && prevClose ? ((close - prevClose) / prevClose) * 100 : null;
    const year = yearMap.get(c.id);
    return {
      slug: c.slug, name: c.name,
      symbol: c.nseSymbol ?? c.bseCode ?? null,
      sector: c.sector, industry: c.industry,
      marketCapCr: c.marketCap ? Number(c.marketCap) : null,
      isSme: c.isSme,
      ltp: close,
      volume: today ? Number(today.volume) : null,
      chg1d,
      high52w: year?.high52w ?? null,
      low52w: year?.low52w ?? null,
      peRatio: c.peRatio ? Number(c.peRatio) : null,
      pbRatio: c.pbRatio ? Number(c.pbRatio) : null,
      roePercent: c.roePercent ? Number(c.roePercent) : null,
      debtToEquity: c.debtToEquity ? Number(c.debtToEquity) : null,
      dividendYield: c.dividendYield ? Number(c.dividendYield) : null,
      eps: c.eps ? Number(c.eps) : null,
    };
  });

  const sectors = Array.from(new Set(companies.map((c) => c.sector).filter((s): s is string => !!s))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Stock Screener</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          {seed.filter(s => s.ltp).length.toLocaleString()} companies with today&apos;s prices ·
          {" "}{sectors.length} sectors · 52-week highs/lows from 12 months of price history.
        </p>
      </div>
      <ScreenerClient seed={seed} sectors={sectors} />
    </div>
  );
}
