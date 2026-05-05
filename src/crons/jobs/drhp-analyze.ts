import { prisma } from "@/lib/db";
import { analyzeDrhpViaSdk, urlChanged, type DrhpAnalysis } from "@/lib/drhp-analyzer";

/**
 * Background DRHP analyzer.
 *
 * Strategy:
 *   1. Find IPOs with a DRHP/RHP URL that have no analysis yet, OR whose
 *      cached analysis points at a different sourceUrl (DRHP→RHP transition,
 *      issuer republished a corrected DRHP, etc).
 *   2. Cap to N per run so a single bad cycle can't drain Anthropic credits.
 *   3. Mark each as "pending", run, store result. On error mark as "failed"
 *      with errorMsg — admin can force-retry from the dashboard.
 *
 * Cost guard: each call is roughly $0.60–$1.20. With MAX_PER_RUN=3 and a
 * 6-hour cron, that's at most $14/day in the absolute worst case — and far
 * less in practice since most IPOs get analyzed once and cached forever.
 */

const MAX_PER_RUN = parseInt(process.env.DRHP_MAX_PER_RUN ?? "3", 10);

export async function analyzePendingDrhps(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { rowsIn: 0, notes: "ANTHROPIC_API_KEY missing — DRHP analyzer skipped." };
  }

  // Candidate IPOs:
  //   - have drhpUrl OR rhpUrl
  //   - either have no analysis row, or cached row's sourceUrl differs
  //   - status not "ready" (so failed/stale ones get retried)
  const candidates = await prisma.ipo.findMany({
    where: {
      OR: [{ drhpUrl: { not: null } }, { rhpUrl: { not: null } }],
    },
    include: { drhpAnalysis: true },
    orderBy: [{ openDate: "asc" }, { id: "desc" }],
    take: 200, // pre-filter, then we drop down to MAX_PER_RUN
  });

  type Candidate = (typeof candidates)[number];

  function shouldAnalyze(ipo: Candidate): { reason: string; pdfUrl: string; sourceType: "DRHP" | "RHP" } | null {
    // Prefer RHP over DRHP — more complete, post-anchor.
    const pdfUrl = ipo.rhpUrl ?? ipo.drhpUrl ?? null;
    const sourceType: "DRHP" | "RHP" = ipo.rhpUrl ? "RHP" : "DRHP";
    if (!pdfUrl) return null;

    if (!ipo.drhpAnalysis) return { reason: "no analysis yet", pdfUrl, sourceType };
    if (ipo.drhpAnalysis.status === "failed") return { reason: "previous attempt failed — retry", pdfUrl, sourceType };
    if (urlChanged(ipo.drhpAnalysis.sourceUrl, pdfUrl)) return { reason: "source URL changed", pdfUrl, sourceType };
    return null;
  }

  const work: { ipo: Candidate; pdfUrl: string; sourceType: "DRHP" | "RHP"; reason: string }[] = [];
  for (const ipo of candidates) {
    const decision = shouldAnalyze(ipo);
    if (decision) work.push({ ipo, ...decision });
    if (work.length >= MAX_PER_RUN) break;
  }

  if (work.length === 0) {
    return { rowsIn: 0, notes: "All DRHPs analyzed and current." };
  }

  let success = 0;
  let failed = 0;
  const log: string[] = [];

  for (const w of work) {
    // Mark pending
    await prisma.ipoDrhpAnalysis.upsert({
      where: { ipoId: w.ipo.id },
      update: { status: "pending", sourceUrl: w.pdfUrl, sourceType: w.sourceType, errorMsg: null },
      create: { ipoId: w.ipo.id, sourceUrl: w.pdfUrl, sourceType: w.sourceType, status: "pending" },
    });

    try {
      const { analysis, modelUsed } = await analyzeDrhpViaSdk({
        apiKey,
        pdfUrl: w.pdfUrl,
        ipoName: w.ipo.name,
        ipoType: w.ipo.type,
        sourceType: w.sourceType,
      });
      await persistAnalysis(w.ipo.id, w.pdfUrl, w.sourceType, analysis, modelUsed);
      success++;
      log.push(`✓ ${w.ipo.slug} (${w.reason})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await prisma.ipoDrhpAnalysis.update({
        where: { ipoId: w.ipo.id },
        data: { status: "failed", errorMsg: msg.slice(0, 1000) },
      });
      failed++;
      log.push(`✗ ${w.ipo.slug} (${msg.slice(0, 80)})`);
    }
  }

  return {
    rowsIn: success,
    rowsError: failed,
    notes: `DRHP analyses: ${success} ok / ${failed} failed. ${log.join(" · ")}`,
  };
}

export async function persistAnalysis(
  ipoId: number,
  sourceUrl: string,
  sourceType: "DRHP" | "RHP",
  analysis: DrhpAnalysis,
  modelUsed: string,
) {
  await prisma.ipoDrhpAnalysis.upsert({
    where: { ipoId },
    update: {
      sourceUrl,
      sourceType,
      status: "ready",
      generatedBy: modelUsed,
      generatedAt: new Date(),
      errorMsg: null,
      tldr: analysis.tldr ?? null,
      issueDetails: analysis.issueDetails ?? null,
      useOfProceeds: analysis.useOfProceeds ?? [],
      riskFactors: analysis.riskFactors ?? [],
      governance: analysis.governance ?? [],
      relatedPartyTransactions: analysis.relatedPartyTransactions ?? [],
      contingentLiabilities: analysis.contingentLiabilities ?? [],
      peerComparables: analysis.peerComparables ?? [],
      financialHighlights: analysis.financialHighlights ?? null,
    },
    create: {
      ipoId,
      sourceUrl,
      sourceType,
      status: "ready",
      generatedBy: modelUsed,
      generatedAt: new Date(),
      tldr: analysis.tldr ?? null,
      issueDetails: analysis.issueDetails ?? null,
      useOfProceeds: analysis.useOfProceeds ?? [],
      riskFactors: analysis.riskFactors ?? [],
      governance: analysis.governance ?? [],
      relatedPartyTransactions: analysis.relatedPartyTransactions ?? [],
      contingentLiabilities: analysis.contingentLiabilities ?? [],
      peerComparables: analysis.peerComparables ?? [],
      financialHighlights: analysis.financialHighlights ?? null,
    },
  });
}
