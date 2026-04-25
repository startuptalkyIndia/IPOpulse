export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Coins, Ruler, Building2, ExternalLink, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  computeIpoStatus,
  formatDate,
  formatDateRange,
  formatIssueSize,
  formatPriceBand,
  statusBadgeClass,
  statusLabel,
} from "@/lib/ipo";
import { GmpChart, type GmpPoint } from "@/components/ipo/GmpChart";
import { SubscriptionBar } from "@/components/ipo/SubscriptionBar";
import { WatchlistButton } from "@/components/WatchlistButton";
import { TrackApplicationButton } from "@/components/ipo/TrackApplicationButton";
import { SmeRiskCard } from "@/components/ipo/SmeRiskCard";
import { ListingPredictorCard } from "@/components/ipo/ListingPredictorCard";
import { formatCurrency } from "@/lib/format";
import { auth } from "@/lib/auth";
import { scoreSmeIpo } from "@/lib/sme-risk";
import { predictListingGain } from "@/lib/listing-predictor";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ipo = await prisma.ipo.findUnique({ where: { slug } });
  if (!ipo) return { title: "IPO not found" };
  return {
    title: `${ipo.name} IPO — GMP, subscription, allotment, review`,
    description: `${ipo.name} IPO details: price band ${formatPriceBand(ipo)}, lot ${ipo.lotSize ?? "—"}, issue size ${formatIssueSize(ipo.issueSize ? Number(ipo.issueSize) : null)}. Live GMP, subscription status, anchor list, allotment.`,
    alternates: { canonical: `/ipo/${slug}` },
  };
}

