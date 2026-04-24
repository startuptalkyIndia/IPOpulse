import Link from "next/link";
import type { Ipo, IpoListing } from "@prisma/client";
import { formatPriceBand, formatIssueSize, formatDateRange, formatDate, computeIpoStatus } from "@/lib/ipo";
import { IpoStatusBadge } from "./IpoStatusBadge";

type IpoWithListing = Ipo & { listing?: IpoListing | null };

interface Props {
  ipos: IpoWithListing[];
  variant?: "default" | "listed";
  emptyText?: string;
}

export function IpoTable({ ipos, variant = "default", emptyText = "No IPOs here right now." }: Props) {
  if (!ipos || ipos.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-sm text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Company</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Price band</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Lot</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Issue size</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">
                {variant === "listed" ? "Listed" : "Dates"}
              </th>
              {variant === "listed" ? (
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-right">List gain</th>
              ) : null}
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {ipos.map((ipo) => {
              const status = computeIpoStatus(ipo);
              const gain = ipo.listing?.listingGainsPct
                ? Number(ipo.listing.listingGainsPct)
                : null;
              const gainClass =
                gain == null ? "text-gray-400" : gain > 0 ? "text-green-600" : gain < 0 ? "text-red-600" : "text-gray-600";
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
                  <td className="px-3 py-3 text-sm text-gray-700 tabular-nums">{formatPriceBand(ipo)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 tabular-nums">{ipo.lotSize ?? "—"}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 tabular-nums">
                    {formatIssueSize(ipo.issueSize ? Number(ipo.issueSize) : null)}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700">
                    {variant === "listed"
                      ? formatDate(ipo.listingDate)
                      : formatDateRange(ipo.openDate, ipo.closeDate)}
                  </td>
                  {variant === "listed" ? (
                    <td className={`px-3 py-3 text-sm text-right font-semibold tabular-nums ${gainClass}`}>
                      {gain == null ? "—" : `${gain > 0 ? "+" : ""}${gain.toFixed(2)}%`}
                    </td>
                  ) : null}
                  <td className="px-3 py-3">
                    <IpoStatusBadge status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
