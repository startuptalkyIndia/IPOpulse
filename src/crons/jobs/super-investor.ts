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

async function fetchBseHolders(bseCode: string): Promise<BseHolder[]> {
  // BSE public shareholding API — returns individual holders ≥1% (disclosed names)
  const url = `https://api.bseindia.com/BseIndiaAPI/api/ShareHoldings/w?scripCode=${bseCode}`;
  const res = await fetch(url, { headers: BSE_HEADERS, signal: AbortSignal.timeout(12000) });
  if (!res.ok) return [];
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
    } catch {
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
