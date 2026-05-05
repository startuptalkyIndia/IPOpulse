import type { Metadata } from "next";
import { PromoterCheck } from "./PromoterCheck";

export const metadata: Metadata = {
  title: "Promoter Background Check (AI) — research IPO promoters & founders",
  description:
    "AI-assisted promoter / founder background check for Indian listed and pre-IPO companies. Prior ventures, controversies, regulatory issues, related parties, red and green flags.",
  alternates: { canonical: "/tools/promoter-check" },
};

export default function PromoterCheckPage() {
  const aiEnabled = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Promoter Background Check</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Quick AI-grounded research note on any Indian promoter, founder, or KMP. Surfaces prior ventures,
          regulatory matters, controversies, and patterns that matter for governance assessment. Supplements your
          own diligence — never replaces it.
        </p>
      </div>

      <PromoterCheck enabled={aiEnabled} />

      <section className="card bg-yellow-50 border-yellow-200">
        <h2 className="text-sm font-semibold text-yellow-900 mb-1">Important</h2>
        <p className="text-xs text-yellow-800">
          AI output is grounded only in the model&apos;s training data and may miss recent events, regional press
          coverage, or unindexed filings. <strong>Always verify</strong> against SEBI orders, MCA filings, BSE/NSE
          announcements, and investigative journalism before making investment decisions. Treat this as a research
          starting point, not a final verdict.
        </p>
      </section>
    </div>
  );
}
