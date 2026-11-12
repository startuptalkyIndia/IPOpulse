import { describe, it, expect } from "vitest";
import { pickExpected, parsePriceBandHigh } from "@/lib/expected-ipos";
import type { GmpRow } from "@/lib/scrapers/gmp-sources";

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const row = (o: Partial<GmpRow>): GmpRow => ({
  name: "Crystal Crop Protection", gmp: 0, priceBand: "₹0", openDate: d("2026-11-18"),
  closeDate: d("2026-11-20"), boardType: "Mainboard", status: "Upcoming", ...o,
});
const now = new Date("2026-11-12T12:00:00Z");

describe("parsePriceBandHigh", () => {
  it("returns null while the band is not announced", () => {
    expect(parsePriceBandHigh("₹0")).toBeNull();
    expect(parsePriceBandHigh("")).toBeNull();
  });
  it("returns the upper band", () => {
    expect(parsePriceBandHigh("₹62-66")).toBe(66);
    expect(parsePriceBandHigh("₹1,030")).toBe(1030);
  });
});

describe("pickExpected", () => {
  it("keeps an upcoming IPO we do not track", () => {
    const r = pickExpected([row({})], [], now);
    expect(r).toHaveLength(1);
    expect(r[0].priceBandHigh).toBeNull();
  });
  it("drops IPOs we already track, ignoring Limited/Ltd/IPO suffixes", () => {
    expect(pickExpected([row({})], ["Crystal Crop Protection Limited"], now)).toEqual([]);
  });
  it("drops stale rows whose dates are over, keeps one closing today", () => {
    expect(pickExpected([row({ openDate: d("2026-11-05"), closeDate: d("2026-11-09") })], [], now)).toEqual([]);
    expect(pickExpected([row({ openDate: d("2026-11-10"), closeDate: d("2026-11-12"), status: "Open" })], [], now)).toHaveLength(1);
  });
  it("ignores closed / listed rows and rows with no open date", () => {
    expect(pickExpected([row({ status: "Closed" }), row({ status: "Listed" }), row({ openDate: null })], [], now)).toEqual([]);
  });
  it("sorts earliest first and caps the list", () => {
    const rows = ["A", "B", "C", "D"].map((n, i) => row({ name: n, openDate: d(`2026-11-${25 - i}`), closeDate: d("2026-11-30") }));
    expect(pickExpected(rows, [], now).map((x) => x.name)).toEqual(["D", "C", "B"]);
  });
});
