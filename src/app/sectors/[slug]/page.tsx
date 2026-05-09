export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { sectors, getSectorBySlug } from "@/lib/sectors";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

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
    title: `${name} Sector — listed companies, market cap, P/E`,
    description: `${name} sector companies listed on NSE/BSE. Market cap, price, sector performance.`,
    alternates: { canonical: `/sectors/${slug}` },
  };
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  // Try predefined sector first; fall back to dynamic DB lookup
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
    }),
    sector?.niftyIndex
      ? prisma.niftyIndex.findFirst({
          where: { indexName: sector.niftyIndex },
          orderBy: { date: "desc" },
        }).catch(() => null)
      : Promise.resolve(null),
    // Verify the sector actually exists in DB before showing page
    prisma.company.count({ where: { sector: sectorName, active: true } }),
  ]);

  // 404 only if sector doesn't exist in sectors.ts AND has no DB companies
  if (!sector && dbCount === 0) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/sectors" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All sectors
      </Link>

      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{sectorName}</h1>
            {sector?.niftyIndex ? (
              <div className="text-xs text-indigo-600 font-medium mt-1">{sector.niftyIndex}</div>
            ) : null}
            {sector?.description && <p className="text-sm text-gray-700 mt-3 leading-relaxed">{sector.description}</p>}
          </div>
          {indexData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-fit">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Close</div>
                <div className="text-base font-bold text-gray-900 tabular-nums">
                  {Number(indexData.close).toLocaleString("en-IN")}
                </div>
                {indexData.changePct != null && (
                  <div className={`text-xs font-medium ${Number(indexData.changePct) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {Number(indexData.changePct) >= 0 ? "▲" : "▼"} {Math.abs(Number(indexData.changePct)).toFixed(2)}%
                  </div>
                )}
              </div>
              {indexData.pe != null && (
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">P/E</div>
                  <div className="text-base font-bold text-indigo-700">{Number(indexData.pe).toFixed(2)}</div>
                </div>
              )}
              {indexData.pb != null && (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">P/B</div>
                  <div className="text-base font-bold text-gray-700">{Number(indexData.pb).toFixed(2)}</div>
                </div>
              )}
              {indexData.divYield != null && (
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Div Yield</div>
                  <div className="text-base font-bold text-emerald-700">{Number(indexData.divYield).toFixed(2)}%</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Top companies in {sectorName}</h2>
        {allCompanies.length === 0 ? (
          <div className="card text-center py-8 text-sm text-gray-500">
            Company master for this sector is still being populated.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Symbol</th>
                  <th className="px-3 py-3">Industry</th>
                  <th className="px-3 py-3 text-right">Market cap</th>
                </tr>
              </thead>
              <tbody>
                {allCompanies.map((c, i) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3 text-sm">
                      <Link href={`/ticker/${c.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-gray-500">{c.nseSymbol ?? "—"}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{c.industry ?? "—"}</td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">
                      {c.marketCap ? formatCurrency(Number(c.marketCap) * 10000000) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
