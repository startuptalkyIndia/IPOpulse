/**
 * Parser for NSE's individual insider-trading (PIT) filing documents.
 *
 * Each filing referenced by /api/corporates-pit-gg links to an "ixbrl" HTML
 * page (e.g. https://nsearchives.nseindia.com/corporate/ixbrl/IT_...html) —
 * despite the name, this is plain human-readable HTML with a real <table>,
 * not binary XBRL. No NSE session/cookies needed to fetch it (verified: a
 * bare curl with just a User-Agent returns 200).
 *
 * The "PIT Disclosure" table's header spans 3 physical <tr> rows via
 * rowspan/colspan (e.g. "Securities acquired / disposed" spans 3 leaf
 * columns: No. of security, Value of security, Transaction type). Column
 * POSITION is not treated as stable across instrument types (Equity vs
 * Warrants vs Options can populate different columns), so this parser
 * expands the header into a flat label per column and looks columns up by
 * label text, not index — robust to NSE reordering columns, not robust to
 * NSE renaming a label outright (in which case the affected field silently
 * comes back undefined, which callers already treat as "skip this field",
 * not a crash).
 *
 * Scope: only rows where "Type of instrument" is "Equity" are parsed (the
 * vast majority of PIT disclosures, and what /ipo /ticker pages care about).
 * Other instrument types (Warrants, Options, etc.) are counted and skipped
 * rather than force-mapped into the wrong columns — see ParsedFilingResult.
 */

import * as cheerio from "cheerio";

export interface ParsedPitRow {
  categoryOfPerson: string;
  nameOfPerson: string;
  cinDin: string | null;
  preQty: number | null;
  prePct: number | null;
  acquiredQty: number | null;
  acquiredValue: number | null;
  transactionType: string | null; // "Buy" | "Sell" | other free text NSE uses
  postQty: number | null;
  postPct: number | null;
  fromDate: string | null; // as printed, e.g. "18-09-2026"
  toDate: string | null;
  modeOfAcquisition: string | null;
  dateOfIntimation: string | null;
  exchange: string | null;
  notes: string | null;
}

export interface ParsedFilingResult {
  nseSymbol: string | null;
  isin: string | null;
  rows: ParsedPitRow[];
  skippedNonEquityRows: number;
}

