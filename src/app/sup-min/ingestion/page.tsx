export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { availableJobs } from "@/crons/scheduler";
import { TriggerJobButton } from "./TriggerJobButton";

const jobMeta: Record<string, { label: string; schedule: string; desc: string }> = {
  nse_fii_dii: {
    label: "NSE FII / DII (daily)",
    schedule: "Mon–Fri at 19:15 IST",
    desc: "Scrapes NSE's provisional FII/DII cash figures from /api/fiidiiTradeReact and upserts into fii_dii_daily.",
  },
  bse_ipos: {
    label: "BSE IPO pipeline (every 4h)",
    schedule: "Every 4 hours",
    desc: "HTML scraper of bseindia.com/markets/publicissues (mainboard + SME) that parses IPO dates, price band, issue size and upserts into the ipos table.",
  },
  amfi_navs: {
    label: "AMFI Mutual Fund NAVs (daily)",
    schedule: "Daily at 23:00 IST",
    desc: "Full refresh of every Indian mutual fund scheme's NAV from AMFI's public NAVAll.txt feed. Populates /mutual-funds.",
  },
  nse_bhavcopy: {
    label: "NSE EOD Bhavcopy (daily)",
    schedule: "Mon–Fri at 19:00 IST",
    desc: "Pulls full NSE end-of-day bhavcopy CSV (sec_bhavdata_full_DDMMYYYY.csv) from nsearchives.nseindia.com. Real OHLCV + delivery % for every NSE-listed company in our master. Replaces seed prices with live exchange data.",
  },
  bse_announcements: {
    label: "BSE Corporate Announcements (every 2h)",
    schedule: "Every 2h between 09:00–21:00 IST",
    desc: "Scrapes api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData. Captures every announcement, auto-detects corporate actions (dividend/split/bonus/rights/buyback/AGM/board meeting) and inserts into corporate_actions.",
  },
};

export default async function AdminIngestionPage() {
  const session = await auth();
  if (!session?.user) redirect("/sup-min");

  const runs = await prisma.ingestionRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/sup-min/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Ingestion Runs</h1>
      <p className="text-sm text-gray-500 mb-6">Scheduled cron jobs and their run history. Manual trigger available per job.</p>

      {/* Jobs list */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Scheduled jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.keys(availableJobs).map((j) => {
            const meta = jobMeta[j] ?? { label: j, schedule: "—", desc: "" };
            return (
              <div key={j} className="card">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{meta.label}</h3>
                  <span className="text-[11px] text-indigo-600 font-mono">{j}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{meta.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Schedule: {meta.schedule}</span>
                  <TriggerJobButton job={j} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent runs</h2>
        {runs.length === 0 ? (
          <div className="card text-center py-8 text-sm text-gray-500">
            No ingestion runs yet. Trigger a job above to populate.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-3 py-3">Job</th>
                  <th className="px-3 py-3">Started</th>
                  <th className="px-3 py-3">Duration</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Rows</th>
                  <th className="px-3 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => {
                  const ms = r.finishedAt ? r.finishedAt.getTime() - r.startedAt.getTime() : null;
                  const dur = ms == null ? "—" : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
                  const sc =
                    r.status === "success"
                      ? "bg-green-100 text-green-800"
                      : r.status === "running"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800";
                  return (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="px-3 py-2.5 text-sm font-mono text-gray-700">{r.jobName}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">
                        {new Intl.DateTimeFormat("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(r.startedAt)}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 tabular-nums">{dur}</td>
                      <td className="px-3 py-2.5">
                        <span className={`badge ${sc}`}>{r.status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">
                        {r.rowsIn ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">
                        {r.errorMsg ? <span className="text-red-600">{r.errorMsg.slice(0, 60)}</span> : r.notes ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