export default async function IpoDetailPage({ params }: Props) {
  const { slug } = await params;
  const ipo = await prisma.ipo.findUnique({
    where: { slug },
    include: {
      subscriptions: { orderBy: { capturedAt: "desc" } },
      gmpEntries: { orderBy: { date: "asc" } },
      anchors: { orderBy: { value: "desc" } },
      listing: true,
    },
  });

  if (!ipo) notFound();
  const status = computeIpoStatus(ipo);
  const latestSub = ipo.subscriptions[0];
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  let inWatchlist = false;
  let trackedApp = false;
  if (userId) {
    const [w, a] = await Promise.all([
      prisma.watchlistItem.findFirst({ where: { userId, type: "ipo", targetSlug: ipo.slug } }),
      prisma.ipoApplication.findFirst({ where: { userId, ipoId: ipo.id } }),
    ]);
    inWatchlist = !!w;
    trackedApp = !!a;
  }

  const gmpPoints: GmpPoint[] = ipo.gmpEntries.map((g) => ({
    date: g.date.toISOString(),
    gmp: Number(g.gmp),
    label: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(g.date),
  }));

  const latestGmp = ipo.gmpEntries[ipo.gmpEntries.length - 1];
  const estListingPrice = ipo.priceBandHigh && latestGmp
    ? Number(ipo.priceBandHigh) + Number(latestGmp.gmp)
    : null;
  const estListingGainPct =
    ipo.priceBandHigh && latestGmp
      ? (Number(latestGmp.gmp) / Number(ipo.priceBandHigh)) * 100
      : null;

  // SME risk scoring (only for SME IPOs)
  const smeRisk = ipo.type === "sme"
    ? scoreSmeIpo({
        type: ipo.type,
        issueSizeCr: ipo.issueSize ? Number(ipo.issueSize) : null,
        priceBandHigh: ipo.priceBandHigh ? Number(ipo.priceBandHigh) : null,
        lotSize: ipo.lotSize ?? null,
        latestSub: latestSub
          ? {
              retailX: latestSub.retailX ? Number(latestSub.retailX) : null,
              hniX: latestSub.hniX ? Number(latestSub.hniX) : null,
              qibX: latestSub.qibX ? Number(latestSub.qibX) : null,
              totalX: latestSub.totalX ? Number(latestSub.totalX) : null,
            }
          : null,
        anchorNames: ipo.anchors.map((a) => a.investorName),
        anchorTotalCr: ipo.anchors.reduce((s, a) => s + (a.value ? Number(a.value) : 0), 0),
      })
    : null;

  // Listing predictor (for live/closed pre-listing IPOs)
  const showPredictor = status === "live" || status === "closed";
  const prediction = showPredictor
    ? predictListingGain({
        type: ipo.type,
        issueSizeCr: ipo.issueSize ? Number(ipo.issueSize) : null,
        priceBandHigh: ipo.priceBandHigh ? Number(ipo.priceBandHigh) : null,
        totalSubX: latestSub?.totalX ? Number(latestSub.totalX) : null,
        qibX: latestSub?.qibX ? Number(latestSub.qibX) : null,
        retailX: latestSub?.retailX ? Number(latestSub.retailX) : null,
        latestGmp: latestGmp ? Number(latestGmp.gmp) : null,
      })
    : null;

  return (
    <div className="space-y-6">
      <Link href="/ipo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> IPO Dashboard
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase text-gray-400 font-medium">
                {ipo.type === "sme" ? "SME IPO" : "Mainboard IPO"}
              </span>
              <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{ipo.name}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {formatDateRange(ipo.openDate, ipo.closeDate)}
              {ipo.listingDate ? ` · Listing ${formatDate(ipo.listingDate)}` : ""}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <WatchlistButton type="ipo" targetSlug={ipo.slug} initial={inWatchlist} authed={!!userId} />
            <TrackApplicationButton ipoId={ipo.id} ipoName={ipo.name} initial={trackedApp} authed={!!userId} />
            {ipo.registrarUrl ? (
              <a
                href={ipo.registrarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs inline-flex items-center gap-1"
              >
                Check Allotment <ExternalLink className="w-3 h-3" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Stat icon={<Coins className="w-4 h-4" />} label="Price band" value={formatPriceBand(ipo)} />
          <Stat
            icon={<Ruler className="w-4 h-4" />}
            label="Lot size"
            value={ipo.lotSize ? `${ipo.lotSize} shares` : "—"}
          />
          <Stat
            icon={<Building2 className="w-4 h-4" />}
            label="Issue size"
            value={formatIssueSize(ipo.issueSize ? Number(ipo.issueSize) : null)}
          />
          <Stat
            icon={<Calendar className="w-4 h-4" />}
            label="Listing"
            value={formatDate(ipo.listingDate)}
          />
        </div>
      </div>

      {/* SME Risk + Listing Predictor row */}
      {(smeRisk || prediction) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {smeRisk ? <SmeRiskCard risk={smeRisk} /> : <div />}
          {prediction ? <ListingPredictorCard prediction={prediction} /> : null}
        </div>
      ) : null}

      {/* GMP + Subscription row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GMP */}
        <div className="card">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Grey Market Premium</h2>
            {latestGmp ? (
              <span className="text-2xl font-bold text-indigo-600 tabular-nums">
                ₹{Number(latestGmp.gmp).toFixed(0)}
              </span>
            ) : null}
          </div>
          <GmpChart data={gmpPoints} priceBandHigh={ipo.priceBandHigh ? Number(ipo.priceBandHigh) : undefined} />
          {estListingPrice && estListingGainPct != null ? (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Est. listing price</div>
                <div className="text-sm font-semibold text-gray-900 tabular-nums">
                  ₹{estListingPrice.toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Est. listing gain</div>
                <div
                  className={`text-sm font-semibold tabular-nums ${estListingGainPct > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {estListingGainPct > 0 ? "+" : ""}
                  {estListingGainPct.toFixed(2)}%
                </div>
              </div>
            </div>
          ) : null}
          <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
            GMP is the unofficial premium at which IPO applications trade in the grey market before listing. It's indicative
            only, sourced from unofficial dealers. Not a guarantee of listing gain.
          </p>
        </div>

        {/* Subscription */}
        <div className="card">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Subscription status</h2>
            {latestSub ? (
              <span className="text-xs text-gray-500">
                as of{" "}
                {new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(latestSub.capturedAt)}
              </span>
            ) : null}
          </div>
          {latestSub ? (
            <div className="space-y-3">
              <SubscriptionBar label="Retail" value={latestSub.retailX ? Number(latestSub.retailX) : null} />
              <SubscriptionBar label="HNI" value={latestSub.hniX ? Number(latestSub.hniX) : null} />
              <SubscriptionBar label="QIB" value={latestSub.qibX ? Number(latestSub.qibX) : null} />
              {latestSub.employeeX ? (
                <SubscriptionBar label="Employee" value={Number(latestSub.employeeX)} />
              ) : null}
              <div className="pt-3 border-t border-gray-100">
                <SubscriptionBar label="Total" value={latestSub.totalX ? Number(latestSub.totalX) : null} />
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-6 text-center">
              Subscription data available once the issue opens.
            </div>
          )}
        </div>
      </div>

      {/* Listing performance if listed */}
      {ipo.listing ? (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Listing day performance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat
              label="Listing price"
              value={formatCurrency(Number(ipo.listing.listingPrice))}
            />
            <Stat
              label="Listing gain"
              value={`${Number(ipo.listing.listingGainsPct) > 0 ? "+" : ""}${Number(ipo.listing.listingGainsPct).toFixed(2)}%`}
              valueClass={Number(ipo.listing.listingGainsPct) > 0 ? "text-green-600" : "text-red-600"}
            />
            <Stat
              label="Day close"
              value={ipo.listing.dayClose ? formatCurrency(Number(ipo.listing.dayClose)) : "—"}
            />
            <Stat
              label="GMP at listing"
              value={ipo.listing.gmpAtListing ? `₹${Number(ipo.listing.gmpAtListing).toFixed(0)}` : "—"}
            />
          </div>
        </div>
      ) : null}

      {/* Objects of issue */}
      {ipo.objectsOfIssue ? (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" /> Objects of the issue
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{ipo.objectsOfIssue}</p>
        </div>
      ) : null}

      {/* Anchors */}
      {ipo.anchors.length > 0 ? (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Anchor investors</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 pr-3">Investor</th>
                  <th className="py-2 pr-3 text-right">Shares allocated</th>
                  <th className="py-2 pr-3 text-right">Price</th>
                  <th className="py-2 text-right">Value (Cr)</th>
                </tr>
              </thead>
              <tbody>
                {ipo.anchors.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100">
                    <td className="py-2.5 pr-3 text-sm text-gray-800">{a.investorName}</td>
                    <td className="py-2.5 pr-3 text-sm text-gray-700 text-right tabular-nums">
                      {a.allocation ? a.allocation.toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="py-2.5 pr-3 text-sm text-gray-700 text-right tabular-nums">
                      {a.pricePerShare ? `₹${Number(a.pricePerShare).toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 text-sm text-gray-900 text-right tabular-nums font-medium">
                      {a.value ? `₹${Number(a.value).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Key info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Key dates</h3>
          <dl className="text-sm space-y-2">
            <KV k="Opens" v={formatDate(ipo.openDate)} />
            <KV k="Closes" v={formatDate(ipo.closeDate)} />
            <KV k="Allotment" v={formatDate(ipo.allotmentDate)} />
            <KV k="Listing" v={formatDate(ipo.listingDate)} />
          </dl>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Key details</h3>
          <dl className="text-sm space-y-2">
            <KV k="Face value" v={ipo.faceValue ? `₹${Number(ipo.faceValue).toFixed(0)}` : "—"} />
            <KV k="Registrar" v={ipo.registrar ?? "—"} />
            <KV k="Lead managers" v={ipo.leadManagers ?? "—"} />
            <KV k="BSE code" v={ipo.bseCode ?? "—"} />
            <KV k="NSE symbol" v={ipo.nseSymbol ?? "—"} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  valueClass = "text-gray-900",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500 flex items-center gap-1">
        {icon} {label}
      </div>
      <div className={`text-sm font-semibold mt-0.5 tabular-nums ${valueClass}`}>{value}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500">{k}</dt>
      <dd className="text-gray-900 font-medium text-right">{v ?? "—"}</dd>
    </div>
  );
}
