/**
 * Bulk + Block deal ingestion from NSE.
 *
 * The old /api/historical/cm/{bulk,block}-deals endpoints now fail (500) from
 * cloud. The working source is the daily snapshot:
 *   /api/snapshot-capital-market-largedeal
 * which returns BULK_DEALS_DATA, BLOCK_DEALS_DATA and SHORT_DEALS_DATA for the
 * latest trading day in one call.
 *
 * Schedule: daily at 5:30 PM IST (after market close + NSE uploads ~5 PM).
 * Each run captures that day's deals; history accumulates over time.
 *
 * Why this matters: bulk/block deals reveal institutional conviction.
 *   - Bulk deal = >0.5% of company shares traded in a single session
 *   - Block deal = pre-negotiated large trade in the block window
 */

import { prisma } from "@/lib/db";
import { fetchNse } from "@/lib/nse-session";

interface NseSnapshotDeal {
  buySell: string | null;     // "BUY" | "SELL"
  clientName: string | null;
  date: string | null;        // "05-Jun-2026"
  name: string | null;        // company name
  qty: string | null;
  remarks: string | null;
  symbol: string | null;
  watp: string | null;        // weighted-avg traded price
}

interface SnapshotResponse {
  as_on_date?: string;
  BULK_DEALS_DATA?: NseSnapshotDeal[];
  BLOCK_DEALS_DATA?: NseSnapshotDeal[];
  SHORT_DEALS_DATA?: NseSnapshotDeal[];
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseNseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})-(\w{3})-(\d{4})$/);
  if (!m) return null;
  const mon = MONTHS[m[2].toLowerCase()];
  if (mon === undefined) return null;
  return new Date(Date.UTC(parseInt(m[3], 10), mon, parseInt(m[1], 10)));
}

function parseNum(v: string | null | undefined): number {
  if (v == null) return 0;
  return parseFloat(String(v).replace(/,/g, "")) || 0;
}

async function upsertDeals(
  deals: NseSnapshotDeal[],
  kind: "bulk" | "block",
  fallbackDate: Date,
): Promise<{ ok: number; err: number }> {
  let ok = 0, err = 0;
  for (const d of deals) {
    try {
      const sym = (d.symbol ?? "").toUpperCase().trim();
      if (!sym) { continue; }
      const client = (d.clientName ?? "").trim() || "—";
      const type = (d.buySell ?? "B").trim().toUpperCase().startsWith("S") ? "SELL" : "BUY";
      const qty = BigInt(Math.round(parseNum(d.qty)));
      const price = parseNum(d.watp);
      const date = parseNseDate(d.date) ?? fallbackDate;
      const valueCr = (Number(qty) * price) / 10000000;
      const companyName = (d.name ?? sym).trim();

      const where = {
        date_exchange_symbol_clientName_dealType: {
          date, exchange: "NSE", symbol: sym, clientName: client, dealType: type,
        },
      };
      const data = { qty, price, valueCr };
      const create = { date, exchange: "NSE", symbol: sym, companyName, clientName: client, dealType: type, qty, price, valueCr };

      if (kind === "bulk") {
        await prisma.bulkDeal.upsert({ where, update: data, create });
      } else {
        await prisma.blockDeal.upsert({ where, update: data, create });
      }
      ok++;
    } catch {
      err++;
    }
  }
  return { ok, err };
}

export async function ingestBulkBlockDeals(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  const today = new Date();
  let snapshot: SnapshotResponse = {};
  try {
    snapshot = await fetchNse<SnapshotResponse>("/api/snapshot-capital-market-largedeal");
  } catch (e) {
    return { rowsIn: 0, rowsError: 1, notes: `snapshot fetch failed: ${e instanceof Error ? e.message : "error"}` };
  }

  const bulk = snapshot.BULK_DEALS_DATA ?? [];
  const block = snapshot.BLOCK_DEALS_DATA ?? [];

  const [bulkRes, blockRes] = await Promise.all([
    upsertDeals(bulk, "bulk", today),
    upsertDeals(block, "block", today),
  ]);

  const inserted = bulkRes.ok + blockRes.ok;
  const errors = bulkRes.err + blockRes.err;

  return {
    rowsIn: inserted,
    rowsError: errors,
    notes: `as_on ${snapshot.as_on_date ?? "?"}: ${bulk.length} bulk + ${block.length} block fetched → ${inserted} upserted, ${errors} errors`,
  };
}
