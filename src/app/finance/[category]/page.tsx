import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, CheckCircle2, Wallet, Home, Landmark, Briefcase, Car } from "lucide-react";
import {
  financeCategories,
  getFinanceCategory,
  productsForCategory,
  type FinanceCategory,
} from "@/lib/finance-products";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return financeCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = getFinanceCategory(category);
  if (!c) return { title: "Not found" };
  return {
    title: `${c.title} — Compare best ${c.title.toLowerCase()} options India 2026`,
    description: c.description,
    alternates: { canonical: `/finance/${c.slug}` },
  };
}

const iconMap = { Wallet, Home, Landmark, Briefcase, Car };

export default async function FinanceCategoryPage({ params }: Props) {
  const { category } = await params;
  const c = getFinanceCategory(category);
  if (!c) notFound();

  const products = productsForCategory(c.slug as FinanceCategory);
  const Icon = (iconMap as Record<string, typeof Wallet>)[c.iconName] ?? Wallet;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/finance" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All finance products
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Compare {c.title}</h1>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl">{c.description}</p>
      </div>

      <div className="card">
        <p className="text-sm text-gray-700 leading-relaxed">{c.heroIntro}</p>
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Brand / Product</th>
                <th className="px-3 py-3 text-right">Rate / Yield</th>
                <th className="px-3 py-3">Fee</th>
                <th className="px-3 py-3">Highlight</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug} className="border-b border-gray-100">
                  <td className="px-3 py-3 text-sm">
                    <div className="font-semibold text-gray-900">{p.brand}</div>
                    <div className="text-[11px] text-gray-500">{p.productName}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">{p.rateLabel}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">{p.fee}</td>
                  <td className="px-3 py-3 text-xs">
                    <span className="badge bg-indigo-50 text-indigo-700">{p.highlight}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <a
                      href={p.ctaUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      data-affiliate={p.slug}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed cards */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Detailed comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.slug} className="card">
              <div className="flex items-baseline justify-between mb-2 gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{p.brand}</h3>
                <span className="badge bg-indigo-50 text-indigo-700 text-[10px]">{p.highlight}</span>
              </div>
              <div className="text-xs text-gray-500 mb-3">{p.productName}</div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <div className="text-gray-400">Rate</div>
                  <div className="font-semibold text-gray-900">{p.rateLabel}</div>
                </div>
                <div>
                  <div className="text-gray-400">Fee</div>
                  <div className="font-medium text-gray-700">{p.fee}</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                <strong>Best for:</strong> {p.bestFor}
              </p>
              <ul className="space-y-1 mb-3">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={p.ctaUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                data-affiliate={p.slug}
                className="btn-primary w-full inline-flex items-center justify-center gap-1 text-xs"
              >
                Apply with {p.brand} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3">{c.title} FAQ</h2>
        <div className="space-y-3 text-sm">
          {c.faq.map((f, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900">{f.q}</h3>
              <p className="text-gray-600 mt-1">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Related comparisons</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {financeCategories
            .filter((other) => other.slug !== c.slug)
            .slice(0, 4)
            .map((other) => (
              <Link
                key={other.slug}
                href={`/finance/${other.slug}`}
                className="card text-center hover:border-indigo-300 transition text-sm font-medium text-gray-900"
              >
                {other.shortTitle}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
