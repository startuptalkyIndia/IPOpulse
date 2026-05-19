import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  ipoName: z.string().min(1).max(200),
  ipoSymbol: z.string().max(50).optional().nullable(),
  ipoSlug: z.string().max(200).optional().nullable(),
  type: z.enum(["gmp_threshold", "allotment", "listing", "subscription_open", "subscription_close"]),
  threshold: z.number().min(0).max(1000).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ alerts });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { ipoName, ipoSymbol, ipoSlug, type, threshold } = parsed.data;

  // Prevent duplicate active alerts for same IPO + type
  const existing = await prisma.alert.findFirst({
    where: { userId, ipoSlug: ipoSlug ?? null, type, isActive: true },
  });
  if (existing) {
    return NextResponse.json({ error: "Alert already exists for this IPO and type" }, { status: 409 });
  }

  const alert = await prisma.alert.create({
    data: {
      userId,
      ipoName,
      ipoSymbol: ipoSymbol ?? null,
      ipoSlug: ipoSlug ?? null,
      type,
      threshold: threshold ?? null,
      isActive: true,
    },
  });

  return NextResponse.json({ ok: true, alert }, { status: 201 });
}
