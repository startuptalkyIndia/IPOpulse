export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ArrowUpDown } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Indian ADR / US Listing Tracker — NSE vs NYSE price premium/discount",
  description:
    "Live comparison of Indian companies cross-listed on US exchanges. See the ADR price in ₹ vs NSE price, premium or discount, and 52-week range. Updated daily.",
  alternates: { canonical: "/us-listing" },
};

export default async function UsListingPage() {
  const adrs = await prisma.usAdrlisting.findMany({
    where: { active: true },
    orderBy: [{ sector: "asc" }, { companyName: "asc" }],
  });

  const usdInr = adrs.find((a) => a.usdInrRate != null)?.usdInrRate ?? null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Indian Companies on US Exchanges
        </h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Indian companies cross-listed as ADRs / ordinary shares on NYSE or NASDAQ. Shows the
          equivalent NSE price vs the US ADR price to surface any premium or discount. Updated daily
          after market close.
        </p>
        {usdInr ? (
          <p className="text-xs text-gray-500 mt-1">USD/INR: {Number(usdInr).toFixed(2)}</p>
        ) : null}
      </div>

      {adrs.length === 0 ? (
        <div className="card text-center py-10 text-sm text-gray-500">
          Indian ADR price data is updated daily. If prices are not visible, they will appear after the next market session.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase text-left">
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Sector</th>
                  <th className="px-3 py-3 text-right">NSE price</th>
                  <th className="px-3 py-3 text-right">ADR (USD)</th>
                  <th className="px-3 py-3 text-right">ADR (₹ equiv)</th>
                  <th className="px-3 py-3 text-right">
                    <span className="inline-flex items-center gap-1">
                      Premium/Discount <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-3 py-3">Exchange</th>
                  <th className="px-3 py-3">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {adrs.map((a) => {
                  const adrUsd = a.adrPriceUsd ? Number(a.adrPriceUsd) : null;
                  const rate = a.usdInrRate ? Number(a.usdInrRate) : (usdInr ? Number(usdInr) : 84);
                  const adrInr = adrUsd ? adrUsd * rate : null;
                  const prem = a.premiumPct ? Number(a.premiumPct) : null;
                  const premColor = prem == null ? "text-gray-400" : prem > 2 ? "text-green-600" : prem < -2 ? "text-red-600" : "text-gray-700";

                  return (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm">
                        <div className="font-semibold text-gray-900">{a.companyName}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          {a.nseSymbol ? <span className="mr-2">{a.nseSymbol}</span> : null}
                          {a.adrSymbol}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">{a.sector ?? "—"}</td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-900">
                        {a.nsePrice ? `₹${Number(a.nsePrice).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-900">
                        {adrUsd ? `$${adrUsd.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">
                        {adrInr ? `₹${adrInr.toFixed(2)}` : "—"}
                      </td>
                      <td className={`px-3 py-3 text-sm text-right tabular-nums font-semibold ${premColor}`}>
                        {prem == null ? "—" : `${prem >= 0 ? "+" : ""}${prem.toFixed(1)}%`}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">{a.exchange ?? "—"}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{a.ratio ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Understanding ADR premium/discount</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900">Why do ADR prices differ from NSE?</h3>
            <p className="text-gray-600 mt-1">ADRs trade on US exchanges during US market hours. Price differences arise from: timing (US closes after India), currency movements intraday, supply-demand on each exchange, and the ADR ratio (e.g. 1 HDFC Bank ADR = 3 NSE shares). The spread typically closes by next-day open.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Arbitrage opportunity?</h3>
            <p className="text-gray-600 mt-1">In theory yes — buy cheap, sell expensive. In practice, the LRS/TCS friction (₹7L threshold, 20% TCS on remittances), 1-2 day settlement cycles, and brokerage on both sides make small spreads uneconomical for retail investors. Institutional arbitrageurs (hedge funds with FEMA registration) close large spreads quickly.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Which way to hold?</h3>
            <p className="text-gray-600 mt-1">NSE is simpler (no LRS friction, rupee settlement) but misses US market hours. ADR gives USD denomination (INR depreciation tailwind) but adds compliance. For long-term holds of Indian blue-chips, NSE wins on simplicity. For dividend investors, check withholding tax: US brokers deduct 25% TDS on ADR dividends (vs 0 in India for equities).</p>
          </div>
        </div>
      </section>

      <p className="text-[11px] text-gray-400">
        ADR prices from Yahoo Finance delayed ~15 min. NSE prices from BSE/NSE EOD bhavcopy. Premium/discount uses closing prices from the most recent trading session. Not investment advice.
      </p>
    </div>
  );
}
