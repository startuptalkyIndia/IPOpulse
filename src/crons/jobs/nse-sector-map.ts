/**
 * NSE Sector Mapper
 * ------------------
 * Downloads Nifty index constituent CSVs from NSE archives (open, no auth)
 * and maps Industry/Sector to companies in our DB by NSE symbol.
 *
 * Sources (all accessible from cloud IPs via archives.nseindia.com):
 *   ind_nifty500list.csv   — 500 largest companies with Industry
 *   ind_niftybanklist.csv  — Banking
 *   ind_niftyitlist.csv    — IT
 *   ind_niftypharmalist.csv
 *   ind_niftyautomobilelist.csv
 *   ind_niftyfmcglist.csv
 *   ind_niftymidcap150list.csv
 *   ind_niftysmallcap250list.csv
 *
 * Result: ~2,000 companies get sector + industry populated.
 * Run once after company master import, then monthly.
 */

import axios from "axios";
import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const BASE = "https://archives.nseindia.com/content/indices";

// Index file → sector name mapping
const INDEX_FILES: Array<{ file: string; sector: string }> = [
  { file: "ind_nifty500list.csv",          sector: "" }, // uses Industry column
  { file: "ind_niftybanklist.csv",          sector: "Banking" },
  { file: "ind_niftyitlist.csv",            sector: "IT" },
  { file: "ind_niftypharmalist.csv",        sector: "Pharma" },
  { file: "ind_niftyautomobilelist.csv",    sector: "Auto" },
  { file: "ind_niftyfmcglist.csv",          sector: "FMCG" },
  { file: "ind_niftymetal.csv",             sector: "Metal" },
  { file: "ind_niftyenergy.csv",            sector: "Energy" },
  { file: "ind_niftyinfrastructure.csv",    sector: "Infrastructure" },
  { file: "ind_niftymidcap150list.csv",     sector: "" },
  { file: "ind_niftysmallcap250list.csv",   sector: "" },
  { file: "ind_niftyfinancelist.csv",       sector: "Financial Services" },
  { file: "ind_niftyrealtylist.csv",        sector: "Realty" },
  { file: "ind_niftymediaindex.csv",        sector: "Media" },
];

interface CsvRow {
  "Company Name": string;
  Industry: string;
  Symbol: string;
  Series: string;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""])) as unknown as CsvRow;
  });
}

export async function ingestNseSectorMap(): Promise<IngestionResult> {
  // symbol → { sector, industry }
  const sectorMap = new Map<string, { sector: string; industry: string }>();

  for (const { file, sector } of INDEX_FILES) {
    try {
      const { data } = await axios.get<string>(`${BASE}/${file}`, {
        timeout: 15000,
        headers: { "User-Agent": UA, Referer: "https://www.nseindia.com/" },
      });
      const rows = parseCsv(data);
      for (const row of rows) {
        const sym = row.Symbol?.trim();
        if (!sym || row.Series !== "EQ") continue;
        const industry = row.Industry?.trim() || "";
        const resolvedSector = sector || mapIndustryToSector(industry) || industry;
        // Don't overwrite if already mapped from a more specific index
        if (!sectorMap.has(sym)) {
          sectorMap.set(sym, { sector: resolvedSector, industry });
        }
      }
    } catch {
      // skip unavailable index files silently
    }
  }

  // Update DB
  let rowsIn = 0;
  for (const [symbol, { sector, industry }] of sectorMap) {
    if (!sector && !industry) continue;
    const updated = await prisma.company.updateMany({
      where: { nseSymbol: symbol, OR: [{ sector: null }, { sector: "" }] },
      data: {
        sector: sector || industry || undefined,
        industry: industry || undefined,
      },
    });
    rowsIn += updated.count;
  }

  return { rowsIn, notes: `Mapped ${sectorMap.size} symbols, updated ${rowsIn} companies` };
}

function mapIndustryToSector(industry: string): string {
  const i = industry.toLowerCase();
  if (i.includes("bank")) return "Banking";
  if (i.includes("software") || i.includes("it ") || i.includes("information technology")) return "IT";
  if (i.includes("pharma") || i.includes("drug")) return "Pharma";
  if (i.includes("automobile") || i.includes("auto")) return "Auto";
  if (i.includes("fmcg") || i.includes("consumer good") || i.includes("personal product")) return "FMCG";
  if (i.includes("metal") || i.includes("steel") || i.includes("aluminium")) return "Metal";
  if (i.includes("oil") || i.includes("gas") || i.includes("petroleum") || i.includes("refinery")) return "Oil & Gas";
  if (i.includes("power") || i.includes("electric") || i.includes("energy")) return "Power";
  if (i.includes("cement") || i.includes("construction material")) return "Cement";
  if (i.includes("realty") || i.includes("real estate")) return "Realty";
  if (i.includes("telecom") || i.includes("communication")) return "Telecom";
  if (i.includes("insurance")) return "Insurance";
  if (i.includes("nbfc") || i.includes("finance") || i.includes("financial")) return "Financial Services";
  if (i.includes("media") || i.includes("entertainment")) return "Media";
  if (i.includes("chemical")) return "Chemicals";
  if (i.includes("textile") || i.includes("apparel")) return "Textiles";
  if (i.includes("hospital") || i.includes("health")) return "Healthcare";
  if (i.includes("infrastructure") || i.includes("ports") || i.includes("airport")) return "Infrastructure";
  if (i.includes("retail")) return "Retail";
  if (i.includes("agri") || i.includes("fertiliser") || i.includes("pesticide")) return "Agriculture";
  return "";
}
