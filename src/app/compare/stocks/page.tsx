export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";

export const metadata: Metadata = {
  title: "Compare Stocks India — HDFC Bank vs ICICI Bank, TCS vs Infosys | IPOpulse",
  description:
    "Side-by-side stock comparison tool. Compare P/E, P/B, ROE, Debt/Equity, EPS, Market Cap, 52W high/low for any two NSE/BSE listed companies.",
  alternates: { canonical: "/compare/stocks" },
};

const quickPicks = [
  { labelA: "HDFC Bank", labelB: "ICICI Bank", a: "hdfc-bank", b: "icici-bank" },
  { labelA: "TCS", labelB: "Infosys", a: "tata-consultancy-services", b: "infosys" },
  { labelA: "Reliance", labelB: "Tata Motors", a: "reliance-industries", b: "tata-motors" },
  { labelA: "Maruti", labelB: "Bajaj Auto", a: "maruti-suzuki-india", b: "bajaj-auto" },
  { labelA: "Sun Pharma", labelB: "Dr Reddys", a: "sun-pharmaceutical-industries", b: "dr-reddys-laboratories" },
  { labelA: "HUL", labelB: "ITC", a: "hindustan-unilever", b: "itc" },
];

function fmt(v: number | null, prefix = "", suffix = "", decimals = 2): string {
  if (v === null || v === undefined) return "—";
  return `${prefix}${v.toFixed(decimals)}${suffix}`;
}

function fmtCr(v: number | null): string {
  if (v === null) return "—";
  if (v >= 10000000) return `₹${(v / 10000).toFixed(0)} Cr`;
  if (v >= 1000) return `₹${(v).toFixed(0)} Cr`;
  return `₹${v.toFixed(2)} Cr`;
}

type Better = "a" | "b" | "equal" | "none";

function betterHigher(a: number | null, b: number | null): Better {
  if (a === null && b === null) return "none";
  if (a === null) return "b";
  if (b === null) return "a";
  if (a > b) return "a";
  if (b > a) return "b";
  return "equal";
}

function betterLower(a: number | null, b: number | null): Better {
  if (a === null && b === null) return "none";
  if (a === null) return "b";
  if (b === null) return "a";
  if (a < b) return "a";
  if (b < a) return "b";
  return "equal";
}

interface MetricRow {
  label: string;
  hint?: string;
  valA: string;
  valB: string;
  better: Better;
}

function CellValue({ val, better, side }: { val: string; better: Better; side: "a" | "b" }) {
  const isBetter = better === side;
  const isWorse = better !== "none" && better !== "equal" && better !== side;
  return (
    <div className={`text-center font-semibold text-base ${isBetter ? "text-green-700" : isWorse ? "text-gray-500" : "text-gray-900"}`}>
      {val}
      {isBetter && <span className="ml-1 text-xs text-green-600">▲</span>}
    </div>
  );
}

