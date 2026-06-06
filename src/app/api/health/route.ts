// /api/health — used by docker healthcheck + external uptime monitors.
//
// Returns:
//   200 { status: "ok"|"degraded", checks: {...}, timestamp }
//   503 { status: "unhealthy", checks: {...}, timestamp } — when DB fails
//
// Honesty rule (LESSON-2026-06-06-health-honesty):
//   Bare {"status":"ok"} without per-dep state is a lie monitor.
//   Every external dep MUST appear in checks with: "ok" | "unconfigured" | "fail".
//   "unconfigured" = env var missing, app can still run. Returns 200 degraded.
//   "fail" = dep unreachable. Returns 503 for critical deps (db).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STARTED_AT = Date.now();
const IS_PROD = process.env.NODE_ENV === "production";

type CheckState = "ok" | "unconfigured" | "fail";
interface DepCheck {
  status: CheckState;
  latencyMs?: number;
  error?: string;
}

async function pingDb(): Promise<DepCheck> {
  const t = Date.now();
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return { status: "ok", latencyMs: Date.now() - t };
  } catch (e: unknown) {
    const rawMsg = e instanceof Error ? e.message : String(e);
    if (!IS_PROD) console.error("health.db_error", rawMsg);
    return {
      status: "fail",
      latencyMs: Date.now() - t,
      error: IS_PROD ? "db_unreachable" : rawMsg,
    };
  }
}

// Env-presence-only check. No network call per ping — avoids rate-limiting upstream.
function envCheck(varNames: string[]): DepCheck {
  const present = varNames.every((v) => !!process.env[v]?.trim());
  return { status: present ? "ok" : "unconfigured" };
}

export async function GET() {
  const dbResult = await pingDb();

  const checks: Record<string, DepCheck> = {
    db: dbResult,
    // Kite Connect — live prices, OHLC historical data (₹500/mo plan)
    kite: envCheck(["KITE_API_KEY", "KITE_API_SECRET"]),
    // Anthropic — DRHP AI analysis, listing predictor features
    anthropic: envCheck(["ANTHROPIC_API_KEY"]),
    // Resend — email notifications
    resend: envCheck(["RESEND_API_KEY"]),
  };

  // Verdict:
  //   - db fail → 503 unhealthy
  //   - any unconfigured → 200 degraded (honest about what's not wired)
  //   - all ok → 200 ok
  const criticalFail = checks.db.status === "fail";
  const anyUnconfigured = Object.values(checks).some(
    (c) => c.status === "unconfigured"
  );
  const anyFail = Object.values(checks).some((c) => c.status === "fail");

  let status: "ok" | "degraded" | "unhealthy";
  let httpCode: number;
  if (criticalFail) {
    status = "unhealthy";
    httpCode = 503;
  } else if (anyFail || anyUnconfigured) {
    status = "degraded";
    httpCode = 200;
  } else {
    status = "ok";
    httpCode = 200;
  }

  const body = IS_PROD
    ? {
        status,
        checks,
        timestamp: new Date().toISOString(),
      }
    : {
        status,
        uptime_s: Math.floor((Date.now() - STARTED_AT) / 1000),
        checks,
        timestamp: new Date().toISOString(),
      };

  return NextResponse.json(body, {
    status: httpCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
