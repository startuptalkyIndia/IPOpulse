import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Twitter, Calendar, TrendingUp } from "lucide-react";
import { NewsClient } from "./NewsClient";

export const metadata: Metadata = {
  title: "Finance & IPO News India — Markets, FII, Deals, Policy | IPOpulse",
  description:
    "Latest Indian stock market news — IPO news, FII/DII flows, bulk deals, SEBI/RBI policy, quarterly results. Aggregated from top financial media. Updated every 15 minutes.",
  alternates: { canonical: "/news" },
};

const quickLinks = [
  { href: "/news/twitter", label: "Financial Twitter India", icon: Twitter, desc: "Top investors & analysts to follow" },
  { href: "/market/economic-calendar", label: "Economic Calendar", icon: Calendar, desc: "RBI, FOMC, GDP, CPI dates" },
  { href: "/fii-dii", label: "FII/DII Live Data", icon: TrendingUp, desc: "Daily institutional flows" },
];

export default function NewsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <Newspaper className="w-3.5 h-3.5" />
          Finance · IPO · FII · Deals · Policy · Results
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Indian Market News
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Aggregated from Google News — latest coverage across Indian equity markets, IPOs, institutional flows, deals, and regulatory news. Updated every 15 minutes.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {quickLinks.map((ql) => {
          const Icon = ql.icon;
          return (
            <Link
              key={ql.href}
              href={ql.href}
              className="card flex items-center gap-3 hover:border-indigo-300 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-900 group-hover:text-indigo-700 transition">{ql.label} →</div>
                <div className="text-[11px] text-gray-500">{ql.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* News feed */}
      <NewsClient />
    </div>
  );
}
