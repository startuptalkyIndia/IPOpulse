import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(200),
  name: z.string().max(100).optional().nullable(),
  password: z.string().min(8).max(200),
});

// In-memory rate limiter for signup: max 5 attempts per IP per 15 minutes
const signupRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const SIGNUP_RATE_LIMIT_MAX = 5;
const SIGNUP_RATE_LIMIT_WINDOW_MS = 15 * 60_000;

export async function POST(request: Request) {
  // Rate-limit by IP to prevent account creation spam
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const now = Date.now();
  const bucket = signupRateLimitMap.get(ip);
  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= SIGNUP_RATE_LIMIT_MAX) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json(
        { error: "Too many signup attempts — try again later" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
    bucket.count++;
  } else {
    signupRateLimitMap.set(ip, { count: 1, resetAt: now + SIGNUP_RATE_LIMIT_WINDOW_MS });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: parsed.data.name || null },
  });
  return NextResponse.json({ ok: true, id: user.id });
}
