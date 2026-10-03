/**
 * Parser for NSE's corporate-actions feed (`/api/corporates-corporateActions`),
 * scoped specifically to bonus issues and face-value splits — the only two
 * event types with a clean, mechanical share-count multiplier that makes a
 * historical raw price directly adjustable to today's terms.
 *
 * Found live 2026-10-03: bhavcopy_daily stores raw UNADJUSTED prices, so any
 * 52-week-range/return/technicals calculation spanning one of these events is
 * silently corrupted (e.g. IRB Infrastructure's 1Y-return stat tile showed
 * -59.9% against the Yahoo-sourced chart's correct -19.16% on the same page,
 * because of an untracked 30-Mar-2026 1:1 bonus). Our existing
 * `corporate_actions` table is sourced from BSE announcements only, which
 * MISSED this entirely (confirmed: zero split/bonus rows for HDFC Bank's
 * real, NSE-confirmed 26-Aug-2025 1:1 bonus) -- hence this NSE-sourced
 * parser, read from the same endpoint NSE's own corporate-actions page uses.
 *
 * Deliberately excludes rights issues and demergers: a rights issue's price
 * impact depends on the (often below-market) rights price, not a clean
 * ratio, and a demerger transfers value to spun-off entities rather than
 * multiplying share count -- neither has a mechanical adjustment factor
 * (the connector that surfaced this bug treats demergers the same way:
 * adjustmentFactor left at 1.0, i.e. not auto-adjusted).
 */

export interface ParsedCorporateAction {
  actionType: "bonus" | "split";
  ratio: string;
  adjustmentFactor: number;
}

/** "Bonus 1:2" -> 1 new share per 2 held -> 3 total for every 2 -> factor = 2/3. */
function parseBonus(subject: string): ParsedCorporateAction | null {
  const m = subject.match(/Bonus\s+(\d+)\s*:\s*(\d+)/i);
  if (!m) return null;
  const newShares = Number(m[1]);
  const heldShares = Number(m[2]);
  if (!newShares || !heldShares) return null;
  const adjustmentFactor = heldShares / (newShares + heldShares);
  return { actionType: "bonus", ratio: `${newShares}:${heldShares}`, adjustmentFactor };
}

/**
 * "Face Value Split (Sub-Division) - From Rs 10/- Per Share To Re 1/- Per Share"
 * -> face value divided by 10 -> share count x10 -> factor = 1/10.
 */
function parseSplit(subject: string): ParsedCorporateAction | null {
  if (!/split|sub-division/i.test(subject)) return null;
  const m = subject.match(/From\s+Rs?\.?\s*([\d.]+).*?To\s+Re?\.?\s*([\d.]+)/i);
  if (!m) return null;
  const oldFaceValue = Number(m[1]);
  const newFaceValue = Number(m[2]);
  if (!oldFaceValue || !newFaceValue || newFaceValue >= oldFaceValue) return null;
  const adjustmentFactor = newFaceValue / oldFaceValue;
  return { actionType: "split", ratio: `${oldFaceValue}:${newFaceValue}`, adjustmentFactor };
}

/** Returns null for anything that isn't a bonus or split (dividends, AGMs, rights, demergers, ...). */
export function parseCorporateActionSubject(subject: string): ParsedCorporateAction | null {
  return parseBonus(subject) ?? parseSplit(subject);
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** "26-Aug-2025" -> Date (UTC midnight). Returns null for "-" or unparseable. */
export function parseNseCaDate(s: string | undefined | null): Date | null {
  if (!s || s === "-") return null;
  const m = s.match(/^(\d{1,2})-(\w{3})-(\d{4})$/);
  if (!m) return null;
  const mon = MONTHS[m[2].toLowerCase()];
  if (mon === undefined) return null;
  return new Date(Date.UTC(parseInt(m[3], 10), mon, parseInt(m[1], 10)));
}
