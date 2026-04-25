import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateRefCode } from "@/lib/advisor";
import { isFeatureEnabled } from "@/lib/feature-flags";

const schema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^\d{10}$/),
  city: z.string().min(2).max(100),
  experience: z.string().max(1000).optional().nullable(),
  upiId: z.string().max(80).optional().nullable(),
});

export async function POST(request: Request) {
  if (!(await isFeatureEnabled("advisor.enabled"))) {
    return NextResponse.json({ error: "Advisor program is not currently active." }, { status: 404 });
  }
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please fill all required fields correctly." }, { status: 400 });

  const existing = await prisma.advisor.findUnique({ where: { userId } });
  if (existing && existing.status !== "rejected") {
    return NextResponse.json({ error: "You already have an application. Check your dashboard." }, { status: 409 });
  }

  let refCode = generateRefCode(parsed.data.fullName);
  // Avoid collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const collision = await prisma.advisor.findUnique({ where: { refCode } });
    if (!collision) break;
    refCode = generateRefCode(parsed.data.fullName);
  }

  if (existing) {
    // Re-apply after rejection
    await prisma.advisor.update({
      where: { userId },
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        city: parsed.data.city,
        experience: parsed.data.experience,
        upiId: parsed.data.upiId,
        status: "pending",
      },
    });
  } else {
    await prisma.advisor.create({
      data: {
        userId,
        refCode,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        city: parsed.data.city,
        experience: parsed.data.experience,
        upiId: parsed.data.upiId,
        status: "pending",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
