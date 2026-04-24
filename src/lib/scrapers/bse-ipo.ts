/**
 * BSE IPO scraper
 *
 * BSE publishes IPO data under api.bseindia.com — open JSON, no auth,
 * no Cloudflare. Documentation is scattered; these endpoints were reverse-
 * engineered from bseindia.com/markets/publicissues/ page XHR traffic.
 *
 * This is Phase-1 skeleton. The actual endpoint path changes occasionally;
 * we test and adjust once the site is live. In the meantime, `seed-ipos.ts`
 * provides representative data so the UI works immediately.
 */

import axios from "axios";

export interface ScrapedIpoCurrent {
  name: string;
  symbol?: string;
  bseCode?: string;
  type: "mainboard" | "sme";
  priceBandLow?: number;
  priceBandHigh?: number;
  lotSize?: number;
  issueSizeCr?: number;
  openDate?: Date;
  closeDate?: Date;
  allotmentDate?: Date;
  listingDate?: Date;
  registrar?: string;
  registrarUrl?: string;
  faceValue?: number;
  subscriptionStatus?: {
    retailX?: number;
    hniX?: number;
    qibX?: number;
    employeeX?: number;
    totalX?: number;
    capturedAt: Date;
  };
}

const UA =
  process.env.SCRAPER_USER_AGENT ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const client = axios.create({
  timeout: 20000,
  headers: {
    "User-Agent": UA,
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-IN,en;q=0.9",
    Referer: "https://www.bseindia.com/",
  },
});

/**
 * Fetch currently open IPOs (mainboard).
 * Endpoint: api.bseindia.com/BseIndiaAPI/api/...
 * Note: exact endpoint confirmed at runtime — left parameterizable.
 */
export async function fetchBseCurrentIpos(): Promise<ScrapedIpoCurrent[]> {
  // Placeholder: real endpoint to be confirmed post-deploy.
  // Returns [] safely if the endpoint changes so we don't break the cron.
  try {
    const url = "https://api.bseindia.com/BseIndiaAPI/api/IPO_NewIssues/w?flag=1";
    const { data } = await client.get(url);
    if (!Array.isArray(data?.Table)) return [];
    return data.Table.map((row: Record<string, unknown>) => mapBseRow(row)).filter(Boolean);
  } catch {
    return [];
  }
}

function mapBseRow(row: Record<string, unknown>): ScrapedIpoCurrent | null {
  const name = row.CompanyName as string | undefined;
  if (!name) return null;
  return {
    name,
    bseCode: row.ScripCode as string | undefined,
    type: (row.IssueType as string | undefined)?.toLowerCase().includes("sme") ? "sme" : "mainboard",
    priceBandLow: toNumber(row.IPOPriceLower),
    priceBandHigh: toNumber(row.IPOPriceUpper),
    lotSize: toNumber(row.LotSize),
    issueSizeCr: toNumber(row.IssueSize),
    openDate: toDate(row.StartDate),
    closeDate: toDate(row.EndDate),
    listingDate: toDate(row.ListingDate),
    faceValue: toNumber(row.FaceValue),
  };
}

function toNumber(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toDate(v: unknown): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Slugify company name for URL.
 */
export function slugifyIpoName(name: string, opts?: { suffix?: string }): string {
  const base = name
    .toLowerCase()
    .replace(/\blimited\b|\bltd\.?\b/g, "")
    .replace(/\bpvt\.?\b|\bprivate\b/g, "")
    .replace(/\bipo\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  const slug = opts?.suffix ? `${base}-${opts.suffix}` : base;
  return `${slug}-ipo`;
}
