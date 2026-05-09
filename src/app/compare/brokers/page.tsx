import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2, X, Star } from "lucide-react";
import { brokers } from "@/lib/compare-data";

export const metadata: Metadata = {
  title: "Best Stock Brokers India 2026 — Zerodha vs Groww vs Upstox vs Angel One",
  description:
    "Detailed comparison of India's top 6 stock brokers. Fees, platforms, AMC, API access, and best-for verdicts. Updated May 2026. Find the right broker for your investing style.",
  alternates: { canonical: "/compare/brokers" },
};

const quickPicks = [
  { label: "Best for beginners", broker: "Groww", why: "Zero AMC, simple UX, built-in mutual funds" },
  { label: "Best for serious investors", broker: "Zerodha", why: "Kite platform, best order types, ₹0 delivery" },
  { label: "Best for F&O traders", broker: "Dhan", why: "Options strategy builder, TradingView, zero AMC" },
  { label: "Best for algo trading", broker: "Upstox", why: "Free API access, 1,000+ API calls/min" },
  { label: "Best for research", broker: "Angel One", why: "SmartAPI + detailed equity research reports" },
  { label: "Best for bank integration", broker: "ICICI Direct", why: "3-in-1 account — savings, demat, trading in one login" },
];

const featureMatrix = [
  { feature: "Free account opening", zerodha: true, groww: true, upstox: true, angel: true, dhan: true, icici: false },
  { feature: "Zero AMC", zerodha: false, groww: true, upstox: false, angel: false, dhan: true, icici: false },
  { feature: "₹0 equity delivery brokerage", zerodha: true, groww: false, upstox: false, angel: true, dhan: true, icici: false },
  { feature: "Free API access", zerodha: false, groww: false, upstox: true, angel: true, dhan: false, icici: false },
  { feature: "Options strategy builder", zerodha: false, groww: false, upstox: false, angel: false, dhan: true, icici: false },
  { feature: "TradingView integration", zerodha: false, groww: false, upstox: false, angel: false, dhan: true, icici: false },
  { feature: "In-app mutual funds (direct)", zerodha: true, groww: true, upstox: true, angel: true, dhan: true, icici: false },
  { feature: "3-in-1 account", zerodha: false, groww: false, upstox: false, angel: false, dhan: false, icici: true },
  { feature: "Equity research reports", zerodha: false, groww: false, upstox: false, angel: true, dhan: false, icici: true },
  { feature: "IPO apply (ASBA/UPI)", zerodha: true, groww: true, upstox: true, angel: true, dhan: true, icici: true },
];

export default function CompareBrokersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All comparisons
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Best Stock Brokers in India 2026</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Six top Indian brokers compared side-by-side on fees, features, and platform quality. Fees as of May 2026.
        </p>
      </div>

      {/* Quick Picks */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Picks — Find Your Broker Fast</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickPicks.map((p) => (
            <div key={p.label} className="card flex items-start gap-3">
              <Star className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{p.label}</div>
                <div className="text-sm font-bold text-indigo-700 mt-0.5">{p.broker}</div>
                <div className="text-xs text-gray-500 mt-0.5">{p.why}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fee comparison table */}
      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Fee Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-3 py-3">Broker</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Opening</th>
                <th className="px-3 py-3">AMC / yr</th>
                <th className="px-3 py-3">Equity Delivery</th>
                <th className="px-3 py-3">Intraday</th>
                <th className="px-3 py-3">F&amp;O / order</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((b) => (
                <tr key={b.slug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 font-semibold text-gray-900">{b.name}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${b.type === "discount" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                      {b.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700">{b.accountOpening}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">{b.amc}</td>
                  <td className="px-3 py-3 text-xs">
                    <span className={b.equityDelivery === "₹0" || b.equityDelivery.includes("₹0 (up") ? "text-emerald-600 font-semibold" : "text-gray-700"}>
                      {b.equityDelivery}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700">{b.equityIntraday}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">{b.fno}</td>
                  <td className="px-3 py-3 text-right">
                    <a href={b.ctaUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Feature matrix */}
      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Feature Comparison Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500">
                <th className="text-left px-2 py-2.5 min-w-[200px]">Feature</th>
                {["Zerodha", "Groww", "Upstox", "Angel One", "Dhan", "ICICI Direct"].map((b) => (
                  <th key={b} className="text-center px-2 py-2.5 min-w-[80px]">{b}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureMatrix.map((row, i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                  <td className="px-2 py-2.5 text-xs text-gray-700">{row.feature}</td>
                  {[row.zerodha, row.groww, row.upstox, row.angel, row.dhan, row.icici].map((val, j) => (
                    <td key={j} className="text-center px-2 py-2.5">
                      {val
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed broker profiles */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Broker Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {brokers.map((b) => (
            <div key={b.slug} className="card flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{b.name}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${b.type === "discount" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                    {b.type} broker
                  </span>
                </div>
                <div className="text-right text-xs text-gray-500 shrink-0">
                  <div>Opening: <span className="font-semibold text-gray-800">{b.accountOpening}</span></div>
                  <div>AMC: <span className="font-semibold text-gray-800">{b.amc}</span></div>
                </div>
              </div>

              <div className="text-xs text-indigo-700 font-semibold mb-3 bg-indigo-50 px-3 py-1.5 rounded-lg">
                ★ Best for: {b.bestFor}
              </div>

              <ul className="space-y-1.5 mb-4 flex-1">
                {b.features.map((f) => (
                  <li key={f} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-gray-400 text-[10px]">Delivery</div>
                  <div className={`font-semibold mt-0.5 ${b.equityDelivery === "₹0" ? "text-emerald-600" : "text-gray-800"}`}>{b.equityDelivery}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-gray-400 text-[10px]">Intraday</div>
                  <div className="font-semibold text-gray-800 mt-0.5">{b.equityIntraday}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-gray-400 text-[10px]">F&amp;O</div>
                  <div className="font-semibold text-gray-800 mt-0.5">{b.fno}</div>
                </div>
              </div>

              <a href={b.ctaUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary w-full inline-flex items-center justify-center gap-1.5 text-sm">
                Open {b.name} account <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Disclosure:</strong> IPOpulse may earn affiliate commission if you open an account via links above — at no extra cost to you.
          All fees are as published by brokers as of May 2026 and subject to change. Verify current fees on the broker&apos;s website before opening.
          All listed brokers are SEBI-registered stock brokers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/compare/credit-cards" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">Credit Cards →</div>
          <div className="text-xs text-gray-500 mt-0.5">Best cards for rewards and cashback</div>
        </Link>
        <Link href="/learn/what-is-demat-account" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">Demat Account Guide →</div>
          <div className="text-xs text-gray-500 mt-0.5">CDSL vs NSDL, charges, what to hold</div>
        </Link>
        <Link href="/learn/what-are-futures-options" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">F&amp;O Beginner Guide →</div>
          <div className="text-xs text-gray-500 mt-0.5">Before you start trading derivatives</div>
        </Link>
      </div>
    </div>
  );
}
