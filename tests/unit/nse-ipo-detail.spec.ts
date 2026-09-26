import { describe, it, expect } from "vitest";
import { parseIpoIssueDetails } from "@/lib/scrapers/nse-ipo-detail";

// Fixtures captured live from https://www.nseindia.com/api/ipo-detail?symbol=X
// on 2026-09-26 — see CHANGELOG.md for the full investigation.
function dataList(pairs: Record<string, string>) {
  return { issueInfo: { dataList: Object.entries(pairs).map(([title, value]) => ({ title, value })) } };
}

describe("parseIpoIssueDetails", () => {
  it("parses a two-part (fresh + OFS) issue, e.g. Moneyview", () => {
    const res = parseIpoIssueDetails(
      dataList({
        "Bid Lot": "441 Equity Shares and in multiples thereof",
        "Face Value": "Re. 1 per Equity Share",
        "Issue Size":
          '"Initial public offering comprising of aggregating up to 7500 million and offer for sale up to 10,04,94,200 Equity Shares (including Anchor portion of 9,63,24,729 Equity Shares)"',
        "Book Running Lead Managers":
          '"Axis Capital Limited, BofA Securities India Limited, IIFL Capital Services Limited and Kotak Mahindra Capital Company Limited"',
        "Name of the Registrar": "MUFG Intime India Private Limited ",
      }),
    );
    expect(res.lotSize).toBe(441);
    expect(res.faceValue).toBe(1);
    expect(res.issueSizeCr).toBe(750); // 7500 million / 10
    expect(res.registrar).toBe("MUFG Intime India Private Limited");
    expect(res.leadManagers).toBe(
      "Axis Capital Limited, BofA Securities India Limited, IIFL Capital Services Limited and Kotak Mahindra Capital Company Limited",
    );
  });

  it("sums ONLY Fresh Issue + Offer for Sale amounts, excluding the Employee Reservation sub-carve-out and share-count anchor mention (Shiprocket)", () => {
    const res = parseIpoIssueDetails(
      dataList({
        "Bid Lot": "154 Equity Shares and in multiples thereof",
        "Face Value": "Rs. 10 per Equity Share",
        "Issue Size":
          "Initial Public Offer comprising of Fresh Issue aggregating upto Rs. 8,855 million and Offer for Sale aggregating upto Rs.7,319.85 million (including Employee Reservation Portion aggregating up to Rs. 10 million & Anchor Investor portion of 74,991,568 Equity Shares)",
        "Name of the Registrar": "KFin Technologies Limited",
      }),
    );
    expect(res.lotSize).toBe(154);
    expect(res.faceValue).toBe(10);
    // 8855 + 7319.85 = 16174.85m -> /10. The "including ... Rs. 10 million" employee
    // reservation figure is a SUBSET of the OFS total, not additional — must NOT be added.
    expect(res.issueSizeCr).toBeCloseTo(1617.485, 3);
    expect(res.registrar).toBe("KFin Technologies Limited");
  });

  it("returns nulls for a symbol with no issueInfo (e.g. very old or unavailable on NSE)", () => {
    const res = parseIpoIssueDetails({});
    expect(res).toEqual({
      lotSize: null,
      faceValue: null,
      issueSizeCr: null,
      registrar: null,
      leadManagers: null,
    });
  });

  it("handles a single-component (100% OFS) issue size with one Rs. X million match", () => {
    const res = parseIpoIssueDetails(
      dataList({ "Issue Size": "Offer for Sale aggregating upto Rs. 500 million" }),
    );
    expect(res.issueSizeCr).toBe(50);
  });
});
