// /api/health — used by docker healthcheck + external uptime monitors.
//
// Returns:
//   200 { status: "ok"|"degraded", checks: {...}, timestamp }
//   503 { status: "unhealthy", checks: {...}, timestamp } — when DB fails
//
// Honesty rule (LESSON-2026-06-06-health-honesty):
//   Bare {"status":"ok"} without per-dep state is a lie monitor.
//   Every external dep MUST appear in checks with: "ok" | "unconfigured" | "fail".
//   "unconfigured" = env var missing, app can still run.
//   "fail" = dep unreachable. Returns 503 for critical deps (db).
//
// Overall verdict (corrected 2026-08-19): "unconfigured" is reported per dep but
// does NOT degrade the overall status. It used to, which meant that with Resend
// deliberately not wired the endpoint answered "degraded" every single time —
// so the field could never change, and no monitor could tell a known-missing
// integration apart from something newly broken. A permanently-degraded health
// check is exactly the lie monitor this rule exists to prevent. Per-dep state
// still shows Resend as "unconfigured", so nothing is hidden. This also matches
// the convention already used by Optimo and SeizeLead, where unconfigured never
// flips the verdict.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { claudeAvailable } from "@/lib/claude-runner";
import { getAiProviderMode } from "@/lib/ai-provider-setting";

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

// AI dep check (platform B.20, 2026-08-12): honest per the CURRENT admin-set
// provider mode, not a bare env-var presence check. "subscription" mode is
// "ok" only if the Claude CLI binary is actually found; "api_key" mode is
// "ok" only if a key has actually been saved via /sup-min/ai-settings.
// Never reports "ok" based on ANTHROPIC_API_KEY in .env — that path is
// deliberately no longer read.
async function anthropicCheck(): Promise<DepCheck> {
  const t = Date.now();
  try {
    const mode = await getAiProviderMode();
    const { available } = await claudeAvailable();
    return {
      status: available ? "ok" : "unconfigured",
      latencyMs: Date.now() - t,
      error: available ? undefined : `mode=${mode}`,
    };
  } catch (e: unknown) {
    return { status: "fail", latencyMs: Date.now() - t, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function GET() {
  const [dbResult, anthropicResult] = await Promise.all([pingDb(), anthropicCheck()]);

  const checks: Record<string, DepCheck> = {
    db: dbResult,
    // Kite Connect — live prices, OHLC historical data (₹500/mo plan)
    kite: envCheck(["KITE_API_KEY", "KITE_API_SECRET"]),
    // Anthropic — DRHP AI analysis, listing predictor features
    anthropic: anthropicResult,
    // Resend — email notifications
    resend: envCheck(["RESEND_API_KEY"]),
  };

  // Verdict:
  //   - db fail                  → 503 unhealthy
  //   - a CONFIGURED dep failing → 200 degraded (something is actually broken)
  //   - otherwise                → 200 ok (unconfigured deps still listed above)
  const criticalFail = checks.db.status === "fail";
  const anyFail = Object.values(checks).some((c) => c.status === "fail");

  let status: "ok" | "degraded" | "unhealthy";
  let httpCode: number;
  if (criticalFail) {
    status = "unhealthy";
    httpCode = 503;
  } else if (anyFail) {
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
