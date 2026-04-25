export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdvisorAdminActions } from "./AdvisorAdminActions";

export default async function AdminAdvisorsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");

  const advisors = await prisma.advisor.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: { user: { select: { email: true, name: true } }, _count: { select: { clicks: true, commissions: true } } },
  });

  const counts = {
    pending: advisors.filter((a) => a.status === "pending").length,
    approved: advisors.filter((a) => a.status === "approved").length,
    rejected: advisors.filter((a) => a.status === "rejected").length,
    suspended: advisors.filter((a) => a.status === "suspended").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/sup-min/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Advisors</h1>
      <p className="text-sm text-gray-500 mb-6">Approve, reject, or suspend advisor applications. Process payouts from /sup-min/payouts.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Pending" value={counts.pending} cls="bg-yellow-50 text-yellow-700" />
        <Stat label="Approved" value={counts.approved} cls="bg-green-50 text-green-700" />
        <Stat label="Rejected" value={counts.rejected} cls="bg-red-50 text-red-700" />
        <Stat label="Suspended" value={counts.suspended} cls="bg-gray-100 text-gray-700" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-3 py-3">Advisor</th>
              <th className="px-3 py-3">Code</th>
              <th className="px-3 py-3">Phone / City</th>
              <th className="px-3 py-3 text-right">Clicks</th>
              <th className="px-3 py-3 text-right">Earned</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {advisors.map((a) => (
              <tr key={a.id} className="border-b border-gray-100">
                <td className="px-3 py-3 text-sm">
                  <div className="font-medium text-gray-900">{a.fullName ?? a.user.name ?? a.user.email.split("@")[0]}</div>
                  <div className="text-[11px] text-gray-500">{a.user.email}</div>
                </td>
                <td className="px-3 py-3"><code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono">{a.refCode}</code></td>
                <td className="px-3 py-3 text-xs text-gray-600">
                  {a.phone ?? "—"}<br />
                  <span className="text-gray-500">{a.city ?? "—"}</span>
                </td>
                <td className="px-3 py-3 text-xs text-right tabular-nums text-gray-700">{a._count.clicks}</td>
                <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">₹{Number(a.totalEarnedInr).toLocaleString("en-IN")}</td>
                <td className="px-3 py-3">
                  <span className={`badge ${
                    a.status === "approved" ? "bg-green-100 text-green-800" :
                    a.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    a.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-700"
                  }`}>{a.status}</span>
                </td>
                <td className="px-3 py-3 text-right">
                  <AdvisorAdminActions advisorId={a.id} status={a.status} />
                </td>
              </tr>
            ))}
            {advisors.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-12 text-center text-sm text-gray-500">No advisors yet. Enable the program in /sup-min/feature-flags.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className="card">
      <div className={`text-xs ${cls.split(" ")[1]}`}>{label}</div>
      <div className="text-xl font-bold tabular-nums mt-0.5 text-gray-900">{value}</div>
    </div>
  );
}
