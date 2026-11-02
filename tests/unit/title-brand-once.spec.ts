import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { amcMetadata } from "@/lib/amc";

// The root layout adds " · IPOpulse" to every page title (title.template). A page
// title that already names the brand must use { absolute: ... }, else it reads
// "... | IPOpulse · IPOpulse".
function walk(dir: string, out: string[] = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(n)) out.push(p);
  }
  return out;
}

describe("brand appears once in page titles", () => {
  it("no plain metadata title string names the brand", () => {
    const bad: string[] = [];
    for (const f of walk("src")) {
      if (f.endsWith("src/app/layout.tsx") || f.endsWith("src/app/layout.tsx".replace(/\//g, "\\"))) continue;
      readFileSync(f, "utf8").split("\n").forEach((l, i) => {
        // metadata-level title (2 or 4 spaces); openGraph/twitter titles sit deeper or are not templated
        if (/^( {2}| {4})title: ["`][^"`]*IPOpulse/.test(l)) bad.push(`${f}:${i + 1}`);
      });
    }
    // fii-dii and stock-forecast keep the name only inside openGraph/twitter (not templated)
    expect(bad.filter((b) => !/fii-dii\/page|stock-forecast\/layout/.test(b))).toEqual([]);
  });

  it("amcMetadata title is absolute and names the brand once", () => {
    const t = amcMetadata("HDFC Mutual Fund", "hdfc", 2).title as { absolute: string };
    expect(t.absolute).toBe("HDFC Mutual Fund — All Mutual Fund Schemes & NAV - page 2 | IPOpulse");
    expect(t.absolute.match(/IPOpulse/g)).toHaveLength(1);
  });
});
