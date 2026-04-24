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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSectorBySlug(slug);
  if (!s) return { title: "Sector not found" };
  return {
    title: `${s.name} Sector — companies, ${s.niftyIndex ?? "index"}, FII flows`,
    description: `${s.name} sector in India. ${s.description} Constituent companies, market cap rankings.`,
    alternates: { canonical: `/sectors/${slug}` },
  };
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) notFound();

  // Map sector slug to Company.sector column via matching on "name contains"
  const allCompanies = await prisma.company.findMany({
    where: {
      active: true,
      OR: [
        { sector: { equals: sector.name } },
        { sector: { contains: sector.name.split(" ")[0], mode: "insensitive" } },
      ],
    },
    orderBy: { marketCap: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/sectors" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All sectors
      </Link>

      <div className="card">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{sector.name}</h1>
        {sector.niftyIndex ? (
          <div className="text-xs text-indigo-600 font-medium mt-1">Index: {sector.niftyIndex}</div>
        ) : null}
        <p className="text-sm text-gray-700 mt-3 leading-relaxed">{sector.description}</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Top companies in {sector.name}</h2>
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
