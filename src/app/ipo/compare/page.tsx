export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { CompareTwoIposClient } from "./CompareTwoIposClient";

export const metadata: Metadata = {
  title: "Compare 2 IPOs side-by-side — price, GMP, subscription, anchors",
  description:
    "Side-by-side comparison of any two Indian IPOs. Price band, lot size, issue size, subscription, GMP, anchor investors, key dates.",
  alternates: { canonical: "/ipo/compare" },
};

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function CompareTwoIposPage({ searchParams }: Props) {
  const { a, b } = await searchParams;
  const allIpos = await prisma.ipo.findMany({
    select: { slug: true, name: true, type: true, status: true },
    orderBy: { openDate: "desc" },
  });

  const slugA = a || allIpos[0]?.slug;
  const slugB = b || allIpos[1]?.slug;

  const [ipoA, ipoB] = await Promise.all([
    slugA
      ? prisma.ipo.findUnique({
          where: { slug: slugA },
          include: {
            subscriptions: { orderBy: { capturedAt: "desc" }, take: 1 },
            gmpEntries: { orderBy: { date: "desc" }, take: 1 },
            anchors: true,
            listing: true,
          },
        })
      : null,
    slugB
      ? prisma.ipo.findUnique({
          where: { slug: slugB },
          include: {
            subscriptions: { orderBy: { capturedAt: "desc" }, take: 1 },
            gmpEntries: { orderBy: { date: "desc" }, take: 1 },
            anchors: true,
            listing: true,
          },
        })
      : null,
  ]);

  return (
    <div className="space-y-6">
      <Link href="/ipo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> IPO Dashboard
      </Link>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Compare two IPOs</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Pick any two IPOs to see them side-by-side — price band, lot, issue size, subscription, GMP, anchors,
          listing performance.
        </p>
      </div>
      <CompareTwoIposClient
        allIpos={allIpos}
        initial={{
          a: ipoA
            ? {
                slug: ipoA.slug,
                name: ipoA.name,
                type: ipoA.type,
                status: ipoA.status,
                priceBandLow: ipoA.priceBandLow ? Number(ipoA.priceBandLow) : null,
                priceBandHigh: ipoA.priceBandHigh ? Number(ipoA.priceBandHigh) : null,
                lotSize: ipoA.lotSize,
                issueSize: ipoA.issueSize ? Number(ipoA.issueSize) : null,
                openDate: ipoA.openDate?.toISOString() ?? null,
                closeDate: ipoA.closeDate?.toISOString() ?? null,
                listingDate: ipoA.listingDate?.toISOString() ?? null,
                allotmentDate: ipoA.allotmentDate?.toISOString() ?? null,
                registrar: ipoA.registrar,
                latestSubTotalX: ipoA.subscriptions[0]?.totalX ? Number(ipoA.subscriptions[0].totalX) : null,
                latestSubQibX: ipoA.subscriptions[0]?.qibX ? Number(ipoA.subscriptions[0].qibX) : null,
                latestSubRetailX: ipoA.subscriptions[0]?.retailX ? Number(ipoA.subscriptions[0].retailX) : null,
                latestGmp: ipoA.gmpEntries[0]?.gmp ? Number(ipoA.gmpEntries[0].gmp) : null,
                anchorCount: ipoA.anchors.length,
                anchorValueCr: ipoA.anchors.reduce((s, a) => s + (a.value ? Number(a.value) : 0), 0),
                listingPrice: ipoA.listing?.listingPrice ? Number(ipoA.listing.listingPrice) : null,
                listingGainPct: ipoA.listing?.listingGainsPct ? Number(ipoA.listing.listingGainsPct) : null,
              }
            : null,
          b: ipoB
            ? {
                slug: ipoB.slug,
                name: ipoB.name,
                type: ipoB.type,
                status: ipoB.status,
                priceBandLow: ipoB.priceBandLow ? Number(ipoB.priceBandLow) : null,
                priceBandHigh: ipoB.priceBandHigh ? Number(ipoB.priceBandHigh) : null,
                lotSize: ipoB.lotSize,
                issueSize: ipoB.issueSize ? Number(ipoB.issueSize) : null,
                openDate: ipoB.openDate?.toISOString() ?? null,
                closeDate: ipoB.closeDate?.toISOString() ?? null,
                listingDate: ipoB.listingDate?.toISOString() ?? null,
                allotmentDate: ipoB.allotmentDate?.toISOString() ?? null,
                registrar: ipoB.registrar,
                latestSubTotalX: ipoB.subscriptions[0]?.totalX ? Number(ipoB.subscriptions[0].totalX) : null,
                latestSubQibX: ipoB.subscriptions[0]?.qibX ? Number(ipoB.subscriptions[0].qibX) : null,
                latestSubRetailX: ipoB.subscriptions[0]?.retailX ? Number(ipoB.subscriptions[0].retailX) : null,
                latestGmp: ipoB.gmpEntries[0]?.gmp ? Number(ipoB.gmpEntries[0].gmp) : null,
                anchorCount: ipoB.anchors.length,
                anchorValueCr: ipoB.anchors.reduce((s, a) => s + (a.value ? Number(a.value) : 0), 0),
                listingPrice: ipoB.listing?.listingPrice ? Number(ipoB.listing.listingPrice) : null,
                listingGainPct: ipoB.listing?.listingGainsPct ? Number(ipoB.listing.listingGainsPct) : null,
              }
            : null,
        }}
      />
    </div>
  );
}
