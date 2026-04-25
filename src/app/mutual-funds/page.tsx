export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Mutual Funds India — every AMFI scheme with daily NAV",
  description:
    "Browse every Indian mutual fund scheme by AMC and category. Daily NAVs from AMFI. Direct plan finder, sector ETFs, debt funds, hybrid — all in one place.",
};

export default async function MutualFundsHub() {
  const total = await prisma.mutualFund.count().catch(() => 0);
  const byAmc = await prisma.mutualFund
    .groupBy({
      by: ["amc"],
      _count: true,
      where: { active: true },
      orderBy: { _count: { amc: "desc" } },
      take: 30,
    })
    .catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Mutual Funds</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Every Indian mutual fund scheme with daily NAV. Sourced directly from AMFI&apos;s public NAVAll feed.
          Browse by AMC or search by name. {total > 0 ? `${total.toLocaleString("en-IN")} schemes indexed.` : "Loading..."}
        </p>
      </div>

      {byAmc.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-500">
            Fund directory pipeline is wiring up. The AMFI NAV ingestion cron will populate this page within 24 hours.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-gray-900">Top AMCs by scheme count</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {byAmc.map((g) => (
              <Link
                key={g.amc ?? ""}
                href={`/mutual-funds/amc/${encodeURIComponent((g.amc ?? "").toLowerCase().replace(/\s+/g, "-"))}`}
                className="card hover:border-indigo-300 transition flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{g.amc ?? "Unknown"}</div>
                  <div className="text-[11px] text-gray-500">{(g._count as unknown as number).toLocaleString("en-IN")} schemes</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
