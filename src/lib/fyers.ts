/**
 * Fyers API v3 — auth + market-data helper (Kite-backup price source).
 * ─────────────────────────────────────────────────────────────────
 * Fyers uses an OAuth-style flow (like Zerodha Kite):
 *   1. Admin opens the login URL (generate-authcode) and signs in with their
 *      Fyers ID + PIN/TOTP — only they can do this (a credential action).
 *   2. Fyers redirects back to our redirect_uri with ?auth_code=...
 *   3. We exchange auth_code + appIdHash (SHA-256 of "APP_ID:SECRET") for an
 *      access_token at validate-authcode. The secret never leaves the server.
 *   4. access_token authorises quote calls until it expires (≈ next day), so
 *      the admin re-logs in each morning via /sup-min/fyers-token.
 *
 * ⚠️ Quotes require the app to have the **Data API** permission enabled in the
 * Fyers dashboard. An app with only "Profile Details" permission can sign in
 * but every quote call returns a permission error.
 *
 * Docs: https://myapi.fyers.in/docsv3
 */

import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import { decryptMaybe } from "@/lib/encrypt";

const API_BASE = "https://api-t1.fyers.in/api/v3";
const DATA_BASE = "https://api-t1.fyers.in/data";

export const FYERS_APP_ID = process.env.FYERS_APP_ID ?? "";
const FYERS_SECRET = process.env.FYERS_SECRET_ID ?? "";

/** The page Fyers redirects back to after login (must match the app config). */
export function fyersRedirectUri(): string {
  const base = process.env.PUBLIC_BASE_URL ?? "https://ipopulse.talkytools.com";
  return `${base}/sup-min/fyers-token`;
}

/** Step 1: the URL the admin opens to log in and get an auth_code. */
export function fyersLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: FYERS_APP_ID,
    redirect_uri: fyersRedirectUri(),
    response_type: "code",
    state: "ipopulse",
  });
  return `${API_BASE}/generate-authcode?${params.toString()}`;
}

/** appIdHash = SHA-256("APP_ID:SECRET") — required by validate-authcode. */
function appIdHash(): string {
  return createHash("sha256").update(`${FYERS_APP_ID}:${FYERS_SECRET}`).digest("hex");
}

export interface FyersTokenResult {
  ok: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

/** Step 3: exchange an auth_code for an access_token. */
export async function exchangeFyersAuthCode(authCode: string): Promise<FyersTokenResult> {
  if (!FYERS_APP_ID || !FYERS_SECRET) {
    return { ok: false, error: "Fyers credentials not configured on the server." };
  }
  try {
    const resp = await fetch(`${API_BASE}/validate-authcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "authorization_code", appIdHash: appIdHash(), code: authCode }),
      signal: AbortSignal.timeout(15000),
    });
    const data = (await resp.json()) as {
      s?: string; code?: number; message?: string;
      access_token?: string; refresh_token?: string;
    };
    if (data.access_token) {
      return { ok: true, accessToken: data.access_token, refreshToken: data.refresh_token };
    }
    return { ok: false, error: data.message ?? `Fyers returned ${data.code ?? resp.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "exchange failed" };
  }
}

/** Read today's stored access token (settings table), or null if none/stale. */
export async function getFyersToken(): Promise<string | null> {
  try {
    const rows = await prisma.$queryRaw<Array<{ value: string; updated_at: Date }>>`
      SELECT value, updated_at FROM settings WHERE key = 'fyers_access_token' LIMIT 1
    `;
    if (!rows.length) return process.env.FYERS_ACCESS_TOKEN ?? null;
    const updatedAt = new Date(rows[0].updated_at);
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    // Tokens expire ~next day; only trust one set today.
    if (updatedAt.toDateString() === nowIST.toDateString()) return decryptMaybe(rows[0].value);
  } catch {
    // settings table may not exist yet
  }
  return process.env.FYERS_ACCESS_TOKEN ?? null;
}

export interface FyersQuote {
  lp: number;            // last price
  open_price: number;
  high_price: number;
  low_price: number;
  prev_close_price?: number;
  volume?: number;
}

/**
 * Fetch quotes. symbols like "NSE:SBIN-EQ". Fyers allows ~50 per call.
 * Response: { s:"ok", d:[ { n:"NSE:SBIN-EQ", s:"ok", v:{ lp, open_price, ... } } ] }
 * Returns a map keyed by the symbol string. On 401/403 (expired token / missing
 * Data API permission) returns an empty map so callers fall back gracefully.
 */
export async function fetchFyersQuotes(
  token: string,
  symbols: string[],
): Promise<Map<string, FyersQuote>> {
  const out = new Map<string, FyersQuote>();
  const BATCH = 50;
  for (let i = 0; i < symbols.length; i += BATCH) {
    const batch = symbols.slice(i, i + BATCH);
    const url = `${DATA_BASE}/quotes?symbols=${encodeURIComponent(batch.join(","))}`;
    try {
      const resp = await fetch(url, {
        headers: { Authorization: `${FYERS_APP_ID}:${token}` },
        signal: AbortSignal.timeout(12000),
      });
      if (resp.status === 401 || resp.status === 403) {
        console.warn("[fyers] 401/403 — token expired or app lacks Data API permission");
        return out;
      }
      if (!resp.ok) continue;
      const data = (await resp.json()) as { s?: string; d?: Array<{ n?: string; s?: string; v?: FyersQuote }> };
      for (const item of data.d ?? []) {
        if (item.n && item.v && item.s === "ok") out.set(item.n, item.v);
      }
      if (i + BATCH < symbols.length) await new Promise((r) => setTimeout(r, 350));
    } catch {
      continue;
    }
  }
  return out;
}
