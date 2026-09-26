/**
 * Parser for NSE's per-symbol `/api/ipo-detail?symbol=X` endpoint.
 *
 * This is NOT the same data as `/api/ipo-current-issue` /
 * `/api/all-upcoming-issues` (used by nse-ipos.ts for the live issue list) —
 * those never include lot size, face value, registrar, or lead managers.
 * This endpoint's `issueInfo.dataList` does: it's the same "Issue Details"
 * table NSE's own IPO page renders, as a flat array of {title, value} pairs
 * rather than structured JSON. Verified live 2026-09-26 against an active
 * issue (Moneyview), a closed-but-unlisted one, and an already-listed one
 * (Shiprocket) — the data persists after listing, so this also backfills
 * historical IPOs, not just currently-live ones.
 */

export interface IpoIssueDetails {
  lotSize: number | null;
  faceValue: number | null;
  issueSizeCr: number | null;
  registrar: string | null;
  leadManagers: string | null;
}

interface DataListItem {
  title: string | null;
  value: string;
}

interface IpoDetailResponse {
  issueInfo?: { dataList?: DataListItem[] };
}

function findValue(dataList: DataListItem[], title: string): string | null {
  const item = dataList.find((d) => d.title === title);
  if (!item?.value) return null;
  // Values are sometimes wrapped in literal escaped quotes, e.g. `"441 ..."`.
  return item.value.replace(/^"|"$/g, "").trim() || null;
}

/** "441 Equity Shares and in multiples thereof" -> 441 */
function parseLotSize(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.match(/^([\d,]+)/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** "Re. 1 per Equity Share" / "Rs. 10 per Equity Share" -> 1 / 10 */
function parseFaceValue(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.match(/([\d,]+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * "Initial Public Offer comprising of Fresh Issue aggregating upto
 * Rs. 8,855 million and Offer for Sale aggregating upto Rs.7,319.85 million
 * (including Employee Reservation Portion aggregating up to Rs. 10 million &
 * Anchor Investor portion of 74,991,568 Equity Shares)"
 * -> sums the "Fresh Issue" and "Offer for Sale" Rs.-million figures specifically
 * (NOT every "Rs. X million" in the string — the parenthetical "Employee
 * Reservation Portion ... Rs. 10 million" is a SUBSET already included within
 * the fresh/OFS totals, not additional value; summing it too would overcount).
 * Converts million -> crore (÷10).
 *
 * Some issues (e.g. Moneyview) describe the whole offering as a single
 * "comprising of aggregating up to X million" figure with no separate
 * "Fresh Issue"/"Offer for Sale" breakdown at all (their OFS leg is stated
 * purely as a share count) — AND, verified live, NSE sometimes drops the
 * "Rs." prefix entirely for this single-figure phrasing (Moneyview's real
 * text: "...aggregating up to 7500 million...", no "Rs."). So the fallback
 * matches a bare "X million" figure, not requiring "Rs." — the labeled
 * Fresh-Issue/OFS patterns above still require "Rs." since that prefix was
 * present and reliable in every case that used that fuller phrasing.
 */
function parseIssueSizeCr(raw: string | null): number | null {
  if (!raw) return null;
  const moneyRe = (label: string) =>
    new RegExp(`${label} aggregating\\s+(?:up\\s*to|upto)\\s+Rs\\.?\\s*([\\d,]+(?:\\.\\d+)?)\\s*million`, "i");
  let total = 0;
  let found = false;
  for (const label of ["Fresh Issue", "Offer(?: for Sale)?"]) {
    const m = raw.match(moneyRe(label));
    if (m) {
      total += Number(m[1].replace(/,/g, ""));
      found = true;
    }
  }
  if (!found) {
    const bare = raw.match(/([\d,]+(?:\.\d+)?)\s*million/i);
    if (bare) {
      total += Number(bare[1].replace(/,/g, ""));
      found = true;
    }
  }
  return found && total > 0 ? total / 10 : null;
}

export function parseIpoIssueDetails(response: IpoDetailResponse): IpoIssueDetails {
  const dataList = response.issueInfo?.dataList ?? [];
  return {
    lotSize: parseLotSize(findValue(dataList, "Bid Lot")),
    faceValue: parseFaceValue(findValue(dataList, "Face Value")),
    issueSizeCr: parseIssueSizeCr(findValue(dataList, "Issue Size")),
    registrar: findValue(dataList, "Name of the Registrar"),
    leadManagers: findValue(dataList, "Book Running Lead Managers"),
  };
}
