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
import { slugifyIpoName } from "@/lib/scrapers/bse-ipo";

const SOURCE_URL = "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

interface GmpRow {
  name: string;
  gmp: number;
  priceBand: string;  // "₹103" (upper band) or "₹62-66"
  dates: string;      // "12-16 June" / "30 May-3 June"
  boardType: string;  // "BSE SME" | "NSE SME" | "Mainboard"
  status: string;     // Upcoming | Open | Closed | Listed (IPO Watch's label)
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

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Parse "12-16 June" / "30 May-3 June" → open/close dates (year inferred). */
function parseDateRange(s: string): { open: Date | null; close: Date | null } {
  const m = s.match(/(\d{1,2})\s*([A-Za-z]+)?\s*[-–]\s*(\d{1,2})\s*([A-Za-z]+)/);
  if (!m) return { open: null, close: null };
  const closeMon = MONTHS[m[4].slice(0, 3).toLowerCase()];
  const openMon = m[2] ? MONTHS[m[2].slice(0, 3).toLowerCase()] : closeMon;
  if (openMon === undefined || closeMon === undefined) return { open: null, close: null };
  const now = new Date();
  const mk = (day: number, mon: number) => {
    let y = now.getUTCFullYear();
    if (mon - now.getUTCMonth() > 6) y -= 1; // December rows seen in January
    if (now.getUTCMonth() - mon > 6) y += 1; // January rows seen in December
    return new Date(Date.UTC(y, mon, day));
  };
  return { open: mk(parseInt(m[1], 10), openMon), close: mk(parseInt(m[3], 10), closeMon) };
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
        priceBand: cells[3] ?? "",
        dates: cells[5] ?? "",
        boardType: cells[6] ?? "",
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
  let created = 0;
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
      // BSE SME IPOs never appear in the NSE feed (and BSE blocks cloud IPs),
      // so this page is our only listing source for them. Create the IPO here.
      // NSE SME + Mainboard stay with nse_ipos to avoid duplicate records.
      const statusMap: Record<string, string> = { upcoming: "upcoming", open: "live", closed: "closed" };
      const mapped = statusMap[row.status.trim().toLowerCase()];
      if (/bse\s*sme/i.test(row.boardType) && mapped) {
        const nums = row.priceBand.replace(/,/g, "").match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
        const high = nums.length ? Math.max(...nums) : null;
        const low = nums.length ? Math.min(...nums) : null;
        const { open, close } = parseDateRange(row.dates);
        const slug = slugifyIpoName(row.name, { suffix: "sme" });
        const createdIpo = await prisma.ipo.upsert({
          where: { slug },
          update: {},
          create: {
            name: row.name, slug, type: "sme", status: mapped,
            priceBandHigh: high, priceBandLow: low,
            openDate: open, closeDate: close,
          },
        });
        ipoId = createdIpo.id;
        created++;
      } else {
        unmatched++;
        if (unmatchedNames.length < 5) unmatchedNames.push(row.name);
        continue;
      }
    }

    await prisma.ipoGmp.upsert({
      where: { ipoId_date: { ipoId, date } },
      update: { gmp: row.gmp, source: "ipowatch", enteredBy: "gmp_tracker" },
      create: { ipoId, date, gmp: row.gmp, source: "ipowatch", enteredBy: "gmp_tracker" },
    });
    upserted++;
  }

  console.log(
    `[gmp-tracker] ${upserted} GMP rows upserted (${created} BSE SME IPOs created), ${unmatched} unmatched of ${scraped.length} scraped` +
      (unmatchedNames.length ? ` (unmatched: ${unmatchedNames.join(", ")})` : ""),
  );
  return {
    rowsIn: upserted,
    rowsError: 0,
    notes: `${upserted}/${scraped.length} matched+saved${created ? `; ${created} BSE SME IPOs created` : ""}${unmatched ? `; unmatched: ${unmatchedNames.join(", ")}${unmatched > 5 ? "…" : ""}` : ""}`,
  };
}
