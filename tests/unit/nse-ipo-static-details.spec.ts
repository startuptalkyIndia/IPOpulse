import { describe, it, expect, vi, beforeEach } from "vitest";

const findMany = vi.fn();
const update = vi.fn();
const fetchNse = vi.fn();

vi.mock("@/lib/db", () => ({ prisma: { ipo: { findMany: (a: unknown) => findMany(a), update: (a: unknown) => update(a) } } }));
vi.mock("@/lib/nse-session", () => ({ fetchNse: (u: string) => fetchNse(u) }));

import { ingestIpoStaticDetails } from "@/crons/jobs/nse-ipo-static-details";

const detail = {
  issueInfo: {
    dataList: [
      { title: "Bid Lot", value: "55 Equity Shares and in multiples thereof" },
      { title: "Face Value", value: "Rs.10 per share" },
    ],
  },
};

describe("ingestIpoStaticDetails", () => {
  beforeEach(() => {
    findMany.mockReset();
    update.mockReset();
    fetchNse.mockReset();
  });

  it("asks for the newest candidates first so fresh IPOs are not starved by old no-data rows", async () => {
    findMany.mockResolvedValue([]);
    await ingestIpoStaticDetails();
    const arg = findMany.mock.calls[0][0] as { where: unknown; orderBy: unknown };
    expect(arg.orderBy).toEqual({ id: "desc" });
    expect(arg.where).toEqual({ lotSize: null, nseSymbol: { not: null } });
  });

  it("updates a fresh IPO even when older candidates return no data", async () => {
    findMany.mockResolvedValue([
      { id: 9733, nseSymbol: "CRYSTALCP" },
      { id: 101, nseSymbol: "OLDONE" },
    ]);
    fetchNse.mockImplementation(async (u: string) => (u.includes("CRYSTALCP") ? detail : {}));
    const res = await ingestIpoStaticDetails();
    expect(update).toHaveBeenCalledTimes(1);
    expect((update.mock.calls[0][0] as { where: { id: number } }).where.id).toBe(9733);
    expect(res.rowsIn).toBe(1);
    expect(res.notes).toContain("1 had no issueInfo");
  });
});
