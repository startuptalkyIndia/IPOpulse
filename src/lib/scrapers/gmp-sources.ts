/**
 * GMP sources — where Grey Market Premium numbers come from, and how each
 * source's HTML becomes rows. Pure functions + one fetch helper; no DB, so the
 * parsers are unit-testable against captured fixtures.
 *
 * Sources are tried in order and the first that yields rows wins. Why more
 * than one: on 2026-08-19 ipowatch.in went down (Cloudflare HTTP 522 from its
 * origin) and GMP — the product's most-used number — silently stopped updating
 * for a whole day. A single hardcoded source is a single point of failure on
 * the most important feature, so the job fails over instead. It only gives up
 * (and throws, so the heartbeat flags it) when EVERY source fails, and the
 * winning source's name is recorded in ipo_gmp.source.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

export interface GmpRow {
  name: string;
  gmp: number;
  priceBand: string;  // "₹103" (upper band) or "₹62-66"
  openDate: Date | null;
  closeDate: Date | null;
  boardType: string;  // "BSE SME" | "NSE SME" | "Mainboard"
  status: string;     // Upcoming | Open | Closed | Listed (the source's label)
}

/** One GMP source: where to fetch it and how to turn its HTML into rows. */
export interface GmpSource {
  /** Stored in ipo_gmp.source so a row's origin is always auditable. */
  name: string;
  url: string;
  parse: (html: string) => GmpRow[];
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pull a signed number out of a GMP cell. Currency symbols must be stripped
 * BEFORE matching: on "-₹5" a bare /-?\d+/ skips the minus (it is not adjacent
 * to the digit) and reads +5 — inverting the sign on exactly the IPOs where a
 * negative GMP is the whole story.
 */
export function parseSignedNumber(cell: string): number | null {
  const cleaned = cell.replace(/[₹,\s]/g, "");
  const m = cleaned.match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Parse "12-16 June" / "30 May-3 June" → open/close dates (year inferred). */
export function parseDateRange(s: string): { open: Date | null; close: Date | null } {
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

/** Parse "Aug 18, 2026 – Aug 20, 2026" → open/close dates (year is explicit). */
export function parseAbsoluteDateRange(s: string): { open: Date | null; close: Date | null } {
  const one = (t: string): Date | null => {
    const m = t.match(/([A-Za-z]{3,})\s+(\d{1,2}),?\s*(\d{4})/);
    if (!m) return null;
    const mon = MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (mon === undefined) return null;
    return new Date(Date.UTC(parseInt(m[3], 10), mon, parseInt(m[2], 10)));
  };
  const parts = s.split(/[–—]|\s-\s/).map((p) => p.trim()).filter(Boolean);
  return { open: parts[0] ? one(parts[0]) : null, close: parts[1] ? one(parts[1]) : null };
}

/** Every <tr> in the document, as arrays of plain-text cells. */
function tableRows(html: string): string[][] {
  const out: string[][] = [];
  for (const table of html.match(/<table[\s\S]*?<\/table>/g) ?? []) {
    for (const tr of table.match(/<tr[\s\S]*?<\/tr>/g) ?? []) {
      out.push((tr.match(/<t[dh][\s\S]*?<\/t[dh]>/g) ?? []).map(stripTags));
    }
  }
  return out;
}

/**
 * ipowatch.in layout:
 * Name | GMP | Trend | Price Band | Est. Listing | Date | Type | Status | Updated
 */
export function parseIpoWatch(html: string): GmpRow[] {
  const rows: GmpRow[] = [];
  for (const cells of tableRows(html)) {
    if (cells.length < 8 || cells[0] === "IPO Name" || !cells[0]) continue;
    const gmp = parseSignedNumber(cells[1]);
    if (gmp === null) continue;
    const { open, close } = parseDateRange(cells[5] ?? "");
    rows.push({
      name: cells[0],
      gmp,
      priceBand: cells[3] ?? "",
      openDate: open,
      closeDate: close,
      boardType: cells[6] ?? "",
      status: cells[7] ?? "",
    });
  }
  return rows;
}

/**
 * ipoji.com layout:
 * IPO | Type | Price Band | GMP | GMP % | Indicative Listing | Open – Close | Status | Updated
 *
 * Its first cell glues name + type + status together ("Shankesh Jewellers IPO
 * Mainboard Open"), so the trailing type/status/"IPO" are peeled back off —
 * otherwise the name never matches an IPO in our DB.
 */
export function parseIpoji(html: string): GmpRow[] {
  const rows: GmpRow[] = [];
  for (const cells of tableRows(html)) {
    if (cells.length < 8 || !cells[0] || /^IPO$/i.test(cells[0])) continue;
    const boardType = cells[1] ?? "";
    const status = cells[7] ?? "";
    const gmp = parseSignedNumber(cells[3] ?? "");
    if (gmp === null) continue; // "—" = no GMP quoted yet
    let name = cells[0].trim();
    for (const suffix of [status, boardType]) {
      if (!suffix) continue;
      const esc = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      name = name.replace(new RegExp(`\\s*${esc}\\s*$`, "i"), "");
    }
    name = name.replace(/\s*IPO\s*$/i, "").trim();
    if (!name) continue;
    const { open, close } = parseAbsoluteDateRange(cells[6] ?? "");
    rows.push({ name, gmp, priceBand: cells[2] ?? "", openDate: open, closeDate: close, boardType, status });
  }
  return rows;
}

export const SOURCES: GmpSource[] = [
  { name: "ipowatch", url: "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/", parse: parseIpoWatch },
  { name: "ipoji", url: "https://ipoji.com/ipo-gmp", parse: parseIpoji },
];

/**
 * Try each source in order; return the first that yields rows. A source that
 * 5xx's, times out, or parses to zero rows is treated the same way — broken —
 * and we move on. Only when all of them are broken does this throw.
 */
export async function fetchGmpRows(): Promise<{ source: string; rows: GmpRow[] }> {
  const failures: string[] = [];
  for (const src of SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        failures.push(`${src.name}: HTTP ${res.status}`);
        continue;
      }
      const rows = src.parse(await res.text());
      if (rows.length === 0) {
        // Page loaded but nothing parsed → layout probably changed. Record it
        // rather than treating an empty scrape as a successful run.
        failures.push(`${src.name}: parsed 0 rows (layout may have changed)`);
        continue;
      }
      if (failures.length) {
        console.warn(`[gmp-tracker] fell back to ${src.name} — ${failures.join("; ")}`);
      }
      return { source: src.name, rows };
    } catch (err) {
      failures.push(`${src.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  throw new Error(`All ${SOURCES.length} GMP sources failed — ${failures.join("; ")}`);
}
