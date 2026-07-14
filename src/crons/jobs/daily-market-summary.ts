import { prisma } from "@/lib/db";
import { canonicalCloseMap } from "@/lib/price";

/**
 * Daily AI-generated market summary. Runs at 16:30 IST after market close.
 *
 * Inputs:
 *   - latest FII/DII net flow
 *   - top 10 gainers + top 10 losers from today's bhavcopy
 *   - live + closing IPOs
 *
 * Outputs:
 *   - 200-word market summary stored in market_summaries (one row per day)
 *
 * Falls back gracefully if ANTHROPIC_API_KEY is missing — writes a templated
 * summary using just the structured data, no narrative.
 */
export async function generateDailyMarketSummary(): Promise<{ rowsIn: number; notes?: string }> {
  // Latest trading day's bhavcopy snapshot
  const latestDate = await prisma.bhavcopyDaily.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });
  if (!latestDate) return { rowsIn: 0, notes: "No bhavcopy data yet — skipped." };

  // Find the prior trading day (most recent day strictly before latest)
  const priorDate = await prisma.bhavcopyDaily.findFirst({
    where: { date: { lt: latestDate.date } },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  // Canonical close per company (one row per company per day) for both days.
  const [latestMap, priorMap] = await Promise.all([
    canonicalCloseMap(latestDate.date),
    priorDate ? canonicalCloseMap(priorDate.date) : Promise.resolve(new Map<number, number>()),
  ]);
  const cos = new Map(
    (await prisma.company.findMany({ where: { id: { in: [...latestMap.keys()] } }, select: { id: true, name: true, slug: true } }))
      .map((c) => [c.id, c]),
  );
  const movers: { name: string; slug: string; close: number; pct: number }[] = [];
  for (const [companyId, latestClose] of latestMap) {
    const prior = priorMap.get(companyId);
    const co = cos.get(companyId);
    if (!latestClose || !prior || !co) continue;
    const pct = ((latestClose - prior) / prior) * 100;
    if (!Number.isFinite(pct)) continue;
    movers.push({ name: co.name, slug: co.slug, close: latestClose, pct });
  }
  const gainers = movers.slice().sort((a, b) => b.pct - a.pct).slice(0, 10);
  const losers = movers.slice().sort((a, b) => a.pct - b.pct).slice(0, 10);

  const fiiDii = await prisma.fiiDiiDaily.findFirst({ orderBy: { date: "desc" } });
  const fiiNet = fiiDii?.fiiNet ? Number(fiiDii.fiiNet) : null;
  const diiNet = fiiDii?.diiNet ? Number(fiiDii.diiNet) : null;

  const liveIpos = await prisma.ipo.findMany({
    where: { status: { in: ["live", "closed"] }, closeDate: { gte: new Date(Date.now() - 86400000) } },
    select: { name: true, slug: true, status: true },
    take: 5,
  });

  let headline = "Indian markets close for the day";
  let body = "AI narrative not yet generated. Summary updates once Claude is configured.";
  let sentiment: string | null = null;
  let generatedBy: string | null = null;

  // Uses SDK or CLI — whichever is available
  const { callClaudeJson, claudeAvailable } = await import("@/lib/claude-runner");
  const { available, via } = await claudeAvailable();
  if (available) {
    try {
      const ctx = JSON.stringify({
        date: latestDate.date.toISOString().slice(0, 10),
        topGainers: gainers.slice(0, 5).map((g) => ({ n: g.name, p: g.pct.toFixed(2) })),
        topLosers: losers.slice(0, 5).map((l) => ({ n: l.name, p: l.pct.toFixed(2) })),
        fiiNet: fiiNet?.toFixed(0),
        diiNet: diiNet?.toFixed(0),
        liveIpos: liveIpos.map((i) => i.name),
      });
      const parsed = await callClaudeJson<{ headline: string; body: string; sentiment: string }>({
        system: `You are an Indian equity-market commentator. Write a sharp, factual end-of-day market wrap (under 200 words). Output strict JSON: { headline: string (1 line), body: string (3 short paragraphs, plain text), sentiment: "bullish" | "neutral" | "bearish" }. Don't editorialize beyond the data. Be concrete: name companies, cite percentages, mention FII/DII flows.`,
        user: `Today's snapshot: ${ctx}\n\nWrite the wrap.`,
        maxTokens: 600,
      });
      headline = parsed.headline;
      body = parsed.body;
      sentiment = parsed.sentiment;
      generatedBy = via === "cli" ? "claude-cli" : "claude-sonnet-4-5";
    } catch (err) {
      console.error("[daily-summary] AI call failed:", err);
    }
  }

  // Upsert one row per date
  await prisma.marketSummary.upsert({
    where: { date: latestDate.date },
    update: {
      headline,
      body,
      sentiment,
      fiiNet,
      diiNet,
      topGainers: gainers.slice(0, 10),
      topLosers: losers.slice(0, 10),
      generatedBy,
    },
    create: {
      date: latestDate.date,
      headline,
      body,
      sentiment,
      fiiNet,
      diiNet,
      topGainers: gainers.slice(0, 10),
      topLosers: losers.slice(0, 10),
      generatedBy,
    },
  });

  return { rowsIn: 1, notes: `Daily summary for ${latestDate.date.toISOString().slice(0, 10)} (${generatedBy ?? "templated"})` };
}
