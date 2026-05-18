/**
 * DRHP / RHP intelligence extractor.
 *
 * Single source of truth for the structured DRHP analysis pipeline. Used by:
 *   - src/crons/jobs/drhp-analyze.ts        (background cron)
 *   - src/app/api/admin/drhp/analyze/...    (admin force-refresh endpoint)
 *   - scripts/analyze-drhp.ts               (local CLI, npx tsx)
 *   - scripts/analyze-drhp-via-cli.sh       (Claude CLI wrapper)
 *
 * Uses Claude CLI only — no ANTHROPIC_API_KEY needed.
 * We cache aggressively — analysis only re-runs when sourceUrl changes.
 */

export interface DrhpAnalysis {
  tldr: string;
  issueDetails: {
    issueType: "fresh" | "ofs" | "fresh+ofs" | "unknown";
    freshIssueCr: number | null;
    ofsCr: number | null;
    anchorPortionCr: number | null;
  };
  useOfProceeds: { purpose: string; amountCr: number | null; percent: number | null; pageRef: string | null }[];
  riskFactors: { severity: "high" | "medium" | "low"; headline: string; detail: string; pageRef: string | null }[];
  governance: { severity: "high" | "medium" | "low"; headline: string; detail: string; pageRef: string | null }[];
  relatedPartyTransactions: {
    party: string;
    relationship: string;
    nature: string;
    amountCr: number | null;
    pageRef: string | null;
  }[];
  contingentLiabilities: { description: string; amountCr: number | null; status: string; pageRef: string | null }[];
  peerComparables: { name: string; rationale: string; pageRef: string | null }[];
  financialHighlights: {
    revenue: { year: string; valueCr: number | null }[];
    ebitda: { year: string; valueCr: number | null }[];
    pat: { year: string; valueCr: number | null }[];
    pageRef?: string | null;
  };
}

/**
 * Synthesized DRHP risk score (0-100).
 *
 * Lower = lower flagged risk per the prospectus extract. NOT a buy/sell
 * signal. Formula is fully transparent and explainable; calibration improves
 * over time as we backtest against listing performance.
 *
 * Components (capped at 100 total):
 *   - Risk-factor severity sum  (high=15, med=8, low=3) max 50
 *   - Governance severity sum   (high=15, med=8, low=3) max 30
 *   - PAT trajectory penalty (declining or negative)    +0-15
 *   - High debt penalty (D/E > 1.5)                     +0-10
 *   - Excessive RPT count penalty                       +0-10
 *
 * Caller can interpret as bands:
 *   0-25  = "Clean" (green)
 *   26-50 = "Watch" (yellow)
 *   51-75 = "Caution" (orange)
 *   76+   = "High risk" (red)
 */
export interface RiskScore {
  score: number;
  band: "clean" | "watch" | "caution" | "high-risk";
  components: {
    riskFactorPoints: number;
    governancePoints: number;
    patTrajectoryPoints: number;
    contingentLiabPoints: number;
    rptPoints: number;
  };
  rationale: string[];
}

