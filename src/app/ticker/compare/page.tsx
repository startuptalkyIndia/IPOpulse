export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { latestCanonicalRow } from "@/lib/price";
import { CompareStocksClient, type StockSummary } from "./CompareStocksClient";

export const metadata: Metadata = {
  title: "Compare Stocks — P/E, ROE, margins & returns side-by-side",
  description:
    "Compare up to 3 Indian stocks side-by-side — price, market cap, P/E, P/B, ROE, ROCE, debt/equity, dividend yield, margins, and returns.",
  alternates: { canonical: "/ticker/compare" },
};

interface Props {
  searchParams: Promise<{ a?: string; b?: string; c?: string }>;
}

const SELECT = {
  id: true,
  slug: true,
  name: true,
  nseSymbol: true,
  sector: true,
  industry: true,
  marketCap: true,
  peRatio: true,
  pbRatio: true,
  roePercent: true,
  rocePercent: true,
  debtToEquity: true,
  dividendYield: true,
  eps: true,
  bookValue: true,
  operatingMargin: true,
  netMargin: true,
  ret1y: true,
  revCagr: true,
} as const;

async function loadCompany(slug: string | undefined): Promise<StockSummary | null> {
  if (!slug) return null;
  const c = await prisma.company.findUnique({ where: { slug }, select: SELECT });
  if (!c) return null;
  const priceRow = await latestCanonicalRow(c.id);
  return {
    slug: c.slug,
    name: c.name,
    nseSymbol: c.nseSymbol,
    sector: c.sector,
    industry: c.industry,
    price: priceRow?.close ?? null,
    marketCap: c.marketCap ? Number(c.marketCap) : null,
    peRatio: c.peRatio ? Number(c.peRatio) : null,
    pbRatio: c.pbRatio ? Number(c.pbRatio) : null,
    roePercent: c.roePercent ? Number(c.roePercent) : null,
    rocePercent: c.rocePercent ? Number(c.rocePercent) : null,
    debtToEquity: c.debtToEquity ? Number(c.debtToEquity) : null,
    dividendYield: c.dividendYield ? Number(c.dividendYield) : null,
    eps: c.eps ? Number(c.eps) : null,
    bookValue: c.bookValue ? Number(c.bookValue) : null,
    operatingMargin: c.operatingMargin ? Number(c.operatingMargin) : null,
    netMargin: c.netMargin ? Number(c.netMargin) : null,
    ret1y: c.ret1y ? Number(c.ret1y) : null,
    revCagr: c.revCagr ? Number(c.revCagr) : null,
  };
}

export default async function CompareStocksPage({ searchParams }: Props) {
  const { a, b, c } = await searchParams;
  const [companyA, companyB, companyC] = await Promise.all([
    loadCompany(a),
    loadCompany(b),
    loadCompany(c),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/ticker" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Stock Ticker
      </Link>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Compare Stocks</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Search and pick up to 3 stocks to compare fundamentals side-by-side — price, market cap, valuation
          ratios, profitability, leverage, and returns.
        </p>
      </div>
      <CompareStocksClient initial={{ a: companyA, b: companyB, c: companyC }} />
    </div>
  );
}
