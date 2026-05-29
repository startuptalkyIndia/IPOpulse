/**
 * Screener.in Deep Fundamentals Scraper
 * ─────────────────────────────────────────────────────────────────
 * Scrapes screener.in/company/{SYMBOL}/ public pages to extract:
 *   - Quarterly results (last ~10 quarters): Sales, Op Profit, OPM, PBT, Net Profit, EPS
 *   - Annual P&L (last ~10 years): Sales, NP, EPS, OPM, Dividend Payout
 *   - Balance Sheet (last ~10 years): Equity, Reserves, Borrowings, Assets
 *   - Cash Flow (last ~10 years): Ops, Investing, Financing
 *
 * Why we need this: Yahoo only gives trailing 12 months. For real analysis,
 * users need to see 10-year revenue trajectory, margin trend, debt history.
 * This is the differentiating data vs Yahoo-only sites.
 *
 * Rate: 1 req/3s — be respectful to Screener (free service).
 * Schedule: Top 200 companies refreshed monthly. Rest opportunistically.
 *
 * Parsing approach: regex over the HTML table structure rather than full
 * DOM parser — Screener's tables have stable class names (.data-table).
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const SCREENER_BASE = "https://www.screener.in/company";
const REQUEST_DELAY_MS = 3000; // 1 req / 3 sec
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── HTML table parsing helpers ─────────────────────────────────────────────

/**
 * Extract a section's table from Screener HTML by matching the section ID.
 * Screener structure: <section id="quarters"><table class="data-table">...</table></section>
 */
function extractSection(html: string, sectionId: string): string | null {
  const start = html.indexOf(`id="${sectionId}"`);
  if (start === -1) return null;
  const tableStart = html.indexOf("<table", start);
  if (tableStart === -1) return null;
  const tableEnd = html.indexOf("</table>", tableStart);
  if (tableEnd === -1) return null;
  return html.slice(tableStart, tableEnd + 8);
}

/**
 * Parse a Screener data-table into { headers: string[], rows: { [label]: string[] } }
 * Headers are the column dates (e.g. ["Mar 2024", "Jun 2024", ...])
 * Rows are keyed by metric name (e.g. "Sales", "Net Profit")
 */
interface TableData {
  headers: string[];
  rows: Record<string, string[]>;
}

function parseTable(tableHtml: string): TableData {
  // Strip HTML tags from a cell's text content
  const stripTags = (s: string) =>
    s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();

  // Extract headers from <thead><tr><th>...
  const theadMatch = tableHtml.match(/<thead[^>]*>([\s\S]*?)<\/thead>/);
  const headers: string[] = [];
  if (theadMatch) {
    const thMatches = Array.from(theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g));
    for (let i = 1; i < thMatches.length; i++) {
      // Skip first column (metric name placeholder)
      headers.push(stripTags(thMatches[i][1]));
    }
  }

  // Extract rows from <tbody><tr><td>...
  const rows: Record<string, string[]> = {};
  const tbodyMatch = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/);
  if (tbodyMatch) {
    const trMatches = Array.from(tbodyMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g));
    for (const tr of trMatches) {
      const cells = Array.from(tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g));
      if (cells.length < 2) continue;
      const label = stripTags(cells[0][1]).replace(/\s*\+\s*$/, "").trim(); // strip trailing "+" expand icon
      if (!label) continue;
      const values = cells.slice(1).map((c) => stripTags(c[1]));
      rows[label] = values;
    }
  }

  return { headers, rows };
}

/**
 * Convert "1,23,456" or "-1,234" or "12.5%" to number. Returns null if can't parse.
 */