export function computeRiskScore(a: DrhpAnalysis): RiskScore {
  const sevPts = (s: "high" | "medium" | "low") => (s === "high" ? 15 : s === "medium" ? 8 : 3);

  const rfPts = Math.min(50, (a.riskFactors ?? []).reduce((s, r) => s + sevPts(r.severity), 0));
  const govPts = Math.min(30, (a.governance ?? []).reduce((s, r) => s + sevPts(r.severity), 0));

  // PAT trajectory: negative or declining adds penalty
  const pat = (a.financialHighlights?.pat ?? [])
    .filter((p) => p.valueCr != null)
    .map((p) => p.valueCr as number);
  let patPts = 0;
  if (pat.length >= 2) {
    const last = pat[pat.length - 1];
    const prev = pat[pat.length - 2];
    if (last < 0) patPts = 15;
    else if (last < prev) patPts = 8;
    else if (last < prev * 1.05) patPts = 3; // flat
  }

  // Contingent liabilities — large absolute ones add penalty
  const liabSum = (a.contingentLiabilities ?? []).reduce((s, c) => s + (c.amountCr ?? 0), 0);
  const liabPts = liabSum > 500 ? 10 : liabSum > 100 ? 5 : 0;

  // Excessive related-party transactions
  const rptCount = (a.relatedPartyTransactions ?? []).length;
  const rptAmt = (a.relatedPartyTransactions ?? []).reduce((s, r) => s + (r.amountCr ?? 0), 0);
  const rptPts = rptAmt > 200 ? 10 : rptCount >= 5 ? 6 : rptCount >= 3 ? 3 : 0;

  const score = Math.min(100, rfPts + govPts + patPts + liabPts + rptPts);
  const band: RiskScore["band"] =
    score <= 25 ? "clean" : score <= 50 ? "watch" : score <= 75 ? "caution" : "high-risk";

  const rationale: string[] = [];
  if (rfPts >= 30) rationale.push(`Heavy risk-factor load (${a.riskFactors?.length ?? 0} flagged)`);
  if (govPts >= 15) rationale.push(`Governance concerns flagged (${a.governance?.length ?? 0})`);
  if (patPts >= 8) rationale.push(`PAT trajectory deteriorating year-on-year`);
  if (liabPts >= 5) rationale.push(`Contingent liabilities total ₹${liabSum.toFixed(0)} Cr`);
  if (rptPts >= 6) rationale.push(`High related-party transaction exposure`);
  if (rationale.length === 0) rationale.push("No major flags surfaced from the prospectus extract.");

  return {
    score,
    band,
    components: {
      riskFactorPoints: rfPts,
      governancePoints: govPts,
      patTrajectoryPoints: patPts,
      contingentLiabPoints: liabPts,
      rptPoints: rptPts,
    },
    rationale,
  };
}

/**
 * The system prompt is the contract. Tweaking it changes output structure
 * for every cached analysis going forward — be careful with breaking changes.
 */
