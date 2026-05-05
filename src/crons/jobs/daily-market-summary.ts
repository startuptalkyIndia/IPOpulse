import { prisma } from "@/lib/db";

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

  // Pull both days at once and pair by company
  const both = await prisma.bhavcopyDaily.findMany({
    where: { date: { in: priorDate ? [priorDate.date, latestDate.date] : [latestDate.date] } },
    select: { date: true, close: true, companyId: true, company: { select: { name: true, slug: true } } },
  });
  const byCompany = new Map<number, { latest?: number; prior?: number; name?: string; slug?: string }>();
  for (const r of both) {
    const cur = byCompany.get(r.companyId) ?? {};
    if (r.date.getTime() === latestDate.date.getTime()) cur.latest = Number(r.close);
    else cur.prior = Number(r.close);
    cur.name = r.company.name;
    cur.slug = r.company.slug;
    byCompany.set(r.companyId, cur);
  }
  const movers: { name: string; slug: string; close: number; pct: number }[] = [];
  for (const v of byCompany.values()) {
    if (!v.latest || !v.prior || !v.name || !v.slug) continue;
    const pct = ((v.latest - v.prior) / v.prior) * 100;
    if (!Number.isFinite(pct)) continue;
    movers.push({ name: v.name, slug: v.slug, close: v.latest, pct });
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let headline = "Indian markets close mixed";
  let body = "Market closed for the day. AI narrative is disabled (ANTHROPIC_API_KEY missing).";
  let sentiment: string | null = null;
  let generatedBy: string | null = null;

  if (apiKey) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey });
      const ctx = JSON.stringify({
        date: latestDate.date.toISOString().slice(0, 10),
        topGainers: gainers.slice(0, 5).map((g) => ({ n: g.name, p: g.pct.toFixed(2) })),
        topLosers: losers.slice(0, 5).map((l) => ({ n: l.name, p: l.pct.toFixed(2) })),
        fiiNet: fiiNet?.toFixed(0),
        diiNet: diiNet?.toFixed(0),
        liveIpos: liveIpos.map((i) => i.name),
      });
      const resp = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 600,
        system: `You are an Indian equity-market commentator. Write a sharp, factual end-of-day market wrap (under 200 words). Output strict JSON: { headline: string (1 line), body: string (3 short paragraphs, plain text), sentiment: "bullish" | "neutral" | "bearish" }. Don't editorialize beyond the data. Be concrete: name companies, cite percentages, mention FII/DII flows.`,
        messages: [{ role: "user", content: `Today's snapshot: ${ctx}\n\nWrite the wrap.` }],
      });
      const textBlock = resp.content.find((b) => b.type === "text");
      const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]) as { headline: string; body: string; sentiment: string };
        headline = parsed.headline;
        body = parsed.body;
        sentiment = parsed.sentiment;
      }
      generatedBy = "claude-sonnet-4-5";
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
