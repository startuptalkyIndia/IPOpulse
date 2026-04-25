import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  ipoId: z.number().int().positive(),
  vote: z.enum(["subscribe", "avoid", "watching"]),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in to vote" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.ipoPoll.upsert({
    where: { userId_ipoId: { userId, ipoId: parsed.data.ipoId } },
    update: { vote: parsed.data.vote },
    create: { userId, ipoId: parsed.data.ipoId, vote: parsed.data.vote },
  });
  return NextResponse.json({ ok: true });
}
