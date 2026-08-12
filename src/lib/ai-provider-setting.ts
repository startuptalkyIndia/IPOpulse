/**
 * Per-product AI-provider setting (founder policy change, 2026-08-12 — see
 * AGENT_OPERATING_STANDARDS.md B.20). Two states:
 *
 *   "subscription" (default) — Claude CLI only, billed on the founder's
 *     Claude subscription. If the CLI/org access is down, AI features fail
 *     closed. NEVER falls through to any API key, even if one is saved.
 *
 *   "api_key" — Anthropic SDK only, using a key the founder pasted into
 *     /sup-min/ai-settings (never read from `.env`/ANTHROPIC_API_KEY). If no
 *     key is saved, AI features fail closed.
 *
 * Storage: reuses the existing generic `settings` key-value table (same one
 * `kite_access_token` / `fyers_access_token` already use) — no new table,
 * no migration needed (DB_STANDARD: additive only, and this needs nothing
 * additive). Key stored encrypted at rest via `src/lib/encrypt.ts`, the same
 * helper already used for broker tokens.
 */

import { prisma } from "@/lib/db";
import { encryptApiKey, decryptMaybe } from "@/lib/encrypt";

export type AiProviderMode = "subscription" | "api_key";

const MODE_KEY = "ai_provider_mode";
const API_KEY_KEY = "ai_anthropic_api_key";

function isValidMode(v: string | undefined | null): v is AiProviderMode {
  return v === "subscription" || v === "api_key";
}

/** Current provider mode. Defaults to "subscription" (the safe, cost-controlled default). */
export async function getAiProviderMode(): Promise<AiProviderMode> {
  try {
    const rows = await prisma.$queryRaw<Array<{ value: string }>>`
      SELECT value FROM settings WHERE key = ${MODE_KEY} LIMIT 1
    `;
    const v = rows[0]?.value;
    return isValidMode(v) ? v : "subscription";
  } catch {
    // Fail closed to the safe, no-token-billing default if settings read fails.
    return "subscription";
  }
}

export async function setAiProviderMode(mode: AiProviderMode): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO settings (key, value, updated_at)
    VALUES (${MODE_KEY}, ${mode}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${mode}, updated_at = NOW()
  `;
}

/** Decrypted Anthropic API key, or null if none saved. Never read from process.env. */
export async function getSavedAnthropicApiKey(): Promise<string | null> {
  try {
    const rows = await prisma.$queryRaw<Array<{ value: string }>>`
      SELECT value FROM settings WHERE key = ${API_KEY_KEY} LIMIT 1
    `;
    const v = rows[0]?.value;
    if (!v) return null;
    return decryptMaybe(v);
  } catch {
    return null;
  }
}

export async function setAnthropicApiKey(rawKey: string): Promise<void> {
  const enc = encryptApiKey(rawKey);
  await prisma.$executeRaw`
    INSERT INTO settings (key, value, updated_at)
    VALUES (${API_KEY_KEY}, ${enc}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${enc}, updated_at = NOW()
  `;
}

export async function clearAnthropicApiKey(): Promise<void> {
  await prisma.$executeRaw`DELETE FROM settings WHERE key = ${API_KEY_KEY}`;
}

export interface AiProviderStatus {
  mode: AiProviderMode;
  hasKey: boolean;
  maskedKey: string | null;
  keyUpdatedAt: string | null;
}

/** Combined status for the admin settings UI. Never returns the raw key. */
export async function getAiProviderStatus(): Promise<AiProviderStatus> {
  const mode = await getAiProviderMode();
  let hasKey = false;
  let maskedKey: string | null = null;
  let keyUpdatedAt: string | null = null;
  try {
    const rows = await prisma.$queryRaw<Array<{ value: string; updated_at: Date }>>`
      SELECT value, updated_at FROM settings WHERE key = ${API_KEY_KEY} LIMIT 1
    `;
    if (rows.length && rows[0].value) {
      hasKey = true;
      keyUpdatedAt = new Date(rows[0].updated_at).toISOString();
      const plain = decryptMaybe(rows[0].value);
      maskedKey = plain.length > 10 ? `${plain.slice(0, 6)}...${plain.slice(-4)}` : "•••• saved";
    }
  } catch {
    // Leave hasKey=false — status endpoint should never throw on a missing/unreadable row.
  }
  return { mode, hasKey, maskedKey, keyUpdatedAt };
}
