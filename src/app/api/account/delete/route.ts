import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const Body = z.object({ confirmText: z.string() });

/**
 * POST /api/account/delete
 * DPDP Act 2023 §12 — Right to Erasure.
 * Soft-delete: scrubs PII, sets deletedAt. Logs to DataDeletionLog.
 * Financial / audit rows (watchlist, applications) are anonymised, not deleted.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success || parsed.data.confirmText !== "delete my account") {
    return NextResponse.json({ error: "Type 'delete my account' exactly to confirm." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, deletedAt: true },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (user.deletedAt) return NextResponse.json({ error: "Account already deleted." }, { status: 409 });

  const emailHash = createHash("sha256")
    .update((user.email ?? "").toLowerCase())
    .digest("hex");

  const forwardedFor = req.headers.get("x-forwarded-for");
  const requesterIp = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      email: `deleted_${emailHash.slice(0, 16)}@erased.invalid`,
      name: "DELETED",
      passwordHash: "DELETED_ACCOUNT_NO_LOGIN",
      aiApiKey: null,
      aiProvider: null,
      aiModel: null,
    },
  });

  await prisma.dataDeletionLog.create({
    data: {
      userId,
      emailHash,
      requestedAt: new Date(),
      requesterIp,
      note: "account deletion via /api/account/delete",
    },
  });

  return NextResponse.json({ ok: true });
}
