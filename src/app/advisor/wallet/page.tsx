export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isFeatureEnabled } from "@/lib/feature-flags";

export default async function AdvisorWalletPage() {
  if (!(await isFeatureEnabled("advisor.enabled"))) notFound();
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/signin?next=/advisor/wallet");
  const advisor = await prisma.advisor.findUnique({ where: { userId } });
  if (!advisor) redirect("/advisor/apply");

  const [commissions, payouts] = await Promise.all([
    prisma.advisorCommission.findMany({ where: { advisorId: advisor.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.advisorPayout.findMany({ where: { advisorId: advisor.id }, orderBy: { paidAt: "desc" }, take: 20 }),
  ]);

  const balance = Number(advisor.totalEarnedInr) - Number(advisor.totalPaidInr);

  const tabs = [
    { href: "/advisor/dashboard", label: "Dashboard" },
    { href: "/advisor/products", label: "My links" },
    { href: "/advisor/wallet", label: "Wallet", active: true },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-1 md:gap-4 overflow-x-auto pt-5 pb-0 border-b border-gray-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`text-sm px-3 py-2.5 ${t.active ? "text-indigo-600 border-b-2 border-indigo-600 -mb-px font-semibold" : "text-gray-600 hover:text-indigo-600"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="py-6 space-y-6">
        <div className="card bg-gradient-to-br from-green-50 via-white to-white border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">Available balance</h2>
          </div>
          <div className="text-3xl font-bold text-green-700 tabular-nums">₹{balance.toLocaleString("en-IN")}</div>
          <div className="text-xs text-gray-500 mt-1">
            Lifetime earned ₹{Number(advisor.totalEarnedInr).toLocaleString("en-IN")} · Lifetime paid ₹{Number(advisor.totalPaidInr).toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Payouts go out on the 1st of every month to your registered UPI / bank account. No minimum threshold.
          </p>
          {advisor.upiId ? (
            <p className="text-xs text-gray-500 mt-1">UPI on file: <code className="bg-gray-100 px-1 rounded">{advisor.upiId}</code></p>
          ) : (
            <p className="text-xs text-yellow-700 mt-1">⚠ No UPI on file. Email us to update.</p>
          )}
        </div>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Commission history</h2>
          {commissions.length === 0 ? (
            <div className="card text-center py-8 text-sm text-gray-500">
              No commissions yet. Share your links to start earning.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="px-3 py-3">When</th>
                    <th className="px-3 py-3">Product</th>
                    <th className="px-3 py-3 text-right">Partner ₹</th>
                    <th className="px-3 py-3 text-right">Your share</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100">
                      <td className="px-3 py-2.5 text-xs text-gray-500">
                        {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(c.createdAt)}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-900">{c.productSlug}</td>
                      <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">₹{Number(c.partnerCommissionInr).toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2.5 text-sm text-right tabular-nums font-semibold text-green-600">₹{Number(c.advisorShareInr).toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2.5"><span className={`badge ${c.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Payout history</h2>
          {payouts.length === 0 ? (
            <div className="card text-center py-6 text-sm text-gray-500">No payouts yet.</div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Mode</th>
                    <th className="px-3 py-3">Txn ref</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <td className="px-3 py-2.5 text-xs text-gray-500">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(p.paidAt)}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-700 uppercase">{p.mode ?? "—"}</td>
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-600">{p.txnRef ?? "—"}</td>
                      <td className="px-3 py-2.5 text-sm text-right tabular-nums font-semibold text-gray-900">₹{Number(p.amountInr).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
