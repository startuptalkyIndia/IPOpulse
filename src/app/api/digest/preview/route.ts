import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderDigestHtml } from "@/lib/digest";

/**
 * Preview today's email digest — HTML returned raw so admins can
 * sanity-check the template before it ships via Resend.
 */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [liveIpos, upcomingIpos, todayFiiDii] = await Promise.all([
    prisma.ipo.findMany({ where: { status: "live" }, orderBy: { closeDate: "asc" }, take: 5 }),
    prisma.ipo.findMany({ where: { status: "upcoming" }, orderBy: { openDate: "asc" }, take: 5 }),
    prisma.fiiDiiDaily.findFirst({ where: { segment: "cash" }, orderBy: { date: "desc" } }),
  ]);

  const html = renderDigestHtml({ liveIpos, upcomingIpos, todayFiiDii });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
