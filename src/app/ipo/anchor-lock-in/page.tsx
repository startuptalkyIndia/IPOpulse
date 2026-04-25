export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/ipo";

export const metadata: Metadata = {
  title: "IPO Anchor Lock-in Expiry Calendar — when do anchors unlock?",
  description:
    "Calendar of upcoming anchor investor lock-in expiries for recently-listed Indian IPOs. The 30-day and 90-day windows where institutional shares can hit the market.",
  alternates: { canonical: "/ipo/anchor-lock-in" },
};

interface UnlockEvent {
  ipoSlug: string;
  ipoName: string;
  ipoListingDate: Date | null;
  unlockDate: Date;
  unlockType: "30-day" | "90-day";
  unlockValueCr: number; // 50% (for 30d) or remaining 50% (for 90d) of anchor portion
  totalAnchorCr: number;
  daysAway: number;
}

export default async function AnchorLockInPage() {
  const now = new Date();
  const past90 = new Date(now.getTime() - 90 * 86400000);
  const next180 = new Date(now.getTime() + 180 * 86400000);

  // Pull listed IPOs in window with anchors
  const ipos = await prisma.ipo.findMany({
    where: {
      anchors: { some: {} },
      OR: [
        { listingDate: { gte: past90, lte: next180 } },
        { allotmentDate: { gte: past90, lte: next180 } },
      ],
    },
    include: { anchors: true },
    orderBy: { listingDate: "desc" },
    take: 100,
  });

  const events: UnlockEvent[] = [];
  for (const ipo of ipos) {
    if (!ipo.listingDate) continue;
    const totalAnchorCr = ipo.anchors.reduce((s, a) => s + (a.value ? Number(a.value) : 0), 0);
    const halfAnchorCr = totalAnchorCr / 2;
    // SEBI rule: 50% lock-in is 30 days post-allotment, remaining 50% is 90 days.
    // Allotment is typically 1-2 days before listing; we approximate against listing date.
    const lock30 = new Date(ipo.listingDate.getTime() + 30 * 86400000);
    const lock90 = new Date(ipo.listingDate.getTime() + 90 * 86400000);
    if (lock30 >= past90 && lock30 <= next180) {
      events.push({
        ipoSlug: ipo.slug,
        ipoName: ipo.name,
        ipoListingDate: ipo.listingDate,
        unlockDate: lock30,
        unlockType: "30-day",
        unlockValueCr: halfAnchorCr,
        totalAnchorCr,
        daysAway: Math.ceil((lock30.getTime() - now.getTime()) / 86400000),
      });
    }
    if (lock90 >= past90 && lock90 <= next180) {
      events.push({
        ipoSlug: ipo.slug,
        ipoName: ipo.name,
        ipoListingDate: ipo.listingDate,
        unlockDate: lock90,
        unlockType: "90-day",
        unlockValueCr: halfAnchorCr,
        totalAnchorCr,
        daysAway: Math.ceil((lock90.getTime() - now.getTime()) / 86400000),
      });
    }
  }

  events.sort((a, b) => a.unlockDate.getTime() - b.unlockDate.getTime());
  const upcoming = events.filter((e) => e.daysAway > 0);
  const totalUnlockingCr = upcoming.reduce((s, e) => s + e.unlockValueCr, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Anchor Investor Lock-in Calendar</h1>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl">
          Anchor investors in Indian IPOs get a discount but accept a SEBI-mandated lock-in: 50% unlocks at 30
          days post-allotment, the rest at 90 days. The day a lock-in expires is when anchor shares can hit the
          market — historically a meaningful supply event for listed IPOs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card">
          <div className="text-xs text-gray-500">Upcoming unlock events</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{upcoming.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Anchor value unlocking (180d)</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">
            {formatCurrency(totalUnlockingCr * 10000000)}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Next unlock</div>
          <div className="text-sm font-bold text-gray-900 mt-0.5 truncate">
            {upcoming[0] ? `${upcoming[0].ipoName} · ${formatDate(upcoming[0].unlockDate)}` : "—"}
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-500">No anchor lock-in events in the past 90 / next 180 day window.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">IPO</th>
                <th className="px-3 py-3">Listed</th>
                <th className="px-3 py-3">Lock-in</th>
                <th className="px-3 py-3">Unlock date</th>
                <th className="px-3 py-3">Days away</th>
                <th className="px-3 py-3 text-right">Value unlocking</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => {
                const past = e.daysAway < 0;
                return (
                  <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${past ? "opacity-50" : ""}`}>
                    <td className="px-3 py-3 text-sm">
                      <Link href={`/ipo/${e.ipoSlug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {e.ipoName}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{formatDate(e.ipoListingDate)}</td>
                    <td className="px-3 py-3">
                      <span className={`badge ${e.unlockType === "30-day" ? "bg-yellow-100 text-yellow-800" : "bg-orange-100 text-orange-800"}`}>
                        {e.unlockType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" /> {formatDate(e.unlockDate)}
                    </td>
                    <td className={`px-3 py-3 text-xs tabular-nums ${past ? "text-gray-400" : e.daysAway <= 7 ? "text-red-600 font-semibold" : "text-gray-700"}`}>
                      {past ? `${Math.abs(e.daysAway)}d ago` : `${e.daysAway}d`}
                    </td>
                    <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">
                      {formatCurrency(e.unlockValueCr * 10000000)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-gray-400 max-w-3xl">
        SEBI rule: Anchor investors must hold 50% of allotted shares for 30 days post-allotment, and the remaining
        50% for 90 days. Unlock dates above are computed from listing date + 30/90 days; actual allotment is
        usually 1-2 days before listing. Use this as a watchlist — not every unlock leads to a sell-off, but
        institutional supply often pressures the stock around these dates.
      </p>
    </div>
  );
}
