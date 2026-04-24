export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "IPO GMP Accuracy Scorecard — did GMP actually predict listing gain?",
  description:
    "Honest retrospective of every listed IPO's GMP vs actual listing gain. Transparency on how reliable grey market premium really is.",
  alternates: { canonical: "/ipo/gmp-accuracy" },
};

interface Row {
  slug: string;
  name: string;
  type: string;
  priceHigh: number | null;
  listingDate: Date | null;
  gmpAtListing: number | null;
  actualListingPrice: number;
  actualListingPct: number;
  predictedPct: number | null;
  error: number | null;
}

export default async function GmpAccuracyPage() {
  const listed = await prisma.ipo.findMany({
    where: { status: "listed", listing: { isNot: null } },
    include: { listing: true },
    orderBy: { listingDate: "desc" },
    take: 200,
  });

  const rows: Row[] = listed.flatMap((ipo) => {
    if (!ipo.listing) return [];
    const priceHigh = ipo.priceBandHigh ? Number(ipo.priceBandHigh) : null;
    const gmp = ipo.listing.gmpAtListing != null ? Number(ipo.listing.gmpAtListing) : null;
    const actualPrice = Number(ipo.listing.listingPrice);
    const actualPct = Number(ipo.listing.listingGainsPct);
    const predictedPct = priceHigh && gmp != null ? (gmp / priceHigh) * 100 : null;
    const error = predictedPct != null ? predictedPct - actualPct : null;
    return [{
      slug: ipo.slug,
      name: ipo.name,
      type: ipo.type,
      priceHigh,
      listingDate: ipo.listingDate,
      gmpAtListing: gmp,
      actualListingPrice: actualPrice,
      actualListingPct: actualPct,
      predictedPct,
      error,
    }];
  });

  const withGmp = rows.filter((r) => r.predictedPct != null);
  const avgAbsError = withGmp.length
    ? withGmp.reduce((s, r) => s + Math.abs(r.error ?? 0), 0) / withGmp.length
    : 0;
  const withinTen = withGmp.filter((r) => Math.abs(r.error ?? 0) <= 10).length;
  const withinTenPct = withGmp.length ? (withinTen / withGmp.length) * 100 : 0;
  const overestimated = withGmp.filter((r) => (r.error ?? 0) > 0).length;
  const overestimatedPct = withGmp.length ? (overestimated / withGmp.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">GMP Accuracy Scorecard</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          How often does grey-market premium actually predict the real listing gain? This page is an honest
          retrospective for every listed IPO — we compare the GMP on listing eve to the actual listing price.
          No one else publishes this transparency.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card">
          <div className="text-xs text-gray-500">IPOs analysed</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{withGmp.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Avg prediction error</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{avgAbsError.toFixed(1)}%</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Within ±10% of actual</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{withinTenPct.toFixed(0)}%</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Overestimated</div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{overestimatedPct.toFixed(0)}%</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-500">No listed IPOs with both GMP and listing price data yet. As IPOs list, this page fills up automatically.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Listed</th>
                  <th className="px-3 py-3 text-right">Issue price</th>
                  <th className="px-3 py-3 text-right">GMP at listing</th>
                  <th className="px-3 py-3 text-right">Predicted gain</th>
                  <th className="px-3 py-3 text-right">Actual gain</th>
                  <th className="px-3 py-3 text-right">Error</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const errColor = r.error == null ? "text-gray-400" : Math.abs(r.error) < 5 ? "text-green-600" : Math.abs(r.error) < 15 ? "text-yellow-600" : "text-red-600";
                  return (
                    <tr key={r.slug} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm">
                        <Link href={`/ipo/${r.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {r.name}
                        </Link>
                        <div className="text-[11px] text-gray-400 mt-0.5">{r.type === "sme" ? "SME" : "Mainboard"}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {r.listingDate ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "2-digit" }).format(r.listingDate) : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-700 text-right tabular-nums">{r.priceHigh ? `₹${r.priceHigh}` : "—"}</td>
                      <td className="px-3 py-3 text-xs text-gray-700 text-right tabular-nums">{r.gmpAtListing != null ? `₹${r.gmpAtListing}` : "—"}</td>
                      <td className="px-3 py-3 text-xs text-gray-700 text-right tabular-nums">{r.predictedPct != null ? `${r.predictedPct >= 0 ? "+" : ""}${r.predictedPct.toFixed(1)}%` : "—"}</td>
                      <td className={`px-3 py-3 text-xs text-right tabular-nums font-semibold ${r.actualListingPct >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {r.actualListingPct >= 0 ? "+" : ""}{r.actualListingPct.toFixed(2)}%
                      </td>
                      <td className={`px-3 py-3 text-xs text-right tabular-nums font-medium ${errColor}`}>
                        {r.error == null ? "—" : `${r.error >= 0 ? "+" : ""}${r.error.toFixed(1)}pp`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-400 max-w-3xl">
        &quot;Error&quot; is measured in percentage points (pp). Positive error means GMP over-estimated the listing gain.
        Data updates automatically as new IPOs list. Currency: {formatCurrency(0).slice(0, 1)}.
      </p>
    </div>
  );
}
