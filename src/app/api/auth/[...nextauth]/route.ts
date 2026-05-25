import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { authRateLimit, clientIp } from "@/lib/rate-limit";

// Throttles brute-force attempts at credential sign-in routes.
// 5 attempts per 15 minutes per IP — see src/lib/rate-limit.ts.

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  if (req.nextUrl.pathname.includes("/callback/credentials")) {
    const result = authRateLimit(req);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again in a few minutes.",
          retryAfterMs: result.resetInMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(result.resetInMs / 1000).toString(),
          },
        },
      );
    }
    // Touch clientIp so it's referenced (helps tree-shake noise; harmless if unused).
    void clientIp(req);
  }
  return handlers.POST(req);
}
