/**
 * Insider Trading (SEBI PIT disclosures) from NSE.
 *
 * Rebuilt 2026-09-23. NSE quietly replaced the old bulk endpoint
 * (/api/corporates-pit?...&from_date=...&to_date=... — returned full trade
 * details in one JSON call) with /api/corporates-pit-gg?index=equities,
 * which only returns a FILING INDEX (company, symbol, a link to a
 * human-readable HTML document per filing) — no date-range filter, no trade
 * details inline. The actual acquirer/quantity/value/holding-% numbers now
 * live in each filing's own document, fetched and parsed by
 * `parseInsiderFilingHtml` (src/lib/scrapers/nse-insider-filing.ts).
 *
 * This means one run of this job can involve fetching MANY documents (the
 * index currently holds ~2,700+ filings spanning months, with no way to ask
 * NSE for "just today's"), so:
 *   - `ProcessedInsiderFiling` tracks which appIds have already been fetched
 *     + parsed, so a run only touches NEW filings, not the whole backlog.
 *   - A per-run cap + wall-time cap bound each run's cost; a large backlog
 *     works down over consecutive daily runs (newest filings first), not in
 *     one shot.
 *   - The per-filing document fetch needs no NSE session/cookies (it's a
 *     static archive at nsearchives.nseindia.com) — only the index call
 *     goes through the cookie-authenticated `fetchNse`.
 *
 * Schedule: daily at 6 PM IST.
 *
 * Why this matters: a promoter buying their own stock at market price (no
 * discount) is among the most bullish conviction signals in Indian markets.
 */

import { prisma } from "@/lib/db";
import { fetchNse } from "@/lib/nse-session";
import { parseInsiderFilingHtml, type ParsedPitRow } from "@/lib/scrapers/nse-insider-filing";
import type { IngestionResult } from "../runIngestion";

const MAX_FILINGS_PER_RUN = parseInt(process.env.INSIDER_MAX_FILINGS_PER_RUN ?? "50", 10);
const MAX_WALL_MS = 10 * 60 * 1000;
const FILING_FETCH_TIMEOUT_MS = 15000;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

interface PitFilingIndexRow {
  appId: string;
  companyName?: string;
  symbol?: string;
  broadcastDateTime?: string; // "23-Sep-2026 11:45:15"
  ixbrl?: string; // document URL
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** "23-Sep-2026 11:45:15" (filing index timestamps). */
function parseBroadcastDateTime(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})-(\w{3})-(\d{4})/);
  if (!m) return null;
  const mon = MONTHS[m[2].toLowerCase()];
  if (mon === undefined) return null;
  return new Date(Date.UTC(parseInt(m[3], 10), mon, parseInt(m[1], 10)));
}

/** "18-09-2026" (dates inside the per-filing PIT disclosure table). */
function parseDdmmyyyyNumeric(s: string | null): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!m) return null;
  return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10)));
}

function mapAcquirerType(cat: string | undefined): string {
  const c = (cat ?? "").toLowerCase();
  if (c.includes("promoter")) return "Promoter";
  if (c.includes("director")) return "Director";
  if (c.includes("kmp") || c.includes("management")) return "KMP";
  return cat || "Other";
}

function mapTradeType(row: ParsedPitRow): string {
  const mode = (row.modeOfAcquisition ?? "").toLowerCase();
  if (mode.includes("pledge")) return "Pledge";
  if (mode.includes("revoke") || mode.includes("invoke")) return "Revoke";
  if (mode.includes("esop") || mode.includes("allot") || mode.includes("rights")) return "Allotment";
  const txn = (row.transactionType ?? "").toLowerCase();
  if (txn.includes("sell")) return "Sell";
  if (txn.includes("buy")) return "Buy";
  return row.transactionType || "Buy";
}

async function markProcessed(appId: string): Promise<void> {
  await prisma.processedInsiderFiling
    .upsert({ where: { appId }, create: { appId }, update: {} })
    .catch(() => {});
}

