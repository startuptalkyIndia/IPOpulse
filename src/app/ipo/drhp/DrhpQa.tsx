"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export function DrhpQa({ enabled }: { enabled: boolean }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setError(null);
    setAnswer(null);
    setLoading(true);
    try {
      const res = await fetch("/api/drhp/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed");
      setAnswer(body.answer ?? "No answer returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ask failed");
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "Which 2026 DRHPs mention quick commerce?",
    "Summarize the risk factors from the latest DRHP",
    "Which companies raised capital in the last quarter and for what?",
    "Compare use of proceeds across recent tech IPOs",
  ];

  return (
    <div className="card">
      <form onSubmit={ask} className="flex gap-2">
        <input
          type="text"
          className="input flex-1"
          placeholder="Ask about any IPO prospectus..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={!enabled || loading}
        />
        <button type="submit" className="btn-primary flex items-center gap-1" disabled={!enabled || loading || !question.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Ask
        </button>
      </form>

      {error ? <div className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div> : null}

      {answer ? (
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
          <div className="text-xs text-indigo-700 uppercase font-semibold mb-2">Answer</div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</p>
        </div>
      ) : null}

      {!answer && !loading ? (
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">Try:</div>
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
