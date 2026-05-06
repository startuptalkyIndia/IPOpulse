/**
 * NSE Company Master Import
 * --------------------------
 * Downloads the full NSE equity listing CSV (~2,600 companies) and upserts
 * them all into the companies table. Skips existing records by slug to avoid
 * clobbering prices / fundamentals already fetched.
 *
 * NSE CSV URL: https://archives.nseindia.com/content/equities/EQUITY_L.csv
 * Columns: SYMBOL, NAME OF COMPANY, SERIES, DATE OF LISTING, PAID UP VALUE,
 *          MARKET LOT, ISIN NUMBER, FACE VALUE
 *
 * Run once manually after first deploy, then monthly to pick up new listings.
 * Triggerable from /sup-min/ingestion as "nse_company_master"
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const NSE_CSV_URL =
  "https://archives.nseindia.com/content/equities/EQUITY_L.csv";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124",
  Accept: "text/csv,text/plain,*/*",
  Referer: "https://www.nseindia.com/",
};

function slugify(name: string, symbol: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
  return base || symbol.toLowerCase();
}

function parseDate(s: string): Date | undefined {
  if (!s || s.trim() === "-") return undefined;
  const d = new Date(s.trim());
  return isNaN(d.getTime()) ? undefined : d;
}

export async function ingestNseCompanyMaster(): Promise<IngestionResult> {
  const res = await fetch(NSE_CSV_URL, {
    headers: HEADERS,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`NSE CSV fetch failed: ${res.status}`);

  const text = await res.text();
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) throw new Error("Empty CSV");

  // Parse header
  const header = lines[0].split(",").map((h) => h.trim().toUpperCase());
  const col = (name: string) => header.indexOf(name);
  const SYM = col("SYMBOL");
  const NAME = col("NAME OF COMPANY");
  const DATE = col("DATE OF LISTING");
  const FACE = col("FACE VALUE");
  const ISIN = col("ISIN NUMBER");

  let rowsIn = 0;
  let rowsError = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    const symbol = parts[SYM]?.trim();
    const name = parts[NAME]?.trim();
    if (!symbol || !name || symbol === "SYMBOL") continue;

    const faceValue = FACE >= 0 && parts[FACE] ? Number(parts[FACE].trim()) : null;
    const listedOn = DATE >= 0 ? parseDate(parts[DATE]) : undefined;
    const isin = ISIN >= 0 ? parts[ISIN]?.trim() || null : null;

    const slug = slugify(name, symbol);

    try {
      await prisma.company.upsert({
        where: { nseSymbol: symbol },
        create: {
          nseSymbol: symbol,
          name,
          slug,
          isin: isin || undefined,
          listedOn,
          faceValue: faceValue ?? undefined,
          active: true,
        },
        update: {
          // Only update name/isin/listedOn — don't clobber prices/fundamentals
          name,
          isin: isin || undefined,
          listedOn: listedOn ?? undefined,
          faceValue: faceValue ?? undefined,
        },
      });
      rowsIn++;
    } catch {
      // Slug conflict — try with symbol suffix
      try {
        const slugAlt = `${slugify(name, symbol)}-${symbol.toLowerCase()}`;
        await prisma.company.upsert({
          where: { nseSymbol: symbol },
          create: {
            nseSymbol: symbol,
            name,
            slug: slugAlt,
            isin: isin || undefined,
            listedOn,
            faceValue: faceValue ?? undefined,
            active: true,
          },
          update: { name, isin: isin || undefined },
        });
        rowsIn++;
      } catch {
        rowsError++;
      }
    }
  }

  return { rowsIn, rowsError };
}
