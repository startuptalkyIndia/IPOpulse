export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { DrhpQa } from "./DrhpQa";
import { FileText } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/ipo";

export const metadata: Metadata = {
  title: "DRHP AI Search — ask anything about Indian IPO prospectuses",
  description:
    "Natural-language Q&A over SEBI DRHP / RHP prospectuses. Find companies, risks, financials, use of proceeds instantly.",
};

export default async function DrhpPage() {
  const upcoming = await prisma.ipo.findMany({
    where: { status: { in: ["upcoming", "live", "closed"] }, drhpUrl: { not: null } },
    orderBy: { openDate: "asc" },
    take: 30,
  });

  const aiEnabled = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">DRHP AI Search</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Ask natural-language questions about any Indian IPO prospectus. Powered by Claude over the SEBI
          DRHP / RHP corpus. Example: <em>"Which 2026 DRHPs mention quick commerce?"</em> or <em>"Compare risk factors of Swiggy vs Zomato DRHPs"</em>.
        </p>
      </div>

      <DrhpQa enabled={aiEnabled} />

      {!aiEnabled ? (
        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-xs text-yellow-800">
            <span className="font-semibold">AI Q&amp;A is waiting on configuration.</span> Once the
            ANTHROPIC_API_KEY environment variable is set on the server, this feature becomes live — no
            code changes needed.
          </p>
        </div>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">DRHP / RHP library</h2>
        {upcoming.length === 0 ? (
          <div className="card text-center py-8 text-sm text-gray-500">
            No DRHPs in the library yet. SEBI crawler adds them automatically as IPOs get approved.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.map((ipo) => (
              <Link key={ipo.id} href={`/ipo/${ipo.slug}`} className="card hover:border-indigo-300 transition">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{ipo.name}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {ipo.type === "sme" ? "SME" : "Mainboard"} · Opens {formatDate(ipo.openDate)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
