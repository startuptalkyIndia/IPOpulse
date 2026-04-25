import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TaxHarvesterCalc } from "./TaxHarvesterCalc";

export const metadata: Metadata = {
  title: "Capital Gains Tax Harvester — offset Indian LTCG/STCG before March 31",
  description:
    "India's tax loss harvesting tool. Enter realized gains and unrealized losses; we suggest which losses to book by March 31 to offset gains and minimize tax. Updated for FY 2025-26 (12.5% LTCG, 20% STCG).",
  alternates: { canonical: "/calculators/tax-harvester" },
};

export default function TaxHarvesterPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Link href="/calculators" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All calculators
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Tax Harvester — book losses, offset gains</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Smart Indian retail investors review their portfolio in February-March. If you have realized gains this
          financial year, booking selected losses (by selling and re-buying after a couple of days) can save
          significant tax. This calculator tells you exactly how much.
        </p>
      </div>

      <TaxHarvesterCalc />

      <div className="card max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">How tax harvesting works in India</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>
            <strong>STCG ↔ STCG only</strong>: Short-term losses can offset both STCG and LTCG. Long-term losses only
            offset LTCG.
          </li>
          <li>
            <strong>The ₹1.25L LTCG exemption</strong>: First ₹1.25 lakh of LTCG on equity is tax-free per FY. If your
            LTCG is below that, harvesting LT losses isn&apos;t worth it.
          </li>
          <li>
            <strong>How to book</strong>: Sell the loss-making position and re-buy shortly after (1-2 trading days
            later to avoid intraday). India doesn&apos;t have a US-style &quot;wash sale&quot; rule.
          </li>
          <li>
            <strong>Carry forward</strong>: Unused losses carry forward for 8 years. File ITR-2 to lock them in.
          </li>
          <li>
            <strong>Don&apos;t over-do it</strong>: Each round-trip costs brokerage + STT + slippage. Worth it only when
            tax saving exceeds transaction cost (rule of thumb: harvest losses worth ≥₹1 lakh).
          </li>
        </ul>
      </div>
    </div>
  );
}
