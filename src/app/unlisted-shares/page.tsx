import type { Metadata } from "next";
import Link from "next/link";
import { Coins, ArrowRight, Activity } from "lucide-react";
import { unlistedShares, computeIndex } from "@/lib/unlisted-shares";

export const metadata: Metadata = {
  title: "Pre-IPO / Unlisted Shares India — multi-dealer median price index",
  description:
    "Median-of-dealers price index for India's most-traded unlisted shares. NSE, Reliance Retail, Reliance Jio, Tata Capital, Swiggy and more — with bid/ask spread and dealer-range transparency.",
  alternates: { canonical: "/unlisted-shares" },
};

const statusLabel: Record<string, { label: string; cls: string }> = {
  drhp_filed: { label: "DRHP Filed", cls: "bg-green-100 text-green-800" },
  rumored: { label: "IPO Rumored", cls: "bg-yellow-100 text-yellow-800" },
  private: { label: "Stays Private", cls: "bg-gray-100 text-gray-700" },
  demerger: { label: "Demerger Expected", cls: "bg-purple-100 text-purple-800" },
};

const liqLabel: Record<string, { label: string; cls: string }> = {
  high: { label: "Liquid", cls: "text-green-600" },
  medium: { label: "Moderate", cls: "text-yellow-600" },
  low: { label: "Thin", cls: "text-red-600" },
};

export default function UnlistedSharesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Pre-IPO / Unlisted Shares</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          We aggregate quotes from <strong>multiple grey-market dealers</strong> (UnlistedZone, Stockify, InCred Money,
          Sharescart) and publish a fair-price <strong>median index</strong> — so you see the bid-ask spread and the
          range, not just one dealer&apos;s number.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unlistedShares.map((u) => {
          const s = statusLabel[u.ipoStatus];
          const liq = liqLabel[u.liquidity];
          const idx = computeIndex(u.quotes);
          return (
            <Link
              key={u.slug}
              href={`/unlisted-shares/${u.slug}`}
              className="card hover:border-indigo-300 hover:shadow-sm transition group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-gray-900">{u.name}</h2>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {u.sector} · FV ₹{u.faceValue} · <span className={liq.cls}>{liq.label}</span>
                  </div>
                </div>
              </div>

              {idx ? (
                <div className="bg-indigo-50 rounded-lg p-3 mb-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Median price
                    </span>
                    <span className="text-2xl font-bold text-indigo-700 tabular-nums">₹{idx.median.toFixed(0)}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex justify-between">
                    <span>Range: ₹{idx.rangeLow}–₹{idx.rangeHigh}</span>
                    <span>{u.quotes.length} dealer{u.quotes.length === 1 ? "" : "s"}</span>
                  </div>
                </div>
              ) : null}

              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{u.description}</p>
              <div className="flex items-center justify-between">
                <span className={`badge ${s.cls}`}>{s.label}</span>
                {u.expectedIpoYear ? <span className="text-[11px] text-gray-500">Expected: {u.expectedIpoYear}</span> : null}
              </div>
              <div className="mt-2 text-xs font-medium text-indigo-600 group-hover:text-indigo-800 flex items-center gap-0.5">
                Dealer breakdown <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <span className="font-semibold">Disclaimer:</span> Unlisted shares are illiquid and trade through informal
          dealer networks. Spread between dealers can be 5-15%. Settlement is T+5 to T+10, and there&apos;s no
          regulator overseeing the market. Treat all prices as indicative. Always verify with multiple dealers before transacting.
        </p>
      </div>
    </div>
  );
}
