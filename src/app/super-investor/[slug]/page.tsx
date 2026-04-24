import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Minus, X } from "lucide-react";
import { superInvestors, getInvestorBySlug } from "@/lib/super-investors";
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
    title: `${inv.name} Portfolio — ${inv.holdings.length}+ stocks, quarterly updates`,
    description: `${inv.shortName}'s full stock portfolio based on latest BSE/NSE filings. Holdings, values, QoQ changes, and free alerts on moves.`,
    alternates: { canonical: `/super-investor/${inv.slug}` },
  };
}

const changeLabel = {
  new: { label: "New position", cls: "bg-indigo-100 text-indigo-800", Icon: Plus },
  added: { label: "Increased", cls: "bg-green-100 text-green-800", Icon: TrendingUp },
  same: { label: "Unchanged", cls: "bg-gray-100 text-gray-700", Icon: Minus },
  reduced: { label: "Reduced", cls: "bg-yellow-100 text-yellow-800", Icon: TrendingDown },
  exited: { label: "Exited", cls: "bg-red-100 text-red-800", Icon: X },
};

export default async function InvestorPage({ params }: Props) {
  const { slug } = await params;
  const inv = getInvestorBySlug(slug);
  if (!inv) notFound();

  const sortedHoldings = [...inv.holdings].sort((a, b) => b.valueCr - a.valueCr);
  const totalCr = sortedHoldings.reduce((s, h) => s + h.valueCr, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/super-investor" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All super investors
      </Link>

      <div className="card">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{inv.name}</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-3xl leading-relaxed">{inv.bio}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Approx. portfolio</div>
            <div className="text-lg font-bold text-indigo-700 tabular-nums">
              {formatCurrency(inv.approxPortfolioCr * 10000000)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Tracked holdings</div>
            <div className="text-lg font-bold text-gray-900 tabular-nums">{inv.holdings.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Tracked value</div>
            <div className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(totalCr * 10000000)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">As of</div>
            <div className="text-sm font-semibold text-gray-900">{inv.asOf}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Holdings (&gt;1% of company)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3 text-right">% held</th>
                <th className="px-3 py-3 text-right">Value</th>
                <th className="px-3 py-3 text-right">% of portfolio</th>
                <th className="px-3 py-3">QoQ change</th>
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map((h) => {
                const meta = changeLabel[h.qoqChange];
                const Icon = meta.Icon;
                const pctOfPortfolio = (h.valueCr / totalCr) * 100;
                return (
                  <tr key={h.company} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{h.company}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">{h.pctHeld.toFixed(2)}%</td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-right tabular-nums font-semibold">
                      {formatCurrency(h.valueCr * 10000000)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">{pctOfPortfolio.toFixed(1)}%</td>
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
          Sourced from quarterly BSE/NSE shareholding pattern filings. Investors are only required to disclose
          positions above 1% of a company. Smaller positions are not public.
        </p>
      </div>
    </div>
  );
}
