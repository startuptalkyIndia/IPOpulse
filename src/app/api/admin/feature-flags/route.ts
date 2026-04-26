import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clearFeatureFlagCache, seedFlagDefinitions } from "@/lib/feature-flags";
import { maybePingSitemap } from "@/lib/seo-ping";

async function adminGuard() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "admin" || role === "superadmin";
}

export async function GET() {
  if (!(await adminGuard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await seedFlagDefinitions();
  const flags = await prisma.featureFlag.findMany({ orderBy: [{ category: "asc" }, { label: "asc" }] });
  return NextResponse.json({ flags });
}

export async function POST(request: Request) {
  if (!(await adminGuard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const key = String(body.key ?? "");
  const enabled = !!body.enabled;
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  const session = await auth();
  const updated = await prisma.featureFlag.update({
    where: { key },
    data: { enabled, updatedBy: (session?.user as { email?: string } | undefined)?.email ?? null },
  });
  clearFeatureFlagCache();
  // A flag flip can expose or hide whole sections of the site, which materially
  // changes what's crawlable. Best-effort ping (internally throttled to 1/hr).
  maybePingSitemap().catch(() => {});
  return NextResponse.json({ ok: true, flag: updated });
}
