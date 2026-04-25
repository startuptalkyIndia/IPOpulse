import cron from "node-cron";
import { runIngestion } from "./runIngestion";
import { ingestNseFiiDii } from "./jobs/nse-fii-dii";
import { ingestBseIposFromHtml } from "./jobs/bse-ipo-html";
import { ingestAmfiNavs } from "./jobs/amfi-navs";
import { ingestNseBhavcopy } from "./jobs/nse-bhavcopy";
import { ingestBseAnnouncements } from "./jobs/bse-announcements";

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

  console.log("[scheduler] Registered: nse_fii_dii (19:15 IST Mon-Fri), bse_ipos (every 4h), amfi_navs (23:00 IST), nse_bhavcopy (19:00 Mon-Fri), bse_announcements (every 2h 9-21 IST)");
}

export const availableJobs: Record<string, () => Promise<import("./runIngestion").IngestionResult>> = {
  nse_fii_dii: ingestNseFiiDii,
  bse_ipos: ingestBseIposFromHtml,
  amfi_navs: ingestAmfiNavs,
  nse_bhavcopy: ingestNseBhavcopy,
  bse_announcements: ingestBseAnnouncements,
};
