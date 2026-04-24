export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { IpoTable } from "@/components/ipo/IpoTable";

export const metadata: Metadata = {
  title: "Recently listed IPOs — listing day gains & performance",
  description:
    "All IPOs listed in the last 12 months with listing gains, day-one close, and post-listing performance.",
};

export const revalidate = 300;

export default async function ListedIpoPage() {
  const ipos = await prisma.ipo.findMany({
    where: { status: "listed" },
    orderBy: { listingDate: "desc" },
    include: { listing: true },
    take: 200,
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Listed IPOs</h1>
      <p className="text-sm text-gray-600 mb-5">
        Every IPO that has listed on BSE/NSE — sorted by most recent first. Listing gains and day-one close shown alongside.
      </p>
      <IpoTable ipos={ipos} variant="listed" emptyText="No listed IPOs yet." />
    </div>
  );
}
