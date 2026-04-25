/**
 * BSE corporate announcements scraper.
 *
 * Endpoint: https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w
 * Open JSON, no auth, no Cloudflare. Confirmed working in earlier research.
 *
 * Returns headline + category + PDF URL + broadcast time. Used to seed
 * /corporate-actions calendar and announce-feed for individual companies.
 */

import axios from "axios";

export interface BseAnnouncement {
  scripCode: string;
  scripName: string;
  headline: string;
  category: string;
  subcategory?: string;
  pdfUrl?: string;
  broadcastAt: Date;
  sourceId: string; // BSE's NEWSID for dedupe
}

const UA =
  process.env.SCRAPER_USER_AGENT ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

function bseDate(d: Date): string {
  // BSE expects YYYYMMDD
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export async function fetchBseAnnouncements(daysBack = 1): Promise<BseAnnouncement[]> {
  const today = new Date();
  const from = new Date(today.getTime() - daysBack * 86400000);
  const url = "https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w";

  try {
    const { data } = await axios.get(url, {
      params: {
        pageno: 1,
        strCat: "-1",
        strPrevDate: bseDate(from),
        strScrip: "",
        strSearch: "P",
        strToDate: bseDate(today),
        strType: "C",
        subcategory: "-1",
      },
      timeout: 30000,
      headers: {
        "User-Agent": UA,
        Accept: "application/json, text/plain, */*",
        Referer: "https://www.bseindia.com/",
      },
    });

    const tableRaw = data?.Table;
    if (!Array.isArray(tableRaw)) return [];

    const out: BseAnnouncement[] = [];
    for (const row of tableRaw as Record<string, unknown>[]) {
      const scripCode = String(row.SCRIP_CD ?? row.SCRIPCD ?? "").trim();
      const scripName = String(row.SLONGNAME ?? row.SHORTNAME ?? "").trim();
      const headline = String(row.HEADLINE ?? row.NEWS_SUB ?? "").trim();
      const category = String(row.CATEGORYNAME ?? row.CATEGORY ?? "").trim();
      const subcategory = row.SUBCATNAME ? String(row.SUBCATNAME).trim() : undefined;
      const sourceId = String(row.NEWSID ?? row.NEWS_DT ?? "").trim();
      const pdfRaw = row.ATTACHMENTNAME ? String(row.ATTACHMENTNAME).trim() : undefined;
      const pdfUrl = pdfRaw ? `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${pdfRaw}` : undefined;

      // Date typically in field NEWS_DT (e.g. "2026-04-25T12:34:56")
      const dt = row.NEWS_DT ? new Date(String(row.NEWS_DT)) : new Date();

      if (!headline || !scripCode) continue;
      out.push({ scripCode, scripName, headline, category, subcategory, pdfUrl, broadcastAt: dt, sourceId });
    }
    return out;
  } catch {
    return [];
  }
}
