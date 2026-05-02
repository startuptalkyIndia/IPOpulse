export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AccuracyAnalysis } from "./AccuracyAnalysis";

export const metadata: Metadata = {
  title: "IPO GMP Accuracy Scorecard — did GMP actually predict listing gain?",
  description:
    "Honest retrospective of every listed IPO's GMP vs actual listing gain. Distribution of error, filter by SME/mainboard, and see how reliable grey market premium really is.",
  alternates: { canonical: "/ipo/gmp-accuracy" },
};

export default async function GmpAccuracyPage() {
  const listed = await prisma.ipo.findMany({
    where: { status: "listed", listing: { isNot: null } },
    include: { listing: true },
    orderBy: { listingDate: "desc" },
    take: 200,
  });

  const rows = listed.flatMap((ipo) => {
    if (!ipo.listing) return [];
    const priceHigh = ipo.priceBandHigh ? Number(ipo.priceBandHigh) : null;
    const gmp = ipo.listing.gmpAtListing != null ? Number(ipo.listing.gmpAtListing) : null;
    const actualPct = Number(ipo.listing.listingGainsPct);
    const predictedPct = priceHigh && gmp != null ? (gmp / priceHigh) * 100 : null;
    const error = predictedPct != null ? predictedPct - actualPct : null;
    return [{
      slug: ipo.slug,
      name: ipo.name,
      type: ipo.type,
      priceHigh,
      // Serialize Date for the client component
      listingDate: ipo.listingDate ? ipo.listingDate.toISOString() : null,
      gmpAtListing: gmp,
      actualListingPct: actualPct,
      predictedPct,
      error,
    }];
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">GMP Accuracy Scorecard</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          How often does grey-market premium actually predict the real listing gain? This page is an honest
          retrospective for every listed IPO — we compare the GMP on listing eve to the actual listing price.
          Filter by mainboard vs SME, sort by error magnitude, and see the full error distribution. No one else
          publishes this transparency.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-500">
            No listed IPOs with both GMP and listing price data yet. As IPOs list, this page fills up
            automatically.
          </p>
        </div>
      ) : (
        <AccuracyAnalysis rows={rows} />
      )}

      <p className="text-[11px] text-gray-400 max-w-3xl">
        &quot;Error&quot; is measured in percentage points (pp). Positive error means GMP over-estimated the listing gain
        (i.e. listing was worse than GMP predicted). Negative means GMP underestimated (you got more upside than
        the grey market priced in). Data updates automatically as new IPOs list.
      </p>
    </div>
  );
}
