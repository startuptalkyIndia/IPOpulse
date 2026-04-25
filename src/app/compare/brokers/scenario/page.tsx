import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ScenarioCalc } from "./ScenarioCalc";

export const metadata: Metadata = {
  title: "Broker Cost Scenario Calculator — what you really pay per year",
  description:
    "Plug in your trading volume, and we calculate the actual annual cost across Zerodha, Groww, Upstox, Angel One, Dhan, ICICI Direct — including DP, AMC, exchange charges & GST. Zero brokerage isn't always zero.",
  alternates: { canonical: "/compare/brokers/scenario" },
};

export default function ScenarioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Link href="/compare/brokers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Back to broker compare
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Broker Cost — Real Annual Scenario</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          &quot;Zero brokerage&quot; rarely means zero. Plug in your typical trading volume per month — we calculate
          the actual annual cost (brokerage + AMC + DP + exchange + GST + STT) across India&apos;s top 6 brokers
          and rank them for your specific style.
        </p>
      </div>

      <ScenarioCalc />
    </div>
  );
}
