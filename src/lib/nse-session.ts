/**
 * NSE India session manager.
 *
 * NSE's public APIs require a valid browser session cookie obtained by first
 * visiting nseindia.com. Without it, API calls return 401 or empty data.
 *
 * This module maintains a single in-process session (refreshed every 2 hours)
 * that all NSE API callers share. No credentials needed — it's the same
 * technique used by nsepython, TrueData, and every other NSE data library.
 *
 * Usage:
 *   import { fetchNse } from "@/lib/nse-session";
 *   const data = await fetchNse("/api/option-chain-equities?symbol=NIFTY");
 */

const BASE = "https://www.nseindia.com";
const SESSION_TTL_MS = 90 * 60 * 1000; // 90 minutes

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
};

interface Session {
  cookies: string;
  refreshedAt: number;
}

let session: Session | null = null;

async function refreshSession(): Promise<Session> {
  // Visit the main page to get session cookies
  const resp = await fetch(BASE, {
    headers: BROWSER_HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  const rawCookies = resp.headers.getSetCookie?.() ?? [];
  // Older fetch implementations return a single 'set-cookie' header
  const fallback = resp.headers.get("set-cookie") ?? "";

  const cookieStr = rawCookies.length > 0
    ? rawCookies.map((c) => c.split(";")[0]).join("; ")
    : fallback.split(",").map((c) => c.split(";")[0]).join("; ");

  if (!cookieStr) {
    console.warn("[nse-session] No cookies received from NSE homepage");
  }

  session = { cookies: cookieStr, refreshedAt: Date.now() };
  return session;
}

async function getSession(): Promise<Session> {
  if (!session || Date.now() - session.refreshedAt > SESSION_TTL_MS) {
    return refreshSession();
  }
  return session;
}

/**
 * Fetch a NSE API endpoint with proper session cookies.
 * Returns parsed JSON or throws.
 */
export async function fetchNse<T = unknown>(path: string): Promise<T> {
  const s = await getSession();
  const url = `${BASE}${path}`;

  const resp = await fetch(url, {
    headers: {
      ...BROWSER_HEADERS,
      Referer: `${BASE}/`,
      Cookie: s.cookies,
    },
    signal: AbortSignal.timeout(15000),
  });

  if (resp.status === 401 || resp.status === 403) {
    // Session expired — force refresh and retry once
    session = null;
    const fresh = await getSession();
    const retry = await fetch(url, {
      headers: { ...BROWSER_HEADERS, Referer: `${BASE}/`, Cookie: fresh.cookies },
      signal: AbortSignal.timeout(15000),
    });
    if (!retry.ok) throw new Error(`NSE API ${path} failed: ${retry.status}`);
    return (await retry.json()) as T;
  }

  if (!resp.ok) throw new Error(`NSE API ${path} failed: ${resp.status}`);
  return (await resp.json()) as T;
}

/** Convenience: fetch NSE and return an array, or empty array on error */
export async function fetchNseArray<T = unknown>(path: string): Promise<T[]> {
  try {
    const data = await fetchNse<T[] | { data?: T[] } | unknown>(path);
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data?: T[] }).data)) {
      return (data as { data: T[] }).data;
    }
    return [];
  } catch (err) {
    console.warn(`[nse-session] fetchNseArray failed for ${path}:`, err instanceof Error ? err.message : String(err));
    return [];
  }
}
