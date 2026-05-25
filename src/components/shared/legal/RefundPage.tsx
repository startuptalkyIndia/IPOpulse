// Source: _shared/templates/components/legal/RefundPage.tsx — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/components/legal/RefundPage.tsx
// Real, readable Refund Policy for TalkyTools products.
// Razorpay + Stripe aware, India consumer-protection friendly.
//
// Copy to: src/components/legal/RefundPage.tsx
// Use in: src/app/refund/page.tsx → <RefundPage companyName="BillForge" ... />

import * as React from "react";

export interface RefundPageProps {
  /** Product / company name (e.g. "BillForge"). */
  companyName: string;
  /** Contact email for refund requests. */
  contactEmail: string;
  /** Refund window in days. Default 7. */
  refundWindowDays?: number;
  /** Time to credit back in business days. Default "5–10". */
  refundProcessingDays?: string;
  /** Jurisdiction. Default "India". */
  jurisdiction?: string;
  /** ISO date of last update. */
  lastUpdated?: string;
  /** Optional product domain. */
  domain?: string;
}

/**
 * RefundPage — drop-in Refund Policy component.
 *
 * @example
 *   <RefundPage
 *     companyName="BillForge"
 *     contactEmail="billing@talkytools.com"
 *     refundWindowDays={7}
 *   />
 */
export function RefundPage({
  companyName,
  contactEmail,
  refundWindowDays = 7,
  refundProcessingDays = "5–10",
  jurisdiction = "India",
  lastUpdated,
  domain,
}: RefundPageProps) {
  const date = lastUpdated ?? new Date().toISOString().slice(0, 10);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {companyName}
          {domain ? ` (${domain})` : ""} · Last updated {date}
        </p>
      </header>

      <section className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-a:text-indigo-600">
        <p>
          We want you to be confident when paying for {companyName}. This
          policy explains when refunds are available, how to request one, and
          how cancellations work.
        </p>

        <h2>1. Free trial</h2>
        <p>
          Where {companyName} offers a free trial, you can cancel at any time
          before the trial ends without being charged. We&rsquo;ll send you a
          reminder before any first charge.
        </p>

        <h2>2. Refund window</h2>
        <p>
          You can request a full refund within{" "}
          <strong>{refundWindowDays} days</strong> of your first paid charge if{" "}
          {companyName} did not work as advertised for you. No questions asked
          on first-time purchases inside the window.
        </p>

        <h2>3. When refunds are NOT available</h2>
        <ul>
          <li>
            Renewals after the initial {refundWindowDays}-day window
            (cancellation prevents the next charge but does not refund the
            current cycle, except as required by law).
          </li>
          <li>
            Add-on credits or one-time consumable purchases that have been at
            least partially consumed.
          </li>
          <li>
            Accounts terminated for breach of our{" "}
            <a href="/terms">Terms of Service</a>, including abuse, fraud, or
            chargebacks.
          </li>
          <li>
            Custom development, onboarding, or professional services already
            delivered.
          </li>
        </ul>

        <h2>4. Cancellation</h2>
        <p>
          You can cancel your subscription anytime from{" "}
          <em>Settings → Billing</em>. Cancellation takes effect at the end of
          the current billing cycle — you keep access until then and we
          don&rsquo;t charge you again.
        </p>

        <h2>5. How to request a refund</h2>
        <ol>
          <li>
            Email{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a> from your
            account email with the subject line &ldquo;Refund request&rdquo;.
          </li>
          <li>
            Include your invoice number and a brief reason (so we can improve).
          </li>
          <li>
            We acknowledge within 1 business day and process eligible refunds
            within <strong>{refundProcessingDays} business days</strong>.
          </li>
        </ol>

        <h2>6. How refunds are paid</h2>
        <ul>
          <li>
            <strong>INR (Razorpay):</strong> refunded to the original card,
            UPI, or net banking account. Typically reflects in 5–7 working
            days.
          </li>
          <li>
            <strong>USD (Stripe):</strong> refunded to the original card.
            Typically reflects in 5–10 working days.
          </li>
        </ul>
        <p>
          We cannot refund to a different payment method than the one used for
          the original charge.
        </p>

        <h2>7. Partial refunds</h2>
        <p>
          For annual plans cancelled within the refund window, we refund the
          full amount paid. After the window, annual plans are non-refundable
          but we&rsquo;ll prorate downgrades to a lower tier as account credit
          on request.
        </p>

        <h2>8. Pricing errors</h2>
        <p>
          If we accidentally charge you the wrong amount due to a pricing or
          billing error, we&rsquo;ll refund the difference promptly — no need
          to wait for the refund window.
        </p>

        <h2>9. Disputes &amp; chargebacks</h2>
        <p>
          Please reach out to us first — most issues are resolved within a day.
          Filing a chargeback without contacting us may result in account
          suspension under our <a href="/terms">Terms of Service</a>.
        </p>

        <h2>10. Statutory rights</h2>
        <p>
          Nothing in this policy limits any non-waivable rights you have under
          consumer protection law in {jurisdiction}.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about a refund?{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a> — we&rsquo;re
          a small team and we read every email.
        </p>
      </section>
    </article>
  );
}

export default RefundPage;
