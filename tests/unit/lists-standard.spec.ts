import { describe, it, expect } from "vitest";
import { buildHistory, fetchIndexHistory, sparkCutoffDate, SPARK_POINTS } from "@/lib/index-history";
import { createAmcResolver, amcSlug, parsePage, resolvePage, amcCanonical, amcMetadata, AMC_FUND_ORDER } from "@/lib/amc";

// The page's ORIGINAL maths, copied from the pre-change code, to prove identical output.
function oldMaths(rows: { indexName: string; close: number }[]) {
  const histMap = new Map<string, number[]>();
  for (const r of rows) { const a = histMap.get(r.indexName) ?? []; a.push(Number(r.close)); histMap.set(r.indexName, a); }
  const ret = new Map<string, number>();
  for (const [n, p] of histMap.entries()) { if (p.length < 2) continue; ret.set(n, ((p[p.length - 1] - p[0]) / p[0]) * 100); }
  return { histMap, ret };
}

describe("indices history", () => {
  it("builds the same sparkline and 30D return as the old code", () => {
    const rows = [
      { indexName: "Nifty 50", close: 100 }, { indexName: "Nifty 50", close: 110 }, { indexName: "Nifty 50", close: 121 },
      { indexName: "Nifty IT", close: 50 }, { indexName: "Nifty Bank", close: 7 }, { indexName: "Nifty Bank", close: 7 },
    ];
    const old = oldMaths(rows);
    const nu = buildHistory(rows.map((r) => ({ index_name: r.indexName, close: r.close })));
    expect([...nu.histMap]).toEqual([...old.histMap]);
    expect([...nu.ret30dMap]).toEqual([...old.ret]);
    expect(nu.ret30dMap.has("Nifty IT")).toBe(false);
  });
  it("one capped query: window function, 30 points, UTC cutoff 35 days back", async () => {
    let sql = ""; let params: unknown[] = [];
    const db = { $queryRaw: async (q: TemplateStringsArray, ...v: unknown[]) => { sql = q.join("?"); params = v; return []; } };
    await fetchIndexHistory(db as never, new Date("2026-11-02T00:00:00Z"));
    expect(sql).toMatch(/ROW_NUMBER\(\) OVER \(PARTITION BY index_name ORDER BY date DESC\)/);
    expect(sql).toMatch(/rn <= \?/);
    expect(params).toEqual(["2026-09-28", SPARK_POINTS]);
    expect(sparkCutoffDate(new Date("2026-11-02T00:00:00Z"))).toBe("2026-09-28");
  });
});

describe("AMC resolver", () => {
  it("caches the list and resolves slugs exactly as before", async () => {
    let calls = 0; let t = 1000;
    const r = createAmcResolver(async () => { calls++; return ["HDFC Mutual Fund", "SBI Mutual Fund"]; }, () => t);
    expect(await r("hdfc-mutual-fund")).toBe("HDFC Mutual Fund");
    expect(await r("sbi-mutual-fund")).toBe("SBI Mutual Fund");
    expect(calls).toBe(1);
    expect(amcSlug("A  B")).toBe("a-b");
  });
  it("bad slug: null, and refreshes at most once a minute", async () => {
    let calls = 0; let t = 1000;
    const r = createAmcResolver(async () => { calls++; return ["X Fund"]; }, () => t);
    expect(await r("nope")).toBeNull(); expect(calls).toBe(1);
    expect(await r("nope2")).toBeNull(); expect(calls).toBe(1);
    t += 61_000;
    expect(await r("nope")).toBeNull(); expect(calls).toBe(2);
  });
  it("new AMC is found after the miss refresh; list re-read after 1 hour", async () => {
    let calls = 0; let t = 1000; let list = ["X Fund"];
    const r = createAmcResolver(async () => { calls++; return list; }, () => t);
    await r("x-fund"); list = ["X Fund", "New Fund"]; t += 61_000;
    expect(await r("new-fund")).toBe("New Fund");
    t += 3_700_000; await r("x-fund"); expect(calls).toBe(3);
  });
});

describe("parsePage", () => {
  it("never NaN, clamps, first of repeated", () => {
    expect(parsePage("abc")).toBe(1); expect(parsePage(undefined)).toBe(1); expect(parsePage("-4")).toBe(1);
    expect(parsePage("99999999")).toBe(1000); expect(parsePage(["3", "9"])).toBe(3); expect(parsePage("2")).toBe(2);
  });
});

describe("AMC page canonical and order", () => {
  const total = 450; // 3 pages of 200
  it("page 1 and bad values canonical to the plain URL; page N to itself", () => {
    const c = (raw: string | undefined) => amcCanonical("icici", resolvePage(raw, total).page);
    expect(c(undefined)).toBe("/mutual-funds/amc/icici");
    expect(c("1")).toBe("/mutual-funds/amc/icici");
    for (const bad of ["abc", "-1", "0", ""]) expect(c(bad)).toBe("/mutual-funds/amc/icici");
    expect(c("2")).toBe("/mutual-funds/amc/icici?page=2");
    expect(c("3")).toBe("/mutual-funds/amc/icici?page=3");
  });
  it("a page above the last canonicals to the last page; huge values too", () => {
    expect(resolvePage("99999", total).page).toBe(3);
    expect(amcCanonical("icici", resolvePage("99999", total).page)).toBe("/mutual-funds/amc/icici?page=3");
    expect(resolvePage("5", 0)).toEqual({ totalPages: 1, page: 1 });
  });
  it("title and description say the page for page > 1, plain for page 1, no robots field", () => {
    const m2 = amcMetadata("ICICI", "icici", 2);
    expect((m2.title as { absolute: string }).absolute).toContain("page 2"); expect(m2.description).toContain("page 2");
    expect(amcMetadata("ICICI", "icici", 1).title).toEqual({ absolute: "ICICI — All Mutual Fund Schemes & NAV | IPOpulse" });
    expect("robots" in m2).toBe(false);
  });
  it("fund order ends with a unique key", () => {
    expect(AMC_FUND_ORDER).toEqual([{ category: "asc" }, { schemeName: "asc" }, { slug: "asc" }]);
  });
});
