/**
 * Super Investor Holdings Ingestion
 * ----------------------------------
 * Fetches quarterly shareholding data from BSE for companies known to be held
 * by tracked super investors. Matches holder names, stores in DB.
 *
 * BSE Shareholding API returns all non-promoter individual holders ≥ 1% of
 * a company. We look for our investor name tokens in those results.
 *
 * Schedule: Monthly on 15th (BSE filings lag quarter-end by ~45 days)
 * Also manually triggerable from /sup-min/ingestion
 *
 * ⚠️ CURRENTLY BLOCKED (verified 2026-08-19): api.bseindia.com refuses this
 * server's cloud IP — it answers with a 302 to its own error page rather than a
 * 4xx, even with browser headers and a warmed cookie jar. (Plain
 * www.bseindia.com file downloads still work, which is why bse_bhavcopy and
 * bse_listing_sync are healthy; only the API host is blocked.) This job has
 * therefore never ingested a single row: May and June 2026 recorded "success"
 * with 0 rows, July and August recorded "all 500 rows errored".
 *
 * Until a reachable source replaces BSE, the job aborts on the first blocked
 * response instead of spending ~3.5 minutes issuing 500 requests that cannot
 * succeed, and it says why in the failure so the heartbeat reports the real
 * cause. Restoring the feature needs a different source (screener.in and
 * moneycontrol both answer this server) or an India residential proxy — a
 * scoped piece of work, not a retry.
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

const BSE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  Referer: "https://www.bseindia.com/",
  Origin: "https://www.bseindia.com",
};

// Name tokens to match for each investor (BSE uses various name forms)
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
    // All tokens must appear in the name
    if (tokens.every((t) => lower.includes(t))) return slug;
    // OR any entity name matches
    if (entityNames?.some((e) => lower.includes(e.toLowerCase()))) return slug;
  }
  return null;
}

/** Current quarter label e.g. "Q4FY25" based on today's date */
function currentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  // Indian FY: Apr-Jun=Q1, Jul-Sep=Q2, Oct-Dec=Q3, Jan-Mar=Q4
  if (month >= 4 && month <= 6) return `Q1FY${String(year + 1).slice(2)}`;
  if (month >= 7 && month <= 9) return `Q2FY${String(year + 1).slice(2)}`;
  if (month >= 10 && month <= 12) return `Q3FY${String(year + 1).slice(2)}`;
  return `Q4FY${String(year).slice(2)}`; // Jan-Mar
}

/** Previous quarter label */
function prevQuarter(q: string): string {
  const match = q.match(/Q(\d)FY(\d{2})/);
  if (!match) return q;
  const qn = parseInt(match[1]);
  const fy = parseInt(match[2]);
  if (qn === 1) return `Q4FY${String(fy - 1).padStart(2, "0")}`;
  return `Q${qn - 1}FY${fy.toString().padStart(2, "0")}`;
}

interface BseHolder {
  HOLDER_NAME: string;
  NO_OF_SHARES: number;
  PERC_OF_TOTAL_SHARES: number;
}

/**
 * Raised when BSE is refusing this host outright — a whole-job condition, not a
 * per-company one, so it aborts the run instead of being counted as one of 500
 * identical failures.
 */
class BseBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BseBlockedError";
  }
}

async function fetchBseHolders(bseCode: string): Promise<BseHolder[]> {
  // BSE public shareholding API — returns individual holders ≥1% (disclosed names)
  const url = `https://api.bseindia.com/BseIndiaAPI/api/ShareHoldings/w?scripCode=${bseCode}`;
  // redirect:"manual" so the block stays visible: followed automatically, the
  // 302 lands on BSE's error page and arrives as a perfectly healthy-looking
  // 200 full of HTML, which is how this failed as an unexplained JSON parse
  // error 500 times in a row.
  const res = await fetch(url, { headers: BSE_HEADERS, redirect: "manual", signal: AbortSignal.timeout(12000) });
  if (res.status >= 300 && res.status < 400) {
    throw new BseBlockedError(
      `api.bseindia.com redirected to its error page (HTTP ${res.status}) — this server's IP is blocked, so no company can be fetched`,
    );
  }
  if (!res.ok) return [];
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    throw new BseBlockedError(
      `api.bseindia.com returned "${contentType || "no content-type"}" instead of JSON — blocked, or the API changed`,
    );
  }
  const json = await res.json();
  // Response shape: { Table: BseHolder[] } or { Table1: BseHolder[] }
  return (json?.Table ?? json?.Table1 ?? []) as BseHolder[];
}

export async function ingestSuperInvestorHoldings(): Promise<IngestionResult> {
  const quarter = currentQuarter();
  const prev = prevQuarter(quarter);

  // Fetch all companies with BSE codes (top 500 by market cap — where investors hold)
  const companies = await prisma.company.findMany({
    where: { bseCode: { not: null }, active: true },
    select: { id: true, bseCode: true, nseSymbol: true, name: true, marketCap: true },
    orderBy: { marketCap: "desc" },
    take: 500,
  });

  let rowsIn = 0;
  let errors = 0;

  for (let i = 0; i < companies.length; i++) {
    const co = companies[i];
    if (!co.bseCode) continue;

    try {
      const holders = await fetchBseHolders(co.bseCode);
      if (!holders.length) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      for (const h of holders) {
        const slug = matchInvestor(h.HOLDER_NAME);
        if (!slug) continue;

        // Look up previous quarter's holding to compute qoqChange
        const prevHolding = await prisma.superInvestorHolding.findUnique({
          where: { investorSlug_companyId_quarter: { investorSlug: slug, companyId: co.id, quarter: prev } },
          select: { pctHeld: true },
        });

        let qoqChange: string;
        if (!prevHolding) {
          qoqChange = "new";
        } else {
          const diff = h.PERC_OF_TOTAL_SHARES - Number(prevHolding.pctHeld);
          if (Math.abs(diff) < 0.01) qoqChange = "same";
          else if (diff > 0) qoqChange = "added";
          else qoqChange = "reduced";
        }

        // Estimate value in crore (market cap × pct held / 100)
        const valueCr =
          co.marketCap
            ? (Number(co.marketCap) * h.PERC_OF_TOTAL_SHARES) / 100
            : null;

        await prisma.superInvestorHolding.upsert({
          where: { investorSlug_companyId_quarter: { investorSlug: slug, companyId: co.id, quarter } },
          create: {
            investorSlug: slug,
            companyId: co.id,
            quarter,
            pctHeld: h.PERC_OF_TOTAL_SHARES,
            sharesHeld: BigInt(Math.round(h.NO_OF_SHARES)),
            valueCr: valueCr ?? undefined,
            qoqChange,
          },
          update: {
            pctHeld: h.PERC_OF_TOTAL_SHARES,
            sharesHeld: BigInt(Math.round(h.NO_OF_SHARES)),
            valueCr: valueCr ?? undefined,
            qoqChange,
          },
        });
        rowsIn++;
      }
    } catch (err) {
      // A block is not a per-company failure — every remaining company would
      // fail identically. Stop now and report the real reason.
      if (err instanceof BseBlockedError) {
        throw new Error(
          `${err.message}. Aborted after ${i} of ${companies.length} companies; ${rowsIn} holdings ingested.`,
        );
      }
      errors++;
    }

    // Polite rate limiting — 400ms between companies
    await new Promise((r) => setTimeout(r, 400));
  }

  return {
    rowsIn,
    rowsError: errors,
    notes: errors > 20 ? `${errors} companies failed BSE fetch` : undefined,
  };
}
