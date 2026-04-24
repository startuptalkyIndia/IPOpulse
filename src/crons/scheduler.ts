import cron from "node-cron";
import { runIngestion } from "./runIngestion";
import { ingestNseFiiDii } from "./jobs/nse-fii-dii";

let started = false;

/**
 * Registers all recurring jobs. Called once on server boot via Next.js
 * instrumentation. Idempotent — safe to call multiple times.
 */
export function startScheduler() {
  if (started) return;
  started = true;

  // Only run in production to avoid spamming NSE during local dev.
  if (process.env.NODE_ENV !== "production") {
    console.log("[scheduler] Skipped — not production.");
    return;
  }

  // NSE FII/DII — daily at 7:15 PM IST (data is published ~6:30 PM)
  cron.schedule("15 19 * * 1-5", async () => {
    const result = await runIngestion("nse_fii_dii", ingestNseFiiDii);
    console.log(`[cron nse_fii_dii] ${result.ok ? "ok" : "failed"} rowsIn=${result.rowsIn ?? 0}${result.error ? ` error=${result.error}` : ""}`);
  }, { timezone: "Asia/Kolkata" });

  console.log("[scheduler] Registered jobs: nse_fii_dii (daily 19:15 IST Mon-Fri)");
}

export const availableJobs: Record<string, () => Promise<import("./runIngestion").IngestionResult>> = {
  nse_fii_dii: ingestNseFiiDii,
};
