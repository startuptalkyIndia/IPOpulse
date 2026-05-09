import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info, AlertTriangle } from "lucide-react";
import { CapitalGainsCalc } from "./CapitalGainsCalc";

export const metadata: Metadata = {
  title: "Capital Gains Tax Calculator India 2026 — STCG LTCG on Stocks and Mutual Funds",
  description:
    "Calculate capital gains tax on equity, mutual funds, debt, and gold investments. Covers post-July 2024 Budget rules: STCG 20%, LTCG 12.5% with ₹1.25L exemption. Debt funds taxed at slab rate.",
  alternates: { canonical: "/calculators/capital-gains" },
};

export default function CapitalGainsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Link href="/calculators" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All calculators
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Capital Gains Tax Calculator</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Calculate the exact tax on your equity, mutual fund, debt, and gold investment gains. Updated for the
          July 2024 Union Budget: STCG is now 20%, LTCG is 12.5% with a ₹1.25 lakh annual exemption.
        </p>
      </div>

      {/* 2024 Budget info box */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-indigo-900 mb-2">2024 Union Budget Changes (effective 23 Jul 2024)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-indigo-800 mb-1">Equity &amp; Equity Mutual Funds</div>
                <ul className="space-y-1 text-indigo-700 text-xs">
                  <li>STCG (held &lt; 12 months): <strong>20%</strong> flat <span className="text-indigo-500">(was 15%)</span></li>
                  <li>LTCG (held ≥ 12 months): <strong>12.5%</strong> on gains above ₹1.25L <span className="text-indigo-500">(was 10%, exemption ₹1L)</span></li>
                  <li>₹1.25 lakh LTCG exempt per year — 0% tax within this limit</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-indigo-800 mb-1">Debt / Gold / Other (post Apr 2023)</div>
                <ul className="space-y-1 text-indigo-700 text-xs">
                  <li>All gains taxed at <strong>income tax slab rate</strong></li>
                  <li>No distinction between short-term and long-term</li>
                  <li><strong>No indexation benefit</strong> for debt MFs (removed Apr 2023)</li>
                  <li>Gold bonds (SGBs) held to maturity: fully exempt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CapitalGainsCalc />

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-semibold text-amber-900 mb-1">Important notes</h3>
            <ul className="text-xs text-amber-800 space-y-1 list-disc pl-3">
              <li>This calculator does not include 4% health and education cess — add ~4% to the tax amount shown.</li>
              <li>Surcharge may apply for total income above ₹50L. Consult a CA for high-income scenarios.</li>
              <li>STT (Securities Transaction Tax) is separate from capital gains tax and not modeled here.</li>
              <li>Sovereign Gold Bond redemption at maturity is fully exempt from capital gains tax.</li>
              <li>For tax loss harvesting strategies, see our <Link href="/calculators/tax-harvester" className="underline">Tax Harvester Calculator</Link>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key rules reference */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Reference — Capital Gains Tax Rules 2026</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-2">Asset Type</th>
                <th className="px-3 py-2">Holding Period</th>
                <th className="px-3 py-2">Classification</th>
                <th className="px-3 py-2">Tax Rate</th>
              </tr>
            </thead>
            <tbody>
              {[
                { asset: "Listed Equity / Equity MF", holding: "< 12 months", type: "STCG", rate: "20% flat" },
                { asset: "Listed Equity / Equity MF", holding: "≥ 12 months", type: "LTCG", rate: "12.5% above ₹1.25L/yr" },
                { asset: "Debt MF / Bond (post Apr 2023)", holding: "Any period", type: "Ordinary income", rate: "Slab rate (5/10/20/30%)" },
                { asset: "Physical Gold / Gold ETF", holding: "Any period", type: "Ordinary income", rate: "Slab rate" },
                { asset: "Sovereign Gold Bond (at maturity)", holding: "8 years", type: "Exempt", rate: "0%" },
                { asset: "Real Estate (land/house)", holding: "< 24 months", type: "STCG", rate: "Slab rate" },
                { asset: "Real Estate (land/house)", holding: "≥ 24 months", type: "LTCG", rate: "12.5% (no indexation)" },
                { asset: "Unlisted shares", holding: "< 24 months", type: "STCG", rate: "Slab rate" },
                { asset: "Unlisted shares", holding: "≥ 24 months", type: "LTCG", rate: "12.5%" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-900">{row.asset}</td>
                  <td className="px-3 py-2 text-gray-600">{row.holding}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      row.type === "STCG" ? "bg-yellow-100 text-yellow-700" :
                      row.type === "LTCG" ? "bg-green-100 text-green-700" :
                      row.type === "Exempt" ? "bg-indigo-100 text-indigo-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{row.type}</span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-gray-900">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related calculators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/calculators/tax-harvester" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900 mb-1">Tax Harvester</div>
          <div className="text-xs text-gray-500">Book losses to offset capital gains before March 31</div>
        </Link>
        <Link href="/calculators/ltcg-stcg" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900 mb-1">LTCG / STCG Calculator</div>
          <div className="text-xs text-gray-500">Alternative capital gains tax tool</div>
        </Link>
        <Link href="/calculators/tax" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900 mb-1">Income Tax Calculator</div>
          <div className="text-xs text-gray-500">Full income tax with new vs old regime</div>
        </Link>
      </div>
    </div>
  );
}
