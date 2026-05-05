import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Promoter / management background check via Claude. User pastes a name +
 * optional company; we return structured findings: prior ventures,
 * controversies, regulatory issues, related parties, social signals.
 *
 * IMPORTANT: This is best-effort AI analysis grounded only in the model's
 * training data. It is NOT a regulatory background check. Always verify
 * against SEBI, MCA, BSE/NSE filings before any investment decision.
 *
 * Auth: signed-in. Rate limit 5/min/user.
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not enabled — ANTHROPIC_API_KEY missing" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, 120);
  const company = String(body.company ?? "").trim().slice(0, 120);
  if (!name) return NextResponse.json({ error: "Promoter name is required" }, { status: 400 });

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      system: `You are an Indian equity-research analyst doing a background check on a promoter / founder / KMP. Output strict JSON with these keys:
  summary: 2-3 sentence overview
  priorVentures: { name: string; role: string; outcome: string }[] (up to 5)
  controversies: { headline: string; year?: string; severity: "minor" | "moderate" | "serious"; details: string }[] (up to 5; empty array if none known)
  regulatory: { agency: string; matter: string; year?: string; status: string }[] (SEBI / MCA / RBI / IT / EOW orders, settlements, debarments — empty if none known)
  relatedParties: string[] (notable family / business associates that matter for governance — up to 5)
  greenFlags: string[] (positive signals — long tenure, clean track record, public commitments — up to 5)
  redFlags: string[] (concerning patterns — pump-and-dump history, regulatory penalties, frequent restructuring — up to 5)
  confidence: "high" | "medium" | "low"  (based on how well-known this person is)

Be honest about uncertainty. If you don't know something, omit it or say "Not in my training data". Do NOT fabricate. Cover Indian context: focus on SEBI/MCA/EOW/SIDBI/IBC/NCLT actions, BSE/NSE filings, and Indian press coverage. Distinguish between alleged vs proven matters.`,
      messages: [
        {
          role: "user",
          content: `Promoter / founder name: ${name}\nCurrent company (if known): ${company || "(unspecified)"}\n\nReturn the JSON.`,
        },
      ],
    });
    const textBlock = resp.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return NextResponse.json({ error: "AI response was not valid JSON", raw }, { status: 500 });
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[0]);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 });
    }
    return NextResponse.json({ result: parsed, disclaimer: "AI-generated background note. Verify against SEBI/MCA/BSE filings before any investment decision." });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "AI request failed" }, { status: 500 });
  }
}