function parseNumber(s: string | undefined): number | null {
  if (!s) return null;
  const cleaned = s.replace(/,/g, "").replace(/%/g, "").trim();
  if (cleaned === "" || cleaned === "-") return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * Parse Screener's date header "Mar 2026" → Date (last day of that month)
 */
function parseQuarterEnd(label: string): Date | null {
  const m = label.match(/^(\w+)\s+(\d{4})$/);
  if (!m) return null;
  const monthName = m[1].toLowerCase();
  const year = parseInt(m[2], 10);
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const monthIdx = months[monthName.slice(0, 3)];
  if (monthIdx === undefined) return null;
  // Last day of month
  return new Date(year, monthIdx + 1, 0);
}

// ─── Main scraper ────────────────────────────────────────────────────────────

interface ScrapedFundamentals {
  quarterly: Array<{
    quarter: string;
    quarterEnd: Date | null;
    sales: number | null;
    expenses: number | null;
    operatingProfit: number | null;
    opm: number | null;
    otherIncome: number | null;
    interest: number | null;
    depreciation: number | null;
    profitBeforeTax: number | null;
    tax: number | null;
    netProfit: number | null;
    eps: number | null;
  }>;
  annual: Array<{
    fiscalYear: string;
    yearEnd: Date | null;
    sales: number | null;
    expenses: number | null;
    operatingProfit: number | null;
    opm: number | null;
    netProfit: number | null;
    eps: number | null;
    dividendPayout: number | null;
  }>;
  balance: Array<{
    fiscalYear: string;
    equityCapital: number | null;
    reserves: number | null;
    borrowings: number | null;
    otherLiabilities: number | null;
    fixedAssets: number | null;
    investments: number | null;
    otherAssets: number | null;
    totalAssets: number | null;
  }>;
  cashflow: Array<{
    fiscalYear: string;
    cashFromOps: number | null;
    cashFromInvesting: number | null;
    cashFromFinancing: number | null;
    netCashFlow: number | null;
  }>;
  ratios: Array<{
    fiscalYear: string;
    roe: number | null;
    roce: number | null;
  }>;
}

async function scrapeCompany(symbol: string): Promise<ScrapedFundamentals | null> {
  const url = `${SCREENER_BASE}/${symbol}/`;
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    const html = await res.text();

    // ─ Quarterly Results ─
    const qTable = extractSection(html, "quarters");
    const qData = qTable ? parseTable(qTable) : { headers: [], rows: {} };

    // ─ Profit & Loss (Annual) ─
    const plTable = extractSection(html, "profit-loss");
    const plData = plTable ? parseTable(plTable) : { headers: [], rows: {} };

    // ─ Balance Sheet ─
    const bsTable = extractSection(html, "balance-sheet");
    const bsData = bsTable ? parseTable(bsTable) : { headers: [], rows: {} };

    // ─ Cash Flow ─
    const cfTable = extractSection(html, "cash-flow");
    const cfData = cfTable ? parseTable(cfTable) : { headers: [], rows: {} };

    // ─ Ratios ─
    const rTable = extractSection(html, "ratios");
    const rData = rTable ? parseTable(rTable) : { headers: [], rows: {} };

    const quarterly = qData.headers.map((h, i) => ({
      quarter: h,
      quarterEnd: parseQuarterEnd(h),
      sales: parseNumber(qData.rows["Sales"]?.[i]),
      expenses: parseNumber(qData.rows["Expenses"]?.[i]),
      operatingProfit: parseNumber(qData.rows["Operating Profit"]?.[i]),
      opm: parseNumber(qData.rows["OPM %"]?.[i]),
      otherIncome: parseNumber(qData.rows["Other Income"]?.[i]),
      interest: parseNumber(qData.rows["Interest"]?.[i]),
      depreciation: parseNumber(qData.rows["Depreciation"]?.[i]),
      profitBeforeTax: parseNumber(qData.rows["Profit before tax"]?.[i]),
      tax: parseNumber(qData.rows["Tax %"]?.[i]),
      netProfit: parseNumber(qData.rows["Net Profit"]?.[i]),
      eps: parseNumber(qData.rows["EPS in Rs"]?.[i]),
    }));

    const annual = plData.headers.map((h, i) => ({
      fiscalYear: h,
      yearEnd: parseQuarterEnd(h),
      sales: parseNumber(plData.rows["Sales"]?.[i]),
      expenses: parseNumber(plData.rows["Expenses"]?.[i]),
      operatingProfit: parseNumber(plData.rows["Operating Profit"]?.[i]),
      opm: parseNumber(plData.rows["OPM %"]?.[i]),
      netProfit: parseNumber(plData.rows["Net Profit"]?.[i]),
      eps: parseNumber(plData.rows["EPS in Rs"]?.[i]),
      dividendPayout: parseNumber(plData.rows["Dividend Payout %"]?.[i]),
    }));

    const balance = bsData.headers.map((h, i) => ({
      fiscalYear: h,
      equityCapital: parseNumber(bsData.rows["Equity Capital"]?.[i]),
      reserves: parseNumber(bsData.rows["Reserves"]?.[i]),
      borrowings: parseNumber(bsData.rows["Borrowings"]?.[i]),
      otherLiabilities: parseNumber(bsData.rows["Other Liabilities"]?.[i]),
      fixedAssets: parseNumber(bsData.rows["Fixed Assets"]?.[i]),
      investments: parseNumber(bsData.rows["Investments"]?.[i]),
      otherAssets: parseNumber(bsData.rows["Other Assets"]?.[i]),
      totalAssets: parseNumber(bsData.rows["Total Assets"]?.[i]),
    }));

    const cashflow = cfData.headers.map((h, i) => ({
      fiscalYear: h,
      cashFromOps: parseNumber(cfData.rows["Cash from Operating Activity"]?.[i]),
      cashFromInvesting: parseNumber(cfData.rows["Cash from Investing Activity"]?.[i]),
      cashFromFinancing: parseNumber(cfData.rows["Cash from Financing Activity"]?.[i]),
      netCashFlow: parseNumber(cfData.rows["Net Cash Flow"]?.[i]),
    }));

    const ratios = rData.headers.map((h, i) => ({
      fiscalYear: h,
      roe: parseNumber(rData.rows["ROE %"]?.[i]),
      roce: parseNumber(rData.rows["ROCE %"]?.[i]),
    }));

    return { quarterly, annual, balance, cashflow, ratios };
  } catch {
    return null;
  }
}

