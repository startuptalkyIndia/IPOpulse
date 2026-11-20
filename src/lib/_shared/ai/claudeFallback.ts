// API BACKUP for the Claude CLI (founder 2026-10-19: "use the API if the CLI is not working").
// `withApiBackup` = CLI first, API on CLI failure (until 2026-11-21). `withApiFirst`/`runAi` at the bottom = API first, CLI fallback (from 2026-11-21, set per product with CLAUDE_AI_ORDER=api-first).
// Nothing here runs unless BOTH are set in the product's server .env:
//   CLAUDE_FALLBACK_API_KEY=...      (the key lives only in the server .env, never in code or git)
//   NOTE: do NOT name it ANTHROPIC_API_KEY in a product that also runs the `claude` CLI: the CLI sees that variable and
//   switches from the subscription to the paid API for EVERY call (silent spend). ANTHROPIC_API_KEY is still read as a last resort.
//   CLAUDE_ALLOW_API_FALLBACK=1
// Optional per product: CLAUDE_API_DAILY_CAP (calls per UTC day, default 300), CLAUDE_API_BUDGET_USD (dollar cap for this process), CLAUDE_MODEL, CLAUDE_API_PRODUCT (name in the log).
// No npm dependency: plain fetch. Every API use writes one JSON log line [CLAUDE-API-FALLBACK] so cost is visible.
// A cap or API error never hides the CLI error: the caller still gets the original failure.

export type ApiOptions = { model?: string; maxTokens?: number; system?: string; timeoutMs?: number; reason?: string };
export type ApiResult = { text: string; model: string; inputTokens: number; outputTokens: number; usd: number };

// USD per million tokens (input, output), Anthropic list prices 2026-10 (claude-api skill table). Unknown models are priced like Opus so the estimate never under-reports.
const PRICES: Array<[RegExp, number, number]> = [[/haiku-5-5/, 0.10, 0.50], [/sonnet-5/, 2, 10], [/opus-5-5/, 4, 20]];
export function estimateUsd(model: string, inputTokens: number, outputTokens: number): number {
  const row = PRICES.find(([re]) => re.test(model));
  const [, inP, outP] = row || [/./, 4, 20];
  return (inputTokens * inP + outputTokens * outP) / 1_000_000;
}
let spentUsd = 0; // this process only; the shared $50 pool is tracked from the logs by Manage and capped by the Anthropic console

export class ClaudeApiCapError extends Error {
  constructor(public readonly cap: number) {
    super(`Claude API daily cap reached (${cap} calls). The CLI failure stands.`);
    this.name = "ClaudeApiCapError";
  }
}

export class ClaudeApiBudgetError extends Error {
  constructor(public readonly budgetUsd: number) {
    super(`Claude API budget reached ($${budgetUsd}). The CLI failure stands.`);
    this.name = "ClaudeApiBudgetError";
  }
}

/** The API cut the answer off at max_tokens: a half answer is a failure, so the CLI fallback runs (DIYPR 2026-10-25 lesson). */
export class ClaudeApiTruncatedError extends Error {
  constructor(public readonly maxTokens: number) {
    super(`Claude API answer was cut off at max_tokens (${maxTokens}). Treated as a failure.`);
    this.name = "ClaudeApiTruncatedError";
  }
}

/** The key was refused (401/403): no more API calls for a while, so a dead key adds no failed round trip to every call. */
export class ClaudeApiAuthPausedError extends Error {
  constructor(public readonly untilMs: number) {
    super(`Claude API paused after a rejected key until ${new Date(untilMs).toISOString()}. The CLI is used meanwhile.`);
    this.name = "ClaudeApiAuthPausedError";
  }
}

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MAX_TOKENS = 4096; // the CLI ignores maxTokens, so small caller limits (50-500) cut JSON answers short on the API
const AUTH_PAUSE_MS = 10 * 60 * 1000;
let authPausedUntil = 0;
export function apiAuthPausedUntil(): number { return authPausedUntil; }
const API_VERSION = "2023-06-01";
let capDay = "";
let capCount = 0;

