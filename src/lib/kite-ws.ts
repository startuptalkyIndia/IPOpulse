/**
 * Zerodha Kite Connect WebSocket scaffold.
 *
 * Status: scaffold only. Activates once KITE_API_KEY + KITE_ACCESS_TOKEN
 * are set in the server .env. Without them, getKiteTicker() returns null
 * and callers fall back to bhavcopy / cron-refreshed prices.
 *
 * Required env:
 *   KITE_API_KEY        — your Kite Connect app API key
 *   KITE_ACCESS_TOKEN   — daily-rotated access token (refreshed via OAuth flow)
 *
 * Pricing: Kite Connect is ₹2,000/year + ₹500/month (₹6,000/year + setup) for
 * the developer account. WebSocket gets you live ticks across NSE/BSE/MCX.
 *
 * Usage pattern (in any server-side route):
 *   import { getKiteTicker } from "@/lib/kite-ws";
 *   const t = getKiteTicker();
 *   if (t) { t.subscribe([738561]); t.on("tick", (ticks) => ...) }
 *
 * For the actual implementation we'd use the official `kiteconnect` npm
 * package. The scaffold below documents the interface and flags clearly
 * when credentials are missing.
 */

interface KiteTickerLike {
  subscribe: (instrumentTokens: number[]) => void;
  unsubscribe: (instrumentTokens: number[]) => void;
  setMode: (mode: "ltp" | "quote" | "full", tokens: number[]) => void;
  on: (event: "tick" | "connect" | "disconnect" | "error" | "close" | "reconnect" | "noreconnect" | "order_update", callback: (payload: unknown) => void) => void;
  connect: () => void;
  disconnect: () => void;
  connected: () => boolean;
}

let cached: KiteTickerLike | null = null;
let warned = false;

export function getKiteTicker(): KiteTickerLike | null {
  const apiKey = process.env.KITE_API_KEY;
  const accessToken = process.env.KITE_ACCESS_TOKEN;

  if (!apiKey || !accessToken) {
    if (!warned) {
      console.log("[kite-ws] Disabled — KITE_API_KEY / KITE_ACCESS_TOKEN missing. Falling back to bhavcopy.");
      warned = true;
    }
    return null;
  }

  if (cached) return cached;

  // The actual KiteTicker implementation will be loaded here once `kiteconnect`
  // is added to dependencies. We keep the import dynamic so the scaffold
  // doesn't fail builds when the package isn't installed.
  console.log("[kite-ws] KITE_API_KEY present but `kiteconnect` package not installed yet. Run `npm i kiteconnect` and uncomment the dynamic import below.");
  // Example wiring (uncomment when package is added):
  //
  //   const { KiteTicker } = await import("kiteconnect");
  //   const ticker = new KiteTicker({ api_key: apiKey, access_token: accessToken }) as KiteTickerLike;
  //   ticker.connect();
  //   ticker.on("connect", () => console.log("[kite-ws] connected"));
  //   ticker.on("disconnect", () => console.log("[kite-ws] disconnected"));
  //   ticker.on("error", (e) => console.error("[kite-ws] error", e));
  //   cached = ticker;
  //   return cached;

  return null;
}

/**
 * Refresh the daily access token via Kite's OAuth flow. Run this once per
 * trading day (5:00 AM IST recommended) — Kite tokens expire at 6:00 AM
 * the morning after issuance.
 *
 * The full flow:
 *   1. POST to https://api.kite.trade/session/token with api_key + request_token
 *      + checksum (SHA256 of api_key + request_token + api_secret)
 *   2. Receive access_token; persist to env or DB
 *   3. Use it for all subsequent API + WebSocket calls
 */
export async function refreshKiteAccessToken(_requestToken: string): Promise<string | null> {
  // Wire up once kiteconnect is added.
  return null;
}
