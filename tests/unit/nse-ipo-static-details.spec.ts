import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type Row = { id: number; nseSymbol: string; lotSize: number | null };
let rows: Row[] = [];
const updates: { id: number; data: Record<string, unknown> }[] = [];
const fetchNse = vi.fn();

// In-memory stand-in for prisma that honours where(lotSize null), orderBy id desc, skip and take,
// so the tests prove WHICH rows get picked, not just which arguments were passed.
function pool(dir: "asc" | "desc" = "asc") {
  return rows.filter((r) => r.lotSize === null).sort((a, b) => (dir === "desc" ? b.id - a.id : a.id - b.id));
}
vi.mock("@/lib/db", () => ({
  prisma: {
    ipo: {
      findMany: async (a: { orderBy?: { id: "asc" | "desc" }; skip?: number; take?: number }) =>
        pool(a.orderBy?.id).slice(a.skip ?? 0, (a.skip ?? 0) + (a.take ?? 1e9)),
      count: async () => pool().length,
      update: async (a: { where: { id: number }; data: Record<string, unknown> }) => {
        updates.push({ id: a.where.id, data: a.data });
        if (a.data.lotSize != null) rows.find((r) => r.id === a.where.id)!.lotSize = a.data.lotSize as number;
      },
    },
  },
}));
vi.mock("@/lib/nse-session", () => ({ fetchNse: (u: string) => fetchNse(u) }));

const withLot = { issueInfo: { dataList: [{ title: "Bid Lot", value: "55 Equity Shares and in multiples thereof" }] } };
const noLotButRegistrar = { issueInfo: { dataList: [{ title: "Name of the Registrar", value: "KFin Technologies" }] } };

async function load(max: number) {
  vi.resetModules();
  vi.stubEnv("IPO_STATIC_DETAILS_MAX_PER_RUN", String(max));
  return (await import("@/crons/jobs/nse-ipo-static-details")).ingestIpoStaticDetails;
}
async function run(max: number) {
  const fn = await load(max);
  const p = fn();
  await vi.runAllTimersAsync();
  return p;
}

describe("ingestIpoStaticDetails", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    updates.length = 0;
    fetchNse.mockReset();
    // 3 fresh fillable IPOs (high ids) behind 60 older no-data rows, plus one older fillable row.
    rows = [
      ...Array.from({ length: 60 }, (_, i) => ({ id: 100 + i, nseSymbol: `OLD${100 + i}`, lotSize: null })),
      { id: 9733, nseSymbol: "CRYSTALCP", lotSize: null },
      { id: 9734, nseSymbol: "WATRANA", lotSize: null },
      { id: 9758, nseSymbol: "MAHACOAL", lotSize: null },
    ];
    fetchNse.mockImplementation(async (u: string) => {
      const sym = new URL("http://x" + u).searchParams.get("symbol")!;
      return ["CRYSTALCP", "WATRANA", "MAHACOAL", "OLD130"].includes(sym) ? withLot : {};
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("fills fresh IPOs even when more old no-data rows than the batch size sit ahead of them by id order", async () => {
    // Oldest-first (the old behaviour) with a batch of 8 would only ever see OLD100..OLD107.
    const res = await run(8);
    const filled = rows.filter((r) => r.lotSize != null).map((r) => r.nseSymbol).sort();
    expect(filled).toEqual(expect.arrayContaining(["CRYSTALCP", "MAHACOAL", "WATRANA"]));
    expect(res.rowsIn).toBeGreaterThanOrEqual(3);
  });

  it("the rotating window eventually reaches an older fillable row that the newest slots never see", async () => {
    // Batch 8 = 6 newest + 2 rotating. OLD130 is far down the list; it must be reached within a few days.
    let reached = false;
    for (let day = 0; day < 40 && !reached; day++) {
      vi.setSystemTime(new Date(Date.UTC(2026, 10, 21 + day, 22, 0, 0)));
      await run(8);
      reached = rows.find((r) => r.nseSymbol === "OLD130")!.lotSize != null;
    }
    expect(reached).toBe(true);
  });

  it("a row with registrar but no lot size is not counted as updated and writes only the non-null fields", async () => {
    rows = [{ id: 1875, nseSymbol: "ARDEE", lotSize: null }];
    fetchNse.mockResolvedValue(noLotButRegistrar);
    const res = await run(8);
    expect(res.rowsIn).toBe(0);
    expect(res.notes).toContain("1 had details but no lot size");
    expect(updates).toHaveLength(1);
    expect(updates[0].data).toEqual({ registrar: "KFin Technologies" });
  });

  it("counts an NSE failure as an error without stopping the batch", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    rows = [
      { id: 2, nseSymbol: "BOOM", lotSize: null },
      { id: 1, nseSymbol: "CRYSTALCP", lotSize: null },
    ];
    fetchNse.mockImplementation(async (u: string) => {
      if (u.includes("BOOM")) throw new Error("blocked");
      return withLot;
    });
    const res = await run(8);
    expect(res.rowsError).toBe(1);
    expect(res.rowsIn).toBe(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("BOOM: blocked"));
    warn.mockRestore();
  });
});
