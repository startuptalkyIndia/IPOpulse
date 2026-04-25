export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PieChart } from "lucide-react";
import { DataDisclaimer } from "@/components/DataDisclaimer";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Sector-wise FPI Flows India — monthly NSDL data with charts",
  description:
    "Monthly Foreign Portfolio Investment (FPI) flows broken down by sector — IT, Banking, Auto, FMCG, Pharma, Infrastructure. Sourced from NSDL fortnightly reports.",
  alternates: { canonical: "/sectors/fpi-flows" },
};

const SECTORS = [
  { name: "Financial Services", recent: 8420, prev: 12400, ytd: 142500, share: "21.4%" },
  { name: "Information Technology", recent: -2150, prev: -3890, ytd: -18750, share: "13.1%" },
  { name: "Oil & Gas", recent: 1840, prev: 920, ytd: 28400, share: "9.6%" },
  { name: "Auto", recent: 1290, prev: -560, ytd: 14800, share: "5.9%" },
  { name: "Consumer Goods", recent: 770, prev: 1240, ytd: 12100, share: "5.2%" },
  { name: "Healthcare & Pharma", recent: 540, prev: 980, ytd: 8400, share: "4.4%" },
  { name: "Infrastructure", recent: -380, prev: 210, ytd: 5300, share: "3.8%" },
  { name: "Capital Goods", recent: 420, prev: 740, ytd: 9100, share: "3.5%" },
  { name: "Telecom", recent: 280, prev: 420, ytd: 4900, share: "3.0%" },
  { name: "Power", recent: -160, prev: -340, ytd: -1800, share: "2.7%" },
  { name: "Metals & Mining", recent: -610, prev: -290, ytd: -4200, share: "2.5%" },
  { name: "Cement & Construction", recent: 340, prev: 510, ytd: 6800, share: "2.1%" },
];

export default function FpiFlowsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Sectors", href: "/sectors" }, { label: "FPI Flows" }]} />

      <div>
        <div className="flex items-center gap-2 mb-1">
          <PieChart className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sector-wise FPI Flows</h1>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl">
          Foreign Portfolio Investment (FPI) flows into Indian equity, broken down by sector. Sourced from NSDL&apos;s
          fortnightly Custodian-of-Securities Account-Holder data and SEBI&apos;s monthly FPI bulletin. The cleanest
          read on which sectors foreign money is moving into — and out of.
        </p>
      </div>

      <DataDisclaimer
        variant="illustrative"
        message="Sample sector-wise FPI flows shown below. Live ingestion from NSDL fortnightly reports is wiring up — until then, treat numbers as representative shape, not real fortnight values. Real data lands once the NSDL crawler ships."
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-3 py-3">Sector</th>
              <th className="px-3 py-3 text-right">Latest fortnight (₹ Cr)</th>
              <th className="px-3 py-3 text-right">Prev fortnight (₹ Cr)</th>
              <th className="px-3 py-3 text-right">FY-to-date (₹ Cr)</th>
              <th className="px-3 py-3 text-right">FPI AUC %</th>
            </tr>
          </thead>
          <tbody>
            {SECTORS.map((s) => (
              <tr key={s.name} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                <td className={`px-3 py-3 text-sm text-right tabular-nums font-semibold ${s.recent >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {s.recent >= 0 ? "+" : ""}
                  {s.recent.toLocaleString("en-IN")}
                </td>
                <td className={`px-3 py-3 text-xs text-right tabular-nums ${s.prev >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {s.prev >= 0 ? "+" : ""}
                  {s.prev.toLocaleString("en-IN")}
                </td>
                <td className={`px-3 py-3 text-sm text-right tabular-nums ${s.ytd >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {s.ytd >= 0 ? "+" : ""}
                  {s.ytd.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-3 text-xs text-right text-gray-600 tabular-nums">{s.share}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-2">How to read this data</h2>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Latest fortnight</strong>: net FPI buy/sell in that sector over the last 15-day reporting period.
            Positive = FPIs are net buyers, negative = net sellers.
          </li>
          <li>
            <strong>FY-to-date</strong>: cumulative net flow since April 1 — the trend, not just the latest blip.
          </li>
          <li>
            <strong>FPI AUC %</strong>: share of FPI&apos;s total Indian equity holdings in this sector. Tells you
            where FPI money <em>actually</em> sits, vs where it&apos;s flowing this week.
          </li>
          <li>
            FPI moves often lead retail by 1-2 weeks. Sustained sector inflow is a meaningful signal.
          </li>
        </ul>
      </div>

      <p className="text-[11px] text-gray-400">
        Data shown is illustrative; live ingestion from NSDL feeds wires in via the next scheduled cron. Last
        updated periodically.
      </p>
    </div>
  );
}
