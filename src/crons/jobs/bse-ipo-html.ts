/**
 * BSE IPO scraper — HTML-based fallback since api.bseindia.com JSON endpoint
 * returned 302 redirects in our testing. Uses cheerio to parse the public
 * issues page for mainboard + SME IPOs.
 *
 * The page: https://www.bseindia.com/markets/publicissues/IPOIssues_new.aspx?id=1  (mainboard)
 *           https://www.bseindia.com/markets/publicissues/IPOIssues_new.aspx?id=7  (SME)
 *
 * Structure may change; this job is intentionally defensive — returns 0 rows
 * if the page layout shifts, rather than blowing up the whole scheduler.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/lib/db";
import { slugifyIpoName } from "@/lib/scrapers/bse-ipo";
import type { IngestionResult } from "../runIngestion";

const UA =
  process.env.SCRAPER_USER_AGENT ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const URLS: Array<{ url: string; type: "mainboard" | "sme" }> = [
  { url: "https://www.bseindia.com/markets/publicissues/IPOIssues_new.aspx?id=1", type: "mainboard" },
  { url: "https://www.bseindia.com/markets/publicissues/IPOIssues_new.aspx?id=7", type: "sme" },
];

interface Parsed {
  name: string;
  type: "mainboard" | "sme";
  priceBandLow?: number;
  priceBandHigh?: number;
  openDate?: Date;
  closeDate?: Date;
  listingDate?: Date;
  issueSizeCr?: number;
}

function parseDate(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const str = s.trim();
  // Try formats: "25/04/2026", "25-Apr-2026", "25 Apr 2026"
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,
    /^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/,
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2,4})$/,
  ];
  for (const fmt of formats) {
    const m = str.match(fmt);
    if (!m) continue;
    const [, d, mm, yRaw] = m;
    const year = yRaw.length === 2 ? 2000 + Number(yRaw) : Number(yRaw);
    if (/^\d+$/.test(mm)) {
      return new Date(year, Number(mm) - 1, Number(d));
    }
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const key = mm.charAt(0).toUpperCase() + mm.slice(1, 3).toLowerCase();
    return new Date(year, months[key] ?? 0, Number(d));
  }
  const fallback = new Date(str);
  return Number.isNaN(fallback.getTime()) ? undefined : fallback;
}

function parseBand(s: string | undefined): { low?: number; high?: number } {
  if (!s) return {};
  const nums = s.replace(/[₹,Rs\s]/g, "").match(/(\d+(?:\.\d+)?)/g);
  if (!nums) return {};
  if (nums.length === 1) return { low: Number(nums[0]), high: Number(nums[0]) };
  return { low: Number(nums[0]), high: Number(nums[1]) };
}

function parseIssueSize(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const clean = s.replace(/[,]/g, "").trim();
  const m = clean.match(/(\d+(?:\.\d+)?)/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

async function scrape(url: string, type: "mainboard" | "sme"): Promise<Parsed[]> {
  const { data } = await axios.get<string>(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-IN,en;q=0.9",
      Referer: "https://www.bseindia.com/",
    },
    timeout: 30000,
  });
  const $ = cheerio.load(data);

  const rows: Parsed[] = [];
  $("table tr").each((_, tr) => {
    const cells = $(tr).find("td").map((_, td) => $(td).text().trim()).get();
    if (cells.length < 4) return;
    // Heuristic: company name must be non-trivial text in the first cell; date-ish strings in others.
    const name = cells[0];
    if (!name || name.length < 4 || /issue|company|name|sr\.?$/i.test(name)) return;
    // Try to find a date somewhere
    const dateLike = cells.filter((c) => /\d{1,2}[-/][A-Za-z0-9]{2,3}[-/]\d{2,4}/.test(c));
    if (dateLike.length === 0) return;

    const openDate = parseDate(dateLike[0]);
    const closeDate = parseDate(dateLike[1]);
    const listingDate = parseDate(dateLike[2] ?? dateLike[dateLike.length - 1]);
    const band = parseBand(cells.find((c) => /₹|Rs\.?|\d+\s*[-–]\s*\d+/i.test(c)));
    const issue = parseIssueSize(cells.find((c) => /cr(ore)?|lakh/i.test(c)) ?? cells[3]);

    rows.push({
      name: name.replace(/\s+/g, " ").trim(),
      type,
      openDate,
      closeDate,
      listingDate,
      priceBandLow: band.low,
      priceBandHigh: band.high,
      issueSizeCr: issue,
    });
  });

  return rows;
}

function deriveStatus(p: Parsed): string {
  const now = new Date();
  if (p.listingDate && now >= p.listingDate) return "listed";
  if (p.openDate && p.closeDate) {
    if (now < p.openDate) return "upcoming";
    if (now >= p.openDate && now <= p.closeDate) return "live";
    return "closed";
  }
  return "upcoming";
}

export async function ingestBseIposFromHtml(): Promise<IngestionResult> {
  let rowsIn = 0;
  let rowsError = 0;
  const notes: string[] = [];

  for (const source of URLS) {
    try {
      const parsed = await scrape(source.url, source.type);
      notes.push(`${source.type}: ${parsed.length} rows parsed`);
      for (const p of parsed) {
        if (!p.name) continue;
        const slug = slugifyIpoName(p.name, { suffix: source.type === "sme" ? "sme" : undefined });
        await prisma.ipo.upsert({
          where: { slug },
          update: {
            openDate: p.openDate ?? undefined,
            closeDate: p.closeDate ?? undefined,
            listingDate: p.listingDate ?? undefined,
            priceBandLow: p.priceBandLow ?? undefined,
            priceBandHigh: p.priceBandHigh ?? undefined,
            issueSize: p.issueSizeCr ?? undefined,
            status: deriveStatus(p),
          },
          create: {
            name: p.name,
            slug,
            type: source.type,
            openDate: p.openDate,
            closeDate: p.closeDate,
            listingDate: p.listingDate,
            priceBandLow: p.priceBandLow,
            priceBandHigh: p.priceBandHigh,
            issueSize: p.issueSizeCr,
            status: deriveStatus(p),
          },
        });
        rowsIn++;
      }
    } catch (err) {
      rowsError++;
      notes.push(`${source.type}: ${err instanceof Error ? err.message : "fetch error"}`);
    }
  }

  return { rowsIn, rowsError, notes: notes.join(" | ") };
}
