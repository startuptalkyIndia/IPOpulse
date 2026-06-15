import cron from "node-cron";
import { runIngestion } from "./runIngestion";
import { ingestNseFiiDii } from "./jobs/nse-fii-dii";
import { ingestBseIposFromHtml } from "./jobs/bse-ipo-html";
import { ingestNseIpos } from "./jobs/nse-ipos";
import { ingestAmfiNavs } from "./jobs/amfi-navs";
import { ingestNseBhavcopy } from "./jobs/nse-bhavcopy";
import { ingestBseBhavcopy } from "./jobs/bse-bhavcopy";
import { ingestBseAnnouncements } from "./jobs/bse-announcements";
import { sendDailyDigest } from "./jobs/daily-digest";
import { generateDailyMarketSummary } from "./jobs/daily-market-summary";
import { analyzePendingDrhps } from "./jobs/drhp-analyze";
import { ingestUsIpos } from "./jobs/us-ipos";
import { updateUsAdrs } from "./jobs/us-adrs";
import { ingestYahooPrices } from "./jobs/yahoo-prices";
import { ingestBulkBlockDeals } from "./jobs/nse-bulk-block";
import { ingestInsiderTrades } from "./jobs/nse-insider";
import { ingestSuperInvestorHoldings } from "./jobs/super-investor";
import { ingestNseCompanyMaster } from "./jobs/nse-company-master";
import { ingestNseSectorMap } from "./jobs/nse-sector-map";
import { generateNextDayPreview } from "./jobs/next-day-preview";
import { ingestNseIndices } from "./jobs/nse-indices";
import { ingestHistoricalBhavcopy } from "./jobs/nse-bhavcopy-historical";
import { ingestHistoricalFiiDii } from "./jobs/nse-fii-dii-historical";
import { ingestScreenerFundamentals } from "./jobs/screener-fundamentals";
import { syncIpoListings } from "./jobs/bse-listing-sync";
import { ingestKiteLivePrices } from "./jobs/kite-live-prices";
import { ingestFyersLivePrices } from "./jobs/fyers-live-prices";
import { checkIpoAlerts } from "./jobs/check-alerts";
import { runYahooFundamentals, recalcMarketCap } from "./jobs/yahoo-fundamentals";
import { ingestScreenerDeepFundamentals } from "./jobs/screener-deep-scrape";
import { backfillIpoSymbols } from "./jobs/ipo-symbol-backfill";
import { computeSignals } from "./jobs/compute-signals";
import { runCrawlerHealth } from "./jobs/crawler-health";
import { trackGmp } from "./jobs/gmp-tracker";
import { ingestIpoSubscription } from "./jobs/nse-ipo-subscription";
import { prisma } from "@/lib/db";

let started = false;

/**
 * Mark any ingestion_runs left in `running` state for more than 2 hours as
 * failed. Long jobs can be cut off by container restarts/deploys; without
 * this sweep they linger forever and hide real failure signal.
 */
