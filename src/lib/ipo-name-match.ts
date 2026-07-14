/**
 * Shared IPO⇄Company name matching — the SINGLE source of this logic.
 * ─────────────────────────────────────────────────────────────────
 * Previously copy-pasted in ipo-symbol-backfill.ts and gmp-tracker.ts, and the
 * two copies had already silently drifted (one included the "ipo" stop-word, the
 * other didn't), causing subtly different matches (audit MEDIUM M5/M39).
 */

// One authoritative stop-word list (union of the two former copies).
const STOP_WORDS =
  /\b(limited|ltd|pvt|private|public|company|industries|technologies|corporation|corp|holdings|the|ipo)\b\.?/g;

/** Normalize a company/IPO name for comparison. */
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(STOP_WORDS, "")
    .replace(/\([^)]*\)/g, "") // strip parentheticals like "(FirstCry)"
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface NameCandidate {
  id: number;
  name: string;
}

/**
 * Match a name against candidates, strictest-first:
 *  1. exact normalized match
 *  2. one is a prefix of the other AND they share ≥2 significant words
 *  3. (optional) a single-word name that prefix-matches exactly one candidate
 * Returns the matched candidate id, or null if none / ambiguous.
 */
export function matchCompanyByName(
  name: string,
  candidates: NameCandidate[],
  opts: { allowSingleWord?: boolean } = {},
): number | null {
  const target = normalizeCompanyName(name);
  if (target.length < 3) return null;

  const normed = candidates.map((c) => ({ id: c.id, norm: normalizeCompanyName(c.name) }));

  // 1) exact
  const exact = normed.filter((c) => c.norm === target);
  if (exact.length === 1) return exact[0].id;
  if (exact.length > 1) return null; // ambiguous

  // 2) prefix + ≥2 shared words  (3) single-word prefix, if allowed
  const targetWords = target.split(" ").filter((w) => w.length > 1);
  const matches = normed.filter((c) => {
    if (!(c.norm.startsWith(target) || target.startsWith(c.norm))) return false;
    const cWords = new Set(c.norm.split(" ").filter((w) => w.length > 1));
    const shared = targetWords.filter((w) => cWords.has(w)).length;
    if (shared >= 2) return true;
    return !!opts.allowSingleWord && targetWords.length === 1 && cWords.size === 1;
  });
  return matches.length === 1 ? matches[0].id : null;
}
