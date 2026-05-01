import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9-]+$/;

const watchlistSchema = z.object({
  type: z.enum(["ipo", "stock"]),
  targetSlug: z.string().min(1).max(200).regex(SLUG_REGEX, "Invalid slug"),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const parsed = watchlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { type, targetSlug } = parsed.data;
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
  const parsed = watchlistSchema.safeParse({ type, targetSlug });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  await prisma.watchlistItem.deleteMany({ where: { userId, type: parsed.data.type, targetSlug: parsed.data.targetSlug } });
  return NextResponse.json({ ok: true });
}
