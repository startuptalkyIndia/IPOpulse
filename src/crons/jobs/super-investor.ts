/**
 * Super Investor Holdings Ingestion
 * ----------------------------------
 * Rebuilt 2026-09-26. The original design scanned BSE's per-company
 * shareholding API for tracked investor names — permanently blocked, this
 * server's IP gets redirected to BSE's error page (see prior header comment,
 * preserved in git history). Scoped and rebuilt against NSE's own
 * shareholding-pattern filings instead: same regulatory disclosure, but NSE
 * is reachable from this server.
 *
 * Two-step per company, same shape as the insider-trading rebuild:
 *   1. `/api/corporate-share-holdings-master?index=equities&symbol=X` — a
 *      cheap filing INDEX (recent quarters, each with a `date` and an `xbrl`
 *      document link). filings[0] is the most recent.
 *   2. The linked XBRL document (~1-2 MB) — genuine dimensional XBRL, not a
 *      human-readable table like the insider-trading filings. Parsed by
 *      `parseShareholdingXbrl` (src/lib/scrapers/nse-shareholding-xbrl.ts).
 *      Verified against a real live filing (Titan, 2026-06-30 quarter):
 *      "Rekha Jhunjhunwala" appears across two entries summing to ~5.31%,
 *      matching the ~5.35% figure already on record from other sources.
 *
 * Step 2 is expensive at scale (500 companies × ~1-2 MB), so
 * `CompanyShareholdingSync` tracks the last filing date already parsed per
 * company — the cheap index check runs for every company every time, but the
 * XBRL fetch+parse only happens when a genuinely NEW quarterly filing
 * exists. A per-run cap on NEW filings (not on the cheap index checks) keeps
 * any single run bounded; a full first-time backfill across 500 companies
 * needs several runs (same pattern as the insider-trading backlog).
 *
 * Schedule: monthly on the 15th (BSE/NSE filings lag quarter-end by ~45
 * days) — matches steady-state filing cadence. Also manually triggerable
 * from /sup-min/ingestion; trigger repeatedly to work through an initial
 * backlog faster than the monthly schedule would.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { fetchNseArray } from "@/lib/nse-session";
import { parseShareholdingXbrl, parseAsOnDate } from "@/lib/scrapers/nse-shareholding-xbrl";

const MAX_NEW_FILINGS_PER_RUN = parseInt(process.env.SUPER_INVESTOR_MAX_NEW_PER_RUN ?? "100", 10);
const MAX_WALL_MS = 25 * 60 * 1000;
const XBRL_FETCH_TIMEOUT_MS = 20000;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Name tokens to match for each investor (filings spell names various ways)
const INVESTOR_MATCHERS: Record<
  string,
  { tokens: string[]; entityNames?: string[] }
> = {
  "rekha-jhunjhunwala": {
    tokens: ["rekha", "jhunjhunwala"],
    entityNames: ["rare enterprises", "rare family"],
  },
  "radhakishan-damani": {
    tokens: ["radhakishan", "damani"],
    entityNames: ["avenue supermarts", "bright star"],
  },
  "ashish-kacholia": {
    tokens: ["ashish", "kacholia"],
    entityNames: ["lucky securities"],
  },
  "vijay-kedia": {
    tokens: ["vijay", "kedia"],
    entityNames: ["kedia securities"],
  },
  "dolly-khanna": {
    tokens: ["dolly", "khanna"],
    entityNames: ["rajiv khanna"],
  },
  "mukul-agrawal": {
    tokens: ["mukul", "agrawal"],
  },
  "akash-bhanshali": {
    tokens: ["akash", "bhanshali"],
    entityNames: ["value quest"],
  },
  "sunil-singhania": {
    tokens: ["sunil", "singhania"],
    entityNames: ["abakkus"],
  },
  "porinju-veliyath": {
    tokens: ["porinju", "veliyath"],
    entityNames: ["equity intelligence"],
  },
  "ashish-dhawan": {
    tokens: ["ashish", "dhawan"],
    entityNames: ["chryscapital"],
  },
  "ramesh-damani": {
    tokens: ["ramesh", "damani"],
  },
  "madhusudan-kela": {
    tokens: ["madhusudan", "kela"],
  },
  "anil-goel": {
    tokens: ["anil", "goel", "kumar goel"],
  },
  "hiren-ved": {
    tokens: ["hiren", "ved"],
    entityNames: ["alchemy capital"],
  },
  "basant-maheshwari": {
    tokens: ["basant", "maheshwari"],
    entityNames: ["the equity desk"],
  },
};

function matchInvestor(holderName: string): string | null {
  const lower = holderName.toLowerCase();
  for (const [slug, { tokens, entityNames }] of Object.entries(INVESTOR_MATCHERS)) {
    if (tokens.every((t) => lower.includes(t))) return slug;
    if (entityNames?.some((e) => lower.includes(e.toLowerCase()))) return slug;
  }
  return null;
}

/** Indian FY quarter label, e.g. "Q1FY27", for an arbitrary date (not just "today"). */
function quarterLabelFor(d: Date): string {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  if (month >= 4 && month <= 6) return `Q1FY${String(year + 1).slice(2)}`;
  if (month >= 7 && month <= 9) return `Q2FY${String(year + 1).slice(2)}`;
  if (month >= 10 && month <= 12) return `Q3FY${String(year + 1).slice(2)}`;
  return `Q4FY${String(year).slice(2)}`;
}

