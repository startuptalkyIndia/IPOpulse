import type { Metadata } from "next";
import Link from "next/link";
import { superInvestors } from "@/lib/super-investors";
import { formatCurrency } from "@/lib/format";
import { Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Super Investor Portfolios — Rekha Jhunjhunwala, Damani, Kacholia & more",
  description:
    "Track India's top individual investors — quarterly portfolios, stock-wise holdings, buys & sells. Free email alerts on their moves.",
};

export default function SuperInvestorHub() {
  const sorted = [...superInvestors].sort((a, b) => b.approxPortfolioCr - a.approxPortfolioCr);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Super Investor Portfolios</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          India's most-followed individual investors — with their full quarterly shareholding portfolios. Built from
          BSE/NSE filings where each investor holds &gt;1% of a company. Free alerts on buys, sells, and new entries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((inv) => (
          <Link
            key={inv.slug}
            href={`/super-investor/${inv.slug}`}
            className="card hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-sm font-semibold text-gray-900">{inv.name}</h2>
                  <span className="text-xs text-indigo-600 font-medium tabular-nums flex-shrink-0">
                    ~{formatCurrency(inv.approxPortfolioCr * 10000000)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-3">{inv.bio}</p>
                <div className="text-[11px] text-gray-400 mt-2">
                  {inv.holdings.length} tracked holdings · {inv.asOf} · {" "}
                  <span className="text-indigo-600 inline-flex items-center gap-0.5">
                    View portfolio <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card bg-indigo-50 border-indigo-100">
        <h3 className="text-sm font-semibold text-indigo-900 mb-1">Coming soon: free email alerts</h3>
        <p className="text-xs text-indigo-800">
          Get notified within hours when any tracked super-investor adds a new stock or exits an existing position.
          No paywall. Subscribe from individual portfolio pages once alerts ship next week.
        </p>
      </div>
    </div>
  );
}
