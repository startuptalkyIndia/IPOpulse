import { execSync } from "child_process";

export interface ClaudeResult {
  text: string;
}

export async function runClaude({ prompt }: { prompt: string }): Promise<ClaudeResult> {
  try {
    const escaped = prompt.replace(/'/g, "'\\''");
    const result = execSync(`claude -p '${escaped}' --output-format text`, {
      encoding: "utf8",
      timeout: 60000,
      maxBuffer: 1024 * 1024 * 10,
    });
    return { text: result.trim() };
  } catch (e: any) {
    throw new Error(`Claude CLI failed: ${e.message}`);
  }
}
