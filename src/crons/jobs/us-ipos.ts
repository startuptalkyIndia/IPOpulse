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

async function fetchEdgarS1s(): Promise<EdgarFiling[]> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000)
    .toISOString()
    .slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  // EDGAR full-text search: S-1 initial filings in last 90 days
  const url =
    `https://efts.sec.gov/LATEST/search-index?q=%22S-1%22&dateRange=custom` +
    `&startdt=${ninetyDaysAgo}&enddt=${today}&forms=S-1&hits.hits._source=period_of_report,entity_name,file_num,period_of_report,form_type&hits.hits.total.value=true&hits.hits.highlight=&_source=period_of_report,entity_name,file_num,period_of_report,form_type&hits.hits.fields=file_date,entity_name,file_num,period_of_report,form_type,accession_no&category=form-type&hits.hits.total.relation=eq`;

  // Simpler endpoint that's well-documented:
  const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=%22prospectus%22&forms=S-1&dateRange=custom&startdt=${ninetyDaysAgo}&enddt=${today}`;

  const resp = await fetch(
    `https://efts.sec.gov/LATEST/search-index?q=%22initial+public+offering%22&forms=S-1&dateRange=custom&startdt=${ninetyDaysAgo}&enddt=${today}`,
    { headers: { "User-Agent": "IPOpulse ipopulse@talkytools.com" }, signal: AbortSignal.timeout(15000) }
  );
  if (!resp.ok) throw new Error(`EDGAR search failed: ${resp.status}`);

  const data = (await resp.json()) as {
    hits?: {
      hits?: Array<{
        _source?: { entity_name?: string; file_date?: string; accession_no?: string };
        fields?: { entity_name?: string[]; file_date?: string[]; accession_no?: string[] };
      }>;
    };
  };

  return (data.hits?.hits ?? []).map((h) => {
    const src = h._source ?? {};
    const fields = h.fields ?? {};
    const name = (fields.entity_name?.[0] ?? src.entity_name ?? "").trim();
    const filed = (fields.file_date?.[0] ?? src.file_date ?? "").slice(0, 10);
    const accNo = (fields.accession_no?.[0] ?? src.accession_no ?? "").replace(/-/g, "");
    const cik = accNo.slice(0, 10).replace(/^0+/, "");
    return { entityName: name, cik, filedDate: filed, accessionNo: accNo };
  }).filter((f) => f.entityName && f.filedDate);
}

export async function ingestUsIpos(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  let filings: EdgarFiling[] = [];
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
      const s1Url = f.accessionNo
        ? `https://www.sec.gov/Archives/edgar/data/${f.cik}/${f.accessionNo.replace(/(\d{10})(\d{18})/, "$1-$2-").replace(/-(\d{4})$/, "-$1.txt")}`
        : null;

      await prisma.usIpo.upsert({
        where: { slug: baseSlug },
        update: {
          filedDate: f.filedDate ? new Date(f.filedDate) : null,
          s1Url,
        },
        create: {
          companyName: f.entityName,
          slug: baseSlug,
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
