/**
 * Local CLI runner for the DRHP analyzer.
 *
 * Usage:
 *   npx tsx scripts/analyze-drhp.ts <slug>           # uses ANTHROPIC_API_KEY (SDK path)
 *   npx tsx scripts/analyze-drhp.ts <slug> --cli     # shells out to `claude` binary (CLI path)
 *   npx tsx scripts/analyze-drhp.ts --all            # batch-analyze all candidates
 *   npx tsx scripts/analyze-drhp.ts --pending        # only pending/failed (skip ready)
 *
 * Both paths produce the same structured output and persist to the same
 * ipo_drhp_analyses table — IPO pages immediately show the cached card
 * after this script returns.
 */

import { PrismaClient } from "@prisma/client";
import { analyzeDrhpViaSdk, analyzeDrhpViaClaudeCli, urlChanged, type DrhpAnalysis } from "../src/lib/drhp-analyzer";

const prisma = new PrismaClient();

interface Persistable {
  ipoId: number;
  sourceUrl: string;
  sourceType: "DRHP" | "RHP";
  analysis: DrhpAnalysis;
  modelUsed: string;
}

async function persist(p: Persistable) {
  await prisma.ipoDrhpAnalysis.upsert({
    where: { ipoId: p.ipoId },
    update: {
      sourceUrl: p.sourceUrl,
      sourceType: p.sourceType,
      status: "ready",
      generatedBy: p.modelUsed,
      generatedAt: new Date(),
      errorMsg: null,
      tldr: p.analysis.tldr ?? null,
      issueDetails: p.analysis.issueDetails ?? null,
      useOfProceeds: p.analysis.useOfProceeds ?? [],
      riskFactors: p.analysis.riskFactors ?? [],
      governance: p.analysis.governance ?? [],
      relatedPartyTransactions: p.analysis.relatedPartyTransactions ?? [],
      contingentLiabilities: p.analysis.contingentLiabilities ?? [],
      peerComparables: p.analysis.peerComparables ?? [],
      financialHighlights: p.analysis.financialHighlights ?? null,
    },
    create: {
      ipoId: p.ipoId,
      sourceUrl: p.sourceUrl,
      sourceType: p.sourceType,
      status: "ready",
      generatedBy: p.modelUsed,
      generatedAt: new Date(),
      tldr: p.analysis.tldr ?? null,
      issueDetails: p.analysis.issueDetails ?? null,
      useOfProceeds: p.analysis.useOfProceeds ?? [],
      riskFactors: p.analysis.riskFactors ?? [],
      governance: p.analysis.governance ?? [],
      relatedPartyTransactions: p.analysis.relatedPartyTransactions ?? [],
      contingentLiabilities: p.analysis.contingentLiabilities ?? [],
      peerComparables: p.analysis.peerComparables ?? [],
      financialHighlights: p.analysis.financialHighlights ?? null,
    },
  });
}

async function analyzeOne(slug: string, useCli: boolean): Promise<{ ok: boolean; msg: string }> {
  const ipo = await prisma.ipo.findUnique({
    where: { slug },
    include: { drhpAnalysis: true },
  });
  if (!ipo) return { ok: false, msg: `IPO not found: ${slug}` };

  const pdfUrl = ipo.rhpUrl ?? ipo.drhpUrl;
  if (!pdfUrl) return { ok: false, msg: `No DRHP/RHP URL for ${slug}` };
  const sourceType: "DRHP" | "RHP" = ipo.rhpUrl ? "RHP" : "DRHP";

  console.log(`▸ ${slug} — ${sourceType} via ${useCli ? "CLI" : "SDK"} — ${pdfUrl}`);

  // Mark pending so the IPO page reflects state immediately
  await prisma.ipoDrhpAnalysis.upsert({
    where: { ipoId: ipo.id },
    update: { status: "pending", sourceUrl: pdfUrl, sourceType, errorMsg: null },
    create: { ipoId: ipo.id, sourceUrl: pdfUrl, sourceType, status: "pending" },
  });

  try {
    const opts = { pdfUrl, ipoName: ipo.name, ipoType: ipo.type, sourceType };
    const result = useCli
      ? await analyzeDrhpViaClaudeCli(opts)
      : await analyzeDrhpViaSdk({ ...opts, apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

    await persist({ ipoId: ipo.id, sourceUrl: pdfUrl, sourceType, ...result });
    console.log(`  ✓ stored — ${result.analysis.riskFactors.length} risks · ${result.analysis.governance.length} governance · ${result.analysis.peerComparables.length} peers`);
    return { ok: true, msg: "stored" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.ipoDrhpAnalysis.update({
      where: { ipoId: ipo.id },
      data: { status: "failed", errorMsg: msg.slice(0, 1000) },
    });
    console.error(`  ✗ failed: ${msg}`);
    return { ok: false, msg };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const useCli = args.includes("--cli");
  const all = args.includes("--all");
  const pendingOnly = args.includes("--pending");
  const slug = args.find((a) => !a.startsWith("--"));

  if (!useCli && !process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY missing. Either set it or pass --cli to use the local Claude CLI.");
    process.exit(1);
  }

  if (slug) {
    const r = await analyzeOne(slug, useCli);
    process.exit(r.ok ? 0 : 1);
  }

  if (all || pendingOnly) {
    const where = pendingOnly
      ? { drhpAnalysis: { status: { in: ["pending", "failed"] } } }
      : { OR: [{ drhpUrl: { not: null } }, { rhpUrl: { not: null } }] };
    const ipos = await prisma.ipo.findMany({ where, include: { drhpAnalysis: true }, take: 50 });
    console.log(`Analyzing ${ipos.length} IPO(s)…`);
    let ok = 0;
    let failed = 0;
    for (const ipo of ipos) {
      const pdfUrl = ipo.rhpUrl ?? ipo.drhpUrl;
      if (!pdfUrl) continue;
      // Skip if cached and url unchanged and not pending
      if (ipo.drhpAnalysis?.status === "ready" && !urlChanged(ipo.drhpAnalysis.sourceUrl, pdfUrl)) {
        console.log(`▸ ${ipo.slug} — cached, skipping`);
        continue;
      }
      const r = await analyzeOne(ipo.slug, useCli);
      r.ok ? ok++ : failed++;
    }
    console.log(`\nDone. ${ok} ok, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  }

  console.error("Pass <slug> or --all or --pending. See header for usage.");
  process.exit(1);
}

main().finally(() => prisma.$disconnect());
