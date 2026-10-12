import { prisma } from "@/lib/db";
import { fetchAllNewsCategories } from "@/lib/scrapers/google-news";
import type { IngestionResult } from "../runIngestion";

/**
 * AI-summarized market news brief. Runs a few times a day (not once, unlike
 * daily_market_summary which is one row per trading day) so the front-page
 * brief stays current through market hours.
 *
 * Reuses the same headlines /api/news already fetches (Google News RSS,
 * across finance/ipo/fii/deals/policy/results) — no new scraping. Summarizes
 * via the same CLI-first Claude pattern used by daily_market_summary /
 * next_day_preview (src/lib/claude-runner.ts), respecting the admin's
 * subscription/api_key provider setting. Falls back to a plain templated
 * line (no fabricated content) if AI is unavailable.
 */
/**
 * IP-03: the Claude CLI sometimes exits 1 for a few hours (shared login token
 * refresh). Retry ONCE after a backoff, then give up. The caller records a real
 * failure; it never stores a fallback line.
 */
export const NEWS_BRIEF_RETRY_BACKOFF_MS = 30_000;
export async function withOneRetry<T>(
  fn: () => Promise<T>,
  backoffMs: number = NEWS_BRIEF_RETRY_BACKOFF_MS,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<T> {
  try {
    return await fn();
  } catch (first) {
    console.warn("[market-news-brief] AI call failed, retrying once:", first instanceof Error ? first.message : first);
    await sleep(backoffMs);
    return await fn();
  }
}

export async function generateMarketNewsBrief(): Promise<IngestionResult> {
  const headlines = await fetchAllNewsCategories();
  if (headlines.length === 0) {
    return { rowsIn: 0, notes: "No headlines fetched — skipped." };
  }

  const topHeadlines = headlines.slice(0, 15);

  let brief = "Market news brief not yet generated. Updates once Claude is configured.";
  let generatedBy: string | null = null;

  const { callClaudeJson, claudeAvailable } = await import("@/lib/claude-runner");
  const { available, via } = await claudeAvailable();
  if (available) {
    try {
      const ctx = topHeadlines.map((h) => `- [${h.category}] ${h.title} (${h.source})`).join("\n");
      const parsed = await withOneRetry(() => callClaudeJson<{ brief: string }>({
        system:
          "You are an Indian equity-market news editor. Summarize the given headlines into ONE factual brief for retail investors. STRICT LIMIT: 60 words or fewer. Plain text, no markdown, no bullet points, no headline verbatim copy — synthesize across stories into flowing prose. Output strict JSON: { brief: string }.",
        user: `Today's headlines:\n${ctx}\n\nWrite the 60-word brief.`,
        maxTokens: 300,
      }));
      brief = parsed.brief;
      generatedBy = via === "cli" ? "claude-cli" : "claude-api";
    } catch (err) {
      console.error("[market-news-brief] AI call failed:", err);
      return {
        rowsIn: 0,
        rowsError: 1,
        status: "failed",
        notes: `AI call failed after 1 retry: ${err instanceof Error ? err.message : "error"}`.slice(0, 500),
      };
    }
  } else {
    return { rowsIn: 0, status: "skipped", notes: "skipped: Claude unavailable - not storing a fallback line." };
  }

  await prisma.newsBrief.create({
    data: {
      brief,
      headlines: topHeadlines.map((h) => ({ title: h.title, link: h.link, source: h.source })),
      generatedBy,
    },
  });

  const wordCount = brief.trim().split(/\s+/).length;
  return {
    rowsIn: 1,
    notes: `Generated brief from ${topHeadlines.length} headlines (${wordCount} words)${wordCount > 60 ? " — exceeded 60-word target" : ""}`,
  };
}
