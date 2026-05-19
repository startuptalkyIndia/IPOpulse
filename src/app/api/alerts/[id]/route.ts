import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing alert id" }, { status: 400 });
  }

  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert || alert.userId !== userId) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  // Soft-delete: mark as inactive rather than hard-delete
  await prisma.alert.update({ where: { id }, data: { isActive: false } });

  return NextResponse.json({ ok: true });
}
