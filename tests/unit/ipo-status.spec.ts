/**
 * Unit tests for computeIpoStatus — the SINGLE source of truth for IPO status
 * (audit HIGH: status logic was duplicated). Pure function, no DB.
 */

import { describe, it, expect } from "vitest";
import { computeIpoStatus } from "@/lib/ipo";

const DAY = 86400000;
const now = Date.now();
const daysFromNow = (n: number) => new Date(now + n * DAY);

describe("computeIpoStatus", () => {
  it("returns withdrawn when status is withdrawn, regardless of dates", () => {
    expect(
      computeIpoStatus({ openDate: daysFromNow(-10), closeDate: daysFromNow(-5), listingDate: daysFromNow(-1), status: "withdrawn" }),
    ).toBe("withdrawn");
  });

  it("returns listed once the listing date has passed", () => {
    expect(
      computeIpoStatus({ openDate: daysFromNow(-20), closeDate: daysFromNow(-15), listingDate: daysFromNow(-3), status: "closed" }),
    ).toBe("listed");
  });

  it("returns upcoming before the open date", () => {
    expect(
      computeIpoStatus({ openDate: daysFromNow(3), closeDate: daysFromNow(6), listingDate: null, status: "upcoming" }),
    ).toBe("upcoming");
  });

  it("returns live between open and close", () => {
    expect(
      computeIpoStatus({ openDate: daysFromNow(-1), closeDate: daysFromNow(2), listingDate: null, status: "live" }),
    ).toBe("live");
  });

  it("stays live through the END of the close day (close date is UTC midnight)", () => {
    // close was earlier today at UTC-midnight; the +1 day grace keeps it live.
    const todayUtcMidnight = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    expect(
      computeIpoStatus({ openDate: daysFromNow(-3), closeDate: todayUtcMidnight, listingDate: null, status: "live" }),
    ).toBe("live");
  });

  it("returns closed after the close day has fully passed", () => {
    expect(
      computeIpoStatus({ openDate: daysFromNow(-10), closeDate: daysFromNow(-3), listingDate: null, status: "upcoming" }),
    ).toBe("closed");
  });

  it("falls back to the stored status when dates are missing", () => {
    expect(
      computeIpoStatus({ openDate: null, closeDate: null, listingDate: null, status: "closed" }),
    ).toBe("closed");
    expect(
      computeIpoStatus({ openDate: null, closeDate: null, listingDate: null, status: "" }),
    ).toBe("upcoming");
  });

  it("returns listed when a listing row exists even if listingDate is null/future (hasListing)", () => {
    // both surfaces (badge + status cron) must agree via this flag
    expect(
      computeIpoStatus({ openDate: daysFromNow(-10), closeDate: daysFromNow(-3), listingDate: null, status: "closed", hasListing: true }),
    ).toBe("listed");
    expect(
      computeIpoStatus({ openDate: daysFromNow(-1), closeDate: daysFromNow(2), listingDate: daysFromNow(5), status: "live", hasListing: true }),
    ).toBe("listed");
  });

  it("prefers listed over date-derived live/closed when listingDate passed", () => {
    // even if open/close would say 'closed', a passed listingDate wins
    expect(
      computeIpoStatus({ openDate: daysFromNow(-30), closeDate: daysFromNow(-25), listingDate: daysFromNow(-20), status: "listed" }),
    ).toBe("listed");
  });
});