export function fallbackApiKey(env: NodeJS.ProcessEnv = process.env): string {
  return env.CLAUDE_FALLBACK_API_KEY || env.ANTHROPIC_API_KEY || "";
}

export function apiFallbackEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.CLAUDE_ALLOW_API_FALLBACK === "1" && !!fallbackApiKey(env);
}

/** API ONLY mode (founder 2026-10-24): CLAUDE_API_ONLY=1 and a key. The CLI is never used by callers that go through runApiOnly. */
export function apiOnlyEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.CLAUDE_API_ONLY === "1" && !!fallbackApiKey(env);
}

/** True when an error looks like "the CLI could not answer" (not logged in, usage limit, timeout, missing binary, empty output). */
export function isCliFailure(err: unknown): boolean {
  const m = (err instanceof Error ? `${err.name} ${err.message}` : String(err)).toLowerCase();
  return /not logged in|please run \/login|login|usage limit|rate limit|limit reached|credit|overloaded|timed out|timeout|etimedout|enoent|spawn|exit code|empty output|killed|sigterm|claudeunavailable|authentication/.test(m);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Counts one API call against today's cap; throws ClaudeApiCapError when the cap is used up. */
export function takeApiSlot(env: NodeJS.ProcessEnv = process.env, now: Date = new Date()): void {
  const cap = Math.max(1, Number(env.CLAUDE_API_DAILY_CAP) || 300);
  const day = now.toISOString().slice(0, 10);
  if (day !== capDay) { capDay = day; capCount = 0; }
  if (capCount >= cap) throw new ClaudeApiCapError(cap);
  capCount += 1;
}

export function resetApiCapForTests(): void { capDay = ""; capCount = 0; spentUsd = 0; authPausedUntil = 0; }
export function apiSpentUsd(): number { return spentUsd; }

export async function callAnthropicApi(prompt: string, opts: ApiOptions = {}, env: NodeJS.ProcessEnv = process.env, fetchImpl: typeof fetch = fetch, nowMs: () => number = Date.now): Promise<ApiResult> {
  if (!apiFallbackEnabled(env) && !apiOnlyEnabled(env)) throw new Error("API fallback is not enabled for this product");
  if (authPausedUntil > nowMs()) throw new ClaudeApiAuthPausedError(authPausedUntil);
  const budget = Number(env.CLAUDE_API_BUDGET_USD) || 0; // optional per-product dollar cap (this process)
  if (budget > 0 && spentUsd >= budget) throw new ClaudeApiBudgetError(budget);
  takeApiSlot(env);
  const model = opts.model || env.CLAUDE_MODEL || "claude-sonnet-5-5";
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.timeoutMs ?? 120_000);
  try {
    const res = await fetchImpl(API_URL, {
      method: "POST",
      signal: ctl.signal,
      headers: { "content-type": "application/json", "x-api-key": fallbackApiKey(env), "anthropic-version": API_VERSION },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
        ...(opts.system ? { system: opts.system } : {}),
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (res.status === 401 || res.status === 403) { authPausedUntil = nowMs() + AUTH_PAUSE_MS; throw new Error(`Claude API HTTP ${res.status} (key refused, pausing the API for ${AUTH_PAUSE_MS / 60000} min)`); }
    if (!res.ok) throw new Error(`Claude API HTTP ${res.status}`);
    const body = (await res.json()) as { content?: Array<{ type: string; text?: string }>; usage?: { input_tokens?: number; output_tokens?: number }; model?: string; stop_reason?: string };
    const text = (body.content || []).filter((c) => c.type === "text").map((c) => c.text || "").join("").trim();
    const inTok = body.usage?.input_tokens ?? 0, outTok = body.usage?.output_tokens ?? 0;
    const usd = estimateUsd(body.model || model, inTok, outTok);
    spentUsd += usd; // counted BEFORE any failure check below: a billed call that we then reject still cost money
    if (body.stop_reason === "max_tokens") {
      console.warn("[CLAUDE-API-FALLBACK]", JSON.stringify({ product: env.CLAUDE_API_PRODUCT || "unknown", reason: "truncated_max_tokens", model: body.model || model, in: inTok, out: outTok, usd: Number(usd.toFixed(5)), at: new Date().toISOString() }));
      throw new ClaudeApiTruncatedError(opts.maxTokens ?? DEFAULT_MAX_TOKENS);
    }
    if (!text) throw new Error("Claude API returned no text");
    const result: ApiResult = { text, model: body.model || model, inputTokens: inTok, outputTokens: outTok, usd };
    // One structured line per paid call (never the prompt, never the key).
    console.warn("[CLAUDE-API-FALLBACK]", JSON.stringify({ product: env.CLAUDE_API_PRODUCT || "unknown", reason: (opts.reason || "cli_failed").slice(0, 120), model: result.model, in: result.inputTokens, out: result.outputTokens, usd: Number(result.usd.toFixed(5)), at: new Date().toISOString() }));
    return result;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wrap a product's existing CLI call:
 *   const text = await withApiBackup(() => runMyCli(prompt), prompt, { maxTokens: 1500 });
 * CLI answers -> returned untouched, no API call. CLI fails and the backup is enabled and the error is a CLI failure
 * -> the API answers. Anything else -> the original CLI error is thrown.
 */
export async function withApiBackup(cli: () => Promise<string>, prompt: string, opts: ApiOptions = {}, env: NodeJS.ProcessEnv = process.env): Promise<string> {
  try {
    const out = await cli();
    if (out && out.trim()) return out;
    throw new Error("empty output");
  } catch (cliErr) {
    if (!apiFallbackEnabled(env) || !isCliFailure(cliErr)) throw cliErr;
    try {
      const r = await callAnthropicApi(prompt, { ...opts, reason: opts.reason || (cliErr instanceof Error ? cliErr.message.split("\n")[0] : "cli_failed") }, env);
      return r.text;
    } catch {
      throw cliErr; // the API could not help either: report the original CLI failure
    }
  }
}

// ── API ONLY (founder 2026-10-24: the CLI subscription is out of money, so a product calls the paid API and nothing else) ────────────
// Server .env of the product:  CLAUDE_API_ONLY=1   ANTHROPIC_API_KEY=... (safe to use this name ONLY because the product's CLI is switched off)
//   CLAUDE_API_BUDGET_USD=<dollars for this product>   REQUIRED: without it every call fails closed (no unbounded spend)
//   CLAUDE_API_UNTIL=<ISO date>  optional end of the window, after which every call fails   CLAUDE_API_DAILY_CAP=<calls/day, default 300>
// Pass a SpendStore (a table or log rows in the product's own database) so the running total survives restarts; without one the total is
// per process and a restart resets it. Expected cost is ABOUT 4x the Batch API: for hundreds of items use the Batch API instead.

export class ClaudeApiWindowError extends Error {
  constructor(public readonly until: string) {
    super(`Claude API window ended (${until}). No call was made and the CLI is switched off.`);
    this.name = "ClaudeApiWindowError";
  }
}

export interface SpendStore { load(): Promise<number>; add(usd: number, detail: Record<string, unknown>): Promise<void> }

export async function runApiOnly(prompt: string, opts: ApiOptions = {}, env: NodeJS.ProcessEnv = process.env, store?: SpendStore, now: Date = new Date(), fetchImpl: typeof fetch = fetch): Promise<ApiResult> {
  if (!apiOnlyEnabled(env)) throw new Error("API only mode is not enabled (CLAUDE_API_ONLY=1 and an API key are required). The CLI is not used.");
  const budget = Number(env.CLAUDE_API_BUDGET_USD) || 0;
  if (!(budget > 0)) throw new Error("API only mode needs CLAUDE_API_BUDGET_USD > 0 (fail closed: no unbounded spend).");
  if (env.CLAUDE_API_UNTIL) {
    const until = new Date(env.CLAUDE_API_UNTIL);
    if (!Number.isFinite(until.getTime()) || now.getTime() >= until.getTime()) throw new ClaudeApiWindowError(env.CLAUDE_API_UNTIL);
  }
  let spent = spentUsd;
  if (store) { try { spent = Math.max(spent, await store.load()); } catch { throw new Error("API only mode: cannot read the spend total, refusing to spend (fail closed)."); } }
  if (spent >= budget) throw new ClaudeApiBudgetError(budget);
  const r = await callAnthropicApi(prompt, { ...opts, reason: opts.reason || "api_only" }, env, fetchImpl);
  if (store) { try { await store.add(r.usd, { product: env.CLAUDE_API_PRODUCT || "unknown", model: r.model, in: r.inputTokens, out: r.outputTokens }); } catch { /* the in-process total still counts */ } }
  return r;
}

// ── API FIRST, CLI FALLBACK (founder 2026-10-25, from 2026-11-21 (moved from 10-31 by the founder 2026-10-25)) ─────────────────────────────────────────────────────────
// Order: 1) the paid API (key + CLAUDE_ALLOW_API_FALLBACK=1 in the product's server .env)  2) only if the API fails or is capped, the CLI.
// The CLI call gets an environment with ANTHROPIC_API_KEY and CLAUDE_CODE_OAUTH_TOKEN REMOVED: with the key present the CLI would bill the
// paid API again instead of using the subscription. If the API is not enabled for the product this behaves exactly like calling the CLI.
// If both fail, the API error is attached as `cause` to the thrown CLI error so nothing is hidden.

/** A copy of env that is safe to hand to the `claude` CLI: no API key, no OAuth token override. */
export function cliEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const e = { ...env };
  delete e.ANTHROPIC_API_KEY; delete e.CLAUDE_FALLBACK_API_KEY; delete e.CLAUDE_CODE_OAUTH_TOKEN;
  return e;
}

export async function withApiFirst(cli: (env: NodeJS.ProcessEnv) => Promise<string>, prompt: string, opts: ApiOptions = {}, env: NodeJS.ProcessEnv = process.env, fetchImpl: typeof fetch = fetch): Promise<string> {
  let apiErr: unknown;
  if (apiFallbackEnabled(env)) {
    try {
      return (await callAnthropicApi(prompt, { ...opts, reason: opts.reason || "api_first" }, env, fetchImpl)).text;
    } catch (e) {
      apiErr = e; // cap reached, budget reached, HTTP error, network: fall through to the CLI
      console.warn("[CLAUDE-API-FIRST] api failed, using the CLI:", e instanceof Error ? e.message.split("\n")[0] : String(e));
    }
  }
  try {
    const out = await cli(cliEnv(env));
    if (out && out.trim()) return out;
    throw new Error("empty output");
  } catch (cliErr) {
    if (apiErr && cliErr instanceof Error && !("cause" in cliErr)) (cliErr as Error & { cause?: unknown }).cause = apiErr;
    throw cliErr;
  }
}

/** One entry point for a product: CLAUDE_AI_ORDER=api-first uses the API first; anything else (default) keeps the CLI first. */
export function aiOrder(env: NodeJS.ProcessEnv = process.env): "api-first" | "cli-first" {
  return env.CLAUDE_AI_ORDER === "api-first" ? "api-first" : "cli-first";
}

export async function runAi(cli: (env: NodeJS.ProcessEnv) => Promise<string>, prompt: string, opts: ApiOptions = {}, env: NodeJS.ProcessEnv = process.env): Promise<string> {
  return aiOrder(env) === "api-first" ? withApiFirst(cli, prompt, opts, env) : withApiBackup(() => cli(env), prompt, opts, env);
}
