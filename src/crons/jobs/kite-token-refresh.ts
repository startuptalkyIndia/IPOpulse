/**
 * Daily Kite access token auto-refresh.
 *
 * Runs at 5:55am IST every weekday — before Kite invalidates the previous
 * day's token at 6am. Uses TOTP to complete the full login flow automatically.
 *
 * Requires in .env:
 *   ZERODHA_USER_ID, ZERODHA_PASSWORD, ZERODHA_TOTP_SECRET,
 *   KITE_API_KEY, KITE_API_SECRET
 *
 * Falls back gracefully if any env var is missing — logs a warning and skips.
 * The feature does nothing if credentials aren't configured; no error or crash.
 */

import { prisma } from "@/lib/db";
import { kiteAutoLogin } from "@/lib/kite-totp";
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";

export async function refreshKiteToken(): Promise<{ rowsIn: number; notes?: string }> {
  const required = ["ZERODHA_USER_ID", "ZERODHA_PASSWORD", "ZERODHA_TOTP_SECRET", "KITE_API_KEY", "KITE_API_SECRET"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    return { rowsIn: 0, notes: `TOTP auto-login skipped — missing: ${missing.join(", ")}. Add to .env to activate.` };
  }

  try {
    const { accessToken, userName } = await kiteAutoLogin();

    // Save to DB
    await prisma.featureFlag.upsert({
      where: { key: "kite.access_token" },
      update: { description: accessToken, updatedBy: "totp-cron", updatedAt: new Date() },
      create: {
        key: "kite.access_token",
        label: "Kite Access Token (auto-refreshed daily)",
        description: accessToken,
        enabled: true,
        category: "data",
        updatedBy: "totp-cron",
      },
    });

    // Also update the runtime .env so the current process picks it up
    try {
      const envPath = join(process.cwd(), ".env");
      let env = await readFile(envPath, "utf8").catch(() => "");
      env = env.replace(/^KITE_ACCESS_TOKEN=.*/m, "").trim();
      env += `\nKITE_ACCESS_TOKEN=${accessToken}\n`;
      await writeFile(envPath, env, "utf8");
    } catch {
      // .env update is best-effort — DB is the source of truth at runtime
    }

    console.log(`[kite-token-refresh] Token refreshed for ${userName}`);
    return { rowsIn: 1, notes: `Kite access token auto-refreshed for ${userName}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[kite-token-refresh] Failed: ${msg}`);
    return { rowsIn: 0, notes: `TOTP login failed: ${msg}` };
  }
}
