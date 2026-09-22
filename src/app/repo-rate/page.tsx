export const dynamic = "force-dynamic";
export const revalidate = 3600;

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatTile } from "@/components/ui/StatTile";
import { FaqAccordion } from "@/components/calculators/FaqAccordion";

export const metadata: Metadata = {
  title: "RBI Repo Rate Today — Current Rate & Full MPC History",
  description:
    "Current RBI repo rate and the complete history of every Monetary Policy Committee (MPC) decision since 2016 — hikes, cuts, and holds.",
  alternates: { canonical: "/repo-rate" },
};

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export default async function RepoRatePage() {
  const rows = await prisma.rbiRepoRate.findMany({ orderBy: { effectiveDate: "desc" } });
  const current = rows[0];

  // Days since the last actual rate change. Not a meeting count — this table
  // only stores rows where the rate CHANGED, not every hold decision, so
  // counting rows would undercount (e.g. 4+ bi-monthly holds since the last
  // change would show as "1" if only the change itself is a row).
  const daysSinceChange = current
    ? Math.floor((Date.now() - current.effectiveDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">RBI Repo Rate</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          The repo rate is what the RBI charges commercial banks for short-term borrowing — it's the anchor
          for FD rates, home/car/personal loan rates, and EMIs across India. Set by the Monetary Policy
          Committee (MPC) roughly every 2 months.
        </p>
      </div>

      {current ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Current repo rate" value={`${Number(current.ratePercent).toFixed(2)}%`} valueColor="text-indigo-700" tint="indigo" />
          <StatTile label="Effective since" value={fmtDate(current.effectiveDate)} />
          <StatTile
            label="Last change"
            value={
              current.changeBps == null
                ? "—"
                : `${current.changeBps > 0 ? "+" : ""}${current.changeBps} bps`
            }
            valueColor={current.changeBps != null && current.changeBps > 0 ? "text-red-600" : "text-emerald-600"}
          />
          <StatTile label="Held for" value={`${daysSinceChange} days`} />
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-sm text-gray-500">Repo rate data not yet available.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/calculators/fd" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">FD Calculator →</div>
          <div className="text-xs text-gray-500 mt-1">See how the repo rate feeds into bank FD rates</div>
        </Link>
        <Link href="/calculators/car-loan-emi" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">Loan EMI Calculator →</div>
          <div className="text-xs text-gray-500 mt-1">Most floating-rate loans are repo-linked (RLLR)</div>
        </Link>
        <Link href="/calculators/rd" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">RD Calculator →</div>
          <div className="text-xs text-gray-500 mt-1">Recurring deposit rates move with the repo rate too</div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">MPC decision history</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Every rate change since the Monetary Policy Committee was formed in October 2016. Meetings that held
            the rate unchanged aren't listed individually — see "held for" above.
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-xs font-medium text-gray-500 uppercase text-left">Effective date</th>
              <th className="px-3 py-2.5 text-xs font-medium text-gray-500 uppercase text-left">Rate</th>
              <th className="px-3 py-2.5 text-xs font-medium text-gray-500 uppercase text-left">Change</th>
              <th className="px-3 py-2.5 text-xs font-medium text-gray-500 uppercase text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2.5 text-sm text-gray-900 whitespace-nowrap">{fmtDate(r.effectiveDate)}</td>
                <td className="px-3 py-2.5 text-sm text-gray-900 tabular-nums font-medium">{Number(r.ratePercent).toFixed(2)}%</td>
                <td
                  className={`px-3 py-2.5 text-sm tabular-nums ${
                    r.changeBps == null ? "text-gray-400" : r.changeBps > 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {r.changeBps == null ? "—" : `${r.changeBps > 0 ? "+" : ""}${r.changeBps} bps`}
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-500">{r.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">About the repo rate</h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            The repo rate (repurchase rate) is the interest rate at which the RBI lends short-term funds to
            commercial banks against government securities. It's the RBI's primary tool for controlling
            inflation and liquidity — raise it to cool an overheating economy, cut it to stimulate borrowing
            and growth.
          </p>
          <p>
            Since October 2019, most Indian banks price new floating-rate retail loans (home, auto, personal)
            using an External Benchmark Lending Rate (EBLR) directly linked to the repo rate — so a repo cut or
            hike now passes through to your EMI far faster than under the old MCLR regime, typically within one
            quarter. Fixed deposit rates tend to move in the same direction but with more of a lag, since banks
            balance FD pricing against their own funding needs.
          </p>
          <p>
            The MPC — six members, three from the RBI and three external appointees — meets roughly every two
            months and decides by majority vote. Data on this page reflects the MPC era only (October 2016
            onward); rate history before the committee's formation is not shown.
          </p>
        </div>
      </section>

      <FaqAccordion
        faq={[
          {
            q: "What is the RBI repo rate right now?",
            a: current ? `${Number(current.ratePercent).toFixed(2)}%, effective since ${fmtDate(current.effectiveDate)}.` : "Data not yet available.",
          },
          {
            q: "How often does the repo rate change?",
            a: "The Monetary Policy Committee (MPC) meets bi-monthly (roughly every 2 months) and can hike, cut, or hold the rate at each meeting. Off-cycle emergency changes (like the COVID-19 cuts in 2020) are rare but have happened.",
          },
          {
            q: "How does the repo rate affect my home loan EMI?",
            a: "If your loan is on a repo-linked (RLLR/EBLR) floating rate — the default for most loans sanctioned since October 2019 — a repo rate change typically flows through to your EMI or tenure within one quarter, since banks must reset repo-linked rates at least once every 3 months.",
          },
          {
            q: "Does a repo rate cut mean FD rates will fall?",
            a: "Usually yes, but with a lag — banks adjust FD rates based on their own funding and liquidity needs, not automatically like repo-linked loans. Expect FD rate cuts to follow a repo cut by a few weeks to a couple of months, and not always by the full amount.",
          },
        ]}
      />
    </div>
  );
}
