/**
 * Insider trading / SAST disclosure ingestion from NSE.
 *
 * SEBI SAST (Substantial Acquisition of Shares and Takeovers) regulations
 * require promoters, directors, and KMPs to disclose every buy/sell/pledge.
 * NSE publishes these at:
 *   /api/corporate-insider?symbol=SYMBOL&from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * We batch over all active companies and ingest the last 30 days.
 * Rate-limited to avoid hammering NSE — 500ms between requests.
 *
 * Why this matters: promoter buy = highest conviction signal in Indian markets.
 *   A promoter spending their own money to buy more of their own stock —
 *   at market price, no discount — is the most bullish signal an investor can get.
 */

import { prisma } from "@/lib/db";
import { fetchNse } from "@/lib/nse-session";

interface NseSast {
  symbol?: string;
  company?: string;
  personName?: string;
  category?: string;
  noOfSharesAcq?: string | number;
  noOfSharesSale?: string | number;
  acquisitionValue?: string | number;
  saleValue?: string | number;
  preShareHolding?: string | number;
  postShareHolding?: string | number;
  transactionDate?: string;
  disclosureDate?: string;
  type?: string; // Acquisition / Sale / Pledge / Revoke
}

function parseNum(v: string | number | undefined): number {
  if (v == null) return 0;
  return parseFloat(String(v).replace(/,/g, "")) || 0;
}

export async function ingestInsiderTrades(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  const today = new Date();
  const from = new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const to = today.toISOString().slice(0, 10);

  // Fetch top 200 companies by market cap — insider trades for micro-caps
  // are less meaningful as signals
  const companies = await prisma.company.findMany({
    where: { active: true, nseSymbol: { not: null } },
    orderBy: { marketCap: "desc" },
    take: 200,
    select: { id: true, nseSymbol: true, name: true },
  });

  let inserted = 0;
  let errors = 0;
  let fetched = 0;

  for (const co of companies) {
    if (!co.nseSymbol) continue;
    try {
      const raw = await fetchNse<{ data?: NseSast[] } | NseSast[]>(
        `/api/corporate-insider?symbol=${co.nseSymbol}&from=${from}&to=${to}`
      );
      const items: NseSast[] = Array.isArray(raw) ? raw : (raw as { data?: NseSast[] }).data ?? [];
      fetched += items.length;

      for (const item of items) {
        try {
          const qty = BigInt(Math.round(parseNum(item.noOfSharesAcq ?? item.noOfSharesSale)));
          const tradeType = item.type?.toLowerCase().includes("sale") ? "Sell"
            : item.type?.toLowerCase().includes("pledge") ? "Pledge"
            : item.type?.toLowerCase().includes("revoke") ? "Revoke"
            : "Buy";
          const valueLakh = parseNum(item.acquisitionValue ?? item.saleValue);
          const date = new Date(item.transactionDate ?? item.disclosureDate ?? today.toISOString().slice(0, 10));
          if (isNaN(date.getTime())) continue;

          await prisma.insiderTrade.upsert({
            where: {
              date_exchange_symbol_acquirerName_tradeType_qty: {
                date,
                exchange: "NSE",
                symbol: co.nseSymbol!,
                acquirerName: item.personName ?? "Unknown",
                tradeType,
                qty,
              },
            },
            update: { valueLakh, postHoldingPct: parseNum(item.postShareHolding) },
            create: {
              date,
              exchange: "NSE",
              symbol: co.nseSymbol!,
              companyName: co.name,
              acquirerName: item.personName ?? "Unknown",
              acquirerType: item.category ?? "Other",
              securityType: "Equity",
              tradeType,
              qty,
              valueLakh,
              preHoldingPct: parseNum(item.preShareHolding),
              postHoldingPct: parseNum(item.postShareHolding),
              disclosureDate: item.disclosureDate ? new Date(item.disclosureDate) : null,
            },
          });
          inserted++;
        } catch { errors++; }
      }
      // Rate limit — 500ms between companies
      await new Promise((r) => setTimeout(r, 500));
    } catch { errors++; }
  }

  return {
    rowsIn: inserted,
    rowsError: errors,
    notes: `Insider trades: scanned ${companies.length} companies, found ${fetched} disclosures, upserted ${inserted}.`,
  };
}
