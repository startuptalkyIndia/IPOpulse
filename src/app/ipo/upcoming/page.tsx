export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { IpoTable } from "@/components/ipo/IpoTable";

export const metadata: Metadata = {
  title: "Upcoming IPOs in India — full calendar with dates & price bands",
  description:
    "Every IPO in the pipeline — filed, approved, and announced. Mainboard + SME. See open/close dates, price band, lot size, and issue size.",
};

export const revalidate = 60;

export default async function UpcomingIpoPage() {
  const ipos = await prisma.ipo.findMany({
    where: { status: "upcoming" },
    orderBy: { openDate: "asc" },
    include: { listing: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Upcoming IPOs</h1>
      <p className="text-sm text-gray-600 mb-5">
        IPOs that are approved by SEBI and have announced dates. We update this list as soon as DRHPs turn into RHPs.
      </p>
      <IpoTable ipos={ipos} emptyText="No upcoming IPOs have announced dates yet." />
    </div>
  );
}
