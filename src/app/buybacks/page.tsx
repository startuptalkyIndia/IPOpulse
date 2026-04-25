export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Coins } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/ipo";

export const metadata: Metadata = {
  title: "Share Buybacks India — active buybacks with retail acceptance odds",
  description:
    "Every active and recent share buyback in India. Tender route vs open market, record date, premium, retail reservation %, and acceptance ratio estimate.",
  alternates: { canonical: "/buybacks" },
};

interface Row {
  slug: string;
  name: string;
  exDate: Date | null;
  recordDate: Date | null;
  buybackPrice: number | null;
  purpose: string | null;
}

export default async function BuybacksPage() {
  const now = new Date();
  const past120 = new Date(now.getTime() - 120 * 86400000);
  const next120 = new Date(now.getTime() + 120 * 86400000);

  const actions = await prisma.corporateAction.findMany({
    where: {
      actionType: "buyback",
      OR: [
        { exDate: { gte: past120, lte: next120 } },
        { recordDate: { gte: past120, lte: next120 } },
      ],
    },
    include: { company: true },
    orderBy: { exDate: "asc" },
    take: 100,
  });

  const rows: Row[] = actions.map((a) => ({
    slug: a.company?.slug ?? "",
    name: a.company?.name ?? "—",
    exDate: a.exDate,
    recordDate: a.recordDate,
    buybackPrice: a.value ? Number(a.value) : null,
    purpose: a.purpose,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Coins className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Share Buyback Tracker</h1>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl">
          Every active and recent share buyback in India. We track tender-route buybacks (where retail typically
          gets a 15% reservation) and open-market buybacks. Acceptance ratio is what determines your real return —
          retail tendering odds are usually 50–95% depending on issue size and reservation.
        </p>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-2">How buybacks work for retail</h2>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Tender route</strong>: Company invites shareholders to tender shares at a fixed price. Retail
            (≤₹2L holding) gets a 15% mandatory reservation under SEBI rules. You tender via your broker; if
            oversubscribed, partial acceptance.
          </li>
          <li>
            <strong>Open market</strong>: Company buys shares from the market over 6 months. No tender needed —
            retail benefits passively as price rises toward the buyback ceiling.
          </li>
          <li>
            <strong>Acceptance ratio</strong>: For tender-route, acceptance = (your shares × 15% reservation × buyback size) / total retail shares tendered. Highly oversubscribed buybacks have low acceptance (~30%); under-subscribed buybacks accept 100%.
          </li>
          <li>
            <strong>Tax</strong>: Post Budget 2024, buyback proceeds are taxed as <strong>dividend income</strong> at your slab — and the original buy cost becomes a capital loss to offset gains. Big change vs the old &quot;tax-free&quot; era.
          </li>
        </ul>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-500">
            No buybacks in the past 120 / next 120 day window. New buybacks populate automatically as BSE
            announces them.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Ex / Record</th>
                <th className="px-3 py-3 text-right">Buyback price</th>
                <th className="px-3 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm">
                    {r.slug ? (
                      <Link href={`/ticker/${r.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">{r.name}</Link>
                    ) : (
                      <span className="font-medium text-gray-900">{r.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">
                    {r.exDate ? `Ex ${formatDate(r.exDate)}` : ""}
                    {r.recordDate ? ` · Rec ${formatDate(r.recordDate)}` : ""}
                  </td>
                  <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">
                    {r.buybackPrice ? formatCurrency(r.buybackPrice) : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{r.purpose ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
