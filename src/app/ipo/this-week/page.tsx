export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { IpoTable } from "@/components/ipo/IpoTable";
import { ApplyIpoCtaRow } from "@/components/AffiliateCta";

export const metadata: Metadata = {
  title: "IPO This Week — Live, Closing & Opening Soon",
  description:
    "Every Indian IPO open or opening this week (mainboard + SME). Subscription status, GMP, lot size, allotment & listing dates. Updated daily.",
  alternates: { canonical: "/ipo/this-week" },
};

export default async function ThisWeekPage() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Sunday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const next14 = new Date(now.getTime() + 14 * 86400000);

  const [openingThisWeek, closingThisWeek, listingThisWeek, openingNext14] = await Promise.all([
    prisma.ipo.findMany({
      where: { openDate: { gte: weekStart, lte: weekEnd } },
      include: { listing: true },
      orderBy: { openDate: "asc" },
    }),
    prisma.ipo.findMany({
      where: { closeDate: { gte: weekStart, lte: weekEnd }, status: { in: ["live", "upcoming"] } },
      include: { listing: true },
      orderBy: { closeDate: "asc" },
    }),
    prisma.ipo.findMany({
      where: { listingDate: { gte: weekStart, lte: weekEnd } },
      include: { listing: true },
      orderBy: { listingDate: "asc" },
    }),
    prisma.ipo.findMany({
      where: { openDate: { gt: weekEnd, lte: next14 } },
      include: { listing: true },
      orderBy: { openDate: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/ipo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> IPO Dashboard
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">IPOs This Week</h1>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl">
          Every Indian IPO opening, closing, or listing this week — mainboard and SME. Open Demat to apply via UPI.
        </p>
      </div>

      <ApplyIpoCtaRow />

      {openingThisWeek.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Opening this week</h2>
          <IpoTable ipos={openingThisWeek} />
        </section>
      ) : null}
      {closingThisWeek.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Closing this week — last chance to apply</h2>
          <IpoTable ipos={closingThisWeek} />
        </section>
      ) : null}
      {listingThisWeek.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Listing this week</h2>
          <IpoTable ipos={listingThisWeek} variant="listed" />
        </section>
      ) : null}
      {openingNext14.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Opening next week</h2>
          <IpoTable ipos={openingNext14} />
        </section>
      ) : null}

      {openingThisWeek.length === 0 && closingThisWeek.length === 0 && listingThisWeek.length === 0 ? (
        <div className="card text-center py-10 text-sm text-gray-500">
          Quiet week — no IPOs are open, closing, or listing this week. Check{" "}
          <Link href="/ipo/upcoming" className="underline text-indigo-600">upcoming IPOs</Link>.
        </div>
      ) : null}
    </div>
  );
}
