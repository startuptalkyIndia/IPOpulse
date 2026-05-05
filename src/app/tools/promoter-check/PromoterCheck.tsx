"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, AlertTriangle, Building, Gavel, Users } from "lucide-react";

interface Result {
  summary: string;
  priorVentures?: { name: string; role: string; outcome: string }[];
  controversies?: { headline: string; year?: string; severity: "minor" | "moderate" | "serious"; details: string }[];
  regulatory?: { agency: string; matter: string; year?: string; status: string }[];
  relatedParties?: string[];
  greenFlags?: string[];
  redFlags?: string[];
  confidence: "high" | "medium" | "low";
}

export function PromoterCheck({ enabled }: { enabled: boolean }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!enabled || !name.trim()) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/promoter/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed");
      setResult(body.result);
      setDisclaimer(body.disclaimer ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setLoading(false);
    }
  }

  const sevColor = (s: "minor" | "moderate" | "serious") =>
    s === "serious" ? "bg-red-100 text-red-700 border-red-200" : s === "moderate" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-yellow-100 text-yellow-700 border-yellow-200";

  return (
    <div className="space-y-4">
      <form onSubmit={check} className="card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">Promoter / founder name</label>
            <input className="input w-full" placeholder="e.g. Vijay Shekhar Sharma" value={name} onChange={(e) => setName(e.target.value)} disabled={!enabled || loading} />
          </div>
          <div>
            <label className="label">Current company (optional)</label>
            <input className="input w-full" placeholder="e.g. Paytm" value={company} onChange={(e) => setCompany(e.target.value)} disabled={!enabled || loading} />
          </div>
        </div>
        <button type="submit" className="btn-primary inline-flex items-center gap-1.5" disabled={!enabled || loading || !name.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Run check
        </button>
      </form>

      {!enabled ? (
        <div className="card bg-yellow-50 border-yellow-200 text-xs text-yellow-800">
          <span className="font-semibold">AI is not enabled yet</span> — set ANTHROPIC_API_KEY on the server to switch this on.
        </div>
      ) : null}

      {error ? <div className="card bg-red-50 border-red-200 text-sm text-red-700">{error}</div> : null}

      {result ? (
        <div className="space-y-4">
          {/* Summary + confidence */}
          <div className="card">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-900">Summary</h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${result.confidence === "high" ? "bg-green-100 text-green-700" : result.confidence === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                Confidence: {result.confidence}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
          </div>

          {/* Prior ventures */}
          {result.priorVentures && result.priorVentures.length > 0 ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><Building className="w-4 h-4 text-indigo-600" /> Prior ventures</h3>
              <div className="space-y-2.5">
                {result.priorVentures.map((v, i) => (
                  <div key={i} className="border-l-4 border-indigo-200 pl-3">
                    <div className="text-sm font-semibold text-gray-900">{v.name} <span className="font-normal text-xs text-gray-500">— {v.role}</span></div>
                    <div className="text-xs text-gray-600 mt-0.5">{v.outcome}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Regulatory */}
          {result.regulatory && result.regulatory.length > 0 ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><Gavel className="w-4 h-4 text-orange-600" /> Regulatory matters</h3>
              <div className="space-y-2">
                {result.regulatory.map((r, i) => (
                  <div key={i} className="text-sm border-l-4 border-orange-200 pl-3">
                    <div className="font-semibold text-gray-900">{r.agency}{r.year ? ` · ${r.year}` : ""}</div>
                    <div className="text-xs text-gray-600">{r.matter}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Status: {r.status}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Controversies */}
          {result.controversies && result.controversies.length > 0 ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-600" /> Controversies</h3>
              <div className="space-y-2">
                {result.controversies.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${sevColor(c.severity)}`}>{c.severity}</span>
                      <h4 className="text-sm font-semibold text-gray-900">{c.headline} {c.year ? <span className="text-xs font-normal text-gray-500">({c.year})</span> : null}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{c.details}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Green / Red flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.greenFlags && result.greenFlags.length > 0 ? (
              <div className="card bg-green-50 border-green-200">
                <h3 className="text-sm font-semibold text-green-900 mb-2">Green flags</h3>
                <ul className="space-y-1.5 text-xs text-green-900 list-disc pl-5">
                  {result.greenFlags.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            ) : null}
            {result.redFlags && result.redFlags.length > 0 ? (
              <div className="card bg-red-50 border-red-200">
                <h3 className="text-sm font-semibold text-red-900 mb-2">Red flags</h3>
                <ul className="space-y-1.5 text-xs text-red-900 list-disc pl-5">
                  {result.redFlags.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Related parties */}
          {result.relatedParties && result.relatedParties.length > 0 ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-purple-600" /> Notable related parties</h3>
              <ul className="text-xs text-gray-700 list-disc pl-5 space-y-1">
                {result.relatedParties.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          ) : null}

          {disclaimer ? (
            <p className="text-[11px] text-gray-500 italic">{disclaimer}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