function prevQuarter(q: string): string {
  const match = q.match(/Q(\d)FY(\d{2})/);
  if (!match) return q;
  const qn = parseInt(match[1]);
  const fy = parseInt(match[2]);
  if (qn === 1) return `Q4FY${String(fy - 1).padStart(2, "0")}`;
  return `Q${qn - 1}FY${fy.toString().padStart(2, "0")}`;
}

interface ShpFiling {
  date?: string; // "30-JUN-2026"
  xbrl?: string;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** "30-JUN-2026" (NSE's filing-index date format — note uppercase month). */
function parseFilingDate(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})-(\w{3})-(\d{4})$/);
  if (!m) return null;
  const mon = MONTHS[m[2].toLowerCase()];
  if (mon === undefined) return null;
  return new Date(Date.UTC(parseInt(m[3], 10), mon, parseInt(m[1], 10)));
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function ingestSuperInvestorHoldings(): Promise<IngestionResult> {
  const startedAt = Date.now();

  const companies = await prisma.company.findMany({
    where: { nseSymbol: { not: null }, active: true },
    select: { id: true, nseSymbol: true, marketCap: true },
    orderBy: { marketCap: "desc" },
    take: 500,
  });

  let rowsIn = 0;
  let errors = 0;
  let newFilingsProcessed = 0;
  let skippedUnchanged = 0;
  let timedOut = false;

  for (const co of companies) {
    if (Date.now() - startedAt > MAX_WALL_MS) {
      timedOut = true;
      break;
    }
    if (newFilingsProcessed >= MAX_NEW_FILINGS_PER_RUN) break;
    if (!co.nseSymbol) continue;

    try {
      const filings = await fetchNseArray<ShpFiling>(
        `/api/corporate-share-holdings-master?index=equities&symbol=${encodeURIComponent(co.nseSymbol)}`,
      );
      const latest = filings[0];
      if (!latest?.xbrl) {
        continue;
      }
      const filingDate = parseFilingDate(latest.date);

      const sync = await prisma.companyShareholdingSync.findUnique({ where: { companyId: co.id } });
      if (sync && filingDate && sync.lastFilingDate.getTime() === filingDate.getTime()) {
        skippedUnchanged++;
        continue; // no new quarterly filing since we last parsed this company
      }

      const res = await fetch(latest.xbrl, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(XBRL_FETCH_TIMEOUT_MS) });
      if (!res.ok) {
        errors++;
        continue;
      }
      const xml = await res.text();
      const facts = parseShareholdingXbrl(xml);
      const asOn = parseAsOnDate(xml) ?? filingDate ?? new Date();
      const quarter = quarterLabelFor(asOn);
      const prevQ = prevQuarter(quarter);

      // Sum multi-folio holdings for the same investor within this company
      // (verified live: Rekha Jhunjhunwala appears as 2 separate entries for
      // the same company).
      const byInvestor = new Map<string, { shares: number; pct: number }>();
      for (const f of facts) {
        const slug = matchInvestor(f.name);
        if (!slug) continue;
        const cur = byInvestor.get(slug) ?? { shares: 0, pct: 0 };
        cur.shares += f.shares ?? 0;
        cur.pct += (f.pct ?? 0) * 100; // filing stores a 0-1 fraction, not a %
        byInvestor.set(slug, cur);
      }

      for (const [slug, agg] of byInvestor) {
        const prevHolding = await prisma.superInvestorHolding.findUnique({
          where: { investorSlug_companyId_quarter: { investorSlug: slug, companyId: co.id, quarter: prevQ } },
          select: { pctHeld: true },
        });
        let qoqChange: string;
        if (!prevHolding) {
          qoqChange = "new";
        } else {
          const diff = agg.pct - Number(prevHolding.pctHeld);
          qoqChange = Math.abs(diff) < 0.01 ? "same" : diff > 0 ? "added" : "reduced";
        }
        const valueCr = co.marketCap ? (Number(co.marketCap) * agg.pct) / 100 : null;

        await prisma.superInvestorHolding.upsert({
          where: { investorSlug_companyId_quarter: { investorSlug: slug, companyId: co.id, quarter } },
          create: {
            investorSlug: slug, companyId: co.id, quarter,
            pctHeld: agg.pct, sharesHeld: BigInt(Math.round(agg.shares)),
            valueCr: valueCr ?? undefined, qoqChange,
          },
          update: {
            pctHeld: agg.pct, sharesHeld: BigInt(Math.round(agg.shares)),
            valueCr: valueCr ?? undefined, qoqChange,
          },
        });
        rowsIn++;
      }

      await prisma.companyShareholdingSync.upsert({
        where: { companyId: co.id },
        create: { companyId: co.id, lastFilingDate: filingDate ?? asOn },
        update: { lastFilingDate: filingDate ?? asOn },
      });
      newFilingsProcessed++;
      await sleep(300); // be polite to NSE's archive host
    } catch {
      errors++;
    }
  }

  return {
    rowsIn,
    rowsError: errors,
    notes:
      `${newFilingsProcessed} companies had a new filing parsed (${rowsIn} holdings upserted), ` +
      `${skippedUnchanged} unchanged (skipped), ${errors} errors` +
      (timedOut ? ` — stopped early at wall-time cap ${MAX_WALL_MS}ms` : ""),
  };
}
