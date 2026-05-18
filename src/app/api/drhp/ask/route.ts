import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callClaude, claudeAvailable, ClaudeUnavailableError } from "@/lib/claude-runner";

/**
 * DRHP corpus Q&A — works via Anthropic SDK OR Claude CLI.
 * No ANTHROPIC_API_KEY required if `claude` binary is installed on the server.
 */

const rateMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW = 60_000;

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in to use DRHP AI search" }, { status: 401 });
  }

  const now = Date.now();
  const bucket = rateMap.get(userId);
  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= LIMIT) {
      const retry = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json({ error: `Too many requests — try again in ${retry}s` }, { status: 429 });
    }
    bucket.count++;
  } else {
    rateMap.set(userId, { count: 1, resetAt: now + WINDOW });
  }

  const { available, via } = await claudeAvailable();
  if (!available) {
    return NextResponse.json(
      { error: "DRHP AI not available. Claude CLI is not installed on the server." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const question = String(body.question ?? "").trim();
  if (!question || question.length > 500) {
    return NextResponse.json({ error: "Question must be 1–500 chars" }, { status: 400 });
  }

  const corpus = await prisma.ipo.findMany({
    where: { OR: [{ drhpUrl: { not: null } }, { rhpUrl: { not: null } }] },
    select: { name: true, type: true, priceBandLow: true, priceBandHigh: true, issueSize: true, openDate: true, objectsOfIssue: true },
    take: 60,
  });

  const corpusText = corpus
    .map((c) => `- ${c.name} (${c.type}, opens ${c.openDate?.toISOString().slice(0, 10) ?? "TBD"}). Issue ₹${c.issueSize ?? "?"} Cr · ₹${c.priceBandLow ?? "?"}–${c.priceBandHigh ?? "?"}. Objects: ${c.objectsOfIssue ?? "n/a"}.`)
    .join("\n");

  try {
    const answer = await callClaude({
      system: `You are IPOpulse's DRHP research assistant. Answer questions about Indian IPOs using the indexed corpus below. Be concise, factual, cite company names. If not in corpus say "Not in current DRHP index." Never fabricate numbers.\n\n<corpus>\n${corpusText}\n</corpus>`,
      user: question,
      maxTokens: 800,
    });
    return NextResponse.json({ answer, via });
  } catch (err) {
    if (err instanceof ClaudeUnavailableError) return NextResponse.json({ error: err.message }, { status: 503 });
    return NextResponse.json({ error: err instanceof Error ? err.message : "AI failed" }, { status: 500 });
  }
}
