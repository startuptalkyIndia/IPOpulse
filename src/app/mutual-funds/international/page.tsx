export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "India-Listed International Mutual Funds — US & global ETFs you can buy without LRS",
  description:
    "Compare India-listed international mutual funds and ETFs: Motilal NASDAQ 100, Mirae S&P 500, Franklin FTSE US, Parag Parikh Flexi Cap. NAV, returns, tax treatment, vs direct LRS.",
  alternates: { canonical: "/mutual-funds/international" },
};

// Curated list of India-listed international funds by AMFI scheme code.
// These are updated from AMFI's NAVAll.txt which we already ingest daily.
const INTL_FUND_CODES = [
  // NASDAQ / US focused
  "119579", // Motilal Oswal NASDAQ 100 FOF
  "145552", // Mirae Asset NYSE FANG+ ETF FOF
  "120503", // Franklin India Feeder - Franklin US Opportunities
  "119598", // ICICI Prudential US Bluechip Equity Fund
  "119775", // Edelweiss US Technology Equity FOF
  // S&P 500 / Broad US
  "120828", // Mirae Asset S&P 500 Top 50 ETF FoF
  "148935", // Navi US Total Stock Market FoF
  "148622", // DSP US Flexible Equity Fund
  // Global diversified
  "119815", // PGIM India Global Equity Opportunities Fund
  "122639", // ABSL Global Excellence Equity FoF
  "148754", // Kotak NASDAQ 100 FoF
  "148830", // Axis NASDAQ 100 FoF
];

const FUND_META: Record<string, { shortName: string; index: string; geography: string; expenseNote: string }> = {
  "119579": { shortName: "Motilal NASDAQ 100 FoF", index: "NASDAQ 100", geography: "USA Tech", expenseNote: "~0.50% TER" },
  "145552": { shortName: "Mirae FANG+ ETF FoF", index: "NYSE FANG+", geography: "USA Tech (10 stocks)", expenseNote: "~0.65% TER" },
  "120503": { shortName: "Franklin US Opportunities", index: "Russell 3000 (active)", geography: "USA Broad", expenseNote: "~1.3% TER (active)" },
  "119598": { shortName: "ICICI US Bluechip", index: "S&P 500 (active subset)", geography: "USA Large cap", expenseNote: "~1.3% TER (active)" },
  "119775": { shortName: "Edelweiss US Tech", index: "NASDAQ 100 (active)", geography: "USA Tech", expenseNote: "~1.2% TER" },
  "120828": { shortName: "Mirae S&P 500 Top 50 FoF", index: "S&P 500 Top 50", geography: "USA Large cap", expenseNote: "~0.20% TER" },
  "148935": { shortName: "Navi US Total Stock", index: "Total Market", geography: "USA All-cap", expenseNote: "~0.06% TER (cheapest)" },
  "148622": { shortName: "DSP US Flexible Equity", index: "Active US", geography: "USA Mixed", expenseNote: "~1.5% TER (active)" },
  "119815": { shortName: "PGIM Global Equity", index: "Global (ex-India)", geography: "Global", expenseNote: "~1.2% TER (active)" },
  "122639": { shortName: "ABSL Global Excellence", index: "Global Large cap", geography: "Global", expenseNote: "~0.9% TER" },
  "148754": { shortName: "Kotak NASDAQ 100 FoF", index: "NASDAQ 100", geography: "USA Tech", expenseNote: "~0.30% TER" },
  "148830": { shortName: "Axis NASDAQ 100 FoF", index: "NASDAQ 100", geography: "USA Tech", expenseNote: "~0.30% TER" },
};

export default async function InternationalFundsPage() {
  const funds = await prisma.mutualFund.findMany({
    where: { schemeCode: { in: INTL_FUND_CODES }, active: true },
    orderBy: { schemeName: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          India-Listed International Funds
        </h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Buy US market exposure in ₹ — no LRS, no TCS, no forex conversion friction. These mutual
          funds and FoFs invest in US/global indices and can be purchased like any Indian mutual fund.
          Tax treatment since April 2023: taxed as <strong>debt funds</strong> at slab rate regardless
          of holding period.
        </p>
      </div>

      {/* LRS vs India-listed comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card border-indigo-200">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">India-listed international funds</h3>
          <ul className="text-xs text-gray-700 space-y-1.5">
            <li>✓ No LRS, no TCS — invest in ₹ like any SIP</li>
            <li>✓ SEBI-regulated, AMFI data, easy rebalancing</li>
            <li>✓ Accessible via Zerodha, Groww, any demat</li>
            <li>✗ Taxed as debt (slab rate, any holding period) — high for 30% bracket</li>
            <li>✗ FoF adds layer cost (underlying fund TER + India FoF TER)</li>
            <li>✗ NAV premium/discount possible for ETF route</li>
          </ul>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Direct LRS (Vested / Stockal)</h3>
          <ul className="text-xs text-gray-700 space-y-1.5">
            <li>✓ LTCG 12.5% after 24 months (better than slab)</li>
            <li>✓ Access exact ETFs (VOO, QQQ, SCHD)</li>
            <li>✓ USD denomination — direct forex benefit</li>
            <li>✗ TCS 20% on remittances above ₹7L (reclaim in ITR)</li>
            <li>✗ LRS compliance, Form A2 at bank</li>
            <li>✗ USD 250K annual cap</li>
          </ul>
        </div>
      </div>

      {/* Fund table */}
      {funds.length === 0 ? (
        <div className="card text-center py-10 text-sm text-gray-500">
          AMFI fund data loading. International fund NAVs update automatically once the AMFI ingestion runs.
          <br />
          If scheme codes aren't matching yet, the AMFI cron will populate them on next run.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase text-left">
                  <th className="px-3 py-3">Fund</th>
                  <th className="px-3 py-3">Index / Strategy</th>
                  <th className="px-3 py-3">Geography</th>
                  <th className="px-3 py-3 text-right">NAV</th>
                  <th className="px-3 py-3">NAV as of</th>
                  <th className="px-3 py-3">Cost note</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((f) => {
                  const meta = FUND_META[f.schemeCode];
                  return (
                    <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm">
                        <Link href={`/mutual-funds/${f.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {meta?.shortName ?? f.schemeName}
                        </Link>
                        <div className="text-[11px] text-gray-400 mt-0.5">{f.amc}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-700">{meta?.index ?? "—"}</td>
                      <td className="px-3 py-3 text-xs text-gray-600">{meta?.geography ?? "—"}</td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">₹{Number(f.nav).toFixed(4)}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(f.navAsOf)}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{meta?.expenseNote ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <section className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Tax treatment — post April 2023</h2>
        <div className="text-sm text-gray-700 space-y-2">
          <p>All international mutual funds (including FoFs investing in US ETFs) lost their debt-fund indexation benefit in April 2023. They are now taxed at your <strong>slab rate</strong> (10/20/30%) on any gains, regardless of holding period. This is a significant change that makes them less tax-efficient than direct LRS investing for investors in the 30% bracket holding for 2+ years.</p>
          <p>For investors in the 10–20% slab, or those with short-to-medium holding periods, India-listed international funds remain competitive because of the simplicity advantage — no bank remittance paperwork, no TCS, no LRS tracking.</p>
          <p>
            <strong>Bottom line:</strong> Use our{" "}
            <Link href="/calculators/usd-returns" className="text-indigo-600 hover:underline">USD returns calculator</Link>
            {" "}to model: at your income tax slab, and expected USD return + INR depreciation, which route gives you more after-tax corpus at your intended holding period?
          </p>
        </div>
      </section>
    </div>
  );
}
