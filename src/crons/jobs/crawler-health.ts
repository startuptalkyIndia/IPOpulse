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
  // Per-source freshness (audit HIGH): a dead BSE feed was masked when the check
  // scanned all sources together and NSE rows kept it looking fresh.
  { name: "EOD prices (NSE bhavcopy)", cron: "nse_bhavcopy", maxAgeDays: 5, minRows: 1000,
    sql: `SELECT MAX(date) AS latest, COUNT(*) AS rows FROM bhavcopy_daily WHERE source = 'nse'` },
  { name: "EOD prices (BSE bhavcopy)", cron: "bse_bhavcopy", maxAgeDays: 6, minRows: 100,
    sql: `SELECT MAX(date) AS latest, COUNT(*) AS rows FROM bhavcopy_daily WHERE source = 'bse'` },
  // Fundamentals refresh nightly (yahoo_fundamentals) — rolls full universe weekly
  { name: "Company fundamentals", cron: "yahoo_fundamentals", maxAgeDays: 4, minRows: 1000,
    sql: `SELECT MAX(fundamentals_at) AS latest, COUNT(*) FILTER (WHERE fundamentals_at IS NOT NULL) AS rows FROM companies` },
  // Deep financials scrape weekly (screener_deep, Sun) — allow 10d slack
  { name: "Deep financials (Screener)", cron: "screener_deep", maxAgeDays: 10, minRows: 1000,
    sql: `SELECT MAX(captured_at) AS latest, COUNT(*) AS rows FROM annual_financials` },
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

/** Ping an external dead-man service (healthchecks.io-style: /fail suffix on failure). */
async function pingDeadMan(healthy: boolean) {
  const url = process.env.HEALTHCHECK_PING_URL;
  if (!url) return;
  try {
    await fetch(healthy ? url : `${url.replace(/\/$/, "")}/fail`, { signal: AbortSignal.timeout(8000) });
  } catch {
    // best-effort; never throw from the heartbeat
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

// ─── Layer 2: job liveness — did each scheduled cron actually RUN? ──────────
// Data-freshness checks can't distinguish "endpoint broke" from "cron never
// fired" (container crash, scheduler bug, stuck run). This checks the
// ingestion_runs ledger for a successful run within the expected window.
const JOB_LIVENESS: Array<{ job: string; maxAgeHours: number }> = [
  { job: "nse_bhavcopy", maxAgeHours: 80 },        // 2×/weekday — 80h tolerates weekends
  { job: "nse_ipos", maxAgeHours: 12 },            // every 2h
  { job: "amfi_navs", maxAgeHours: 36 },           // daily
  { job: "yahoo_fundamentals", maxAgeHours: 36 },  // nightly
  { job: "compute_signals", maxAgeHours: 80 },     // weekdays
  { job: "nse_bulk_block", maxAgeHours: 80 },      // weekdays
  { job: "nse_insider", maxAgeHours: 80 },         // weekdays
  { job: "nse_indices", maxAgeHours: 80 },         // weekdays
  { job: "nse_fii_dii", maxAgeHours: 80 },         // weekdays
  { job: "us_ipos", maxAgeHours: 24 },             // every 6h
  { job: "screener_deep", maxAgeHours: 192 },      // weekly (Sun) + 1d slack
  { job: "gmp_tracker", maxAgeHours: 12 },         // every 4h (throws on parse failure)
  { job: "nse_ipo_subscription", maxAgeHours: 24 },// every 30m; succeeds even w/ 0 live IPOs
  { job: "bse_bhavcopy", maxAgeHours: 80 },        // daily weekday (audit HIGH: was unmonitored)
  { job: "bse_listing_sync", maxAgeHours: 80 },    // daily weekday
  { job: "us_adrs", maxAgeHours: 30 },             // every 6h
  { job: "check_alerts", maxAgeHours: 12 },        // every 2h
  { job: "yahoo_prices", maxAgeHours: 80 },        // 15min in market hours (fallback price path)
  { job: "super_investor", maxAgeHours: 792 },     // monthly (15th) + slack
];

async function checkJobLiveness(): Promise<Result[]> {
  const out: Result[] = [];
  for (const j of JOB_LIVENESS) {
    try {
      const rows = await prisma.$queryRawUnsafe<Array<{ latest: Date | null }>>(
        `SELECT MAX(started_at) AS latest FROM ingestion_runs WHERE job_name = '${j.job}' AND status = 'success'`,
      );
      const latest = rows[0]?.latest ?? null;
      const ageHours = latest ? (Date.now() - new Date(latest).getTime()) / 3600000 : null;
      if (ageHours === null) {
        out.push({ name: `job:${j.job}`, cron: j.job, ok: false, reason: "never succeeded", ageDays: null, rows: 0 });
      } else if (ageHours > j.maxAgeHours) {
        out.push({ name: `job:${j.job}`, cron: j.job, ok: false, reason: `last success ${Math.round(ageHours)}h ago (>${j.maxAgeHours}h) — cron not firing or failing`, ageDays: null, rows: 0 });
      } else {
        out.push({ name: `job:${j.job}`, cron: j.job, ok: true, reason: `last success ${Math.round(ageHours)}h ago`, ageDays: null, rows: 0 });
      }
    } catch (e) {
      out.push({ name: `job:${j.job}`, cron: j.job, ok: false, reason: `liveness check error: ${e instanceof Error ? e.message : "?"}`, ageDays: null, rows: 0 });
    }
  }
  return out;
}

export async function runCrawlerHealth(): Promise<IngestionResult> {
  const [dataResults, jobResults] = await Promise.all([
    Promise.all(CHECKS.map(runCheck)),
    checkJobLiveness(),
  ]);
  const results = [...dataResults, ...jobResults];
  const failures = results.filter((r) => !r.ok);

  // Log full report
  console.log("[crawler-health] ── Data freshness + job liveness report ──");
  for (const r of results) {
    console.log(`[crawler-health] ${r.ok ? "✅" : "🔴"} ${r.name}: ${r.reason}`);
  }

  if (failures.length > 0) {
    const body = failures.map((f) => `🔴 ${f.name}: ${f.reason}`).join("\n");
    await pushAlert(`IPOpulse: ${failures.length} crawler issue(s)`, body, "high");
  }

  // Dead-man switch (audit HIGH): the heartbeat lives inside the very process it
  // monitors, so a crashed/OOMed container silently stops ALL crons AND the
  // alerter. Pinging an external service (e.g. healthchecks.io) on each run means
  // that service alerts YOU when the ping stops — the only signal that survives a
  // dead container. Set HEALTHCHECK_PING_URL to enable; no-op if unset.
  await pingDeadMan(failures.length === 0);

  return {
    rowsIn: results.length - failures.length, // # healthy
    rowsError: failures.length,
    notes: failures.length === 0
      ? `All ${results.length} checks healthy (${dataResults.length} data + ${jobResults.length} liveness)`
      : `${failures.length} ISSUES: ${failures.map((f) => f.name).join(", ")}`,
  };
}
