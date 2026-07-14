import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { exchangeFyersAuthCode, fyersLoginUrl, FYERS_APP_ID } from "@/lib/fyers";
import { encryptApiKey, decryptMaybe } from "@/lib/encrypt";

// Stores the Fyers access_token in the settings table (key-value), minted by
// exchanging the admin's auth_code server-side (the secret never leaves here).

// Role gate per Constitution §1.1 (least privilege): this route mints the live
// broker access token, so session alone isn't enough — require admin role.
async function adminGuard() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "admin" || role === "superadmin";
}

export async function POST(req: NextRequest) {
  if (!(await adminGuard())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const authCode = (body.authCode as string)?.trim();
  if (!authCode || authCode.length < 10) {
    return NextResponse.json({ error: "Invalid auth code" }, { status: 400 });
  }

  const result = await exchangeFyersAuthCode(authCode);
  if (!result.ok || !result.accessToken) {
    return NextResponse.json({ error: result.error ?? "Token exchange failed" }, { status: 400 });
  }

  // Store ENCRYPTED at rest (audit HIGH: broker tokens were plaintext).
  const encAccess = encryptApiKey(result.accessToken);
  await prisma.$executeRaw`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('fyers_access_token', ${encAccess}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${encAccess}, updated_at = NOW()
  `;
  // Stash the refresh token too (valid ~15 days) for future auto-refresh work.
  if (result.refreshToken) {
    const encRefresh = encryptApiKey(result.refreshToken);
    await prisma.$executeRaw`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('fyers_refresh_token', ${encRefresh}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${encRefresh}, updated_at = NOW()
    `;
  }

  return NextResponse.json({ ok: true, message: "Fyers token activated. Live prices on until it expires (~next day)." });
}

export async function GET() {
  if (!(await adminGuard())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const loginUrl = FYERS_APP_ID ? fyersLoginUrl() : null;
  try {
    const rows = await prisma.$queryRaw<Array<{ value: string; updated_at: Date }>>`
      SELECT value, updated_at FROM settings WHERE key = 'fyers_access_token' LIMIT 1
    `;
    if (!rows.length) {
      return NextResponse.json({ token: null, active: false, configured: !!FYERS_APP_ID, loginUrl });
    }
    const updatedAt = new Date(rows[0].updated_at);
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const isToday = updatedAt.toDateString() === nowIST.toDateString();
    const plain = decryptMaybe(rows[0].value);
    return NextResponse.json({
      token: plain.substring(0, 6) + "..." + plain.slice(-4),
      updatedAt: updatedAt.toISOString(),
      active: isToday,
      configured: !!FYERS_APP_ID,
      loginUrl,
    });
  } catch {
    return NextResponse.json({ token: null, active: false, configured: !!FYERS_APP_ID, loginUrl });
  }
}
