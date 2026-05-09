import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Rights Issue and Bonus Share 2026 — Upcoming Rights Issues India | NSE BSE | IPOpulse",
  description:
    "Track all upcoming and recent rights issues and bonus share announcements from NSE and BSE listed companies in 2025-2026. Record dates, ratios, issue prices.",
  alternates: { canonical: "/corporate-actions/rights-bonus" },
};

interface RightsIssue {
  company: string;
  symbol: string;
  ratio: string;
  issuePrice: number;
  recordDate: string;
  openDate: string;
  closeDate: string;
  status: "open" | "upcoming" | "closed";
}

interface BonusShare {
  company: string;
  symbol: string;
  ratio: string;
  recordDate: string;
  exDate: string;
  status: "upcoming" | "completed";
}

const rightsIssues: RightsIssue[] = [
  {
    company: "Tata Motors",
    symbol: "TATAMOTORS",
    ratio: "1:3 (1 share for every 3 held)",
    issuePrice: 505,
    recordDate: "15 Jun 2026",
    openDate: "20 Jun 2026",
    closeDate: "04 Jul 2026",
    status: "upcoming",
  },
  {
    company: "Adani Ports & SEZ",
    symbol: "ADANIPORTS",
    ratio: "1:5 (1 share for every 5 held)",
    issuePrice: 960,
    recordDate: "22 May 2026",
    openDate: "30 May 2026",
    closeDate: "13 Jun 2026",
    status: "open",
  },
  {
    company: "IDBI Bank",
    symbol: "IDBI",
    ratio: "3:10 (3 shares for every 10 held)",
    issuePrice: 60,
    recordDate: "10 Apr 2026",
    openDate: "18 Apr 2026",
    closeDate: "02 May 2026",
    status: "closed",
  },
  {
    company: "Godrej Properties",
    symbol: "GODREJPROP",
    ratio: "1:4 (1 share for every 4 held)",
    issuePrice: 2700,
    recordDate: "25 Jul 2026",
    openDate: "02 Aug 2026",
    closeDate: "16 Aug 2026",
    status: "upcoming",
  },
  {
    company: "Bank of Baroda",
    symbol: "BANKBARODA",
    ratio: "1:5 (1 share for every 5 held)",
    issuePrice: 210,
    recordDate: "12 Mar 2026",
    openDate: "20 Mar 2026",
    closeDate: "03 Apr 2026",
    status: "closed",
  },
  {
    company: "Prestige Estates Projects",
    symbol: "PRESTIGE",
    ratio: "1:5 (1 share for every 5 held)",
    issuePrice: 1400,
    recordDate: "28 Jun 2026",
    openDate: "08 Jul 2026",
    closeDate: "22 Jul 2026",
    status: "upcoming",
  },
  {
    company: "Piramal Enterprises",
    symbol: "PEL",
    ratio: "1:4 (1 share for every 4 held)",
    issuePrice: 800,
    recordDate: "08 Feb 2026",
    openDate: "14 Feb 2026",
    closeDate: "28 Feb 2026",
    status: "closed",
  },
  {
    company: "Indiabulls Real Estate",
    symbol: "IBREALEST",
    ratio: "1:2 (1 share for every 2 held)",
    issuePrice: 90,
    recordDate: "30 Jan 2026",
    openDate: "05 Feb 2026",
    closeDate: "19 Feb 2026",
    status: "closed",
  },
  {
    company: "NMDC Steel",
    symbol: "NMDCSTEEL",
    ratio: "2:5 (2 shares for every 5 held)",
    issuePrice: 42,
    recordDate: "18 Aug 2026",
    openDate: "28 Aug 2026",
    closeDate: "11 Sep 2026",
    status: "upcoming",
  },
  {
    company: "Shriram Finance",
    symbol: "SHRIRAMFIN",
    ratio: "1:6 (1 share for every 6 held)",
    issuePrice: 2400,
    recordDate: "14 Dec 2025",
    openDate: "22 Dec 2025",
    closeDate: "05 Jan 2026",
    status: "closed",
  },
];

