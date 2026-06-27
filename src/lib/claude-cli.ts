import { spawn } from "child_process";

export interface ClaudeResult {
  text: string;
}

const CLI_TIMEOUT_MS = 60_000;

/**
 * Call the local `claude -p` CLI. Async spawn + stdin pipe (no shell escaping /
 * ARG_MAX issues). Hardened against zombie grandchildren:
 *  - detached:true → own process group so a timeout SIGKILLs the WHOLE tree;
 *    killing only the parent orphans the grandchild (claude.exe) into a zombie.
 *  - stdin guarded against EPIPE if the child dies early.
 *  - reap on 'exit' (not 'close') with a `settled` guard so timeout/exit/error
 *    can't double-settle and a grandchild holding the pipe can't hang it.
 */
export function runClaude({ prompt }: { prompt: string }): Promise<ClaudeResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn("claude", ["-p", "--output-format", "text"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, NO_COLOR: "1" },
      detached: true,
    });

    let out = "";
    let err = "";
    let settled = false;

    const killTree = () => {
      try { if (proc.pid) process.kill(-proc.pid, "SIGKILL"); }
      catch { try { proc.kill("SIGKILL"); } catch { /* already gone */ } }
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      killTree();
      reject(new Error(`Claude CLI timed out after ${CLI_TIMEOUT_MS / 1000}s`));
    }, CLI_TIMEOUT_MS);

    proc.stdout.on("data", (c: Buffer) => { out += c.toString(); });
    proc.stderr.on("data", (c: Buffer) => { err += c.toString(); });

    proc.on("error", (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      killTree();
      reject(new Error(`Claude CLI failed: ${e.message}`));
    });

    proc.on("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code === 0) resolve({ text: out.trim() });
      else reject(new Error(`Claude CLI exited ${code}: ${(err.trim() || out.trim() || "no stderr").slice(0, 200)}`));
    });

    proc.stdin.on("error", () => {});
    try { proc.stdin.write(prompt); proc.stdin.end(); }
    catch { /* child already gone; exit/error path reports it */ }
  });
}
