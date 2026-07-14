import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callClaude, ClaudeUnavailableError } from "@/lib/claude-runner";
import { checkBudget, recordSpend } from "@/lib/ai-budget";

/**
 * Per-IPO DRHP deep-dive. Pass `slug` + `question` and we fetch the IPO's
 * DRHP/RHP PDF URL, ask Claude to analyze it, and return a grounded answer.
 *
 * Auth: signed-in users only.
 * Rate limit: 3 req/min/user.
 */

const rateMap = new Map<string, { count: number; resetAt: number }>();
const MAX = 3;
const WINDOW = 60_000;

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in to use DRHP deep-dive" }, { status: 401 });
  }

  const now = Date.now();
  const bucket = rateMap.get(userId);
  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= MAX) {
      const retry = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json({ error: `Too many DRHP requests — try again in ${retry}s` }, { status: 429 });
    }
    bucket.count++;
  } else {
    rateMap.set(userId, { count: 1, resetAt: now + WINDOW });
  }

  const body = await request.json().catch(() => ({}));
  const slug = String(body.slug ?? "").trim();
  const question = String(body.question ?? "").trim();

  if (!slug) return NextResponse.json({ error: "Missing IPO slug" }, { status: 400 });
  if (!question || question.length > 500) {
    return NextResponse.json({ error: "Question must be 1–500 chars" }, { status: 400 });
  }

  const ipo = await prisma.ipo.findUnique({
    where: { slug },
    select: { name: true, type: true, drhpUrl: true, rhpUrl: true, openDate: true, priceBandLow: true, priceBandHigh: true, issueSize: true },
  });
  if (!ipo) return NextResponse.json({ error: "IPO not found" }, { status: 404 });

  const pdfUrl = ipo.rhpUrl ?? ipo.drhpUrl;
  if (!pdfUrl) {
    return NextResponse.json({ error: "No DRHP/RHP URL on file for this IPO yet" }, { status: 404 });
  }

  // AI budget gate (DPDP + cost control)
  const budget = await checkBudget(userId);
  if (!budget.allowed) {
    return NextResponse.json(
      { error: `Monthly AI budget of ₹${budget.capInr} reached. Resets on the 1st.` },
      { status: 429 },
    );
  }

  try {
    const answer = await callClaude({
      system: `You are IPOpulse's DRHP analyst. The user will provide an IPO prospectus PDF URL and a question. Fetch the PDF and answer the question STRICTLY from its contents. Quote exact figures and section names. If the answer is not in the document, say so explicitly. Be concise (under 300 words). Do not hallucinate.`,
      user: `IPO: ${ipo.name} (${ipo.type === "sme" ? "SME" : "Mainboard"}). Price band ₹${ipo.priceBandLow ?? "?"}–${ipo.priceBandHigh ?? "?"}. Issue size ₹${ipo.issueSize ?? "?"} Cr. Opens ${ipo.openDate?.toISOString().slice(0, 10) ?? "TBD"}.

Prospectus PDF URL: ${pdfUrl}

Question: ${question}`,
    });

    // Estimated tokens (CLI — no token count returned): 1200 input + 400 output per DRHP query
    await recordSpend(userId, "claude-cli", 1200, 400);

    return NextResponse.json({
      answer,
      source: pdfUrl,
      sourceType: ipo.rhpUrl ? "RHP" : "DRHP",
      ipo: ipo.name,
    });
  } catch (err) {
    if (err instanceof ClaudeUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[drhp/analyze] AI request failed:", err);
    return NextResponse.json(
      { error: "AI request failed. Please try again in a moment." },
      { status: 500 },
    );
  }
}
