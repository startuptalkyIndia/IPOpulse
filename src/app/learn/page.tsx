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
} from "lucide-react";

export const metadata: Metadata = {
  title: "IPO & Stock Market Learning Hub — Guides for Indian Investors",
  description:
    "Free educational guides on IPO GMP, allotment status, DRHP, ASBA/UPI application, FII/DII flows, P/E ratio, and more — written for Indian retail investors.",
  alternates: { canonical: "/learn" },
};

interface ArticleCard {
  title: string;
  description: string;
  icon: React.ElementType;
  readingTime: number;
  href: string;
}

const articleCards: ArticleCard[] = [
  {
    title: "What is IPO GMP (Grey Market Premium)?",
    description:
      "Understand how grey market premiums work, how GMP is calculated, and whether you should trust it before applying for an IPO.",
    icon: TrendingUp,
    readingTime: 5,
    href: "/learn/ipo-gmp",
  },
  {
    title: "How to Check IPO Allotment Status",
    description:
      "Step-by-step guide to checking allotment on BSE, KFintech, Linkintime, and through your broker app using your PAN.",
    icon: CheckCircle2,
    readingTime: 4,
    href: "/learn/ipo-allotment",
  },
  {
    title: "Mainboard vs SME IPO — Key Differences",
    description:
      "Compare mainboard and SME IPOs — eligibility, lot size, exchange, risk profile, and subscription rules.",
    icon: GitCompare,
    readingTime: 5,
    href: "/learn/mainboard-vs-sme",
  },
  {
    title: "What is DRHP and How to Read It",
    description:
      "A practical guide to reading DRHP documents — key sections, financial red flags, and what to look for before applying.",
    icon: FileText,
    readingTime: 6,
    href: "/learn/drhp-guide",
  },
  {
    title: "How to Apply for IPO (ASBA / UPI)",
    description:
      "Complete step-by-step guide to applying via ASBA through your bank or UPI through Zerodha, Groww, or Upstox.",
    icon: BadgePlus,
    readingTime: 5,
    href: "/learn/how-to-apply-ipo",
  },
  {
    title: "FII vs DII — What Institutional Flow Means for Markets",
    description:
      "Learn what FII and DII buying and selling signals mean for Indian markets, sectors, and individual stocks.",
    icon: BarChart2,
    readingTime: 5,
    href: "/learn/fii-dii-guide",
  },
  {
    title: "What is Bulk Deal vs Block Deal",
    description:
      "Understand the difference between bulk and block deals, who participates, and what large institutional trades signal.",
    icon: Layers,
    readingTime: 4,
    href: "/learn/bulk-block-deals",
  },
  {
    title: "SIP Calculator Guide — How SIP Returns Work",
    description:
      "How SIP returns, XIRR, rupee-cost averaging, and step-up SIPs work — with practical examples for Indian investors.",
    icon: LineChart,
    readingTime: 5,
    href: "/learn/sip-guide",
  },
  {
    title: "Understanding P/E Ratio for Indian Stocks",
    description:
      "What the Price-to-Earnings ratio means, sector benchmarks for India, and its limitations as a valuation tool.",
    icon: Scale,
    readingTime: 5,
    href: "/learn/pe-ratio",
  },
  {
    title: "52-Week High/Low — Trading Strategy",
    description:
      "Why 52-week highs and lows are key psychological levels, and how traders use them as entry and exit signals.",
    icon: Activity,
    readingTime: 4,
    href: "/learn/52-week-high-low",
  },
];

export default function LearnHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <FileText className="w-3.5 h-3.5" />
          Free guides for retail investors
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

      {/* Article grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articleCards.map((article) => {
          const Icon = article.icon;
          return (
            <Link
              key={article.href}
              href={article.href}
              className="card hover:border-indigo-300 hover:shadow-sm transition group flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition leading-snug">
                    {article.title}
                  </h2>
                  <span className="text-[11px] text-gray-400 mt-0.5 block">
                    {article.readingTime} min read
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{article.description}</p>
              <div className="mt-4 text-xs font-medium text-indigo-600 group-hover:text-indigo-800">
                Read article →
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 rounded-xl bg-indigo-50 border border-indigo-100 px-6 py-8 text-center">
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
