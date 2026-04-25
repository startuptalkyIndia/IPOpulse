export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { prisma } from "@/lib/db";
import { scoreSmeIpo } from "@/lib/sme-risk";
import { formatPriceBand, formatIssueSize, formatDate, computeIpoStatus, statusBadgeClass, statusLabel } from "@/lib/ipo";

export const metadata: Metadata = {
  title: "SME IPO Risk Score — find quality SME IPOs vs pump-and-dumps",
  description:
    "Free SME IPO risk-scoring tool. Combines QIB demand, issue size, lot value, anchor quality and subscription pattern into a single 0-100 score. The SEBI-flagged warning signs in one place.",
  alternates: { canonical: "/ipo/sme-risk" },
};

export default async function SmeRiskHub() {
  const ipos = await prisma.ipo.findMany({
    where: { type: "sme", status: { in: ["upcoming", "live", "closed", "listed"] } },
    include: {
      anchors: true,
      subscriptions: { orderBy: { capturedAt: "desc" }, take: 1 },
    },
    orderBy: { openDate: "desc" },
    take: 100,
  });

  const scored = ipos.map((ipo) => {
    const latest = ipo.subscriptions[0];
    const score = scoreSmeIpo({
      type: ipo.type,
      issueSizeCr: ipo.issueSize ? Number(ipo.issueSize) : null,
      priceBandHigh: ipo.priceBandHigh ? Number(ipo.priceBandHigh) : null,
      lotSize: ipo.lotSize ?? null,
      latestSub: latest
        ? {
            retailX: latest.retailX ? Number(latest.retailX) : null,
            hniX: latest.hniX ? Number(latest.hniX) : null,
            qibX: latest.qibX ? Number(latest.qibX) : null,
            totalX: latest.totalX ? Number(latest.totalX) : null,
          }
        : null,
      anchorNames: ipo.anchors.map((a) => a.investorName),
      anchorTotalCr: ipo.anchors.reduce((s, a) => s + (a.value ? Number(a.value) : 0), 0),
    });
    return { ipo, score };
  });

  scored.sort((a, b) => b.score.score - a.score.score);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">SME IPO Risk Scorecard</h1>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl">
          Indian SME IPOs have delivered some of the market&apos;s biggest winners — and biggest blow-ups. Our
          heuristic score combines issue size, QIB demand, lot value, anchor quality and subscription pattern into
          a single 0-100 number, with the underlying factors visible. Higher score = lower risk.
        </p>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3">What goes into the score</h2>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
          <li><strong>Issue size:</strong> &lt;₹25 Cr is a yellow flag. Floats &lt;₹25 Cr are easy to corner post-listing.</li>
          <li><strong>QIB demand:</strong> Strong QIB participation (≥5x) means institutions did real diligence. Retail-only frenzy with QIB &lt;1x is the classic warning.</li>
          <li><strong>Total subscription:</strong> &gt;400x suggests circular bidding (SEBI itself has called this out).</li>
          <li><strong>Lot value:</strong> &gt;₹2.5L lot value restricts genuine retail and concentrates risk.</li>
          <li><strong>Anchor quality:</strong> Tier-1 anchors (HDFC MF, SBI MF, ICICI Pru, Axis MF etc.) signal due-diligence rigour.</li>
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Price band</th>
              <th className="px-3 py-3">Issue size</th>
              <th className="px-3 py-3">Open</th>
              <th className="px-3 py-3 text-right">Risk score</th>
            </tr>
          </thead>
          <tbody>
            {scored.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-12 text-center text-sm text-gray-500">
                  No SME IPOs in the index yet.
                </td>
              </tr>
            ) : null}
            {scored.map(({ ipo, score }) => (
              <tr key={ipo.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm">
                  <Link href={`/ipo/${ipo.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                    {ipo.name}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <span className={statusBadgeClass(computeIpoStatus(ipo))}>
                    {statusLabel(computeIpoStatus(ipo))}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-gray-700 tabular-nums">{formatPriceBand(ipo)}</td>
                <td className="px-3 py-3 text-sm text-gray-700 tabular-nums">
                  {formatIssueSize(ipo.issueSize ? Number(ipo.issueSize) : null)}
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">{formatDate(ipo.openDate)}</td>
                <td className="px-3 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <span className={`badge ${score.bandColorClass}`}>{score.bandLabel}</span>
                    <span className="text-base font-bold text-indigo-700 tabular-nums">{score.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
