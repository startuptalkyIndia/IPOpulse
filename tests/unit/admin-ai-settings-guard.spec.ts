/**
 * The AI-settings admin route must re-read the role from the live admin_users row.
 * A demoted/removed admin holding a still-valid token must be refused.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.hoisted(() => vi.fn());
const mockFindUnique = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/db", () => ({ prisma: { adminUser: { findUnique: mockFindUnique } } }));
vi.mock("@/lib/ai-provider-setting", () => ({
  getAiProviderStatus: vi.fn().mockResolvedValue({ mode: "subscription" }),
  setAiProviderMode: vi.fn(),
  setAnthropicApiKey: vi.fn(),
  clearAnthropicApiKey: vi.fn(),
}));
vi.mock("@/lib/claude-runner", () => ({ claudeAvailable: vi.fn() }));
vi.mock("@/lib/which-util", () => ({ which: vi.fn().mockResolvedValue("/usr/bin/claude") }));

import { GET, POST } from "@/app/api/admin/ai-settings/route";

const tokenAdmin = { user: { id: "adm-1", role: "superadmin" } };
const post = () =>
  new Request("http://localhost/api/admin/ai-settings", {
    method: "POST",
    body: JSON.stringify({ mode: "api_first" }),
    headers: { "Content-Type": "application/json" },
  }) as never;

describe("admin ai-settings guard (live role re-check)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuses without a session", async () => {
    mockAuth.mockResolvedValue(null);
    expect((await GET()).status).toBe(403);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("refuses a plain user token without touching the DB", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "user" } });
    expect((await GET()).status).toBe(403);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("allows an admin whose live row is still admin", async () => {
    mockAuth.mockResolvedValue(tokenAdmin);
    mockFindUnique.mockResolvedValue({ role: "admin" });
    expect((await GET()).status).toBe(200);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "adm-1" }, select: { role: true } });
  });

  it("refuses a demoted admin holding a still-valid superadmin token (GET and POST)", async () => {
    mockAuth.mockResolvedValue(tokenAdmin);
    mockFindUnique.mockResolvedValue({ role: "user" });
    expect((await GET()).status).toBe(403);
    expect((await POST(post())).status).toBe(403);
  });

  it("refuses an admin whose row was removed", async () => {
    mockAuth.mockResolvedValue(tokenAdmin);
    mockFindUnique.mockResolvedValue(null);
    expect((await POST(post())).status).toBe(403);
  });
});
