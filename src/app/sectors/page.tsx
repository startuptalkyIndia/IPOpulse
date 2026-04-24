import type { Metadata } from "next";
import Link from "next/link";
import { sectors } from "@/lib/sectors";
import { PieChart, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Sector Dashboards — Nifty sectoral indices & constituents",
  description:
    "Every Indian sector dashboard — Nifty Bank, IT, Auto, Pharma, FMCG, Financial Services. Constituents, heatmaps, FII flows.",
};

export default function SectorsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Sectors</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Every major Indian sector with its Nifty index, constituents, and sector-wise FII flow trends.
          Sector-wise FPI breakdown coming via NSDL monthly feed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((s) => (
          <Link
            key={s.slug}
            href={`/sectors/${s.slug}`}
            className="card hover:border-indigo-300 hover:shadow-sm transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <PieChart className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">{s.name}</h2>
            {s.niftyIndex ? (
              <div className="text-[11px] text-gray-400 mt-0.5">Index: {s.niftyIndex}</div>
            ) : null}
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{s.description}</p>
            <div className="mt-3 text-xs font-medium text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1">
              Open <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
