export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp, AlertTriangle, BookOpen, Building2 } from "lucide-react";
import { sectors, getSectorBySlug } from "@/lib/sectors";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { Sparkline } from "@/components/Sparkline";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return sectors.map((s) => ({ slug: s.slug }));
}

// Convert slug to sector name: "consumer-services" → "Consumer Services"
function slugToSectorName(slug: string): string {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSectorBySlug(slug);
  const name = s?.name ?? slugToSectorName(slug);
  return {
    title: `${name} Sector — top stocks, market cap, P/E, ROE, sector performance`,
    description: `${name} sector deep dive — top companies by market cap, sector PE/ROE, 30-day price trends, YoY revenue growth. Updated daily from NSE bhavcopy.`,
    alternates: { canonical: `/sectors/${slug}` },
  };
}

// Median helper for sector aggregate stats
function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  const sectorName = sector?.name ?? slugToSectorName(slug);

  const [allCompanies, indexData, dbCount] = await Promise.all([
    prisma.company.findMany({
      where: {
        active: true,
        OR: [
          { sector: { equals: sectorName } },
          { sector: { contains: sectorName.split(" ")[0], mode: "insensitive" } },
        ],
      },
      orderBy: { marketCap: "desc" },
      select: {
        id: true, slug: true, name: true, nseSymbol: true, industry: true,
        marketCap: true, peRatio: true, pbRatio: true, roePercent: true,
        dividendYield: true,
      },
    }),
    sector?.niftyIndex
      ? prisma.niftyIndex.findFirst({
          where: { indexName: sector.niftyIndex },
          orderBy: { date: "desc" },
        }).catch(() => null)
      : Promise.resolve(null),
    prisma.company.count({ where: { sector: sectorName, active: true } }),
  ]);

  if (!sector && dbCount === 0) notFound();

  // ─── Aggregate sector stats ────────────────────────────────────────────
  const totalMarketCap = allCompanies.reduce((s, c) => s + (c.marketCap ? Number(c.marketCap) : 0), 0);
  const peValues   = allCompanies.map(c => c.peRatio ? Number(c.peRatio) : null).filter((v): v is number => v != null && v > 0 && v < 200);
  const roeValues  = allCompanies.map(c => c.roePercent ? Number(c.roePercent) : null).filter((v): v is number => v != null);
  const divYields  = allCompanies.map(c => c.dividendYield ? Number(c.dividendYield) : null).filter((v): v is number => v != null);
  const medianPe   = median(peValues);
  const medianRoe  = median(roeValues);
  const medianDiv  = median(divYields);

  // ─── Industry breakdown ────────────────────────────────────────────────
  const industryMap = new Map<string, { count: number; mktCap: number }>();
  for (const c of allCompanies) {
    const ind = c.industry ?? "Other";
    const cur = industryMap.get(ind) ?? { count: 0, mktCap: 0 };
    cur.count++;
    cur.mktCap += c.marketCap ? Number(c.marketCap) : 0;
    industryMap.set(ind, cur);
  }
  const industries = Array.from(industryMap.entries())
    .sort((a, b) => b[1].mktCap - a[1].mktCap)
    .slice(0, 6);

  // ─── 30-day price history for sparklines (top 20 only) ─────────────────
  const top20 = allCompanies.slice(0, 20);
  const sparkCutoff = new Date(); sparkCutoff.setDate(sparkCutoff.getDate() - 35);
  const sparkRows = top20.length > 0 ? await prisma.bhavcopyDaily.findMany({
    where: { companyId: { in: top20.map(c => c.id) }, date: { gte: sparkCutoff } },
    orderBy: [{ companyId: "asc" }, { date: "asc" }],
    select: { companyId: true, close: true },
  }) : [];
  const sparkMap = new Map<number, number[]>();
  for (const r of sparkRows) {
    const arr = sparkMap.get(r.companyId) ?? [];
    arr.push(Number(r.close));
    sparkMap.set(r.companyId, arr);
  }

  // ─── YoY growth for top 20 ──────────────────────────────────────────────
  const annuals = top20.length > 0 ? await prisma.annualFinancial.findMany({
    where: { companyId: { in: top20.map(c => c.id) } },
    orderBy: [{ companyId: "asc" }, { yearEnd: "desc" }],
    select: { companyId: true, sales: true, netProfit: true },
  }) : [];
  const yoyMap = new Map<number, { revGrowth: number | null; profitGrowth: number | null }>();
  const byCo = new Map<number, typeof annuals>();
  for (const a of annuals) {
    const arr = byCo.get(a.companyId) ?? [];
    if (arr.length < 2) { arr.push(a); byCo.set(a.companyId, arr); }
  }
  for (const [companyId, rows] of byCo.entries()) {
    if (rows.length < 2) continue;
    const [latest, prior] = rows;
    const lSales = latest.sales ? Number(latest.sales) : null;
    const pSales = prior.sales ? Number(prior.sales) : null;
    const lProfit = latest.netProfit ? Number(latest.netProfit) : null;
    const pProfit = prior.netProfit ? Number(prior.netProfit) : null;
    const revGrowth = lSales && pSales && pSales > 0 ? ((lSales - pSales) / pSales) * 100 : null;
    const profitGrowth = lProfit && pProfit && Math.abs(pProfit) > 0 ? ((lProfit - pProfit) / Math.abs(pProfit)) * 100 : null;
    yoyMap.set(companyId, { revGrowth, profitGrowth });
  }

  // ─── 30-day return % for each top-20 company ────────────────────────────
  const perf30d = top20.map(c => {
    const prices = sparkMap.get(c.id) ?? [];
    if (prices.length < 2) return { id: c.id, name: c.name, slug: c.slug, ret: null };
    const ret = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
    return { id: c.id, name: c.name, slug: c.slug, ret };
  }).filter(x => x.ret != null) as Array<{ id: number; name: string; slug: string; ret: number }>;
  const bestPerformer = perf30d.length > 0 ? perf30d.reduce((b, c) => c.ret > b.ret ? c : b) : null;
  const worstPerformer = perf30d.length > 0 ? perf30d.reduce((b, c) => c.ret < b.ret ? c : b) : null;

  const totalMktCapCr = totalMarketCap;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/sectors" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All sectors
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{sectorName}</h1>
            {sector?.niftyIndex ? (
              <div className="text-xs text-indigo-600 font-medium mt-1">{sector.niftyIndex}</div>
            ) : null}
            {sector?.longDescription && (
              <p className="text-sm text-gray-700 mt-3 leading-relaxed max-w-2xl">{sector.longDescription}</p>
            )}
            {!sector?.longDescription && sector?.description && (
              <p className="text-sm text-gray-700 mt-3 leading-relaxed">{sector.description}</p>
            )}
          </div>
          {indexData && (
            <div className="grid grid-cols-2 gap-2 min-w-fit">
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-gray-500">{sector?.niftyIndex} Close</div>
                <div className="text-sm font-bold text-gray-900 tabular-nums">{Number(indexData.close).toLocaleString("en-IN")}</div>
                {indexData.changePct != null && (
                  <div className={`text-[10px] font-medium ${Number(indexData.changePct) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {Number(indexData.changePct) >= 0 ? "▲" : "▼"} {Math.abs(Number(indexData.changePct)).toFixed(2)}%
                  </div>
                )}
              </div>
              {indexData.pe != null && (
                <div className="bg-indigo-50 rounded-lg px-3 py-2 text-center">
                  <div className="text-[10px] text-gray-500">Index P/E</div>
                  <div className="text-sm font-bold text-indigo-700">{Number(indexData.pe).toFixed(2)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Companies</div>
          <div className="text-2xl font-bold text-gray-900 tabular-nums">{allCompanies.length}</div>
        </div>
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total Market Cap</div>
          <div className="text-2xl font-bold text-indigo-700 tabular-nums">{formatCurrency(totalMktCapCr * 10000000)}</div>
        </div>
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Median P/E</div>
          <div className="text-2xl font-bold text-violet-700 tabular-nums">{medianPe?.toFixed(1) ?? "—"}</div>
        </div>
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Median ROE</div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">{medianRoe != null ? `${medianRoe.toFixed(1)}%` : "—"}</div>
        </div>
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Median Div Yld</div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums">{medianDiv != null ? `${medianDiv.toFixed(2)}%` : "—"}</div>
        </div>
        <div className="card">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Top Company</div>
          <div className="text-sm font-bold text-gray-900 truncate mt-1">{allCompanies[0]?.name ?? "—"}</div>
        </div>
      </div>

      {/* Best/Worst 30-day performers */}
      {bestPerformer && worstPerformer && bestPerformer.id !== worstPerformer.id && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="card border-emerald-200 bg-emerald-50/30">
            <div className="text-[10px] text-emerald-600 uppercase tracking-wide font-semibold">Best 30D Performer</div>
            <Link href={`/ticker/${bestPerformer.slug}`} className="text-base font-bold text-gray-900 hover:text-indigo-700 block mt-1">
              {bestPerformer.name}
            </Link>
            <div className="text-sm text-emerald-700 font-semibold tabular-nums">+{bestPerformer.ret.toFixed(1)}%</div>
          </div>
          <div className="card border-red-200 bg-red-50/30">
            <div className="text-[10px] text-red-600 uppercase tracking-wide font-semibold">Worst 30D Performer</div>
            <Link href={`/ticker/${worstPerformer.slug}`} className="text-base font-bold text-gray-900 hover:text-indigo-700 block mt-1">
              {worstPerformer.name}
            </Link>
            <div className="text-sm text-red-700 font-semibold tabular-nums">{worstPerformer.ret.toFixed(1)}%</div>
          </div>
        </div>
      )}

      {/* Themes + Risks */}
      {sector && (sector.themes?.length || sector.risks?.length) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sector.themes?.length ? (
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Key Investment Themes
              </h2>
              <ul className="space-y-2">
                {sector.themes.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
              {sector.learnLink && (
                <Link href={sector.learnLink} className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Learn more about valuation →
                </Link>
              )}
            </div>
          ) : null}
          {sector.risks?.length ? (
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Key Risks to Watch
              </h2>
              <ul className="space-y-2">
                {sector.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">⚠</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Industry breakdown */}
      {industries.length > 1 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" /> Industry breakdown
          </h2>
          <div className="card p-0 overflow-hidden">
            {industries.map(([industry, data], i) => {
              const pct = totalMktCapCr > 0 ? (data.mktCap / totalMktCapCr) * 100 : 0;
              return (
                <div key={i} className="border-b border-gray-100 last:border-b-0 px-4 py-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-900">{industry}</span>
                    <span className="text-gray-500 tabular-nums">
                      {data.count} cos · {formatCurrency(data.mktCap * 10000000)} · {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Top 20 companies table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Top companies in {sectorName}</h2>
          <span className="text-xs text-gray-400">{allCompanies.length > 20 ? `Showing 20 of ${allCompanies.length}` : `${allCompanies.length} companies`}</span>
        </div>
        {top20.length === 0 ? (
          <div className="card text-center py-8 text-sm text-gray-500">
            Company master for this sector is still being populated.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">Company</th>
                    <th className="px-3 py-3 text-center">30D</th>
                    <th className="px-3 py-3 text-right">Market cap</th>
                    <th className="px-3 py-3 text-right">P/E</th>
                    <th className="px-3 py-3 text-right">ROE %</th>
                    <th className="px-3 py-3 text-right">Rev YoY</th>
                    <th className="px-3 py-3 text-right">Profit YoY</th>
                  </tr>
                </thead>
                <tbody>
                  {top20.map((c, i) => {
                    const growth = yoyMap.get(c.id);
                    return (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-3 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-3 py-3 text-sm">
                          <Link href={`/ticker/${c.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                            {c.name}
                          </Link>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{c.nseSymbol ?? "—"}{c.industry ? ` · ${c.industry}` : ""}</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Sparkline values={sparkMap.get(c.id) ?? []} width={70} height={22} />
                        </td>
                        <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">
                          {c.marketCap ? formatCurrency(Number(c.marketCap) * 10000000) : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">
                          {c.peRatio ? Number(c.peRatio).toFixed(1) : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">
                          {c.roePercent ? `${Number(c.roePercent).toFixed(1)}%` : "—"}
                        </td>
                        <td className={`px-3 py-3 text-xs text-right tabular-nums ${
                          growth?.revGrowth != null
                            ? growth.revGrowth >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"
                            : "text-gray-400"
                        }`}>
                          {growth?.revGrowth != null ? `${growth.revGrowth >= 0 ? "+" : ""}${growth.revGrowth.toFixed(1)}%` : "—"}
                        </td>
                        <td className={`px-3 py-3 text-xs text-right tabular-nums ${
                          growth?.profitGrowth != null
                            ? growth.profitGrowth >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"
                            : "text-gray-400"
                        }`}>
                          {growth?.profitGrowth != null ? `${growth.profitGrowth >= 0 ? "+" : ""}${growth.profitGrowth.toFixed(1)}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-2">
          P/E, ROE, YoY growth shown when available. YoY growth requires 2+ years of annual financials (top 200 companies refreshed weekly).
        </p>
      </section>
    </div>
  );
}
