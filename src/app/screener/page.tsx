export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ScreenerClient, type ScreenerCompany } from "./ScreenerClient";

export const metadata: Metadata = {
  title: "Stock Screener India — filter by sector, market cap, sub-segment",
  description:
    "Free stock screener for Indian markets. Filter BSE/NSE listed companies by sector, market cap range, industry, and listing status. Mobile-first.",
  alternates: { canonical: "/screener" },
};

export default async function ScreenerPage() {
  const companies = await prisma.company.findMany({
    where: { active: true },
    select: {
      slug: true,
      name: true,
      sector: true,
      industry: true,
      nseSymbol: true,
      bseCode: true,
      marketCap: true,
      isSme: true,
    },
    orderBy: { marketCap: "desc" },
    take: 1000,
  });

  // Today's prices to enrich screener
  const latestBhav = await prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
  const prices = latestBhav
    ? await prisma.bhavcopyDaily.findMany({
        where: { date: latestBhav.date },
        select: { companyId: true, close: true, volume: true },
      })
    : [];
  const priceMap = new Map(prices.map((p) => [p.companyId, { close: Number(p.close), volume: Number(p.volume) }]));

  const seed: ScreenerCompany[] = companies.map((c) => {
    const p = priceMap.get((c as { id?: number }).id ?? -1);
    return {
      slug: c.slug,
      name: c.name,
      symbol: c.nseSymbol ?? c.bseCode ?? null,
      sector: c.sector,
      industry: c.industry,
      marketCapCr: c.marketCap ? Number(c.marketCap) : null,
      isSme: c.isSme,
      ltp: p?.close ?? null,
      volume: p?.volume ?? null,
    };
  });

  const sectors = Array.from(new Set(companies.map((c) => c.sector).filter((s): s is string => !!s))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Stock Screener</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Filter Indian listed companies by sector, market cap, and listing status. Mobile-first, fast, free. Live
          OHLC and 10-yr financial filters wire in once Zerodha Kite Connect is plugged in.
        </p>
      </div>

      <ScreenerClient seed={seed} sectors={sectors} />
    </div>
  );
}
