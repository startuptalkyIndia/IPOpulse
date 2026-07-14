/**
 * Next-Day Market Preview
 * ------------------------
 * Runs at 8:00 PM IST (after bhavcopy + FII/DII are in).
 * Analyses today's data and generates a "what to watch tomorrow" report via Claude CLI.
 *
 * Inputs:
 *   - Top 5 gainers + top 5 losers (today's bhavcopy)
 *   - FII/DII net flows (today)
 *   - IPO events tomorrow (opens, closes, allotment dates)
 *   - Corporate actions tomorrow (ex-dividends, board meetings)
 *   - Sector-wise momentum (which sector moved most today)
 *
 * Outputs stored in next_day_previews (one row per trading day).
 * Displayed at /research/next-day with history.
 */

import { prisma } from "@/lib/db";
import { canonicalRowsForDate, canonicalCloseMap } from "@/lib/price";
import { callClaudeJson, claudeAvailable } from "@/lib/claude-runner";
import type { IngestionResult } from "../runIngestion";

interface StockToWatch {
  symbol: string;
  name: string;
  reason: string;
  todayPct: number;
}

interface KeyEvent {
  type: string;
  desc: string;
}

interface PreviewJson {
  headline: string;
  body: string;
  sentiment: "cautious" | "neutral" | "positive";
  sectorFocus: string;
  fiiSignal: "buy" | "sell" | "neutral";
  stocksToWatch: StockToWatch[];
  keyEvents: KeyEvent[];
}

function tomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  // Skip weekends
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Saturday → Monday
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday → Monday
  return d;
}

