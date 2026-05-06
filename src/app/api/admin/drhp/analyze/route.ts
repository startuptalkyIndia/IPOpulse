import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeDrhpAuto, analyzeDrhpViaClaudeCli } from "@/lib/drhp-analyzer";
import { persistAnalysis } from "@/crons/jobs/drhp-analyze";

/**
 * Admin force-reanalyze a specific IPO's DRHP.
 *
 * POST body: { slug: "tata-capital-ipo", via?: "sdk" | "cli" }
 *
 * Default path is "sdk" (uses ANTHROPIC_API_KEY on server). The "cli" path
 * shells out to the local `claude` command — only useful when the founder
 * runs this from a logged-in shell on the server (not via HTTP from prod).
 */
async function adminGuard() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "admin" || role === "superadmin";
}

export async function POST(request: Request) {
  if (!(await adminGuard())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = String(body.slug ?? "").trim();
  const via = String(body.via ?? "sdk") === "cli" ? "cli" : "sdk";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const ipo = await prisma.ipo.findUnique({
    where: { slug },
    select: { id: true, name: true, type: true, drhpUrl: true, rhpUrl: true },
  });
  if (!ipo) return NextResponse.json({ error: "IPO not found" }, { status: 404 });

  const pdfUrl = ipo.rhpUrl ?? ipo.drhpUrl;
  if (!pdfUrl) return NextResponse.json({ error: "No DRHP/RHP URL on file" }, { status: 400 });
  const sourceType: "DRHP" | "RHP" = ipo.rhpUrl ? "RHP" : "DRHP";

  // Mark pending immediately so the IPO page shows the "extracting…" state
  await prisma.ipoDrhpAnalysis.upsert({
    where: { ipoId: ipo.id },
    update: { status: "pending", sourceUrl: pdfUrl, sourceType, errorMsg: null },
    create: { ipoId: ipo.id, sourceUrl: pdfUrl, sourceType, status: "pending" },
  });

  try {
    let result: { analysis: import("@/lib/drhp-analyzer").DrhpAnalysis; modelUsed: string };

    // "cli" forces the Claude CLI path; default "sdk" uses auto-detect (SDK → CLI)
    if (via === "cli") {
      result = await analyzeDrhpViaClaudeCli({ pdfUrl, ipoName: ipo.name, ipoType: ipo.type, sourceType });
    } else {
      result = await analyzeDrhpAuto({ pdfUrl, ipoName: ipo.name, ipoType: ipo.type, sourceType });
    }

    await persistAnalysis(ipo.id, pdfUrl, sourceType, result.analysis, result.modelUsed);
    return NextResponse.json({ ok: true, slug, modelUsed: result.modelUsed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.ipoDrhpAnalysis.update({
      where: { ipoId: ipo.id },
      data: { status: "failed", errorMsg: msg.slice(0, 1000) },
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  if (!(await adminGuard())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // List analyses with their status — handy for admin dashboard
  const rows = await prisma.ipoDrhpAnalysis.findMany({
    include: { ipo: { select: { slug: true, name: true } } },
    orderBy: { generatedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ analyses: rows });
}
