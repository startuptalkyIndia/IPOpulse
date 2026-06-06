/**
 * Unit tests for lib/rate-limit.ts — in-memory rate limiter, no DB.
 */

import { describe, it, expect } from "vitest";
import { rateLimit, clientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests up to max", () => {
    const key = `test-allow-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const result = rateLimit("test", key, 5, 60000);
      expect(result.ok).toBe(true);
    }
  });

  it("blocks the (max+1)th request", () => {
    const key = `test-block-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      rateLimit("test", key, 5, 60000);
    }
    const result = rateLimit("test", key, 5, 60000);
    expect(result.ok).toBe(false);
  });

  it("remaining decreases with each request", () => {
    const key = `test-remaining-${Date.now()}`;
    const r1 = rateLimit("test", key, 3, 60000);
    const r2 = rateLimit("test", key, 3, 60000);
    expect(r1.remaining).toBeGreaterThan(r2.remaining);
  });

  it("remaining is 0 after exhaustion", () => {
    const key = `test-zero-${Date.now()}`;
    for (let i = 0; i < 4; i++) rateLimit("test", key, 3, 60000);
    const result = rateLimit("test", key, 3, 60000);
    expect(result.remaining).toBe(0);
  });

  it("different keys are isolated", () => {
    const prefix = `isolated-${Date.now()}`;
    for (let i = 0; i < 3; i++) rateLimit("test", `${prefix}-a`, 3, 60000);
    // key-b should still have full allowance
    const r = rateLimit("test", `${prefix}-b`, 3, 60000);
    expect(r.ok).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("different keyPrefix namespaces are isolated", () => {
    const key = `ns-test-${Date.now()}`;
    for (let i = 0; i < 3; i++) rateLimit("nsA", key, 3, 60000);
    // nsB should still allow
    const r = rateLimit("nsB", key, 3, 60000);
    expect(r.ok).toBe(true);
  });

  it("resetAt is in the future", () => {
    const key = `resetat-${Date.now()}`;
    const result = rateLimit("test", key, 10, 60000);
    expect(result.resetAt).toBeGreaterThan(Date.now());
    expect(result.resetInMs).toBeGreaterThan(0);
  });
});

describe("clientIp", () => {
  it("extracts first IP from x-forwarded-for", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-real-ip": "9.8.7.6" },
    });
    expect(clientIp(req)).toBe("9.8.7.6");
  });

  it("falls back to unknown when no headers", () => {
    const req = new Request("http://localhost/");
    expect(clientIp(req)).toBe("unknown");
  });
});
