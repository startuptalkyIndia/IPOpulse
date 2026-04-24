import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — IPOpulse",
  description: "How IPOpulse collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <p className="text-xs text-gray-500 mb-6">Last updated: April 2026</p>

      <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">What we collect</h2>
          <p>Only what we need to operate the service:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Account information</strong>: email, optional name, password (stored as bcrypt hash).</li>
            <li><strong>Activity you create</strong>: watchlist items, IPO applications you track.</li>
            <li><strong>Newsletter subscription</strong>: email + preferences if you subscribe.</li>
            <li><strong>Technical</strong>: IP, browser, and pages visited — for security and analytics.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">What we don't collect</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>PAN, Aadhaar, bank details, demat account numbers.</li>
            <li>Financial portfolio data from third parties unless you explicitly link it (we don't have this feature yet).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">How we use it</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>To provide the features you signed up for (watchlist, alerts, application tracking).</li>
            <li>To send you the daily/weekly email digest if you subscribed.</li>
            <li>To improve the product via aggregated, anonymized analytics.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Sharing</h2>
          <p>We don't sell your data. We share:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>With email delivery partner (Resend) when we send you digests or alerts.</li>
            <li>With analytics (Google Analytics) — anonymized.</li>
            <li>When legally required (subpoena, court order, SEBI/RBI directive).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Your rights</h2>
          <p>You can email us at hello@ipopulse.talkytools.com to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Export your data</li>
            <li>Delete your account</li>
            <li>Correct any information we hold</li>
            <li>Unsubscribe from any email</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Data retention</h2>
          <p>We keep account data as long as your account is active. Deleted accounts are purged within 30 days. Newsletter subscriptions delete immediately on unsubscribe.</p>
        </section>
      </div>
    </div>
  );
}
