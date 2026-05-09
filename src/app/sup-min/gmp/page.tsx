import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GmpEntryForm } from "./GmpEntryForm";
import { ListingEntryForm } from "./ListingEntryForm";
import { SubscriptionEntryForm } from "./SubscriptionEntryForm";

export const dynamic = "force-dynamic";

export default async function AdminGmpPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");

  const activeIpos = await prisma.ipo.findMany({
    where: { status: { in: ["upcoming", "live", "closed"] } },
    orderBy: [{ status: "asc" }, { openDate: "asc" }],
    include: {
      gmpEntries: { orderBy: { date: "desc" }, take: 10 },
    },
  });

  // Recently listed IPOs without a listing record (need manual entry)
  const pendingListing = await prisma.ipo.findMany({
    where: {
      status: "listed",
      listing: null,
      listingDate: { gte: new Date(Date.now() - 90 * 86400_000) },
    },
    orderBy: { listingDate: "desc" },
    take: 20,
    select: { id: true, name: true, slug: true, priceBandHigh: true, listingDate: true },
  });

  const serializable = activeIpos.map((ipo) => ({
    id: ipo.id,
    name: ipo.name,
    slug: ipo.slug,
    type: ipo.type,
    status: ipo.status,
    priceBandHigh: ipo.priceBandHigh ? Number(ipo.priceBandHigh) : null,
    recentGmp: ipo.gmpEntries.map((g) => ({
      id: g.id,
      date: g.date.toISOString(),
      gmp: Number(g.gmp),
      kostak: g.kostak ? Number(g.kostak) : null,
      subjectToSauda: g.subjectToSauda ? Number(g.subjectToSauda) : null,
      source: g.source ?? "",
      notes: g.notes ?? "",
      enteredBy: g.enteredBy ?? "",
    })),
  }));

  const pendingListingSer = pendingListing.map((i) => ({
    id: i.id,
    name: i.name,
    slug: i.slug,
    issuePrice: i.priceBandHigh ? Number(i.priceBandHigh) : null,
    listingDate: i.listingDate ? i.listingDate.toISOString() : null,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <Link href="/sup-min/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily GMP Entry</h1>
        <p className="text-sm text-gray-500 mb-6">
          Record today's grey market premium for each active IPO. Entries auto-update the public pages.
        </p>
        <GmpEntryForm ipos={serializable} />
      </div>

      {/* Subscription entry */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Subscription Data Entry</h2>
        <p className="text-sm text-gray-500 mb-4">
          BSE API blocked — enter retail/HNI/QIB subscription figures manually from BSE or NSE website.
        </p>
        <SubscriptionEntryForm ipos={serializable.map(i => ({ id: i.id, name: i.name, status: i.status }))} />
      </div>

      {pendingListingSer.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Listing Price Entry</h2>
          <p className="text-sm text-gray-500 mb-4">
            These IPOs are marked &quot;listed&quot; but don&apos;t have a listing price recorded yet.
            The auto-sync runs at 8 PM — you can also enter manually here.
          </p>
          <ListingEntryForm ipos={pendingListingSer} />
        </div>
      )}
    </div>
  );
}
