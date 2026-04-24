export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { IpoTable } from "@/components/ipo/IpoTable";
import { TrendingUp, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "IPO Dashboard — live, upcoming, closed & recently listed IPOs",
  description:
    "Track every Indian IPO in one place. Live subscription, GMP, allotment status, listing gains. Mainboard + SME. Updated in real time.",
};

export const revalidate = 60;

export default async function IpoHub() {
  const [live, upcoming, closed, recentlyListed] = await Promise.all([
    prisma.ipo.findMany({ where: { status: "live" }, orderBy: { closeDate: "asc" }, include: { listing: true } }),
    prisma.ipo.findMany({ where: { status: "upcoming" }, orderBy: { openDate: "asc" }, include: { listing: true }, take: 5 }),
    prisma.ipo.findMany({ where: { status: "closed" }, orderBy: { closeDate: "desc" }, include: { listing: true }, take: 5 }),
    prisma.ipo.findMany({
      where: { status: "listed" },
      orderBy: { listingDate: "desc" },
      include: { listing: true },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Open now", value: live.length, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "Upcoming", value: upcoming.length, icon: Clock, color: "text-indigo-600 bg-indigo-50" },
    { label: "Recently listed", value: recentlyListed.length, icon: CheckCircle2, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Indian IPO Dashboard</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Every mainboard and SME IPO in India — live subscription, GMP history, allotment, anchor investors,
          and listing performance. Structured data, no noise.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-lg font-bold text-gray-900 tabular-nums">{s.value}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Open now */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Open for subscription</h2>
          <Link href="/ipo/live" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <IpoTable ipos={live} emptyText="No IPOs are open for subscription right now." />
      </section>

      {/* Upcoming */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming IPOs</h2>
          <Link href="/ipo/upcoming" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <IpoTable ipos={upcoming} emptyText="No upcoming IPOs in the pipeline." />
      </section>

      {/* Recently listed */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recently listed</h2>
          <Link href="/ipo/listed" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <IpoTable ipos={recentlyListed} variant="listed" emptyText="No recent listings yet." />
      </section>

      {/* Closed */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Closed — awaiting allotment or listing</h2>
          <Link href="/ipo/closed" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <IpoTable ipos={closed} emptyText="Nothing in the closed bucket right now." />
      </section>
    </div>
  );
}
