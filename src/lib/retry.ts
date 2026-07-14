/**
 * Small retry helper (audit MEDIUM M42): once-daily crawler jobs lost a whole
 * day of data to a single transient blip. Wrap idempotent source fetches in this.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; baseMs?: number; maxMs?: number; shouldRetry?: (e: unknown) => boolean } = {},
): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const baseMs = opts.baseMs ?? 800;
  const maxMs = opts.maxMs ?? 30000;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i === attempts - 1) break;
      if (opts.shouldRetry && !opts.shouldRetry(e)) break;
      await new Promise((r) => setTimeout(r, Math.min(baseMs * 2 ** i, maxMs)));
    }
  }
  throw lastErr;
}