/**
 * Persist scraped data to DB. Quarterly into quarterly_results.
 * Annual P&L + balance + cash flow + ratios merged into annual_financials
 * (matched by fiscalYear string).
 */
async function persistFundamentals(companyId: number, data: ScrapedFundamentals): Promise<number> {
  let upserts = 0;

  // Quarterly
  for (const q of data.quarterly) {
    if (!q.quarterEnd) continue;
    try {
      await prisma.quarterlyResult.upsert({
        where: { companyId_quarter: { companyId, quarter: q.quarter } },
        create: {
          companyId,
          quarter: q.quarter,
          quarterEnd: q.quarterEnd,
          sales: q.sales,
          expenses: q.expenses,
          operatingProfit: q.operatingProfit,
          opm: q.opm,
          otherIncome: q.otherIncome,
          interest: q.interest,
          depreciation: q.depreciation,
          profitBeforeTax: q.profitBeforeTax,
          tax: q.tax,
          netProfit: q.netProfit,
          eps: q.eps,
        },
        update: {
          sales: q.sales,
          expenses: q.expenses,
          operatingProfit: q.operatingProfit,
          opm: q.opm,
          otherIncome: q.otherIncome,
          interest: q.interest,
          depreciation: q.depreciation,
          profitBeforeTax: q.profitBeforeTax,
          tax: q.tax,
          netProfit: q.netProfit,
          eps: q.eps,
          capturedAt: new Date(),
        },
      });
      upserts++;
    } catch {
      // Skip bad rows
    }
  }

  // Build merged annual rows: { [fiscalYear]: merged data }
  const annualMap = new Map<string, Partial<{ sales: number | null; expenses: number | null; operatingProfit: number | null; opm: number | null; netProfit: number | null; eps: number | null; dividendPayout: number | null; equityCapital: number | null; reserves: number | null; borrowings: number | null; otherLiabilities: number | null; fixedAssets: number | null; investments: number | null; otherAssets: number | null; totalAssets: number | null; cashFromOps: number | null; cashFromInvesting: number | null; cashFromFinancing: number | null; netCashFlow: number | null; roe: number | null; roce: number | null; yearEnd: Date | null }>>();

  for (const a of data.annual) {
    annualMap.set(a.fiscalYear, { ...annualMap.get(a.fiscalYear), ...a });
  }
  for (const b of data.balance) {
    annualMap.set(b.fiscalYear, { ...annualMap.get(b.fiscalYear), ...b });
  }
  for (const c of data.cashflow) {
    annualMap.set(c.fiscalYear, { ...annualMap.get(c.fiscalYear), ...c });
  }
  for (const r of data.ratios) {
    annualMap.set(r.fiscalYear, { ...annualMap.get(r.fiscalYear), ...r });
  }

  for (const [fiscalYear, vals] of annualMap.entries()) {
    if (!vals.yearEnd) continue;
    try {
      await prisma.annualFinancial.upsert({
        where: { companyId_fiscalYear: { companyId, fiscalYear } },
        create: {
          companyId,
          fiscalYear,
          yearEnd: vals.yearEnd,
          sales: vals.sales ?? null,
          expenses: vals.expenses ?? null,
          operatingProfit: vals.operatingProfit ?? null,
          opm: vals.opm ?? null,
          netProfit: vals.netProfit ?? null,
          eps: vals.eps ?? null,
          dividendPayout: vals.dividendPayout ?? null,
          equityCapital: vals.equityCapital ?? null,
          reserves: vals.reserves ?? null,
          borrowings: vals.borrowings ?? null,
          otherLiabilities: vals.otherLiabilities ?? null,
          fixedAssets: vals.fixedAssets ?? null,
          investments: vals.investments ?? null,
          otherAssets: vals.otherAssets ?? null,
          totalAssets: vals.totalAssets ?? null,
          cashFromOps: vals.cashFromOps ?? null,
          cashFromInvesting: vals.cashFromInvesting ?? null,
          cashFromFinancing: vals.cashFromFinancing ?? null,
          netCashFlow: vals.netCashFlow ?? null,
          roe: vals.roe ?? null,
          roce: vals.roce ?? null,
        },
        update: {
          sales: vals.sales ?? null,
          expenses: vals.expenses ?? null,
          operatingProfit: vals.operatingProfit ?? null,
          opm: vals.opm ?? null,
          netProfit: vals.netProfit ?? null,
          eps: vals.eps ?? null,
          dividendPayout: vals.dividendPayout ?? null,
          equityCapital: vals.equityCapital ?? null,
          reserves: vals.reserves ?? null,
          borrowings: vals.borrowings ?? null,
          otherLiabilities: vals.otherLiabilities ?? null,
          fixedAssets: vals.fixedAssets ?? null,
          investments: vals.investments ?? null,
          otherAssets: vals.otherAssets ?? null,
          totalAssets: vals.totalAssets ?? null,
          cashFromOps: vals.cashFromOps ?? null,
          cashFromInvesting: vals.cashFromInvesting ?? null,
          cashFromFinancing: vals.cashFromFinancing ?? null,
          netCashFlow: vals.netCashFlow ?? null,
          roe: vals.roe ?? null,
          roce: vals.roce ?? null,
          capturedAt: new Date(),
        },
      });
      upserts++;
    } catch {
      // Skip bad rows
    }
  }

  return upserts;
}

