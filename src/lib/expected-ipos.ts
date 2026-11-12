/**
 * "Next expected IPO" — IPOs a third-party feed (ipowatch) already lists with
 * dates but which NSE's own issue lists do not carry yet (NSE publishes an
 * issue only once the terms are out), so our ipos table has no row for them.
 *
 * Display-only and deliberately NOT written to the database: it is unconfirmed
 * data and the dates can still move. Anything that goes wrong here returns []
 * so the /ipo page simply shows nothing extra.
 */

import { parseIpoWatchApi, type GmpRow } from "@/lib/scrapers/gmp-sources";

export interface ExpectedIpo {
  name: string;
  boardType: string;
  openDate: Date;
  closeDate: Date | null;
  /** Upper band in rupees, or null while the price band is not announced. */
  priceBandHigh: number | null;
}

const FEED_URL = "https://ipowatch.in/api/ipo/GetIpoGMPHistory";

/** Highest rupee figure in strings like "₹62-66", "₹103", "₹0". 0 / none → null. */
export function parsePriceBandHigh(s: string): number | null {
  const nums = (s.replace(/,/g, "").match(/\d+(?:\.\d+)?/g) ?? []).map(Number).filter((n) => n > 0);
  return nums.length ? Math.max(...nums) : null;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\b(limited|ltd|ipo)\b/g, "").replace(/[^a-z0-9]/g, "");
}

/**
 * Keep rows that are still ahead of us (upcoming or open, not already over),
 * drop any we already track (matched on normalised name), earliest first.
 */
export function pickExpected(rows: GmpRow[], knownNames: string[], now: Date, limit = 3): ExpectedIpo[] {
  const known = new Set(knownNames.map(norm));
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const out: ExpectedIpo[] = [];
  for (const r of rows) {
    if (!/^(upcoming|open)$/i.test(r.status.trim())) continue;
    if (!r.openDate) continue;
    const end = (r.closeDate ?? r.openDate).getTime();
    if (end < todayUtc) continue; // dates already passed — stale feed row
    if (known.has(norm(r.name))) continue;
    out.push({
      name: r.name,
      boardType: r.boardType,
      openDate: r.openDate,
      closeDate: r.closeDate,
      priceBandHigh: parsePriceBandHigh(r.priceBand),
    });
  }
  return out.sort((a, b) => a.openDate.getTime() - b.openDate.getTime()).slice(0, limit);
}

/** Fetch + parse the feed (cached an hour). Never throws. */
export async function fetchExpectedIpos(knownNames: string[], now = new Date()): Promise<ExpectedIpo[]> {
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "IPOpulse/1.0 (+https://ipopulse.talkytools.com)", Accept: "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return pickExpected(parseIpoWatchApi(await res.text()), knownNames, now);
  } catch {
    return [];
  }
}
