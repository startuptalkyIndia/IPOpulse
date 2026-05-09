"use client";

import Link from "next/link";
import { useState } from "react";
import { Info, ShieldCheck, ShieldOff, Filter } from "lucide-react";
import { ncds, getRatingColor } from "@/lib/ncd-data";

const ratingOptions = [
  { value: "all",   label: "All Ratings" },
  { value: "AAA",   label: "AAA" },
  { value: "AA+",   label: "AA+" },
  { value: "AA",    label: "AA" },
  { value: "below", label: "Below AA" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NCDClient() {
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const filtered = ncds.filter((n) => {
    if (ratingFilter === "all") return true;
    if (ratingFilter === "below") return !["AAA", "AA+", "AA"].includes(n.rating);
    return n.rating === ratingFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Fixed Income
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Non-Convertible Debentures (NCDs)
        </h1>
        <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
          NCDs offer <strong>fixed returns higher than FDs</strong>, with the safety of listed instruments on
          NSE/BSE. Issued by NBFCs, housing finance companies, and corporates — NCDs let you lock in a
          coupon rate for a defined tenure and trade on the exchange if you need liquidity before maturity.
        </p>
      </div>

      {/* NCD vs FD comparison box */}
      <div className="card bg-green-50 border-green-200">
        <h3 className="text-sm font-semibold text-green-900 mb-3">NCD vs Fixed Deposit (FD)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Typical NCD Yield",
              value: "8–10.5%",
              sub: "AAA to AA rated issuers",
              color: "text-green-700",
            },
            {
              label: "SBI FD Rate (5 year)",
              value: "6.80%",
              sub: "For general public (May 2026)",
              color: "text-gray-700",
            },
            {
              label: "Extra Yield from NCDs",
              value: "+1.5 to +3.7%",
              sub: "Risk premium over bank FDs",
              color: "text-indigo-700",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg p-3 text-center">
              <div className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-green-800 space-y-1">
          <p>
            <strong>Tax treatment:</strong> NCD interest is taxable as per your income slab (same as FD). However,
            if you buy NCDs on the secondary market at a discount, the capital gain may be taxed at 12.5% LTCG
            (after 24 months) — more tax-efficient than interest income.
          </p>
        </div>
      </div>

      {/* Risk warning */}
      <div className="card bg-orange-50 border-orange-200 flex gap-3">
        <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-orange-800">
          <strong>Risk warning:</strong> NCD returns depend entirely on the issuer&apos;s ability to repay.
          Unlike bank FDs, NCDs above ₹5 lakh are not covered by DICGC deposit insurance. Credit ratings can
          change — always check the latest rating before investing. Listed NCDs can trade below face value on
          secondary markets.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mr-2">
          <Filter className="w-4 h-4" />
          Filter by rating:
        </div>
        {ratingOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRatingFilter(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              ratingFilter === opt.value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* NCD Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Issuer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 text-right">Coupon</th>
              <th className="px-4 py-3">Frequency</th>
              <th className="px-4 py-3">Tenor</th>
              <th className="px-4 py-3">Secured</th>
              <th className="px-4 py-3">Maturity</th>
              <th className="px-4 py-3">NSE Symbol</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ncd) => {
              const ratingStyle = getRatingColor(ncd.rating);
              return (
                <tr key={ncd.slug} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{ncd.issuer}</div>
                    <div className="text-[11px] text-gray-400">{ncd.sector}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 max-w-xs line-clamp-1">{ncd.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded w-fit ${ratingStyle.bg} ${ratingStyle.text}`}
                      >
                        {ncd.rating}
                      </span>
                      <span className="text-[10px] text-gray-400">{ncd.ratingAgency}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-gray-900 tabular-nums">{ncd.coupon}%</span>
                    <div className="text-[11px] text-gray-400">p.a.</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{ncd.frequency}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{ncd.tenor}</td>
                  <td className="px-4 py-3">
                    {ncd.secured ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Secured</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <ShieldOff className="w-3.5 h-3.5" />
                        <span className="text-xs">Unsecured</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {formatDate(ncd.maturityDate)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">
                    {ncd.nseSymbol ?? "—"}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  No NCDs match this rating filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400">
        Showing {filtered.length} of {ncds.length} NCDs. Data is approximate and for informational purposes only.
        Coupon rates and ratings shown are as of the issue date — check latest rating from CRISIL / ICRA / CARE
        before investing.
      </p>

      {/* How to invest in NCDs */}
      <section className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">How to Invest in NCDs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Primary Market (New Issue)</h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex gap-2"><span className="text-indigo-600 font-bold">1.</span> Watch for NCD public issue announcements (SEBI website, NSE, your broker)</li>
              <li className="flex gap-2"><span className="text-indigo-600 font-bold">2.</span> Apply during the subscription window through your broker or bank ASAP platform</li>
              <li className="flex gap-2"><span className="text-indigo-600 font-bold">3.</span> Minimum investment: ₹10,000 (10 bonds at ₹1,000 face value)</li>
              <li className="flex gap-2"><span className="text-indigo-600 font-bold">4.</span> NCDs are allotted on a first-come-first-served or pro-rata basis</li>
              <li className="flex gap-2"><span className="text-indigo-600 font-bold">5.</span> Listed on NSE/BSE within ~6 business days of issue closing</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Secondary Market (Buy / Sell)</h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex gap-2"><span className="text-indigo-600 font-bold">1.</span> Search for the NCD&apos;s NSE/BSE symbol in your broker terminal</li>
              <li className="flex gap-2"><span className="text-indigo-600 font-bold">2.</span> Place a limit order at your desired price (spreads can be wide — use limit, not market)</li>
              <li className="flex gap-2"><span className="text-indigo-600 font-bold">3.</span> You can buy at a discount if market price is below face value (and vice versa)</li>
              <li className="flex gap-2"><span className="text-indigo-600 font-bold">4.</span> Settlement is T+1. NCD lands in your demat account next day.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Rating guide */}
      <section className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Understanding NCD Credit Ratings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { rating: "AAA",       desc: "Highest safety. Extremely low risk of default.", bg: "bg-green-50", badge: "bg-green-100 text-green-700", text: "text-green-800" },
            { rating: "AA+",       desc: "Very high safety. Very low default risk.", bg: "bg-teal-50", badge: "bg-teal-100 text-teal-700", text: "text-teal-800" },
            { rating: "AA",        desc: "High safety. Low but non-negligible default risk.", bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-800", text: "text-yellow-800" },
            { rating: "A & below", desc: "Moderate-to-speculative. Higher yield, higher risk.", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-700", text: "text-orange-800" },
          ].map((r) => (
            <div key={r.rating} className={`rounded-lg p-3 ${r.bg}`}>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.badge}`}>{r.rating}</span>
              <p className={`text-[11px] mt-2 ${r.text}`}>{r.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          Ratings are assigned by SEBI-registered credit rating agencies: CRISIL (S&P), ICRA (Moody&apos;s), CARE, India Ratings (Fitch).
          A rating downgrade can cause the NCD&apos;s market price to fall significantly.
        </p>
      </section>

      {/* Disclaimer */}
      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <strong>Disclaimer:</strong> Coupon rates, ratings, and maturity dates shown are approximate and
          based on publicly available data at time of issue. Always verify current ratings from CRISIL/ICRA/CARE
          before investing. NCDs are subject to credit risk, interest rate risk, and liquidity risk. This page
          is for informational purposes only and not investment advice. Consult a SEBI-registered investment
          advisor for personalized guidance.
        </p>
      </div>
    </div>
  );
}
