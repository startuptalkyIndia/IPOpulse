import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — IPOpulse",
  description: "Terms governing use of IPOpulse.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
      <p className="text-xs text-gray-500 mb-6">Last updated: April 2026</p>

      <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Not investment advice</h2>
          <p>
            IPOpulse provides market data, research tools, and calculators. Nothing on this site is investment advice,
            a recommendation to buy or sell any security, or a substitute for professional financial guidance. You
            are solely responsible for your investment decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">GMP disclaimer</h2>
          <p>
            Grey Market Premium (GMP) is sourced from unofficial dealers and is indicative only. GMP is not an
            official metric regulated by SEBI, NSE, or BSE. Actual listing prices may differ significantly from GMP
            predictions — our GMP Accuracy page documents this explicitly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Data accuracy</h2>
          <p>
            We source data from BSE, NSE, SEBI, NSDL, AMFI, and manual curation. Despite best efforts, data may
            occasionally be delayed, missing, or incorrect. Always verify critical numbers with the official source
            (exchange filing, registrar, or issuer) before acting on them.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Affiliate disclosure</h2>
          <p>
            Some links on this site (particularly on Compare pages) are affiliate links. If you open a broker account
            or apply for a credit card through these links, IPOpulse may earn a commission at no additional cost to you.
            This helps us keep the service free. We never rank or recommend a product based on affiliate payout alone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Acceptable use</h2>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>No scraping of our pages at scale without permission.</li>
            <li>No reverse-engineering our calculators or re-publishing our data without attribution.</li>
            <li>No creating multiple accounts to circumvent limits.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Changes</h2>
          <p>We may update these terms. Material changes are announced on the homepage. Continued use after changes constitutes acceptance.</p>
        </section>
      </div>
    </div>
  );
}
