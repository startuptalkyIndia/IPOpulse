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
 * BUG FIXED 2026-09-24 (found via a "why can't I see this live IPO"
 * complaint — the SME tab showed "no IPOs in the pipeline" while 3 real ones
 * were live on NSE): two separate problems, confirmed live against NSE's
 * actual API responses.
 *   1. `/api/all-upcoming-issues?category=sme` returns a bare `{}` (not an
 *      array) — has been silently dead the whole time (fetchNseArray already
 *      degrades this to `[]`, so no crash, just zero SME rows from this call).
 *   2. `?category=ipo` is a LEAKY superset — confirmed it returns SME-series
 *      rows too (e.g. forthcoming SME issues showed up in the "ipo" category
 *      response). The old code trusted the CATEGORY PARAM to set `type`,
 *      never checked each row's own `series` field, so any SME company
 *      leaking through the "ipo" call got permanently stored as
 *      type='mainboard' (the upsert's `update` branch never touched `type`,
 *      so a wrong type from creation stuck forever).
 * Fix: pull from `/api/ipo-current-issue` (the endpoint NSE's own live IPO
 * page actually uses for currently-active issues — verified it correctly
 * returns both EQ and SME rows with a reliable `series` field, including
 * live subscription numbers) merged with `?category=ipo` for forthcoming
 * ones, and derive `type` from each row's OWN `series` field, never from
 * which call it came from. `update` now also corrects `type`, so a
 * previously-wrong row self-heals on the next run instead of staying wrong.
 *
 * Runs every 2 hours via scheduler. Marks IPOs live/closed/upcoming by the
 * NSE status + dates, parses the price band, and links the NSE symbol.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { fetchNseArray } from "@/lib/nse-session";
import { slugifyIpoName } from "@/lib/scrapers/bse-ipo";
import { computeIpoStatus } from "@/lib/ipo";

interface NseIssue {
  companyName: string;
  symbol?: string;
  series?: string;           // "EQ" (mainboard) | "SME" — the real type signal
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

/**
 * Map the NSE feed's status KEYWORD to our internal status. Date-based inference
 * is intentionally NOT done here — computeIpoStatus (via advanceStaleStatuses,
 * which runs right after ingest) is the single authority for date-derived status,
 * so this no longer duplicates that logic (audit HIGH: two sources of truth).
 */
function mapStatus(nseStatus: string | undefined): string {
  const st = (nseStatus ?? "").toLowerCase();
  if (st === "active") return "live";
  if (st === "closed") return "closed";
  return "upcoming"; // "forthcoming" or unknown; advanceStaleStatuses corrects by date
}

/** "SME" series → sme; "EQ" or anything else → mainboard. The only reliable type signal — never trust which endpoint/category a row came from. */
function deriveType(series: string | undefined): "sme" | "mainboard" {
  return (series ?? "").toUpperCase() === "SME" ? "sme" : "mainboard";
}

async function fetchAllIssues(): Promise<NseIssue[]> {
  // /api/ipo-current-issue: what NSE's own live IPO page uses for currently
  // ACTIVE issues — correctly includes both EQ and SME rows with a reliable
  // series field (verified live). /api/all-upcoming-issues?category=ipo:
  // covers FORTHCOMING issues (ipo-current-issue is active-only) — also
  // leaks in some SME rows, which is fine now that we key off `series`
  // rather than the category param. category=sme is NOT called — verified
  // it returns a bare `{}`, contributing nothing.
  const [current, upcoming] = await Promise.all([
    fetchNseArray<NseIssue>(`/api/ipo-current-issue`),
    fetchNseArray<NseIssue>(`/api/all-upcoming-issues?category=ipo`),
  ]);
  const byName = new Map<string, NseIssue>();
  for (const i of upcoming) if (i.companyName) byName.set(i.companyName, i);
  for (const i of current) if (i.companyName) byName.set(i.companyName, i); // current (has live status) wins on overlap
  return [...byName.values()];
}

async function ingestIssues(): Promise<{ rowsIn: number; note: string }> {
  const issues = await fetchAllIssues();
  let rowsIn = 0;

  for (const issue of issues) {
    if (!issue.companyName) continue;
    const open = parseNseDate(issue.issueStartDate);
    const close = parseNseDate(issue.issueEndDate);
    const band = parsePriceBand(issue.issuePrice);
    const status = mapStatus(issue.status);
    const type = deriveType(issue.series);
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
        type, // self-heal a previously-wrong type on the next run
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

  return { rowsIn, note: `${issues.length} fetched, ${rowsIn} upserted` };
}

/**
 * Advance stale IPO statuses by date.
 * NSE's upcoming-issues feed only lists upcoming/active issues — once an IPO
 * closes it drops off the feed, so the scraper never moves its status past
 * "upcoming"/"live". This corrects the DB `status` column from dates (the same
 * rules as computeIpoStatus) so list pages that filter on status stay accurate.
 * Only advances forward; never regresses a "listed" or "withdrawn" IPO.
 */
async function advanceStaleStatuses(): Promise<{ changed: number; note: string }> {
  const ipos = await prisma.ipo.findMany({
    where: { status: { notIn: ["listed", "withdrawn"] } },
    select: {
      id: true, status: true, openDate: true, closeDate: true, listingDate: true,
      listing: { select: { id: true } },
    },
  });

  let changed = 0;
  const samples: string[] = [];
  for (const ipo of ipos) {
    // Single rule for both surfaces: computeIpoStatus with the listing-row flag.
    const next = computeIpoStatus({ ...ipo, hasListing: !!ipo.listing });
    if (next !== ipo.status) {
      await prisma.ipo.update({ where: { id: ipo.id }, data: { status: next } });
      changed++;
      if (samples.length < 5) samples.push(`${ipo.status}→${next}`);
    }
  }
  return { changed, note: `status-advance: ${changed} corrected${samples.length ? ` (${samples.join(", ")})` : ""}` };
}

export async function ingestNseIpos(): Promise<IngestionResult> {
  const notes: string[] = [];
  let rowsIn = 0;
  let rowsError = 0;

  try {
    const r = await ingestIssues();
    rowsIn += r.rowsIn;
    notes.push(r.note);
  } catch (err) {
    rowsError++;
    notes.push(`issues: ${err instanceof Error ? err.message : "fetch error"}`);
  }

  // After ingesting the feed, fix any IPOs the feed no longer reports.
  try {
    const adv = await advanceStaleStatuses();
    rowsIn += adv.changed;
    notes.push(adv.note);
  } catch (err) {
    notes.push(`status-advance: ${err instanceof Error ? err.message : "error"}`);
  }

  console.log(`[nse-ipos] ${notes.join(" | ")}`);
  return { rowsIn, rowsError, notes: notes.join(" | ") };
}
