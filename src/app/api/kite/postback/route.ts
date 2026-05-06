import { NextResponse } from "next/server";

/**
 * Kite Connect postback URL.
 *
 * Kite sends order updates here when orders are placed/executed/rejected.
 * IPOpulse is a READ-ONLY data platform — no orders are placed via the API —
 * so this endpoint just acknowledges the webhook and logs it for debugging.
 *
 * If you ever add trading features, parse `body` here.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    // Log for debugging — remove in production if traffic is high
    if (process.env.NODE_ENV !== "production") {
      console.log("[kite/postback]", JSON.stringify(body));
    }
  } catch {
    // Kite sometimes sends form-encoded; ignore parse errors
  }
  // Kite expects a 200 response
  return new NextResponse("ok", { status: 200 });
}

// Kite may also GET this URL to verify it's reachable
export async function GET() {
  return new NextResponse("ok", { status: 200 });
}
