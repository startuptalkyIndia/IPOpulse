/**
 * Insider Trading (SEBI PIT disclosures) from NSE.
 *
 * The old per-company /api/corporate-insider endpoint is dead. The working
 * source is the market-wide PIT (Prohibition of Insider Trading) feed:
 *   /api/corporates-pit?index=equities&from_date=DD-MM-YYYY&to_date=DD-MM-YYYY
 * which returns every insider disclosure across all companies in one call.
 *
 * Schedule: daily at 6 PM IST. Pulls the last 60 days each run (idempotent
 * upsert on the [date,exchange,symbol,acquirerName,tradeType,qty] unique key).
 *
 * Why this matters: a promoter buying their own stock at market price (no
 * discount) is among the most bullish conviction signals in Indian markets.
 */

import { prisma } from "@/lib/db";
import { fetchNse } from "@/lib/nse-session";
import type { IngestionResult } from "../runIngestion";

interface PitRow {
  acqName?: string;
  acqMode?: string;
  company?: string;
  symbol?: string;
  personCategory?: string;
  secType?: string;
  secAcq?: string;
  secVal?: string;
  buyQuantity?: string;
  buyValue?: string;
  sellquantity?: string;
  sellValue?: string;
  befAcqSharesPer?: string;
  afterAcqSharesPer?: string;
  acqfromDt?: string;
  intimDt?: string;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})-(\w{3})-(\d{4})/);
  if (!m) return null;
  const mon = MONTHS[m[2].toLowerCase()];
  if (mon === undefined) return null;
  return new Date(Date.UTC(parseInt(m[3], 10), mon, parseInt(m[1], 10)));
}

function num(s: string | undefined): number {
  if (!s) return 0;
  return parseFloat(String(s).replace(/,/g, "")) || 0;
}

function ddmmyyyy(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function mapAcquirerType(cat: string | undefined): string {
  const c = (cat ?? "").toLowerCase();
  if (c.includes("promoter")) return "Promoter";
  if (c.includes("director")) return "Director";
  if (c.includes("kmp") || c.includes("management")) return "KMP";
  return cat || "Other";
}

function mapTradeType(r: PitRow): string {
  const mode = (r.acqMode ?? "").toLowerCase();
  if (mode.includes("pledge")) return "Pledge";
  if (mode.includes("revoke") || mode.includes("invoke")) return "Revoke";
  if (mode.includes("esop") || mode.includes("allot") || mode.includes("rights")) return "Allotment";
  if (num(r.sellValue) > 0 || num(r.sellquantity) > 0) return "Sell";
  return "Buy";
}

export async function ingestInsiderTrades(): Promise<IngestionResult> {
  const today = new Date();
  const past = new Date(today.getTime() - 60 * 86400000);

  let rows: PitRow[] = [];
  try {
    const raw = await fetchNse<{ data?: PitRow[] }>(
      `/api/corporates-pit?index=equities&from_date=${ddmmyyyy(past)}&to_date=${ddmmyyyy(today)}`,
    );
    rows = raw?.data ?? [];
  } catch (e) {
    return { rowsIn: 0, rowsError: 1, notes: `PIT fetch failed: ${e instanceof Error ? e.message : "error"}` };
  }

  let inserted = 0;
  let errors = 0;

  for (const r of rows) {
    try {
      const sym = (r.symbol ?? "").toUpperCase().trim();
      const acquirer = (r.acqName ?? "").trim();
      if (!sym || !acquirer) continue;
      const date = parseDate(r.acqfromDt) ?? parseDate(r.intimDt) ?? today;
      const tradeType = mapTradeType(r);
      const qtyNum = num(r.secAcq) || num(r.buyQuantity) || num(r.sellquantity);
      const qty = BigInt(Math.round(qtyNum)); // part of unique key — default 0n if unknown
      const valueLakh = num(r.secVal) > 0 ? num(r.secVal) / 100000 : null;

      await prisma.insiderTrade.upsert({
        where: {
          date_exchange_symbol_acquirerName_tradeType_qty: {
            date, exchange: "NSE", symbol: sym, acquirerName: acquirer, tradeType, qty,
          },
        },
        update: {
          valueLakh,
          preHoldingPct: r.befAcqSharesPer ? num(r.befAcqSharesPer) : null,
          postHoldingPct: r.afterAcqSharesPer ? num(r.afterAcqSharesPer) : null,
        },
        create: {
          date, exchange: "NSE", symbol: sym,
          companyName: (r.company ?? sym).trim(),
          acquirerName: acquirer,
          acquirerType: mapAcquirerType(r.personCategory),
          securityType: r.secType ?? "Equity",
          tradeType, qty, valueLakh,
          preHoldingPct: r.befAcqSharesPer ? num(r.befAcqSharesPer) : null,
          postHoldingPct: r.afterAcqSharesPer ? num(r.afterAcqSharesPer) : null,
          disclosureDate: parseDate(r.intimDt),
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
    notes: `PIT: ${rows.length} disclosures fetched → ${inserted} upserted, ${errors} errors`,
  };
}
