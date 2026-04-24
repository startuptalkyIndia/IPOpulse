import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const type = String(body.type ?? "");
  const targetSlug = String(body.targetSlug ?? "");
  if (!["ipo", "stock"].includes(type) || !targetSlug) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const item = await prisma.watchlistItem.upsert({
    where: { userId_type_targetSlug: { userId, type, targetSlug } },
    update: {},
    create: { userId, type, targetSlug },
  });
  return NextResponse.json({ ok: true, id: item.id });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "";
  const targetSlug = searchParams.get("targetSlug") ?? "";
  if (!type || !targetSlug) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }
  await prisma.watchlistItem.deleteMany({ where: { userId, type, targetSlug } });
  return NextResponse.json({ ok: true });
}
