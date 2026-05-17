export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, Activity, BarChart2, Users, Bell } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Daily Indian Market Summary — Nifty, FII/DII, Gainers & Losers",
  description:
    "Today's Indian stock market at a glance — Nifty 50 levels, FII/DII flows, top gainers & losers, BSE announcements count. Updated daily after market close.",
  alternates: { canonical: "/daily-summary" },
};

interface Mover {
  name: string;
  slug: string;
  pct: number;
  close: number;
}

function fmtCr(val: number) {
  const abs = Math.abs(val);
  if (abs >= 100000) return `${(val / 100000).toFixed(2)}L Cr`;
  if (abs >= 1000) return `${(val / 1000).toFixed(2)}K Cr`;
  return `${val.toFixed(2)} Cr`;
}

function ChangeChip({ val, suffix = "" }: { val: number | null; suffix?: string }) {
  if (val == null) return <span className="text-gray-400">—</span>;
  const pos = val >= 0;
  return (
    <span className={`font-semibold tabular-nums ${pos ? "text-green-600" : "text-red-600"}`}>
      {pos ? "+" : ""}
      {val.toFixed(2)}
      {suffix}
    </span>
  );
}

export default async function DailySummaryPage() {
  // ── Parallel DB queries ──────────────────────────────────────────────────
  const [latest, recent, nifty50, bankNifty, fiiDiiRows, announcementCount] = await Promise.all([
    prisma.marketSummary.findFirst({ orderBy: { date: "desc" } }),
    prisma.marketSummary.findMany({
      where: { date: { lt: new Date() } },
      orderBy: { date: "desc" },
      take: 7,
      select: { date: true, headline: true, sentiment: true },
    }),
    prisma.niftyIndex.findFirst({
      where: { indexName: "Nifty 50" },
      orderBy: { date: "desc" },
    }),
    prisma.niftyIndex.findFirst({
      where: { indexName: "Nifty Bank" },
      orderBy: { date: "desc" },
    }),
    prisma.fiiDiiDaily.findMany({
      where: { segment: "cash" },
      orderBy: { date: "desc" },
      take: 1,
    }),
    prisma.announcement.count({
      where: {
        broadcastAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  // ── Bhavcopy: latest date + top movers ──────────────────────────────────
  const latestBhav = await prisma.bhavcopyDaily.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });

  let topBhavGainers: Array<{ companyId: number; close: Decimal; changePct: Decimal | null; company: { name: string; slug: string } }> = [];
  let topBhavLosers: Array<{ companyId: number; close: Decimal; changePct: Decimal | null; company: { name: string; slug: string } }> = [];

  if (latestBhav) {
    const [gainers, losers] = await Promise.all([
      prisma.$queryRaw<Array<{ id: number; company_name: string; slug: string; close: number; change_pct: number }>>`
        SELECT b.id, c.name AS company_name, c.slug, CAST(b.close AS FLOAT) AS close,
               CAST(((b.close - prev.close) / prev.close * 100) AS FLOAT) AS change_pct
        FROM bhavcopy_daily b
        JOIN companies c ON c.id = b.company_id
        JOIN bhavcopy_daily prev ON prev.company_id = b.company_id
          AND prev.date = (SELECT MAX(date) FROM bhavcopy_daily WHERE date < ${latestBhav.date} AND company_id = b.company_id AND source = b.source)
        WHERE b.date = ${latestBhav.date} AND b.source = 'bse'
          AND prev.close > 0 AND b.close > 10
        ORDER BY change_pct DESC
        LIMIT 5
      `,
      prisma.$queryRaw<Array<{ id: number; company_name: string; slug: string; close: number; change_pct: number }>>`
        SELECT b.id, c.name AS company_name, c.slug, CAST(b.close AS FLOAT) AS close,
               CAST(((b.close - prev.close) / prev.close * 100) AS FLOAT) AS change_pct
        FROM bhavcopy_daily b
        JOIN companies c ON c.id = b.company_id
        JOIN bhavcopy_daily prev ON prev.company_id = b.company_id
          AND prev.date = (SELECT MAX(date) FROM bhavcopy_daily WHERE date < ${latestBhav.date} AND company_id = b.company_id AND source = b.source)
        WHERE b.date = ${latestBhav.date} AND b.source = 'bse'
          AND prev.close > 0 AND b.close > 10
        ORDER BY change_pct ASC
        LIMIT 5
      `,
    ]);
    topBhavGainers = gainers as any;
    topBhavLosers = losers as any;
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const fiiRow = fiiDiiRows[0] ?? null;
  const fiiNet = fiiRow?.fiiNet ? Number(fiiRow.fiiNet) : null;
  const diiNet = fiiRow?.diiNet ? Number(fiiRow.diiNet) : null;

  const sentimentIcon =
    latest?.sentiment === "bullish" ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : latest?.sentiment === "bearish" ? (
      <TrendingDown className="w-4 h-4 text-red-600" />
    ) : (
      <Minus className="w-4 h-4 text-gray-500" />
    );
  const sentimentColor =
    latest?.sentiment === "bullish"
      ? "bg-green-50 text-green-700 border-green-200"
      : latest?.sentiment === "bearish"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-gray-50 text-gray-700 border-gray-200";

  const topGainers = (latest?.topGainers as Mover[] | null) ?? [];
  const topLosers = (latest?.topLosers as Mover[] | null) ?? [];
  const moversSource = topGainers.length > 0 ? "summary" : "bhav";

  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(latest?.date ?? nifty50?.date ?? new Date());

  const niftyDate = nifty50?.date
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
        nifty50.date
      )
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Daily Market Summary</h1>
          {latest?.sentiment ? (
            <span
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 ${sentimentColor}`}
            >
              {sentimentIcon} {latest.sentiment}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-gray-500">{dateLabel}</p>
      </div>

      {/* ── Today at a Glance ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-indigo-500" />
          Today at a Glance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Nifty 50 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Nifty 50</div>
            {nifty50 ? (
              <>
                <div className="text-xl font-bold text-gray-900 tabular-nums">
                  {Number(nifty50.close).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
                <div className="mt-0.5">
                  <ChangeChip val={nifty50.changePct ? Number(nifty50.changePct) : null} suffix="%" />
                </div>
                {niftyDate && <div className="text-[10px] text-gray-400 mt-1">as of {niftyDate}</div>}
              </>
            ) : (
              <div className="text-gray-400 text-sm mt-1">No data</div>
            )}
          </div>

          {/* Nifty Bank */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Bank Nifty</div>
            {bankNifty ? (
              <>
                <div className="text-xl font-bold text-gray-900 tabular-nums">
                  {Number(bankNifty.close).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
                <div className="mt-0.5">
                  <ChangeChip val={bankNifty.changePct ? Number(bankNifty.changePct) : null} suffix="%" />
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-sm mt-1">No data</div>
            )}
          </div>

          {/* FII Net */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">FII Net (Cash)</div>
            <div
              className={`text-xl font-bold tabular-nums ${
                fiiNet == null ? "text-gray-400" : fiiNet >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {fiiNet == null ? "—" : `${fiiNet >= 0 ? "+" : ""}${fmtCr(fiiNet)}`}
            </div>
            {fiiRow?.date && (
              <div className="text-[10px] text-gray-400 mt-1">
                {new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                }).format(fiiRow.date)}
              </div>
            )}
          </div>

          {/* DII Net */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">DII Net (Cash)</div>
            <div
              className={`text-xl font-bold tabular-nums ${
                diiNet == null ? "text-gray-400" : diiNet >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {diiNet == null ? "—" : `${diiNet >= 0 ? "+" : ""}${fmtCr(diiNet)}`}
            </div>
          </div>
        </div>

        {/* Second row: Nifty PE / PB + Announcements */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {nifty50?.pe && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Nifty 50 P/E</div>
              <div className="text-xl font-bold text-gray-900 tabular-nums">
                {Number(nifty50.pe).toFixed(2)}x
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {nifty50.pb ? `P/B: ${Number(nifty50.pb).toFixed(2)}x` : ""}
              </div>
            </div>
          )}
          {nifty50?.divYield && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Nifty Div Yield</div>
              <div className="text-xl font-bold text-gray-900 tabular-nums">
                {Number(nifty50.divYield).toFixed(2)}%
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-300 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">BSE Announcements Today</div>
              <div className="text-xl font-bold text-gray-900">{announcementCount}</div>
              <Link
                href="/announcements"
                className="text-[11px] text-indigo-600 hover:underline"
              >
                View all →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Market Summary ─────────────────────────────────────────────────── */}
      {latest ? (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-gray-900">{latest.headline}</h2>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{latest.body}</div>
          {latest.generatedBy ? (
            <p className="text-[11px] text-gray-400 mt-3">
              Generated by {latest.generatedBy}. Numbers sourced from BSE EOD bhavcopy + NSE FII/DII
              reports — verify before acting.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="card text-center py-8 text-sm text-gray-500">
          AI market wrap not yet available for today. The first wrap publishes after the 16:30 IST cron
          run.
        </div>
      )}

      {/* ── Movers ─────────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-500" />
          Top Movers
          {moversSource === "bhav" && latestBhav && (
            <span className="text-[11px] text-gray-400 font-normal ml-1">
              — BSE bhavcopy{" "}
              {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
                latestBhav.date
              )}
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gainers */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" /> Top gainers
            </h3>
            <div className="divide-y divide-gray-100">
              {moversSource === "summary"
                ? topGainers.map((m) => (
                    <Link
                      key={m.slug}
                      href={`/ticker/${m.slug}`}
                      className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded"
                    >
                      <span className="text-sm text-gray-800">{m.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600 tabular-nums">
                          +{m.pct.toFixed(2)}%
                        </div>
                        <div className="text-[11px] text-gray-500 tabular-nums">
                          ₹{m.close.toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))
                : topBhavGainers.map((m: any) => (
                    <Link
                      key={m.slug}
                      href={`/ticker/${m.slug}`}
                      className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded"
                    >
                      <span className="text-sm text-gray-800">{m.company_name}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600 tabular-nums">
                          +{Number(m.change_pct).toFixed(2)}%
                        </div>
                        <div className="text-[11px] text-gray-500 tabular-nums">
                          ₹{Number(m.close).toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))}
              {topGainers.length === 0 && topBhavGainers.length === 0 && (
                <div className="text-sm text-gray-500 py-4 text-center">No data yet</div>
              )}
            </div>
          </div>

          {/* Losers */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-red-600" /> Top losers
            </h3>
            <div className="divide-y divide-gray-100">
              {moversSource === "summary"
                ? topLosers.map((m) => (
                    <Link
                      key={m.slug}
                      href={`/ticker/${m.slug}`}
                      className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded"
                    >
                      <span className="text-sm text-gray-800">{m.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-600 tabular-nums">
                          {m.pct.toFixed(2)}%
                        </div>
                        <div className="text-[11px] text-gray-500 tabular-nums">
                          ₹{m.close.toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))
                : topBhavLosers.map((m: any) => (
                    <Link
                      key={m.slug}
                      href={`/ticker/${m.slug}`}
                      className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded"
                    >
                      <span className="text-sm text-gray-800">{m.company_name}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-600 tabular-nums">
                          {Number(m.change_pct).toFixed(2)}%
                        </div>
                        <div className="text-[11px] text-gray-500 tabular-nums">
                          ₹{Number(m.close).toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))}
              {topLosers.length === 0 && topBhavLosers.length === 0 && (
                <div className="text-sm text-gray-500 py-4 text-center">No data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FII/DII detail from MarketSummary (if present) ───────────────────── */}
      {latest && (latest.fiiNet || latest.diiNet) ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <div className="text-xs text-gray-500">FII net (from AI wrap)</div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                latest.fiiNet == null
                  ? "text-gray-500"
                  : Number(latest.fiiNet) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {latest.fiiNet == null
                ? "—"
                : `${Number(latest.fiiNet) >= 0 ? "+" : ""}${formatCurrency(
                    Number(latest.fiiNet) * 10000000
                  )}`}
            </div>
          </div>
          <div className="card">
            <div className="text-xs text-gray-500">DII net (from AI wrap)</div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                latest.diiNet == null
                  ? "text-gray-500"
                  : Number(latest.diiNet) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {latest.diiNet == null
                ? "—"
                : `${Number(latest.diiNet) >= 0 ? "+" : ""}${formatCurrency(
                    Number(latest.diiNet) * 10000000
                  )}`}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Past wraps ────────────────────────────────────────────────────────── */}
      {recent.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Past wraps</h3>
          <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
            {recent.map((r) => (
              <div key={r.date.toISOString()} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">{r.headline}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(r.date)}
                  </div>
                </div>
                {r.sentiment ? (
                  <span className="text-[11px] text-gray-500 capitalize">{r.sentiment}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
