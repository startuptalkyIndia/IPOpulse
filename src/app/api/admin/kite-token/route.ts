import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptApiKey, decryptMaybe } from "@/lib/encrypt";

// Store Kite token in DB settings table (key-value)
// Falls back to KITE_ACCESS_TOKEN env var if no DB entry

// Role gate per Constitution §1.1 (least privilege, LESSON-088): this route
// overwrites the live broker access token, so session alone is not enough —
// require admin/superadmin role. Cloned from admin/drhp/analyze adminGuard.
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
  const token = (body.token as string)?.trim();

  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  // Store ENCRYPTED at rest (audit HIGH: broker tokens were plaintext).
  const enc = encryptApiKey(token);
  await prisma.$executeRaw`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('kite_access_token', ${enc}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${enc}, updated_at = NOW()
  `;

  return NextResponse.json({ ok: true, message: "Kite token updated. Live prices active until midnight IST." });
}

export async function GET() {
  if (!(await adminGuard())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ value: string; updated_at: Date }>>`
      SELECT value, updated_at FROM settings WHERE key = 'kite_access_token' LIMIT 1
    `;
    if (!rows.length) {
      return NextResponse.json({ token: null, source: "none", active: false });
    }
    const row = rows[0];
    const updatedAt = new Date(row.updated_at);
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const isToday = updatedAt.toDateString() === nowIST.toDateString();
    const plain = decryptMaybe(row.value);
    return NextResponse.json({
      token: plain.substring(0, 6) + "..." + plain.slice(-4),
      updatedAt: updatedAt.toISOString(),
      active: isToday,
      source: "database",
    });
  } catch {
    return NextResponse.json({ token: null, source: "none", active: false });
  }
}
