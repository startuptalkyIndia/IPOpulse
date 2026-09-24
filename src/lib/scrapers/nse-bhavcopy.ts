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
 *
 * BUG FIXED 2026-09-24 (found via a data-accuracy complaint, confirmed with
 * a direct curl): NSE's archive host returns HTTP 200 for
 * sec_bhavdata_full_<any-Sunday>.csv with a body that is a byte-for-byte
 * copy of the PRECEDING FRIDAY's file — its own DATE1 column says Friday's
 * date, not Sunday's. The walk-back loop previously trusted the requested
 * candidate date `d` as the row date without ever checking DATE1, so every
 * Sunday silently got a full day's worth of duplicate rows mislabeled as
 * that Sunday. Confirmed live: 45,118 Sunday-dated rows in bhavcopy_daily
 * before this fix (Saturdays were unaffected — NSE's host 404s cleanly for
 * Saturday's specific filename). Now every row's real DATE1 is parsed and
 * compared to `d`; a mismatch is treated exactly like a 404 (try the next
 * day back), so a repeat of this NSE-side quirk can't silently corrupt data
 * again, on a weekend or a market holiday.
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

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Parses the CSV's own "DATE1" column, e.g. "18-Sep-2026". */
function parseDate1(s: string | undefined): Date | null {
  const m = (s ?? "").trim().match(/^(\d{1,2})-(\w{3})-(\d{4})$/);
  if (!m) return null;
  const mon = MONTHS[m[2].toLowerCase()];
  if (mon === undefined) return null;
  return new Date(parseInt(m[3], 10), mon, parseInt(m[1], 10));
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

      // Guard against NSE's archive silently serving a stale file (verified:
      // it does this for every Sunday, returning the preceding Friday's
      // content) — trust the CSV's own DATE1 column, not the URL we asked
      // for. If they disagree, this candidate day has no real data; fall
      // through to the next day in the walk-back instead of accepting it.
      const actualDate = parseDate1(records[0]?.DATE1);
      if (!actualDate || !isSameCalendarDay(actualDate, d)) {
        continue;
      }

      const rows: BhavcopyRow[] = [];
      for (const r of records) {
        const series = (r.SERIES ?? "").trim();
        if (series !== "EQ" && series !== "BE") continue;
        const close = Number(r.CLOSE_PRICE);
        if (!Number.isFinite(close) || close <= 0) continue;
        rows.push({
          symbol: (r.SYMBOL ?? "").trim(),
          series,
          date: actualDate,
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
