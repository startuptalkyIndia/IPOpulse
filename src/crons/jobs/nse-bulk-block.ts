/**
 * Bulk + Block deal ingestion from NSE.
 *
 * NSE publishes these at:
 *   Bulk: /api/historical/cm/bulk-deals?from=DD-Mon-YYYY&to=DD-Mon-YYYY
 *   Block: /api/historical/cm/block-deals?from=DD-Mon-YYYY&to=DD-Mon-YYYY
 *
 * Schedule: daily at 5:30pm IST (after market close + NSE uploads usually by 5pm).
 *
 * Why this matters: bulk/block deals reveal institutional conviction.
 *   - Bulk deal = >0.5% of company shares traded in a single session
 *   - Block deal = pre-negotiated large trade executed on the exchange
 *   Both are powerful signals: who is buying/selling large stakes and at what price.
 */

import { prisma } from "@/lib/db";
import { fetchNse } from "@/lib/nse-session";

interface NseDeal {
  symbol?: string;
  scrip_name?: string;
  client_name?: string;
  buysell?: string;
  quantitytraded?: string | number;
  tradeprice?: string | number;
  remarks?: string;
  trade_date?: string;
  // Block deal format
  SYMBOL?: string;
  SCRIP_NAME?: string;
  CLIENT_NAME?: string;
  BUY_SELL?: string;
  QTY?: string | number;
  PRICE?: string | number;
  BD_DATE?: string;
}

function formatNseDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
}

async function fetchDeals(endpoint: string, from: Date, to: Date): Promise<NseDeal[]> {
  const path = `${endpoint}?from=${formatNseDate(from)}&to=${formatNseDate(to)}`;
  try {
    const raw = await fetchNse<{ data?: NseDeal[] } | NseDeal[]>(path);
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && "data" in raw && Array.isArray(raw.data)) return raw.data;
    return [];
  } catch {
    return [];
  }
}

function parseNum(v: string | number | undefined): number {
  if (v == null) return 0;
  return parseFloat(String(v).replace(/,/g, "")) || 0;
}

export async function ingestBulkBlockDeals(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  const today = new Date();
  const past30 = new Date(today.getTime() - 30 * 86400000); // last 30 days

  const [bulkRaw, blockRaw] = await Promise.all([
    fetchDeals("/api/historical/cm/bulk-deals", past30, today),
    fetchDeals("/api/historical/cm/block-deals", past30, today),
  ]);

  let inserted = 0;
  let errors = 0;

  // Bulk deals
  for (const d of bulkRaw) {
    try {
      const sym = (d.symbol ?? d.SYMBOL ?? "").toUpperCase();
      const client = (d.client_name ?? d.CLIENT_NAME ?? "").trim();
      const type = ((d.buysell ?? d.BUY_SELL ?? "B").trim().toUpperCase().startsWith("B") ? "BUY" : "SELL");
      const qty = BigInt(Math.round(parseNum(d.quantitytraded ?? d.QTY)));
      const price = parseNum(d.tradeprice ?? d.PRICE);
      const dateStr = d.trade_date ?? d.BD_DATE ?? today.toISOString().slice(0, 10);
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue;
      const valueCr = (Number(qty) * price) / 10000000;

      await prisma.bulkDeal.upsert({
        where: { date_exchange_symbol_clientName_dealType: { date, exchange: "NSE", symbol: sym, clientName: client, dealType: type } },
        update: { qty, price, valueCr },
        create: { date, exchange: "NSE", symbol: sym, companyName: d.scrip_name ?? d.SCRIP_NAME ?? sym, clientName: client, dealType: type, qty, price, valueCr },
      });
      inserted++;
    } catch { errors++; }
  }

  // Block deals
  for (const d of blockRaw) {
    try {
      const sym = (d.SYMBOL ?? d.symbol ?? "").toUpperCase();
      const client = (d.CLIENT_NAME ?? d.client_name ?? "").trim();
      const type = ((d.BUY_SELL ?? d.buysell ?? "B").trim().toUpperCase().startsWith("B") ? "BUY" : "SELL");
      const qty = BigInt(Math.round(parseNum(d.QTY ?? d.quantitytraded)));
      const price = parseNum(d.PRICE ?? d.tradeprice);
      const dateStr = d.BD_DATE ?? d.trade_date ?? today.toISOString().slice(0, 10);
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue;
      const valueCr = (Number(qty) * price) / 10000000;

      await prisma.blockDeal.upsert({
        where: { date_exchange_symbol_clientName_dealType: { date, exchange: "NSE", symbol: sym, clientName: client, dealType: type } },
        update: { qty, price, valueCr },
        create: { date, exchange: "NSE", symbol: sym, companyName: d.SCRIP_NAME ?? d.scrip_name ?? sym, clientName: client, dealType: type, qty, price, valueCr },
      });
      inserted++;
    } catch { errors++; }
  }

  return {
    rowsIn: inserted,
    rowsError: errors,
    notes: `Bulk/block deals: ${bulkRaw.length} bulk + ${blockRaw.length} block → ${inserted} upserted, ${errors} errors.`,
  };
}
