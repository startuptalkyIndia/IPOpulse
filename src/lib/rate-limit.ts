/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Works well in a single-container Docker deployment.
 * For multi-instance deploys, swap the Map for Redis.
 */

import type { NextRequest } from "next/server";

interface Entry { count: number; resetAt: number }

const store = new Map<string, Entry>();

// Prune stale entries every 10 minutes so the Map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 10 * 60 * 1000);

/**
 * Extract the real client IP from a Next.js request.
 * X-Real-IP first: our nginx sets it to $remote_addr, so a client cannot forge it.
 * The first X-Forwarded-For hop is client-controlled (nginx only appends), so it
 * is used only as a last resort when X-Real-IP is absent (local dev, no proxy).
 */
export function clientIp(req: NextRequest | Request): string {
  return (
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * rateLimit(keyPrefix, key, max, windowMs)
 *
 * @param keyPrefix  Namespace for this limiter, e.g. "auth"
 * @param key        Per-subject key, e.g. clientIp(req)
 * @param max        Maximum requests allowed in the window
 * @param windowMs   Window duration in milliseconds
 *
 * @returns { ok, remaining, resetAt, resetInMs }
 */
export function rateLimit(
  keyPrefix: string,
  key: string,
  max: number,
  windowMs: number,
): { ok: boolean; remaining: number; resetAt: number; resetInMs: number } {
  const storeKey = `${keyPrefix}:${key}`;
  const now = Date.now();

  let entry = store.get(storeKey);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(storeKey, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, max - entry.count);
  const resetInMs = Math.max(0, entry.resetAt - now);
  return { ok: entry.count <= max, remaining, resetAt: entry.resetAt, resetInMs };
}

// Convenience helper for auth routes: 5 attempts per 15 minutes per IP.
export function authRateLimit(req: NextRequest | Request) {
  return rateLimit("auth", clientIp(req), 5, 15 * 60 * 1000);
}
