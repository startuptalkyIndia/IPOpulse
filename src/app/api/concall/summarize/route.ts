import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Earnings concall summarizer. Paste a transcript, get structured insights:
 *   - 3-line TL;DR
 *   - guidance changes (raised / lowered / reaffirmed)
 *   - sentiment (bullish / neutral / bearish)
 *   - key takeaways (5-7 bullets)
 *   - red flags (concentrations, debt, regulatory)
 *
 * Auth: signed-in users only. Rate-limited to 5 req/min/user (cost guard).
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Concall AI is not enabled — ANTHROPIC_API_KEY missing." },
      { status: 503 },
    );
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

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: `You are an Indian equity-research analyst summarizing an earnings concall.
Output strict JSON with the keys exactly:
  tldr: string (3 lines, plain text)
  sentiment: "bullish" | "neutral" | "bearish"
  guidance: "raised" | "reaffirmed" | "lowered" | "withdrawn" | "not-given"
  keyTakeaways: string[] (5-7 bullets, factual, no opinion)
  redFlags: string[] (0-5 bullets — concentrations, debt, regulatory, attrition, deferred revenue, etc.)
  numbers: { metric: string, value: string, vsLast: string }[] (5-10 quoted numerical disclosures from the call)
  quotedFromManagement: string[] (3-5 verbatim quotes that capture key shifts)

Be precise. Quote actual numbers from the transcript. Do NOT invent figures. If a value is not stated, omit it.`,
      messages: [
        {
          role: "user",
          content: `Company: ${company || "(unspecified)"}\nQuarter: ${quarter || "(unspecified)"}\n\nTranscript:\n\n${transcript}`,
        },
      ],
    });
    const textBlock = resp.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

    // Try to extract JSON (Claude sometimes wraps in markdown code fences)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI response was not valid JSON", raw }, { status: 500 });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 });
    }
    return NextResponse.json({ summary: parsed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 },
    );
  }
}
