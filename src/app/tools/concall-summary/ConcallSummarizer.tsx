"use client";

import { useState } from "react";
import { Loader2, Sparkles, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Summary {
  tldr: string;
  sentiment: "bullish" | "neutral" | "bearish";
  guidance: "raised" | "reaffirmed" | "lowered" | "withdrawn" | "not-given";
  keyTakeaways: string[];
  redFlags: string[];
  numbers: { metric: string; value: string; vsLast: string }[];
  quotedFromManagement: string[];
}

export function ConcallSummarizer({ enabled }: { enabled: boolean }) {
  const [transcript, setTranscript] = useState("");
  const [company, setCompany] = useState("");
  const [quarter, setQuarter] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function summarize(e: React.FormEvent) {
    e.preventDefault();
    if (!enabled || transcript.trim().length < 200) return;
    setError(null);
    setSummary(null);
    setLoading(true);
    try {
      const res = await fetch("/api/concall/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, company, quarter }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to summarize");
      setSummary(body.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summarize failed");
    } finally {
      setLoading(false);
    }
  }

  const sentimentIcon = summary?.sentiment === "bullish" ? <TrendingUp className="w-4 h-4 text-green-600" /> : summary?.sentiment === "bearish" ? <TrendingDown className="w-4 h-4 text-red-600" /> : <Minus className="w-4 h-4 text-gray-500" />;
  const sentimentColor = summary?.sentiment === "bullish" ? "bg-green-50 text-green-700 border-green-200" : summary?.sentiment === "bearish" ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 text-gray-700 border-gray-200";
  const guidanceColor = summary?.guidance === "raised" ? "bg-green-100 text-green-700" : summary?.guidance === "lowered" || summary?.guidance === "withdrawn" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700";

  return (
    <div className="space-y-4">
      <form onSubmit={summarize} className="card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">Company (optional)</label>
            <input className="input w-full" placeholder="e.g. Reliance Industries" value={company} onChange={(e) => setCompany(e.target.value)} disabled={!enabled || loading} />
          </div>
          <div>
            <label className="label">Quarter (optional)</label>
            <input className="input w-full" placeholder="e.g. Q4 FY25" value={quarter} onChange={(e) => setQuarter(e.target.value)} disabled={!enabled || loading} />
          </div>
        </div>
        <div>
          <label className="label">Transcript</label>
          <textarea
            className="input w-full font-mono text-xs"
            rows={10}
            placeholder="Paste the full earnings concall transcript here. Include both management commentary and the Q&A section for best results..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={!enabled || loading}
          />
          <div className="text-[11px] text-gray-500 mt-1">{transcript.length.toLocaleString()} chars · min 200 · max 200,000</div>
        </div>
        <button type="submit" className="btn-primary inline-flex items-center gap-1.5" disabled={!enabled || loading || transcript.trim().length < 200}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Summarize
        </button>
      </form>

      {!enabled ? (
        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-xs text-yellow-800">
            <span className="font-semibold">Concall AI is waiting on configuration.</span> Set ANTHROPIC_API_KEY on the server and this works instantly.
          </p>
        </div>
      ) : null}

      {error ? <div className="card bg-red-50 border-red-200 text-sm text-red-700">{error}</div> : null}

      {summary ? (
        <div className="space-y-4">
          {/* TL;DR + Sentiment + Guidance */}
          <div className="card">
            <div className="flex items-start gap-3 mb-3">
              <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 ${sentimentColor}`}>
                {sentimentIcon} {summary.sentiment}
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${guidanceColor}`}>
                Guidance: {summary.guidance}
              </div>
            </div>
            <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">TL;DR</h3>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{summary.tldr}</p>
          </div>

          {/* Key takeaways */}
          {summary.keyTakeaways && summary.keyTakeaways.length > 0 ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Key takeaways</h3>
              <ul className="space-y-1.5 text-sm text-gray-700 list-disc pl-5">
                {summary.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ) : null}

          {/* Red flags */}
          {summary.redFlags && summary.redFlags.length > 0 ? (
            <div className="card bg-red-50 border-red-200">
              <h3 className="text-sm font-semibold text-red-800 mb-2 inline-flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Red flags</h3>
              <ul className="space-y-1.5 text-sm text-red-900 list-disc pl-5">
                {summary.redFlags.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ) : null}

          {/* Numbers */}
          {summary.numbers && summary.numbers.length > 0 ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Numbers cited by management</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-500 text-left"><th className="py-1.5 pr-3">Metric</th><th className="py-1.5 pr-3">Value</th><th className="py-1.5">vs prior</th></tr></thead>
                  <tbody>
                    {summary.numbers.map((n, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-1.5 pr-3 text-gray-700">{n.metric}</td>
                        <td className="py-1.5 pr-3 font-semibold text-gray-900">{n.value}</td>
                        <td className="py-1.5 text-gray-600">{n.vsLast}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* Quotes */}
          {summary.quotedFromManagement && summary.quotedFromManagement.length > 0 ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Verbatim from management</h3>
              <div className="space-y-2.5">
                {summary.quotedFromManagement.map((q, i) => (
                  <blockquote key={i} className="text-sm text-gray-700 italic border-l-4 border-indigo-200 pl-3">"{q}"</blockquote>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
