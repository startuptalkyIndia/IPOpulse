export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Wallet, MousePointer2, CheckCircle2, Clock, XCircle, Copy } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { CopyRefCode } from "./CopyRefCode";

export default async function AdvisorDashboard() {
  if (!(await isFeatureEnabled("advisor.enabled"))) notFound();
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/signin?next=/advisor/dashboard");

  const advisor = await prisma.advisor.findUnique({ where: { userId } });
  if (!advisor) redirect("/advisor/apply");

  const [clickCount, commissions, payouts, recentClicks] = await Promise.all([
    prisma.advisorClick.count({ where: { advisorId: advisor.id } }),
    prisma.advisorCommission.aggregate({
      where: { advisorId: advisor.id },
      _sum: { advisorShareInr: true },
      _count: true,
    }),
    prisma.advisorPayout.aggregate({ where: { advisorId: advisor.id }, _sum: { amountInr: true } }),
    prisma.advisorClick.findMany({
      where: { advisorId: advisor.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const balance = Number(advisor.totalEarnedInr) - Number(advisor.totalPaidInr);

  if (advisor.status === "pending") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Application under review</h1>
        <p className="text-sm text-gray-600 mb-6">
          Thanks {advisor.fullName?.split(" ")[0] ?? "there"}! We typically approve within 24-48 hours. You&apos;ll
          get an email once approved, and your dashboard unlocks here.
        </p>
        <Link href="/finance" className="btn-secondary">
          Browse what you&apos;ll be promoting
        </Link>
      </div>
    );
  }

  if (advisor.status === "rejected" || advisor.status === "suspended") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {advisor.status === "rejected" ? "Application not approved" : "Account suspended"}
        </h1>
        <p className="text-sm text-gray-600 mb-2">{advisor.notes ?? "Please contact support if you believe this is an error."}</p>
        <Link href="/contact" className="btn-secondary inline-block mt-4">Contact us</Link>
      </div>
    );
  }

  const tabs = [
    { href: "/advisor/dashboard", label: "Dashboard", active: true },
    { href: "/advisor/products", label: "My links" },
    { href: "/advisor/wallet", label: "Wallet" },
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
        <div className="card bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              Welcome, {advisor.fullName?.split(" ")[0] ?? "Advisor"} — your code is
            </h1>
          </div>
          <CopyRefCode refCode={advisor.refCode} />
          <p className="text-xs text-gray-500 mt-2">
            Share any product link from <Link href="/advisor/products" className="text-indigo-600 underline">My links</Link>{" "}
            with your code attached. When friends apply through your link and convert, you earn{" "}
            <span className="font-semibold">{Number(advisor.commissionPercent).toFixed(0)}% of the partner commission</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={MousePointer2} label="Total clicks" value={clickCount.toString()} />
          <Stat icon={CheckCircle2} label="Conversions" value={commissions._count.toString()} />
          <Stat icon={Wallet} label="Lifetime earned" value={`₹${Number(advisor.totalEarnedInr).toLocaleString("en-IN")}`} />
          <Stat icon={Wallet} label="Available balance" value={`₹${balance.toLocaleString("en-IN")}`} highlight />
        </div>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Recent activity</h2>
          {recentClicks.length === 0 ? (
            <div className="card text-center py-8 text-sm text-gray-500">
              No clicks yet. Share your code to start earning.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="px-3 py-3">When</th>
                    <th className="px-3 py-3">Product</th>
                    <th className="px-3 py-3">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClicks.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100">
                      <td className="px-3 py-2.5 text-xs text-gray-500">
                        {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(c.createdAt)}
                      </td>
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{c.productSlug}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{c.productCategory ?? "—"}</td>
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

function Stat({ icon: Icon, label, value, highlight }: { icon: typeof Briefcase; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${highlight ? "text-green-600" : "text-indigo-600"}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className={`text-xl font-bold tabular-nums ${highlight ? "text-green-600" : "text-indigo-700"}`}>{value}</div>
    </div>
  );
}
