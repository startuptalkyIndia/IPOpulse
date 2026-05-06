/**
 * Pure Node.js `which` — finds a binary on PATH without shell dependencies.
 * Returns the full path or null.
 */
import { access, constants } from "node:fs/promises";
import { join } from "node:path";

export async function which(name: string): Promise<string | null> {
  const paths = (process.env.PATH ?? "").split(":");
  for (const dir of paths) {
    if (!dir) continue;
    const full = join(dir, name);
    try {
      await access(full, constants.X_OK);
      return full;
    } catch {
      // not found or not executable — try next
    }
  }
  return null;
}
