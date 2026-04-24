export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Corporate Actions Calendar — dividends, splits, bonus, rights, buybacks",
  description:
    "Complete calendar of Indian corporate actions. Ex-dates, record dates, and purposes for every BSE/NSE listed company.",
};

const typeLabels: Record<string, string> = {
  dividend: "Dividend",
  split: "Split",
  bonus: "Bonus",
  rights: "Rights Issue",
  buyback: "Buyback",
  agm: "AGM",
  board_meeting: "Board Meeting",
};

const typeColor: Record<string, string> = {
  dividend: "bg-green-100 text-green-800",
  split: "bg-purple-100 text-purple-800",
  bonus: "bg-indigo-100 text-indigo-800",
  rights: "bg-blue-100 text-blue-800",
  buyback: "bg-orange-100 text-orange-800",
  agm: "bg-gray-100 text-gray-700",
  board_meeting: "bg-yellow-100 text-yellow-800",
};

export default async function CorporateActionsPage() {
  const now = new Date();
  const next60 = new Date(now.getTime() + 60 * 86400000);
  const past30 = new Date(now.getTime() - 30 * 86400000);

  const actions = await prisma.corporateAction.findMany({
    where: { exDate: { gte: past30, lte: next60 } },
    include: { company: true },
    orderBy: { exDate: "asc" },
    take: 200,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Corporate Actions Calendar</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          All ex-dividend, split, bonus, rights issue, buyback, and AGM dates across BSE/NSE listed companies.
          Sourced from BSE corporate announcements feed.
        </p>
      </div>

      {actions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-500">
            Corporate actions pipeline is wiring up. Check back once the BSE scraper cron goes live.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Company</th>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Type</th>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Ex-date</th>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Record date</th>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{a.company?.name ?? "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`badge ${typeColor[a.actionType] ?? "bg-gray-100 text-gray-700"}`}>
                        {typeLabels[a.actionType] ?? a.actionType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">
                      {a.exDate
                        ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(a.exDate)
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">
                      {a.recordDate
                        ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(a.recordDate)
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">
                      {a.ratio ?? (a.value ? `₹${Number(a.value).toFixed(2)}` : a.purpose ?? "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
