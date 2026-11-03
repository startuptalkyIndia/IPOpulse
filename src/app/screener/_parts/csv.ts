import type { ScreenerCompany } from "./types";

const CSV_COLUMNS: Array<{ label: string; get: (c: ScreenerCompany) => string | number }> = [
  { label: "Company", get: (c) => c.name },
  { label: "Symbol", get: (c) => c.symbol ?? "" },
  { label: "Quality Grade", get: (c) => c.qualityGrade ?? "" },
  { label: "Quality Score", get: (c) => c.qualityOverall ?? "" },
  { label: "Sector", get: (c) => c.sector ?? "" },
  { label: "Market Cap (Cr)", get: (c) => c.marketCapCr ?? "" },
  { label: "LTP", get: (c) => c.ltp ?? "" },
  { label: "1D %", get: (c) => c.chg1d ?? "" },
  { label: "52W Low", get: (c) => c.low52w ?? "" },
  { label: "52W High", get: (c) => c.high52w ?? "" },
  { label: "P/E", get: (c) => c.peRatio ?? "" },
  { label: "P/B", get: (c) => c.pbRatio ?? "" },
  { label: "ROE %", get: (c) => c.roePercent ?? "" },
  { label: "Debt/Equity", get: (c) => c.debtToEquity ?? "" },
  { label: "Dividend Yield %", get: (c) => c.dividendYield ?? "" },
  { label: "EPS", get: (c) => c.eps ?? "" },
  { label: "Volume", get: (c) => c.volume ?? "" },
];

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCsv(filteredAll: ScreenerCompany[]) {
  const header = CSV_COLUMNS.map((c) => c.label).join(",");
  const rows = filteredAll.map((c) => CSV_COLUMNS.map((col) => csvEscape(col.get(c))).join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ipopulse-screener-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
