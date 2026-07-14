/**
 * IPO Symbol Backfill
 * ─────────────────────────────────────────────────────────────────
 * The BSE IPO scraper captures IPO name, dates, price band, issue size,
 * and listing gain — but often misses nse_symbol. Without the symbol we
 * can't join the IPO to its now-listed company in bhavcopy, so the IPO
 * Performance Tracker can't compute 1M/3M/6M/1Y post-listing returns.
 *
 * This job matches listed IPOs lacking nse_symbol to a Company row by
 * normalized full name, then writes the company's nse_symbol back to the IPO.
 *
 * Matching strategy (strictest first):
 *  1. Exact normalized name match
 *  2. IPO name is a prefix of company name (or vice versa) AND >= 2 words shared
 *  3. Skip ambiguous single-word matches (avoids "Bajaj X" → wrong Bajaj)
 *
 * Safe + idempotent — only fills NULL nse_symbol, never overwrites.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
// Name normalization is shared (audit MEDIUM: was copy-pasted + drifted).
import { normalizeCompanyName as normalize } from "@/lib/ipo-name-match";


export async function backfillIpoSymbols(): Promise<IngestionResult> {
  const ipos = await prisma.ipo.findMany({
    where: { status: "listed", nseSymbol: null },
    select: { id: true, name: true },
  });

  if (ipos.length === 0) {
    return { rowsIn: 0 };
  }

  // Load all active companies with a symbol
  const companies = await prisma.company.findMany({
    where: { active: true, nseSymbol: { not: null } },
    select: { id: true, name: true, nseSymbol: true, slug: true },
  });

  // Build normalized name → company lookup
  const exactMap = new Map<string, typeof companies[0]>();
  for (const c of companies) {
    exactMap.set(normalize(c.name), c);
  }

  let matched = 0;
  let ambiguous = 0;

  for (const ipo of ipos) {
    const ipoNorm = normalize(ipo.name);
    if (ipoNorm.length < 3) continue;

    // 1) Exact match
    let match = exactMap.get(ipoNorm);

    // 2) Prefix / containment with >= 2 shared words
    if (!match) {
      const ipoWords = ipoNorm.split(" ").filter(w => w.length > 1);
      const candidates = companies.filter(c => {
        const cNorm = normalize(c.name);
        if (cNorm === ipoNorm) return true;
        // One is prefix of the other
        const prefixMatch = cNorm.startsWith(ipoNorm) || ipoNorm.startsWith(cNorm);
        if (!prefixMatch) return false;
        // Require at least 2 shared significant words to avoid false positives
        const cWords = new Set(cNorm.split(" ").filter(w => w.length > 1));
        const shared = ipoWords.filter(w => cWords.has(w)).length;
        return shared >= 2;
      });

      if (candidates.length === 1) {
        match = candidates[0];
      } else if (candidates.length > 1) {
        ambiguous++;
        continue; // skip ambiguous — don't guess
      }
    }

    if (match && match.nseSymbol) {
      await prisma.ipo.update({
        where: { id: ipo.id },
        data: { nseSymbol: match.nseSymbol },
      });
      console.log(`[ipo-symbol-backfill] ${ipo.name} → ${match.nseSymbol}`);
      matched++;
    }
  }

  console.log(`[ipo-symbol-backfill] Done. matched=${matched} ambiguous=${ambiguous} unmatched=${ipos.length - matched - ambiguous}`);
  return { rowsIn: matched, rowsError: ambiguous };
}
