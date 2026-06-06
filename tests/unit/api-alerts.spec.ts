/**
 * Integration-style tests for /api/alerts route.
 * Mocks: @/lib/db (Prisma), @/lib/auth (NextAuth session).
 * No real DB or network.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoist mock objects before vi.mock factories run ──────────────────────
const mockAuth = vi.hoisted(() => vi.fn());
const mockAlertFindMany = vi.hoisted(() => vi.fn());
const mockAlertFindFirst = vi.hoisted(() => vi.fn());
const mockAlertCreate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/db", () => ({
  prisma: {
    alert: {
      findMany: mockAlertFindMany,
      findFirst: mockAlertFindFirst,
      create: mockAlertCreate,
    },
  },
}));

import { GET, POST } from "@/app/api/alerts/route";

const authedSession = () => ({ user: { id: "user-123", email: "user@test.com" } });

describe("GET /api/alerts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns alerts for authenticated user", async () => {
    mockAuth.mockResolvedValue(authedSession());
    const mockAlerts = [{ id: "a1", ipoName: "Test IPO", type: "allotment", isActive: true }];
    mockAlertFindMany.mockResolvedValue(mockAlerts);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.alerts).toEqual(mockAlerts);
    expect(mockAlertFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-123", isActive: true } })
    );
  });
});

describe("POST /api/alerts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request("http://localhost/api/alerts", {
      method: "POST",
      body: JSON.stringify({ ipoName: "Test", type: "allotment" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid input (missing ipoName)", async () => {
    mockAuth.mockResolvedValue(authedSession());
    const req = new Request("http://localhost/api/alerts", {
      method: "POST",
      body: JSON.stringify({ type: "allotment" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid input");
  });

  it("returns 400 for invalid alert type", async () => {
    mockAuth.mockResolvedValue(authedSession());
    const req = new Request("http://localhost/api/alerts", {
      method: "POST",
      body: JSON.stringify({ ipoName: "Test IPO", type: "invalid_type" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when alert already exists", async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockAlertFindFirst.mockResolvedValue({ id: "existing" });

    const req = new Request("http://localhost/api/alerts", {
      method: "POST",
      body: JSON.stringify({ ipoName: "Test IPO", type: "allotment", ipoSlug: "test-ipo" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("creates alert and returns 201 on valid input", async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockAlertFindFirst.mockResolvedValue(null);
    const created = { id: "new-alert", ipoName: "Zomato IPO", type: "listing", isActive: true };
    mockAlertCreate.mockResolvedValue(created);

    const req = new Request("http://localhost/api/alerts", {
      method: "POST",
      body: JSON.stringify({ ipoName: "Zomato IPO", type: "listing", ipoSlug: "zomato-ipo" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.alert.ipoName).toBe("Zomato IPO");
  });

  it("accepts gmp_threshold type with threshold value", async () => {
    mockAuth.mockResolvedValue(authedSession());
    mockAlertFindFirst.mockResolvedValue(null);
    const created = { id: "a2", ipoName: "HDB Financial", type: "gmp_threshold", threshold: 50, isActive: true };
    mockAlertCreate.mockResolvedValue(created);

    const req = new Request("http://localhost/api/alerts", {
      method: "POST",
      body: JSON.stringify({ ipoName: "HDB Financial", type: "gmp_threshold", threshold: 50 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
