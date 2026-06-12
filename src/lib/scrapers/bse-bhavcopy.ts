/**
 * BSE Bhavcopy (cash market EOD) crawler.
 *
 * URL pattern (verified open, no auth):
 *   https://www.bseindia.com/download/BhavCopy/Equity/BhavCopy_BSE_CM_0_0_0_YYYYMMDD_F_0000.CSV
 *
 * Format (header row):
 *   TradDt, BizDt, Sgmt, Src, FinInstrmTp, FinInstrmId (scrip code),
 *   ISIN, TckrSymb, SctySrs, OpnPric, HghPric, LwPric, ClsPric,
 *   LastPric, PrvsClsgPric, TtlTradgVol, ...
 *
 * Filter: Sgmt='CM' AND FinInstrmTp='STK' AND SctySrs IN main equity groups.
 * BSE delivery % is published in a separate file — not included here.
 */

import axios from "axios";
import { parse } from "csv-parse/sync";

export interface BseBhavcopyRow {
  scripCode: string;
  symbol: string;
  series: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  prevClose: number;
  volume: number;
}

const EQUITY_SERIES = new Set(["A", "B", "T", "X", "XT", "Z", "ZP", "M", "MT"]);

function yyyymmdd(d: Date): string {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

const UA =
  process.env.SCRAPER_USER_AGENT ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchBseBhavcopy(date: Date = new Date()): Promise<BseBhavcopyRow[]> {
  // Walk back up to 6 days for weekend/holiday tolerance.
  for (let i = 0; i < 6; i++) {
    const d = new Date(date.getTime() - i * 86400000);
    const url = `https://www.bseindia.com/download/BhavCopy/Equity/BhavCopy_BSE_CM_0_0_0_${yyyymmdd(d)}_F_0000.CSV`;
    try {
      const { data } = await axios.get<string>(url, {
        timeout: 30000,
        headers: { "User-Agent": UA, Accept: "text/csv,*/*", Referer: "https://www.bseindia.com/" },
      });
      const records: Record<string, string>[] = parse(data, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });
      const rows: BseBhavcopyRow[] = [];
      for (const r of records) {
        if ((r.Sgmt ?? "").trim() !== "CM") continue;
        if ((r.FinInstrmTp ?? "").trim() !== "STK") continue;
        const series = (r.SctySrs ?? "").trim();
        if (!EQUITY_SERIES.has(series)) continue;

        const close = Number(r.ClsPric);
        if (!Number.isFinite(close) || close <= 0) continue;

        const scripCode = (r.FinInstrmId ?? "").trim();
        if (!scripCode) continue;

        // Use BizDt (business date) — TradDt and BizDt are equal on normal days.
        const tradDt = (r.BizDt || r.TradDt || "").trim();
        const csvDate = tradDt ? new Date(tradDt) : d;
        csvDate.setHours(0, 0, 0, 0);

        rows.push({
          scripCode,
          symbol: (r.TckrSymb ?? "").trim(),
          series,
          date: csvDate,
          open: Number(r.OpnPric) || close,
          high: Number(r.HghPric) || close,
          low: Number(r.LwPric) || close,
          close,
          prevClose: Number(r.PrvsClsgPric) || close,
          volume: Number(r.TtlTradgVol) || 0,
        });
      }
      return rows;
    } catch {
      // try previous day
    }
  }
  return [];
}
