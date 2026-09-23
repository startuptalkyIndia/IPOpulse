/**
 * AMFI Mutual Fund NAV scraper.
 * Free public source: portal.amfiindia.com/spages/NAVAll.txt
 *
 * Format is plain text with sections separated by AMC. Each fund row (as of
 * 2026-09, verified live against the real file — AMFI split what used to be
 * embedded in the scheme name into two standalone columns, breaking the old
 * fixed 6-column parse silently: it read NAV from what is now the "Plan"
 * column and Date from "Option", both non-numeric/non-date text, so EVERY
 * row failed validation and the job ran "successfully" with 0 rows for
 * weeks with no error surfaced):
 *   <SchemeCode>;<ISIN_GrowthDiv>;<ISIN_DivReinvest>;<SchemeName>;<Plan>;<Option>;<NAV>;<Date>
 * Header row confirms the layout: "Scheme Code;ISIN Div Payout/ ISIN
 * Growth;ISIN Div Reinvestment;Scheme Name;Plan;Option;Net Asset Value;Date".
 * Parsed by column COUNT, not a fixed index, so a reversion to the older
 * 6-column layout (no separate Plan/Option) still works.
 */

import axios from "axios";

export interface AmfiFund {
  schemeCode: string;
  schemeName: string;
  isinGrowth?: string | null;
  isinDivReinvest?: string | null;
  nav: number;
  asOfDate: Date;
  amc?: string;
  category?: string;
}

const NAV_URL = "https://portal.amfiindia.com/spages/NAVAll.txt";

function parseDate(s: string): Date | null {
  // "25-Apr-2026"
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const [d, m, y] = s.split("-");
  if (!d || !m || !y) return null;
  const mn = months[m.charAt(0).toUpperCase() + m.slice(1, 3).toLowerCase()];
  if (mn === undefined) return null;
  const date = new Date(Number(y), mn, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function fetchAmfiNavs(): Promise<AmfiFund[]> {
  const { data } = await axios.get<string>(NAV_URL, {
    timeout: 60000,
    headers: { "User-Agent": "IPOpulse/1.0 (+https://ipopulse.talkytools.com)" },
  });

  const lines = data.split(/\r?\n/);
  const funds: AmfiFund[] = [];
  let currentAmc: string | undefined;
  let currentCategory: string | undefined;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("Scheme Code")) continue;
    if (line.includes(";")) {
      // Data row — column count varies: 8 columns when Plan/Option are
      // separate (current format), 6 when they're not (older format, kept
      // as a fallback rather than a hard assumption).
      const parts = line.split(";");
      if (parts.length < 6) continue;

      let code: string, isinG: string, isinD: string, name: string, navStr: string, dateStr: string;
      if (parts.length >= 8) {
        const [c, ig, id, n, plan, option, nav, date] = parts;
        code = c;
        isinG = ig;
        isinD = id;
        const planOption = [plan?.trim(), option?.trim()].filter(Boolean).join(" - ");
        name = planOption ? `${n.trim()} - ${planOption}` : n;
        navStr = nav;
        dateStr = date;
      } else {
        [code, isinG, isinD, name, navStr, dateStr] = parts;
      }

      const nav = Number(navStr);
      if (!Number.isFinite(nav)) continue;
      const asOf = parseDate(dateStr);
      if (!asOf) continue;
      funds.push({
        schemeCode: code.trim(),
        isinGrowth: isinG?.trim() || null,
        isinDivReinvest: isinD?.trim() || null,
        schemeName: name.trim(),
        nav,
        asOfDate: asOf,
        amc: currentAmc,
        category: currentCategory,
      });
    } else if (/Mutual Fund$/i.test(line)) {
      currentAmc = line;
    } else if (line && !line.includes(";")) {
      // Likely category heading like "Open Ended Schemes(Equity Scheme - Large Cap Fund)"
      currentCategory = line;
    }
  }

  return funds;
}
