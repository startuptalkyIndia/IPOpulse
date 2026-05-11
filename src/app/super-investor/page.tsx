import type { Metadata } from "next";
import Link from "next/link";
import { superInvestors } from "@/lib/super-investors";
import { formatCurrency } from "@/lib/format";
import { Users, TrendingUp, TrendingDown, Plus, ArrowRight, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Super Investor Portfolios India — Ashish Kacholia, Damani, Rekha Jhunjhunwala",
  description:
    "Track India's top individual investors — quarterly portfolios from BSE/NSE filings. See what Ashish Kacholia, Radhakishan Damani, Vijay Kedia, Dolly Khanna and 25+ others are buying and selling.",
  alternates: { canonical: "/super-investor" },
};

// Aggregate all "new" and "added" positions across all investors
const newBuys = superInvestors
  .flatMap((inv) =>
    inv.holdings
      .filter((h) => h.qoqChange === "new")
      .map((h) => ({ investor: inv.shortName, investorSlug: inv.slug, ...h }))
  )
  .slice(0, 12);

const additions = superInvestors
  .flatMap((inv) =>
    inv.holdings
      .filter((h) => h.qoqChange === "added")
      .map((h) => ({ investor: inv.shortName, investorSlug: inv.slug, ...h }))
  )
  .slice(0, 12);

const reductions = superInvestors
  .flatMap((inv) =>
    inv.holdings
      .filter((h) => h.qoqChange === "reduced" || h.qoqChange === "exited")
      .map((h) => ({ investor: inv.shortName, investorSlug: inv.slug, ...h }))
  )
  .slice(0, 8);

// Companies bought by multiple investors (conviction buys)
const companyCounts = new Map<string, { count: number; investors: string[] }>();
superInvestors.forEach((inv) => {
  inv.holdings.forEach((h) => {
    const key = h.company;
    const existing = companyCounts.get(key) ?? { count: 0, investors: [] };
    existing.count++;
    existing.investors.push(inv.shortName);
    companyCounts.set(key, existing);
  });
});
const multiInvestorStocks = [...companyCounts.entries()]
  .filter(([, v]) => v.count >= 2)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 8);

const sorted = [...superInvestors].sort((a, b) => b.approxPortfolioCr - a.approxPortfolioCr);

export default function SuperInvestorHub() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <Users className="w-3.5 h-3.5" />
          {superInvestors.length} investors tracked · Dec 2025 BSE/NSE filings
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Super Investor Portfolios</h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          India's most-followed individual investors — full quarterly portfolios from BSE/NSE shareholding filings
          (holdings &gt;1% of a company). Updated every quarter when new filings are published.
        </p>
      </div>

      {/* Smart Money Activity */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Smart Money Activity — Dec 2025 Quarter</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* New Buys */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              New Positions
              <span className="text-[10px] text-gray-400 font-normal ml-auto">{newBuys.length} buys</span>
            </h3>
            <div className="space-y-2">
              {newBuys.map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">{h.company}</div>
                    <Link href={`/super-investor/${h.investorSlug}`} className="text-[10px] text-indigo-600 hover:underline">{h.investor}</Link>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-gray-800 tabular-nums">₹{h.valueCr.toLocaleString("en-IN")} Cr</div>
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">
                      <Plus className="w-2.5 h-2.5" /> New
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Added positions */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Increased Bets
              <span className="text-[10px] text-gray-400 font-normal ml-auto">{additions.length} additions</span>
            </h3>
            <div className="space-y-2">
              {additions.map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">{h.company}</div>
                    <Link href={`/super-investor/${h.investorSlug}`} className="text-[10px] text-indigo-600 hover:underline">{h.investor}</Link>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-gray-800 tabular-nums">₹{h.valueCr.toLocaleString("en-IN")} Cr</div>
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                      <TrendingUp className="w-2.5 h-2.5" /> Added
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reductions/Exits */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Reduced / Exited
              <span className="text-[10px] text-gray-400 font-normal ml-auto">{reductions.length} moves</span>
            </h3>
            <div className="space-y-2">
              {reductions.map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">{h.company}</div>
                    <Link href={`/super-investor/${h.investorSlug}`} className="text-[10px] text-indigo-600 hover:underline">{h.investor}</Link>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-gray-800 tabular-nums">₹{h.valueCr.toLocaleString("en-IN")} Cr</div>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${h.qoqChange === "exited" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      <TrendingDown className="w-2.5 h-2.5" /> {h.qoqChange === "exited" ? "Exited" : "Reduced"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Multi-investor conviction buys */}
      {multiInvestorStocks.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Held by Multiple Super Investors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {multiInvestorStocks.map(([company, data]) => (
              <div key={company} className="card bg-amber-50 border-amber-100">
                <div className="text-sm font-semibold text-gray-900 mb-1">{company}</div>
                <div className="text-[11px] text-amber-700 font-semibold mb-1">{data.count} investors holding</div>
                <div className="text-[10px] text-gray-500 leading-relaxed">{data.investors.join(", ")}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Investor grid */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">All {superInvestors.length} Tracked Investors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((inv) => {
            const newCount = inv.holdings.filter(h => h.qoqChange === "new").length;
            const addedCount = inv.holdings.filter(h => h.qoqChange === "added").length;
            const reducedCount = inv.holdings.filter(h => h.qoqChange === "reduced" || h.qoqChange === "exited").length;
            return (
              <Link
                key={inv.slug}
                href={`/super-investor/${inv.slug}`}
                className="card hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition">{inv.name}</h3>
                      <span className="text-xs text-indigo-600 font-medium tabular-nums flex-shrink-0">
                        ~{formatCurrency(inv.approxPortfolioCr * 10000000)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{inv.bio}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-gray-400">{inv.holdings.length} holdings</span>
                      {newCount > 0 && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">
                          +{newCount} new
                        </span>
                      )}
                      {addedCount > 0 && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                          ↑{addedCount} added
                        </span>
                      )}
                      {reducedCount > 0 && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                          ↓{reducedCount} reduced
                        </span>
                      )}
                      <span className="text-[10px] text-indigo-600 ml-auto inline-flex items-center gap-0.5">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Data note */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Data source:</strong> BSE/NSE quarterly shareholding pattern disclosures (December 2025 quarter).
          SEBI mandates disclosure when an individual investor holds &gt;1% of a listed company&apos;s paid-up equity.
          Portfolio values are approximate and computed from disclosed % × company market cap at the time of filing.
          This is not investment advice.
        </p>
      </div>

    </div>
  );
}
