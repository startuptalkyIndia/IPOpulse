import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import { brokers } from "@/lib/compare-data";

export const metadata: Metadata = {
  title: "Compare Stock Brokers India — Zerodha vs Groww vs Upstox vs Angel",
  description:
    "Detailed comparison of India's top 6 stock brokers. Fees, platforms, API access, best-for recommendations. Updated April 2026.",
  alternates: { canonical: "/compare/brokers" },
};

export default function CompareBrokersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All comparisons
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Compare Indian Stock Brokers</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Six top Indian brokers side-by-side. Fees as of April 2026. Click "Open account" to go directly to the
          broker's signup.
        </p>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Broker</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Opening</th>
                <th className="px-3 py-3">AMC</th>
                <th className="px-3 py-3">Delivery</th>
                <th className="px-3 py-3">Intraday</th>
                <th className="px-3 py-3">F&amp;O</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((b) => (
                <tr key={b.slug} className="border-b border-gray-100">
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900">{b.name}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 capitalize">{b.type}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">{b.accountOpening}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">{b.amc}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">{b.equityDelivery}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">{b.equityIntraday}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">{b.fno}</td>
                  <td className="px-3 py-3 text-right">
                    <a
                      href={b.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Detailed broker profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brokers.map((b) => (
            <div key={b.slug} className="card">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">{b.name}</h3>
                <span className="badge bg-indigo-50 text-indigo-700 capitalize">{b.type}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3"><span className="font-medium">Best for:</span> {b.bestFor}</p>
              <ul className="space-y-1.5 mb-4">
                {b.features.map((f) => (
                  <li key={f} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={b.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full inline-flex items-center justify-center gap-1"
              >
                Open {b.name} account <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
