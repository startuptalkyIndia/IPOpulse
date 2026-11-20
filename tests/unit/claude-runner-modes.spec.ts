import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";

const mode = { value: "subscription" as string };
const savedKey = { value: null as string | null };
const spawnEnvs: Array<NodeJS.ProcessEnv> = [];
const cliBehaviour = { fail: false };

vi.mock("@/lib/ai-provider-setting", () => ({
  getAiProviderMode: async () => mode.value,
  getSavedAnthropicApiKey: async () => savedKey.value,
}));
vi.mock("@/lib/which-util", () => ({ which: async () => "/usr/local/bin/claude" }));
vi.mock("node:child_process", () => ({
  spawn: (_bin: string, _args: string[], o: { env: NodeJS.ProcessEnv }) => {
    spawnEnvs.push(o.env);
    const child = new EventEmitter() as EventEmitter & { stdout: EventEmitter; stderr: EventEmitter; stdin: { write: () => void; end: () => void }; kill: () => void };
    child.stdout = new EventEmitter(); child.stderr = new EventEmitter();
    child.stdin = { write: () => {}, end: () => {
      setTimeout(() => {
        if (cliBehaviour.fail) { child.stderr.emit("data", Buffer.from("Not logged in")); child.emit("close", 1); }
        else { child.stdout.emit("data", Buffer.from("cli-answer")); child.emit("close", 0); }
      }, 0);
    } };
    child.kill = () => {};
    return child;
  },
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class { messages = { create: async () => ({ content: [{ type: "text", text: "sdk-answer" }] }) }; },
}));

import { callClaude, claudeAvailable } from "@/lib/claude-runner";
import { resetApiCapForTests } from "@/lib/_shared/ai/claudeFallback";

const realFetch = globalThis.fetch;
let bodies: Array<Record<string, unknown>> = [];
let headers: Array<Record<string, string>> = [];
function mockApi(ok: boolean, outTokens = 100) {
  globalThis.fetch = (async (_u: unknown, init: { body: string; headers: Record<string, string> }) => {
    bodies.push(JSON.parse(init.body)); headers.push(init.headers);
    if (!ok) return { ok: false, status: 500, json: async () => ({}) } as Response;
    return { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text: "api-answer" }], usage: { input_tokens: 10, output_tokens: outTokens }, model: "claude-sonnet-5-5", stop_reason: "end_turn" }) } as Response;
  }) as typeof fetch;
}
const OPTS = { system: "sys", user: "hello", maxTokens: 300 };
const ENV_KEYS = ["CLAUDE_FALLBACK_API_KEY", "CLAUDE_ALLOW_API_FALLBACK", "ANTHROPIC_API_KEY", "CLAUDE_CODE_OAUTH_TOKEN", "CLAUDE_API_DAILY_CAP", "CLAUDE_API_BUDGET_USD", "CLAUDE_MODEL", "ANTHROPIC_MODEL"];
let saved: Record<string, string | undefined> = {};

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  resetApiCapForTests(); bodies = []; headers = []; spawnEnvs.length = 0;
  mode.value = "api_first"; savedKey.value = "sk-saved-key"; cliBehaviour.fail = false;
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  globalThis.fetch = realFetch; vi.restoreAllMocks();
  for (const k of ENV_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
});

