import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { callClaudeJson, claudeAvailable, ClaudeUnavailableError } from "@/lib/claude-runner";
import { checkBudget, recordSpend } from "@/lib/ai-budget";

/**
 * Promoter / management background check — works via Anthropic SDK OR Claude CLI.
 * Returns structured JSON: prior ventures, controversies, regulatory matters, red/green flags.
 */

const rateMap = new Map<string, { count: number; resetAt: number }>();
const MAX = 5;
const WINDOW = 60_000;

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in to use the promoter check" }, { status: 401 });
  }

  const now = Date.now();
  const bucket = rateMap.get(userId);
  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= MAX) {
      const retry = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json({ error: `Too many requests — try again in ${retry}s` }, { status: 429 });
    }
    bucket.count++;
  } else {
    rateMap.set(userId, { count: 1, resetAt: now + WINDOW });
  }

  const { available, via } = await claudeAvailable();
  if (!available) {
    return NextResponse.json({ error: "Promoter check AI not available. Claude CLI is not installed on the server." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, 120);
  const company = String(body.company ?? "").trim().slice(0, 120);
  if (!name) return NextResponse.json({ error: "Promoter name is required" }, { status: 400 });

  const SYSTEM = `You are an Indian equity-research analyst doing a background check on a promoter / founder / KMP. Output strict JSON with:
  summary: 2-3 sentence overview
  priorVentures: { name, role, outcome }[] (up to 5)
  controversies: { headline, year?, severity: "minor"|"moderate"|"serious", details }[] (up to 5; empty if none)
  regulatory: { agency, matter, year?, status }[] (SEBI/MCA/RBI/IT/EOW actions; empty if none)
  relatedParties: string[] (notable family/business associates; up to 5)
  greenFlags: string[] (positive signals; up to 5)
  redFlags: string[] (concerning patterns; up to 5)
  confidence: "high"|"medium"|"low"

CRITICAL GUARDRAILS (legal — defamation + SEBI):
- These are real, named living people. NEVER speculate, allege, infer, or fabricate.
- Only include a controversy / regulatory item if it is a WELL-DOCUMENTED matter of public record that you are highly confident about (widely reported in mainstream Indian press or an official SEBI/MCA/NCLT order). If you are not certain it is real and public, OMIT it — return an empty array. An empty array is the correct, expected answer for most people.
- redFlags must describe only factual, sourced patterns — never guilt-by-association or unproven suspicion.
- Set confidence to "low" whenever you are relying on general recall rather than a specific documented source, and keep controversies/regulatory empty in that case.
Cover Indian context factually: SEBI/MCA/EOW/NCLT orders, BSE/NSE filings, mainstream Indian press.`;

  // AI budget gate
  const budget = await checkBudget(userId);
  if (!budget.allowed) {
    return NextResponse.json(
      { error: `Monthly AI budget of ₹${budget.capInr} reached. Resets on the 1st.` },
      { status: 429 },
    );
  }

  try {
    const result = await callClaudeJson({
      system: SYSTEM,
      user: `Promoter: ${name}\nCurrent company: ${company || "(unspecified)"}`,
      maxTokens: 1500,
    });
    // Estimated tokens (CLI): 600 input + 1500 output per promoter check
    recordSpend(userId, "claude-cli", 600, 1500);
    return NextResponse.json({ result, via, disclaimer: "AI-generated. Verify against SEBI/MCA/BSE filings before any investment decision." });
  } catch (err) {
    if (err instanceof ClaudeUnavailableError) return NextResponse.json({ error: err.message }, { status: 503 });
    return NextResponse.json({ error: err instanceof Error ? err.message : "AI failed" }, { status: 500 });
  }
}
