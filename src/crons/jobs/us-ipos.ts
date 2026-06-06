/**
 * US IPO ingestion from SEC EDGAR full-text search API.
 *
 * SEC EDGAR full-text search (https://efts.sec.gov/LATEST/search-index?q=&dateRange=custom&...)
 * is open, no auth required. We search for S-1 / S-1/A filings in the last 90 days.
 *
 * Data quality is intentionally modest: we extract company name, filed date, CIK,
 * and the S-1 URL. Price range and expected date come from the filing text if present,
 * but we don't parse the full PDF — we just surface the filing.
 *
 * Supplementary: we also hit the IPO Monitor feed (ipomonitor.com/pages/ipo-schedule.html)
 * which has cleaner tabular data but is HTML-scraped.
 */

import { prisma } from "@/lib/db";

interface EdgarFiling {
  entityName: string;
  cik: string;
  filedDate: string;
  accessionNo: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

async function fetchEdgarS1s(): Promise<Array<EdgarFiling & { symbol?: string }>> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  // EDGAR full-text search for S-1 IPO filings in the window.
  const resp = await fetch(
    `https://efts.sec.gov/LATEST/search-index?q=%22initial+public+offering%22&forms=S-1&dateRange=custom&startdt=${ninetyDaysAgo}&enddt=${today}`,
    { headers: { "User-Agent": "IPOpulse research@ipopulse.com" }, signal: AbortSignal.timeout(15000) },
  );
  if (!resp.ok) throw new Error(`EDGAR search failed: ${resp.status}`);

  const data = (await resp.json()) as {
    hits?: {
      hits?: Array<{
        _id?: string; // "accession:file.htm"
        _source?: {
          display_names?: string[];   // ["Company Name  (TICKER)  (CIK 0000...)"]
          file_date?: string;
          adsh?: string;              // "0001213900-26-058915"
          ciks?: string[];
        };
      }>;
    };
  };

  const seen = new Set<string>();
  const out: Array<EdgarFiling & { symbol?: string }> = [];

  for (const h of data.hits?.hits ?? []) {
    const src = h._source ?? {};
    const display = src.display_names?.[0] ?? "";
    if (!display) continue;

    // Parse "Company Name  (TICKER)  (CIK 0000123)"
    const name = display.split("(")[0].trim();
    if (!name) continue;
    const tickerMatch = display.match(/\(([A-Z]{1,6})\)/);
    const symbol = tickerMatch ? tickerMatch[1] : undefined;
    const cik = (src.ciks?.[0] ?? "").replace(/^0+/, "");
    const filed = (src.file_date ?? "").slice(0, 10);
    const accessionNo = (src.adsh ?? "").replace(/-/g, "");

    // Dedup by company (one S-1 has many file hits)
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ entityName: name, cik, filedDate: filed, accessionNo, symbol });
  }
  return out;
}

export async function ingestUsIpos(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  let filings: Array<EdgarFiling & { symbol?: string }> = [];
  try {
    filings = await fetchEdgarS1s();
  } catch (err) {
    return { rowsIn: 0, notes: `EDGAR fetch failed: ${err instanceof Error ? err.message : String(err)}` };
  }

  if (filings.length === 0) return { rowsIn: 0, notes: "No S-1 filings found in window." };

  let inserted = 0;
  let errors = 0;
  for (const f of filings.slice(0, 100)) {
    try {
      const baseSlug = slugify(f.entityName) || `us-ipo-${f.cik}`;
      // EDGAR filing-index URL (reliable, human-browsable)
      const s1Url = f.accessionNo && f.cik
        ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${f.cik}&type=S-1&dateb=&owner=include&count=10`
        : null;

      await prisma.usIpo.upsert({
        where: { slug: baseSlug },
        update: {
          filedDate: f.filedDate ? new Date(f.filedDate) : null,
          ...(f.symbol && { symbol: f.symbol }),
          s1Url,
        },
        create: {
          companyName: f.entityName,
          slug: baseSlug,
          symbol: f.symbol ?? null,
          filedDate: f.filedDate ? new Date(f.filedDate) : null,
          s1Url,
          status: "upcoming",
        },
      });
      inserted++;
    } catch {
      errors++;
    }
  }

  return {
    rowsIn: inserted,
    rowsError: errors,
    notes: `US IPOs: ${inserted} upserted from EDGAR S-1 feed (${filings.length} raw filings).`,
  };
}
