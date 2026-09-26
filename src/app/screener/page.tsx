export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { canonicalRowsForDate, canonicalCloseMap, canonicalRange, type CanonRow } from "@/lib/price";
import { ScreenerClient, type ScreenerCompany } from "./ScreenerClient";

export const metadata: Metadata = {
  title: "Stock Screener India — filter 2,500+ stocks by sector, market cap, momentum",
  description:
    "Free Indian stock screener. Filter NSE/BSE companies by sector, market cap, 52-week high/low, 1-day change, volume. Mobile-first.",
  alternates: { canonical: "/screener" },
};

export default async function ScreenerPage() {
  const companies = await prisma.company.findMany({
    where: { active: true },
    select: {
      id: true, slug: true, name: true, sector: true, industry: true,
      nseSymbol: true, bseCode: true, marketCap: true, isSme: true,
      peRatio: true, pbRatio: true, roePercent: true, debtToEquity: true,
      dividendYield: true, eps: true,
      rsi: true, weinsteinStage: true, ret1m: true, ret1y: true,
      roeConsistentYrs: true, isMoat: true, moatNote: true, cyclicalPeak: true,
    },
    orderBy: { marketCap: "desc" },
    // No `take` limit — deliberately uncapped. A hard number here (previously 2000,
    // briefly 3000) silently truncates the screener the moment the active-company
    // count grows past it, with no error or warning; that's exactly how 2000 quietly
    // went stale and excluded ~600 real companies until a user noticed. This ships
    // every active company's row to the client (~2,600 today), which is the actual
    // cost of the current client-side-filtering architecture (ScreenerClient.tsx) —
    // see the 2026-09-26 CHANGELOG entry on screener load time. If the company count
    // grows enough to make that payload slow again, the real fix is moving filtering
    // to the server (pagination), not reintroducing a silent row cap.
  });
  const screenIds = companies.map((c) => c.id);

  // Latest two DISTINCT trading days for 1D change + 52W data.
  // NOTE: bhavcopy has ~2,300 rows per date, so `skip: 1` would skip one row
  // within the same day — we need distinct dates to get the real previous close.
  // Raw SQL, not Prisma's `distinct`: Prisma's client-side distinct doesn't push
  // DISTINCT+LIMIT down to Postgres — it pulls back every (id, date) row in the
  // whole table (~1.5M rows) ordered by date, then dedupes in Node. Measured live
  // 2026-09-26: 4+ seconds. The equivalent `SELECT DISTINCT date ... LIMIT 2` lets
  // Postgres short-circuit the backward index scan after finding 2 dates: 3.5ms.
  const recentDates = await prisma.$queryRaw<{ date: Date }[]>`
    SELECT DISTINCT date FROM bhavcopy_daily ORDER BY date DESC LIMIT 2
  `;
  const latestBhav = recentDates[0] ?? null;
  const prevBhav = recentDates[1] ?? null;

  // Canonical prices (one row per company) via the shared price layer.
  const todayMap: Map<number, CanonRow> = latestBhav
    ? new Map((await canonicalRowsForDate(latestBhav.date, screenIds)).map((r) => [r.companyId, r]))
    : new Map<number, CanonRow>();
  const prevMap = prevBhav ? await canonicalCloseMap(prevBhav.date, screenIds) : new Map<number, number>();

  // 52W high/low from canonical series (last ~252 trading days)
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const range52 = await canonicalRange(screenIds, cutoff);
  const yearMap = new Map([...range52.entries()].map(([id, r]) => [id, { high52w: r.max || null, low52w: r.min || null }]));

  // ─── YoY growth from annual_financials latest 2 years per company ────────
  const companyIds = companies.map((c) => c.id);
  const annuals = await prisma.annualFinancial.findMany({
    where: { companyId: { in: companyIds } },
    orderBy: [{ companyId: "asc" }, { yearEnd: "desc" }],
    select: { companyId: true, sales: true, netProfit: true },
  });
  const byCo = new Map<number, typeof annuals>();
  for (const a of annuals) {
    const arr = byCo.get(a.companyId) ?? [];
    if (arr.length < 2) { arr.push(a); byCo.set(a.companyId, arr); }
  }
  const yoyMap = new Map<number, { revYoy: number | null; profitYoy: number | null }>();
  for (const [cid, rows] of byCo.entries()) {
    if (rows.length < 2) continue;
    const [cur, prev] = rows;
    const lS = cur.sales ? Number(cur.sales) : null;
    const pS = prev.sales ? Number(prev.sales) : null;
    const lP = cur.netProfit ? Number(cur.netProfit) : null;
    const pP = prev.netProfit ? Number(prev.netProfit) : null;
    yoyMap.set(cid, {
      revYoy: lS && pS && pS > 0 ? ((lS - pS) / pS) * 100 : null,
      profitYoy: lP && pP && Math.abs(pP) > 0 ? ((lP - pP) / Math.abs(pP)) * 100 : null,
    });
  }

  const seed: ScreenerCompany[] = companies.map((c) => {
    const today = todayMap.get(c.id);
    const prevClose = prevMap.get(c.id) ?? null;
    const close = today ? Number(today.close) : null;
    const chg1d = close && prevClose ? ((close - prevClose) / prevClose) * 100 : null;
    const year = yearMap.get(c.id);
    return {
      slug: c.slug, name: c.name,
      symbol: c.nseSymbol ?? c.bseCode ?? null,
      sector: c.sector, industry: c.industry,
      marketCapCr: c.marketCap ? Number(c.marketCap) : null,
      isSme: c.isSme,
      ltp: close,
      volume: today ? Number(today.volume) : null,
      chg1d,
      high52w: year?.high52w ?? null,
      low52w: year?.low52w ?? null,
      peRatio: c.peRatio ? Number(c.peRatio) : null,
      pbRatio: c.pbRatio ? Number(c.pbRatio) : null,
      roePercent: c.roePercent ? Number(c.roePercent) : null,
      debtToEquity: c.debtToEquity ? Number(c.debtToEquity) : null,
      dividendYield: c.dividendYield ? Number(c.dividendYield) : null,
      eps: c.eps ? Number(c.eps) : null,
      revYoy: yoyMap.get(c.id)?.revYoy ?? null,
      profitYoy: yoyMap.get(c.id)?.profitYoy ?? null,
      rsi: c.rsi != null ? Number(c.rsi) : null,
      weinsteinStage: c.weinsteinStage ?? null,
      ret1m: c.ret1m != null ? Number(c.ret1m) : null,
      ret1y: c.ret1y != null ? Number(c.ret1y) : null,
      roeConsistentYrs: c.roeConsistentYrs ?? null,
      isMoat: c.isMoat ?? false,
      moatNote: c.moatNote ?? null,
      cyclicalPeak: c.cyclicalPeak ?? false,
    };
  });

  const sectors = Array.from(new Set(companies.map((c) => c.sector).filter((s): s is string => !!s))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Stock Screener</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          {`${seed.filter(s => s.ltp).length.toLocaleString()} companies with today's prices · ${sectors.length} sectors · 52-week highs/lows from 12 months of price history.`}
        </p>
      </div>
      <ScreenerClient seed={seed} sectors={sectors} />
    </div>
  );
}
