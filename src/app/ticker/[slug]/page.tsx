export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Layers } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/ticker" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Back to Ticker
      </Link>

      <div className="card">
        <div className="flex items-start justify-between gap-3">
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
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Market cap</div>
            <div className="text-sm font-semibold text-gray-900 tabular-nums mt-0.5">
              {company.marketCap ? formatCurrency(Number(company.marketCap) * 10000000) : "—"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">LTP</div>
            <div className="text-sm font-semibold text-gray-400 tabular-nums mt-0.5">Live price soon</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">P/E</div>
            <div className="text-sm font-semibold text-gray-400 mt-0.5">—</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Listed</div>
            <div className="text-sm font-semibold text-gray-900 mt-0.5">{company.listedOn ? new Date(company.listedOn).getFullYear() : "—"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Financials (10-yr)", "Shareholding", "Concall AI notes"].map((t) => (
          <div key={t} className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{t}</h3>
            <p className="text-xs text-gray-500 mb-2">Wiring up once live data pipeline is connected via BSE/NSE filings.</p>
            <span className="badge badge-warning">Coming soon</span>
          </div>
        ))}
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
    </div>
  );
}
