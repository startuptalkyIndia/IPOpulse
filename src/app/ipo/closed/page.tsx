export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { IpoTable } from "@/components/ipo/IpoTable";

export const metadata: Metadata = {
  title: "Closed IPOs — awaiting allotment or listing",
  description:
    "IPOs that have closed subscription and are awaiting allotment or listing. Check allotment and listing dates here.",
};

export const revalidate = 300;

export default async function ClosedIpoPage() {
  const ipos = await prisma.ipo.findMany({
    where: { status: "closed" },
    orderBy: { closeDate: "desc" },
    include: { listing: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Closed IPOs</h1>
      <p className="text-sm text-gray-600 mb-5">
        IPOs that have closed subscription and are waiting for allotment or listing day. Click a company for registrar
        allotment link and final subscription numbers.
      </p>
      <IpoTable ipos={ipos} emptyText="Nothing in the closed bucket right now." />
    </div>
  );
}
