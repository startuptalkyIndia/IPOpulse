export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Earnings Calendar India — quarterly results dates for BSE/NSE stocks",
  description:
    "Complete earnings calendar showing upcoming quarterly board meeting dates for every BSE/NSE listed company. Updated daily.",
  alternates: { canonical: "/earnings-calendar" },
};

export default async function EarningsCalendarPage() {
  const now = new Date();
  const in60 = new Date(now.getTime() + 60 * 86400000);
  const actions = await prisma.corporateAction.findMany({
    where: {
      actionType: { in: ["board_meeting", "agm"] },
      exDate: { gte: now, lte: in60 },
    },
    include: { company: true },
    orderBy: { exDate: "asc" },
    take: 200,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Earnings Calendar</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Upcoming board-meeting dates (where quarterly results are declared) and AGMs across BSE/NSE listed
          companies. Results dates update automatically from BSE corporate announcements.
        </p>
      </div>

      {actions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-500">No board meetings or AGMs are scheduled in the next 60 days. Check back closer to quarterly results season (Jan, Apr, Jul, Oct).</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Event</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm">
                    <Link href={`/ticker/${a.company?.slug ?? ""}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {a.company?.name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700 capitalize">{a.actionType.replace("_", " ")}</td>
                  <td className="px-3 py-3 text-xs text-gray-700">
                    {a.exDate ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(a.exDate) : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{a.purpose ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
