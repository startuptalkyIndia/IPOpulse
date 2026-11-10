/**
 * Listing date for an IPO whose listing date was never recorded.
 *
 * Why this exists: an IPO only becomes "listed" once it has a listing date (or a
 * listing row), and nothing filled the date in for IPOs after Aug 2026. 153 sat
 * at "closed" and the "Recently listed" list froze. SEBI's timeline is T+3: shares
 * list on the third working day after the issue closes, so close + 3 weekdays is
 * a solid base. Exchange holidays can push it later, so a real first trading row
 * within a few days AFTER that base wins over the estimate.
 *
 * Why the first price row is NOT used on its own: new listings only get a
 * `companies` row when nse_company_master runs (Sundays), so their earliest
 * bhavcopy row is often days after the real listing day.
 *
 * Safety for the listing-gain job: if an estimate is a day or two off, the
 * company has no bhavcopy row on that day and the gain is skipped, not wrong.
 * Pure functions, no DB, so the rule is unit-testable.
 */

const DAY_MS = 86400000;

/** Date at UTC midnight (close dates are stored that way). */
function utcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isWeekday(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow !== 0 && dow !== 6;
}

/** `n` weekdays after `from` (Sat/Sun skipped; exchange holidays are not known here). */
export function addWeekdays(from: Date, n: number): Date {
  const d = utcDay(from);
  let left = n;
  while (left > 0) {
    d.setTime(d.getTime() + DAY_MS);
    if (isWeekday(d)) left--;
  }
  return d;
}

/** Base T+3 listing date for an IPO that closed on `closeDate`. */
export function estimateListingDate(closeDate: Date): Date {
  return addWeekdays(closeDate, 3);
}

/**
 * Pick the listing date. `tradingDays` are the company's bhavcopy dates (any
 * order). A trading weekday within 3 calendar days on/after the T+3 base is a
 * holiday-shifted real listing day and wins; anything later is a late company
 * row, so the base estimate stands.
 */
export function resolveListingDate(closeDate: Date, tradingDays: Date[]): Date {
  const base = estimateListingDate(closeDate);
  const limit = base.getTime() + 3 * DAY_MS;
  const hit = tradingDays
    .map(utcDay)
    .filter((d) => isWeekday(d) && d.getTime() >= base.getTime() && d.getTime() <= limit)
    .sort((a, b) => a.getTime() - b.getTime())[0];
  return hit ?? base;
}