async function reapStaleIngestionRuns() {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
  try {
    const res = await prisma.ingestionRun.updateMany({
      where: { status: "running", startedAt: { lt: cutoff } },
      data: {
        status: "failed",
        finishedAt: new Date(),
        errorMsg: "Reaped on scheduler startup: still running after 2h (process restart)",
      },
    });
    if (res.count > 0) console.log(`[scheduler] reaped ${res.count} stale ingestion_runs`);
  } catch (err) {
    console.log(`[scheduler] reap failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Registers all recurring jobs. Called once on server boot via Next.js
 * instrumentation. Idempotent — safe to call multiple times.
 */
export function startScheduler() {
  if (started) return;
  started = true;

  // Only run in production to avoid spamming sources during local dev.
  if (process.env.NODE_ENV !== "production") {
    console.log("[scheduler] Skipped — not production.");
    return;
  }

  // Best-effort: close out any ingestion_runs left "running" by a prior
  // process restart so dashboards don't show zombie work.
  reapStaleIngestionRuns().catch(() => {});

  // NSE FII/DII — daily at 7:15 PM IST (data is published ~6:30 PM)
  cron.schedule("15 19 * * 1-5", async () => {
    const result = await runIngestion("nse_fii_dii", ingestNseFiiDii);
    console.log(`[cron nse_fii_dii] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // GMP tracker — every 4 hours (IPO Watch updates a few times a day)
  cron.schedule("20 */4 * * *", async () => {
    const result = await runIngestion("gmp_tracker", trackGmp);
    console.log(`[cron gmp_tracker] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // IPO subscription (demand) — every 30 min, 10am–7pm IST (NSE updates through the day)
  cron.schedule("*/30 10-19 * * *", async () => {
    const result = await runIngestion("nse_ipo_subscription", ingestIpoSubscription);
    console.log(`[cron nse_ipo_subscription] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // NSE IPOs — every 2 hours (primary source; BSE page is now an Akamai-blocked SPA)
  // NSE all-upcoming-issues API works from cloud and returns live/upcoming with dates + symbol
  cron.schedule("0 */2 * * *", async () => {
    const result = await runIngestion("nse_ipos", ingestNseIpos);
    console.log(`[cron nse_ipos] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // AMFI Mutual Fund NAVs — daily at 11:00 PM IST (after AMFI publishes ~10 PM)
  cron.schedule("0 23 * * *", async () => {
    const result = await runIngestion("amfi_navs", ingestAmfiNavs);
    console.log(`[cron amfi_navs] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // NSE EOD Bhavcopy — 4:15 PM (post-close, early) + 7:00 PM IST (full EOD with delivery data)
  // After each bhavcopy run, recalculate market_cap from shares × latest price
  for (const sch of ["15 16 * * 1-5", "0 19 * * 1-5"]) {
    cron.schedule(sch, async () => {
      const result = await runIngestion("nse_bhavcopy", ingestNseBhavcopy);
      console.log(`[cron nse_bhavcopy] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
      // Update market_cap for all companies with sharesOutstanding using fresh prices
      recalcMarketCap().catch(() => null);
    }, { timezone: "Asia/Kolkata" });
  }

  // BSE EOD Bhavcopy — 6:30 PM IST (BSE publishes earlier than NSE).
  // Covers ~1,500 BSE-only smallcaps and SME segment invisible to NSE feed.
  cron.schedule("30 18 * * 1-5", async () => {
    const result = await runIngestion("bse_bhavcopy", ingestBseBhavcopy);
    console.log(`[cron bse_bhavcopy] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Yahoo Fundamentals — NIGHTLY 2:00 AM IST (was Sunday-only).
  // Incremental by design: only processes companies whose fundamentalsAt is
  // older than 6 days, so most nights it touches a few hundred companies and
  // the full universe rolls over weekly. Nightly scheduling means a single
  // missed run no longer leaves fundamentals stale for a week.
  cron.schedule("0 2 * * *", async () => {
    const result = await runIngestion("yahoo_fundamentals", runYahooFundamentals);
    console.log(`[cron yahoo_fundamentals] ${result.ok ? "ok" : "failed"} updated=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Screener.in deep fundamentals (10-year quarterly + annual + BS + CF + ratios)
  // Sunday 5:00 AM IST — top 200 companies by market cap, ~10 min/run at 3s/req
  cron.schedule("0 5 * * 0", async () => {
    const result = await runIngestion("screener_deep", ingestScreenerDeepFundamentals);
    console.log(`[cron screener_deep] ${result.ok ? "ok" : "failed"} upserted=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Compute Signals — precompute technicals + quality flags into Company columns
  // Nightly 11:30 PM IST (after bhavcopy 7 PM + screener fundamentals 10:30 PM)
  cron.schedule("30 23 * * 1-5", async () => {
    const result = await runIngestion("compute_signals", computeSignals);
    console.log(`[cron compute_signals] ${result.ok ? "ok" : "failed"} updated=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Crawler Health Heartbeat — daily 9:30 AM IST. Alerts via ntfy if any data
  // source is stale/empty (catches silently-dead crawlers).
  cron.schedule("30 9 * * *", async () => {
    const result = await runIngestion("crawler_health", runCrawlerHealth);
    console.log(`[cron crawler_health] healthy=${result.rowsIn ?? 0} stale=${result.rowsError ?? 0} — ${result.notes ?? ""}`);
  }, { timezone: "Asia/Kolkata" });

  // BSE corporate announcements — UNSCHEDULED (api.bseindia.com is Akamai-blocked
  // from cloud; 114 runs/week returned 0 rows). Job stays in availableJobs for
  // manual trigger if BSE access is ever restored (e.g. via proxy).

  // Daily IPO digest email — 7:00 AM IST, weekdays only (no email on weekends)
  cron.schedule("0 7 * * 1-5", async () => {
    const result = await runIngestion("daily_digest", sendDailyDigest);
    console.log(`[cron daily_digest] ${result.ok ? "ok" : "failed"} sent=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Daily market summary — 16:30 IST after close, weekdays only.
  // Bhavcopy job (19:00) hasn't run yet, but this works off the latest bhavcopy
  // we have, so summary always covers the most recent trading day.
  cron.schedule("30 16 * * 1-5", async () => {
    const result = await runIngestion("daily_market_summary", generateDailyMarketSummary);
    console.log(`[cron daily_market_summary] ${result.ok ? "ok" : "failed"}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // DRHP analyzer — every 6 hours. Caps at DRHP_MAX_PER_RUN (default 3) to
  // protect Anthropic spend. Only re-analyzes when sourceUrl changes.
  cron.schedule("17 */6 * * *", async () => {
    const result = await runIngestion("drhp_analyze", analyzePendingDrhps);
    console.log(`[cron drhp_analyze] ${result.ok ? "ok" : "failed"} analyzed=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // US IPO tracker — SEC EDGAR S-1 feed, every 6 hours
  cron.schedule("45 */6 * * *", async () => {
    const result = await runIngestion("us_ipos", ingestUsIpos);
    console.log(`[cron us_ipos] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // US ADR prices — Yahoo Finance, daily at 22:00 IST (US market close ~21:30 IST)
  cron.schedule("0 22 * * 1-5", async () => {
    const result = await runIngestion("us_adrs", updateUsAdrs);
    console.log(`[cron us_adrs] ${result.ok ? "ok" : "failed"} updated=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Bulk + block deals — daily at 5:30pm IST after NSE uploads
  cron.schedule("30 17 * * 1-5", async () => {
    const result = await runIngestion("nse_bulk_block", ingestBulkBlockDeals);
    console.log(`[cron nse_bulk_block] ${result.ok ? "ok" : "failed"} rows=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Insider trades — daily at 6pm IST (after bulk/block deals)
  cron.schedule("0 18 * * 1-5", async () => {
    const result = await runIngestion("nse_insider", ingestInsiderTrades);
    console.log(`[cron nse_insider] ${result.ok ? "ok" : "failed"} rows=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Super Investor holdings — BSE quarterly filings, monthly on the 15th at 9 AM IST
  cron.schedule("0 9 15 * *", async () => {
    const result = await runIngestion("super_investor", ingestSuperInvestorHoldings);
    console.log(`[cron super_investor] ${result.ok ? "ok" : "failed"} rows=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // screener_fundamentals — UNSCHEDULED (its Pass-1 Yahoo v7 batch API is
  // 401-blocked: 7 runs/week produced 0 rows). Fundamentals now refresh via
  // the nightly yahoo_fundamentals job (cookie-authenticated yahoo-finance2).
  // Job stays in availableJobs for manual trigger.

  // NSE Index data — 4:00 PM (post-close) + 8:00 AM (pre-market, yesterday's close for reference)
  for (const sch of ["0 8 * * 1-5", "0 16 * * 1-5"]) {
    cron.schedule(sch, async () => {
      const result = await runIngestion("nse_indices", ingestNseIndices);
      console.log(`[cron nse_indices] ${result.ok ? "ok" : "failed"} rows=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
    }, { timezone: "Asia/Kolkata" });
  }

  // Next-day market preview — AI "stocks to watch" at 8:30 PM IST (after bhavcopy + FII/DII + listing sync)
  cron.schedule("30 20 * * 1-5", async () => {
    const result = await runIngestion("next_day_preview", generateNextDayPreview);
    console.log(`[cron next_day_preview] ${result.ok ? "ok" : "failed"} rows=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // IPO listing sync — auto-capture listing price + gmpAtListing, daily at 8 PM IST (after bhavcopy at 7 PM)
  cron.schedule("0 20 * * 1-5", async () => {
    const result = await runIngestion("bse_listing_sync", syncIpoListings);
    console.log(`[cron bse_listing_sync] ${result.ok ? "ok" : "failed"} rows=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
    // After listing sync, backfill nse_symbol for newly listed IPOs (unlocks post-listing returns)
    const bf = await runIngestion("ipo_symbol_backfill", backfillIpoSymbols);
    console.log(`[cron ipo_symbol_backfill] matched=${bf.rowsIn ?? 0}`);
  }, { timezone: "Asia/Kolkata" });

  // IPO alert checker — every 2 hours, all days (alerts fire anytime)
  cron.schedule("0 */2 * * *", async () => {
    const result = await runIngestion("check_alerts", checkIpoAlerts);
    console.log(`[cron check_alerts] ${result.ok ? "ok" : "failed"} fired=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Kite Connect real-time prices — every 5 min during market hours (requires daily token)
  // When token is active: updates 1000+ stocks with 0-delay live prices
  // When no token: skips (Yahoo v8 runs every 15 min as fallback)
  cron.schedule("*/5 9-15 * * 1-5", async () => {
    const result = await runIngestion("kite_live", ingestKiteLivePrices);
    if (result.rowsIn && result.rowsIn > 0) {
      console.log(`[cron kite_live] ${result.ok ? "ok" : "failed"} updated=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
    }
  }, { timezone: "Asia/Kolkata" });

  // Fyers live prices — every 5 min during market hours (Kite-backup broker source)
  // Active only when a daily token is set via /sup-min/fyers-token + app has Data API perm.
  cron.schedule("*/5 9-15 * * 1-5", async () => {
    const result = await runIngestion("fyers_live", ingestFyersLivePrices);
    if (result.rowsIn && result.rowsIn > 0) {
      console.log(`[cron fyers_live] ${result.ok ? "ok" : "failed"} updated=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
    }
  }, { timezone: "Asia/Kolkata" });

  // Yahoo Finance v8 prices — every 15 min during market hours (free, 15-min delayed fallback)
  cron.schedule("*/15 9-15 * * 1-5", async () => {
    const result = await runIngestion("yahoo_prices", ingestYahooPrices);
    if (result.rowsIn && result.rowsIn > 0) {
      console.log(`[cron yahoo_prices] ${result.ok ? "ok" : "failed"} updated=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
    }
  }, { timezone: "Asia/Kolkata" });

  console.log("[scheduler] Registered: kite_live(5min), fyers_live(5min), yahoo_prices(15min), nse_ipos(2h), gmp_tracker(4h), nse_ipo_subscription(30min), nse_bhavcopy(2×daily+mktcap_recalc), bse_bhavcopy(6:30PM), yahoo_fundamentals(nightly 2AM), screener_deep(Sun 5AM), nse_fii_dii, nse_indices(2×daily), nse_bulk_block, nse_insider, amfi_navs, compute_signals(11:30PM), crawler_health(9:30AM), daily_market_summary, next_day_preview, bse_listing_sync, check_alerts(2h)");
}

export const availableJobs: Record<string, () => Promise<import("./runIngestion").IngestionResult>> = {
  nse_fii_dii: ingestNseFiiDii,
  bse_ipos: ingestBseIposFromHtml,
  nse_ipos: ingestNseIpos,
  amfi_navs: ingestAmfiNavs,
  nse_bhavcopy: ingestNseBhavcopy,
  bse_bhavcopy: ingestBseBhavcopy,
  bse_announcements: ingestBseAnnouncements,
  daily_digest: sendDailyDigest,
  daily_market_summary: generateDailyMarketSummary,
  drhp_analyze: analyzePendingDrhps,
  us_ipos: ingestUsIpos,
  us_adrs: updateUsAdrs,
  yahoo_prices: ingestYahooPrices,
  kite_live: ingestKiteLivePrices,
  fyers_live: ingestFyersLivePrices,
  nse_bulk_block: ingestBulkBlockDeals,
  nse_insider: ingestInsiderTrades,
  super_investor: ingestSuperInvestorHoldings,
  screener_fundamentals: ingestScreenerFundamentals,
  bse_listing_sync: syncIpoListings,
  nse_company_master: ingestNseCompanyMaster,
  nse_sector_map: ingestNseSectorMap,
  next_day_preview: generateNextDayPreview,
  nse_indices: ingestNseIndices,
  bhavcopy_historical: ingestHistoricalBhavcopy,
  fii_dii_historical: ingestHistoricalFiiDii,
  check_alerts: checkIpoAlerts,
  yahoo_fundamentals: runYahooFundamentals,
  screener_deep: ingestScreenerDeepFundamentals,
  ipo_symbol_backfill: backfillIpoSymbols,
  compute_signals: computeSignals,
  crawler_health: runCrawlerHealth,
  gmp_tracker: trackGmp,
  nse_ipo_subscription: ingestIpoSubscription,
};
