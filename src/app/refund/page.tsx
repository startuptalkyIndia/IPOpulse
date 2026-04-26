import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — IPOpulse",
  description: "Refund and cancellation terms for paid IPOpulse subscriptions.",
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-indigo">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Refund &amp; Cancellation Policy</h1>
      <p className="text-xs text-gray-500 mb-6">Last updated: 26 April 2026</p>

      <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">1. Free tier — no charges, no refunds</h2>
          <p>
            Most of IPOpulse — IPO calendar, GMP, subscription tracking, allotment status, 20+ calculators, sector and
            super-investor pages — is and will remain free for individual retail investors. There is nothing to refund
            for the free tier.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">2. Paid features (when launched)</h2>
          <p>
            IPOpulse is rolling out a Pro tier (DRHP AI search, push alerts, advanced screener) in 2026. The terms in
            this section apply only once you subscribe to a paid plan.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Subscription cancellation:</strong> cancel anytime from your account settings. Cancellation takes effect at the end of the current billing period — you keep access until then.</li>
            <li><strong>14-day money-back guarantee</strong> on first-time monthly subscriptions if you cancel within 14 days of initial purchase.</li>
            <li><strong>Annual plans:</strong> pro-rata refund within 30 days of purchase, minus any usage already consumed.</li>
            <li><strong>No refunds</strong> for partial months or after the eligibility window.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">3. Service downtime credits</h2>
          <p>
            If a paid feature is unavailable for more than 24 consecutive hours due to our fault, you may request
            service credits equal to the affected period. Free-tier outages are best-effort only; no credits apply.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">4. How to request a refund</h2>
          <p>Email <a className="underline text-indigo-600" href="mailto:hello@ipopulse.talkytools.com">hello@ipopulse.talkytools.com</a> with:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your account email</li>
            <li>Order / transaction ID</li>
            <li>Reason for the refund</li>
          </ul>
          <p className="mt-2">We process refunds within <strong>5–7 business days</strong> to the original payment method. International payments may take 10–14 days.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">5. Non-refundable items</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>One-time setup or configuration fees</li>
            <li>Custom development hours already delivered</li>
            <li>Third-party processing fees (Razorpay / Stripe)</li>
            <li>Lifetime / pre-paid multi-year deals after the first 30 days</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">6. Chargebacks</h2>
          <p>
            Please contact us first before initiating a chargeback — almost all issues can be resolved directly within
            7 days. Unjustified chargebacks may result in account suspension.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">7. Contact</h2>
          <p>
            Questions or refund requests:{" "}
            <a className="underline text-indigo-600" href="mailto:hello@ipopulse.talkytools.com">hello@ipopulse.talkytools.com</a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Operated by TalkyTools (IPOpulse) — refunds are issued by the same legal entity that received your payment.
          </p>
        </section>
      </div>
    </main>
  );
}
