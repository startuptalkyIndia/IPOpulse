import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const ipoId = Number(body.ipoId);
  const lotsApplied = body.lotsApplied ? Number(body.lotsApplied) : null;
  const category = body.category ? String(body.category) : null;
  const applicationNumber = body.applicationNumber ? String(body.applicationNumber).trim() : null;
  if (!Number.isFinite(ipoId)) {
    return NextResponse.json({ error: "Invalid IPO" }, { status: 400 });
  }
  const app = await prisma.ipoApplication.upsert({
    where: { userId_ipoId: { userId, ipoId } },
    update: { lotsApplied, category, applicationNumber, applyDate: new Date() },
    create: {
      userId,
      ipoId,
      lotsApplied,
      category,
      applicationNumber,
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
  const id = Number(body.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const updated = await prisma.ipoApplication.updateMany({
    where: { id, userId },
    data: {
      status: body.status ? String(body.status) : undefined,
      lotsApplied: body.lotsApplied != null ? Number(body.lotsApplied) : undefined,
      applicationNumber: body.applicationNumber != null ? String(body.applicationNumber) : undefined,
      notes: body.notes != null ? String(body.notes) : undefined,
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