describe("api_first mode", () => {
  it("API answers first, CLI never runs, saved key used, max_tokens floored at 4096", async () => {
    mockApi(true);
    expect(await callClaude(OPTS)).toBe("api-answer");
    expect(spawnEnvs.length).toBe(0);
    expect(headers[0]["x-api-key"]).toBe("sk-saved-key");
    expect(bodies[0].max_tokens).toBe(4096);
    expect(bodies[0].system).toBe("sys");
  });
  it("API failure falls back to the CLI, and the CLI env has no key variables", async () => {
    process.env.ANTHROPIC_API_KEY = "x"; process.env.CLAUDE_CODE_OAUTH_TOKEN = "y"; process.env.CLAUDE_FALLBACK_API_KEY = "z";
    mockApi(false);
    expect(await callClaude(OPTS)).toBe("cli-answer");
    expect(spawnEnvs.length).toBe(1);
    for (const k of ["ANTHROPIC_API_KEY", "CLAUDE_FALLBACK_API_KEY", "CLAUDE_CODE_OAUTH_TOKEN"]) expect(spawnEnvs[0][k]).toBeUndefined();
  });
  it("no saved key and no env key: CLI only, no API call", async () => {
    savedKey.value = null; mockApi(true);
    expect(await callClaude(OPTS)).toBe("cli-answer");
    expect(bodies.length).toBe(0);
  });
  it("no saved key but server .env key + allow flag: API with the env key", async () => {
    savedKey.value = null; process.env.CLAUDE_FALLBACK_API_KEY = "sk-env"; process.env.CLAUDE_ALLOW_API_FALLBACK = "1"; mockApi(true);
    expect(await callClaude(OPTS)).toBe("api-answer");
    expect(headers[0]["x-api-key"]).toBe("sk-env");
  });
  it("env key without the allow flag is ignored", async () => {
    savedKey.value = null; process.env.CLAUDE_FALLBACK_API_KEY = "sk-env"; mockApi(true);
    expect(await callClaude(OPTS)).toBe("cli-answer");
    expect(bodies.length).toBe(0);
  });
  it("daily cap: the second call goes to the CLI", async () => {
    process.env.CLAUDE_API_DAILY_CAP = "1"; mockApi(true);
    expect(await callClaude(OPTS)).toBe("api-answer");
    expect(await callClaude(OPTS)).toBe("cli-answer");
    expect(bodies.length).toBe(1);
  });
  it("budget: after it is spent the CLI is used", async () => {
    process.env.CLAUDE_API_BUDGET_USD = "0.001"; mockApi(true, 1_000_000);
    expect(await callClaude(OPTS)).toBe("api-answer");
    expect(await callClaude(OPTS)).toBe("cli-answer");
  });
  it("model comes from CLAUDE_MODEL", async () => {
    process.env.CLAUDE_MODEL = "model-from-env"; mockApi(true);
    await callClaude(OPTS);
    expect(bodies[0].model).toBe("model-from-env");
  });
  it("both fail: ClaudeUnavailableError naming both", async () => {
    mockApi(false); cliBehaviour.fail = true;
    await expect(callClaude(OPTS)).rejects.toThrow(/API failed.*CLI failed/s);
  });
  it("availability: key or CLI", async () => {
    expect((await claudeAvailable()).via).toBe("api");
    savedKey.value = null;
    expect((await claudeAvailable()).via).toBe("cli");
  });
});

describe("existing modes unchanged", () => {
  it("subscription: CLI only, never the API even with a saved key", async () => {
    mode.value = "subscription"; mockApi(true);
    expect(await callClaude(OPTS)).toBe("cli-answer");
    expect(bodies.length).toBe(0);
  });
  it("subscription: CLI failure fails closed with no API fallthrough", async () => {
    mode.value = "subscription"; cliBehaviour.fail = true; mockApi(true);
    await expect(callClaude(OPTS)).rejects.toThrow(/does not automatically use any Anthropic API key/);
    expect(bodies.length).toBe(0);
  });
  it("api_key: saved key uses the SDK only", async () => {
    mode.value = "api_key"; mockApi(true);
    expect(await callClaude(OPTS)).toBe("sdk-answer");
    expect(spawnEnvs.length).toBe(0);
    expect(bodies.length).toBe(0);
  });
  it("api_key: no saved key fails closed; CLI never runs", async () => {
    mode.value = "api_key"; savedKey.value = null;
    await expect(callClaude(OPTS)).rejects.toThrow(/no Anthropic API key has been saved/);
    expect(spawnEnvs.length).toBe(0);
  });
});
