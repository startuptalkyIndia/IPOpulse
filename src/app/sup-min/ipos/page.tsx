import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "IPO Manager — Admin",
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  upcoming:  { label: "Upcoming",  cls: "badge-info" },
  live:      { label: "Live",      cls: "badge-live" },
  closed:    { label: "Closed",    cls: "badge-warning" },
  listed:    { label: "Listed",    cls: "badge-success" },
  withdrawn: { label: "Withdrawn", cls: "badge-closed" },
};

export default async function AdminIposPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");

  const ipos = await prisma.ipo.findMany({
    orderBy: [{ openDate: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      status: true,
      openDate: true,
      closeDate: true,
      listingDate: true,
      priceBandLow: true,
      priceBandHigh: true,
      lotSize: true,
      issueSize: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/sup-min/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IPO Manager</h1>
          <p className="text-sm text-gray-500">
            {ipos.length} IPO{ipos.length !== 1 ? "s" : ""} in database
          </p>
        </div>
        <Link href="/sup-min/ipos/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New IPO
        </Link>
      </div>

      {ipos.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500 text-sm mb-4">No IPOs found. Add your first one.</p>
          <Link href="/sup-min/ipos/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New IPO
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Open → Close
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Price Band
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Issue Size
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ipos.map((ipo) => {
                const st = statusConfig[ipo.status] ?? { label: ipo.status, cls: "badge-info" };
                const fmt = (d: Date | null) =>
                  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

                return (
                  <tr key={ipo.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{ipo.name}</div>
                      <div className="text-xs text-gray-400">{ipo.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 capitalize">{ipo.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {fmt(ipo.openDate)} → {fmt(ipo.closeDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ipo.priceBandLow && ipo.priceBandHigh
                        ? `₹${Number(ipo.priceBandLow)}–${Number(ipo.priceBandHigh)}`
                        : ipo.priceBandHigh
                        ? `₹${Number(ipo.priceBandHigh)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ipo.issueSize ? `₹${Number(ipo.issueSize).toLocaleString("en-IN")} Cr` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/sup-min/ipos/${ipo.slug}/edit`}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        Edit
                      </Link>
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
