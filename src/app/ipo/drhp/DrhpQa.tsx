"use client";

import { useState } from "react";
import { Send, Loader2, FileSearch, Library } from "lucide-react";

interface IpoOption {
  slug: string;
  name: string;
}

export function DrhpQa({ enabled, ipos = [] }: { enabled: boolean; ipos?: IpoOption[] }) {
  const [mode, setMode] = useState<"corpus" | "single">("corpus");
  const [slug, setSlug] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    if (mode === "single" && !slug) {
      setError("Pick an IPO from the dropdown first");
      return;
    }
    setError(null);
    setAnswer(null);
    setSourceUrl(null);
    setSourceType(null);
    setLoading(true);
    try {
      const endpoint = mode === "single" ? "/api/drhp/analyze" : "/api/drhp/ask";
      const payload = mode === "single" ? { slug, question } : { question };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed");
      setAnswer(body.answer ?? "No answer returned");
      if (body.source) setSourceUrl(body.source);
      if (body.sourceType) setSourceType(body.sourceType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ask failed");
    } finally {
      setLoading(false);
    }
  }

  const corpusSuggestions = [
    "Which 2026 DRHPs mention quick commerce?",
    "Summarize the risk factors from the latest DRHP",
    "Which companies raised capital in the last quarter and for what?",
    "Compare use of proceeds across recent tech IPOs",
  ];

  const singleSuggestions = [
    "What is the revenue concentration risk?",
    "List the top 5 risk factors with one-line explanations",
    "How are the IPO proceeds being used? Break it down by purpose.",
    "What's the EBITDA trajectory across the last 3 fiscal years?",
    "Are there any related-party transactions worth flagging?",
  ];

  const suggestions = mode === "single" ? singleSuggestions : corpusSuggestions;

  return (
    <div className="card">
      {/* Mode toggle */}
      <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => { setMode("corpus"); setAnswer(null); setError(null); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition ${mode === "corpus" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
        >
          <Library className="w-3.5 h-3.5" /> Across all DRHPs
        </button>
        <button
          type="button"
          onClick={() => { setMode("single"); setAnswer(null); setError(null); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition ${mode === "single" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
          disabled={ipos.length === 0}
        >
          <FileSearch className="w-3.5 h-3.5" /> Deep-dive on one DRHP
        </button>
      </div>

      <form onSubmit={ask} className="flex flex-col gap-2">
        {mode === "single" ? (
          <select
            className="input w-full"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={!enabled || loading || ipos.length === 0}
          >
            <option value="">— Pick an IPO with a DRHP/RHP —</option>
            {ipos.map((i) => (
              <option key={i.slug} value={i.slug}>{i.name}</option>
            ))}
          </select>
        ) : null}

        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder={mode === "single" ? "Ask a specific question about this DRHP..." : "Ask about any IPO prospectus..."}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!enabled || loading}
          />
          <button type="submit" className="btn-primary flex items-center gap-1" disabled={!enabled || loading || !question.trim() || (mode === "single" && !slug)}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ask
          </button>
        </div>
      </form>

      {error ? <div className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div> : null}

      {answer ? (
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <div className="text-xs text-indigo-700 uppercase font-semibold">Answer</div>
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-600 hover:underline"
              >
                Source: {sourceType ?? "PDF"} ↗
              </a>
            ) : null}
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</p>
        </div>
      ) : null}

      {!answer && !loading ? (
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">{mode === "single" ? "Try (about the picked IPO):" : "Try:"}</div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuestion(s)}
                className="text-[11px] bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 px-2.5 py-1 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
