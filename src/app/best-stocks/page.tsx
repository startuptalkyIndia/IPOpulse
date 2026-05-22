import type { Metadata } from "next";
import Link from "next/link";
import { Coins, AlertTriangle, Building2, TrendingUp, Sparkles, Award, Scale, Crown } from "lucide-react";
import { bestStocksCategories } from "@/lib/best-stocks-categories";

export const metadata: Metadata = {
  title: "Best Stocks India 2026 — Curated Lists by Price, Market Cap, ROE | IPOpulse",
  description:
    "Discover the best stocks in India 2026 — under ₹100, under ₹50, penny stocks, large cap, mid cap, small cap, high ROE, low P/E, blue chip. Curated lists from NSE/BSE bhavcopy.",
  alternates: { canonical: "/best-stocks" },
};

const ICON_MAP: Record<string, React.ElementType> = {
  Coins, AlertTriangle, Building2, TrendingUp, Sparkles, Award, Scale, Crown,
};

export default function BestStocksHubPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <TrendingUp className="w-3.5 h-3.5" />
          {bestStocksCategories.length} curated stock lists · Updated daily
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Best Stocks in India 2026 — Curated Lists
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          Browse Indian stocks filtered by price range, market cap category, and fundamental quality.
          Every list is generated live from NSE/BSE bhavcopy data — no opinions, just filters applied
          to real numbers. Use these as a starting point for research, never as direct buy recommendations.
        </p>
      </div>

      {/* By Price */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
          By Price Range
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestStocksCategories.filter((c) => ["under-50", "under-100", "under-500", "penny-stocks"].includes(c.slug)).map((c) => {
            const Icon = ICON_MAP[c.icon] ?? Coins;
            return (
              <Link key={c.slug} href={`/best-stocks/${c.slug}`} className="card hover:border-indigo-300 hover:shadow-sm transition group">
                <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition">
                  {c.shortLabel} {c.slug === "penny-stocks" && "⚠️"}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{c.description}</p>
                <div className="mt-3 text-xs font-medium text-indigo-600">View list →</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* By Market Cap */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
          By Market Cap Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestStocksCategories.filter((c) => ["large-cap", "mid-cap", "small-cap", "blue-chip"].includes(c.slug)).map((c) => {
            const Icon = ICON_MAP[c.icon] ?? Coins;
            return (
              <Link key={c.slug} href={`/best-stocks/${c.slug}`} className="card hover:border-indigo-300 hover:shadow-sm transition group">
                <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition">{c.shortLabel}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{c.description}</p>
                <div className="mt-3 text-xs font-medium text-indigo-600">View list →</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* By Quality */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-emerald-500 rounded-full inline-block" />
          By Fundamental Quality
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bestStocksCategories.filter((c) => ["high-roe", "low-pe"].includes(c.slug)).map((c) => {
            const Icon = ICON_MAP[c.icon] ?? Coins;
            return (
              <Link key={c.slug} href={`/best-stocks/${c.slug}`} className="card hover:border-indigo-300 hover:shadow-sm transition group">
                <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition">{c.shortLabel}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{c.description}</p>
                <div className="mt-3 text-xs font-medium text-indigo-600">View list →</div>
              </Link>
            );
          })}
          <Link href="/dividend-yield" className="card hover:border-indigo-300 hover:shadow-sm transition group">
            <div className="w-10 h-10 rounded-lg text-emerald-600 bg-emerald-50 flex items-center justify-center mb-3">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition">High Dividend</h3>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">Top dividend-yielding stocks — PSUs, MNCs, blue chips with consistent payouts.</p>
            <div className="mt-3 text-xs font-medium text-indigo-600">View list →</div>
          </Link>
        </div>
      </section>

      {/* By Strategy */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-violet-500 rounded-full inline-block" />
          By Strategy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestStocksCategories.filter((c) => ["high-dividend", "low-pb", "multibagger-watchlist", "psu-stocks"].includes(c.slug)).map((c) => {
            const Icon = ICON_MAP[c.icon] ?? Coins;
            return (
              <Link key={c.slug} href={`/best-stocks/${c.slug}`} className="card hover:border-indigo-300 hover:shadow-sm transition group">
                <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition">{c.shortLabel}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{c.description}</p>
                <div className="mt-3 text-xs font-medium text-indigo-600">View list →</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="card bg-amber-50 border-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Important:</strong> These lists are filters applied to real bhavcopy + fundamentals data —
            NOT investment recommendations. Past performance doesn&apos;t predict future returns. Always do your
            own research, consider your risk profile, and consult a SEBI-registered advisor before investing.
            Stock prices can fall sharply, especially small-caps and penny stocks.
          </p>
        </div>
      </div>
    </div>
  );
}
