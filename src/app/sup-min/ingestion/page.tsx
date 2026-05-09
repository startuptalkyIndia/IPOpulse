export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { availableJobs } from "@/crons/scheduler";
import { TriggerJobButton } from "./TriggerJobButton";

const jobMeta: Record<string, { label: string; schedule: string; desc: string }> = {
  nse_fii_dii: {
    label: "NSE FII / DII (daily)",
    schedule: "Mon–Fri at 19:15 IST",
    desc: "Scrapes NSE's provisional FII/DII cash figures from /api/fiidiiTradeReact and upserts into fii_dii_daily.",
  },
  bse_ipos: {
    label: "BSE IPO pipeline (every 4h)",
    schedule: "Every 4 hours",
    desc: "HTML scraper of bseindia.com/markets/publicissues (mainboard + SME) that parses IPO dates, price band, issue size and upserts into the ipos table.",
  },
  amfi_navs: {
    label: "AMFI Mutual Fund NAVs (daily)",
    schedule: "Daily at 23:00 IST",
    desc: "Full refresh of every Indian mutual fund scheme's NAV from AMFI's public NAVAll.txt feed. Populates /mutual-funds.",
  },
  nse_bhavcopy: {
    label: "NSE EOD Bhavcopy (daily)",
    schedule: "Mon–Fri at 19:00 IST",
    desc: "Pulls full NSE end-of-day bhavcopy CSV (sec_bhavdata_full_DDMMYYYY.csv) from nsearchives.nseindia.com. Real OHLCV + delivery % for every NSE-listed company in our master. Replaces seed prices with live exchange data.",
  },
  bse_announcements: {
    label: "BSE Corporate Announcements (every 2h)",
    schedule: "Every 2h between 09:00–21:00 IST",
    desc: "Scrapes api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData. Captures every announcement, auto-detects corporate actions (dividend/split/bonus/rights/buyback/AGM/board meeting) and inserts into corporate_actions.",
  },
  daily_digest: {
    label: "Daily email digest (Mon–Fri 07:00 IST)",
    schedule: "Mon–Fri at 07:00 IST",
    desc: "Sends daily IPO digest email to verified newsletter subscribers. Covers live + upcoming IPOs and FII/DII flows. Requires RESEND_API_KEY.",
  },
  daily_market_summary: {
    label: "Daily market summary (Mon–Fri 16:30 IST)",
    schedule: "Mon–Fri at 16:30 IST",
    desc: "AI-generated EOD market wrap — top gainers/losers, FII/DII, sentiment. Stores in market_summaries table. Works via ANTHROPIC_API_KEY or Claude CLI.",
  },
  drhp_analyze: {
    label: "DRHP AI analysis (every 6h)",
    schedule: "Every 6 hours",
    desc: "Auto-extracts risk factors, governance flags, related-party transactions, peer comparables, and risk score from new DRHP/RHP filings. Cap: DRHP_MAX_PER_RUN (default 3) per run. Works via ANTHROPIC_API_KEY or Claude CLI.",
  },
  us_ipos: {
    label: "US IPO tracker — SEC EDGAR S-1 filings (every 6h)",
    schedule: "Every 6 hours",
    desc: "Fetches recent S-1 filings from SEC EDGAR full-text search API. Populates /us-ipo. No auth required.",
  },
  us_adrs: {
    label: "US ADR prices — Yahoo Finance (Mon–Fri 22:00 IST)",
    schedule: "Mon–Fri at 22:00 IST",
    desc: "Fetches ADR closing prices for 12 Indian companies cross-listed on NYSE/NASDAQ via Yahoo Finance. Computes NSE vs ADR premium/discount. Populates /us-listing.",
  },
  yahoo_prices: {
    label: "Indian stock prices — Yahoo Finance (every 15 min, market hours)",
    schedule: "Every 15 min, 09:10–15:50 IST Mon–Fri",
    desc: "Fetches live prices for top 500 NSE stocks via Yahoo Finance batch quote API. ~15 min delayed. Free. Replaces Kite Connect. Populates screener + ticker pages.",
  },
  nse_bulk_block: {
    label: "NSE Bulk + Block deals (Mon–Fri 17:30 IST)",
    schedule: "Mon–Fri at 17:30 IST",
    desc: "Fetches last 30 days of bulk deals (>0.5% of company shares traded in one session) and block deals (pre-negotiated ≥₹10Cr trades) from NSE historical API. Populates /deals/bulk and /deals/block.",
  },
  nse_insider: {
    label: "NSE Insider trading / SAST disclosures (Mon–Fri 18:00 IST)",
    schedule: "Mon–Fri at 18:00 IST",
    desc: "Fetches SEBI SAST disclosures for top 200 companies — promoter, director, and KMP buy/sell/pledge events. Rate-limited (500ms between companies). Populates /insider-trading.",
  },
  super_investor: {
    label: "Super Investor holdings — BSE quarterly filings (monthly, 15th)",
    schedule: "Monthly on the 15th at 09:00 IST",
    desc: "Fetches BSE shareholding pattern for top 500 companies, matches holder names to our 15+ tracked investors, computes QoQ change, and upserts into super_investor_holdings. Trigger manually after every quarterly disclosure season (Jan/Apr/Jul/Oct).",
  },
  screener_fundamentals: {
    label: "Screener fundamentals — Yahoo Finance (Mon–Fri 22:30 IST)",
    schedule: "Mon–Fri at 22:30 IST",
    desc: "Fetches P/E, P/B, ROE, D/E, EPS, book value, and dividend yield for top 1,000 companies via Yahoo Finance quoteSummary API. Free, no auth. Powers the /screener filter columns.",
  },
  nse_indices: {
    label: "NSE Index daily data — Nifty 50 + 70 indices (Mon–Fri 16:00 IST)",
    schedule: "Mon–Fri at 16:00 IST",
    desc: "Downloads ind_close_all_DDMMYYYY.csv from NSE archives. 70+ indices with OHLC, Points/% change, Volume, Turnover, P/E, P/B, Dividend Yield. Powers homepage Nifty stats, sector P/E on sector pages, and the /indices page.",
  },
  next_day_preview: {
    label: "Next-Day Market Preview — AI watch list (Mon–Fri 20:30 IST)",
    schedule: "Mon–Fri at 20:30 IST",
    desc: "Generates an AI 'stocks to watch tomorrow' report using today's top movers, FII/DII flows, sector momentum, and upcoming IPO/corporate action events. Stored in next_day_previews, displayed at /research/next-day.",
  },
  nse_sector_map: {
    label: "NSE Sector Mapper — map sectors to all 2,500+ companies",
    schedule: "Run once (then monthly)",
    desc: "Downloads Nifty 500 + sector index CSVs and maps Industry/Sector to every company by NSE symbol. Unlocks screener sector filter and /sectors pages. Run after nse_company_master.",
  },
  bhavcopy_historical: {
    label: "Historical Bhavcopy Backfill — 6 months of price history",
    schedule: "Run once (manual trigger)",
    desc: "Fetches sec_bhavdata_full CSVs for past 130 trading days from NSE archives. Populates historical OHLCV data for stock charts. Takes ~5 min (1s delay between dates). Set BHAVCOPY_BACKFILL_DAYS env to limit.",
  },
  fii_dii_historical: {
    label: "Historical FII/DII Backfill — 2 years of flow data",
    schedule: "Run once (manual trigger)",
    desc: "Fetches month-by-month FII/DII cash flows from NSE historical API (same session-cookie approach as daily cron). Populates 2 years of FII/DII history for the flows chart at /fii-dii.",
  },
  nse_company_master: {
    label: "NSE Company Master — full equity listing (~2,600 companies)",
    schedule: "Monthly (run manually after first deploy)",
    desc: "Downloads NSE EQUITY_L.csv and upserts all listed companies into the companies table. Run this ONCE after first deploy to populate screener, movers, market breadth, and bulk/insider deal matching. Safe to re-run — only updates name/ISIN, never clobbers prices or fundamentals.",
  },
  bse_listing_sync: {
    label: "IPO listing price sync + GMP accuracy (Mon–Fri 20:00 IST)",
    schedule: "Mon–Fri at 20:00 IST",
    desc: "Finds newly-listed IPOs without an IpoListing record, matches them to BhavcopyDaily data for their listing day, calculates listing gain % vs issue price, captures last GMP as gmpAtListing, and stores gmpError. Powers the GMP Accuracy Scorecard at /ipo/gmp-accuracy.",
  },
};