/**
 * Main ingestion. Scrapes top N companies by market cap (default 200).
 * Set SCREENER_TOP_N env var to override.
 */
export async function ingestScreenerDeepFundamentals(): Promise<IngestionResult> {
  const limit = parseInt(process.env.SCREENER_TOP_N ?? "200", 10);

  const companies = await prisma.company.findMany({
    where: {
      active: true,
      isSme: false,
      nseSymbol: { not: null },
      marketCap: { not: null },
    },
    select: { id: true, nseSymbol: true, name: true },
    orderBy: { marketCap: "desc" },
    take: limit,
  });

  console.log(`[screener-deep] Scraping ${companies.length} companies (top by mkt cap)`);
  let rowsIn = 0;
  let rowsError = 0;

  for (let i = 0; i < companies.length; i++) {
    const c = companies[i];
    if (!c.nseSymbol) continue;

    const data = await scrapeCompany(c.nseSymbol);
    if (!data) {
      rowsError++;
    } else {
      const n = await persistFundamentals(c.id, data);
      rowsIn += n;
      if ((i + 1) % 20 === 0) {
        console.log(`[screener-deep] ${i + 1}/${companies.length} done, ${rowsIn} rows upserted`);
      }
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`[screener-deep] Complete. upserted=${rowsIn} errors=${rowsError}`);
  return { rowsIn, rowsError };
}
