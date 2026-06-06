import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { callClaudeJson, claudeAvailable, ClaudeUnavailableError } from "@/lib/claude-runner";
import { checkBudget, recordSpend } from "@/lib/ai-budget";

/**
 * Earnings concall summarizer — works via Anthropic SDK OR Claude CLI.
 * Paste a transcript, get structured JSON: TL;DR, sentiment, guidance, takeaways, red flags, numbers, quotes.
 */

const rateMap = new Map<string, { count: number; resetAt: number }>();
const MAX = 5;
const WINDOW = 60_000;

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in to use the concall summarizer" }, { status: 401 });
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
    return NextResponse.json({ error: "Concall AI not available. Claude CLI is not installed on the server." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const transcript = String(body.transcript ?? "").trim();
  const company = String(body.company ?? "").trim().slice(0, 100);
  const quarter = String(body.quarter ?? "").trim().slice(0, 30);

  if (!transcript || transcript.length < 200) {
    return NextResponse.json({ error: "Transcript must be at least 200 characters" }, { status: 400 });
  }
  if (transcript.length > 200_000) {
    return NextResponse.json({ error: "Transcript too long (max 200K chars)" }, { status: 400 });
  }

  const SYSTEM = `You are an Indian equity-research analyst summarizing an earnings concall.
Output strict JSON with the keys exactly:
  tldr: string (3 lines, plain text)
  sentiment: "bullish" | "neutral" | "bearish"
  guidance: "raised" | "reaffirmed" | "lowered" | "withdrawn" | "not-given"
  keyTakeaways: string[] (5-7 bullets, factual, no opinion)
  redFlags: string[] (0-5 bullets — concentrations, debt, regulatory, attrition, deferred revenue, etc.)
  numbers: { metric: string, value: string, vsLast: string }[] (5-10 quoted numerical disclosures)
  quotedFromManagement: string[] (3-5 verbatim quotes that capture key shifts)
Be precise. Quote actual numbers. Do NOT invent figures.`;

  // AI budget gate
  const budget = await checkBudget(userId);
  if (!budget.allowed) {
    return NextResponse.json(
      { error: `Monthly AI budget of ₹${budget.capInr} reached. Resets on the 1st.` },
      { status: 429 },
    );
  }

  try {
    const summary = await callClaudeJson({
      system: SYSTEM,
      user: `Company: ${company || "(unspecified)"}\nQuarter: ${quarter || "(unspecified)"}\n\nTranscript:\n\n${transcript}`,
      maxTokens: 2000,
    });
    // Estimated tokens (CLI): ~transcript.length/4 input chars + 2000 output tokens
    const estInput = Math.ceil(transcript.length / 4);
    recordSpend(userId, "claude-cli", estInput, 2000);
    return NextResponse.json({ summary, via });
  } catch (err) {
    if (err instanceof ClaudeUnavailableError) return NextResponse.json({ error: err.message }, { status: 503 });
    return NextResponse.json({ error: err instanceof Error ? err.message : "AI failed" }, { status: 500 });
  }
}
