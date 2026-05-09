export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, BookOpen, Search, Users, Mic } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Market Research — AI-powered tools for Indian equities",
  description:
    "AI-powered research hub for Indian equities. Next-day market preview, daily market summary, DRHP AI search, promoter check, concall analysis — all in one place.",
  alternates: { canonical: "/research" },
};

const sentimentBadge: Record<string, string> = {
  bullish:  "badge-live",
  positive: "badge-live",
  neutral:  "badge-info",
  cautious: "badge-warning",
  bearish:  "badge-closed",
};

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ResearchHubPage() {
  let nextDay = null;
  let dailySummary = null;

  try {
    nextDay = await prisma.nextDayPreview.findFirst({ orderBy: { forDate: "desc" } });
    dailySummary = await prisma.marketSummary.findFirst({ orderBy: { date: "desc" } });
  } catch {
    // fine at build time when DB may be unreachable
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Hub</h1>
        <p className="text-gray-500 max-w-2xl">
          AI-powered tools to help you research Indian equities — from next-day market previews to
          DRHP deep-dives and promoter background checks.
        </p>
      </div>

      {/* AI Signals */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Market Signals</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Next-Day Preview */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                Tomorrow&apos;s Watch List
              </span>
            </div>
            {nextDay ? (
              <>
                <p className="text-sm font-semibold text-gray-900 leading-snug">
                  {nextDay.headline}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {nextDay.sentiment && (
                    <span className={`badge ${sentimentBadge[nextDay.sentiment] ?? "badge-info"}`}>
                      {nextDay.sentiment.charAt(0).toUpperCase() + nextDay.sentiment.slice(1)}
                    </span>
                  )}
                  {nextDay.sectorFocus && (
                    <span className="badge badge-info">{nextDay.sectorFocus}</span>
                  )}
                  <span className="text-xs text-gray-400">For {fmtDate(nextDay.forDate)}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No preview available yet. Check back after 8 PM IST.</p>
            )}
            <Link
              href="/research/next-day"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 mt-auto"
            >
              View full preview <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Daily Market Summary */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                Daily Market Wrap
              </span>
            </div>
            {dailySummary ? (
              <>
                <p className="text-sm font-semibold text-gray-900 leading-snug">
                  {dailySummary.headline}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {dailySummary.sentiment && (
                    <span
                      className={`badge ${sentimentBadge[dailySummary.sentiment] ?? "badge-info"}`}
                    >
                      {dailySummary.sentiment.charAt(0).toUpperCase() +
                        dailySummary.sentiment.slice(1)}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{fmtDate(dailySummary.date)}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No summary available yet. Check back after market close.</p>
            )}
            <Link
              href="/daily-summary"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 mt-auto"
            >
              View full summary <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Research Tools */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Research Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/ipo/drhp" className="card hover:border-indigo-300 hover:shadow-sm transition flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">DRHP AI Search</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ask questions about IPO draft prospectuses using AI.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 mt-auto">
              Open tool <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link href="/tools/promoter-check" className="card hover:border-indigo-300 hover:shadow-sm transition flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Promoter Check</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Verify promoter background and shareholding history.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 mt-auto">
              Open tool <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link href="/tools/concall-summary" className="card hover:border-indigo-300 hover:shadow-sm transition flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Concall AI</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Summarise and query earnings call transcripts with AI.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 mt-auto">
              Open tool <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
