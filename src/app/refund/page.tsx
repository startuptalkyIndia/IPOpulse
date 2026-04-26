// Auto-generated from _shared/templates/legal/refund/page.tsx.template

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | IPOPulse",
  description: "Refund and cancellation terms for IPOPulse.",
}

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-indigo">
      <h1>Refund &amp; Cancellation Policy</h1>
      <p className="text-sm text-gray-500">Last updated: 26 April 2026</p>

      <p>
        We want you to be satisfied with IPOPulse. This policy explains
        when refunds are available and how to request one.
      </p>

      <h2>1. Subscription cancellation</h2>
      <p>You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period — you retain access until then.</p>

      <h2>2. Refund eligibility</h2>
      <ul>
        <li><strong>14-day money-back guarantee</strong> on first-time monthly subscriptions if you cancel within 14 days of initial purchase.</li>
        <li><strong>Annual plans:</strong> pro-rata refund within 30 days of purchase, minus any usage already consumed.</li>
        <li><strong>No refunds</strong> for partial months, add-on credits already used, or after the eligibility window.</li>
      </ul>

      <h2>3. Service downtime credits</h2>
      <p>If the Service is unavailable for more than 24 consecutive hours due to our fault, you may request service credits equal to the affected period.</p>

      <h2>4. How to request a refund</h2>
      <p>Email <a href="mailto:hello@ipopulse.com">hello@ipopulse.com</a> with:</p>
      <ul>
        <li>Your account email</li>
        <li>Order/transaction ID</li>
        <li>Reason for the refund</li>
      </ul>
      <p>We process refunds within <strong>5–7 business days</strong> to the original payment method. International payments may take 10–14 days.</p>

      <h2>5. Non-refundable items</h2>
      <ul>
        <li>One-time setup fees</li>
        <li>Custom development hours already delivered</li>
        <li>Third-party charges (Stripe / Razorpay processing fees)</li>
      </ul>

      <h2>6. Chargebacks</h2>
      <p>Please contact us first before initiating a chargeback — most issues can be resolved directly. Unjustified chargebacks may result in account suspension.</p>

      <h2>7. Contact</h2>
      <p>Questions? <a href="mailto:hello@ipopulse.com">hello@ipopulse.com</a></p>
    </main>
  )
}
