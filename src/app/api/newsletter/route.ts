import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ email: z.string().email().max(200) });

// In-memory rate limiter: max 3 newsletter subscriptions per IP per 10 minutes
const newsletterRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const NL_RATE_LIMIT_MAX = 3;
const NL_RATE_LIMIT_WINDOW_MS = 10 * 60_000;

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const now = Date.now();
  const bucket = newsletterRateLimitMap.get(ip);
  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= NL_RATE_LIMIT_MAX) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json(
        { error: "Too many requests — try again later" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
    bucket.count++;
  } else {
    newsletterRateLimitMap.set(ip, { count: 1, resetAt: now + NL_RATE_LIMIT_WINDOW_MS });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const email = parsed.data.email.toLowerCase().trim();
  await prisma.newsletterSub.upsert({
    where: { email },
    update: {},
    create: { email, verified: false },
  });
  return NextResponse.json({ ok: true });
}
