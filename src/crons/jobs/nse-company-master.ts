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

export interface CompanyRow {
  symbol: string;
  name: string;
  slug: string;
  isin: string | null;
  listedOn?: Date;
  faceValue: number | null;
}

function isUniqueViolation(err: unknown, field: string): boolean {
  const e = err as { code?: string; meta?: { target?: unknown } } | null;
  if (!e || e.code !== "P2002") return false;
  const t = e.meta?.target;
  return Array.isArray(t) ? t.includes(field) : typeof t === "string" ? t.includes(field) : true;
}

/**
 * Idempotent company upsert (IP-04). The old code upserted by nseSymbol only, so a
 * renamed ticker (same ISIN, new symbol) tried to INSERT a second row with the
 * same ISIN and died on the unique(isin) index, every run. Now:
 *  1. match by nseSymbol -> update;
 *  2. else match by ISIN -> update name/listedOn/faceValue ONLY. nseSymbol is
 *     never rewritten (bhavcopy matches on it; see Company.yahooSymbol note);
 *  3. else create, retrying once with a symbol-suffixed slug on a slug clash.
 * Returns how the row was matched. Throws only for genuine failures.
 */
export async function upsertCompany(row: CompanyRow): Promise<"symbol-match" | "isin-match" | "created"> {
  const { symbol, name, slug, isin, listedOn, faceValue } = row;
  const data = {
    name,
    listedOn: listedOn ?? undefined,
    faceValue: faceValue ?? undefined,
  };

  const bySymbol = await prisma.company.findUnique({ where: { nseSymbol: symbol }, select: { id: true, isin: true } });
  if (bySymbol) {
    // Only set ISIN when the row has none, or no other row owns it.
    let isinUpdate: string | undefined;
    if (isin && bySymbol.isin !== isin) {
      const owner = await prisma.company.findUnique({ where: { isin }, select: { id: true } });
      if (!owner || owner.id === bySymbol.id) isinUpdate = isin;
    }
    await prisma.company.update({ where: { id: bySymbol.id }, data: { ...data, isin: isinUpdate } });
    return "symbol-match";
  }

  if (isin) {
    const byIsin = await prisma.company.findUnique({ where: { isin }, select: { id: true } });
    if (byIsin) {
      await prisma.company.update({ where: { id: byIsin.id }, data });
      return "isin-match";
    }
  }

  try {
    await prisma.company.create({
      data: { nseSymbol: symbol, slug, isin: isin || undefined, active: true, ...data },
    });
  } catch (err) {
    if (!isUniqueViolation(err, "slug")) throw err;
    await prisma.company.create({
      data: { nseSymbol: symbol, slug: `${slug}-${symbol.toLowerCase()}`, isin: isin || undefined, active: true, ...data },
    });
  }
  return "created";
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
  let isinMatched = 0;
  const errorSamples: string[] = [];

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
      const outcome = await upsertCompany({ symbol, name, slug, isin, listedOn, faceValue });
      if (outcome === "isin-match") isinMatched++;
      rowsIn++;
    } catch (err) {
      rowsError++;
      if (errorSamples.length < 3) {
        errorSamples.push(`${symbol}: ${(err instanceof Error ? err.message : String(err)).split("\n").pop()?.slice(0, 120)}`);
      }
    }
  }

  const notes =
    `companies upserted=${rowsIn} errors=${rowsError}` +
    (isinMatched ? ` matched-by-isin(symbol changed, symbol left untouched)=${isinMatched}` : "") +
    (errorSamples.length ? ` first errors: ${errorSamples.join(" | ")}` : "");
  // runIngestion resolves status: rowsError>0 with rowsIn>0 => "partial".
  return { rowsIn, rowsError, notes };
}
