import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ email: z.string().email().max(200) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const email = parsed.data.email.toLowerCase().trim();
  await prisma.newsletterSub.upsert({
    where: { email },
    update: {},
    create: { email, verified: false },
  });
  return NextResponse.json({ ok: true });
}
