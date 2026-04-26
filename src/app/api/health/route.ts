// Auto-generated /api/health endpoint
// Used by docker healthcheck + uptime monitors. Returns 200 if app is alive.

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    project: "IPOPulse",
    timestamp: new Date().toISOString(),
    uptime: typeof process !== "undefined" ? process.uptime() : null,
  })
}
