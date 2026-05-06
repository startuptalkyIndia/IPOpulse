import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Kite Connect OAuth callback.
 *
 * After the user logs in on Kite's login page, they're redirected here with:
 *   ?request_token=xxx&action=login&status=success
 *
 * We exchange the request_token for an access_token (valid until 6am next day)
 * and store it in the DB so crons can use it without manual daily updates.
 *
 * Setup flow (one-time):
 *   1. Visit: https://kite.trade/connect/login?api_key=YOUR_KEY&v=3
 *   2. Login with your Zerodha credentials
 *   3. Kite redirects to: https://ipopulse.talkytools.com/api/kite/callback?request_token=...
 *   4. This route exchanges it and saves the access token
 *   5. Done — live prices activate immediately
 *
 * SEBI requirement (from April 2026): API calls must come from the registered
 * static IP. The server IP 13.202.189.233 must be registered in Kite profile.
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestToken = url.searchParams.get("request_token");
  const status = url.searchParams.get("status");

  if (status !== "success" || !requestToken) {
    const errMsg = url.searchParams.get("message") ?? "Unknown error";
    return NextResponse.redirect(
      new URL(`/sup-min/dashboard?kite_error=${encodeURIComponent(errMsg)}`, request.url),
    );
  }

  const apiKey = process.env.KITE_API_KEY;
  const apiSecret = process.env.KITE_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "KITE_API_KEY or KITE_API_SECRET not set in .env" },
      { status: 503 },
    );
  }

  try {
    // Exchange request_token for access_token using Kite's session API
    const { createHash } = await import("node:crypto");
    const checksum = createHash("sha256")
      .update(apiKey + requestToken + apiSecret)
      .digest("hex");

    const resp = await fetch("https://api.kite.trade/session/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Kite-Version": "3" },
      body: new URLSearchParams({ api_key: apiKey, request_token: requestToken, checksum }),
    });

    const data = (await resp.json()) as { data?: { access_token?: string; user_name?: string }; message?: string };

    if (!resp.ok || !data.data?.access_token) {
      throw new Error(data.message ?? "Token exchange failed");
    }

    const accessToken = data.data.access_token;

    // Persist in DB — FeatureFlag table re-used as a simple key-value store
    await prisma.featureFlag.upsert({
      where: { key: "kite.access_token" },
      update: { description: accessToken, updatedBy: "oauth-callback" },
      create: {
        key: "kite.access_token",
        label: "Kite Access Token (rotates daily)",
        description: accessToken,
        enabled: true,
        category: "data",
      },
    });

    console.log(`[kite/callback] Access token saved for ${data.data.user_name ?? "user"}`);

    // Redirect back to admin dashboard with success
    return NextResponse.redirect(
      new URL("/sup-min/dashboard?kite_connected=1", request.url),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[kite/callback] Error:", msg);
    return NextResponse.redirect(
      new URL(`/sup-min/dashboard?kite_error=${encodeURIComponent(msg)}`, request.url),
    );
  }
}
