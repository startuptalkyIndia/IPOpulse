/**
 * Integration-style tests for /api/signup route.
 * Mocks: @/lib/db (Prisma), bcryptjs.
 * No real DB or network.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoist mock fns before factories run ───────────────────────────────────
const mockUserFindUnique = vi.hoisted(() => vi.fn());
const mockUserCreate = vi.hoisted(() => vi.fn());
const mockBcryptHash = vi.hoisted(() => vi.fn().mockResolvedValue("hashed_pw"));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: { hash: mockBcryptHash },
  hash: mockBcryptHash,
}));

import { POST } from "@/app/api/signup/route";

function makeReq(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/signup", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
  });
}

describe("POST /api/signup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeReq({ password: "password123" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid input");
  });

  it("returns 400 when password is too short (< 8 chars)", async () => {
    const res = await POST(makeReq({ email: "user@test.com", password: "short" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is malformed", async () => {
    const res = await POST(makeReq({ email: "not-an-email", password: "password123" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already registered", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "existing-user" });
    const res = await POST(makeReq({ email: "existing@test.com", password: "password123" }, "2.3.4.5"));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("Account already exists");
  });

  it("creates user and returns 200 ok on valid input", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "new-user-id", email: "newuser@test.com" });

    const res = await POST(makeReq({ email: "newuser@test.com", password: "password123", name: "Test User" }, "3.4.5.6"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.id).toBe("new-user-id");
  });

  it("normalizes email to lowercase", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "u1", email: "test@test.com" });

    await POST(makeReq({ email: "TEST@Test.COM", password: "password123" }, "4.5.6.7"));
    expect(mockUserFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "test@test.com" } })
    );
  });

  it("returns 429 when rate limit exceeded (6th request from same IP)", async () => {
    // Fresh IP for this test to avoid polluting other tests
    const testIp = `192.168.${Math.floor(Math.random() * 254) + 1}.1`;
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "u", email: "x@x.com" });

    // Exhaust the 5-attempt window
    for (let i = 0; i < 5; i++) {
      await POST(makeReq({ email: `user${i}@test.com`, password: "password123" }, testIp));
    }
    // 6th attempt should be rate-limited
    const res = await POST(makeReq({ email: "extra@test.com", password: "password123" }, testIp));
    expect(res.status).toBe(429);
  });
});
