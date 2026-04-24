import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About IPOpulse",
  description: "IPOpulse is India's structured IPO, stock & market data hub — built for retail investors who want facts, not noise.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">About IPOpulse</h1>
      <p className="text-gray-700 leading-relaxed mb-4">
        IPOpulse is India's structured market data hub — every IPO, every stock, every number, in one clean dashboard.
        Built for retail investors who want facts, not blog fluff.
      </p>
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">What we do</h2>
      <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
        <li>Real-time tracking of every mainboard and SME IPO in India — GMP, subscription, allotment, listing performance.</li>
        <li>20+ free financial calculators covering investing, loans, taxes, and trading costs.</li>
        <li>Super Investor portfolio tracker across India's top individual investors.</li>
        <li>Daily FII/DII flow dashboard with sector-wise breakdown.</li>
        <li>Honest GMP accuracy scorecard — because nobody else publishes how wrong GMP usually is.</li>
      </ul>
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Our principles</h2>
      <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
        <li><span className="font-semibold">Structured over narrative.</span> Everything is a table, card, or dashboard — not prose.</li>
        <li><span className="font-semibold">Mobile-first, ad-light.</span> No pop-ups, no interstitials, no anxiety.</li>
        <li><span className="font-semibold">Transparent sources.</span> Every number tells you where it came from.</li>
        <li><span className="font-semibold">Free as default.</span> Paid features only if they genuinely warrant it.</li>
      </ul>
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">Contact</h2>
      <p className="text-sm text-gray-700">
        Reach us at <Link href="/contact" className="text-indigo-600 hover:text-indigo-800">the contact page</Link>.
      </p>
    </div>
  );
}