function cleanText(s: string | undefined | null): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function parseNum(s: string): number | null {
  const cleaned = cleanText(s).replace(/[,%]/g, "");
  if (!cleaned || cleaned.toUpperCase() === "NA") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Expands a <thead> with rowspan/colspan into one flattened label per leaf column. */
function buildColumnLabels($: cheerio.CheerioAPI, thead: ReturnType<cheerio.CheerioAPI>): string[] {
  const rows = thead.find("tr").toArray();
  const grid: string[][] = rows.map(() => []);

  rows.forEach((rowEl, r) => {
    const cells = $(rowEl).find("th").toArray();
    let col = 0;
    for (const cell of cells) {
      while (grid[r][col] !== undefined) col++;
      const text = cleanText($(cell).text());
      const rowspan = parseInt($(cell).attr("rowspan") || "1", 10);
      const colspan = parseInt($(cell).attr("colspan") || "1", 10);
      for (let dr = 0; dr < rowspan && r + dr < grid.length; dr++) {
        for (let dc = 0; dc < colspan; dc++) {
          grid[r + dr][col + dc] = text;
        }
      }
      col += colspan;
    }
  });

  const numCols = Math.max(0, ...grid.map((row) => row.length));
  const labels: string[] = [];
  for (let c = 0; c < numCols; c++) {
    const parts: string[] = [];
    let last = "";
    for (let r = 0; r < grid.length; r++) {
      const v = grid[r][c];
      if (v && v !== last) {
        parts.push(v);
        last = v;
      }
    }
    labels.push(parts.join(" > "));
  }
  return labels;
}

function findCol(labels: string[], ...mustInclude: string[]): number {
  const lower = labels.map((l) => l.toLowerCase());
  return lower.findIndex((l) => mustInclude.every((s) => l.includes(s.toLowerCase())));
}

export function parseInsiderFilingHtml(html: string): ParsedFilingResult {
  const $ = cheerio.load(html);

  // "General information about company" key-value table — first table on the page.
  let nseSymbol: string | null = null;
  let isin: string | null = null;
  $("table").each((_, table) => {
    const rows = $(table).find("tr").toArray();
    for (const row of rows) {
      const cells = $(row).find("td, th").toArray();
      if (cells.length < 2) continue;
      const key = cleanText($(cells[0]).text()).toLowerCase();
      const value = cleanText($(cells[1]).text());
      if (key === "nse symbol") nseSymbol = value;
      if (key === "isin code") isin = value;
    }
  });

  // Find the PIT Disclosure table specifically (there are multiple tables on the page).
  const pitHeading = $("*").filter((_, el) => $(el).text().trim() === "PIT Disclosure").first();
  const pitTable = pitHeading.length ? pitHeading.nextAll("div").first().find("table").first() : $();
  if (!pitTable.length || !pitTable.find("thead").length) {
    return { nseSymbol, isin, rows: [], skippedNonEquityRows: 0 };
  }

  const labels = buildColumnLabels($, pitTable.find("thead").first());
  const colInstrument = findCol(labels, "type of instrument");
  const colCategory = findCol(labels, "category of person");
  const colName = findCol(labels, "name of the person");
  const colCinDin = findCol(labels, "cin", "din");
  const colPreQty = findCol(labels, "held prior", "no. of security");
  const colPrePct = findCol(labels, "held prior", "% of shareholding");
  const colAcqQty = findCol(labels, "acquired", "disposed", "no. of security");
  const colAcqValue = findCol(labels, "acquired", "disposed", "value of security");
  const colTxnType = findCol(labels, "acquired", "disposed", "transaction type");
  const colPostQty = findCol(labels, "held post", "no. of security");
  const colPostPct = findCol(labels, "held post", "% of shareholding");
  const colFromDate = findCol(labels, "date of allotment", "from date");
  const colToDate = findCol(labels, "date of allotment", "to date");
  const colMode = findCol(labels, "mode of acquisition");
  const colIntimation = findCol(labels, "date of intimation");
  const colExchange = findCol(labels, "exchange on which");
  const colNotes = findCol(labels, "notes");

  const rows: ParsedPitRow[] = [];
  let skippedNonEquityRows = 0;

  pitTable
    .find("tbody tr")
    .toArray()
    .forEach((tr) => {
      const cells = $(tr).find("td").toArray().map((td) => cleanText($(td).text()));
      if (cells.length === 0) return;

      const instrument = colInstrument >= 0 ? cells[colInstrument] : "";
      if (instrument.toLowerCase() !== "equity") {
        skippedNonEquityRows++;
        return;
      }

      const at = (col: number): string => (col >= 0 && col < cells.length ? cells[col] : "");

      rows.push({
        categoryOfPerson: at(colCategory),
        nameOfPerson: at(colName),
        cinDin: at(colCinDin) || null,
        preQty: parseNum(at(colPreQty)),
        prePct: parseNum(at(colPrePct)),
        acquiredQty: parseNum(at(colAcqQty)),
        acquiredValue: parseNum(at(colAcqValue)),
        transactionType: at(colTxnType) || null,
        postQty: parseNum(at(colPostQty)),
        postPct: parseNum(at(colPostPct)),
        fromDate: at(colFromDate) || null,
        toDate: at(colToDate) || null,
        modeOfAcquisition: at(colMode) || null,
        dateOfIntimation: at(colIntimation) || null,
        exchange: at(colExchange) || null,
        notes: at(colNotes) || null,
      });
    });

  return { nseSymbol, isin, rows, skippedNonEquityRows };
}
