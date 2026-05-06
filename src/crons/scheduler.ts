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
import { ingestScreenerFundamentals } from "./jobs/screener-fundamentals";
import { syncIpoListings } from "./jobs/bse-listing-sync";

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

  // NSE EOD Bhavcopy — daily at 7:00 PM IST after market close
  cron.schedule("0 19 * * 1-5", async () => {
    const result = await runIngestion("nse_bhavcopy", ingestNseBhavcopy);
    console.log(`[cron nse_bhavcopy] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // BSE corporate announcements — every 2 hours during business hours (9-21 IST)
  cron.schedule("0 9-21/2 * * *", async () => {
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

  // IPO listing sync — auto-capture listing price + gmpAtListing, daily at 8 PM IST (after bhavcopy at 7 PM)
  cron.schedule("0 20 * * 1-5", async () => {
    const result = await runIngestion("bse_listing_sync", syncIpoListings);
    console.log(`[cron bse_listing_sync] ${result.ok ? "ok" : "failed"} rows=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  // Indian stock live prices via Yahoo Finance — every 15 min during market hours
  // Free, no auth, ~15 min delayed. Replaces Kite Connect (₹500/mo) for screener data.
  cron.schedule("*/15 * * * *", async () => {
    const result = await runIngestion("yahoo_prices", ingestYahooPrices);
    if (result.rowsIn && result.rowsIn > 0) {
      console.log(`[cron yahoo_prices] ${result.ok ? "ok" : "failed"} updated=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
    }
  }, { timezone: "Asia/Kolkata" });

  console.log("[scheduler] Registered: nse_fii_dii, bse_ipos, amfi_navs, nse_bhavcopy, bse_announcements, daily_digest, daily_market_summary, drhp_analyze, us_ipos, us_adrs, yahoo_prices");
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
  nse_bulk_block: ingestBulkBlockDeals,
  nse_insider: ingestInsiderTrades,
  super_investor: ingestSuperInvestorHoldings,
  screener_fundamentals: ingestScreenerFundamentals,
  bse_listing_sync: syncIpoListings,
};
