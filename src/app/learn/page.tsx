import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  CheckCircle2,
  GitCompare,
  FileText,
  BadgePlus,
  BarChart2,
  Layers,
  LineChart,
  Scale,
  Activity,
  Target,
  BookOpen,
  Eye,
  Users,
  Percent,
  Wallet,
  PieChart,
  Building2,
  ArrowUpDown,
  Calculator,
  Globe,
  Award,
  TrendingDown,
  Landmark,
  BarChart,
  Calendar,
  Coins,
  Shield,
} from "lucide-react";
import { articles } from "@/lib/learn-articles";

export const metadata: Metadata = {
  title: "IPO & Stock Market Learning Hub — Guides for Indian Investors",
  description:
    "Free educational guides on IPO GMP, allotment status, DRHP, ASBA/UPI application, FII/DII flows, P/E ratio, demat account, mutual funds and more — written for Indian retail investors.",
  alternates: { canonical: "/learn" },
};

const iconMap: Record<string, React.ElementType> = {
  "ipo-gmp": TrendingUp,
  "ipo-allotment": CheckCircle2,
  "mainboard-vs-sme": GitCompare,
  "drhp-guide": FileText,
  "how-to-apply-ipo": BadgePlus,
  "fii-dii-guide": BarChart2,
  "bulk-block-deals": Layers,
  "sip-guide": LineChart,
  "pe-ratio": Scale,
  "52-week-high-low": Activity,
  "what-is-allotment-probability": Target,
  "nifty-50-explained": BookOpen,
  "how-gmp-predicts-listing": Eye,
  "ipo-anchor-investors": Users,
  "understanding-ipo-subscription": Percent,
  "what-is-demat-account": Wallet,
  "what-is-market-cap": PieChart,
  "what-is-dividend": Award,
  "cagr-meaning": Calculator,
  "what-is-mutual-fund": Globe,
  "rights-issue-bonus-share": Building2,
  "how-to-read-annual-report": FileText,
  "what-are-futures-options": ArrowUpDown,
  "what-is-roe-roce": Scale,
  "what-is-sensex": BarChart,
  "what-is-stop-loss": TrendingDown,
  "what-is-ebitda": BarChart2,
  "what-is-book-value": Landmark,
  "what-is-nps": Shield,
  "what-is-index-fund": Globe,
  "debt-to-equity-ratio": Scale,
  "how-to-invest-in-gold": Coins,
  "market-holidays-2026": Calendar,
  "what-is-cibil-score": Shield,
  "what-is-swp": ArrowUpDown,
  "how-to-file-itr-capital-gains": FileText,
  "what-is-nfo": BadgePlus,
  "what-is-arbitrage-fund": BarChart2,
  "elss-vs-ppf-vs-nps": Scale,
  "what-is-t-bill": Landmark,
  "what-is-contra-fund": TrendingDown,
  "how-to-read-quarterly-results": BarChart,
  "what-is-international-mutual-fund": Globe,
};

const categoryMap: Record<string, string[]> = {
  "IPO Basics": [
    "ipo-gmp",
    "ipo-allotment",
    "mainboard-vs-sme",
    "drhp-guide",
    "how-to-apply-ipo",
    "ipo-anchor-investors",
    "understanding-ipo-subscription",
    "what-is-allotment-probability",
    "how-gmp-predicts-listing",
  ],
  "Markets & Data": [
    "fii-dii-guide",
    "bulk-block-deals",
    "nifty-50-explained",
    "what-is-sensex",
    "52-week-high-low",
    "what-is-stop-loss",
    "what-is-circuit-limit",
    "how-to-read-candlestick-charts",
    "market-holidays-2026",
  ],
  "Investing Fundamentals": [
    "how-to-invest-in-stocks-beginners",
    "pe-ratio",
    "what-is-eps",
    "what-is-ebitda",
    "what-is-book-value",
    "debt-to-equity-ratio",
    "what-is-portfolio-diversification",
    "sip-guide",
    "what-is-demat-account",
    "what-is-market-cap",
    "what-is-dividend",
    "cagr-meaning",
    "what-is-mutual-fund",
    "what-is-index-fund",
    "what-is-smallcase",
    "rights-issue-bonus-share",
    "what-is-pledging-shares",
    "how-to-read-annual-report",
    "what-are-futures-options",
    "what-is-roe-roce",
    "what-is-nps",
    "what-is-reit",
    "how-to-invest-in-gold",
    "what-is-sebi",
    "what-is-cibil-score",
    "what-is-swp",
    "how-to-file-itr-capital-gains",
    "what-is-nfo",
    "what-is-arbitrage-fund",
    "elss-vs-ppf-vs-nps",
    "what-is-t-bill",
    "what-is-contra-fund",
    "how-to-read-quarterly-results",
    "what-is-international-mutual-fund",
  ],
};

export default function LearnHubPage() {
  const articleMap = new Map(articles.map((a) => [a.slug, a]));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <FileText className="w-3.5 h-3.5" />
          Free guides for retail investors · {articles.length} articles
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          IPO &amp; Stock Market Learning Hub
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          Factual, India-specific guides on IPOs, market mechanics, and investment concepts. No
          fluff — written for retail investors who want to understand the numbers before putting
          money to work.
        </p>
      </div>

      {/* Categories */}
      {Object.entries(categoryMap).map(([category, slugs]) => {
        const categoryArticles = slugs
          .map((slug) => articleMap.get(slug))
          .filter(Boolean) as (typeof articles)[number][];

        return (
          <section key={category} className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-600 rounded-full inline-block" />
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryArticles.map((article) => {
                const Icon = iconMap[article.slug] ?? BookOpen;
                return (
                  <Link
                    key={article.slug}
                    href={`/learn/${article.slug}`}
                    className="card hover:border-indigo-300 hover:shadow-sm transition group flex flex-col"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition leading-snug">
                          {article.title}
                        </h3>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">
                          {article.readingTime} min read
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed flex-1">
                      {article.description}
                    </p>
                    <div className="mt-4 text-xs font-medium text-indigo-600 group-hover:text-indigo-800">
                      Read article →
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Glossary CTA */}
      <div className="mb-8 rounded-xl bg-violet-50 border border-violet-100 px-6 py-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <h2 className="text-base font-bold text-gray-900 mb-1">📖 Financial Glossary</h2>
          <p className="text-sm text-gray-600">
            A–Z definitions of 80+ stock market terms used on IPOpulse — from ASBA to XIRR.
          </p>
        </div>
        <Link
          href="/glossary"
          className="shrink-0 bg-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-violet-700 transition"
        >
          Browse Glossary →
        </Link>
      </div>

      {/* Footer CTA */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-6 py-8 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Track Every IPO in Real Time</h2>
        <p className="text-sm text-gray-600 mb-4">
          Live GMP, subscription data, allotment probability, DRHP AI search, and more — all free.
        </p>
        <Link
          href="/ipo"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition"
        >
          <TrendingUp className="w-4 h-4" />
          View IPO Dashboard
        </Link>
      </div>
    </div>
  );
}