export async function ingestInsiderTrades(): Promise<IngestionResult> {
  const startedAt = Date.now();

  let filings: PitFilingIndexRow[] = [];
  try {
    const raw = await fetchNse<{ data?: PitFilingIndexRow[] }>(`/api/corporates-pit-gg?index=equities`);
    filings = (raw?.data ?? []).filter((f) => f.appId);
  } catch (e) {
    return { rowsIn: 0, rowsError: 1, notes: `Filing index fetch failed: ${e instanceof Error ? e.message : "error"}` };
  }

  if (filings.length === 0) {
    return { rowsIn: 0, notes: "0 filings in index — NSE may have changed this endpoint again, worth a manual check" };
  }

  filings.sort((a, b) => (parseBroadcastDateTime(b.broadcastDateTime)?.getTime() ?? 0) - (parseBroadcastDateTime(a.broadcastDateTime)?.getTime() ?? 0));

  const appIds = filings.map((f) => f.appId);
  const alreadyProcessed = await prisma.processedInsiderFiling.findMany({
    where: { appId: { in: appIds } },
    select: { appId: true },
  });
  const processedSet = new Set(alreadyProcessed.map((p) => p.appId));
  const toProcess = filings.filter((f) => !processedSet.has(f.appId)).slice(0, MAX_FILINGS_PER_RUN);

  let filingsProcessed = 0;
  let tradesInserted = 0;
  let fetchErrors = 0;
  let nonEquitySkipped = 0;
  let timedOut = false;

  for (const filing of toProcess) {
    if (Date.now() - startedAt > MAX_WALL_MS) {
      timedOut = true;
      break;
    }
    if (!filing.ixbrl) {
      await markProcessed(filing.appId); // no document to fetch — nothing to retry
      continue;
    }

    try {
      const res = await fetch(filing.ixbrl, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(FILING_FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        fetchErrors++;
        continue; // leave unprocessed — retry next run
      }
      const html = await res.text();
      const parsed = parseInsiderFilingHtml(html);
      nonEquitySkipped += parsed.skippedNonEquityRows;

      const sym = (parsed.nseSymbol || filing.symbol || "").toUpperCase().trim();
      if (sym && parsed.rows.length > 0) {
        const company = await prisma.company.findUnique({ where: { nseSymbol: sym }, select: { name: true } });
        const companyName = company?.name ?? filing.companyName ?? sym;
        const filingDate = parseBroadcastDateTime(filing.broadcastDateTime);

        for (const row of parsed.rows) {
          if (!row.nameOfPerson) continue;
          const date = parseDdmmyyyyNumeric(row.fromDate) ?? parseDdmmyyyyNumeric(row.dateOfIntimation) ?? filingDate ?? new Date();
          const tradeType = mapTradeType(row);
          const qty = BigInt(Math.round(row.acquiredQty ?? 0));
          const valueLakh = row.acquiredValue != null && row.acquiredValue > 0 ? row.acquiredValue / 100000 : null;

          try {
            await prisma.insiderTrade.upsert({
              where: {
                date_exchange_symbol_acquirerName_tradeType_qty: {
                  date, exchange: "NSE", symbol: sym, acquirerName: row.nameOfPerson, tradeType, qty,
                },
              },
              update: {
                valueLakh,
                preHoldingPct: row.prePct,
                postHoldingPct: row.postPct,
              },
              create: {
                date, exchange: "NSE", symbol: sym, companyName,
                acquirerName: row.nameOfPerson,
                acquirerType: mapAcquirerType(row.categoryOfPerson),
                securityType: "Equity",
                tradeType, qty, valueLakh,
                preHoldingPct: row.prePct,
                postHoldingPct: row.postPct,
                disclosureDate: parseDdmmyyyyNumeric(row.dateOfIntimation) ?? filingDate,
              },
            });
            tradesInserted++;
          } catch {
            // single-row failure must not abort the whole filing
          }
        }
      }

      await markProcessed(filing.appId);
      filingsProcessed++;
      await new Promise((r) => setTimeout(r, 300)); // be polite to NSE's archive host
    } catch (e) {
      fetchErrors++; // network/parse error — leave unprocessed, retry next run
      void e;
    }
  }

  const backlogRemaining = filings.length - processedSet.size - filingsProcessed;

  return {
    rowsIn: tradesInserted,
    rowsError: fetchErrors,
    notes:
      `${filingsProcessed}/${toProcess.length} new filings processed → ${tradesInserted} equity trades upserted, ` +
      `${nonEquitySkipped} non-equity disclosure rows skipped, ${fetchErrors} fetch errors, ` +
      `~${Math.max(0, backlogRemaining)} unprocessed filings remain in the backlog` +
      (timedOut ? ` — stopped early at wall-time cap ${MAX_WALL_MS}ms` : ""),
  };
}
