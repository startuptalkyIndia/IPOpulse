/** Re-seeding must never wipe rows that the live cron / admin wrote: create-if-missing, no deletes. */
import { describe, it, expect } from "vitest";
import { seedAnchors, seedSubscriptions, seedGmp, type SeedDb } from "@/lib/seed-sync";

type Row = Record<string, unknown>;
function fakeDb() {
  const t = { ipoAnchor: [] as Row[], ipoSubscription: [] as Row[], ipoGmp: [] as Row[] };
  const eq = (a: unknown, b: unknown) => {
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof Date && b && typeof b === "object" && "gte" in b) { const r = b as { gte: Date; lt: Date }; return a >= r.gte && a < r.lt; }
    return a === b;
  };
  const mk = (rows: Row[]) => ({
    findFirst: async ({ where }: { where: Row }) => rows.find((r) => Object.entries(where).every(([k, v]) => eq(r[k], v))) ?? null,
    create: async ({ data }: { data: Row }) => { rows.push({ ...data }); },
    // The seed must never call these; a call fails the test loudly.
    deleteMany: async () => { throw new Error("seed attempted a delete"); },
  });
  return { t, db: { ipoAnchor: mk(t.ipoAnchor), ipoSubscription: mk(t.ipoSubscription), ipoGmp: mk(t.ipoGmp) } as unknown as SeedDb };
}
const open = new Date("2026-03-10T00:00:00Z");
const subs = [{ offsetDays: 0, retail: 1, hni: 2, qib: 3, total: 4 }, { offsetDays: 1, retail: 5, hni: 6, qib: 7, total: 8 }];

describe("seed-ipos is create-if-missing", () => {
  it("the subscription key is the same instant (12:00 UTC = 5:30 PM IST) in any timezone, so a re-run from another timezone adds nothing", async () => {
    const prev = process.env.TZ;
    try {
      const { t, db } = fakeDb();
      for (const tz of ["Asia/Kolkata", "America/Los_Angeles", "Pacific/Auckland", "UTC"]) {
        process.env.TZ = tz;
        await seedSubscriptions(db, 7, open, subs);
      }
      expect(t.ipoSubscription.length).toBe(2);
      expect(t.ipoSubscription.map((r) => (r.capturedAt as Date).toISOString())).toEqual(["2026-03-10T12:00:00.000Z", "2026-03-11T12:00:00.000Z"]);
    } finally { if (prev === undefined) delete process.env.TZ; else process.env.TZ = prev; }
  });
  it("an existing row at 17:30 UTC on the same UTC day (made by a UTC machine) is not duplicated; a different UTC day gets a new row", async () => {
    const { t, db } = fakeDb();
    t.ipoSubscription.push({ ipoId: 7, capturedAt: new Date("2026-03-10T17:30:00Z"), totalX: 11 });   // old seed row, offset 0
    expect(await seedSubscriptions(db, 7, open, subs)).toBe(1);                                           // only offset 1 (03-11) is new
    expect(t.ipoSubscription.length).toBe(2);
    expect(t.ipoSubscription.filter((r) => (r.capturedAt as Date).toISOString().startsWith("2026-03-10")).length).toBe(1);
    expect(t.ipoSubscription.some((r) => (r.capturedAt as Date).toISOString() === "2026-03-11T12:00:00.000Z")).toBe(true);
    expect(await seedSubscriptions(db, 7, open, subs)).toBe(0);
    expect(await seedSubscriptions(db, 8, open, subs)).toBe(2);                                           // another IPO is independent
  });
  it("a re-seed keeps live-captured subscription rows and adds only the seeded ones that are missing", async () => {
    const { t, db } = fakeDb();
    t.ipoSubscription.push({ ipoId: 7, capturedAt: new Date("2026-03-12T10:00:00Z"), totalX: 99 }); // written by the nse-ipo-subscription cron
    expect(await seedSubscriptions(db, 7, open, subs)).toBe(2);
    expect(await seedSubscriptions(db, 7, open, subs)).toBe(0);                                      // second run adds nothing
    expect(t.ipoSubscription.length).toBe(3);
    expect(t.ipoSubscription.some((r) => r.totalX === 99)).toBe(true);
  });
  it("an existing anchor (even edited) is left alone; GMP rows entered by an admin on the same day are not overwritten", async () => {
    const { t, db } = fakeDb();
    t.ipoAnchor.push({ ipoId: 7, investorName: "Alpha Fund", value: 123 });
    expect(await seedAnchors(db, 7, [{ name: "Alpha Fund", allocation: 10, price: 5, value: 1 }, { name: "Beta Fund", allocation: 20n, price: 5, value: 2 }])).toBe(1);
    expect(t.ipoAnchor.find((r) => r.investorName === "Alpha Fund")?.value).toBe(123);
    const d = new Date(open.getTime() - 3 * 86400000); d.setHours(0, 0, 0, 0);
    t.ipoGmp.push({ ipoId: 7, date: d, gmp: 77, enteredBy: "admin" });
    expect(await seedGmp(db, 7, open, [{ offsetDays: -3, gmp: 42, source: "x" }, { offsetDays: -1, gmp: 50 }])).toBe(1);
    expect(t.ipoGmp.find((r) => r.enteredBy === "admin")?.gmp).toBe(77);
    expect(t.ipoGmp.length).toBe(2);
  });
});
