import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Shield, Heart, CheckCircle2 } from "lucide-react";
import { termPlans, healthPlans } from "@/lib/insurance";

export const metadata: Metadata = {
  title: "Compare Term & Health Insurance India 2026 — Top 6 Plans Each",
  description:
    "Side-by-side comparison of India's best term life and health insurance plans. Premium, claim settlement ratio, network hospitals, key features. April 2026 updated.",
  alternates: { canonical: "/compare/insurance" },
};

export default function InsuranceComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All comparisons
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Compare Insurance — Term & Health</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Six top term-life plans and six top health-insurance plans, side-by-side. Premium illustrations are for a
          healthy 30-year-old non-smoker (term) and 25-year-old individual (health) — adjust expectations for your
          age and health profile.
        </p>
      </div>

      {/* Term Life */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Term Life Insurance — top 6 plans</h2>
        </div>

        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick rule of thumb</h3>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li><strong>Cover</strong>: 10-20× annual income, minimum ₹1 Cr if you have dependents.</li>
            <li><strong>Tenure</strong>: cover until age 60-65 (when liabilities end).</li>
            <li><strong>Avoid Return-of-Premium</strong>: 30-50% costlier for ~2.5% return — pure term + invest the difference is better.</li>
            <li><strong>Claim settlement ratio (CSR)</strong>: only consider insurers with 95%+ CSR. Below that, the savings aren&apos;t worth the heartache for survivors.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3">Insurer / Plan</th>
                  <th className="px-3 py-3 text-right">Cover</th>
                  <th className="px-3 py-3 text-right">Term</th>
                  <th className="px-3 py-3 text-right">Monthly ₹</th>
                  <th className="px-3 py-3 text-right">CSR</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {termPlans.map((p) => (
                  <tr key={p.slug} className="border-b border-gray-100">
                    <td className="px-3 py-3 text-sm">
                      <div className="font-semibold text-gray-900">{p.insurer}</div>
                      <div className="text-[11px] text-gray-500">{p.planName}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">₹{p.coverCr} Cr</td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">{p.termYears} yrs</td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">
                      ₹{p.monthlyPremium.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-green-600">{p.claimSettlementPct}%</td>
                    <td className="px-3 py-3 text-right">
                      <a
                        href={p.ctaUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        data-affiliate="policybazaar-term"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                      >
                        Compare quotes <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {termPlans.map((p) => (
            <div key={p.slug} className="card">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{p.insurer}</h3>
                <span className="text-xs text-gray-500">{p.planName}</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                <strong>Best for:</strong> {p.bestFor}
              </p>
              <ul className="space-y-1 mb-3">
                {p.highlights.map((h) => (
                  <li key={h} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <a
                href={p.ctaUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                data-affiliate="policybazaar-term"
                className="btn-primary w-full inline-flex items-center justify-center gap-1 text-xs"
              >
                Get quote · {p.insurer} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Health */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Health Insurance — top 6 plans</h2>
        </div>

        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick rule of thumb</h3>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li><strong>Cover</strong>: ₹10 Lakh minimum in metros; ₹5 Lakh in tier-2/3.</li>
            <li><strong>Family floater</strong> typically 30-40% cheaper than individual policies if you have a healthy family.</li>
            <li><strong>Network</strong>: check that <em>your</em> preferred hospitals are cashless.</li>
            <li><strong>Avoid sub-limits</strong> on room rent, ICU. Look for 100% restoration benefit.</li>
            <li><strong>Don&apos;t bundle with insurance from your employer alone</strong> — it disappears when you change jobs.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3">Insurer / Plan</th>
                  <th className="px-3 py-3 text-right">Cover</th>
                  <th className="px-3 py-3 text-right">Monthly ₹</th>
                  <th className="px-3 py-3 text-right">Network</th>
                  <th className="px-3 py-3 text-right">CSR</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {healthPlans.map((p) => (
                  <tr key={p.slug} className="border-b border-gray-100">
                    <td className="px-3 py-3 text-sm">
                      <div className="font-semibold text-gray-900">{p.insurer}</div>
                      <div className="text-[11px] text-gray-500">{p.planName}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">₹{p.coverLakh} L</td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">
                      ₹{p.monthlyPremium.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">
                      {p.hospitalNetwork.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums text-green-600">{p.claimSettlementPct}%</td>
                    <td className="px-3 py-3 text-right">
                      <a
                        href={p.ctaUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        data-affiliate="policybazaar-health"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                      >
                        Compare quotes <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {healthPlans.map((p) => (
            <div key={p.slug} className="card">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{p.insurer}</h3>
                <span className="text-xs text-gray-500">{p.planName}</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                <strong>Best for:</strong> {p.bestFor}
              </p>
              <ul className="space-y-1 mb-3">
                {p.highlights.map((h) => (
                  <li key={h} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <a
                href={p.ctaUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                data-affiliate="policybazaar-health"
                className="btn-primary w-full inline-flex items-center justify-center gap-1 text-xs"
              >
                Get quote · {p.insurer} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <span className="font-semibold">Important:</span> Premium illustrations above are illustrative only. Actual premiums depend on age,
          health, smoking, occupation, sum assured, and underwriting. Always get a personalized quote and read the
          policy wording before signing. We earn a referral fee on quotes initiated through these links.
        </p>
      </div>
    </div>
  );
}
