import Link from "next/link";
import type { Ipo, IpoListing, IpoDrhpAnalysis, IpoGmp } from "@prisma/client";
import { formatPriceBand, formatIssueSize, formatDateRange, formatDate, computeIpoStatus } from "@/lib/ipo";
import { IpoStatusBadge } from "./IpoStatusBadge";
import { RiskScoreBadge } from "./RiskScoreBadge";
import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

type IpoWithListing = Ipo & {
  listing?: IpoListing | null;
  drhpAnalysis?: IpoDrhpAnalysis | null;
  /** latest GMP entry first (pass `take: 1, orderBy: { date: "desc" }`) */
  gmpEntries?: IpoGmp[];
};

interface Props {
  ipos: IpoWithListing[];
  variant?: "default" | "listed";
  emptyText?: string;
}

export function IpoTable({ ipos, variant = "default", emptyText = "No IPOs here right now." }: Props) {
  if (!ipos || ipos.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title={emptyText}
        description={
          variant === "listed"
            ? "Listed IPOs will appear here once they start trading on BSE / NSE."
            : "Check back soon — IPOs are added as SEBI approves them."
        }
        action={{ label: "See all IPOs", href: "/ipo" }}
        className="rounded-xl border border-gray-200 py-12"
      />
    );
  }

  // Show the Risk column only when at least one row has an analysis ready —
  // avoids an empty column on lists that pre-date DRHP intelligence.
  const showRisk = ipos.some((i) => i.drhpAnalysis?.status === "ready" && i.drhpAnalysis.riskScore != null);
  // GMP column only for non-listed lists where at least one row has data
  const showGmp = variant !== "listed" && ipos.some((i) => i.gmpEntries && i.gmpEntries.length > 0);

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
              {showGmp ? (
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-right" title="Grey Market Premium — unofficial, indicative only">GMP</th>
              ) : null}
              {showRisk ? (
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase text-left">Risk</th>
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
              const riskReady = ipo.drhpAnalysis?.status === "ready" && ipo.drhpAnalysis.riskScore != null;
              const gmp = ipo.gmpEntries?.[0] ? Number(ipo.gmpEntries[0].gmp) : null;
              const gmpPct = gmp != null && ipo.priceBandHigh ? (gmp / Number(ipo.priceBandHigh)) * 100 : null;
              const gmpClass = gmp == null || gmp === 0 ? "text-gray-400" : gmp > 0 ? "text-green-600" : "text-red-600";
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
                  {showGmp ? (
                    <td className={`px-3 py-3 text-sm text-right font-semibold tabular-nums ${gmpClass}`}>
                      {gmp == null ? "—" : (
                        <>
                          ₹{gmp.toFixed(0)}
                          {gmpPct != null ? (
                            <span className="block text-[11px] font-normal">
                              {gmpPct > 0 ? "+" : ""}{gmpPct.toFixed(1)}%
                            </span>
                          ) : null}
                        </>
                      )}
                    </td>
                  ) : null}
                  {showRisk ? (
                    <td className="px-3 py-3">
                      {riskReady ? (
                        <RiskScoreBadge
                          score={ipo.drhpAnalysis!.riskScore!}
                          band={ipo.drhpAnalysis!.riskBand}
                          size="sm"
                        />
                      ) : (
                        <span className="text-[11px] text-gray-400">—</span>
                      )}
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
