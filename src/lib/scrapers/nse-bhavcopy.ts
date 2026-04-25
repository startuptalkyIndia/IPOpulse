/**
 * NSE Bhavcopy (full equity EOD) crawler.
 *
 * URL pattern (verified open, no auth, no Cloudflare):
 *   https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_DDMMYYYY.csv
 *
 * Format (header row):
 *   SYMBOL, SERIES, DATE1, PREV_CLOSE, OPEN_PRICE, HIGH_PRICE, LOW_PRICE,
 *   LAST_PRICE, CLOSE_PRICE, AVG_PRICE, TTL_TRD_QNTY, TURNOVER_LACS,
 *   NO_OF_TRADES, DELIV_QTY, DELIV_PER
 *
 * EQ series only is what most retail care about. We filter to EQ + BE.
 */

import axios from "axios";
import { parse } from "csv-parse/sync";

export interface BhavcopyRow {
  symbol: string;
  series: string;
  date: Date;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  deliveryQty: number | null;
  deliveryPct: number | null;
}

function ddmmyyyy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}${mm}${d.getFullYear()}`;
}

const UA =
  process.env.SCRAPER_USER_AGENT ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchNseBhavcopy(date: Date = new Date()): Promise<BhavcopyRow[]> {
  // Try date, then walk back up to 5 days for weekend/holiday tolerance
  for (let i = 0; i < 6; i++) {
    const d = new Date(date.getTime() - i * 86400000);
    const url = `https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_${ddmmyyyy(d)}.csv`;
    try {
      const { data } = await axios.get<string>(url, {
        timeout: 30000,
        headers: { "User-Agent": UA, Accept: "text/csv,*/*", Referer: "https://www.nseindia.com/" },
      });
      const records: Record<string, string>[] = parse(data, { columns: true, skip_empty_lines: true, trim: true });
      const rows: BhavcopyRow[] = [];
      for (const r of records) {
        const series = (r.SERIES ?? "").trim();
        if (series !== "EQ" && series !== "BE") continue;
        const close = Number(r.CLOSE_PRICE);
        if (!Number.isFinite(close) || close <= 0) continue;
        rows.push({
          symbol: (r.SYMBOL ?? "").trim(),
          series,
          date: d,
          prevClose: Number(r.PREV_CLOSE) || close,
          open: Number(r.OPEN_PRICE) || close,
          high: Number(r.HIGH_PRICE) || close,
          low: Number(r.LOW_PRICE) || close,
          close,
          volume: Number(r.TTL_TRD_QNTY) || 0,
          deliveryQty: r.DELIV_QTY && r.DELIV_QTY.trim() !== "-" ? Number(r.DELIV_QTY) : null,
          deliveryPct: r.DELIV_PER && r.DELIV_PER.trim() !== "-" ? Number(r.DELIV_PER) : null,
        });
      }
      return rows;
    } catch {
      // try previous day
    }
  }
  return [];
}
