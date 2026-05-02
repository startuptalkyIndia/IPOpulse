import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Per-IPO DRHP deep-dive. Pass `slug` + `question` and we fetch the IPO's
 * DRHP/RHP PDF, hand it to Claude as a `document` content block, and return
 * a grounded answer with section citations.
 *
 * Auth: signed-in users only.
 * Rate limit: 3 req/min/user (PDF requests are expensive).
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DRHP AI is not enabled — ANTHROPIC_API_KEY missing." },
      { status: 503 },
    );
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

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const resp = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      system: `You are IPOpulse's DRHP analyst. Answer the user's question STRICTLY from the attached prospectus document. Quote exact figures and section names. If the answer isn't in the document, say so explicitly. Be concise (under 300 words). Do not hallucinate.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "url", url: pdfUrl },
              title: `${ipo.name} — ${ipo.rhpUrl ? "RHP" : "DRHP"}`,
              context: `IPO: ${ipo.name} (${ipo.type === "sme" ? "SME" : "Mainboard"}). Price band ₹${ipo.priceBandLow ?? "?"}–${ipo.priceBandHigh ?? "?"}. Issue size ₹${ipo.issueSize ?? "?"} Cr. Opens ${ipo.openDate?.toISOString().slice(0, 10) ?? "TBD"}.`,
            },
            { type: "text", text: question },
          ],
        },
      ],
    });

    const textBlock = resp.content.find((b) => b.type === "text");
    const answer = textBlock && textBlock.type === "text" ? textBlock.text : "";
    return NextResponse.json({
      answer,
      source: pdfUrl,
      sourceType: ipo.rhpUrl ? "RHP" : "DRHP",
      ipo: ipo.name,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 },
    );
  }
}
