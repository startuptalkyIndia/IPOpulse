import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { validateCommentBody, checkRateLimit } from "@/lib/community";

const schema = z.object({
  targetType: z.enum(["ipo", "stock"]),
  targetSlug: z.string().max(200),
  body: z.string().max(1000),
  parentId: z.number().int().positive().optional().nullable(),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { banned: true } });
  if (user?.banned) return NextResponse.json({ error: "Account suspended" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const v = validateCommentBody(parsed.data.body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const rl = await checkRateLimit(userId);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many comments — try again in ${Math.ceil((rl.nextAllowedInMs ?? 0) / 1000)}s` },
      { status: 429 },
    );
  }

  const created = await prisma.comment.create({
    data: {
      userId,
      targetType: parsed.data.targetType,
      targetSlug: parsed.data.targetSlug,
      body: parsed.data.body.trim(),
      parentId: parsed.data.parentId ?? null,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const c = await prisma.comment.findUnique({ where: { id } });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = role === "admin" || role === "superadmin";
  if (c.userId !== userId && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
