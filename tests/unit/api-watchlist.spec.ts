/**
 * Integration-style tests for /api/watchlist route.
 * Mocks: @/lib/db (Prisma), @/lib/auth.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoist mock fns ─────────────────────────────────────────────────────────
const mockAuth = vi.hoisted(() => vi.fn());
const mockWatchlistUpsert = vi.hoisted(() => vi.fn());
const mockWatchlistDeleteMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/db", () => ({
  prisma: {
    watchlistItem: {
      upsert: mockWatchlistUpsert,
      deleteMany: mockWatchlistDeleteMany,
    },
  },
}));

import { POST, DELETE } from "@/app/api/watchlist/route";

const authed = () => ({ user: { id: "user-456" } });

describe("POST /api/watchlist", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request("http://localhost/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ type: "ipo", targetSlug: "zomato-ipo" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid type", async () => {
    mockAuth.mockResolvedValue(authed());
    const req = new Request("http://localhost/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ type: "invalid", targetSlug: "zomato-ipo" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for slug with uppercase (fails SLUG_REGEX)", async () => {
    mockAuth.mockResolvedValue(authed());
    const req = new Request("http://localhost/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ type: "ipo", targetSlug: "Zomato-IPO" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("upserts watchlist item on valid input", async () => {
    mockAuth.mockResolvedValue(authed());
    mockWatchlistUpsert.mockResolvedValue({ id: "w1" });

    const req = new Request("http://localhost/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ type: "ipo", targetSlug: "zomato-ipo" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.id).toBe("w1");
  });

  it("accepts stock type", async () => {
    mockAuth.mockResolvedValue(authed());
    mockWatchlistUpsert.mockResolvedValue({ id: "w2" });

    const req = new Request("http://localhost/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ type: "stock", targetSlug: "reliance-industries" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/watchlist", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request("http://localhost/api/watchlist?type=ipo&targetSlug=zomato-ipo", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid slug in query params", async () => {
    mockAuth.mockResolvedValue(authed());
    const req = new Request("http://localhost/api/watchlist?type=ipo&targetSlug=INVALID_SLUG", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it("deletes watchlist item on valid params", async () => {
    mockAuth.mockResolvedValue(authed());
    mockWatchlistDeleteMany.mockResolvedValue({ count: 1 });

    const req = new Request("http://localhost/api/watchlist?type=ipo&targetSlug=zomato-ipo", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
