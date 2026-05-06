/**
 * Automated Kite Connect daily token refresh via TOTP.
 *
 * Zerodha requires a fresh access token every day (expires at 6am IST).
 * This module automates the login so you never have to do it manually.
 *
 * Required .env variables:
 *   ZERODHA_USER_ID=CV8955
 *   ZERODHA_PASSWORD=your_password
 *   ZERODHA_TOTP_SECRET=ABCD1234EFGH5678  ← 16-char base32 from Zerodha 2FA setup
 *   KITE_API_KEY=1uz5zfoxho7bd6qr
 *   KITE_API_SECRET=your_api_secret
 *
 * How to get ZERODHA_TOTP_SECRET:
 *   1. Go to kite.zerodha.com/account/security
 *   2. Click "Reset external TOTP"
 *   3. Copy the text key shown (e.g. "ABCD EFGH IJKL MNOP" — remove spaces)
 *   4. Add to .env as ZERODHA_TOTP_SECRET=ABCDEFGHIJKLMNOP
 *
 * How it works:
 *   1. Generates current TOTP code from the secret using RFC 6238
 *   2. POSTs to Zerodha login endpoint (not Kite Connect — the actual web login)
 *   3. Exchanges session for Kite Connect request_token
 *   4. Exchanges request_token for access_token via Kite API
 *   5. Saves to DB + .env for app use
 */

import { createHmac } from "node:crypto";

// ── TOTP implementation (RFC 6238, no external deps) ───────────────────────

function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = encoded.toUpperCase().replace(/[\s=]/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const char of cleaned) {
    const idx = alphabet.indexOf(char);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

export function generateTotp(secret: string, time?: number): string {
  const epoch = Math.floor((time ?? Date.now()) / 1000);
  const counter = Math.floor(epoch / 30);
  const key = base32Decode(secret);
  const msg = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    msg[i] = counter & 0xff;
    // @ts-ignore
    counter >>> 8; // just for shift
  }
  // Set counter bytes properly
  let c = counter;
  for (let i = 7; i >= 0; i--) { msg[i] = c & 0xff; c = Math.floor(c / 256); }

  const hmac = createHmac("sha1", key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 1000000).padStart(6, "0");
}

// ── Kite auto-login ────────────────────────────────────────────────────────

interface LoginResult {
  accessToken: string;
  userId: string;
  userName: string;
}

export async function kiteAutoLogin(): Promise<LoginResult> {
  const userId = process.env.ZERODHA_USER_ID;
  const password = process.env.ZERODHA_PASSWORD;
  const totpSecret = process.env.ZERODHA_TOTP_SECRET;
  const apiKey = process.env.KITE_API_KEY;
  const apiSecret = process.env.KITE_API_SECRET;

  if (!userId || !password || !totpSecret || !apiKey || !apiSecret) {
    throw new Error(
      "TOTP auto-login requires: ZERODHA_USER_ID, ZERODHA_PASSWORD, ZERODHA_TOTP_SECRET, KITE_API_KEY, KITE_API_SECRET in .env",
    );
  }

  const totpCode = generateTotp(totpSecret);
  const HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
    "X-Kite-Version": "3",
  };

  // Step 1: Login with user_id + password
  const loginResp = await fetch("https://kite.zerodha.com/api/login", {
    method: "POST",
    headers: HEADERS,
    body: new URLSearchParams({ user_id: userId, password }),
    signal: AbortSignal.timeout(15000),
  });
  const loginData = (await loginResp.json()) as { status?: string; data?: { request_id?: string }; message?: string };
  if (loginData.status !== "success" || !loginData.data?.request_id) {
    throw new Error(`Zerodha login failed: ${loginData.message ?? "unknown error"}`);
  }
  const requestId = loginData.data.request_id;

  // Step 2: 2FA with TOTP
  const twoFaResp = await fetch("https://kite.zerodha.com/api/twofa", {
    method: "POST",
    headers: HEADERS,
    body: new URLSearchParams({ user_id: userId, request_id: requestId, twofa_value: totpCode, twofa_type: "totp" }),
    signal: AbortSignal.timeout(15000),
  });
  const twoFaData = (await twoFaResp.json()) as { status?: string; message?: string };
  if (twoFaData.status !== "success") {
    throw new Error(`TOTP verification failed: ${twoFaData.message ?? "check TOTP secret"}`);
  }

  // Step 3: Get Kite Connect request_token via OAuth redirect
  // We hit the Kite Connect login URL and follow redirects to capture the token
  const oauthUrl = `https://kite.trade/connect/login?api_key=${apiKey}&v=3`;
  const oauthResp = await fetch(oauthUrl, {
    headers: { ...HEADERS, Cookie: twoFaResp.headers.get("set-cookie") ?? "" },
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });

  // Kite redirects to the callback URL with ?request_token=...
  const redirectUrl = oauthResp.headers.get("location") ?? "";
  const requestToken = new URL(redirectUrl.startsWith("http") ? redirectUrl : `https://dummy${redirectUrl}`).searchParams.get("request_token");

  if (!requestToken) {
    throw new Error("Could not extract request_token from Kite OAuth redirect");
  }

  // Step 4: Exchange request_token for access_token
  const { createHash } = await import("node:crypto");
  const checksum = createHash("sha256").update(apiKey + requestToken + apiSecret).digest("hex");

  const tokenResp = await fetch("https://api.kite.trade/session/token", {
    method: "POST",
    headers: { "X-Kite-Version": "3", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ api_key: apiKey, request_token: requestToken, checksum }),
    signal: AbortSignal.timeout(15000),
  });
  const tokenData = (await tokenResp.json()) as { status?: string; data?: { access_token?: string; user_name?: string; user_id?: string }; message?: string };
  if (tokenData.status !== "success" || !tokenData.data?.access_token) {
    throw new Error(`Token exchange failed: ${tokenData.message ?? "unknown"}`);
  }

  return {
    accessToken: tokenData.data.access_token,
    userId: tokenData.data.user_id ?? userId,
    userName: tokenData.data.user_name ?? "Shubham",
  };
}
