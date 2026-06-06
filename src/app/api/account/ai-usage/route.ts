import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMonthlyUsage } from "@/lib/ai-budget";

/**
 * GET /api/account/ai-usage
 * Returns current-month AI spend for the authenticated user.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const usage = await getMonthlyUsage(session.user.id);
  return NextResponse.json(usage);
}
