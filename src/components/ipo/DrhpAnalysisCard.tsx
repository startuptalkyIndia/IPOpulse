import Link from "next/link";
import { AlertTriangle, ShieldAlert, Users2, FileWarning, Coins, BarChart3, Sparkles, Clock, RefreshCw, FileSearch } from "lucide-react";
import type { DrhpAnalysis } from "@/lib/drhp-analyzer";
import type { EnrichedPeer } from "@/lib/drhp-peer-enrichment";
import { RiskScoreBadge } from "./RiskScoreBadge";
import { EnrichedPeerTable } from "./EnrichedPeerTable";

/**
 * Server component. Renders the cached DRHP analysis inline on every IPO
 * page — no click required. The cron has already extracted this data;
 * we're just displaying. R29 vertical depth: page citations on every claim,
 * enriched peer comparison, synthesized risk score.
 */

interface Props {
  status: string;
  generatedBy: string | null;
  generatedAt: Date | null;
  sourceType: string;
  sourceUrl: string;
  tldr: string | null;
  issueDetails: DrhpAnalysis["issueDetails"] | null;
  useOfProceeds: DrhpAnalysis["useOfProceeds"] | null;
  riskFactors: DrhpAnalysis["riskFactors"] | null;
  governance: DrhpAnalysis["governance"] | null;
  relatedPartyTransactions: DrhpAnalysis["relatedPartyTransactions"] | null;
  contingentLiabilities: DrhpAnalysis["contingentLiabilities"] | null;
  peerComparables: DrhpAnalysis["peerComparables"] | null;
  enrichedPeers: EnrichedPeer[] | null;
  financialHighlights: DrhpAnalysis["financialHighlights"] | null;
  riskScore: number | null;
  riskBand: string | null;
  riskRationale: string[] | null;
  isAdmin?: boolean;
}

const sevColor = (s: "high" | "medium" | "low") =>
  s === "high"
    ? "bg-red-100 text-red-700 border-red-200"
    : s === "medium"
    ? "bg-orange-100 text-orange-700 border-orange-200"
    : "bg-yellow-100 text-yellow-700 border-yellow-200";

function fmtCr(v: number | null): string {
  if (v == null) return "—";
  if (v >= 100) return `₹${v.toFixed(0)} Cr`;
  return `₹${v.toFixed(1)} Cr`;
}

/** Convert "p. 47" or "p. 47-49" to a deep-link fragment for PDF viewers */
function pdfPageHash(pageRef: string | null | undefined): string {
  if (!pageRef) return "";
  const m = pageRef.match(/(\d+)/);
  if (!m) return "";
  return `#page=${m[1]}`;
}

