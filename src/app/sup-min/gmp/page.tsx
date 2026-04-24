import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GmpEntryForm } from "./GmpEntryForm";

export const dynamic = "force-dynamic";

export default async function AdminGmpPage() {
  const session = await auth();
  if (!session?.user) redirect("/sup-min");

  const activeIpos = await prisma.ipo.findMany({
    where: { status: { in: ["upcoming", "live", "closed"] } },
    orderBy: [{ status: "asc" }, { openDate: "asc" }],
    include: {
      gmpEntries: { orderBy: { date: "desc" }, take: 10 },
    },
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/sup-min/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily GMP Entry</h1>
      <p className="text-sm text-gray-500 mb-6">
        Record today's grey market premium for each active IPO. Entries auto-update the public pages.
      </p>

      <GmpEntryForm ipos={serializable} />
    </div>
  );
}
