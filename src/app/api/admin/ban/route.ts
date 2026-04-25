import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const userId = String(body.userId ?? "");
  const banned = !!body.banned;
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { banned } });
  return NextResponse.json({ ok: true });
}