export default async function AdminIngestionPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");

  const runs = await prisma.ingestionRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/sup-min/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Ingestion Runs</h1>
      <p className="text-sm text-gray-500 mb-6">Scheduled cron jobs and their run history. Manual trigger available per job.</p>

      {/* Jobs list */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Scheduled jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.keys(availableJobs).map((j) => {
            const meta = jobMeta[j] ?? { label: j, schedule: "—", desc: "" };
            return (
              <div key={j} className="card">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{meta.label}</h3>
                  <span className="text-[11px] text-indigo-600 font-mono">{j}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{meta.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Schedule: {meta.schedule}</span>
                  <TriggerJobButton job={j} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent runs</h2>
        {runs.length === 0 ? (
          <div className="card text-center py-8 text-sm text-gray-500">
            No ingestion runs yet. Trigger a job above to populate.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3">Job</th>
                  <th className="px-3 py-3">Started</th>
                  <th className="px-3 py-3">Duration</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Rows</th>
                  <th className="px-3 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => {
                  const ms = r.finishedAt ? r.finishedAt.getTime() - r.startedAt.getTime() : null;
                  const dur = ms == null ? "—" : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
                  const sc =
                    r.status === "success"
                      ? "bg-green-100 text-green-800"
                      : r.status === "running"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800";
                  return (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="px-3 py-2.5 text-sm font-mono text-gray-700">{r.jobName}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">
                        {new Intl.DateTimeFormat("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(r.startedAt)}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 tabular-nums">{dur}</td>
                      <td className="px-3 py-2.5">
                        <span className={`badge ${sc}`}>{r.status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">
                        {r.rowsIn ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">
                        {r.errorMsg ? <span className="text-red-600">{r.errorMsg.slice(0, 60)}</span> : r.notes ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
