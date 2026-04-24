export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPriceBand, formatDate, computeIpoStatus, statusBadgeClass, statusLabel } from "@/lib/ipo";

export const metadata: Metadata = {
  title: "IPO Calendar — upcoming, live & recently listed IPOs by date",
  description:
    "Complete IPO calendar showing open, close, allotment, and listing dates for every IPO over the next 90 days. Mainboard + SME.",
};

export const revalidate = 300;

export default async function IpoCalendarPage() {
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const to = new Date();
  to.setDate(to.getDate() + 90);

  const ipos = await prisma.ipo.findMany({
    where: {
      OR: [
        { openDate: { gte: from, lte: to } },
        { listingDate: { gte: from, lte: to } },
      ],
    },
    orderBy: { openDate: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">IPO Calendar</h1>
      <p className="text-sm text-gray-600 mb-5">
        All IPOs with open/close/allotment/listing dates in the past 30 days to next 90 days.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Company</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Opens</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Closes</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Allotment</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Listing</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Price band</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {ipos.map((ipo) => {
                const status = computeIpoStatus(ipo);
                return (
                  <tr key={ipo.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm">
                      <Link href={`/ipo/${ipo.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {ipo.name}
                      </Link>
                      <div className="text-xs text-gray-400 mt-0.5 uppercase">
                        {ipo.type === "sme" ? "SME" : "Mainboard"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">{formatDate(ipo.openDate)}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{formatDate(ipo.closeDate)}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{formatDate(ipo.allotmentDate)}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{formatDate(ipo.listingDate)}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 tabular-nums">{formatPriceBand(ipo)}</td>
                    <td className="px-3 py-3">
                      <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>
                    </td>
                  </tr>
                );
              })}
              {ipos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-sm text-gray-500">
                    No IPOs in the calendar window.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
