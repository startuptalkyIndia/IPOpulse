/**
 * Universal Claude caller — CLI only.
 *
 * Uses the local `claude` CLI binary (Claude Code). No ANTHROPIC_API_KEY needed.
 * The server must have `@anthropic-ai/claude-code` installed globally and
 * authenticated via `claude` login.
 *
 * Usage:
 *   import { callClaude, claudeAvailable } from "@/lib/claude-runner";
 *
 *   const text = await callClaude({ system: "...", user: "...", maxTokens: 1000 });
 */

import { spawn } from "node:child_process";
import { which } from "./which-util";

export class ClaudeUnavailableError extends Error {
  constructor() {
    super(
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
  /** Override model — passed to CLI via --model flag. */
  model?: string;
}

let _claudeBin: string | null | undefined = undefined;

async function getClaudeBin(): Promise<string | null> {
  if (_claudeBin !== undefined) return _claudeBin;
  _claudeBin = await which("claude");
  return _claudeBin;
}

/** Check if Claude CLI is available. */
export async function claudeAvailable(): Promise<{ available: boolean; via: "cli" | null }> {
  const bin = await getClaudeBin();
  if (bin) return { available: true, via: "cli" };
  return { available: false, via: null };
}

/**
 * Call Claude CLI and return the assistant's text response.
 * Throws ClaudeUnavailableError if the CLI is not installed.
 */
export async function callClaude(opts: ClaudeCallOptions): Promise<string> {
  const bin = await getClaudeBin();
  if (!bin) throw new ClaudeUnavailableError();
  return callViaCli(bin, opts);
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
 * Convenience wrapper that parses JSON from the response.
 * Claude often wraps JSON in markdown fences; this strips them.
 */
export async function callClaudeJson<T = unknown>(opts: ClaudeCallOptions): Promise<T> {
  const raw = await callClaude(opts);
  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error("Claude returned no JSON: " + raw.slice(0, 300));
  return JSON.parse(match[0]) as T;
}
