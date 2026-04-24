import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { IpoTable } from "@/components/ipo/IpoTable";

export const metadata: Metadata = {
  title: "SME IPOs — live, upcoming, and recently listed SME platform IPOs",
  description:
    "Dedicated SME IPO tracker — BSE SME + NSE Emerge. Live subscription, GMP, lot size (minimum ₹1 lakh), and listing performance.",
};

export const revalidate = 60;

export default async function SmeIpoPage() {
  const [live, upcoming, closed, listed] = await Promise.all([
    prisma.ipo.findMany({ where: { type: "sme", status: "live" }, orderBy: { closeDate: "asc" }, include: { listing: true } }),
    prisma.ipo.findMany({ where: { type: "sme", status: "upcoming" }, orderBy: { openDate: "asc" }, include: { listing: true } }),
    prisma.ipo.findMany({ where: { type: "sme", status: "closed" }, orderBy: { closeDate: "desc" }, include: { listing: true } }),
    prisma.ipo.findMany({ where: { type: "sme", status: "listed" }, orderBy: { listingDate: "desc" }, include: { listing: true }, take: 20 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">SME IPOs</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          SME IPOs on BSE SME and NSE Emerge platforms. Minimum investment is typically ₹1 lakh (market-maker rules).
          SME listings have delivered 100%+ average listing gains over the last two years — but with higher risk and
          lower liquidity than mainboard.
        </p>
      </div>

      {live.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Open for subscription</h2>
          <IpoTable ipos={live} />
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming SME IPOs</h2>
        <IpoTable ipos={upcoming} emptyText="No SME IPOs in the pipeline right now." />
      </section>

      {closed.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Closed — awaiting allotment or listing</h2>
          <IpoTable ipos={closed} />
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recently listed SME IPOs</h2>
        <IpoTable ipos={listed} variant="listed" emptyText="No SME listings in the period shown." />
      </section>
    </div>
  );
}
