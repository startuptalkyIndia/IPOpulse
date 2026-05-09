import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Zap, Info, ExternalLink, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { reits, invits } from "@/lib/reits-data";

export const metadata: Metadata = {
  title: "REITs and InvITs in India 2026 — Embassy, Mindspace, Brookfield, IRB, Powergrid",
  description:
    "Complete list of all listed REITs and InvITs in India. Embassy Office Parks, Mindspace, Brookfield, Nexus Select, IRB InvIT, Powergrid InvIT — AUM, distribution yield, unit price, and analysis.",
  alternates: { canonical: "/reits" },
};

const sectorColors: Record<string, string> = {
  Office:              "bg-indigo-100 text-indigo-700",
  Retail:              "bg-pink-100 text-pink-700",
  Industrial:          "bg-orange-100 text-orange-700",
  Roads:               "bg-amber-100 text-amber-700",
  "Power Transmission":"bg-yellow-100 text-yellow-800",
  "Gas Pipeline":      "bg-teal-100 text-teal-700",
  Renewable:           "bg-green-100 text-green-700",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Card({ item }: { item: (typeof reits)[number] }) {
  const sectorCls = sectorColors[item.sector] ?? "bg-gray-100 text-gray-700";
  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          {item.type === "REIT" ? <Building2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11px] font-mono text-gray-400">{item.symbol}</span>
            <span className="text-[11px] text-gray-400">·</span>
            <span className="text-[11px] text-gray-400">{item.exchange}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${sectorCls}`}>
              {item.sector}
            </span>
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Unit Price</div>
          <div className="text-sm font-bold text-gray-900 tabular-nums">₹{item.unitPrice}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Dist. Yield</div>
          <div className="text-sm font-bold text-green-700 tabular-nums">{item.distributionYield}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">AUM</div>
          <div className="text-[11px] font-bold text-gray-900">{item.aum}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{item.description}</p>

      {/* Properties */}
      <div className="text-[11px] text-gray-600 bg-indigo-50 rounded-lg px-3 py-2">
        <span className="font-medium">Portfolio:</span> {item.properties}
      </div>

      {/* Top tenants */}
      {item.topTenants && item.topTenants.length > 0 && (
        <div>
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Top Tenants</div>
          <div className="flex flex-wrap gap-1">
            {item.topTenants.slice(0, 5).map((t) => (
              <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar className="w-3 h-3" />
          Listed {formatDate(item.listingDate)}
        </div>
        <div className="flex items-center gap-2">
          <Link href={item.learnMore} className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium">
            Learn more
          </Link>
          {item.nseUrl && (
            <a
              href={item.nseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-500 hover:text-gray-700 flex items-center gap-0.5"
            >
              NSE <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReitsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Fixed Income
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          REITs &amp; InvITs in India
        </h1>
        <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
          REITs and InvITs allow retail investors to earn regular income from commercial real estate and
          infrastructure without buying the asset directly. Like a mutual fund for physical assets — you buy
          units on NSE/BSE and receive quarterly distributions.
        </p>
      </div>

      {/* Info box */}
      <div className="card bg-indigo-50 border-indigo-200 flex gap-3">
        <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-indigo-800 space-y-1">
          <p>
            <strong>REITs must distribute 90% of net distributable cash flows.</strong> Distributions are
            quarterly. Minimum investment = 1 unit (traded on exchange at market price).
          </p>
          <p>
            <strong>InvITs</strong> follow the same 90% distribution rule and hold infrastructure assets like
            roads, power lines, and pipelines — typically offering slightly higher yields than REITs.
          </p>
          <p className="mt-1">
            <Link href="/learn/what-is-reit" className="underline font-medium">
              Read our detailed guide on REITs and InvITs →
            </Link>
          </p>
        </div>
      </div>

      {/* Key stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Building2 className="w-4 h-4" />, label: "Listed REITs", value: `${reits.length}` },
          { icon: <Zap className="w-4 h-4" />, label: "Listed InvITs", value: `${invits.length}` },
          { icon: <BarChart3 className="w-4 h-4" />, label: "Min. Distribution", value: "90% NDCF" },
          { icon: <TrendingUp className="w-4 h-4" />, label: "Distribution Frequency", value: "Quarterly" },
        ].map((s) => (
          <div key={s.label} className="card text-center py-4">
            <div className="flex justify-center text-indigo-600 mb-1">{s.icon}</div>
            <div className="text-lg font-bold text-gray-900">{s.value}</div>
            <div className="text-[11px] text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* REITs section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Real Estate Investment Trusts (REITs)</h2>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
            {reits.length} listed
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {reits.map((r) => (
            <Card key={r.slug} item={r} />
          ))}
        </div>
      </section>

      {/* InvITs section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Infrastructure Investment Trusts (InvITs)</h2>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            {invits.length} listed
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {invits.map((r) => (
            <Card key={r.slug} item={r} />
          ))}
        </div>
      </section>

      {/* REIT vs InvIT comparison */}
      <section className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">REIT vs InvIT — Key Differences</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="pb-2 pr-4">Parameter</th>
                <th className="pb-2 pr-4 text-indigo-700">REIT</th>
                <th className="pb-2 text-amber-700">InvIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ["Underlying assets", "Commercial real estate (offices, malls)", "Roads, power lines, pipelines"],
                ["Typical yield", "6–8%", "8–11%"],
                ["Risk profile", "Lower (stable tenants, long leases)", "Moderate (traffic/usage dependent)"],
                ["Inflation protection", "Lease escalations (5–15% every 3y)", "Indexed toll escalation (WPI)"],
                ["Regulator", "SEBI (REIT Regulations 2014)", "SEBI (InvIT Regulations 2014)"],
                ["Distribution mandate", "90% of NDCF quarterly", "90% of NDCF quarterly"],
              ].map(([p, r, i]) => (
                <tr key={p}>
                  <td className="py-2 pr-4 text-gray-500 text-xs font-medium">{p}</td>
                  <td className="py-2 pr-4 text-xs text-gray-700">{r}</td>
                  <td className="py-2 text-xs text-gray-700">{i}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <strong>Disclaimer:</strong> Unit prices, AUM, and distribution yields shown are approximate as of May
          2026. Distribution yields may vary each quarter. Past distributions are not a guarantee of future
          income. This is not investment advice. Check NSE/BSE for live prices before transacting.
        </p>
      </div>
    </div>
  );
}
