export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Layers, Castle } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { auth } from "@/lib/auth";
import { WatchlistButton } from "@/components/WatchlistButton";
import { DiscussionThread } from "@/components/community/DiscussionThread";
import { StockNews } from "@/components/StockNews";
import type { QuarterlyRow, AnnualRow } from "@/components/CompanyFinancials";
import { PriceChart } from "@/components/PriceChartLoader";
import { CompanyFinancials } from "@/components/CompanyFinancialsLoader";
import { StockTechnicals } from "@/components/StockTechnicals";
import { QualitySignals } from "@/components/QualitySignals";
import { Sparkline } from "@/components/Sparkline";
import { StatTile } from "@/components/ui/StatTile";
import { PriceChange } from "@/components/ui/PriceChange";
import { getCompanyDescription } from "@/lib/company-descriptions";
import { getMoat } from "@/lib/moats";
import { computeTechnicals } from "@/lib/technicals";
import { computeQualitySignals, readCyclical } from "@/lib/quality-signals";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await prisma.company.findUnique({ where: { slug } });
  if (!c) return { title: "Company not found" };
  return {
    title: `${c.name} — share price, financials, shareholding & research`,
    description: `${c.name} (${c.nseSymbol ?? c.bseCode ?? ""}) stock page — ${c.sector ?? ""} sector, market cap, 10-year financials, ratios, shareholding, peers.`,
    alternates: { canonical: `/ticker/${slug}` },
  };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) notFound();

  const peers = company.sector
    ? await prisma.company.findMany({
        where: { sector: company.sector, id: { not: company.id } },
        orderBy: { marketCap: "desc" },
        take: 8,
        select: {
          id: true, slug: true, name: true, nseSymbol: true,
          marketCap: true, peRatio: true, pbRatio: true,
          roePercent: true, dividendYield: true,
        },
      })
    : [];

  // Get latest price for current company + peers in one bhavcopy query
  const allCompanyIds = [company.id, ...peers.map((p) => p.id)];
  const latestBhav = await prisma.bhavcopyDaily.findFirst({
    orderBy: { date: "desc" }, select: { date: true },
  });
  const peerPrices = latestBhav
    ? await prisma.bhavcopyDaily.findMany({
        where: { companyId: { in: allCompanyIds }, date: latestBhav.date },
        select: { companyId: true, close: true },
      })
    : [];
  const priceMap = new Map(peerPrices.map((p) => [p.companyId, Number(p.close)]));

  // 30-day price history for sparklines (current company + peers)
  const sparkCutoff = new Date(); sparkCutoff.setDate(sparkCutoff.getDate() - 35);
  const sparkRows = await prisma.bhavcopyDaily.findMany({
    where: { companyId: { in: allCompanyIds }, date: { gte: sparkCutoff } },
    orderBy: [{ companyId: "asc" }, { date: "asc" }],
    select: { companyId: true, close: true },
  });
  const sparklineMap = new Map<number, number[]>();
  for (const r of sparkRows) {
    const arr = sparklineMap.get(r.companyId) ?? [];
    arr.push(Number(r.close));
    sparklineMap.set(r.companyId, arr);
  }

  // Fetch latest bhavcopy for real price data + 52W range + financial history
  const cutoff52w = new Date(); cutoff52w.setFullYear(cutoff52w.getFullYear() - 1);
  const [latestPrice, yearStats, quarterlyResults, annualFinancials] = await Promise.all([
    prisma.bhavcopyDaily.findFirst({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
      select: { close: true, open: true, high: true, low: true, volume: true, deliveryPct: true, date: true },
    }),
    prisma.bhavcopyDaily.aggregate({
      where: { companyId: company.id, date: { gte: cutoff52w } },
      _max: { high: true },
      _min: { low: true },
    }),
    prisma.quarterlyResult.findMany({
      where: { companyId: company.id },
      orderBy: { quarterEnd: "asc" },
      take: 16,
    }),
    prisma.annualFinancial.findMany({
      where: { companyId: company.id },
      orderBy: { yearEnd: "asc" },
      take: 12,
    }),
  ]);

  // ─── Technical indicators — full price history + Nifty for relative strength ──
  const techCutoff = new Date(); techCutoff.setDate(techCutoff.getDate() - 400);
  const [techHistory, niftyHistory] = await Promise.all([
    prisma.bhavcopyDaily.findMany({
      where: { companyId: company.id, date: { gte: techCutoff } },
      orderBy: { date: "asc" },
      select: { close: true, high: true, low: true },
    }),
    prisma.niftyIndex.findMany({
      where: { indexName: "Nifty 50", date: { gte: techCutoff } },
      orderBy: { date: "asc" },
      select: { close: true },
    }),
  ]);
  const technicals = techHistory.length >= 20
    ? computeTechnicals(
        techHistory.map(r => Number(r.close)),
        techHistory.map(r => Number(r.high)),
        techHistory.map(r => Number(r.low)),
        niftyHistory.length > 0 ? niftyHistory.map(r => Number(r.close)) : undefined,
      )
    : null;

  const moat = getMoat(company.nseSymbol);

  // ─── Quality signals (multi-year) — annualFinancials is ascending, reverse for newest-first ──
  const annualNewestFirst = [...annualFinancials].reverse();
  const qualitySignals = computeQualitySignals(
    annualNewestFirst.map(a => ({
      sales: a.sales != null ? Number(a.sales) : null,
      netProfit: a.netProfit != null ? Number(a.netProfit) : null,
      roe: a.roe != null ? Number(a.roe) : null,
      cashFromOps: a.cashFromOps != null ? Number(a.cashFromOps) : null,
    }))
  );

  // Cyclical read — latest YoY revenue growth from the two most recent annual rows
  const latestRevGrowth = annualNewestFirst.length >= 2 && annualNewestFirst[0].sales && annualNewestFirst[1].sales && Number(annualNewestFirst[1].sales) > 0
    ? ((Number(annualNewestFirst[0].sales) - Number(annualNewestFirst[1].sales)) / Number(annualNewestFirst[1].sales)) * 100
    : null;
  const cyclicalRead = readCyclical(
    company.sector,
    company.industry,
    latestRevGrowth,
    technicals?.ret6m ?? null,
    technicals?.ret3m ?? null,
    technicals?.stage ?? null,
  );

  // Convert Prisma Decimal → number for client component
  const num = (v: unknown): number | null => {
    if (v == null) return null;
    const n = Number(v);
    return isFinite(n) ? n : null;
  };

  const quarterRows: QuarterlyRow[] = quarterlyResults.map((q) => ({
    quarter: q.quarter,
    sales: num(q.sales),
    operatingProfit: num(q.operatingProfit),
    opm: num(q.opm),
    netProfit: num(q.netProfit),
    eps: num(q.eps),
  }));

  const annualRows: AnnualRow[] = annualFinancials.map((a) => ({
    fiscalYear: a.fiscalYear,
    sales: num(a.sales),
    operatingProfit: num(a.operatingProfit),
    opm: num(a.opm),
    netProfit: num(a.netProfit),
    eps: num(a.eps),
    dividendPayout: num(a.dividendPayout),
    equityCapital: num(a.equityCapital),
    reserves: num(a.reserves),
    borrowings: num(a.borrowings),
    fixedAssets: num(a.fixedAssets),
    investments: num(a.investments),
    otherAssets: num(a.otherAssets),
    totalAssets: num(a.totalAssets),
    cashFromOps: num(a.cashFromOps),
    cashFromInvesting: num(a.cashFromInvesting),
    cashFromFinancing: num(a.cashFromFinancing),
    netCashFlow: num(a.netCashFlow),
    roe: num(a.roe),
    roce: num(a.roce),
  }));
  const ltp = latestPrice ? Number(latestPrice.close) : null;
  const high52w = yearStats._max.high ? Number(yearStats._max.high) : null;
  const low52w = yearStats._min.low ? Number(yearStats._min.low) : null;

  const description = getCompanyDescription(company.slug, {
    sector: company.sector,
    industry: company.industry,
    name: company.name,
  });

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  let inWatchlist = false;
  if (userId) {
    const w = await prisma.watchlistItem.findFirst({ where: { userId, type: "stock", targetSlug: company.slug } });
    inWatchlist = !!w;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://ipopulse.talkytools.com/ticker/${company.slug}`,
    name: `${company.name} — share price, financials, shareholding & research`,
    description: `${company.name} (${company.nseSymbol ?? company.bseCode ?? ""}) stock research page — ${company.sector ?? ""} sector.`,
    url: `https://ipopulse.talkytools.com/ticker/${company.slug}`,
    isPartOf: { "@id": "https://ipopulse.talkytools.com/#website" },
    about: {
      "@type": "Corporation",
      name: company.name,
      tickerSymbol: company.nseSymbol ?? company.bseCode ?? undefined,
      ...(company.sector ? { industry: company.sector } : {}),
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/ticker" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Back to Ticker
      </Link>

      <div className="card">
        {/* Top row: name + symbols on left, watchlist on right */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{company.name}</h1>
              {company.nseSymbol && <span className="text-[11px] font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">NSE: {company.nseSymbol}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
              {company.sector && <span className="inline-flex items-center gap-1"><Layers className="w-3 h-3" /> {company.sector}</span>}
              {company.industry && <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" /> {company.industry}</span>}
            </div>
          </div>
          <WatchlistButton type="stock" targetSlug={company.slug} initial={inWatchlist} authed={!!userId} />
        </div>

        {/* Big price + daily change — the Groww hero treatment */}
        <div className="flex items-end flex-wrap gap-x-4 gap-y-1 mt-4">
          <div className="text-4xl font-bold text-gray-900 tabular-nums">
            {ltp ? `₹${ltp.toLocaleString("en-IN")}` : "—"}
          </div>
          {technicals?.ret1d != null && <PriceChange pct={technicals.ret1d} size="lg" />}
          {latestPrice?.date && (
            <span className="text-xs text-gray-400 mb-1">
              EOD · {new Date(latestPrice.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>

        {/* Moat + description as a tidy row */}
        {moat && (
          <div className="mt-3 inline-flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <Castle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-amber-900"><span className="font-semibold">Economic Moat:</span> {moat}</span>
          </div>
        )}
        {description && (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{description}</p>
        )}

        {/* Key stats — soft Groww tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <StatTile label="Market Cap" value={company.marketCap ? formatCurrency(Number(company.marketCap) * 10000000) : "—"} />
          <StatTile
            label="52W Range"
            value={high52w && low52w ? `₹${high52w.toFixed(0)} / ₹${low52w.toFixed(0)}` : "—"}
            sub={ltp && high52w && low52w ? (
              <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, ((ltp - low52w) / (high52w - low52w)) * 100))}%` }} />
              </div>
            ) : undefined}
          />
          <StatTile
            label="Volume"
            value={latestPrice?.volume ? `${(Number(latestPrice.volume) / 1000).toFixed(0)}K` : "—"}
            sub={latestPrice?.deliveryPct ? `${Number(latestPrice.deliveryPct).toFixed(1)}% delivery` : undefined}
          />
          <StatTile label="1Y Return" value={technicals?.ret1y != null ? `${technicals.ret1y >= 0 ? "+" : ""}${technicals.ret1y.toFixed(1)}%` : "—"}
            valueColor={technicals?.ret1y != null ? (technicals.ret1y >= 0 ? "text-emerald-600" : "text-red-600") : "text-gray-900"} />
        </div>

        {/* Fundamentals tiles */}
        {(company.peRatio || company.roePercent || company.debtToEquity || company.pbRatio) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
            {company.peRatio && <StatTile label="P/E Ratio" value={Number(company.peRatio).toFixed(1)} valueColor="text-indigo-700" tint="indigo" />}
            {company.pbRatio && <StatTile label="P/B Ratio" value={Number(company.pbRatio).toFixed(1)} valueColor="text-indigo-700" tint="indigo" />}
            {company.roePercent && <StatTile label="ROE" value={`${Number(company.roePercent).toFixed(1)}%`} valueColor="text-emerald-700" tint="emerald" />}
            {company.debtToEquity && <StatTile label="Debt / Equity" value={Number(company.debtToEquity).toFixed(2)} />}
          </div>
        )}
      </div>

      {peers.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Peers in {company.sector}</h2>
            <span className="text-[10px] text-gray-400">Top 8 by market cap</span>
          </div>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-[10px] font-semibold text-gray-500 uppercase">
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2 text-right">LTP</th>
                    <th className="px-3 py-2 text-center">30D</th>
                    <th className="px-3 py-2 text-right">Market Cap</th>
                    <th className="px-3 py-2 text-right">P/E</th>
                    <th className="px-3 py-2 text-right">P/B</th>
                    <th className="px-3 py-2 text-right">ROE %</th>
                    <th className="px-3 py-2 text-right">Div Yld %</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Current company row — highlighted */}
                  <tr className="bg-indigo-50/40 border-b border-gray-100 font-semibold">
                    <td className="px-3 py-2">
                      <span className="text-gray-900">{company.name}</span>
                      <span className="text-[10px] text-indigo-600 ml-2">(this stock)</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-900">
                      {ltp != null ? `₹${ltp.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Sparkline values={sparklineMap.get(company.id) ?? []} width={64} height={20} />
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                      {company.marketCap ? formatCurrency(Number(company.marketCap) * 10000000) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                      {company.peRatio ? Number(company.peRatio).toFixed(1) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                      {company.pbRatio ? Number(company.pbRatio).toFixed(1) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                      {company.roePercent ? `${Number(company.roePercent).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                      {company.dividendYield ? `${Number(company.dividendYield).toFixed(2)}%` : "—"}
                    </td>
                  </tr>
                  {peers.map((p) => {
                    const peerLtp = priceMap.get(p.id);
                    return (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <Link href={`/ticker/${p.slug}`} className="text-gray-900 hover:text-indigo-600 font-medium">
                            {p.name}
                          </Link>
                          {p.nseSymbol && (
                            <span className="text-[10px] text-gray-400 ml-2 font-mono">{p.nseSymbol}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-900">
                          {peerLtp != null ? `₹${peerLtp.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Sparkline values={sparklineMap.get(p.id) ?? []} width={64} height={20} />
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                          {p.marketCap ? formatCurrency(Number(p.marketCap) * 10000000) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                          {p.peRatio ? Number(p.peRatio).toFixed(1) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                          {p.pbRatio ? Number(p.pbRatio).toFixed(1) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                          {p.roePercent ? `${Number(p.roePercent).toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                          {p.dividendYield ? `${Number(p.dividendYield).toFixed(2)}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {/* Price chart — Yahoo Finance, 15-min delayed, free */}
      {company.nseSymbol ? (
        <PriceChart symbol={company.nseSymbol} name={company.name} />
      ) : company.bseCode ? (
        <PriceChart symbol={`${company.bseCode}.BO`} name={company.name} />
      ) : null}

      {/* Technical Indicators — objective math from price history */}
      {technicals && <StockTechnicals t={technicals} />}

      {/* Quality Signals — multi-year ROE consistency, revenue CAGR, cash-backed earnings, cyclical read */}
      <QualitySignals q={qualitySignals} cyclical={cyclicalRead} />

      {/* Deep Financials — Quarterly, Annual P&L, Balance Sheet, Cash Flow, Ratios */}
      <CompanyFinancials quarters={quarterRows} annual={annualRows} />

      {/* News & BSE filings */}
      <StockNews
        symbol={company.nseSymbol}
        name={company.name}
        companyId={company.id}
      />

      <DiscussionThread targetType="stock" targetSlug={company.slug} />
    </div>
  );
}
