/**
 * Crawler Health Heartbeat
 * ─────────────────────────────────────────────────────────────────
 * The root cause of every "empty page" we've fixed: a dead endpoint made a
 * cron report "success" with 0 rows, and it went unnoticed for weeks.
 *
 * This job is the systemic fix. Daily, it checks every critical data source
 * for FRESHNESS (latest row not too old) and presence. Anything stale/empty is
 * flagged and pushed to the ntfy prod-alerts channel + logged, so a silently-
 * dead crawler never slips by again.
 *
 * Freshness windows are weekend-tolerant (market data doesn't update Sat/Sun).
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const NTFY_TOPIC = process.env.NTFY_TOPIC || "talkytools-prod-alerts-7x9k2";

interface Check {
  name: string;
  /** raw SQL returning a single row: { latest: timestamp|null, rows: bigint } */
  sql: string;
  /** max acceptable age in days for the latest row (weekend-tolerant) */
  maxAgeDays: number;
  /** minimum total rows expected */
  minRows: number;
  /** which cron feeds this (for the alert message) */
  cron: string;
}

const CHECKS: Check[] = [
  { name: "EOD prices (bhavcopy)", cron: "nse_bhavcopy", maxAgeDays: 5, minRows: 1000,
    sql: `SELECT MAX(date) AS latest, COUNT(*) AS rows FROM bhavcopy_daily` },
  { name: "Company fundamentals", cron: "screener_fundamentals", maxAgeDays: 9, minRows: 1000,
    sql: `SELECT MAX(fundamentals_at) AS latest, COUNT(*) FILTER (WHERE fundamentals_at IS NOT NULL) AS rows FROM companies` },
  { name: "Signals (RSI/stage/moat)", cron: "compute_signals", maxAgeDays: 5, minRows: 1000,
    sql: `SELECT MAX(signals_at) AS latest, COUNT(*) FILTER (WHERE signals_at IS NOT NULL) AS rows FROM companies` },
  { name: "Nifty indices", cron: "nse_indices", maxAgeDays: 5, minRows: 50,
    sql: `SELECT MAX(date) AS latest, COUNT(*) AS rows FROM nifty_indices` },
  { name: "FII / DII flows", cron: "nse_fii_dii", maxAgeDays: 6, minRows: 5,
    sql: `SELECT MAX(date) AS latest, COUNT(*) AS rows FROM fii_dii_daily` },
  { name: "Mutual fund NAVs", cron: "amfi_navs", maxAgeDays: 5, minRows: 1000,
    sql: `SELECT MAX(nav_as_of) AS latest, COUNT(*) AS rows FROM mutual_funds` },
  { name: "Live/upcoming IPOs", cron: "nse_ipos", maxAgeDays: 9, minRows: 1,
    sql: `SELECT MAX("updatedAt") AS latest, COUNT(*) AS rows FROM ipos` },
  { name: "Bulk deals", cron: "nse_bulk_block", maxAgeDays: 6, minRows: 1,
    sql: `SELECT MAX(date) AS latest, COUNT(*) AS rows FROM bulk_deals` },
  { name: "Insider trades", cron: "nse_insider", maxAgeDays: 10, minRows: 1,
    sql: `SELECT MAX(date) AS latest, COUNT(*) AS rows FROM insider_trades` },
  { name: "US IPOs", cron: "us_ipos", maxAgeDays: 12, minRows: 1,
    sql: `SELECT MAX(filed_date) AS latest, COUNT(*) AS rows FROM us_ipos` },
];

interface Result {
  name: string;
  cron: string;
  ok: boolean;
  reason: string;
  ageDays: number | null;
  rows: number;
}

async function runCheck(c: Check): Promise<Result> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ latest: Date | null; rows: bigint }>>(c.sql);
    const row = rows[0];
    const latest = row?.latest ?? null;
    const count = row ? Number(row.rows) : 0;
    const ageDays = latest ? Math.floor((Date.now() - new Date(latest).getTime()) / 86400000) : null;

    if (count < c.minRows) {
      return { name: c.name, cron: c.cron, ok: false, reason: `only ${count} rows (need ≥${c.minRows}) — crawler likely returning 0`, ageDays, rows: count };
    }
    if (ageDays === null) {
      return { name: c.name, cron: c.cron, ok: false, reason: "no dated rows at all", ageDays, rows: count };
    }
    if (ageDays > c.maxAgeDays) {
      return { name: c.name, cron: c.cron, ok: false, reason: `latest data is ${ageDays}d old (>${c.maxAgeDays}d) — crawler stale/dead`, ageDays, rows: count };
    }
    return { name: c.name, cron: c.cron, ok: true, reason: `fresh (${ageDays}d, ${count.toLocaleString("en-IN")} rows)`, ageDays, rows: count };
  } catch (e) {
    return { name: c.name, cron: c.cron, ok: false, reason: `check error: ${e instanceof Error ? e.message : "?"}`, ageDays: null, rows: 0 };
  }
}

async function pushAlert(title: string, body: string, priority: "high" | "default" = "high") {
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: { Title: title, Priority: priority, Tags: "warning,ipopulse" },
      body,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // ntfy is best-effort; never throw from the heartbeat
  }
}

export async function runCrawlerHealth(): Promise<IngestionResult> {
  const results = await Promise.all(CHECKS.map(runCheck));
  const failures = results.filter((r) => !r.ok);

  // Log full report
  console.log("[crawler-health] ── Data freshness report ──");
  for (const r of results) {
    console.log(`[crawler-health] ${r.ok ? "✅" : "🔴"} ${r.name}: ${r.reason}`);
  }

  if (failures.length > 0) {
    const body = failures.map((f) => `🔴 ${f.name} (${f.cron}): ${f.reason}`).join("\n");
    await pushAlert(`IPOpulse: ${failures.length} crawler(s) stale/empty`, body, "high");
  }

  return {
    rowsIn: results.length - failures.length, // # healthy
    rowsError: failures.length,
    notes: failures.length === 0
      ? `All ${results.length} crawlers healthy`
      : `${failures.length} STALE: ${failures.map((f) => f.name).join(", ")}`,
  };
}
