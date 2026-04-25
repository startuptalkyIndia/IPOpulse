export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { IpoTable } from "@/components/ipo/IpoTable";
import { ApplyIpoCtaRow } from "@/components/AffiliateCta";

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
      include: { listing: true },
      orderBy: { listingDate: "desc" },
    }),
    prisma.ipo.findMany({
      where: {
        OR: [
          { openDate: { gte: start, lt: end } },
          { listingDate: { gte: start, lt: end } },
        ],
      },
      include: { listing: true },
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total listed" value={total.toString()} />
        <Stat label="Positive listings" value={total > 0 ? `${Math.round((positive / total) * 100)}%` : "—"} />
        <Stat label="Median listing gain" value={`${median >= 0 ? "+" : ""}${median.toFixed(1)}%`} />
        <Stat label="In pipeline this year" value={String(allInYear.length)} />
      </div>

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
