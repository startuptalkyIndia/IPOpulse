import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * DRHP Q&A endpoint — gated by ANTHROPIC_API_KEY. We give Claude a list of
 * currently-indexed IPOs + metadata as context; for deep PDF analysis we
 * layer in prompt caching and file uploads in a later iteration.
 *
 * Auth: any signed-in user. Rate-limited to 5 requests per minute per user
 * to prevent runaway Anthropic API costs.
 */

// In-memory per-user rate limit map (resets on server restart — acceptable for this use case)
const drhpRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const DRHP_RATE_LIMIT_MAX = 5;
const DRHP_RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  // Auth guard — must be signed in
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in to use DRHP AI search" }, { status: 401 });
  }

  // Per-user rate limit
  const now = Date.now();
  const bucket = drhpRateLimitMap.get(userId);
  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= DRHP_RATE_LIMIT_MAX) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json(
        { error: `Too many requests — try again in ${retryAfter}s` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
    bucket.count++;
  } else {
    drhpRateLimitMap.set(userId, { count: 1, resetAt: now + DRHP_RATE_LIMIT_WINDOW_MS });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DRHP AI is not enabled yet — ANTHROPIC_API_KEY is missing on the server." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const question = String(body.question ?? "").trim();
  if (!question || question.length > 500) {
    return NextResponse.json({ error: "Question must be 1–500 chars" }, { status: 400 });
  }

  // Lightweight context: IPO names + metadata (no PDF content yet — that's v2)
  const corpus = await prisma.ipo.findMany({
    where: { OR: [{ drhpUrl: { not: null } }, { rhpUrl: { not: null } }] },
    select: {
      name: true,
      slug: true,
      type: true,
      priceBandLow: true,
      priceBandHigh: true,
      issueSize: true,
      openDate: true,
      objectsOfIssue: true,
      drhpUrl: true,
      rhpUrl: true,
    },
    take: 60,
  });

  const corpusText = corpus
    .map((c) =>
      `- ${c.name} (${c.type}, opens ${c.openDate?.toISOString().slice(0, 10) ?? "TBD"}). Issue size ₹${c.issueSize ?? "?"} Cr. Price band ₹${c.priceBandLow ?? "?"}–₹${c.priceBandHigh ?? "?"}. Objects: ${c.objectsOfIssue ?? "n/a"}.`,
    )
    .join("\n");

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 800,
      system: `You are IPOpulse's DRHP research assistant. Answer questions about Indian IPOs using the indexed corpus below. Be concise, factual, and cite company names. If the answer isn't in the corpus, say "Not in current DRHP index — try again when this IPO is added." Do not hallucinate financial figures.\n\n<corpus>\n${corpusText}\n</corpus>`,
      messages: [{ role: "user", content: question }],
    });
    const textBlock = resp.content.find((b) => b.type === "text");
    const answer = textBlock && textBlock.type === "text" ? textBlock.text : "";
    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 },
    );
  }
}