export default async function CompareStocksPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const params = await searchParams;
  const slugA = params.a;
  const slugB = params.b;

  if (!slugA || !slugB) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/compare" className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Compare Stocks</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Side-by-side fundamental comparison of any two NSE / BSE listed stocks
            </p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {quickPicks.map((q) => (
              <Link
                key={`${q.a}-${q.b}`}
                href={`/compare/stocks?a=${q.a}&b=${q.b}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
              >
                <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">
                  {q.labelA}
                </span>
                <span className="text-xs text-gray-400 px-2">vs</span>
                <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">
                  {q.labelB}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">How to Compare</h2>
          <p className="text-sm text-gray-600">
            Add <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">?a=company-slug&amp;b=company-slug</code> to the URL,
            or click any quick pick above. Company slugs match the URL at{" "}
            <Link href="/ticker" className="text-indigo-600 hover:underline">/ticker</Link> — for example,{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">hdfc-bank</code>.
          </p>
        </div>
      </div>
    );
  }

  // Fetch both companies
  const [compA, compB] = await Promise.all([
    prisma.company.findUnique({ where: { slug: slugA } }),
    prisma.company.findUnique({ where: { slug: slugB } }),
  ]);

  if (!compA || !compB) {
    const missing = !compA ? slugA : slugB;
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="card p-8 text-center">
          <p className="text-gray-600 mb-4">
            Company <code className="bg-gray-100 px-2 py-1 rounded">{missing}</code> was not found in our database.
          </p>
          <Link href="/compare/stocks" className="text-indigo-600 hover:underline text-sm">
            ← Back to stock comparison
          </Link>
        </div>
      </div>
    );
  }

  // Latest price for both
  const [latestA, latestB] = await Promise.all([
    prisma.bhavcopyDaily.findFirst({
      where: { companyId: compA.id },
      orderBy: { date: "desc" },
      select: { close: true, date: true },
    }),
    prisma.bhavcopyDaily.findFirst({
      where: { companyId: compB.id },
      orderBy: { date: "desc" },
      select: { close: true, date: true },
    }),
  ]);

  // 52W high/low
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const [yearA, yearB] = await Promise.all([
    prisma.bhavcopyDaily.aggregate({
      where: { companyId: compA.id, date: { gte: cutoff } },
      _max: { high: true },
      _min: { low: true },
    }),
    prisma.bhavcopyDaily.aggregate({
      where: { companyId: compB.id, date: { gte: cutoff } },
      _max: { high: true },
      _min: { low: true },
    }),
  ]);

  // 30-day sparkline prices + 10-year annual financials for YoY/CAGR
  const sparkCutoff = new Date(); sparkCutoff.setDate(sparkCutoff.getDate() - 35);
  const [sparkA, sparkB, annualA, annualB] = await Promise.all([
    prisma.bhavcopyDaily.findMany({
      where: { companyId: compA.id, date: { gte: sparkCutoff } },
      orderBy: { date: "asc" }, select: { close: true },
    }),
    prisma.bhavcopyDaily.findMany({
      where: { companyId: compB.id, date: { gte: sparkCutoff } },
      orderBy: { date: "asc" }, select: { close: true },
    }),
    prisma.annualFinancial.findMany({
      where: { companyId: compA.id },
      orderBy: { yearEnd: "desc" }, take: 5,
      select: { sales: true, netProfit: true, eps: true, roe: true, roce: true },
    }),
    prisma.annualFinancial.findMany({
      where: { companyId: compB.id },
      orderBy: { yearEnd: "desc" }, take: 5,
      select: { sales: true, netProfit: true, eps: true, roe: true, roce: true },
    }),
  ]);
  const sparkValuesA = sparkA.map(p => Number(p.close));
  const sparkValuesB = sparkB.map(p => Number(p.close));

  // Helpers: YoY growth (last 2 yrs) and 3Y CAGR (last 4 yrs latest vs 3-yrs-ago)
  function yoyPct(rows: { sales?: import("@prisma/client").Prisma.Decimal | null; netProfit?: import("@prisma/client").Prisma.Decimal | null }[], field: "sales" | "netProfit"): number | null {
    if (rows.length < 2) return null;
    const cur = rows[0][field] ? Number(rows[0][field]) : null;
    const prev = rows[1][field] ? Number(rows[1][field]) : null;
    if (cur == null || prev == null || Math.abs(prev) < 0.01) return null;
    return ((cur - prev) / Math.abs(prev)) * 100;
  }
  function cagr3y(rows: { sales?: import("@prisma/client").Prisma.Decimal | null; netProfit?: import("@prisma/client").Prisma.Decimal | null }[], field: "sales" | "netProfit"): number | null {
    if (rows.length < 4) return null;
    const cur = rows[0][field] ? Number(rows[0][field]) : null;
    const old = rows[3][field] ? Number(rows[3][field]) : null;
    if (cur == null || old == null || old <= 0) return null;
    return (Math.pow(cur / old, 1 / 3) - 1) * 100;
  }

  const revYoyA = yoyPct(annualA, "sales");
  const revYoyB = yoyPct(annualB, "sales");
  const profitYoyA = yoyPct(annualA, "netProfit");
  const profitYoyB = yoyPct(annualB, "netProfit");
  const revCagrA = cagr3y(annualA, "sales");
  const revCagrB = cagr3y(annualB, "sales");
  const profitCagrA = cagr3y(annualA, "netProfit");
  const profitCagrB = cagr3y(annualB, "netProfit");

  // 30-day price return %
  const ret30A = sparkValuesA.length >= 2 ? ((sparkValuesA[sparkValuesA.length - 1] - sparkValuesA[0]) / sparkValuesA[0]) * 100 : null;
  const ret30B = sparkValuesB.length >= 2 ? ((sparkValuesB[sparkValuesB.length - 1] - sparkValuesB[0]) / sparkValuesB[0]) * 100 : null;

  const ltpA = latestA ? Number(latestA.close) : null;
  const ltpB = latestB ? Number(latestB.close) : null;
  const high52A = yearA._max.high ? Number(yearA._max.high) : null;
  const low52A = yearA._min.low ? Number(yearA._min.low) : null;
  const high52B = yearB._max.high ? Number(yearB._max.high) : null;
  const low52B = yearB._min.low ? Number(yearB._min.low) : null;
  const mcapA = compA.marketCap ? Number(compA.marketCap) : null;
  const mcapB = compB.marketCap ? Number(compB.marketCap) : null;
  const peA = compA.peRatio ? Number(compA.peRatio) : null;
  const peB = compB.peRatio ? Number(compB.peRatio) : null;
  const pbA = compA.pbRatio ? Number(compA.pbRatio) : null;
  const pbB = compB.pbRatio ? Number(compB.pbRatio) : null;
  const roeA = compA.roePercent ? Number(compA.roePercent) : null;
  const roeB = compB.roePercent ? Number(compB.roePercent) : null;
  const deA = compA.debtToEquity ? Number(compA.debtToEquity) : null;
  const deB = compB.debtToEquity ? Number(compB.debtToEquity) : null;
  const epsA = compA.eps ? Number(compA.eps) : null;
  const epsB = compB.eps ? Number(compB.eps) : null;

  const metrics: MetricRow[] = [
    {
      label: "Sector",
      valA: compA.sector ?? "—",
      valB: compB.sector ?? "—",
      better: "none",
    },
    {
      label: "Exchange Symbol",
      valA: compA.nseSymbol ?? compA.bseCode ?? "—",
      valB: compB.nseSymbol ?? compB.bseCode ?? "—",
      better: "none",
    },
    {
      label: "Market Cap",
      hint: "Higher = larger company",
      valA: fmtCr(mcapA),
      valB: fmtCr(mcapB),
      better: betterHigher(mcapA, mcapB),
    },
    {
      label: "LTP (Latest Price)",
      valA: fmt(ltpA, "₹"),
      valB: fmt(ltpB, "₹"),
      better: "none",
    },
    {
      label: "52W High",
      hint: "52-week highest price",
      valA: fmt(high52A, "₹"),
      valB: fmt(high52B, "₹"),
      better: "none",
    },
    {
      label: "52W Low",
      hint: "52-week lowest price",
      valA: fmt(low52A, "₹"),
      valB: fmt(low52B, "₹"),
      better: "none",
    },
    {
      label: "P/E Ratio",
      hint: "Lower can mean cheaper valuation",
      valA: fmt(peA),
      valB: fmt(peB),
      better: betterLower(peA, peB),
    },
    {
      label: "P/B Ratio",
      hint: "Price to Book — lower = trading closer to book value",
      valA: fmt(pbA),
      valB: fmt(pbB),
      better: betterLower(pbA, pbB),
    },
    {
      label: "ROE %",
      hint: "Return on Equity — higher is better",
      valA: fmt(roeA, "", "%"),
      valB: fmt(roeB, "", "%"),
      better: betterHigher(roeA, roeB),
    },
    {
      label: "Debt / Equity",
      hint: "Lower means less financial leverage",
      valA: fmt(deA),
      valB: fmt(deB),
      better: betterLower(deA, deB),
    },
    {
      label: "EPS (₹)",
      hint: "Earnings per share — higher is better",
      valA: fmt(epsA, "₹"),
      valB: fmt(epsB, "₹"),
      better: betterHigher(epsA, epsB),
    },
    {
      label: "30-Day Return",
      hint: "Stock price change over the last 30 trading days",
      valA: ret30A != null ? `${ret30A >= 0 ? "+" : ""}${ret30A.toFixed(1)}%` : "—",
      valB: ret30B != null ? `${ret30B >= 0 ? "+" : ""}${ret30B.toFixed(1)}%` : "—",
      better: betterHigher(ret30A, ret30B),
    },
    {
      label: "Revenue YoY Growth",
      hint: "Latest annual revenue vs prior year",
      valA: revYoyA != null ? `${revYoyA >= 0 ? "+" : ""}${revYoyA.toFixed(1)}%` : "—",
      valB: revYoyB != null ? `${revYoyB >= 0 ? "+" : ""}${revYoyB.toFixed(1)}%` : "—",
      better: betterHigher(revYoyA, revYoyB),
    },
    {
      label: "Profit YoY Growth",
      hint: "Latest annual net profit vs prior year",
      valA: profitYoyA != null ? `${profitYoyA >= 0 ? "+" : ""}${profitYoyA.toFixed(1)}%` : "—",
      valB: profitYoyB != null ? `${profitYoyB >= 0 ? "+" : ""}${profitYoyB.toFixed(1)}%` : "—",
      better: betterHigher(profitYoyA, profitYoyB),
    },
    {
      label: "Revenue 3Y CAGR",
      hint: "Compounded annual growth in revenue over the last 3 years",
      valA: revCagrA != null ? `${revCagrA >= 0 ? "+" : ""}${revCagrA.toFixed(1)}%` : "—",
      valB: revCagrB != null ? `${revCagrB >= 0 ? "+" : ""}${revCagrB.toFixed(1)}%` : "—",
      better: betterHigher(revCagrA, revCagrB),
    },
    {
      label: "Profit 3Y CAGR",
      hint: "Compounded annual growth in net profit over the last 3 years",
      valA: profitCagrA != null ? `${profitCagrA >= 0 ? "+" : ""}${profitCagrA.toFixed(1)}%` : "—",
      valB: profitCagrB != null ? `${profitCagrB >= 0 ? "+" : ""}${profitCagrB.toFixed(1)}%` : "—",
      better: betterHigher(profitCagrA, profitCagrB),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/compare/stocks" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {compA.name} vs {compB.name}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Side-by-side fundamental comparison · <Link href="/compare/stocks" className="text-indigo-600 hover:underline">Change stocks</Link>
          </p>
        </div>
      </div>

      {/* Company header cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { comp: compA, ltp: ltpA, high52: high52A, low52: low52A, spark: sparkValuesA, ret30: ret30A },
          { comp: compB, ltp: ltpB, high52: high52B, low52: low52B, spark: sparkValuesB, ret30: ret30B },
        ].map(({ comp, ltp, high52, low52, spark, ret30 }) => (
          <div key={comp.id} className="card p-4 text-center space-y-1">
            <Link
              href={`/ticker/${comp.slug}`}
              className="text-base font-bold text-indigo-700 hover:underline"
            >
              {comp.name}
            </Link>
            <div className="text-xs text-gray-500">
              {comp.nseSymbol ?? comp.bseCode ?? "—"} · {comp.sector ?? "—"}
            </div>
            {ltp !== null && (
              <div className="text-2xl font-bold text-gray-900">₹{ltp.toFixed(2)}</div>
            )}
            {high52 !== null && low52 !== null && (
              <div className="text-xs text-gray-400">
                52W: ₹{low52.toFixed(0)} – ₹{high52.toFixed(0)}
              </div>
            )}
            {spark.length >= 2 && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <Sparkline values={spark} width={180} height={36} />
                <div className={`text-xs font-semibold mt-1 ${ret30 != null && ret30 >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  30D: {ret30 != null ? `${ret30 >= 0 ? "+" : ""}${ret30.toFixed(1)}%` : "—"}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-3 bg-indigo-50 px-4 py-3 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Metric</div>
          <div className="text-center truncate">{compA.name.split(" ").slice(0, 2).join(" ")}</div>
          <div className="text-center truncate">{compB.name.split(" ").slice(0, 2).join(" ")}</div>
        </div>
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`grid grid-cols-3 px-4 py-3 border-b border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
          >
            <div>
              <div className="text-sm font-medium text-gray-800">{m.label}</div>
              {m.hint && <div className="text-xs text-gray-400">{m.hint}</div>}
            </div>
            <CellValue val={m.valA} better={m.better} side="a" />
            <CellValue val={m.valB} better={m.better} side="b" />
          </div>
        ))}
      </div>

      {/* Profile links */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href={`/ticker/${compA.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium"
        >
          <TrendingUp className="w-4 h-4" />
          Full profile: {compA.name}
        </Link>
        <Link
          href={`/ticker/${compB.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium"
        >
          <TrendingUp className="w-4 h-4" />
          Full profile: {compB.name}
        </Link>
      </div>

      {/* Quick picks */}
      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Other Popular Comparisons</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickPicks
            .filter((q) => !(q.a === slugA && q.b === slugB))
            .map((q) => (
              <Link
                key={`${q.a}-${q.b}`}
                href={`/compare/stocks?a=${q.a}&b=${q.b}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-xs group"
              >
                <span className="font-medium text-gray-700 group-hover:text-indigo-700">{q.labelA}</span>
                <span className="text-gray-400 px-1">vs</span>
                <span className="font-medium text-gray-700 group-hover:text-indigo-700">{q.labelB}</span>
              </Link>
            ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Green values indicate a relatively better metric. Fundamental data sourced from BSE/NSE filings.
        Click any company name above to view its full ticker profile. Not investment advice.
      </p>
    </div>
  );
}
