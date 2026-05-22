export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle, Info, TrendingUp, Coins, Building2, Sparkles, Award, Scale, Crown } from "lucide-react";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { bestStocksCategories, getCategoryBySlug } from "@/lib/best-stocks-categories";
import { formatCurrency } from "@/lib/format";

interface Props {
  params: Promise<{ slug: string }>;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Coins, AlertTriangle, Building2, TrendingUp, Sparkles, Award, Scale, Crown,
};

export async function generateStaticParams() {
  return bestStocksCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return { title: "Not found" };
  return {
    title: cat.title,
    description: cat.description,
    alternates: { canonical: `/best-stocks/${slug}` },
  };
}

export default async function BestStocksCategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  // Get latest bhavcopy date
  const latestBhav = await prisma.bhavcopyDaily.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (!latestBhav) notFound();

  // Build company filter
  const companyWhere: Prisma.CompanyWhereInput = {
    active: true,
    ...(cat.filter.nseSymbolIn && cat.filter.nseSymbolIn.length > 0 && { nseSymbol: { in: cat.filter.nseSymbolIn } }),
    ...(cat.filter.excludeSme && { isSme: false }),
    ...(cat.filter.marketCapMin && { marketCap: { gte: cat.filter.marketCapMin, ...(cat.filter.marketCapMax && { lte: cat.filter.marketCapMax }) } }),
    ...(cat.filter.marketCapMax && !cat.filter.marketCapMin && { marketCap: { lte: cat.filter.marketCapMax } }),
    ...(cat.filter.peMax && { peRatio: { gte: cat.filter.peMin ?? 0.1, lte: cat.filter.peMax } }),
    ...(cat.filter.roeMin && { roePercent: { gte: cat.filter.roeMin } }),
    ...(cat.filter.dividendMin && { dividendYield: { gte: cat.filter.dividendMin } }),
    ...(cat.filter.pbMax && { pbRatio: { gte: 0.05, lte: cat.filter.pbMax } }),
  };

  // Fetch ~5x the limit to account for price filter (which is applied after join)
  const candidateCount = cat.filter.nseSymbolIn ? cat.filter.nseSymbolIn.length + 10 : cat.filter.limit * 5;

  // Order
  const orderBy: Prisma.CompanyOrderByWithRelationInput =
    cat.filter.sortBy === "marketCap" ? { marketCap: cat.filter.sortOrder } :
    cat.filter.sortBy === "pe" ? { peRatio: cat.filter.sortOrder } :
    cat.filter.sortBy === "roe" ? { roePercent: cat.filter.sortOrder } :
    cat.filter.sortBy === "dividend" ? { dividendYield: cat.filter.sortOrder } :
    cat.filter.sortBy === "pb" ? { pbRatio: cat.filter.sortOrder } :
    { marketCap: "desc" };

  const candidates = await prisma.company.findMany({
    where: companyWhere,
    orderBy,
    take: candidateCount,
    select: {
      id: true, slug: true, name: true, nseSymbol: true, sector: true, industry: true,
      marketCap: true, peRatio: true, pbRatio: true, roePercent: true, dividendYield: true, eps: true,
    },
  });

  // Get latest prices for these companies
  const prices = await prisma.bhavcopyDaily.findMany({
    where: { companyId: { in: candidates.map((c) => c.id) }, date: latestBhav.date },
    select: { companyId: true, close: true, volume: true },
  });
  const priceMap = new Map(prices.map((p) => [p.companyId, { close: Number(p.close), volume: Number(p.volume) }]));

  // Apply price filter and slice to limit
  const filtered = candidates
    .map((c) => ({ ...c, ltp: priceMap.get(c.id)?.close ?? null, volume: priceMap.get(c.id)?.volume ?? null }))
    .filter((c) => {
      if (!c.ltp) return false;
      if (cat.filter.priceMin != null && c.ltp < cat.filter.priceMin) return false;
      if (cat.filter.priceMax != null && c.ltp > cat.filter.priceMax) return false;
      return true;
    })
    .slice(0, cat.filter.limit);

  const Icon = ICON_MAP[cat.icon] ?? Coins;

  // JSON-LD ItemList schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": cat.title,
    "description": cat.description,
    "numberOfItems": filtered.length,
    "itemListElement": filtered.slice(0, 20).map((c, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Corporation",
        "name": c.name,
        "url": `https://ipopulse.talkytools.com/ticker/${c.slug}`,
        "tickerSymbol": c.nseSymbol,
      }
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Link href="/best-stocks" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4" /> All curated lists
        </Link>

        {/* Header */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{cat.title.split(" — ")[0]}</h1>
              <p className="text-sm text-gray-700 leading-relaxed">{cat.longDescription}</p>
            </div>
          </div>
        </div>

        {/* Expert note */}
        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-900 leading-relaxed">
              <span className="font-semibold">Expert note: </span>
              {cat.expertNote}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card text-center">
            <div className="text-2xl font-bold text-indigo-700">{filtered.length}</div>
            <div className="text-xs text-gray-500 mt-1">Companies listed</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {filtered.length > 0 ? formatCurrency(Math.max(...filtered.map((c) => Number(c.marketCap ?? 0))) * 10000000) : "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">Largest by market cap</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-violet-700">
              {filtered.length > 0 ? `₹${Math.min(...filtered.map((c) => c.ltp ?? Infinity)).toFixed(0)}` : "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">Lowest price</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-amber-600">
              {filtered.length > 0 ? `₹${Math.max(...filtered.map((c) => c.ltp ?? 0)).toFixed(0)}` : "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">Highest price</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Sector</th>
                  <th className="px-3 py-3 text-right">LTP</th>
                  <th className="px-3 py-3 text-right">Market Cap</th>
                  <th className="px-3 py-3 text-right">P/E</th>
                  <th className="px-3 py-3 text-right">ROE %</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3 text-sm">
                      <Link href={`/ticker/${c.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {c.name}
                      </Link>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{c.nseSymbol ?? "—"}</div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{c.sector ?? "—"}</td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">
                      {c.ltp != null ? `₹${c.ltp.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">
                      {c.marketCap ? formatCurrency(Number(c.marketCap) * 10000000) : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">
                      {c.peRatio != null ? Number(c.peRatio).toFixed(1) : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">
                      {c.roePercent != null ? `${Number(c.roePercent).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-12 text-center text-sm text-gray-500">
                      No companies match the filter criteria for this category yet. Data populates as bhavcopy and fundamentals are updated.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">
          Prices as of {new Date(latestBhav.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.
          P/E and ROE shown for top 200 companies by market cap (updated quarterly). Click any company for detailed profile, news, and 1-year chart.
        </p>

        {/* Other categories */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">Explore other categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {bestStocksCategories.filter((c) => c.slug !== slug).slice(0, 8).map((c) => {
              const Ic = ICON_MAP[c.icon] ?? Coins;
              return (
                <Link
                  key={c.slug}
                  href={`/best-stocks/${c.slug}`}
                  className="card hover:border-indigo-300 transition group flex items-center gap-2"
                >
                  <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center flex-shrink-0`}>
                    <Ic className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 group-hover:text-indigo-700">{c.shortLabel}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
