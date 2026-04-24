export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, ExternalLink, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPriceBand, computeIpoStatus, statusLabel, statusBadgeClass } from "@/lib/ipo";
import { matchRegistrar } from "@/lib/registrars";

export default async function MyApplicationsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/signin?next=/my/applications");

  const apps = await prisma.ipoApplication.findMany({
    where: { userId },
    orderBy: { applyDate: "desc" },
    include: { ipo: { include: { listing: true } } },
  });

  const counts = {
    applied: apps.filter((a) => a.status === "applied").length,
    allotted: apps.filter((a) => a.status === "allotted").length,
    notAllotted: apps.filter((a) => a.status === "not_allotted").length,
    total: apps.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">My IPO Applications</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total },
          { label: "Applied", value: counts.applied },
          { label: "Allotted", value: counts.allotted },
          { label: "Not allotted", value: counts.notAllotted },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-xl font-bold text-indigo-700 tabular-nums mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-500 mb-3">
            No applications tracked yet. On any IPO page, tap <span className="font-semibold">Track Application</span> to add it.
          </p>
          <Link href="/ipo" className="btn-primary inline-flex items-center gap-1">
            Browse IPOs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">IPO</th>
                <th className="px-3 py-3">Applied</th>
                <th className="px-3 py-3">Lots</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Allotment date</th>
                <th className="px-3 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const reg = matchRegistrar(a.ipo.registrar);
                const ipoStatus = computeIpoStatus(a.ipo);
                return (
                  <tr key={a.id} className="border-b border-gray-100">
                    <td className="px-3 py-3 text-sm">
                      <Link href={`/ipo/${a.ipo.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">{a.ipo.name}</Link>
                      <div className="text-[11px] text-gray-400 mt-0.5">{formatPriceBand(a.ipo)}</div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{formatDate(a.applyDate)}</td>
                    <td className="px-3 py-3 text-xs text-gray-700 tabular-nums">{a.lotsApplied ?? "—"}</td>
                    <td className="px-3 py-3">
                      <span className={statusBadgeClass(ipoStatus)}>{statusLabel(ipoStatus)}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{formatDate(a.ipo.allotmentDate)}</td>
                    <td className="px-3 py-3 text-right">
                      {a.ipo.registrarUrl || reg ? (
                        <a
                          href={a.ipo.registrarUrl ?? reg?.allotmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                        >
                          Check allotment <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
