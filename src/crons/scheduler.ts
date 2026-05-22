import cron from "node-cron";
import { runIngestion } from "./runIngestion";
import { ingestNseFiiDii } from "./jobs/nse-fii-dii";
import { ingestBseIposFromHtml } from "./jobs/bse-ipo-html";
import { ingestAmfiNavs } from "./jobs/amfi-navs";
import { ingestNseBhavcopy } from "./jobs/nse-bhavcopy";
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
import { checkIpoAlerts } from "./jobs/check-alerts";

let started = false;

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

  // NSE FII/DII — daily at 7:15 PM IST (data is published ~6:30 PM)
  cron.schedule("15 19 * * 1-5", async () => {
    const result = await runIngestion("nse_fii_dii", ingestNseFiiDii);
    console.log(`[cron nse_fii_dii] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // BSE IPOs — every 4 hours
  cron.schedule("0 */4 * * *", async () => {
    const result = await runIngestion("bse_ipos", ingestBseIposFromHtml);
    console.log(`[cron bse_ipos] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // AMFI Mutual Fund NAVs — daily at 11:00 PM IST (after AMFI publishes ~10 PM)
  cron.schedule("0 23 * * *", async () => {
    const result = await runIngestion("amfi_navs", ingestAmfiNavs);
    console.log(`[cron amfi_navs] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // NSE EOD Bhavcopy — 4:15 PM (post-close, early) + 7:00 PM IST (full EOD with delivery data)
  for (const sch of ["15 16 * * 1-5", "0 19 * * 1-5"]) {
    cron.schedule(sch, async () => {
      const result = await runIngestion("nse_bhavcopy", ingestNseBhavcopy);
      console.log(`[cron nse_bhavcopy] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
    }, { timezone: "Asia/Kolkata" });
  }

  // BSE corporate announcements — every 30 min during market hours, hourly outside
  cron.schedule("*/30 9-16 * * 1-5", async () => {
    const result = await runIngestion("bse_announcements", ingestBseAnnouncements);
    console.log(`[cron bse_announcements] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });
  cron.schedule("0 17-21 * * *", async () => {
    const result = await runIngestion("bse_announcements", ingestBseAnnouncements);
    console.log(`[cron bse_announcements] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

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

  // Screener fundamentals — Yahoo Finance quoteSummary, nightly at 10:30 PM IST
  cron.schedule("30 22 * * 1-5", async () => {
    const result = await runIngestion("screener_fundamentals", ingestScreenerFundamentals);
    console.log(`[cron screener_fundamentals] ${result.ok ? "ok" : "failed"} rows=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

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

  // Yahoo Finance v8 prices — every 15 min during market hours (free, 15-min delayed fallback)
  cron.schedule("*/15 9-15 * * 1-5", async () => {
    const result = await runIngestion("yahoo_prices", ingestYahooPrices);
    if (result.rowsIn && result.rowsIn > 0) {
      console.log(`[cron yahoo_prices] ${result.ok ? "ok" : "failed"} updated=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
    }
  }, { timezone: "Asia/Kolkata" });

  console.log("[scheduler] Registered: kite_live(5min), yahoo_prices(15min), nse_bhavcopy(2×daily), nse_fii_dii, nse_indices(2×daily), bse_announcements(30min), amfi_navs, daily_market_summary, next_day_preview, bse_listing_sync, check_alerts(2h)");
}

export const availableJobs: Record<string, () => Promise<import("./runIngestion").IngestionResult>> = {
  nse_fii_dii: ingestNseFiiDii,
  bse_ipos: ingestBseIposFromHtml,
  amfi_navs: ingestAmfiNavs,
  nse_bhavcopy: ingestNseBhavcopy,
  bse_announcements: ingestBseAnnouncements,
  daily_digest: sendDailyDigest,
  daily_market_summary: generateDailyMarketSummary,
  drhp_analyze: analyzePendingDrhps,
  us_ipos: ingestUsIpos,
  us_adrs: updateUsAdrs,
  yahoo_prices: ingestYahooPrices,
  kite_live: ingestKiteLivePrices,
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
};
