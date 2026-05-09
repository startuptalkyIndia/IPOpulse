import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2, Star } from "lucide-react";
import { creditCards } from "@/lib/compare-data";

export const metadata: Metadata = {
  title: "Best Credit Cards India 2026 — Cashback, Travel & Lifetime Free Cards",
  description:
    "Compare India's best credit cards in 2026 — cashback, travel rewards, airport lounge, and lifetime free options. HDFC, ICICI, SBI, Axis, and Amex cards compared side-by-side.",
  alternates: { canonical: "/compare/credit-cards" },
};

const quickPicks = [
  { label: "Best lifetime free", card: "Amazon Pay ICICI", why: "No annual fee ever, 5% back on Amazon, 2% on other online" },
  { label: "Best cashback card", card: "SBI Cashback Card", why: "5% cashback on all online spends — no category restrictions" },
  { label: "Best for travel", card: "Axis Magnus", why: "Unlimited lounge + 35 points/₹200 on travel bookings" },
  { label: "Best everyday rewards", card: "HDFC Regalia Gold", why: "Broad acceptance, lounge access, strong milestone benefits" },
  { label: "Best for millennials", card: "HDFC Millennia", why: "5% on Amazon/Flipkart/Swiggy, ₹1,000 waivable annual fee" },
  { label: "Best milestone rewards", card: "Amex Platinum Travel", why: "₹7,700 + ₹11,800 vouchers at spend milestones" },
];

const comparisonMatrix = [
  { feature: "Annual fee", hdfc_reg: "₹2,500", amazon: "Free", sbi: "₹999", magnus: "₹12,500", millennia: "₹1,000", amex: "₹5,000" },
  { feature: "Fee waiver", hdfc_reg: "Yes (₹4L spend)", amazon: "Always free", sbi: "Yes (₹2L spend)", magnus: "Yes (₹25L spend)", millennia: "Yes (₹1L spend)", amex: "No" },
  { feature: "Rewards on Amazon", hdfc_reg: "Standard", amazon: "5% (Prime)", sbi: "5% (all online)", magnus: "Standard", millennia: "5%", amex: "Standard" },
  { feature: "Airport lounge", hdfc_reg: "Priority Pass", amazon: "None", sbi: "None", magnus: "Unlimited", millennia: "8 visits/yr", amex: "8 visits/yr" },
  { feature: "Fuel surcharge waiver", hdfc_reg: "Yes", amazon: "No", sbi: "No", magnus: "Yes", millennia: "Yes", amex: "No" },
  { feature: "Add-on cards", hdfc_reg: "Free", amazon: "Free", sbi: "Free", magnus: "₹1,000/card", millennia: "Free", amex: "₹500/card" },
];

const columnHeaders = ["HDFC Regalia", "Amazon ICICI", "SBI Cashback", "Axis Magnus", "HDFC Millennia", "Amex Travel"];

export default function CompareCardsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All comparisons
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Best Credit Cards in India 2026</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Six popular credit cards compared across fees, rewards, lounge access, and best-use scenarios. Updated May 2026.
        </p>
      </div>

      {/* Quick Picks */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Picks — Find Your Card</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickPicks.map((p) => (
            <div key={p.label} className="card flex items-start gap-3">
              <Star className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{p.label}</div>
                <div className="text-sm font-bold text-indigo-700 mt-0.5">{p.card}</div>
                <div className="text-xs text-gray-500 mt-0.5">{p.why}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison matrix */}
      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                <th className="text-left px-2 py-2.5 min-w-[140px]">Feature</th>
                {columnHeaders.map((h) => (
                  <th key={h} className="text-center px-2 py-2.5 min-w-[90px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonMatrix.map((row, i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                  <td className="px-2 py-2.5 text-gray-700 font-medium">{row.feature}</td>
                  {[row.hdfc_reg, row.amazon, row.sbi, row.magnus, row.millennia, row.amex].map((val, j) => (
                    <td key={j} className={`text-center px-2 py-2.5 ${
                      val === "Free" || val === "Always free" || val === "Unlimited" ? "text-emerald-600 font-semibold" :
                      val === "None" || val === "No" ? "text-gray-400" : "text-gray-700"
                    }`}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed card profiles */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Card Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {creditCards.map((c) => (
            <div key={c.slug} className="card flex flex-col">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{c.name}</h3>
                  <div className="text-xs text-gray-400 mt-0.5">{c.issuer}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-gray-400">Annual fee</div>
                  <div className={`text-sm font-bold ${c.annualFee.includes("Free") ? "text-emerald-600" : "text-gray-900"}`}>
                    {c.annualFee}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-gray-400 mb-0.5">Joining fee</div>
                  <div className="font-semibold text-gray-800">{c.joiningFee}</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2">
                  <div className="text-gray-400 mb-0.5">Rewards rate</div>
                  <div className="font-semibold text-indigo-700 leading-tight">{c.rewardsRate}</div>
                </div>
              </div>

              <div className="text-xs text-indigo-700 font-semibold mb-3 bg-indigo-50 px-3 py-1.5 rounded-lg">
                ★ Best for: {c.bestFor}
              </div>

              <ul className="space-y-1.5 mb-3 flex-1">
                {c.features.map((f) => (
                  <li key={f} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="text-[11px] text-gray-500 mb-3 bg-gray-50 px-3 py-2 rounded-lg">
                <span className="font-semibold">Eligibility:</span> {c.eligibility}
              </div>

              <a href={c.ctaUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary w-full inline-flex items-center justify-center gap-1.5 text-sm">
                Apply for {c.name.split(" ")[0]} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Tips before applying */}
      <div className="card border-amber-200 bg-amber-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">⚠ Before You Apply</h3>
        <ul className="space-y-1.5">
          {[
            "Never carry a balance — credit card interest is 36–42% annualised, wiping out all rewards",
            "Foreign transaction markup (~3.5%) applies internationally — choose a low forex markup card for travel",
            "Reward points expire and have minimum redemption amounts — read the fine print",
            "Multiple credit applications in quick succession lower your CIBIL score via hard inquiries",
            "Track spend to hit fee waiver thresholds before each card anniversary date",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-900">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Disclosure:</strong> IPOpulse may earn affiliate commission via links above — at no extra cost to you.
          Card terms, fees, and benefits are subject to change at the issuer&apos;s discretion. Always read the MITC before applying.
          Approval is subject to the issuer&apos;s eligibility criteria and credit score.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/compare/brokers" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">Stock Brokers →</div>
          <div className="text-xs text-gray-500 mt-0.5">Compare Zerodha, Groww, Upstox and more</div>
        </Link>
        <Link href="/compare/insurance" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">Insurance Plans →</div>
          <div className="text-xs text-gray-500 mt-0.5">Term life and health insurance comparison</div>
        </Link>
        <Link href="/calculators/sip" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">SIP Calculator →</div>
          <div className="text-xs text-gray-500 mt-0.5">Plan your mutual fund investments</div>
        </Link>
      </div>
    </div>
  );
}
