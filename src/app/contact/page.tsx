import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact IPOpulse",
  description: "Get in touch with IPOpulse — feedback, data corrections, partnerships.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact</h1>
      <p className="text-sm text-gray-700 mb-6">
        Questions, data corrections, partnership requests — drop us a line.
      </p>
      <div className="card space-y-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</div>
          <a href="mailto:hello@ipopulse.talkytools.com" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            hello@ipopulse.talkytools.com
          </a>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Data corrections</div>
          <p className="text-sm text-gray-700">
            Spot something wrong in an IPO page, GMP entry, or financial data? Email us with the page URL and the
            correct value. We reply within 24 hours on weekdays.
          </p>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Partnerships</div>
          <p className="text-sm text-gray-700">
            Broker, registrar, credit card issuer, or financial content partner? Tell us what you're thinking.
          </p>
        </div>
      </div>
    </div>
  );
}
