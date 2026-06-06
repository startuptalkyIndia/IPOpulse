export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";
import { prisma } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

const amcSlug = (amc: string) => amc.toLowerCase().replace(/\s+/g, "-");

// Find the AMC whose slugified name matches the URL slug.
async function resolveAmc(slug: string): Promise<string | null> {
  const amcs = await prisma.mutualFund.findMany({
    where: { active: true, amc: { not: null } },
    distinct: ["amc"],
    select: { amc: true },
  });
  const match = amcs.find((a) => a.amc && amcSlug(a.amc) === slug);
  return match?.amc ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const amc = await resolveAmc(slug);
  if (!amc) return { title: "AMC not found" };
  return {
    title: `${amc} — All Mutual Fund Schemes & NAV | IPOpulse`,
    description: `Every mutual fund scheme by ${amc} with latest daily NAV from AMFI. Browse equity, debt, hybrid and other categories.`,
    alternates: { canonical: `/mutual-funds/amc/${slug}` },
  };
}

export default async function AmcPage({ params }: Props) {
  const { slug } = await params;
  const amc = await resolveAmc(slug);
  if (!amc) notFound();

  const funds = await prisma.mutualFund.findMany({
    where: { active: true, amc },
    orderBy: [{ category: "asc" }, { schemeName: "asc" }],
    select: { slug: true, schemeName: true, category: true, nav: true, navAsOf: true },
  });

  // Group by category
  const byCategory = new Map<string, typeof funds>();
  for (const f of funds) {
    const cat = f.category ?? "Other";
    const arr = byCategory.get(cat) ?? [];
    arr.push(f);
    byCategory.set(cat, arr);
  }
  const categories = Array.from(byCategory.entries()).sort((a, b) => b[1].length - a[1].length);
  const latestNavDate = funds[0]?.navAsOf;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/mutual-funds" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All mutual funds
      </Link>

      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{amc}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {funds.length.toLocaleString("en-IN")} schemes across {categories.length} categories.
              {latestNavDate && ` NAV as of ${new Date(latestNavDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Category jump pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(([cat, list]) => (
          <a key={cat} href={`#${cat.replace(/\s+/g, "-")}`}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
            {cat} ({list.length})
          </a>
        ))}
      </div>

      {/* Funds by category */}
      {categories.map(([cat, list]) => (
        <section key={cat} id={cat.replace(/\s+/g, "-")} className="scroll-mt-20">
          <h2 className="text-base font-semibold text-gray-900 mb-3">{cat} <span className="text-xs font-normal text-gray-400">({list.length})</span></h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-3 py-2.5">Scheme</th>
                  <th className="px-3 py-2.5 text-right">NAV (₹)</th>
                </tr>
              </thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm">
                      <Link href={`/mutual-funds/${f.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {f.schemeName}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-900">
                      ₹{Number(f.nav).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <p className="text-[11px] text-gray-400">
        NAVs sourced daily from AMFI&apos;s public NAVAll feed. For informational purposes only — not investment advice.
      </p>
    </div>
  );
}
