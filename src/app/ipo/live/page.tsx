import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { IpoTable } from "@/components/ipo/IpoTable";

export const metadata: Metadata = {
  title: "Live IPOs today — current subscription status & GMP",
  description:
    "All IPOs open for subscription right now. Live subscription status, GMP, lot size, and apply deadlines. Mainboard + SME.",
};

export const revalidate = 60;

export default async function LiveIpoPage() {
  const ipos = await prisma.ipo.findMany({
    where: { status: "live" },
    orderBy: { closeDate: "asc" },
    include: { listing: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Live IPOs</h1>
      <p className="text-sm text-gray-600 mb-5">
        IPOs currently open for subscription. Click a company to see live category-wise subscription, GMP history, and anchor investor list.
      </p>
      <IpoTable ipos={ipos} emptyText="No IPOs are open for subscription right now. Check upcoming or listed tabs." />
    </div>
  );
}
