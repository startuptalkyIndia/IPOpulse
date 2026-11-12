import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { pickExpected, parsePriceBandHigh, fetchExpectedIpos, _resetBackoff } from "@/lib/expected-ipos";
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
  it("refuses strings that are not a plain price or range", () => {
    expect(parsePriceBandHigh("₹100-105 (Lot 150)")).toBeNull();
    expect(parsePriceBandHigh("₹1,030 per share")).toBeNull();
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

describe("pickExpected hardening", () => {
  it("matches names across Private/Pvt/& variants", () => {
    expect(pickExpected([row({ name: "A & B Industries Pvt Ltd" })], ["A and B Industries Private Limited"], now)).toEqual([]);
  });
  it("caps very long names from the feed", () => {
    expect(pickExpected([row({ name: "X".repeat(300) })], [], now)[0].name.length).toBeLessThanOrEqual(80);
  });
});

describe("fetchExpectedIpos never throws and backs off", () => {
  const ok = JSON.stringify({ status: 1, result: [{ ipoName: "Crystal Crop Protection", ipoGmp: "₹0", priceBand: "₹0", IPODate: "18 Nov - 20 Nov", Type: "Mainboard", Status: "Upcoming" }] });
  beforeEach(() => { _resetBackoff(); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-12T12:00:00Z")); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it("returns rows on a good response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(ok, { status: 200 })));
    expect(await fetchExpectedIpos([])).toHaveLength(1);
  });
  it("returns [] on HTTP error, bad JSON and network error", async () => {
    for (const f of [
      vi.fn().mockResolvedValue(new Response("x", { status: 503 })),
      vi.fn().mockResolvedValue(new Response("<html>", { status: 200 })),
      vi.fn().mockRejectedValue(new Error("timeout")),
    ]) {
      _resetBackoff();
      vi.stubGlobal("fetch", f);
      expect(await fetchExpectedIpos([])).toEqual([]);
    }
  });
  it("skips the feed for 5 minutes after a failure, then retries", async () => {
    const f = vi.fn().mockRejectedValue(new Error("down"));
    vi.stubGlobal("fetch", f);
    await fetchExpectedIpos([]);
    await fetchExpectedIpos([]);
    expect(f).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date("2026-11-12T12:06:00Z"));
    await fetchExpectedIpos([]);
    expect(f).toHaveBeenCalledTimes(2);
  });
});
