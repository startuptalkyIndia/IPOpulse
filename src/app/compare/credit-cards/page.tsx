import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import { creditCards } from "@/lib/compare-data";

export const metadata: Metadata = {
  title: "Compare Credit Cards India — Top 6 Credit Cards with Rewards",
  description:
    "Compare India's best credit cards side-by-side — annual fees, rewards rate, lounge access, milestone benefits. April 2026 updated.",
  alternates: { canonical: "/compare/credit-cards" },
};

export default function CompareCardsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All comparisons
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Compare Indian Credit Cards</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Six popular Indian credit cards compared. Fees, rewards rate, best-for use case. Tap "Apply now" to go
          directly to the issuer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {creditCards.map((c) => (
          <div key={c.slug} className="card">
            <div className="flex items-baseline justify-between mb-2 gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{c.name}</h2>
                <div className="text-[11px] text-gray-400 mt-0.5">{c.issuer}</div>
              </div>
              <span className="badge bg-indigo-50 text-indigo-700 text-[10px] text-right">Annual ₹{c.annualFee.replace("₹", "")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <div className="text-gray-400">Joining fee</div>
                <div className="font-medium text-gray-700">{c.joiningFee}</div>
              </div>
              <div>
                <div className="text-gray-400">Rewards</div>
                <div className="font-medium text-gray-700">{c.rewardsRate}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              <span className="font-medium">Best for:</span> {c.bestFor}
            </p>
            <ul className="space-y-1.5 mb-3">
              {c.features.map((f) => (
                <li key={f} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-gray-400 mb-3">
              <span className="font-medium">Eligibility:</span> {c.eligibility}
            </p>
            <a
              href={c.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full inline-flex items-center justify-center gap-1"
            >
              Apply for {c.name.split(" ")[0]} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>

      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <span className="font-semibold">Important:</span> Always read the Most Important Terms &amp; Conditions
          (MITC) before applying. Reward points have expiry and redemption rules. Foreign transaction markup (usually
          3.5%) applies on all international spends. Late payment fees + interest can be extreme (36–42% annualised).
        </p>
      </div>
    </div>
  );
}
