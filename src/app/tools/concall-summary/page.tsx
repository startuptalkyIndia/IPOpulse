import type { Metadata } from "next";
import { ConcallSummarizer } from "./ConcallSummarizer";

export const metadata: Metadata = {
  title: "Earnings Concall AI Summary — instant 3-line takeaway",
  description:
    "Paste any Indian earnings concall transcript — get TL;DR, guidance changes, sentiment, key takeaways, red flags, and quoted numbers in 30 seconds.",
  alternates: { canonical: "/tools/concall-summary" },
};

export default function ConcallSummaryPage() {
  const aiEnabled = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Earnings Concall AI Summary</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Paste an earnings concall transcript (or copy-paste the relevant Q&A section) and get a structured
          analyst-grade summary: 3-line TL;DR, guidance changes, sentiment, key takeaways, red flags, and verbatim
          numbers quoted from management. Saves 45 minutes per call.
        </p>
      </div>

      <ConcallSummarizer enabled={aiEnabled} />

      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-2">How it works</h2>
        <ol className="text-sm text-gray-700 space-y-2 list-decimal pl-5">
          <li>Paste the concall transcript (any Indian equity — Reliance, HDFC, TCS, Maruti, anything).</li>
          <li>Optional: enter company name + quarter for slightly better citation.</li>
          <li>Click <strong>Summarize</strong>. Claude reads the call and returns structured JSON.</li>
          <li>Verify quoted numbers against the transcript before acting on them. AI is a research aid, not advice.</li>
        </ol>
      </section>

      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Tips for best results</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li><strong>Include the management commentary AND Q&A sections.</strong> Q&A is where guidance shifts surface.</li>
          <li>Strip away opening pleasantries and disclaimers — they pad the prompt without adding signal.</li>
          <li>For very long calls (&gt; 200K chars), split into two halves and run each separately.</li>
          <li>Source transcripts: AlphaStreet, BSE filings, company investor relations, or NSE corporate filings.</li>
        </ul>
      </section>
    </div>
  );
}
