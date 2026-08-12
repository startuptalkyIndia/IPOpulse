/**
 * Universal Claude caller — provider-gated by the `ai_provider_mode` admin setting
 * (default "subscription"). See `src/lib/ai-provider-setting.ts`.
 *
 * Platform policy (AGENT_OPERATING_STANDARDS.md B.20, 2026-08-12): AI calls default
 * to the founder's Claude subscription via the local `claude` CLI binary — fixed
 * cost, no per-token billing. Per-token Anthropic API billing is opt-in per product,
 * switched on ONLY via the admin-pasted key at /sup-min/ai-settings.
 *
 * Fail-closed, no silent fallthrough:
 *   - mode "subscription" (default): CLI only. If the CLI/org access is down, this
 *     throws — it NEVER falls through to an API key, even if one happens to be saved.
 *   - mode "api_key": Anthropic SDK only, using the key saved via the admin UI
 *     (never `process.env.ANTHROPIC_API_KEY`). If no key is saved, this throws.
 *
 * Usage:
 *   import { callClaude, claudeAvailable } from "@/lib/claude-runner";
 *
 *   const text = await callClaude({ system: "...", user: "...", maxTokens: 1000 });
 */

import { spawn } from "node:child_process";
import { which } from "./which-util";
import { getAiProviderMode, getSavedAnthropicApiKey } from "./ai-provider-setting";
import { AiError, mapAnthropicApiError } from "./ai-errors";

/** Fail-closed error: AI is not available under the CURRENT provider setting. */
export class ClaudeUnavailableError extends AiError {
  constructor(message?: string) {
    super(
      "unavailable",
      message ??
        "Claude AI is not available. Install the Claude CLI " +
          "(`npm install -g @anthropic-ai/claude-code`) and run `claude` once to authenticate.",
    );
    this.name = "ClaudeUnavailableError";
  }
}

export interface ClaudeCallOptions {
  system: string;
  user: string;
  maxTokens?: number;
  /** Override model — passed to CLI via --model flag, or used as the SDK model id. */
  model?: string;
}

let _claudeBin: string | null | undefined = undefined;

async function getClaudeBin(): Promise<string | null> {
  if (_claudeBin !== undefined) return _claudeBin;
  _claudeBin = await which("claude");
  return _claudeBin;
}

/** Check if AI is available under the CURRENT provider setting (subscription CLI or saved API key). */
export async function claudeAvailable(): Promise<{ available: boolean; via: "cli" | "api" | null }> {
  const mode = await getAiProviderMode();
  if (mode === "api_key") {
    const key = await getSavedAnthropicApiKey();
    return key ? { available: true, via: "api" } : { available: false, via: null };
  }
  const bin = await getClaudeBin();
  return bin ? { available: true, via: "cli" } : { available: false, via: null };
}

/**
 * Call Claude and return the assistant's text response.
 * Routes to the CLI (subscription mode, default) or the Anthropic SDK (api_key
 * mode) based on the admin-set provider mode. Always fails closed with a
 * ClaudeUnavailableError — never silently switches provider.
 */
export async function callClaude(opts: ClaudeCallOptions): Promise<string> {
  const mode = await getAiProviderMode();

  if (mode === "api_key") {
    const key = await getSavedAnthropicApiKey();
    if (!key) {
      throw new ClaudeUnavailableError(
        "AI features unavailable — AI provider is set to “API key” but no Anthropic API key has been saved yet. " +
          "An admin can add one at /sup-min/ai-settings, or switch back to Subscription mode.",
      );
    }
    return callViaApi(key, opts);
  }

  // Default: subscription mode — CLI ONLY. On any failure, fail closed with an
  // honest message. Do NOT fall through to any API key, even if one is saved.
  const bin = await getClaudeBin();
  if (!bin) {
    throw new ClaudeUnavailableError(
      "AI features unavailable — subscription access is down (Claude CLI not found on the server). " +
        "This does not automatically use any Anthropic API key.",
    );
  }
  try {
    return await callViaCli(bin, opts);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ClaudeUnavailableError(
      `AI features unavailable — subscription access is down (${msg.slice(0, 200)}). ` +
        "This does not automatically use any Anthropic API key.",
    );
  }
}

function callViaCli(bin: string, opts: ClaudeCallOptions): Promise<string> {
  const combinedPrompt = `<system>\n${opts.system}\n</system>\n\n${opts.user}`;
  const args = ["-p", "--output-format", "text"];
  if (opts.model) args.push("--model", opts.model);

  return new Promise<string>((resolve, reject) => {
    const child = spawn(bin, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, HOME: process.env.HOME ?? "/root" },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      reject(new Error("Claude CLI timed out after 120s"));
    }, 120_000);

    child.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    child.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) return;
      if (stderr.trim()) console.warn("[claude-runner] CLI stderr:", stderr.slice(0, 400));
      if (code !== 0) {
        reject(new Error(`Claude CLI exited ${code}: ${stderr.slice(0, 300)}`));
        return;
      }
      resolve(stdout.trim());
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Claude CLI spawn error: ${err.message}`));
    });

    child.stdin.write(combinedPrompt);
    child.stdin.end();
  });
}

/**
 * Call the Anthropic SDK directly with the admin-saved API key (api_key mode only).
 * Lazy-imports the SDK and resolves the model from env at call-time (never a
 * hardcoded dated model id) so this stays a Haiku-class default unless overridden.
 */
async function callViaApi(apiKey: string, opts: ClaudeCallOptions): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey, timeout: 60_000 });
  const model = opts.model || process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";

  try {
    const resp = await client.messages.create({
      model,
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
    });
    const block = resp.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new AiError("unknown", "Claude returned no text content.");
    }
    return block.text.trim();
  } catch (err) {
    const mapped = mapAnthropicApiError(err);
    // Reword the generic "auth" message here with the admin-settings pointer
    // (the shared mapper is also used for key-validation, which has its own wording).
    if (mapped.kind === "auth") {
      throw new AiError(
        "auth",
        "AI features unavailable — the saved Anthropic API key was rejected. " +
          "An admin needs to check it at /sup-min/ai-settings.",
      );
    }
    throw mapped;
  }
}

/**
 * Convenience wrapper that parses JSON from the response.
 * Claude often wraps JSON in markdown fences; this strips them.
 */
export async function callClaudeJson<T = unknown>(opts: ClaudeCallOptions): Promise<T> {
  const raw = await callClaude(opts);
  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error("Claude returned no JSON: " + raw.slice(0, 300));
  return JSON.parse(match[0]) as T;
}
