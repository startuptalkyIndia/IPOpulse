import type { Metadata } from "next";
import Link from "next/link";
import { Info, TrendingUp, Percent, ShieldCheck } from "lucide-react";
import {
  sgbSeries,
  totalReturnPercent,
  currentGoldValue,
  CURRENT_GOLD_PRICE_PER_GRAM,
  SGB_COUPON_RATE,
} from "@/lib/sgb-data";

export const metadata: Metadata = {
  title: "Sovereign Gold Bond SGB 2026 — List of All SGB Series, Maturity Dates, Returns",
  description:
    "Complete list of all Sovereign Gold Bond (SGB) series with maturity dates, issue prices, current gold value, total returns, and days to maturity. Issued by RBI, tax-free at maturity.",
  alternates: { canonical: "/sgb" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SGBPage() {
  const activeSeries = [...sgbSeries].sort(
    (a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Gold Bonds
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Sovereign Gold Bond (SGB) Tracker
        </h1>
        <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
          Sovereign Gold Bonds are RBI-issued bonds denominated in grams of gold, paying{" "}
          <strong>{SGB_COUPON_RATE}% annual interest</strong> on the issue price + gold price appreciation.{" "}
          <strong>Capital gains at maturity are completely tax-free.</strong> SGBs trade on NSE/BSE
          secondary market before maturity.
        </p>
      </div>

      {/* Key stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center py-5">
          <div className="flex justify-center text-yellow-500 mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-gray-900 tabular-nums">
            ₹{CURRENT_GOLD_PRICE_PER_GRAM.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Current Gold Price (per gram)</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Approx. as of May 2026</div>
        </div>
        <div className="card text-center py-5">
          <div className="flex justify-center text-green-500 mb-2">
            <Percent className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-green-700">{SGB_COUPON_RATE}% p.a.</div>
          <div className="text-xs text-gray-500 mt-0.5">Annual Coupon (all series)</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Paid semi-annually on issue price</div>
        </div>
        <div className="card text-center py-5">
          <div className="flex justify-center text-indigo-500 mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">0%</div>
          <div className="text-xs text-gray-500 mt-0.5">Capital Gains Tax at Maturity</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Fully exempt if held to maturity</div>
        </div>
      </div>

      {/* Gov notice */}
      <div className="card bg-amber-50 border-amber-200 flex gap-3">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <strong>Fresh issuance paused:</strong> The Government of India paused fresh SGB issuance in
          2024-25 (Budget 2024-25 did not announce new tranches). Existing SGBs continue to trade on
          NSE/BSE secondary market. You can buy them through your broker like any listed bond.{" "}
          <Link href="/learn/how-to-invest-in-gold" className="underline font-medium">
            Learn how to invest in gold →
          </Link>
        </p>
      </div>

      {/* SGB Table */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">All SGB Series — Secondary Market</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Series</th>
                <th className="px-4 py-3">NSE Symbol</th>
                <th className="px-4 py-3 text-right">Issue Price</th>
                <th className="px-4 py-3 text-right">Current Gold Value</th>
                <th className="px-4 py-3 text-right">Total Return</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Maturity Date</th>
                <th className="px-4 py-3 text-right">Days to Maturity</th>
              </tr>
            </thead>
            <tbody>
              {activeSeries.map((sg) => {
                const goldVal = currentGoldValue(sg);
                const totalReturn = totalReturnPercent(sg);
                const isNearMaturity = sg.daysToMaturity > 0 && sg.daysToMaturity < 180;
                return (
                  <tr
                    key={sg.series}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      sg.matured ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{sg.series}</div>
                      {sg.matured && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Matured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{sg.nseSymbol}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                      ₹{sg.issuePrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">
                      ₹{goldVal.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          totalReturn >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {totalReturn >= 0 ? "+" : ""}
                        {totalReturn.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(sg.issueDate)}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{formatDate(sg.maturityDate)}</td>
                    <td className="px-4 py-3 text-right">
                      {sg.matured ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <span
                          className={`text-xs font-medium tabular-nums ${
                            isNearMaturity ? "text-orange-600" : "text-gray-700"
                          }`}
                        >
                          {sg.daysToMaturity.toLocaleString("en-IN")}d
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Total Return includes estimated coupon income (2.5% p.a. on issue price) + capital gain based on
          current gold price of ₹{CURRENT_GOLD_PRICE_PER_GRAM.toLocaleString("en-IN")}/gram. Actual coupon is
          paid semi-annually and is taxable as per income tax slab. Capital gain at maturity is tax-free.
        </p>
      </section>

      {/* SGB vs other gold options */}
      <section className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">SGB vs Other Gold Investment Options</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="pb-2 pr-6">Parameter</th>
                <th className="pb-2 pr-6 text-yellow-700">SGB</th>
                <th className="pb-2 pr-6 text-gray-700">Physical Gold</th>
                <th className="pb-2 pr-6 text-indigo-700">Gold ETF</th>
                <th className="pb-2 text-teal-700">Digital Gold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                [
                  "Annual return (extra)",
                  "2.5% coupon on top of gold return",
                  "No additional return",
                  "No coupon",
                  "No coupon",
                ],
                [
                  "Capital gains tax (maturity)",
                  "0% if held to 8 years",
                  "20% LTCG + indexation",
                  "20% LTCG after 24 months",
                  "Taxed as physical gold",
                ],
                [
                  "Making charges / spread",
                  "None",
                  "8–20% making charges",
                  "0.5–1% expense ratio",
                  "0–3% buy/sell spread",
                ],
                [
                  "Minimum investment",
                  "1 gram",
                  "Usually 1–5g minimum",
                  "1 unit (≈1g)",
                  "₹1 worth",
                ],
                [
                  "Liquidity before maturity",
                  "Listed on NSE/BSE (secondary)",
                  "Sell to jeweller (spread)",
                  "Very liquid (intraday)",
                  "Platform dependent",
                ],
                [
                  "Storage / safety risk",
                  "None (demat/RBI issued)",
                  "High (locker costs)",
                  "None (demat)",
                  "Platform risk",
                ],
              ].map(([param, sgb, physical, etf, digital]) => (
                <tr key={param}>
                  <td className="py-2.5 pr-6 text-xs font-medium text-gray-500 whitespace-nowrap">{param}</td>
                  <td className="py-2.5 pr-6 text-xs text-yellow-700 font-medium">{sgb}</td>
                  <td className="py-2.5 pr-6 text-xs text-gray-600">{physical}</td>
                  <td className="py-2.5 pr-6 text-xs text-gray-600">{etf}</td>
                  <td className="py-2.5 text-xs text-gray-600">{digital}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link href="/learn/how-to-invest-in-gold" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Read our complete gold investment guide →
          </Link>
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: "Can I buy SGBs from the secondary market?",
              a: "Yes. All SGBs are listed on NSE and BSE. You can buy them through your broker at the prevailing market price, which may be above or below the RBI issue price depending on gold price movements.",
            },
            {
              q: "How is the 2.5% interest paid?",
              a: "The 2.5% per annum interest is paid semi-annually (1.25% every 6 months) directly to your bank account registered with the broker/demat. It is taxable as per your income tax slab.",
            },
            {
              q: "What happens at maturity?",
              a: "At maturity (8 years from issue), the RBI redeems the bond at the prevailing gold price (average of last 3 business days before maturity). The capital gain is completely tax-free for the original holder.",
            },
            {
              q: "Is the tax-free benefit available if I buy from secondary market?",
              a: "The tax-free capital gain benefit at maturity applies regardless of whether you bought from the primary issue or secondary market, as long as you hold until the maturity date.",
            },
          ].map((faq) => (
            <div key={faq.q} className="card">
              <div className="text-sm font-medium text-gray-900 mb-1">{faq.q}</div>
              <div className="text-xs text-gray-600 leading-relaxed">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <strong>Disclaimer:</strong> Gold prices used are approximate as of May 2026. Actual secondary
          market prices of SGBs may differ from calculated gold value. Coupon interest is taxable.
          Tax-free capital gains apply only to original RBI investors holding to maturity — secondary market
          buyers should consult a tax advisor. Not investment advice.
        </p>
      </div>
    </div>
  );
}
