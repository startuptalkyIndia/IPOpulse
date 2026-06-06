/**
 * NSE IPO Scraper — replaces the broken BSE HTML scraper.
 * ─────────────────────────────────────────────────────────────────
 * BSE switched its public-issues page to an Angular SPA that calls the
 * Akamai-blocked api.bseindia.com — so the old HTML scraper returns 0 rows.
 *
 * NSE's `all-upcoming-issues` API works from cloud (via the cookie-warmed
 * fetchNse helper) and returns clean structured data:
 *   { companyName, symbol, series, issuePrice, issueSize,
 *     issueStartDate, issueEndDate, status }
 * status ∈ { "Active" (live), "Closed", "Forthcoming" (upcoming) }
 *
 * Runs every 2 hours via scheduler. Marks IPOs live/closed/upcoming by the
 * NSE status + dates, parses the price band, and links the NSE symbol.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { fetchNseArray } from "@/lib/nse-session";
import { slugifyIpoName } from "@/lib/scrapers/bse-ipo";

interface NseIssue {
  companyName: string;
  symbol?: string;
  series?: string;
  issuePrice?: string;       // "Rs.42 to Rs.45"
  issueSize?: string;        // shares count as string
  issueStartDate?: string;   // "05-Jun-2026"
  issueEndDate?: string;
  status?: string;           // Active | Closed | Forthcoming
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Parse "05-Jun-2026" → Date (UTC midnight). Returns null if unparseable. */
function parseNseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})-(\w{3})-(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const mon = MONTHS[m[2].toLowerCase()];
  const year = parseInt(m[3], 10);
  if (mon === undefined) return null;
  return new Date(Date.UTC(year, mon, day));
}

/** Parse "Rs.42 to Rs.45" → { low: 42, high: 45 }. Handles single price & commas. */
function parsePriceBand(s: string | undefined): { low: number | null; high: number | null } {
  if (!s) return { low: null, high: null };
  const nums = s.replace(/,/g, "").match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return { low: null, high: null };
  const vals = nums.map(Number).filter((n) => isFinite(n) && n > 0);
  if (vals.length === 0) return { low: null, high: null };
  if (vals.length === 1) return { low: vals[0], high: vals[0] };
  return { low: Math.min(...vals), high: Math.max(...vals) };
}

/** Map NSE status + dates to our internal status. */
function mapStatus(nseStatus: string | undefined, open: Date | null, close: Date | null): string {
  const st = (nseStatus ?? "").toLowerCase();
  if (st === "active") return "live";
  if (st === "forthcoming") return "upcoming";
  if (st === "closed") return "closed";
  // Fall back to date-based inference
  const now = new Date();
  if (open && close) {
    if (now < open) return "upcoming";
    if (now >= open && now <= new Date(close.getTime() + 86400000)) return "live";
    return "closed";
  }
  return "upcoming";
}

async function ingestCategory(category: "ipo" | "sme"): Promise<{ rowsIn: number; note: string }> {
  const type = category === "sme" ? "sme" : "mainboard";
  const issues = await fetchNseArray<NseIssue>(`/api/all-upcoming-issues?category=${category}`);
  let rowsIn = 0;

  for (const issue of issues) {
    if (!issue.companyName) continue;
    const open = parseNseDate(issue.issueStartDate);
    const close = parseNseDate(issue.issueEndDate);
    const band = parsePriceBand(issue.issuePrice);
    const status = mapStatus(issue.status, open, close);
    const slug = slugifyIpoName(issue.companyName, { suffix: type === "sme" ? "sme" : undefined });

    await prisma.ipo.upsert({
      where: { slug },
      update: {
        ...(open && { openDate: open }),
        ...(close && { closeDate: close }),
        ...(band.low != null && { priceBandLow: band.low }),
        ...(band.high != null && { priceBandHigh: band.high }),
        ...(issue.symbol && { nseSymbol: issue.symbol }),
        status,
      },
      create: {
        name: issue.companyName,
        slug,
        type,
        openDate: open,
        closeDate: close,
        priceBandLow: band.low,
        priceBandHigh: band.high,
        nseSymbol: issue.symbol ?? null,
        status,
      },
    });
    rowsIn++;
  }

  return { rowsIn, note: `${category}: ${issues.length} fetched, ${rowsIn} upserted` };
}

export async function ingestNseIpos(): Promise<IngestionResult> {
  const notes: string[] = [];
  let rowsIn = 0;
  let rowsError = 0;

  for (const cat of ["ipo", "sme"] as const) {
    try {
      const r = await ingestCategory(cat);
      rowsIn += r.rowsIn;
      notes.push(r.note);
    } catch (err) {
      rowsError++;
      notes.push(`${cat}: ${err instanceof Error ? err.message : "fetch error"}`);
    }
  }

  console.log(`[nse-ipos] ${notes.join(" | ")}`);
  return { rowsIn, rowsError, notes: notes.join(" | ") };
}
