import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Save a Web Push subscription endpoint. Called from the browser after the
 * user grants notification permission and the SW returns a subscription.
 *
 * Auth: optional. Anonymous subscriptions are accepted (so we can ping
 * non-logged-in users about live IPOs); logged-in subs are tied to userId.
 */

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const body = await request.json().catch(() => null);
  const endpoint = String(body?.endpoint ?? "");
  const p256dh = String(body?.keys?.p256dh ?? "");
  const authKey = String(body?.keys?.auth ?? "");

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
  }

  const ua = request.headers.get("user-agent") ?? null;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh, auth: authKey, userId, ua, lastSeen: new Date() },
    create: { endpoint, p256dh, auth: authKey, userId, ua },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const endpoint = String(body?.endpoint ?? "");
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  return NextResponse.json({ ok: true });
}
