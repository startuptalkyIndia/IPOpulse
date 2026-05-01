import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const VALID_STATUSES = ["applied", "allotted", "not_allotted", "refunded"] as const;
const VALID_CATEGORIES = ["RII", "NII", "QIB", "employee", "other"] as const;

const postSchema = z.object({
  ipoId: z.number().int().positive(),
  lotsApplied: z.number().int().positive().max(10000).optional().nullable(),
  category: z.enum(VALID_CATEGORIES).optional().nullable(),
  applicationNumber: z.string().max(40).regex(/^[A-Za-z0-9-]*$/).optional().nullable(),
});

const patchSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(VALID_STATUSES).optional(),
  lotsApplied: z.number().int().positive().max(10000).optional().nullable(),
  applicationNumber: z.string().max(40).regex(/^[A-Za-z0-9-]*$/).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { ipoId, lotsApplied, category, applicationNumber } = parsed.data;
  const app = await prisma.ipoApplication.upsert({
    where: { userId_ipoId: { userId, ipoId } },
    update: { lotsApplied: lotsApplied ?? null, category: category ?? null, applicationNumber: applicationNumber ?? null, applyDate: new Date() },
    create: {
      userId,
      ipoId,
      lotsApplied: lotsApplied ?? null,
      category: category ?? null,
      applicationNumber: applicationNumber ?? null,
      applyDate: new Date(),
    },
  });
  return NextResponse.json({ ok: true, id: app.id });
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { id, status, lotsApplied, applicationNumber, notes } = parsed.data;
  const updated = await prisma.ipoApplication.updateMany({
    where: { id, userId },
    data: {
      status: status ?? undefined,
      lotsApplied: lotsApplied !== undefined ? lotsApplied : undefined,
      applicationNumber: applicationNumber !== undefined ? applicationNumber : undefined,
      notes: notes !== undefined ? notes : undefined,
    },
  });
  return NextResponse.json({ ok: true, updated: updated.count });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.ipoApplication.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
