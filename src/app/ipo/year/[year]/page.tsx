export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { IpoTable } from "@/components/ipo/IpoTable";
import { ApplyIpoCtaRow } from "@/components/AffiliateCta";
import { Award, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface Props {
  params: Promise<{ year: string }>;
}

const VALID_YEARS = [2023, 2024, 2025, 2026];

export async function generateStaticParams() {
  return VALID_YEARS.map((y) => ({ year: String(y) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `IPO ${year} List with Listing Gain — Mainboard & SME IPOs`,
    description: `Complete list of every Indian IPO from ${year} — mainboard and SME, with subscription multiples, GMP at listing, listing price, and listing-day gain percentage. Sortable.`,
    alternates: { canonical: `/ipo/year/${year}` },
  };
}

export default async function YearArchive({ params }: Props) {
  const { year } = await params;
  const y = Number(year);
  if (!VALID_YEARS.includes(y)) notFound();

  const start = new Date(y, 0, 1);
  const end = new Date(y + 1, 0, 1);

  const [listed, allInYear] = await Promise.all([
    prisma.ipo.findMany({
      where: { listingDate: { gte: start, lt: end } },
      include: { listing: true, drhpAnalysis: true },
      orderBy: { listingDate: "desc" },
    }),
    prisma.ipo.findMany({
      where: {
        OR: [
          { openDate: { gte: start, lt: end } },
          { listingDate: { gte: start, lt: end } },
        ],
      },
      include: { listing: true, drhpAnalysis: true },
      orderBy: { openDate: "desc" },
    }),
  ]);

  const mainboard = listed.filter((i) => i.type === "mainboard");
  const sme = listed.filter((i) => i.type === "sme");

  // Stats
  const total = listed.length;
  const positive = listed.filter((i) => i.listing && Number(i.listing.listingGainsPct) > 0).length;
  const median = (() => {
    const nums = listed
      .filter((i) => i.listing)
      .map((i) => Number(i.listing!.listingGainsPct))
      .sort((a, b) => a - b);
    if (nums.length === 0) return 0;
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  })();

  // Total capital raised (in Cr)
  const totalCapital = listed.reduce((s, i) => s + (i.issueSize ? Number(i.issueSize) : 0), 0);

  // Top 5 / Worst 5 by listing gain
  const withListing = listed.filter(i => i.listing).map(i => ({
    slug: i.slug, name: i.name, type: i.type,
    gain: Number(i.listing!.listingGainsPct),
  }));
  const top5 = [...withListing].sort((a, b) => b.gain - a.gain).slice(0, 5);
  const worst5 = [...withListing].sort((a, b) => a.gain - b.gain).slice(0, 5);

  // Monthly count (used for monthly distribution)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyCounts = new Array(12).fill(0) as number[];
  for (const i of listed) {
    if (i.listingDate) monthlyCounts[i.listingDate.getMonth()]++;
  }
  const maxMonthly = Math.max(...monthlyCounts, 1);

  return (
    <div className="space-y-6">
      <Link href="/ipo/listed" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All listed IPOs
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">IPOs of {year}</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Complete archive of every Indian IPO that listed in {year} — mainboard and SME — with listing-day
          performance, GMP at listing, and subscription numbers.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Total listed" value={total.toString()} />
        <Stat label="Mainboard / SME" value={`${mainboard.length} / ${sme.length}`} />
        <Stat label="Positive listings" value={total > 0 ? `${Math.round((positive / total) * 100)}%` : "—"} />
        <Stat label="Median listing gain" value={`${median >= 0 ? "+" : ""}${median.toFixed(1)}%`} />
        <Stat label="Capital raised" value={totalCapital > 0 ? formatCurrency(totalCapital * 10000000) : "—"} />
      </div>

      {/* Top 5 / Worst 5 listings */}
      {top5.length > 0 && worst5.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Top 5 Listing Gainers of {year}
            </h3>
            {top5.map((r, i) => (
              <div key={r.slug} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-100 last:border-b-0">
                <span className="text-gray-700 truncate flex-1">
                  <span className="text-gray-400 mr-1">{i + 1}.</span>
                  <Link href={`/ipo/${r.slug}`} className="hover:text-indigo-600">{r.name}</Link>
                  <span className="text-[10px] text-gray-400 ml-1.5 uppercase">{r.type}</span>
                </span>
                <span className="text-emerald-700 font-semibold tabular-nums ml-2">+{r.gain.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Worst 5 Listings of {year}
            </h3>
            {worst5.map((r, i) => (
              <div key={r.slug} className="flex items-center justify-between py-1.5 text-xs border-b border-gray-100 last:border-b-0">
                <span className="text-gray-700 truncate flex-1">
                  <span className="text-gray-400 mr-1">{i + 1}.</span>
                  <Link href={`/ipo/${r.slug}`} className="hover:text-indigo-600">{r.name}</Link>
                  <span className="text-[10px] text-gray-400 ml-1.5 uppercase">{r.type}</span>
                </span>
                <span className={`font-semibold tabular-nums ml-2 ${r.gain >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {r.gain >= 0 ? "+" : ""}{r.gain.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly distribution */}
      {total > 0 && (
        <section className="card">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Monthly listing distribution
          </h3>
          <div className="grid grid-cols-12 gap-1 items-end h-24">
            {monthNames.map((m, i) => {
              const count = monthlyCounts[i];
              const height = maxMonthly > 0 ? (count / maxMonthly) * 100 : 0;
              return (
                <div key={m} className="flex flex-col items-center justify-end h-full">
                  <div className="w-full bg-indigo-100 rounded-t overflow-hidden flex flex-col justify-end" style={{ height: `${Math.max(height, 2)}%` }}>
                    <div className="bg-indigo-500 w-full" style={{ height: "100%" }} />
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1">{m}</div>
                  <div className="text-[10px] font-semibold text-gray-700 tabular-nums">{count}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <ApplyIpoCtaRow />

      {mainboard.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Mainboard IPOs · {year}</h2>
          <IpoTable ipos={mainboard} variant="listed" />
        </section>
      ) : null}

      {sme.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">SME IPOs · {year}</h2>
          <IpoTable ipos={sme} variant="listed" />
        </section>
      ) : null}

      {/* Year navigation */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-2">Browse other years</h2>
        <div className="flex flex-wrap gap-2">
          {VALID_YEARS.map((other) => (
            <Link
              key={other}
              href={`/ipo/year/${other}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
                other === y ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-indigo-50"
              }`}
            >
              IPOs of {other}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-indigo-700 tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
