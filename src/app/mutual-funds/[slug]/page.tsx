export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

const amcSlug = (amc: string) => amc.toLowerCase().replace(/\s+/g, "-");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fund = await prisma.mutualFund.findUnique({ where: { slug } });
  if (!fund) return { title: "Fund not found" };
  return {
    title: `${fund.schemeName} — NAV, Returns & Details | IPOpulse`,
    description: `${fund.schemeName} by ${fund.amc ?? ""} — latest NAV ₹${Number(fund.nav).toFixed(2)}, category ${fund.category ?? "—"}. Daily NAV from AMFI.`,
    alternates: { canonical: `/mutual-funds/${slug}` },
  };
}

export default async function FundPage({ params }: Props) {
  const { slug } = await params;
  const fund = await prisma.mutualFund.findUnique({ where: { slug } });
  if (!fund) notFound();

  // Peer funds in same category from same AMC, then other AMCs
  const peers = fund.category
    ? await prisma.mutualFund.findMany({
        where: { active: true, category: fund.category, slug: { not: slug } },
        orderBy: { schemeName: "asc" },
        take: 10,
        select: { slug: true, schemeName: true, amc: true, nav: true },
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link href="/mutual-funds" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All mutual funds
      </Link>

      {/* Header */}
      <div className="card">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{fund.schemeName}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
          {fund.amc && (
            <Link href={`/mutual-funds/amc/${amcSlug(fund.amc)}`} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded hover:bg-indigo-100">
              {fund.amc}
            </Link>
          )}
          {fund.category && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{fund.category}</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Latest NAV</div>
            <div className="text-lg font-bold text-gray-900 tabular-nums">
              ₹{Number(fund.nav).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">NAV Date</div>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {new Date(fund.navAsOf).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          {fund.schemeCode && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Scheme Code</div>
              <div className="text-sm font-semibold text-gray-900 mt-1 font-mono">{fund.schemeCode}</div>
            </div>
          )}
          {fund.isinGrowth && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">ISIN (Growth)</div>
              <div className="text-xs font-semibold text-gray-900 mt-1 font-mono">{fund.isinGrowth}</div>
            </div>
          )}
        </div>
      </div>

      {/* Peers */}
      {peers.length > 0 && fund.category && (
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Other {fund.category} funds
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-3 py-2.5">Scheme</th>
                  <th className="px-3 py-2.5">AMC</th>
                  <th className="px-3 py-2.5 text-right">NAV (₹)</th>
                </tr>
              </thead>
              <tbody>
                {peers.map((p) => (
                  <tr key={p.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm">
                      <Link href={`/mutual-funds/${p.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {p.schemeName}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{p.amc ?? "—"}</td>
                    <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-900">
                      ₹{Number(p.nav).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="text-[11px] text-gray-400">
        NAV sourced daily from AMFI&apos;s public NAVAll feed. Past performance does not guarantee future returns.
        Mutual fund investments are subject to market risks — read all scheme documents carefully. Not investment advice.
      </p>
    </div>
  );
}
