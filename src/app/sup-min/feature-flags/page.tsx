export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ToggleRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { seedFlagDefinitions } from "@/lib/feature-flags";
import { FlagToggle } from "./FlagToggle";

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  community: { label: "Community", color: "bg-blue-100 text-blue-800" },
  revenue: { label: "Revenue / Affiliates", color: "bg-green-100 text-green-800" },
  ai: { label: "AI features", color: "bg-purple-100 text-purple-800" },
  seo: { label: "SEO", color: "bg-yellow-100 text-yellow-800" },
  data: { label: "Data / Crons", color: "bg-orange-100 text-orange-800" },
  ux: { label: "UX", color: "bg-gray-100 text-gray-700" },
};

export default async function FeatureFlagsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");

  // Ensure flags exist
  await seedFlagDefinitions();
  const flags = await prisma.featureFlag.findMany({ orderBy: [{ category: "asc" }, { label: "asc" }] });

  // Group by category
  const grouped = flags.reduce<Record<string, typeof flags>>((acc, f) => {
    const k = f.category ?? "other";
    (acc[k] ||= []).push(f);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/sup-min/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <ToggleRight className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Turn entire features on or off site-wide. Changes take effect within 60 seconds (cache TTL).
      </p>

      {Object.entries(grouped).map(([cat, list]) => (
        <section key={cat} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`badge ${CATEGORY_META[cat]?.color ?? "bg-gray-100 text-gray-700"}`}>
              {CATEGORY_META[cat]?.label ?? cat}
            </span>
            <span className="text-xs text-gray-400">{list.length} flag{list.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {list.map((f) => (
              <div key={f.key} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{f.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.description}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{f.key}</div>
                </div>
                <FlagToggle flagKey={f.key} initial={f.enabled} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
