export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Minus, X, Database } from "lucide-react";
import { superInvestors, getInvestorBySlug } from "@/lib/super-investors";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return superInvestors.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const inv = getInvestorBySlug(slug);
  if (!inv) return { title: "Investor not found" };
  return {
    title: `${inv.name} Portfolio — quarterly holdings from BSE filings`,
    description: `${inv.shortName}'s full stock portfolio based on latest BSE/NSE shareholding filings. Holdings, values, QoQ changes, and free alerts on moves.`,
    alternates: { canonical: `/super-investor/${slug}` },
  };
}

const changeLabel: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  new:     { label: "New position", cls: "bg-indigo-100 text-indigo-800", Icon: Plus },
  added:   { label: "Increased",    cls: "bg-green-100 text-green-800",   Icon: TrendingUp },
  same:    { label: "Unchanged",    cls: "bg-gray-100 text-gray-700",     Icon: Minus },
  reduced: { label: "Reduced",      cls: "bg-yellow-100 text-yellow-800", Icon: TrendingDown },
  exited:  { label: "Exited",       cls: "bg-red-100 text-red-800",       Icon: X },
};

import React from "react";

export default async function InvestorPage({ params }: Props) {
  const { slug } = await params;
  const inv = getInvestorBySlug(slug);
  if (!inv) notFound();

  // Try live DB holdings first — latest quarter
  const dbHoldings = await prisma.superInvestorHolding.findMany({
    where: { investorSlug: slug },
    include: { company: { select: { name: true, slug: true, nseSymbol: true, peRatio: true } } },
    orderBy: [
      { quarter: "desc" },
      { valueCr: "desc" },
    ],
  });

  // Group by latest quarter
  const latestQuarter = dbHoldings[0]?.quarter ?? null;
  const liveHoldings = latestQuarter
    ? dbHoldings.filter((h) => h.quarter === latestQuarter)
    : [];

  const usingLive = liveHoldings.length > 0;

  // Compute totals
  interface DisplayHolding {
    company: string;
    companySlug: string | null;
    pctHeld: number;
    valueCr: number;
    qoqChange: string;
    peRatio: number | null;
  }

  const holdings: DisplayHolding[] = usingLive
    ? liveHoldings.map((h) => ({
        company: h.company.name,
        companySlug: h.company.slug,
        pctHeld: Number(h.pctHeld),
        valueCr: h.valueCr ? Number(h.valueCr) : 0,
        qoqChange: h.qoqChange ?? "same",
        peRatio: h.company.peRatio ? Number(h.company.peRatio) : null,
      }))
    : inv.holdings.map((h) => ({
        company: h.company,
        companySlug: null,
        pctHeld: h.pctHeld,
        valueCr: h.valueCr,
        qoqChange: h.qoqChange,
        peRatio: null,
      }));

  const totalCr = holdings.reduce((s, h) => s + h.valueCr, 0);
  const asOf = usingLive ? latestQuarter! : inv.asOf;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/super-investor" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All super investors
      </Link>

      <div className="card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{inv.name}</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-3xl leading-relaxed">{inv.bio}</p>
          </div>
          {usingLive ? (
            <span className="badge badge-success flex items-center gap-1 shrink-0">
              <Database className="w-3 h-3" /> Live BSE data
            </span>
          ) : (
            <span className="badge badge-warning shrink-0">Seed data — live filing ingestion pending</span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Approx. portfolio</div>
            <div className="text-lg font-bold text-indigo-700 tabular-nums">
              {formatCurrency(
                usingLive && totalCr > 0
                  ? totalCr * 10_000_000
                  : inv.approxPortfolioCr * 10_000_000
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Tracked holdings</div>
            <div className="text-lg font-bold text-gray-900 tabular-nums">{holdings.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Tracked value</div>
            <div className="text-lg font-bold text-gray-900 tabular-nums">
              {totalCr > 0 ? formatCurrency(totalCr * 10_000_000) : "—"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">As of</div>
            <div className="text-sm font-semibold text-gray-900">{asOf}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Holdings (&gt;1% of company)
          {latestQuarter && (
            <span className="ml-2 text-xs font-normal text-gray-500">{latestQuarter}</span>
          )}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3 text-right">% held</th>
                <th className="px-3 py-3 text-right">Value</th>
                <th className="px-3 py-3 text-right">% of portfolio</th>
                {usingLive && <th className="px-3 py-3 text-right">P/E</th>}
                <th className="px-3 py-3">QoQ</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const meta = changeLabel[h.qoqChange] ?? changeLabel.same;
                const Icon = meta.Icon;
                const pctOfPortfolio = totalCr > 0 ? (h.valueCr / totalCr) * 100 : 0;
                return (
                  <tr key={h.company} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">
                      {h.companySlug ? (
                        <Link href={`/ticker/${h.companySlug}`} className="hover:text-indigo-600">
                          {h.company}
                        </Link>
                      ) : (
                        h.company
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">
                      {h.pctHeld.toFixed(2)}%
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-right tabular-nums font-semibold">
                      {h.valueCr > 0 ? formatCurrency(h.valueCr * 10_000_000) : "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">
                      {pctOfPortfolio.toFixed(1)}%
                    </td>
                    {usingLive && (
                      <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">
                        {h.peRatio ? h.peRatio.toFixed(1) : "—"}
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 badge ${meta.cls}`}>
                        <Icon className="w-3 h-3" /> {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          {usingLive
            ? `Live data from BSE quarterly shareholding pattern filings (${latestQuarter}). Investors disclose positions above 1% of a company.`
            : "Representative seed data. Live BSE quarterly filings will auto-populate once the ingestion cron runs."}
        </p>
      </div>

      {/* Historical quarters breadcrumb */}
      {dbHoldings.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Quarter history</h3>
          <div className="flex flex-wrap gap-2">
            {[...new Set(dbHoldings.map((h) => h.quarter))].map((q) => (
              <span
                key={q}
                className={`text-xs px-2 py-1 rounded-md border ${
                  q === latestQuarter
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
