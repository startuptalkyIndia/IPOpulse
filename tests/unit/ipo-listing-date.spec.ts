/**
 * Listing-date backfill rule. Background: 153 IPOs sat at "closed" after Aug 2026
 * because nothing ever set their listing date, freezing "Recently listed".
 * Fixtures use real rows from production (close date -> what the data showed).
 */
import { describe, it, expect } from "vitest";
import { addWeekdays, estimateListingDate, resolveListingDate } from "@/lib/ipo-listing-date";

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const ymd = (x: Date) => x.toISOString().slice(0, 10);

describe("addWeekdays / estimateListingDate (T+3)", () => {
  it("counts only weekdays", () => {
    expect(ymd(addWeekdays(d("2026-10-29"), 1))).toBe("2026-10-30"); // Thu -> Fri
    expect(ymd(addWeekdays(d("2026-10-30"), 1))).toBe("2026-11-02"); // Fri -> Mon
  });

  it("closes Mon 2 Nov -> lists Thu 5 Nov", () => {
    expect(ymd(estimateListingDate(d("2026-11-02")))).toBe("2026-11-05");
  });

  it("closes Thu 23 Oct -> lists Tue 28 Oct (weekend in between)", () => {
    expect(ymd(estimateListingDate(d("2026-10-23")))).toBe("2026-10-28");
  });

  it("closes Fri -> lists Wed", () => {
    expect(ymd(estimateListingDate(d("2026-10-16")))).toBe("2026-10-21");
  });
});

describe("resolveListingDate", () => {
  it("uses the T+3 estimate when there is no price data", () => {
    expect(ymd(resolveListingDate(d("2026-11-02"), []))).toBe("2026-11-05");
  });

  it("a first trading day that matches the estimate confirms it", () => {
    expect(ymd(resolveListingDate(d("2026-11-02"), [d("2026-11-05"), d("2026-11-06")]))).toBe("2026-11-05");
  });

  it("a holiday-shifted first trading day (estimate + 1) wins over the estimate", () => {
    expect(ymd(resolveListingDate(d("2026-11-02"), [d("2026-11-06"), d("2026-11-09")]))).toBe("2026-11-06");
  });

  it("ignores a late company row (Sunday master job): the estimate stands", () => {
    // Bombay Coated: closed 2 Nov, first price row 8 Nov (company row created late).
    expect(ymd(resolveListingDate(d("2026-11-02"), [d("2026-11-08"), d("2026-11-09")]))).toBe("2026-11-05");
  });

  it("never picks a weekend row, even inside the window", () => {
    // Close Mon 2 Nov -> base Thu 5 Nov; a Saturday 7 Nov row is inside the window but must not win.
    expect(ymd(resolveListingDate(d("2026-11-02"), [d("2026-11-07")]))).toBe("2026-11-05");
  });

  it("ignores rows before the estimate", () => {
    expect(ymd(resolveListingDate(d("2026-11-02"), [d("2026-11-03")]))).toBe("2026-11-05");
  });

  it("tolerates unsorted input", () => {
    expect(ymd(resolveListingDate(d("2026-11-02"), [d("2026-11-07"), d("2026-11-06"), d("2026-11-05")]))).toBe("2026-11-05");
  });
});
