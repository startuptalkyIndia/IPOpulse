import { describe, it, expect, vi, afterEach } from "vitest";
import { apiFetch, apiSend, ApiError, errorMessage } from "@/lib/api-fetch";

function reply(status: number, body: unknown, type = "application/json") {
  return new Response(body === null ? null : typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: type ? { "content-type": type } : {},
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("apiFetch", () => {
  it("returns parsed JSON on 200", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(200, { a: 1 })));
    expect(await apiFetch("/x")).toEqual({ a: 1 });
  });

  it("a 500 reply throws with a readable message (server error text wins)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(500, { error: "Database is down" })));
    await expect(apiFetch("/x")).rejects.toMatchObject({ name: "ApiError", status: 500, message: "Database is down" });
  });

  it("a 500 with an HTML body gives a plain fallback, not the HTML", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(500, "<html>boom</html>", "text/html")));
    const err = (await apiFetch("/x").catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Something went wrong on our side. Please try again.");
  });

  it("a 401 never returns its body as data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(401, { foo: "bar" })));
    await expect(apiFetch("/x")).rejects.toMatchObject({ status: 401 });
  });

  it("a network failure throws a readable ApiError with status 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const err = (await apiFetch("/x").catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(errorMessage(err)).toMatch(/could not reach the server/i);
  });

  it("204 returns null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    expect(await apiFetch("/x")).toBeNull();
  });
});

describe("apiFetch hardening", () => {
  it("a 200 reply that is an HTML login page is a failure (session expired), not data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(200, "<!DOCTYPE html><html>login</html>", "text/html")));
    await expect(apiFetch("/x")).rejects.toMatchObject({ name: "ApiError", status: 401 });
    await expect(apiSend("/x")).resolves.toBeUndefined(); // apiSend only cares about success: a real 2xx is fine
  });

  it("a 200 reply with invalid JSON throws instead of returning null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(200, "{not json", "application/json")));
    await expect(apiFetch("/x")).rejects.toBeInstanceOf(ApiError);
  });

  it("keeps caller headers and credentials default", async () => {
    const f = vi.fn().mockResolvedValue(reply(200, { ok: 1 }));
    vi.stubGlobal("fetch", f);
    await apiFetch("/x", { method: "POST", headers: { "Content-Type": "application/json", "X-Test": "1" }, body: "{}" });
    const init = f.mock.calls[0][1];
    expect(init.headers).toEqual({ "Content-Type": "application/json", "X-Test": "1" });
    expect(init.credentials).toBe("same-origin");
    expect(init.method).toBe("POST");
  });

  it("passes FormData through untouched (no Content-Type forced)", async () => {
    const f = vi.fn().mockResolvedValue(reply(200, { ok: 1 }));
    vi.stubGlobal("fetch", f);
    const fd = new FormData();
    fd.append("a", "b");
    await apiFetch("/x", { method: "POST", body: fd });
    expect(f.mock.calls[0][1].body).toBe(fd);
    expect(f.mock.calls[0][1].headers).toBeUndefined();
  });

  it("downloads: as blob returns a Blob; as text returns text", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("abc", { status: 200, headers: { "content-type": "text/csv" } })));
    const b = await apiFetch<Blob>("/x", {}, { as: "blob" });
    expect(b).toBeInstanceOf(Blob);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("hello", { status: 200, headers: { "content-type": "text/plain" } })));
    expect(await apiFetch<string>("/x", {}, { as: "text" })).toBe("hello");
  });

  it("times out with a readable message", async () => {
    vi.stubGlobal("fetch", vi.fn((_u: unknown, init: RequestInit) => new Promise((_res, rej) => {
      init.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")));
    })));
    await expect(apiFetch("/x", {}, { timeoutMs: 20 })).rejects.toMatchObject({ name: "ApiError", status: 0, message: expect.stringContaining("too long") });
  });
});
