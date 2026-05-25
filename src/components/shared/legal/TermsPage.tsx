// Source: _shared/templates/components/legal/TermsPage.tsx — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/components/legal/TermsPage.tsx
// Real, readable Terms of Service for TalkyTools products.
// India IT Act + IT Rules 2021 + consumer-protection aware.
//
// Copy to: src/components/legal/TermsPage.tsx
// Use in: src/app/terms/page.tsx → <TermsPage companyName="BillForge" ... />

import * as React from "react";

export interface TermsPageProps {
  /** Product / company name (e.g. "BillForge"). */
  companyName: string;
  /** Contact email for legal queries. */
  contactEmail: string;
  /** Governing jurisdiction. Default "India". */
  jurisdiction?: string;
  /** Registered business legal entity. */
  legalEntity?: string;
  /** Courts where disputes are resolved (default "Bengaluru, Karnataka, India"). */
  courtsOfJurisdiction?: string;
  /** ISO date of last update. */
  lastUpdated?: string;
  /** Optional product domain. */
  domain?: string;
}

/**
 * TermsPage — drop-in Terms of Service component.
 *
 * @example
 *   <TermsPage
 *     companyName="BillForge"
 *     contactEmail="legal@talkytools.com"
 *     domain="billforge.talkytools.com"
 *   />
 */
export function TermsPage({
  companyName,
  contactEmail,
  jurisdiction = "India",
  legalEntity = "the TalkyTools team",
  courtsOfJurisdiction = "Bengaluru, Karnataka, India",
  lastUpdated,
  domain,
}: TermsPageProps) {
  const date = lastUpdated ?? new Date().toISOString().slice(0, 10);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {companyName}
          {domain ? ` (${domain})` : ""} · Last updated {date}
        </p>
      </header>

      <section className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-a:text-indigo-600">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
          and use of {companyName}, operated by {legalEntity}. By creating an
          account or using the service, you agree to these Terms.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 18 years old and legally able to enter a binding
          contract under the laws of {jurisdiction} to use {companyName}. If
          you are using {companyName} on behalf of an organization, you
          represent that you are authorized to do so.
        </p>

        <h2>2. Your account</h2>
        <p>
          You are responsible for keeping your credentials confidential and for
          all activity under your account. Notify us immediately at{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a> if you suspect
          unauthorized access.
        </p>

        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Violate any applicable law or third-party right.</li>
          <li>
            Use {companyName} to send spam, malware, phishing, or harmful
            content.
          </li>
          <li>
            Attempt to gain unauthorized access to our systems or other users&rsquo;
            accounts.
          </li>
          <li>
            Reverse engineer, scrape, or systematically extract data except via
            our public APIs.
          </li>
          <li>
            Use {companyName} to process data in ways that violate India&rsquo;s
            Digital Personal Data Protection Act, 2023.
          </li>
        </ul>

        <h2>4. Your content</h2>
        <p>
          You retain ownership of all data and content you submit to{" "}
          {companyName} (&ldquo;Your Content&rdquo;). You grant us a
          worldwide, royalty-free licence to host, process, and display Your
          Content solely to provide the service. We do not claim ownership of
          Your Content.
        </p>

        <h2>5. Paid plans, billing &amp; taxes</h2>
        <ul>
          <li>
            Paid subscriptions are billed in advance on a monthly or annual
            cycle through Razorpay (INR) or Stripe (USD).
          </li>
          <li>
            Prices are inclusive of applicable GST in {jurisdiction} unless
            stated otherwise.
          </li>
          <li>
            Subscriptions auto-renew unless cancelled before the renewal date.
          </li>
          <li>
            We may change pricing with at least 30 days&rsquo; notice. Your
            existing billing cycle is not affected.
          </li>
        </ul>

        <h2>6. Cancellation &amp; refunds</h2>
        <p>
          You may cancel your subscription at any time from your account
          settings. Refunds are governed by our{" "}
          <a href="/refund">Refund Policy</a>.
        </p>

        <h2>7. Service availability</h2>
        <p>
          We aim for high availability but do not guarantee uninterrupted
          service. Scheduled maintenance and unplanned outages may occur. We
          are not liable for losses arising from service interruptions beyond
          our reasonable control.
        </p>

        <h2>8. Intellectual property</h2>
        <p>
          {companyName}, its logo, design, and underlying code are owned by us
          or our licensors. You may not copy, modify, or redistribute them
          except as permitted by these Terms or applicable law.
        </p>

        <h2>9. Third-party services</h2>
        <p>
          {companyName} may integrate with third-party services (payment
          gateways, email providers, analytics, etc.). Your use of those
          services is also governed by their respective terms and we are not
          responsible for them.
        </p>

        <h2>10. Disclaimer of warranties</h2>
        <p>
          To the maximum extent permitted by law, {companyName} is provided
          &ldquo;as is&rdquo; without warranties of any kind, express or
          implied, including merchantability, fitness for a particular purpose,
          and non-infringement.
        </p>

        <h2>11. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, our aggregate liability for
          any claim arising out of these Terms or your use of {companyName}{" "}
          will not exceed the greater of (a) the fees you paid us in the 12
          months preceding the claim, or (b) ₹10,000.
        </p>

        <h2>12. Indemnity</h2>
        <p>
          You agree to indemnify and hold us harmless from any claim arising
          out of your breach of these Terms, your misuse of {companyName}, or
          your violation of any law or third-party right.
        </p>

        <h2>13. Termination</h2>
        <p>
          We may suspend or terminate your account if you breach these Terms,
          if your use creates risk for other users, or as required by law. You
          may close your account at any time. On termination, we will delete
          your data per our <a href="/privacy">Privacy Policy</a>.
        </p>

        <h2>14. Governing law &amp; disputes</h2>
        <p>
          These Terms are governed by the laws of {jurisdiction}. Disputes will
          be resolved exclusively in the courts of {courtsOfJurisdiction}, save
          that we may seek injunctive relief in any competent jurisdiction.
        </p>

        <h2>15. Grievance officer</h2>
        <p>
          As required under the IT Rules, 2021, you may reach our grievance
          officer at{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a> with any
          complaint regarding the service. We will acknowledge within 24 hours
          and resolve within 15 days.
        </p>

        <h2>16. Changes to these Terms</h2>
        <p>
          We may update these Terms periodically. Material changes will be
          notified via email or an in-app notice at least 14 days before they
          take effect. Continued use after that date constitutes acceptance.
        </p>

        <h2>17. Contact</h2>
        <p>
          Questions about these Terms?{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </section>
    </article>
  );
}

export default TermsPage;
