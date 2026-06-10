/**
 * GMP Tracker — auto-fills the ipo_gmp table from IPO Watch.
 * ─────────────────────────────────────────────────────────────────
 * Grey Market Premium is the #1 thing retail investors check before
 * applying to an IPO. The ipo_gmp table + GMP chart UI have existed since
 * launch but were fed only by the manual /sup-min/gmp admin page.
 *
 * Source: ipowatch.in GMP page — server-rendered WordPress tables, works
 * from cloud IPs with a browser User-Agent (verified 2026-06-10).
 * Table columns: IPO Name | IPO GMP | Trend | Price Band | Est. Listing |
 *                Date | Type | Status | Last Updated
 *
 * Matching: IPO Watch uses short names ("Horizon Reclaim") vs our full
 * names ("Horizon Reclaim Limited") — same normalize + prefix strategy as
 * ipo-symbol-backfill. Only matches IPOs not yet listed/withdrawn, opened
 * (or opening) within a recent window, so stale rows can't mis-attach.
 *
 * Upserts one row per IPO per day (unique ipoId+date) → builds the GMP
 * trend history the chart needs. Runs every 4 hours.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const SOURCE_URL = "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

interface GmpRow {
  name: string;
  gmp: number;
  status: string; // Upcoming | Open | Closed | Listed (IPO Watch's label)
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .trim();
}

/** Same normalization as ipo-symbol-backfill — keep matching behavior consistent. */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(limited|ltd|pvt|private|public|company|industries|technologies|corporation|corp|holdings|the|ipo)\b\.?/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseGmpTables(html: string): GmpRow[] {
  const rows: GmpRow[] = [];
  const tables = html.match(/<table[\s\S]*?<\/table>/g) ?? [];
  for (const table of tables) {
    const trs = table.match(/<tr[\s\S]*?<\/tr>/g) ?? [];
    for (const tr of trs) {
      const cells = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/g) ?? []).map(stripTags);
      // Expect: Name | GMP | Trend | Price Band | Est. Listing | Date | Type | Status | Updated
      if (cells.length < 8 || cells[0] === "IPO Name" || !cells[0]) continue;
      const gmpMatch = cells[1].replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
      if (!gmpMatch) continue;
      rows.push({
        name: cells[0],
        gmp: parseFloat(gmpMatch[0]),
        status: cells[7] ?? "",
      });
    }
  }
  return rows;
}

export async function trackGmp(): Promise<IngestionResult> {
  const res = await fetch(SOURCE_URL, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    throw new Error(`IPO Watch GMP page returned HTTP ${res.status}`);
  }
  const html = await res.text();
  const scraped = parseGmpTables(html);
  if (scraped.length === 0) {
    // Page worked but no rows parsed → layout probably changed. Fail loudly
    // so the heartbeat flags it instead of weeks of silent "success, 0 rows".
    throw new Error("Parsed 0 GMP rows — IPO Watch table layout may have changed");
  }

  // Candidate IPOs: not yet listed/withdrawn, opening within ±45 days
  const windowStart = new Date(Date.now() - 45 * 86400000);
  const windowEnd = new Date(Date.now() + 45 * 86400000);
  const ipos = await prisma.ipo.findMany({
    where: {
      status: { in: ["upcoming", "live", "closed"] },
      OR: [
        { openDate: { gte: windowStart, lte: windowEnd } },
        { openDate: null },
      ],
    },
    select: { id: true, name: true },
  });

  const exactMap = new Map<string, number>();
  const normed: Array<{ id: number; norm: string; words: Set<string> }> = [];
  for (const ipo of ipos) {
    const n = normalize(ipo.name);
    if (n.length < 3) continue;
    exactMap.set(n, ipo.id);
    normed.push({ id: ipo.id, norm: n, words: new Set(n.split(" ").filter((w) => w.length > 1)) });
  }

  const today = new Date();
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  let upserted = 0;
  let unmatched = 0;
  const unmatchedNames: string[] = [];

  for (const row of scraped) {
    const rowNorm = normalize(row.name);
    if (rowNorm.length < 3) continue;

    let ipoId = exactMap.get(rowNorm) ?? null;
    if (!ipoId) {
      const rowWords = rowNorm.split(" ").filter((w) => w.length > 1);
      const candidates = normed.filter((c) => {
        if (!(c.norm.startsWith(rowNorm) || rowNorm.startsWith(c.norm))) return false;
        const shared = rowWords.filter((w) => c.words.has(w)).length;
        // 2+ shared words, or a single-word name that prefix-matches exactly one IPO
        return shared >= 2 || (rowWords.length === 1 && c.words.size === 1);
      });
      if (candidates.length === 1) ipoId = candidates[0].id;
    }

    if (!ipoId) {
      unmatched++;
      if (unmatchedNames.length < 5) unmatchedNames.push(row.name);
      continue;
    }

    await prisma.ipoGmp.upsert({
      where: { ipoId_date: { ipoId, date } },
      update: { gmp: row.gmp, source: "ipowatch", enteredBy: "gmp_tracker" },
      create: { ipoId, date, gmp: row.gmp, source: "ipowatch", enteredBy: "gmp_tracker" },
    });
    upserted++;
  }

  console.log(
    `[gmp-tracker] ${upserted} GMP rows upserted, ${unmatched} unmatched of ${scraped.length} scraped` +
      (unmatchedNames.length ? ` (unmatched: ${unmatchedNames.join(", ")})` : ""),
  );
  return {
    rowsIn: upserted,
    rowsError: 0,
    notes: `${upserted}/${scraped.length} matched+saved${unmatched ? `; unmatched: ${unmatchedNames.join(", ")}${unmatched > 5 ? "…" : ""}` : ""}`,
  };
}