function PageRef({ pageRef, sourceUrl }: { pageRef: string | null | undefined; sourceUrl: string }) {
  if (!pageRef) return null;
  const href = `${sourceUrl}${pdfPageHash(pageRef)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-[10px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline tabular-nums"
      title="Open the source PDF at this page"
    >
      <FileSearch className="w-2.5 h-2.5" />
      {pageRef}
    </a>
  );
}

export function DrhpAnalysisCard(props: Props) {
  if (props.status === "pending") {
    return (
      <section className="card border-indigo-200 bg-indigo-50/50">
        <div className="flex items-center gap-2 text-sm text-indigo-700">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="font-semibold">DRHP intelligence is being extracted…</span>
        </div>
        <p className="text-xs text-indigo-600 mt-1">
          Our AI is reading the prospectus right now. Risk factors, governance flags, related-party transactions
          and peer comparables will appear here on next refresh (typically under 90 seconds).
        </p>
      </section>
    );
  }

  if (props.status === "failed") {
    return props.isAdmin ? (
      <section className="card border-red-200 bg-red-50">
        <div className="text-sm text-red-700 font-semibold mb-1">DRHP analysis failed</div>
        <p className="text-xs text-red-600">
          Trigger a retry from <Link href="/sup-min/drhp" className="underline">/sup-min/drhp</Link>.
        </p>
      </section>
    ) : null;
  }

  if (props.status !== "ready" && props.status !== "stale") return null;

  const stale = props.status === "stale";

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">DRHP intelligence</h2>
          <span className="text-[10px] uppercase tracking-wide font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">AI</span>
          {stale ? <span className="text-[10px] uppercase font-bold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded inline-flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> refreshing</span> : null}
          {props.riskScore != null ? <RiskScoreBadge score={props.riskScore} band={props.riskBand} size="md" /> : null}
        </div>
        <a href={props.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1">
          Source: {props.sourceType} ↗
        </a>
      </div>

      {/* Risk score rationale — explainable */}
      {props.riskRationale && props.riskRationale.length > 0 ? (
        <div className="card bg-indigo-50/50 border-indigo-100">
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Why this risk score</div>
          <ul className="text-xs text-gray-700 list-disc pl-5 space-y-0.5">
            {props.riskRationale.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <p className="text-[10px] text-gray-500 mt-2">
            Score is synthesized from severity counts, governance flags, PAT trajectory, contingent liabilities, and
            related-party exposure. Not a buy/sell signal — a fast triage tool.
          </p>
        </div>
      ) : null}

      {/* TL;DR */}
      {props.tldr ? (
        <div className="card">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">TL;DR</div>
          <p className="text-sm text-gray-800 leading-relaxed">{props.tldr}</p>
        </div>
      ) : null}

      {/* Issue + use of proceeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {props.issueDetails ? (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><Coins className="w-4 h-4 text-indigo-600" /> Issue structure</h3>
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="font-medium text-gray-900 capitalize">{props.issueDetails.issueType}</dd></div>
              {props.issueDetails.freshIssueCr != null ? <div className="flex justify-between"><dt className="text-gray-500">Fresh issue</dt><dd className="font-medium text-gray-900 tabular-nums">{fmtCr(props.issueDetails.freshIssueCr)}</dd></div> : null}
              {props.issueDetails.ofsCr != null ? <div className="flex justify-between"><dt className="text-gray-500">OFS</dt><dd className="font-medium text-gray-900 tabular-nums">{fmtCr(props.issueDetails.ofsCr)}</dd></div> : null}
              {props.issueDetails.anchorPortionCr != null ? <div className="flex justify-between"><dt className="text-gray-500">Anchor portion</dt><dd className="font-medium text-gray-900 tabular-nums">{fmtCr(props.issueDetails.anchorPortionCr)}</dd></div> : null}
            </dl>
          </div>
        ) : null}

        {props.useOfProceeds && props.useOfProceeds.length > 0 ? (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><Coins className="w-4 h-4 text-green-600" /> Use of proceeds</h3>
            <ul className="text-sm space-y-2">
              {props.useOfProceeds.map((u, i) => (
                <li key={i}>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-700 flex-1">{u.purpose}</span>
                    <span className="font-medium text-gray-900 tabular-nums whitespace-nowrap">{fmtCr(u.amountCr)}{u.percent != null ? <span className="text-xs text-gray-500 ml-1">· {u.percent.toFixed(0)}%</span> : null}</span>
                  </div>
                  {u.pageRef ? <div className="text-right mt-0.5"><PageRef pageRef={u.pageRef} sourceUrl={props.sourceUrl} /></div> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Risk factors */}
      {props.riskFactors && props.riskFactors.length > 0 ? (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-600" /> Risk factors (top {props.riskFactors.length})</h3>
          <div className="space-y-3">
            {props.riskFactors.map((r, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${sevColor(r.severity)}`}>{r.severity}</span>
                  <h4 className="text-sm font-semibold text-gray-900">{r.headline}</h4>
                  <PageRef pageRef={r.pageRef} sourceUrl={props.sourceUrl} />
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Governance */}
      {props.governance && props.governance.length > 0 ? (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-orange-600" /> Governance flags (top {props.governance.length})</h3>
          <div className="space-y-3">
            {props.governance.map((g, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${sevColor(g.severity)}`}>{g.severity}</span>
                  <h4 className="text-sm font-semibold text-gray-900">{g.headline}</h4>
                  <PageRef pageRef={g.pageRef} sourceUrl={props.sourceUrl} />
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{g.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Related party + Contingent liabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {props.relatedPartyTransactions && props.relatedPartyTransactions.length > 0 ? (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><Users2 className="w-4 h-4 text-purple-600" /> Related-party transactions</h3>
            <div className="space-y-2 text-xs">
              {props.relatedPartyTransactions.map((rpt, i) => (
                <div key={i} className="border-l-4 border-purple-200 pl-3">
                  <div className="font-semibold text-gray-900">
                    {rpt.party} <span className="font-normal text-[11px] text-gray-500">— {rpt.relationship}</span>
                    {rpt.pageRef ? <span className="ml-2"><PageRef pageRef={rpt.pageRef} sourceUrl={props.sourceUrl} /></span> : null}
                  </div>
                  <div className="text-gray-600 mt-0.5">{rpt.nature} {rpt.amountCr != null ? <span className="font-medium text-gray-900">· {fmtCr(rpt.amountCr)}</span> : null}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {props.contingentLiabilities && props.contingentLiabilities.length > 0 ? (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1.5"><FileWarning className="w-4 h-4 text-yellow-600" /> Contingent liabilities</h3>
            <div className="space-y-2 text-xs">
              {props.contingentLiabilities.map((c, i) => (
                <div key={i} className="border-l-4 border-yellow-200 pl-3">
                  <div className="text-gray-700 flex justify-between gap-2">
                    <span>{c.description}</span>
                    {c.pageRef ? <PageRef pageRef={c.pageRef} sourceUrl={props.sourceUrl} /> : null}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {c.amountCr != null ? <span className="font-medium text-gray-900">{fmtCr(c.amountCr)} · </span> : null}
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Financials */}
      {props.financialHighlights && (props.financialHighlights.revenue.length > 0 || props.financialHighlights.pat.length > 0) ? (
        <div className="card">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 inline-flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-indigo-600" /> Financial highlights</h3>
            <PageRef pageRef={props.financialHighlights.pageRef ?? null} sourceUrl={props.sourceUrl} />
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 text-left"><th className="py-1.5 pr-3"></th>{props.financialHighlights.revenue.map((r) => <th key={r.year} className="py-1.5 pr-2 text-right">{r.year}</th>)}</tr></thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="py-1.5 pr-3 text-gray-700">Revenue (Cr)</td>
                {props.financialHighlights.revenue.map((r, i) => <td key={i} className="py-1.5 pr-2 text-right tabular-nums font-medium text-gray-900">{r.valueCr != null ? r.valueCr.toFixed(0) : "—"}</td>)}
              </tr>
              <tr className="border-t border-gray-100">
                <td className="py-1.5 pr-3 text-gray-700">EBITDA (Cr)</td>
                {props.financialHighlights.ebitda.map((r, i) => <td key={i} className="py-1.5 pr-2 text-right tabular-nums font-medium text-gray-900">{r.valueCr != null ? r.valueCr.toFixed(0) : "—"}</td>)}
              </tr>
              <tr className="border-t border-gray-100">
                <td className="py-1.5 pr-3 text-gray-700">PAT (Cr)</td>
                {props.financialHighlights.pat.map((r, i) => <td key={i} className="py-1.5 pr-2 text-right tabular-nums font-medium text-gray-900">{r.valueCr != null ? r.valueCr.toFixed(0) : "—"}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Enriched peer comparison — uses our companies DB */}
      {props.enrichedPeers && props.enrichedPeers.length > 0 ? (
        <EnrichedPeerTable peers={props.enrichedPeers} />
      ) : null}

      {/* Footer */}
      <p className="text-[11px] text-gray-400 inline-flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        Generated {props.generatedAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(props.generatedAt) : "—"} by {props.generatedBy ?? "AI"}.
        Page citations link directly into the {props.sourceType}. Verify before any decision.
      </p>
    </section>
  );
}
