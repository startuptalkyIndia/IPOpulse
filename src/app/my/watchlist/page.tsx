export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, ArrowRight, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IpoStatusBadge } from "@/components/ipo/IpoStatusBadge";
import { computeIpoStatus, formatPriceBand, formatDate } from "@/lib/ipo";
import { OnboardingChecklist } from "@/components/shared/OnboardingChecklist";
import { EmptyState } from "@/components/shared/EmptyState";

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

  const [ipos, stocks, gmpAlertsCount, userRecord] = await Promise.all([
    ipoSlugs.length
      ? prisma.ipo.findMany({ where: { slug: { in: ipoSlugs } }, include: { listing: true } })
      : Promise.resolve([]),
    stockSlugs.length
      ? prisma.company.findMany({ where: { slug: { in: stockSlugs } } })
      : Promise.resolve([]),
    // gmp_threshold alerts = user opted in to GMP daily nudges
    prisma.alert.count({ where: { userId, type: "gmp_threshold" } }).catch(() => 0),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }).catch(() => null),
  ]);

  // Onboarding completeness checks for the dashboard checklist below.
  const ipoCountInWatchlist = ipoSlugs.length;

  return (
    <div className="space-y-6">
      <OnboardingChecklist
        storageKey="ipopulse.onboardingChecklist.dismissed"
        title="Set up IPOpulse"
        steps={[
          {
            key: "profile",
            label: "Complete your profile",
            description: "Add your name so we can personalise alerts and digests.",
            href: "/my/account",
            done: Boolean(userRecord?.name),
          },
          {
            key: "watchlist",
            label: "Set your watchlist (5 IPOs)",
            description: "Track upcoming IPOs — open, allotment, and listing dates flow into your dashboard.",
            href: "/ipo",
            done: ipoCountInWatchlist >= 5,
          },
          {
            key: "gmp_alerts",
            label: "Enable GMP daily alerts",
            description: "Get the latest grey-market premium on tracked IPOs each morning.",
            href: "/my/account",
            done: gmpAlertsCount > 0,
          },
        ]}
      />

      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
      </div>

      {/* IPOs */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Saved IPOs ({ipos.length})</h2>
        {ipos.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No IPOs saved yet"
            description="Save an IPO and we'll track its allotment date, listing day, and GMP for you — in one place."
            action={{ label: "Browse open & upcoming IPOs", href: "/ipo" }}
            className="rounded-xl border border-gray-200"
          />
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
          <EmptyState
            icon={Star}
            title="No stocks saved yet"
            description="Open any stock page and tap Save to track it here."
            action={{ label: "Explore stocks", href: "/screener" }}
            className="rounded-xl border border-gray-200 py-8"
          />
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