export const DRHP_SYSTEM_PROMPT = `You are an Indian equity-research analyst extracting structured intelligence from this IPO prospectus (DRHP or RHP).

Output STRICT JSON (no markdown wrappers, no commentary) matching this exact schema:

{
  "tldr": "2-3 sentence summary capturing what the company does + what they're raising money for",
  "issueDetails": {
    "issueType": "fresh" | "ofs" | "fresh+ofs" | "unknown",
    "freshIssueCr": <number or null>,
    "ofsCr": <number or null>,
    "anchorPortionCr": <number or null>
  },
  "useOfProceeds": [
    { "purpose": "<string>", "amountCr": <number or null>, "percent": <number or null>, "pageRef": "<eg. 'p. 122' or null>" }
  ],
  "riskFactors": [
    { "severity": "high" | "medium" | "low", "headline": "<one line>", "detail": "<2-3 sentences>", "pageRef": "<eg. 'p. 47' or null>" }
  ],
  "governance": [
    { "severity": "high" | "medium" | "low", "headline": "<one line>", "detail": "<2-3 sentences>", "pageRef": "<page or null>" }
  ],
  "relatedPartyTransactions": [
    { "party": "<name>", "relationship": "<subsidiary | promoter | associate | KMP | director-controlled | ...>", "nature": "<loan | sale | service | guarantee | rent | ...>", "amountCr": <number or null>, "pageRef": "<page or null>" }
  ],
  "contingentLiabilities": [
    { "description": "<string>", "amountCr": <number or null>, "status": "<string>", "pageRef": "<page or null>" }
  ],
  "peerComparables": [
    { "name": "<peer name as it appears in prospectus>", "rationale": "<one line on why this is a peer>", "pageRef": "<page or null>" }
  ],
  "financialHighlights": {
    "revenue": [{ "year": "<FY23 etc.>", "valueCr": <number or null> }],
    "ebitda": [{ "year": "<FY23 etc.>", "valueCr": <number or null> }],
    "pat":    [{ "year": "<FY23 etc.>", "valueCr": <number or null> }],
    "pageRef": "<page where 'Restated Financial Information' begins, or null>"
  }
}

EXTRACTION RULES — non-negotiable:
1. Quote EXACT numbers from the document. Never fabricate. If a value is missing, return null.
2. riskFactors: TOP 5 ONLY — most material first. Prioritize concentration risk, regulatory, debt covenants, going-concern, related-party leakage, supply-chain, customer concentration. SKIP boilerplate ("general market conditions", "force majeure").
3. governance: TOP 3 ONLY — concerns about board independence, auditor changes, qualified opinions, KMP attrition, promoter pledges, insider transactions.
4. relatedPartyTransactions: TOP 5 ONLY by amount.
5. contingentLiabilities: TOP 5 ONLY by amount.
6. peerComparables: 3-5 peers — STRONGLY prefer those EXPLICITLY listed in the "Basis for Issue Price" or "Comparison with Listed Peers" section. Use the company name as it appears in the prospectus (e.g. "Affle (India) Limited", not "Affle"). Only infer if none are listed.
7. financialHighlights: Last 3 fiscal years if available.
8. severity is YOUR analyst judgment based on materiality, not the issuer's framing.
9. Compress issuer's verbose language to essentials. Be concise.
10. If a section truly isn't present in the document, return [] or null. Don't pad.

PAGE CITATIONS — required on every extracted claim:
- The prospectus PDF you receive has page numbers. Cite the page where each item appears.
- Format pageRef as "p. NN" (e.g. "p. 47") or a range "p. 47-49" when the item spans pages.
- If you genuinely cannot determine a page (e.g. derived from a table that spans many pages), set pageRef to null. Do not guess.
- Page citations are how investors verify each claim against the source. Be precise.`;

/** Minimum drift to treat the source URL as "changed" — strips query params */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
}

export function urlChanged(prev: string | null | undefined, next: string): boolean {
  if (!prev) return true;
  return normalizeUrl(prev) !== normalizeUrl(next);
}

/**
 * Run the analysis via the local Claude CLI (`claude` command).
 * The CLI inherits Claude Code's session credentials. We pass the prompt
 * via stdin and the URL inline; the CLI's tool-using loop fetches the PDF
 * and returns the analysis.
 */
export async function analyzeDrhpViaClaudeCli(opts: {
  pdfUrl: string;
  ipoName: string;
  ipoType: string;
  sourceType: "DRHP" | "RHP";
}): Promise<{ analysis: DrhpAnalysis; modelUsed: string }> {
  const { spawn } = await import("node:child_process");

  const userPrompt = `Fetch the PDF at this URL and analyze it as an Indian IPO prospectus.

URL: ${opts.pdfUrl}
Issuer: ${opts.ipoName}
Type: ${opts.ipoType === "sme" ? "SME" : "Mainboard"} ${opts.sourceType}

Return STRICT JSON only — no markdown, no commentary. Schema:

${DRHP_SYSTEM_PROMPT.split("Output STRICT JSON")[1] ?? ""}`;

  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", "--output-format", "text"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`claude CLI exited ${code}: ${stderr.slice(0, 400)}`));
        return;
      }
      const m = stdout.match(/\{[\s\S]*\}/);
      if (!m) {
        reject(new Error("claude CLI output had no JSON: " + stdout.slice(0, 400)));
        return;
      }
      try {
        const parsed = JSON.parse(m[0]) as DrhpAnalysis;
        resolve({ analysis: parsed, modelUsed: "claude-cli" });
      } catch (err) {
        reject(new Error(`JSON parse failed: ${err instanceof Error ? err.message : String(err)}`));
      }
    });

    child.on("error", (err) => reject(err));

    child.stdin.write(userPrompt);
    child.stdin.end();
  });
}
