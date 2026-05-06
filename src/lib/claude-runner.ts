/**
 * Universal Claude caller.
 *
 * Tries in order:
 *   1. Anthropic SDK  — if ANTHROPIC_API_KEY is set in env
 *   2. Claude CLI     — if `claude` binary is on PATH and ~/.claude/ credentials exist
 *   3. Throws ClaudeUnavailableError
 *
 * This means the founder can use their existing Claude Pro / Max / Team subscription
 * (no separate API key purchase) as long as `claude` is installed on the server
 * and authenticated once via `claude` login.
 *
 * Usage:
 *   import { callClaude, claudeAvailable } from "@/lib/claude-runner";
 *
 *   const text = await callClaude({ system: "...", user: "...", maxTokens: 1000 });
 *
 * Both paths return a plain string — callers parse JSON from it when needed.
 */

import { spawn } from "node:child_process";
import { which } from "./which-util";

export class ClaudeUnavailableError extends Error {
  constructor() {
    super(
      "Claude AI is not available. Set ANTHROPIC_API_KEY in .env, or install the Claude CLI " +
        "(`npm install -g @anthropic-ai/claude-code`) and run `claude` once to authenticate.",
    );
    this.name = "ClaudeUnavailableError";
  }
}

export interface ClaudeCallOptions {
  system: string;
  user: string;
  maxTokens?: number;
  /** Override model. For SDK path only; CLI path uses the plan default. */
  model?: string;
}

let _claudeBin: string | null | undefined = undefined; // undefined = not yet resolved

async function getClaudeBin(): Promise<string | null> {
  if (_claudeBin !== undefined) return _claudeBin;
  _claudeBin = await which("claude");
  return _claudeBin;
}

/** Check if either path is available — use in route handlers to gate features. */
export async function claudeAvailable(): Promise<{ available: boolean; via: "sdk" | "cli" | null }> {
  if (process.env.ANTHROPIC_API_KEY) return { available: true, via: "sdk" };
  const bin = await getClaudeBin();
  if (bin) return { available: true, via: "cli" };
  return { available: false, via: null };
}

/**
 * Call Claude and return the assistant's text response.
 * Throws ClaudeUnavailableError if neither path is configured.
 */
export async function callClaude(opts: ClaudeCallOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ── Path 1: Anthropic SDK ────────────────────────────────────────────
  if (apiKey) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: opts.model ?? "claude-sonnet-4-5",
      max_tokens: opts.maxTokens ?? 1500,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
    });
    const block = resp.content.find((b) => b.type === "text");
    if (block && block.type === "text") return block.text;
    throw new Error("SDK returned no text block");
  }

  // ── Path 2: Claude CLI ───────────────────────────────────────────────
  const bin = await getClaudeBin();
  if (bin) {
    return callViaCli(bin, opts);
  }

  throw new ClaudeUnavailableError();
}

async function callViaCli(bin: string, opts: ClaudeCallOptions): Promise<string> {
  /**
   * Pipe the combined prompt via stdin to the Claude CLI.
   * Uses spawn (not execFile) so we can write to stdin after process start.
   *
   * Flags:
   *   -p                  non-interactive print mode
   *   --output-format text  return raw text
   *   --no-history        don't persist this call to ~/.claude history
   *   --model             only when explicitly requested
   */
  const combinedPrompt = `<system>\n${opts.system}\n</system>\n\n${opts.user}`;
  const args = ["-p", "--output-format", "text", "--no-history"];
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
 * Convenience wrapper that parses JSON from the response.
 * Claude often wraps JSON in markdown fences; this strips them.
 */
export async function callClaudeJson<T = unknown>(opts: ClaudeCallOptions): Promise<T> {
  const raw = await callClaude(opts);
  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error("Claude returned no JSON: " + raw.slice(0, 300));
  return JSON.parse(match[0]) as T;
}
