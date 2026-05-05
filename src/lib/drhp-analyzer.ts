/**
 * DRHP / RHP intelligence extractor.
 *
 * Single source of truth for the structured DRHP analysis pipeline. Used by:
 *   - src/crons/jobs/drhp-analyze.ts        (background cron)
 *   - src/app/api/admin/drhp/analyze/...    (admin force-refresh endpoint)
 *   - scripts/analyze-drhp.ts               (local CLI, npx tsx)
 *   - scripts/analyze-drhp-via-cli.sh       (Claude CLI wrapper)
 *
 * Two execution modes both produce the same structured output:
 *   1. SDK mode      — uses ANTHROPIC_API_KEY directly (server cron, admin)
 *   2. Claude CLI    — shells out to `claude -p` (local, ad-hoc)
 *
 * Cost guard: ~$0.60–$1.20 per DRHP at Sonnet 4.5 (300–500 page typical).
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
  useOfProceeds: { purpose: string; amountCr: number | null; percent: number | null }[];
  riskFactors: { severity: "high" | "medium" | "low"; headline: string; detail: string }[];
  governance: { severity: "high" | "medium" | "low"; headline: string; detail: string }[];
  relatedPartyTransactions: {
    party: string;
    relationship: string;
    nature: string;
    amountCr: number | null;
  }[];
  contingentLiabilities: { description: string; amountCr: number | null; status: string }[];
  peerComparables: { name: string; rationale: string }[];
  financialHighlights: {
    revenue: { year: string; valueCr: number | null }[];
    ebitda: { year: string; valueCr: number | null }[];
    pat: { year: string; valueCr: number | null }[];
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
    { "purpose": "<string>", "amountCr": <number or null>, "percent": <number or null> }
  ],
  "riskFactors": [
    { "severity": "high" | "medium" | "low", "headline": "<one line>", "detail": "<2-3 sentences>" }
  ],
  "governance": [
    { "severity": "high" | "medium" | "low", "headline": "<one line>", "detail": "<2-3 sentences>" }
  ],
  "relatedPartyTransactions": [
    { "party": "<name>", "relationship": "<subsidiary | promoter | associate | KMP | director-controlled | ...>", "nature": "<loan | sale | service | guarantee | rent | ...>", "amountCr": <number or null> }
  ],
  "contingentLiabilities": [
    { "description": "<string>", "amountCr": <number or null>, "status": "<string>" }
  ],
  "peerComparables": [
    { "name": "<peer name>", "rationale": "<one line on why this is a peer>" }
  ],
  "financialHighlights": {
    "revenue": [{ "year": "<FY23 etc.>", "valueCr": <number or null> }],
    "ebitda": [{ "year": "<FY23 etc.>", "valueCr": <number or null> }],
    "pat":    [{ "year": "<FY23 etc.>", "valueCr": <number or null> }]
  }
}

EXTRACTION RULES — non-negotiable:
1. Quote EXACT numbers from the document. Never fabricate. If a value is missing, return null.
2. riskFactors: TOP 5 ONLY — most material first. Prioritize concentration risk, regulatory, debt covenants, going-concern, related-party leakage, supply-chain, customer concentration. SKIP boilerplate ("general market conditions", "force majeure").
3. governance: TOP 3 ONLY — concerns about board independence, auditor changes, qualified opinions, KMP attrition, promoter pledges, insider transactions.
4. relatedPartyTransactions: TOP 5 ONLY by amount.
5. contingentLiabilities: TOP 5 ONLY by amount.
6. peerComparables: 3-5 peers — prefer those EXPLICITLY listed by the issuer. If none listed, infer from sector/market cap.
7. financialHighlights: Last 3 fiscal years if available.
8. severity is YOUR analyst judgment based on materiality, not the issuer's framing.
9. Compress issuer's verbose language to essentials. Be concise.
10. If a section truly isn't present in the document, return [] or null. Don't pad.`;

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
 * Run the analysis via the Anthropic SDK with the prospectus URL as a
 * `document` content block. Returns parsed JSON or throws.
 */
export async function analyzeDrhpViaSdk(opts: {
  apiKey: string;
  pdfUrl: string;
  ipoName: string;
  ipoType: string;
  sourceType: "DRHP" | "RHP";
  model?: string;
}): Promise<{ analysis: DrhpAnalysis; modelUsed: string }> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: opts.apiKey });

  const model = opts.model ?? "claude-sonnet-4-5";
  const resp = await client.messages.create({
    model,
    max_tokens: 4000,
    system: DRHP_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "url", url: opts.pdfUrl },
            title: `${opts.ipoName} — ${opts.sourceType}`,
            context: `Indian ${opts.ipoType === "sme" ? "SME" : "Mainboard"} IPO prospectus.`,
          },
          { type: "text", text: "Extract the full structured intelligence per the schema. Output JSON only." },
        ],
      },
    ],
  });

  const textBlock = resp.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response was not valid JSON: " + raw.slice(0, 200));
  }
  const parsed = JSON.parse(jsonMatch[0]) as DrhpAnalysis;
  return { analysis: parsed, modelUsed: model };
}

/**
 * Run the analysis via the local Claude CLI (`claude` command). Used when
 * the founder runs the analysis from their laptop without an API key.
 *
 * The CLI inherits Claude Code's session credentials. We pass the prompt
 * via stdin and the URL inline; the CLI's tool-using loop fetches the PDF
 * and returns the analysis.
 *
 * NOTE: this path requires the `claude` binary on PATH and an active
 * Claude Code session. The cron does NOT use this — it always uses the SDK.
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
