export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Top Dividend Yield Stocks India — highest-paying BSE/NSE stocks",
  description:
    "Screener of highest-dividend-yield Indian stocks. Consistent dividend payers for passive income investors.",
  alternates: { canonical: "/dividend-yield" },
};

export default async function DividendYieldPage() {
  const now = new Date();
  const past365 = new Date(now.getTime() - 365 * 86400000);
  const dividends = await prisma.corporateAction.findMany({
    where: { actionType: "dividend", exDate: { gte: past365 } },
    include: { company: true },
    orderBy: { exDate: "desc" },
    take: 200,
  });

  // Group by company: sum dividend value per company, take max marketCap
  type Row = { slug: string; name: string; sector: string | null; marketCapCr: number | null; totalDividend: number; lastExDate: Date | null };
  const byCompany = new Map<string, Row>();
  for (const d of dividends) {
    if (!d.company) continue;
    const key = d.company.slug;
    const entry = byCompany.get(key) ?? {
      slug: d.company.slug,
      name: d.company.name,
      sector: d.company.sector ?? null,
      marketCapCr: d.company.marketCap ? Number(d.company.marketCap) : null,
      totalDividend: 0,
      lastExDate: null,
    };
    entry.totalDividend += d.value ? Number(d.value) : 0;
    if (!entry.lastExDate || (d.exDate && d.exDate > entry.lastExDate)) entry.lastExDate = d.exDate ?? entry.lastExDate;
    byCompany.set(key, entry);
  }

  // Yield calc needs share price. Since we don't have live prices yet, show total dividend ₹/share.
  const rows = Array.from(byCompany.values()).sort((a, b) => b.totalDividend - a.totalDividend);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Top Dividend-Paying Stocks</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Indian stocks ranked by total dividend paid per share in the last 12 months. Dividend yield % will
          populate once live share prices wire up via Zerodha Kite Connect.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center py-12 text-sm text-gray-500">
          Dividend screener pipeline wiring up via BSE corporate actions feed.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Sector</th>
                <th className="px-3 py-3 text-right">Dividend/share (12m)</th>
                <th className="px-3 py-3">Last ex-date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.slug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-3 py-3 text-sm">
                    <Link href={`/ticker/${r.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{r.sector ?? "—"}</td>
                  <td className="px-3 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">₹{r.totalDividend.toFixed(2)}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">
                    {r.lastExDate ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(r.lastExDate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
