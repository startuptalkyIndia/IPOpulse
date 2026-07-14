import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Save a Web Push subscription endpoint. Called from the browser after the
 * user grants notification permission and the SW returns a subscription.
 *
 * Auth: optional. Anonymous subscriptions are accepted (so we can ping
 * non-logged-in users about live IPOs); logged-in subs are tied to userId.
 */

export async function POST(request: Request) {
  // Rate limit anonymous subscription spam (audit MEDIUM M17).
  if (!rateLimit("push_sub", clientIp(request), 20, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
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
  if (!rateLimit("push_unsub", clientIp(request), 20, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const endpoint = String(body?.endpoint ?? "");
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });

  // Possession of the (unguessable) endpoint is the primary proof. As defense in
  // depth (audit MEDIUM M17), a logged-in caller may only delete their own or
  // anonymous subscriptions — never another logged-in user's device.
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const where = userId ? { endpoint, OR: [{ userId }, { userId: null }] } : { endpoint };
  await prisma.pushSubscription.deleteMany({ where });
  return NextResponse.json({ ok: true });
}
