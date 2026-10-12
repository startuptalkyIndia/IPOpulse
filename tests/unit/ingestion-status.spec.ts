/**
 * IP-02 / IP-03 / IP-04: honest ingestion statuses. No DB, no network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const m = vi.hoisted(() => ({
  alertCount: vi.fn(),
  alertFindMany: vi.fn(),
  subFindMany: vi.fn(),
  companyFindUnique: vi.fn(),
  companyUpdate: vi.fn(),
  companyCreate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    alert: { count: m.alertCount, findMany: m.alertFindMany },
    newsletterSub: { findMany: m.subFindMany },
    company: { findUnique: m.companyFindUnique, update: m.companyUpdate, create: m.companyCreate },
  },
}));
vi.mock("@/lib/seo-ping", () => ({ maybePingSitemap: vi.fn() }));

import { resolveRunStatus } from "@/crons/runIngestion";
import { sendDailyDigest } from "@/crons/jobs/daily-digest";
import { checkIpoAlerts } from "@/crons/jobs/check-alerts";
import { upsertCompany } from "@/crons/jobs/nse-company-master";
import { withOneRetry } from "@/crons/jobs/market-news-brief";

describe("resolveRunStatus", () => {
  it("success when clean", () => expect(resolveRunStatus({ rowsIn: 5 })).toBe("success"));
  it("partial when some rows failed", () =>
    expect(resolveRunStatus({ rowsIn: 5, rowsError: 2 })).toBe("partial"));
  it("failed when every row failed", () =>
    expect(resolveRunStatus({ rowsIn: 0, rowsError: 3 })).toBe("failed"));
  it("explicit skipped is never success", () =>
    expect(resolveRunStatus({ rowsIn: 0, status: "skipped" })).toBe("skipped"));
  it("explicit failed wins", () =>
    expect(resolveRunStatus({ rowsIn: 0, rowsError: 1, status: "failed" })).toBe("failed"));
});

describe("email jobs without RESEND_API_KEY (IP-02)", () => {
  const saved = process.env.RESEND_API_KEY;
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    vi.clearAllMocks();
  });
  afterEach(() => {
    if (saved) process.env.RESEND_API_KEY = saved;
  });

  it("daily_digest records skipped, not success", async () => {
    const r = await sendDailyDigest();
    expect(r.status).toBe("skipped");
    expect(resolveRunStatus(r)).toBe("skipped");
    expect(r.notes).toMatch(/skipped: email not configured/);
    expect(m.subFindMany).not.toHaveBeenCalled();
  });

  it("check_alerts records skipped, leaves alerts untouched", async () => {
    m.alertCount.mockResolvedValue(2);
    const r = await checkIpoAlerts();
    expect(r.status).toBe("skipped");
    expect(r.notes).toMatch(/skipped: email not configured/);
    expect(r.notes).toMatch(/2 active alert/);
    expect(m.alertFindMany).not.toHaveBeenCalled();
  });
});

describe("upsertCompany (IP-04)", () => {
  const row = { symbol: "NEWSYM", name: "Acme Ltd", slug: "acme-ltd", isin: "INE000A01012", faceValue: 10 };
  beforeEach(() => vi.clearAllMocks());

  it("renamed ticker with an existing ISIN updates that row instead of colliding", async () => {
    m.companyFindUnique.mockImplementation(async ({ where }: { where: Record<string, string> }) =>
      where.isin ? { id: 7 } : null,
    );
    expect(await upsertCompany(row)).toBe("isin-match");
    expect(m.companyCreate).not.toHaveBeenCalled();
    const arg = m.companyUpdate.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 7 });
    expect(arg.data.nseSymbol).toBeUndefined(); // symbol is never rewritten
  });

  it("does not move an ISIN owned by another row onto a symbol-matched row", async () => {
    m.companyFindUnique.mockImplementation(async ({ where }: { where: Record<string, string> }) =>
      where.nseSymbol ? { id: 1, isin: null } : { id: 2 },
    );
    expect(await upsertCompany(row)).toBe("symbol-match");
    expect(m.companyUpdate.mock.calls[0][0].data.isin).toBeUndefined();
  });

  it("creates when nothing matches, retrying once with a suffixed slug on slug clash", async () => {
    m.companyFindUnique.mockResolvedValue(null);
    m.companyCreate
      .mockRejectedValueOnce({ code: "P2002", meta: { target: ["slug"] } })
      .mockResolvedValueOnce({});
    expect(await upsertCompany(row)).toBe("created");
    expect(m.companyCreate.mock.calls[1][0].data.slug).toBe("acme-ltd-newsym");
  });

  it("a genuine failure still throws (counted as a row error)", async () => {
    m.companyFindUnique.mockResolvedValue(null);
    m.companyCreate.mockRejectedValue(new Error("db down"));
    await expect(upsertCompany(row)).rejects.toThrow("db down");
  });
});

describe("withOneRetry (IP-03)", () => {
  it("retries once after backoff and returns the second result", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("CLI exited 1")).mockResolvedValueOnce("ok");
    const sleep = vi.fn().mockResolvedValue(undefined);
    expect(await withOneRetry(fn, 1234, sleep)).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(1234);
  });

  it("gives up after exactly one retry and rethrows", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("CLI exited 1"));
    await expect(withOneRetry(fn, 1, async () => {})).rejects.toThrow("CLI exited 1");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("no retry when the first call works", async () => {
    const fn = vi.fn().mockResolvedValue(1);
    await withOneRetry(fn, 1, async () => {});
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
