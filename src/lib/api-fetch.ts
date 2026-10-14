// apiFetch: the ONE way a screen (browser code) talks to our own server.
// It throws an ApiError on any failed reply (network, timeout, 4xx, 5xx, a login page served as "success",
// invalid JSON), so a caller cannot "forget" to check res.ok: the happy path continues only on success.
//
//   try {
//     const members = await apiFetch<Member[]>("/api/org/members");
//     setMembers(members);
//   } catch (e) {
//     toast.error(errorMessage(e));            // never show "saved" or close a dialog when this ran
//   }
//
// Options (third argument):  { as: "json" (default) | "text" | "blob" | "none", timeoutMs: 30000 }
//   as "blob": downloads (PDF/CSV/images).  as "none": only success matters (apiSend does this).
// Fire-and-forget calls that really may fail silently (analytics, logout) add `// fetch-ok: reason` on the line.
export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiFetchOptions {
  as?: "json" | "text" | "blob" | "none";
  timeoutMs?: number;
}

function messageFrom(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    const m = b.error ?? b.message ?? b.detail;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (status === 401) return "Your session expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "That was not found.";
  if (status === 408 || status === 504) return "The server took too long to answer. Please try again.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return `Request failed (${status}).`;
}

export async function apiFetch<T = unknown>(input: RequestInfo | URL, init: RequestInit = {}, opts: ApiFetchOptions = {}): Promise<T> {
  const as = opts.as ?? "json";
  const timeoutMs = opts.timeoutMs ?? 30000;
  const ctrl = new AbortController();
  const outer = init.signal;
  if (outer) {
    if (outer.aborted) ctrl.abort();
    else outer.addEventListener("abort", () => ctrl.abort(), { once: true });
  }
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(input, { credentials: "same-origin", ...init, signal: ctrl.signal });
  } catch {
    clearTimeout(timer);
    if (outer?.aborted) throw new ApiError("The request was cancelled.", 0);
    throw new ApiError(ctrl.signal.aborted ? "The server took too long to answer. Please try again." : "Could not reach the server. Check your connection and try again.", 0);
  }
  try {
    const type = res.headers.get("content-type") ?? "";
    const isJson = type.includes("application/json");
    if (!res.ok) {
      let body: unknown = null;
      if (isJson) { try { body = await res.json(); } catch { body = null; } }
      throw new ApiError(messageFrom(body, res.status), res.status, body);
    }
    if (res.status === 204 || as === "none") return null as T;
    if (as === "blob") return (await res.blob()) as T;
    if (as === "text") return (await res.text()) as T;
    // as "json": a login/redirect page or any non-JSON body served with a 2xx status is a failure, not data
    if (res.redirected && !isJson) throw new ApiError("Your session expired. Please sign in again.", 401);
    if (!isJson) {
      const text = await res.text();
      if (text.trim() === "") return null as T;
      throw new ApiError(/<html|<!doctype/i.test(text) ? "Your session expired. Please sign in again." : "The server sent an unexpected reply.", /<html|<!doctype/i.test(text) ? 401 : res.status, text.slice(0, 200));
    }
    try { return (await res.json()) as T; } catch { throw new ApiError("The server sent an unexpected reply.", res.status); }
  } finally {
    clearTimeout(timer);
  }
}

/** For calls where only success/failure matters (save, delete, toggle). */
export async function apiSend(input: RequestInfo | URL, init: RequestInit = {}, opts: Omit<ApiFetchOptions, "as"> = {}): Promise<void> {
  await apiFetch<unknown>(input, init, { ...opts, as: "none" });
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error && e.message) return e.message;
  return "Something went wrong. Please try again.";
}
