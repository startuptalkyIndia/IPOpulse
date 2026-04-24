export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IpoStatusBadge } from "@/components/ipo/IpoStatusBadge";
import { computeIpoStatus, formatPriceBand, formatDate } from "@/lib/ipo";

export default async function WatchlistPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/signin?next=/my/watchlist");

  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const ipoSlugs = items.filter((i) => i.type === "ipo").map((i) => i.targetSlug);
  const stockSlugs = items.filter((i) => i.type === "stock").map((i) => i.targetSlug);

  const [ipos, stocks] = await Promise.all([
    ipoSlugs.length
      ? prisma.ipo.findMany({ where: { slug: { in: ipoSlugs } }, include: { listing: true } })
      : Promise.resolve([]),
    stockSlugs.length
      ? prisma.company.findMany({ where: { slug: { in: stockSlugs } } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
      </div>

      {/* IPOs */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Saved IPOs ({ipos.length})</h2>
        {ipos.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm text-gray-500">No IPOs saved yet. Tap the <span className="font-semibold">Save</span> button on any IPO page.</p>
            <Link href="/ipo" className="btn-primary inline-flex items-center gap-1 mt-3 text-sm">
              Browse IPOs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ipos.map((ipo) => (
              <Link key={ipo.id} href={`/ipo/${ipo.slug}`} className="card hover:border-indigo-300 transition">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{ipo.name}</h3>
                  <IpoStatusBadge status={computeIpoStatus(ipo)} />
                </div>
                <div className="text-xs text-gray-500">
                  {formatPriceBand(ipo)} · {ipo.type === "sme" ? "SME" : "Mainboard"}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Allotment {formatDate(ipo.allotmentDate)} · Listing {formatDate(ipo.listingDate)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Stocks */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Saved stocks ({stocks.length})</h2>
        {stocks.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-sm text-gray-500">No stocks saved yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {stocks.map((s) => (
              <Link key={s.id} href={`/ticker/${s.slug}`} className="card hover:border-indigo-300 transition">
                <div className="text-sm font-semibold text-gray-900 truncate">{s.name}</div>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5">{s.nseSymbol ?? s.bseCode}</div>
                <div className="text-[11px] text-gray-500 mt-1">{s.sector ?? ""}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
