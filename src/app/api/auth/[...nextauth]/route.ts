import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/lib/auth";

// In-memory leaky-bucket rate limit for credential sign-in.
// Throttles brute-force attempts at /api/auth/callback/credentials.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const LIMIT = 10;
const WINDOW_MS = 5 * 60 * 1000;

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (b.count >= LIMIT) return true;
  b.count++;
  return false;
}

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  if (req.nextUrl.pathname.includes("/callback/credentials")) {
    if (isRateLimited(getClientIp(req))) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in a few minutes." },
        { status: 429 },
      );
    }
  }
  return handlers.POST(req);
}