export async function generateNextDayPreview(): Promise<IngestionResult> {
  const forDate = tomorrow();

  // Check if already generated for tomorrow
  const existing = await prisma.nextDayPreview.findUnique({ where: { forDate } });
  if (existing) return { rowsIn: 0, notes: "Preview already exists for tomorrow" };

  // === Gather today's data ===

  // Today's bhavcopy date
  const latest = await prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
  if (!latest) return { rowsIn: 0, notes: "No bhavcopy data yet" };

  const prior = await prisma.bhavcopyDaily.findFirst({
    where: { date: { lt: latest.date } }, orderBy: { date: "desc" }, select: { date: true },
  });

  // Top movers — canonical rows (one per company) + company info.
  const canon = await canonicalRowsForDate(latest.date);
  const priorMap = prior ? await canonicalCloseMap(prior.date) : new Map<number, number>();
  const cos = new Map(
    (await prisma.company.findMany({ where: { id: { in: canon.map((r) => r.companyId) } }, select: { id: true, name: true, nseSymbol: true, sector: true } }))
      .map((c) => [c.id, c]),
  );

  const movers: Array<{ symbol: string; name: string; sector: string | null; pct: number; close: number }> = [];
  for (const r of canon) {
    const prev = priorMap.get(r.companyId);
    const co = cos.get(r.companyId);
    if (!prev || !co) continue;
    const pct = ((r.close - prev) / prev) * 100;
    if (!Number.isFinite(pct)) continue;
    movers.push({ symbol: co.nseSymbol ?? "", name: co.name, sector: co.sector, pct, close: r.close });
  }

  const gainers = [...movers].sort((a, b) => b.pct - a.pct).slice(0, 5);
  const losers = [...movers].sort((a, b) => a.pct - b.pct).slice(0, 5);

  // Sector with most average gain
  const sectorMap = new Map<string, number[]>();
  for (const m of movers) {
    if (!m.sector) continue;
    const arr = sectorMap.get(m.sector) ?? [];
    arr.push(m.pct);
    sectorMap.set(m.sector, arr);
  }
  let topSector = "";
  let topSectorAvg = -Infinity;
  for (const [sector, pcts] of sectorMap) {
    const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    if (avg > topSectorAvg) { topSector = sector; topSectorAvg = avg; }
  }

  // FII/DII today
  const fiiDii = await prisma.fiiDiiDaily.findFirst({ orderBy: { date: "desc" } });
  const fiiNet = fiiDii?.fiiNet ? Number(fiiDii.fiiNet) : null;
  const diiNet = fiiDii?.diiNet ? Number(fiiDii.diiNet) : null;

  // Tomorrow's IPO events
  const tomorrowStart = new Date(forDate);
  const tomorrowEnd = new Date(forDate);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  const ipoEvents = await prisma.ipo.findMany({
    where: {
      OR: [
        { openDate: { gte: tomorrowStart, lt: tomorrowEnd } },
        { closeDate: { gte: tomorrowStart, lt: tomorrowEnd } },
        { allotmentDate: { gte: tomorrowStart, lt: tomorrowEnd } },
        { listingDate: { gte: tomorrowStart, lt: tomorrowEnd } },
      ],
    },
    select: { name: true, openDate: true, closeDate: true, allotmentDate: true, listingDate: true },
    take: 5,
  });

  const keyEvents: KeyEvent[] = [];
  for (const ipo of ipoEvents) {
    if (ipo.openDate && ipo.openDate >= tomorrowStart && ipo.openDate < tomorrowEnd)
      keyEvents.push({ type: "ipo_open", desc: `${ipo.name} IPO opens` });
    if (ipo.closeDate && ipo.closeDate >= tomorrowStart && ipo.closeDate < tomorrowEnd)
      keyEvents.push({ type: "ipo_close", desc: `${ipo.name} IPO closes` });
    if (ipo.allotmentDate && ipo.allotmentDate >= tomorrowStart && ipo.allotmentDate < tomorrowEnd)
      keyEvents.push({ type: "allotment", desc: `${ipo.name} allotment` });
    if (ipo.listingDate && ipo.listingDate >= tomorrowStart && ipo.listingDate < tomorrowEnd)
      keyEvents.push({ type: "listing", desc: `${ipo.name} lists` });
  }

  // Corporate actions tomorrow
  const corpActions = await prisma.corporateAction.findMany({
    where: {
      OR: [
        { exDate: { gte: tomorrowStart, lt: tomorrowEnd } },
        { recordDate: { gte: tomorrowStart, lt: tomorrowEnd } },
      ],
      actionType: { in: ["dividend", "board_meeting", "agm"] },
    },
    select: { company: { select: { name: true } }, actionType: true, purpose: true },
    take: 5,
  });
  for (const ca of corpActions) {
    keyEvents.push({ type: ca.actionType, desc: `${ca.company.name} — ${ca.purpose ?? ca.actionType}` });
  }

  // === Generate AI preview ===
  let headline = `Market preview for ${forDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}`;
  let body = "AI preview not available — Claude not configured.";
  let sentiment: string | null = null;
  let sectorFocus = topSector || null;
  let fiiSignal: string | null = fiiNet != null ? (fiiNet > 0 ? "buy" : fiiNet < -1000 ? "sell" : "neutral") : null;
  let stocksToWatch: StockToWatch[] = gainers.slice(0, 3).map((g) => ({
    symbol: g.symbol, name: g.name, reason: `Up ${g.pct.toFixed(1)}% today`, todayPct: g.pct,
  }));
  let generatedBy: string | null = null;

  const { available, via } = await claudeAvailable();
  if (available) {
    const SYSTEM = `You are IPOpulse's market research AI. Generate a concise "stocks to watch tomorrow" preview for Indian equity markets.

Return ONLY valid JSON matching this schema:
{
  "headline": "string (max 80 chars — e.g. 'IT leads; watch HDFC Bank near 1,680')",
  "body": "string (120-150 words — narrative covering what happened today, FII/DII signal, sector spotlight, 2-3 stocks to watch, risk factors)",
  "sentiment": "cautious|neutral|positive",
  "sectorFocus": "string (sector name)",
  "fiiSignal": "buy|sell|neutral",
  "stocksToWatch": [
    { "symbol": "NSE_SYMBOL", "name": "Company Name", "reason": "1-line reason to watch", "todayPct": number }
  ],
  "keyEvents": [{ "type": "string", "desc": "string" }]
}

Rules:
- stocksToWatch: pick 3-5 stocks worth tracking tomorrow based on today's momentum + sector context
- Be specific: mention price levels, % moves, sector catalysts
- keyEvents: include upcoming IPOs, ex-dividends, results if any
- Keep body conversational but data-driven — no fluff`;

    const ctx = JSON.stringify({
      date: latest.date.toISOString().slice(0, 10),
      forDate: forDate.toISOString().slice(0, 10),
      topGainers: gainers.map((g) => ({ symbol: g.symbol, name: g.name, pct: g.pct.toFixed(2), close: g.close })),
      topLosers: losers.map((l) => ({ symbol: l.symbol, name: l.name, pct: l.pct.toFixed(2), close: l.close })),
      fiiNet: fiiNet?.toFixed(0),
      diiNet: diiNet?.toFixed(0),
      topSector: topSector || "mixed",
      topSectorAvg: topSectorAvg.toFixed(1),
      keyEvents,
    });

    try {
      const result = await callClaudeJson<PreviewJson>(
        { system: SYSTEM, user: `Today's market data:\n${ctx}\n\nGenerate tomorrow's watch list.` }
      );
      headline = result.headline;
      body = result.body;
      sentiment = result.sentiment;
      sectorFocus = result.sectorFocus;
      fiiSignal = result.fiiSignal;
      stocksToWatch = result.stocksToWatch ?? stocksToWatch;
      if (result.keyEvents?.length) keyEvents.push(...result.keyEvents);
      generatedBy = `claude-cli (${via})`;
    } catch (e) {
      // Fall back to structured template
      headline = `${topSector || "Mixed"} in focus; FII ${fiiNet != null ? (fiiNet > 0 ? "buyers" : "sellers") : "data pending"}`;
      body = `Today's top gainer was ${gainers[0]?.name ?? "—"} (+${gainers[0]?.pct.toFixed(1) ?? 0}%). FII net: ₹${fiiNet?.toFixed(0) ?? "—"} Cr. ${topSector} sector led the rally. Watch these names tomorrow.`;
      sentiment = fiiNet != null ? (fiiNet > 0 ? "positive" : fiiNet < -2000 ? "cautious" : "neutral") : "neutral";
      generatedBy = "templated";
    }
  }

  await prisma.nextDayPreview.upsert({
    where: { forDate },
    create: { forDate, headline, body, sentiment, sectorFocus, fiiSignal, stocksToWatch: stocksToWatch as object[], keyEvents: keyEvents as object[], fiiNet, diiNet, generatedBy },
    update: { headline, body, sentiment, sectorFocus, fiiSignal, stocksToWatch: stocksToWatch as object[], keyEvents: keyEvents as object[], fiiNet, diiNet, generatedBy },
  });

  return { rowsIn: 1, notes: `Preview for ${forDate.toISOString().slice(0, 10)} (${generatedBy})` };
}

