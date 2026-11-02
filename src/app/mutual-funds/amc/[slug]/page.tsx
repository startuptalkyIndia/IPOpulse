export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";
import { prisma } from "@/lib/db";
import { createAmcResolver, parsePage, resolvePage, amcMetadata, AMC_PAGE_SIZE, AMC_FUND_ORDER } from "@/lib/amc";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

// Cached AMC list (one groupBy an hour), not a scan of every fund per view.
const resolveAmcCached = createAmcResolver(async () => {
  const groups = await prisma.mutualFund.groupBy({
    by: ["amc"],
    where: { active: true, amc: { not: null } },
  });
  return groups.map((g) => g.amc).filter((a): a is string => !!a);
});
const resolveAmc = (slug: string) => resolveAmcCached(slug);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const amc = await resolveAmc(slug);
  if (!amc) return { title: "AMC not found" };
  let page = 1;
  if (parsePage(sp?.page) > 1) {
    const total = await prisma.mutualFund.count({ where: { active: true, amc } });
    page = resolvePage(sp?.page, total).page;
  }
  return amcMetadata(amc, slug, page);
}

export default async function AmcPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const amc = await resolveAmc(slug);
  if (!amc) notFound();

  const where = { active: true, amc } as const;
  const orderBy = AMC_FUND_ORDER;
  const [total, catGroups] = await Promise.all([
    prisma.mutualFund.count({ where }),
    prisma.mutualFund.groupBy({ by: ["category"], where }),
  ]);
  const { totalPages, page } = resolvePage(sp?.page, total);
  const funds = await prisma.mutualFund.findMany({
    where,
    orderBy,
    skip: (page - 1) * AMC_PAGE_SIZE,
    take: AMC_PAGE_SIZE,
    select: { slug: true, schemeName: true, category: true, nav: true, navAsOf: true },
  });
  const categoryCount = new Set(catGroups.map((g) => g.category ?? "Other")).size;

  // Group by category
  const byCategory = new Map<string, typeof funds>();
  for (const f of funds) {
    const cat = f.category ?? "Other";
    const arr = byCategory.get(cat) ?? [];
    arr.push(f);
    byCategory.set(cat, arr);
  }
  const categories = Array.from(byCategory.entries()).sort((a, b) => b[1].length - a[1].length);
  // Same as before: the NAV date of the first fund in the full ordering (page 1's first row).
  const latestNavDate =
    page === 1
      ? funds[0]?.navAsOf
      : (await prisma.mutualFund.findFirst({ where, orderBy, select: { navAsOf: true } }))?.navAsOf;

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
              {total.toLocaleString("en-IN")} schemes across {categoryCount} categories.
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

      {totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          {page > 1 ? (
            <Link href={`/mutual-funds/amc/${slug}?page=${page - 1}`} rel="prev" className="text-indigo-600 hover:text-indigo-800">&larr; Previous</Link>
          ) : <span />}
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link href={`/mutual-funds/amc/${slug}?page=${page + 1}`} rel="next" className="text-indigo-600 hover:text-indigo-800">Next &rarr;</Link>
          ) : <span />}
        </nav>
      )}

      <p className="text-[11px] text-gray-400">
        NAVs sourced daily from AMFI&apos;s public NAVAll feed. For informational purposes only — not investment advice.
      </p>
    </div>
  );
}
