/**
 * Unit tests for the GMP sources — the multi-source scraper behind the
 * product's most-used number. Pure parsing + the failover helper, no DB.
 *
 * Background: on 2026-08-19 the single hardcoded source (ipowatch.in) started
 * returning HTTP 522 and GMP silently stopped updating for a whole day. These
 * tests pin both parsers and, more importantly, the failover itself.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseIpoWatch,
  parseIpoji,
  parseSignedNumber,
  parseAbsoluteDateRange,
  fetchGmpRows,
  SOURCES,
} from "@/lib/scrapers/gmp-sources";

const fixture = (name: string) => readFileSync(join(__dirname, "fixtures", name), "utf8");
const ymd = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

describe("parseSignedNumber", () => {
  it("keeps a negative sign that sits outside the currency symbol", () => {
    // The bug this guards: /-?\d+/ on "-₹5" skips the minus (not adjacent to
    // the digit) and reads +5 — inverting exactly the IPOs where a negative
    // GMP is the whole story.
    expect(parseSignedNumber("-₹5")).toBe(-5);
    expect(parseSignedNumber("-₹5 (-5%)")).toBe(-5);
  });

  it("reads positive and decimal premiums", () => {
    expect(parseSignedNumber("₹3")).toBe(3);
    expect(parseSignedNumber("+₹69 (+19%)")).toBe(69);
    expect(parseSignedNumber("₹1,250")).toBe(1250);
    expect(parseSignedNumber("₹2.5")).toBe(2.5);
  });

  it("returns null when no premium is quoted", () => {
    expect(parseSignedNumber("—")).toBeNull();
    expect(parseSignedNumber("")).toBeNull();
  });
});

describe("parseAbsoluteDateRange", () => {
  it("parses an en-dash range with explicit years", () => {
    const { open, close } = parseAbsoluteDateRange("Aug 18, 2026 – Aug 20, 2026");
    expect(ymd(open)).toBe("2026-08-18");
    expect(ymd(close)).toBe("2026-08-20");
  });

  it("parses a range that spans a year boundary", () => {
    const { open, close } = parseAbsoluteDateRange("Dec 30, 2026 – Jan 2, 2027");
    expect(ymd(open)).toBe("2026-12-30");
    expect(ymd(close)).toBe("2027-01-02");
  });

  it("returns nulls for an unparseable cell", () => {
    expect(parseAbsoluteDateRange("—")).toEqual({ open: null, close: null });
  });
});

describe("parseIpoWatch", () => {
  const rows = parseIpoWatch(fixture("gmp-ipowatch.html"));

  it("skips the header and rows with no premium quoted", () => {
    expect(rows.map((r) => r.name)).toEqual(["Shankesh Jewellers", "Dhanwel Hybrid Seeds", "Weak Listing Co"]);
  });

  it("reads a negative GMP as negative", () => {
    expect(rows.find((r) => r.name === "Weak Listing Co")?.gmp).toBe(-5);
  });

  it("maps price band, board type and status", () => {
    const sme = rows.find((r) => r.name === "Dhanwel Hybrid Seeds")!;
    expect(sme.gmp).toBe(12);
    expect(sme.priceBand).toBe("₹95-99");
    expect(sme.boardType).toBe("BSE SME");
    expect(sme.status).toBe("Open");
  });

  it("parses its relative '18-20 August' date format", () => {
    const r = rows.find((x) => x.name === "Shankesh Jewellers")!;
    expect(ymd(r.openDate)?.slice(5)).toBe("08-18");
    expect(ymd(r.closeDate)?.slice(5)).toBe("08-20");
  });
});

describe("parseIpoji", () => {
  const rows = parseIpoji(fixture("gmp-ipoji.html"));

  it("strips the trailing type and status glued onto the name", () => {
    // Source renders "Shankesh Jewellers IPO Mainboard Open" in one cell; if the
    // suffix survives, the name never matches an IPO in our DB.
    expect(rows.map((r) => r.name)).toEqual([
      "Shankesh Jewellers",
      "Sunshine Pictures",
      "Gaja Alternative Asset Management",
      "Credent Connect N Care",
    ]);
  });

  it("reads premiums and drops rows with none quoted", () => {
    expect(rows.map((r) => r.gmp)).toEqual([3, 69, 22, 65]);
  });

  it("parses its absolute date format", () => {
    const r = rows.find((x) => x.name === "Gaja Alternative Asset Management")!;
    expect(ymd(r.openDate)).toBe("2026-08-19");
    expect(ymd(r.closeDate)).toBe("2026-08-21");
  });

  it("keeps board type and status for the BSE SME auto-create path", () => {
    const r = rows.find((x) => x.name === "Credent Connect N Care")!;
    expect(r.boardType).toBe("NSE SME");
    expect(r.status).toBe("Closed");
    expect(r.priceBand).toBe("₹179-189");
  });
});

describe("fetchGmpRows failover", () => {
  afterEach(() => vi.unstubAllGlobals());

  const ok = (body: string) => new Response(body, { status: 200 });

  it("uses the first source when it works", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ok(fixture("gmp-ipowatch.html"))));
    const { source, rows } = await fetchGmpRows();
    expect(source).toBe(SOURCES[0].name);
    expect(rows.length).toBeGreaterThan(0);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("falls through to the next source on the 522 that caused this", async () => {
    const fetchMock = vi.fn(async (url: string | URL) =>
      String(url).includes("ipowatch")
        ? new Response("", { status: 522 })
        : ok(fixture("gmp-ipoji.html")),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { source, rows } = await fetchGmpRows();
    expect(source).toBe("ipoji");
    expect(rows.length).toBe(4);
  });

  it("falls through when a source loads but parses to zero rows (layout change)", async () => {
    const fetchMock = vi.fn(async (url: string | URL) =>
      String(url).includes("ipowatch")
        ? ok("<html><body><p>we redesigned the page</p></body></html>")
        : ok(fixture("gmp-ipoji.html")),
    );
    vi.stubGlobal("fetch", fetchMock);
    expect((await fetchGmpRows()).source).toBe("ipoji");
  });

  it("falls through when a source throws (timeout / DNS)", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      if (String(url).includes("ipowatch")) throw new Error("fetch failed");
      return ok(fixture("gmp-ipoji.html"));
    });
    vi.stubGlobal("fetch", fetchMock);
    expect((await fetchGmpRows()).source).toBe("ipoji");
  });

  it("throws with every reason when all sources fail, so the heartbeat flags it", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 522 })));
    await expect(fetchGmpRows()).rejects.toThrow(/All \d+ GMP sources failed/);
    await expect(fetchGmpRows()).rejects.toThrow(/ipowatch: HTTP 522/);
    await expect(fetchGmpRows()).rejects.toThrow(/ipoji: HTTP 522/);
  });
});
