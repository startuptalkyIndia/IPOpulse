// Source: _shared/templates/api/feedback-route.ts — re-propagate to update
// Receives feedback from the FeedbackWidget. Writes to DB + sends ntfy push so
// founder sees it within seconds. No PII stored beyond what user typed.

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  rating: z.enum(["happy", "neutral", "sad"]),
  message: z.string().max(500).optional().default(""),
  path: z.string().max(200).optional().default(""),
  product: z.string().max(60).optional().default(""),
  userAgent: z.string().max(200).optional().default(""),
});

// Set this per-project — random topic name, treated like a password
const NTFY_TOPIC = process.env.NTFY_FEEDBACK_TOPIC || "";

export async function POST(req: Request) {
  // Rate limit (audit MEDIUM M14): unauthenticated endpoint that writes a DB row
  // and fires a founder push per request — cap to 5 / 10 min per IP.
  const rl = rateLimit("feedback", clientIp(req), 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Too many submissions — please try again later." }, { status: 429 });
  }

  let parsed;
  try {
    parsed = Schema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const { rating, message, path, product, userAgent } = parsed;

  // 1. Persist to DB
  try {
    await prisma.feedback.create({ data: { rating, message, path, product, userAgent } });
  } catch (err) {
    console.error("[feedback] db write failed", err);
    // Continue — we still want to deliver the ntfy push
  }

  // 2. Push notify the founder (optional but recommended). Topic name is a secret.
  if (NTFY_TOPIC) {
    const emoji = rating === "sad" ? "☹️" : rating === "neutral" ? "😐" : "😊";
    const title = `${emoji} ${product} feedback — ${path}`;
    const body = message || "(no message)";
    fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: { Title: title, Tags: rating === "sad" ? "warning" : "speech_balloon" },
      body,
    }).catch(() => { /* never block the user on the push */ });
  }

  return NextResponse.json({ ok: true });
}