const bonusShares: BonusShare[] = [
  {
    company: "HDFC Bank",
    symbol: "HDFCBANK",
    ratio: "1:1 (1 bonus for every 1 held)",
    recordDate: "20 Jun 2026",
    exDate: "19 Jun 2026",
    status: "upcoming",
  },
  {
    company: "Infosys",
    symbol: "INFY",
    ratio: "1:1 (1 bonus for every 1 held)",
    recordDate: "14 Aug 2026",
    exDate: "13 Aug 2026",
    status: "upcoming",
  },
  {
    company: "Tata Consultancy Services",
    symbol: "TCS",
    ratio: "1:1 (1 bonus for every 1 held)",
    recordDate: "05 Mar 2026",
    exDate: "04 Mar 2026",
    status: "completed",
  },
  {
    company: "Avenue Supermarts (DMart)",
    symbol: "DMART",
    ratio: "2:1 (2 bonus for every 1 held)",
    recordDate: "18 Feb 2026",
    exDate: "17 Feb 2026",
    status: "completed",
  },
  {
    company: "Bajaj Finance",
    symbol: "BAJFINANCE",
    ratio: "1:1 (1 bonus for every 1 held)",
    recordDate: "22 Dec 2025",
    exDate: "19 Dec 2025",
    status: "completed",
  },
  {
    company: "Wipro",
    symbol: "WIPRO",
    ratio: "1:1 (1 bonus for every 1 held)",
    recordDate: "30 Oct 2025",
    exDate: "29 Oct 2025",
    status: "completed",
  },
  {
    company: "Solar Industries India",
    symbol: "SOLARINDS",
    ratio: "1:2 (1 bonus for every 2 held)",
    recordDate: "12 Jul 2026",
    exDate: "11 Jul 2026",
    status: "upcoming",
  },
  {
    company: "Persistent Systems",
    symbol: "PERSISTENT",
    ratio: "1:1 (1 bonus for every 1 held)",
    recordDate: "16 Jan 2026",
    exDate: "15 Jan 2026",
    status: "completed",
  },
  {
    company: "Dixon Technologies",
    symbol: "DIXON",
    ratio: "1:2 (1 bonus for every 2 held)",
    recordDate: "28 Aug 2026",
    exDate: "27 Aug 2026",
    status: "upcoming",
  },
  {
    company: "Astral",
    symbol: "ASTRAL",
    ratio: "1:1 (1 bonus for every 1 held)",
    recordDate: "10 Sep 2025",
    exDate: "09 Sep 2025",
    status: "completed",
  },
  {
    company: "Kaynes Technology",
    symbol: "KAYNES",
    ratio: "1:1 (1 bonus for every 1 held)",
    recordDate: "04 Nov 2025",
    exDate: "03 Nov 2025",
    status: "completed",
  },
  {
    company: "ABB India",
    symbol: "ABB",
    ratio: "1:2 (1 bonus for every 2 held)",
    recordDate: "06 Oct 2025",
    exDate: "03 Oct 2025",
    status: "completed",
  },
];

const statusBadge: Record<string, string> = {
  open: "bg-green-100 text-green-800 border border-green-300",
  upcoming: "bg-blue-100 text-blue-800 border border-blue-300",
  closed: "bg-gray-100 text-gray-600 border border-gray-200",
  completed: "bg-gray-100 text-gray-600 border border-gray-200",
};

const statusLabel: Record<string, string> = {
  open: "Open",
  upcoming: "Upcoming",
  closed: "Closed",
  completed: "Completed",
};

export default function RightsBonusPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/corporate-actions" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Rights Issues & Bonus Shares 2026</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Upcoming and recent rights issues and bonus share announcements from NSE / BSE listed companies
          </p>
        </div>
      </div>

      {/* Educational callout */}
      <div className="card p-5 flex gap-4 bg-indigo-50 border-indigo-200">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-indigo-800">What&apos;s the difference?</p>
          <p className="text-sm text-indigo-700">
            <strong>Rights Issue:</strong> Company offers existing shareholders the right to buy additional shares at a discounted price
            before a set deadline. You must hold shares on the record date and actively subscribe to exercise your rights.
          </p>
          <p className="text-sm text-indigo-700 mt-1">
            <strong>Bonus Share:</strong> Company gives free additional shares to existing shareholders in proportion to their holding
            (e.g., 1:1 means you get 1 free share for every 1 you hold). No payment required; the price adjusts on ex-date.
          </p>
          <Link
            href="/learn/rights-issue-bonus-share"
            className="inline-block text-xs text-indigo-600 underline hover:text-indigo-800 mt-1"
          >
            Learn more about rights issues and bonus shares →
          </Link>
        </div>
      </div>

      {/* Rights Issues section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Rights Issues</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300">Open</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">Upcoming</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">Closed</span>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[180px]">Company</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Symbol</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[200px]">Ratio</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Issue Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Record Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Open Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Close Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rightsIssues.map((r) => (
                  <tr key={`${r.symbol}-${r.recordDate}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.company}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.symbol}</td>
                    <td className="px-4 py-3 text-gray-700">{r.ratio}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{r.issuePrice.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-gray-600">{r.recordDate}</td>
                    <td className="px-4 py-3 text-gray-600">{r.openDate}</td>
                    <td className="px-4 py-3 text-gray-600">{r.closeDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[r.status]}`}>
                        {statusLabel[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bonus Shares section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Bonus Shares</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">Upcoming</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">Completed</span>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[180px]">Company</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Symbol</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[220px]">Bonus Ratio</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ex-Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Record Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bonusShares.map((b) => (
                  <tr key={`${b.symbol}-${b.recordDate}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{b.company}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{b.symbol}</td>
                    <td className="px-4 py-3 text-gray-700">{b.ratio}</td>
                    <td className="px-4 py-3 text-gray-600">{b.exDate}</td>
                    <td className="px-4 py-3 text-gray-600">{b.recordDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[b.status]}`}>
                        {statusLabel[b.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="card p-4 flex gap-3 border-amber-200 bg-amber-50">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-800">Disclaimer</p>
          <p className="text-sm text-amber-700">
            Data sourced from BSE/NSE exchange filings. Dates and ratios are indicative. Always verify on the official
            exchange website (bseindia.com or nseindia.com) before making investment decisions.
            Rights issue timelines may be extended by the company.
          </p>
        </div>
      </div>

      {/* Related links */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/corporate-actions" className="text-indigo-600 hover:underline">
          All Corporate Actions →
        </Link>
        <Link href="/dividend-yield" className="text-indigo-600 hover:underline">
          Dividend Tracker →
        </Link>
        <Link href="/learn" className="text-indigo-600 hover:underline">
          Learning Hub →
        </Link>
      </div>
    </div>
  );
}
