import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrendingUp, FileText, Database, Mail, LogOut, Users } from "lucide-react";

const tiles = [
  { href: "/sup-min/ipos", icon: TrendingUp, title: "IPO Data", desc: "Manage IPO records, listing details, anchors" },
  { href: "/sup-min/gmp", icon: Database, title: "Daily GMP Entry", desc: "Record today's grey market premium" },
  { href: "/sup-min/announcements", icon: FileText, title: "Announcements", desc: "Manual announcement overrides" },
  { href: "/sup-min/ingestion", icon: Database, title: "Ingestion Runs", desc: "Cron logs, manual triggers" },
  { href: "/sup-min/newsletter", icon: Mail, title: "Newsletter", desc: "Subscriber list, digest status" },
  { href: "/sup-min/users", icon: Users, title: "Admin Users", desc: "Add / remove admin accounts" },
];

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sup-min");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            Signed in as <span className="font-medium text-gray-700">{session.user.email}</span>
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/sup-min" });
          }}
        >
          <button type="submit" className="btn-secondary inline-flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="card hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{t.title}</h3>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 card bg-yellow-50 border-yellow-200">
        <h3 className="text-sm font-semibold text-yellow-900 mb-1">Phase 1 in progress</h3>
        <p className="text-xs text-yellow-800">
          Calculators, IPO ingestion, and FII/DII dashboards ship over the next 8 weeks. This
          admin panel is wired; sub-pages are built as each module lands.
        </p>
      </div>
    </div>
  );
}
