/**
 * Ping Google + Bing with the sitemap URL when new content lands.
 *
 * Both endpoints are open, no auth, no rate limit reasonable usage. The "ping"
 * tells the search engine to re-crawl the sitemap soon.
 */

const BASE = "https://ipopulse.talkytools.com";
const SITEMAP = `${BASE}/sitemap.xml`;

export async function pingSearchEngines(): Promise<{ google: boolean; bing: boolean }> {
  const result = { google: false, bing: false };
  try {
    const r = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`, { method: "GET" });
    result.google = r.ok;
  } catch {}
  try {
    const r = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`, { method: "GET" });
    result.bing = r.ok;
  } catch {}
  return result;
}

/**
 * Throttle: only ping if we haven't pinged in last 1 hour. Search engines
 * ignore frequent pings anyway; we just save bandwidth.
 */
let lastPing = 0;
const MIN_INTERVAL_MS = 60 * 60 * 1000;

export async function maybePingSitemap(): Promise<{ pinged: boolean; result?: { google: boolean; bing: boolean } }> {
  if (Date.now() - lastPing < MIN_INTERVAL_MS) return { pinged: false };
  lastPing = Date.now();
  const result = await pingSearchEngines();
  return { pinged: true, result };
}
