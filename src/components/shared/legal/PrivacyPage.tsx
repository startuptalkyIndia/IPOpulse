// Source: _shared/templates/components/legal/PrivacyPage.tsx — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/components/legal/PrivacyPage.tsx
// Real, readable Privacy Policy for TalkyTools products.
// India DPDP Act 2023 + EU GDPR aware. Not legal advice — but a solid baseline.
//
// Copy to: src/components/legal/PrivacyPage.tsx
// Use in: src/app/privacy/page.tsx → <PrivacyPage companyName="BillForge" ... />

import * as React from "react";

export interface PrivacyPageProps {
  /** Product / company name shown in headings (e.g. "BillForge"). */
  companyName: string;
  /** Contact email for privacy queries. */
  contactEmail: string;
  /** Primary jurisdiction. Default "India". */
  jurisdiction?: string;
  /** Registered business legal entity (e.g. "Startuptalky Media Pvt Ltd"). */
  legalEntity?: string;
  /** ISO date string of last update. Defaults to today. */
  lastUpdated?: string;
  /** Optional product domain (e.g. "billforge.talkytools.com"). */
  domain?: string;
}

/**
 * PrivacyPage — drop-in Privacy Policy component.
 *
 * @example
 *   <PrivacyPage
 *     companyName="BillForge"
 *     contactEmail="privacy@talkytools.com"
 *     domain="billforge.talkytools.com"
 *   />
 */
export function PrivacyPage({
  companyName,
  contactEmail,
  jurisdiction = "India",
  legalEntity = "the TalkyTools team",
  lastUpdated,
  domain,
}: PrivacyPageProps) {
  const date =
    lastUpdated ??
    new Date().toISOString().slice(0, 10);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {companyName}
          {domain ? ` (${domain})` : ""} · Last updated {date}
        </p>
      </header>

      <section className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-a:text-indigo-600">
        <p>
          This Privacy Policy explains how {legalEntity} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, &ldquo;{companyName}&rdquo;) collects, uses, and
          protects your personal data when you use {companyName}. It applies to
          all visitors and account holders. We are committed to handling your
          data lawfully and minimally.
        </p>

        <h2>1. Information we collect</h2>
        <ul>
          <li>
            <strong>Account data</strong> — name, email, password hash, and
            optional profile details you provide.
          </li>
          <li>
            <strong>Usage data</strong> — pages visited, features used, device
            and browser metadata, and approximate location derived from IP.
          </li>
          <li>
            <strong>Content you submit</strong> — forms, files, messages, and
            other data you actively enter into {companyName}.
          </li>
          <li>
            <strong>Billing data</strong> — handled by our payment processors
            (Razorpay for INR, Stripe for USD). We never see or store your full
            card number.
          </li>
          <li>
            <strong>Cookies</strong> — strictly necessary cookies for login and
            CSRF protection; optional analytics cookies only with your consent.
          </li>
        </ul>

        <h2>2. How we use your information</h2>
        <ul>
          <li>To provide, maintain, and improve {companyName}.</li>
          <li>To authenticate you and keep your account secure.</li>
          <li>
            To process payments and send transactional emails (receipts,
            password resets, security alerts).
          </li>
          <li>
            To detect abuse, fraud, and violations of our Terms of Service.
          </li>
          <li>
            To comply with legal obligations under the laws of {jurisdiction}.
          </li>
        </ul>

        <h2>3. Legal basis (GDPR / DPDP Act)</h2>
        <p>
          We process your personal data on one of the following bases:
          performance of a contract with you, your consent (e.g. marketing
          emails), our legitimate interests (e.g. fraud prevention), or
          compliance with a legal obligation. Under India&rsquo;s Digital
          Personal Data Protection Act, 2023, you are a &ldquo;Data
          Principal&rdquo; and we are a &ldquo;Data Fiduciary&rdquo;.
        </p>

        <h2>4. Sharing &amp; sub-processors</h2>
        <p>
          We do not sell your personal data. We share it only with vetted
          sub-processors that help us operate {companyName}:
        </p>
        <ul>
          <li>AWS / cloud hosting — application + database hosting.</li>
          <li>Razorpay and Stripe — payment processing.</li>
          <li>Resend — transactional email delivery.</li>
          <li>
            Analytics providers — only if you have accepted analytics cookies.
          </li>
        </ul>
        <p>
          We may also disclose data when legally required (subpoena, court
          order) or to protect the safety of our users and the public.
        </p>

        <h2>5. Data retention</h2>
        <p>
          We retain account data for as long as your account is active, and for
          a reasonable period afterward to comply with tax, accounting, and
          legal obligations (typically up to 8 years for financial records in
          {" "}{jurisdiction}). You can request deletion at any time (see
          Section 7).
        </p>

        <h2>6. Security</h2>
        <p>
          We use HTTPS everywhere, hashed passwords (bcrypt / argon2),
          encryption at rest, principle-of-least-privilege access controls, and
          audit logging. No system is perfectly secure — please use a strong,
          unique password and enable two-factor authentication where offered.
        </p>

        <h2>7. Your rights</h2>
        <p>
          Depending on your jurisdiction, you have the right to:
        </p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Correct inaccurate data.</li>
          <li>Delete your account and associated data.</li>
          <li>Withdraw consent for optional processing.</li>
          <li>Port your data in a machine-readable format.</li>
          <li>
            Lodge a complaint with the Data Protection Board of India or your
            local supervisory authority.
          </li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We respond
          within 30 days.
        </p>

        <h2>8. Children</h2>
        <p>
          {companyName} is not directed at children under 18. We do not
          knowingly collect personal data from minors. If you believe we have,
          please contact us and we will delete it.
        </p>

        <h2>9. International transfers</h2>
        <p>
          Our infrastructure is primarily hosted in India (AWS Mumbai). Some
          sub-processors may transfer data to other jurisdictions; in those
          cases we rely on standard contractual clauses or equivalent
          safeguards.
        </p>

        <h2>10. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be announced via email or an in-app notice at least 14 days
          before they take effect.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions, requests, or complaints?{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </section>
    </article>
  );
}

export default PrivacyPage;
