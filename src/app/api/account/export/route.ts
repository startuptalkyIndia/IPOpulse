import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/account/export
 * DPDP Act 2023 §11 — Right to Access.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, plan: true, createdAt: true, planExpiresAt: true },
  });

  const watchlist = await prisma.watchlistItem.findMany({
    where: { userId },
    select: { type: true, targetSlug: true, createdAt: true },
  });

  const applications = await prisma.ipoApplication.findMany({
    where: { userId },
    select: { id: true, ipoId: true, lotsApplied: true, status: true, createdAt: true },
  });

  const aiUsage = await prisma.aiSpendLog.findMany({
    where: { userId },
    select: { model: true, inputTokens: true, outputTokens: true, costInr: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const payload = {
    exported_at: new Date().toISOString(),
    user,
    watchlist,
    ipo_applications: applications,
    ai_usage_last_500: aiUsage,
  };

  const slug = user?.email?.replace(/[^a-z0-9]/gi, "-").toLowerCase() ?? "data";
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ipopulse-export-${slug}-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
