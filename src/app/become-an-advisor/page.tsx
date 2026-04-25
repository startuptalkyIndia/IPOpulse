import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Briefcase, TrendingUp, Wallet, Users, ArrowRight, Check } from "lucide-react";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Become an IPOpulse Advisor — earn ₹500-5,000 per referral",
  description:
    "Earn affiliate commissions by referring users to IPOpulse-curated demat accounts, credit cards, loans, and insurance. Free to join, monthly UPI payouts.",
  alternates: { canonical: "/become-an-advisor" },
};

export default async function BecomeAdvisorLanding() {
  if (!(await isFeatureEnabled("advisor.enabled"))) notFound();

  const benefits = [
    { icon: Wallet, title: "Earn per referral", desc: "₹500–₹5,000 per approved demat / credit card / loan / insurance lead. Higher tiers for active advisors." },
    { icon: TrendingUp, title: "Track every click", desc: "Real-time dashboard showing your referral clicks, conversions, and earnings." },
    { icon: Users, title: "Pre-built product catalogue", desc: "30+ curated financial products — you don't sell, you just share. Users compare on IPOpulse." },
    { icon: Briefcase, title: "Monthly UPI payouts", desc: "Earnings credited to your UPI / bank account on the 1st of every month. No minimum threshold." },
  ];

  const steps = [
    "Sign up as an IPOpulse user (free)",
    "Apply at /become-an-advisor with your name, phone, city",
    "Get approved (24-48 hour review)",
    "Receive your unique advisor code (e.g., AKSH7K2)",
    "Share product links with your code embedded — friends, WhatsApp groups, social media",
    "Earn commissions on every approved conversion + monthly payout",
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="max-w-3xl">
            <span className="badge bg-indigo-100 text-indigo-800 mb-3">IPOpulse Partner Program</span>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Earn ₹500–5,000 per referral. Part-time, anywhere in India.
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-700">
              Refer friends and family to IPOpulse-curated demat accounts, credit cards, personal loans, home loans
              and insurance. We handle the comparison + apply flow. You earn the commission.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/advisor/apply" className="btn-primary inline-flex items-center gap-1">
                Apply now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/finance" className="btn-secondary">
                See what you'd be promoting
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Why advisors love IPOpulse</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="card">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
        <div className="card max-w-2xl">
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 pt-1">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Commission rates */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission rates by product</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3 text-right">Partner pays IPOpulse</th>
                <th className="px-3 py-3 text-right">Advisor share (50%)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { product: "Demat account (Sharekhan)", payout: 1080, split: 540 },
                { product: "Demat account (Angel One)", payout: 750, split: 375 },
                { product: "Credit card (HDFC Millennia)", payout: 1500, split: 750 },
                { product: "Personal loan (Bajaj)", payout: 630, split: 315 },
                { product: "Home loan (any)", payout: 2000, split: 1000 },
                { product: "Term insurance (PolicyBazaar)", payout: 300, split: 150 },
                { product: "Savings account (Jupiter)", payout: 400, split: 200 },
                { product: "Business loan (Lendingkart)", payout: 800, split: 400 },
              ].map((r) => (
                <tr key={r.product} className="border-b border-gray-100">
                  <td className="px-3 py-3 text-sm text-gray-900">{r.product}</td>
                  <td className="px-3 py-3 text-sm text-right tabular-nums text-gray-700">₹{r.payout.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-green-600">₹{r.split.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Commission rates current as of April 2026. May vary based on performance tier.</p>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">FAQ</h2>
        <div className="space-y-4 text-sm text-gray-700 max-w-3xl">
          <div className="card">
            <h3 className="font-semibold text-gray-900">Do I need a finance license?</h3>
            <p className="mt-1">No. You're sharing IPOpulse links — IPOpulse is the publisher. You don't advise on individual products or take commissions from clients directly.</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900">When do I get paid?</h3>
            <p className="mt-1">First of every month, via UPI or NEFT to the bank account you register. No minimum threshold.</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900">Is the commission split fair?</h3>
            <p className="mt-1">50/50 standard. Top advisors (₹50k+/month volume) move to 60/40 (advisor's favor). The exact partner payouts are transparent and shown above.</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900">What if my referral doesn't convert?</h3>
            <p className="mt-1">No earnings on unsuccessful applications. Click tracking shows you the funnel — apply, KYC, approval, funded. You're paid on funded/approved only.</p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="card bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Ready to start earning?</h2>
          <p className="text-sm text-gray-600 mb-4">Free to join. 24-48 hour approval. No commitment, no exclusivity.</p>
          <Link href="/advisor/apply" className="btn-primary inline-flex items-center gap-1">
            Apply now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
