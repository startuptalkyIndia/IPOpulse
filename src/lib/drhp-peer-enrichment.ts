/**
 * Peer enrichment — second pass over a stored DRHP analysis.
 *
 * The prompt tells Claude to extract peer names verbatim from the
 * prospectus's "Basis for Issue Price" section. Those names are strings.
 * This module resolves each string to a row in our `companies` table and
 * attaches the company's TTM fundamentals (P/E, ROE, debt/equity, market cap)
 * so the IPO page can render an actual side-by-side valuation table —
 * rather than just listing peer names.
 *
 * Resolution strategy (in order):
 *   1. Exact case-insensitive name match
 *   2. Strip common suffixes ("Limited", "Ltd", "Pvt") + retry
 *   3. First-2-words substring match (e.g. "Affle India" matches "Affle India Limited")
 *   4. Best-effort token overlap (>=2 tokens shared)
 *
 * Unmatched peers stay in the analysis with `companySlug: null`; UI
 * gracefully handles them (renders name + rationale, no fundamentals).
 */

import { prisma } from "@/lib/db";
import { latestTradingDate, canonicalCloseMap } from "@/lib/price";

export interface EnrichedPeer {
  name: string;
  rationale: string;
  pageRef: string | null;
  companySlug: string | null;
  // Pulled from companies table when matched
  marketCapCr: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  roePercent: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;
  ltp: number | null;
}

const NOISE_TOKENS = new Set([
  "limited",
  "ltd",
  "ltd.",
  "private",
  "pvt",
  "pvt.",
  "p",
  "of",
  "and",
  "the",
  "&",
  "company",
  "co",
  "co.",
  "industries",
  "india",
  "indian",
  "corporation",
  "corp",
  "corp.",
  "inc",
  "inc.",
  "plc",
]);

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(" ")
    .filter((t) => t && !NOISE_TOKENS.has(t));
}

interface CompanyRow {
  id: number;
  slug: string;
  name: string;
  nameNorm: string;
  nameTokens: string[];
  marketCap: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  roePercent: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;
}

let companyIndexCache: { rows: CompanyRow[]; loadedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function loadCompanyIndex(): Promise<CompanyRow[]> {
  if (companyIndexCache && Date.now() - companyIndexCache.loadedAt < CACHE_TTL_MS) {
    return companyIndexCache.rows;
  }
  const raw = await prisma.company.findMany({
    where: { active: true },
    select: {
      id: true,
      slug: true,
      name: true,
      marketCap: true,
      peRatio: true,
      pbRatio: true,
      roePercent: true,
      debtToEquity: true,
      dividendYield: true,
    },
  });
  const rows: CompanyRow[] = raw.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    nameNorm: normalize(c.name),
    nameTokens: tokens(c.name),
    marketCap: c.marketCap ? Number(c.marketCap) : null,
    peRatio: c.peRatio ? Number(c.peRatio) : null,
    pbRatio: c.pbRatio ? Number(c.pbRatio) : null,
    roePercent: c.roePercent ? Number(c.roePercent) : null,
    debtToEquity: c.debtToEquity ? Number(c.debtToEquity) : null,
    dividendYield: c.dividendYield ? Number(c.dividendYield) : null,
  }));
  companyIndexCache = { rows, loadedAt: Date.now() };
  return rows;
}

function resolvePeer(rawName: string, idx: CompanyRow[]): CompanyRow | null {
  if (!rawName) return null;
  const target = normalize(rawName);
  // 1. Exact normalized match
  const exact = idx.find((c) => c.nameNorm === target);
  if (exact) return exact;

  // 2. Substring containment (target contains co.name or vice versa)
  const contains = idx.find((c) => c.nameNorm.includes(target) || target.includes(c.nameNorm));
  if (contains) return contains;

  // 3. Token overlap >= 2 (ignoring noise tokens)
  const targetTokens = tokens(rawName);
  if (targetTokens.length === 0) return null;
  let bestMatch: { row: CompanyRow; score: number } | null = null;
  for (const c of idx) {
    if (c.nameTokens.length === 0) continue;
    const overlap = targetTokens.filter((t) => c.nameTokens.includes(t)).length;
    const score = overlap / Math.max(targetTokens.length, c.nameTokens.length);
    if (overlap >= 2 && score >= 0.5 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { row: c, score };
    }
  }
  if (bestMatch) return bestMatch.row;

  // 4. Fallback: first 2 tokens of target match first 2 of any company
  if (targetTokens.length >= 2) {
    const first2 = targetTokens.slice(0, 2).join(" ");
    const fallback = idx.find((c) => c.nameTokens.slice(0, 2).join(" ") === first2);
    if (fallback) return fallback;
  }

  return null;
}

/**
 * Enrich the peer list using the latest bhavcopy LTP (joined separately).
 */
export async function enrichPeers(
  peers: { name: string; rationale: string; pageRef: string | null }[],
): Promise<EnrichedPeer[]> {
  const idx = await loadCompanyIndex();

  // Pre-fetch latest LTP for all matched companies (one query)
  const matches: { peer: typeof peers[number]; row: CompanyRow | null }[] = peers.map((p) => ({
    peer: p,
    row: resolvePeer(p.name, idx),
  }));

  const matchedIds = matches.map((m) => m.row?.id).filter((x): x is number => typeof x === "number");
  let ltpMap = new Map<number, number>();
  if (matchedIds.length > 0) {
    const latestBhavDate = await latestTradingDate();
    if (latestBhavDate) ltpMap = await canonicalCloseMap(latestBhavDate, matchedIds);
  }

  return matches.map(({ peer, row }) => ({
    name: peer.name,
    rationale: peer.rationale,
    pageRef: peer.pageRef ?? null,
    companySlug: row?.slug ?? null,
    marketCapCr: row?.marketCap ?? null,
    peRatio: row?.peRatio ?? null,
    pbRatio: row?.pbRatio ?? null,
    roePercent: row?.roePercent ?? null,
    debtToEquity: row?.debtToEquity ?? null,
    dividendYield: row?.dividendYield ?? null,
    ltp: row?.id != null ? ltpMap.get(row.id) ?? null : null,
  }));
}
