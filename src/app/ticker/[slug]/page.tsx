export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Layers } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { auth } from "@/lib/auth";
import { WatchlistButton } from "@/components/WatchlistButton";
import { DiscussionThread } from "@/components/community/DiscussionThread";
import { PriceChart } from "@/components/PriceChart";
import { StockNews } from "@/components/StockNews";

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
        take: 6,
      })
    : [];

  // Fetch latest bhavcopy for real price data + 52W range
  const cutoff52w = new Date(); cutoff52w.setFullYear(cutoff52w.getFullYear() - 1);
  const [latestPrice, yearStats] = await Promise.all([
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
  ]);
  const ltp = latestPrice ? Number(latestPrice.close) : null;
  const high52w = yearStats._max.high ? Number(yearStats._max.high) : null;
  const low52w = yearStats._min.low ? Number(yearStats._min.low) : null;

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  let inWatchlist = false;
  if (userId) {
    const w = await prisma.watchlistItem.findFirst({ where: { userId, type: "stock", targetSlug: company.slug } });
    inWatchlist = !!w;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/ticker" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Back to Ticker
      </Link>

      <div className="card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
              {company.nseSymbol ? <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">NSE:{company.nseSymbol}</span> : null}
              {company.bseCode ? <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">BSE:{company.bseCode}</span> : null}
              {company.sector ? (
                <span className="inline-flex items-center gap-0.5">
                  <Layers className="w-3 h-3" /> {company.sector}
                </span>
              ) : null}
              {company.industry ? (
                <span className="inline-flex items-center gap-0.5">
                  <Building2 className="w-3 h-3" /> {company.industry}
                </span>
              ) : null}
            </div>
          </div>
          <WatchlistButton type="stock" targetSlug={company.slug} initial={inWatchlist} authed={!!userId} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">LTP (EOD)</div>
            <div className={`text-sm font-semibold tabular-nums mt-0.5 ${ltp ? "text-gray-900" : "text-gray-400"}`}>
              {ltp ? `₹${ltp.toLocaleString("en-IN")}` : "—"}
            </div>
            {latestPrice?.date && <div className="text-[10px] text-gray-400 mt-0.5">{new Date(latestPrice.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>}
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Market cap</div>
            <div className="text-sm font-semibold text-gray-900 tabular-nums mt-0.5">
              {company.marketCap ? formatCurrency(Number(company.marketCap) * 10000000) : "—"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">52W High / Low</div>
            <div className="text-sm font-semibold text-gray-900 tabular-nums mt-0.5">
              {high52w && low52w ? `₹${high52w.toFixed(0)} / ₹${low52w.toFixed(0)}` : "—"}
            </div>
            {ltp && high52w && low52w && (
              <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, ((ltp - low52w) / (high52w - low52w)) * 100))}%` }}
                />
              </div>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Volume · Delivery</div>
            <div className="text-sm font-semibold text-gray-900 tabular-nums mt-0.5">
              {latestPrice?.volume ? (Number(latestPrice.volume) / 1000).toFixed(0) + "K" : "—"}
            </div>
            {latestPrice?.deliveryPct && <div className="text-[10px] text-gray-500 mt-0.5">{Number(latestPrice.deliveryPct).toFixed(1)}% delivery</div>}
          </div>
        </div>

        {/* P/E and other fundamentals if available */}
        {(company.peRatio || company.roePercent || company.debtToEquity) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {company.peRatio && <div className="bg-indigo-50 rounded-lg p-3"><div className="text-xs text-gray-500">P/E</div><div className="text-sm font-semibold text-indigo-700">{Number(company.peRatio).toFixed(1)}</div></div>}
            {company.pbRatio && <div className="bg-indigo-50 rounded-lg p-3"><div className="text-xs text-gray-500">P/B</div><div className="text-sm font-semibold text-indigo-700">{Number(company.pbRatio).toFixed(1)}</div></div>}
            {company.roePercent && <div className="bg-emerald-50 rounded-lg p-3"><div className="text-xs text-gray-500">ROE %</div><div className="text-sm font-semibold text-emerald-700">{Number(company.roePercent).toFixed(1)}%</div></div>}
            {company.debtToEquity && <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500">D/E</div><div className="text-sm font-semibold text-gray-700">{Number(company.debtToEquity).toFixed(2)}</div></div>}
          </div>
        )}
      </div>

      {peers.length > 0 ? (
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Peers in {company.sector}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {peers.map((p) => (
              <Link
                key={p.id}
                href={`/ticker/${p.slug}`}
                className="card text-center hover:border-indigo-300 transition"
              >
                <div className="text-xs font-medium text-gray-900 truncate">{p.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{p.nseSymbol}</div>
                {p.marketCap ? (
                  <div className="text-[10px] text-gray-500 mt-1 tabular-nums">
                    {formatCurrency(Number(p.marketCap) * 10000000)}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Price chart — Yahoo Finance, 15-min delayed, free */}
      {company.nseSymbol ? (
        <PriceChart symbol={company.nseSymbol} name={company.name} />
      ) : company.bseCode ? (
        <PriceChart symbol={`${company.bseCode}.BO`} name={company.name} />
      ) : null}

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
