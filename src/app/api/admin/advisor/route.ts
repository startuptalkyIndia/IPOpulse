import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const advisorId = Number(body.advisorId);
  const status = String(body.status ?? "");
  if (!Number.isFinite(advisorId) || !["pending", "approved", "rejected", "suspended"].includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await prisma.advisor.update({
    where: { id: advisorId },
    data: {
      status,
      approvedAt: status === "approved" ? new Date() : undefined,
    },
  });
  return NextResponse.json({ ok: true });
}
