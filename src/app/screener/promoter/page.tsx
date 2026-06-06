"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, AlertTriangle, TrendingUp } from "lucide-react";

interface ShareholdingData {
  company: string;
  symbol: string;
  slug: string;
  sector?: string;
  promoter: number;
  promoterPledged: number;
  fii: number;
  dii: number;
  retail: number;
}

// Dec 2025 BSE/NSE quarterly filings
const allData: ShareholdingData[] = [
  { company: "Wipro", symbol: "WIPRO", slug: "wipro", sector: "IT", promoter: 72.86, promoterPledged: 0.0, fii: 7.40, dii: 7.80, retail: 11.94 },
  { company: "ITC", symbol: "ITC", slug: "itc", sector: "FMCG", promoter: 0.0, promoterPledged: 0.0, fii: 41.20, dii: 38.60, retail: 20.20 },
  { company: "TCS", symbol: "TCS", slug: "tata-consultancy-services", sector: "IT", promoter: 72.30, promoterPledged: 0.0, fii: 13.20, dii: 8.80, retail: 5.70 },
  { company: "Nestle India", symbol: "NESTLEIND", slug: "nestle-india", sector: "FMCG", promoter: 72.60, promoterPledged: 0.0, fii: 10.40, dii: 5.60, retail: 11.40 },
  { company: "HUL", symbol: "HINDUNILVR", slug: "hindustan-unilever", sector: "FMCG", promoter: 61.90, promoterPledged: 0.0, fii: 13.80, dii: 14.40, retail: 9.90 },
  { company: "Maruti Suzuki", symbol: "MARUTI", slug: "maruti-suzuki-india", sector: "Auto", promoter: 58.19, promoterPledged: 0.0, fii: 20.10, dii: 11.80, retail: 9.91 },
  { company: "Titan Company", symbol: "TITAN", slug: "titan-company", sector: "Consumer", promoter: 52.63, promoterPledged: 0.0, fii: 19.40, dii: 16.30, retail: 11.67 },
  { company: "Reliance Industries", symbol: "RELIANCE", slug: "reliance-industries", sector: "Oil & Gas", promoter: 50.33, promoterPledged: 0.0, fii: 23.48, dii: 16.22, retail: 9.97 },
  { company: "Bajaj Auto", symbol: "BAJAJ-AUTO", slug: "bajaj-auto", sector: "Auto", promoter: 54.78, promoterPledged: 0.0, fii: 17.20, dii: 13.40, retail: 14.62 },
  { company: "Colgate Palmolive", symbol: "COLPAL", slug: "colgate-palmolive-india", sector: "FMCG", promoter: 51.00, promoterPledged: 0.0, fii: 24.60, dii: 8.40, retail: 16.00 },
  { company: "Pidilite Industries", symbol: "PIDILITIND", slug: "pidilite-industries", sector: "Chemicals", promoter: 67.50, promoterPledged: 0.0, fii: 18.40, dii: 5.80, retail: 8.30 },
  { company: "Page Industries", symbol: "PAGEIND", slug: "page-industries", sector: "Consumer", promoter: 45.00, promoterPledged: 0.0, fii: 27.60, dii: 11.40, retail: 16.00 },
  { company: "Eicher Motors", symbol: "EICHERMOT", slug: "eicher-motors", sector: "Auto", promoter: 49.47, promoterPledged: 0.0, fii: 24.60, dii: 14.30, retail: 11.63 },
  { company: "Havells India", symbol: "HAVELLS", slug: "havells-india", sector: "Consumer Durables", promoter: 59.55, promoterPledged: 0.0, fii: 16.40, dii: 10.80, retail: 13.25 },
  { company: "MRF", symbol: "MRF", slug: "mrf", sector: "Auto", promoter: 27.76, promoterPledged: 0.0, fii: 14.20, dii: 18.60, retail: 39.44 },
  { company: "Asian Paints", symbol: "ASIANPAINT", slug: "asian-paints", sector: "Consumer", promoter: 52.63, promoterPledged: 0.0, fii: 18.40, dii: 17.60, retail: 11.37 },
  { company: "Britannia Industries", symbol: "BRITANNIA", slug: "britannia-industries", sector: "FMCG", promoter: 50.49, promoterPledged: 0.0, fii: 16.80, dii: 19.20, retail: 13.51 },
  { company: "Divi's Laboratories", symbol: "DIVISLAB", slug: "divi-laboratories", sector: "Pharma", promoter: 51.88, promoterPledged: 0.0, fii: 18.20, dii: 14.60, retail: 15.32 },
  { company: "Torrent Pharma", symbol: "TORNTPHARM", slug: "torrent-pharmaceuticals", sector: "Pharma", promoter: 71.25, promoterPledged: 0.0, fii: 12.60, dii: 7.80, retail: 8.35 },
  { company: "Avenue Supermarts (DMart)", symbol: "DMART", slug: "avenue-supermarts", sector: "Retail", promoter: 74.65, promoterPledged: 0.0, fii: 8.40, dii: 5.20, retail: 11.75 },
  { company: "Bajaj Finance", symbol: "BAJFINANCE", slug: "bajaj-finance", sector: "NBFC", promoter: 55.93, promoterPledged: 0.0, fii: 20.80, dii: 12.60, retail: 10.67 },
  { company: "SBI Life Insurance", symbol: "SBILIFE", slug: "sbi-life-insurance", sector: "Insurance", promoter: 55.50, promoterPledged: 0.0, fii: 14.80, dii: 22.40, retail: 7.30 },
  { company: "HDFC Life Insurance", symbol: "HDFCLIFE", slug: "hdfc-life-insurance", sector: "Insurance", promoter: 49.97, promoterPledged: 0.0, fii: 19.60, dii: 21.80, retail: 8.63 },
  { company: "Marico", symbol: "MARICO", slug: "marico", sector: "FMCG", promoter: 59.18, promoterPledged: 0.0, fii: 22.40, dii: 9.80, retail: 8.62 },
  { company: "Dabur India", symbol: "DABUR", slug: "dabur-india", sector: "FMCG", promoter: 67.58, promoterPledged: 0.0, fii: 18.20, dii: 6.40, retail: 7.82 },
  { company: "Procter & Gamble India", symbol: "PGHH", slug: "procter-gamble-india", sector: "FMCG", promoter: 70.58, promoterPledged: 0.0, fii: 7.80, dii: 3.40, retail: 18.22 },
  { company: "Hindustan Zinc", symbol: "HINDZINC", slug: "hindustan-zinc", sector: "Metals", promoter: 64.92, promoterPledged: 0.0, fii: 12.40, dii: 12.60, retail: 10.08 },
  { company: "Abbott India", symbol: "ABBOTINDIA", slug: "abbott-india", sector: "Pharma", promoter: 74.99, promoterPledged: 0.0, fii: 5.20, dii: 4.40, retail: 15.41 },
  { company: "3M India", symbol: "3MINDIA", slug: "3m-india", sector: "Industrial", promoter: 75.00, promoterPledged: 0.0, fii: 8.40, dii: 3.60, retail: 13.00 },
  { company: "Honeywell Automation", symbol: "HONAUT", slug: "honeywell-automation-india", sector: "Industrial", promoter: 75.00, promoterPledged: 0.0, fii: 9.60, dii: 3.40, retail: 12.00 },
];

const THRESHOLDS = [
  { key: "45", label: ">45%", min: 45 },
  { key: "60", label: ">60%", min: 60 },
  { key: "70", label: ">70%", min: 70 },
  { key: "all", label: "All", min: 0 },
];

export default function PromoterScreenerPage() {
  const [threshold, setThreshold] = useState("45");
  const [sortBy, setSortBy] = useState<"promoter" | "fii" | "pledge">("promoter");

  const minPct = THRESHOLDS.find(t => t.key === threshold)?.min ?? 45;

  const filtered = allData
    .filter(d => d.promoter >= minPct)
    .sort((a, b) => {
      if (sortBy === "promoter") return b.promoter - a.promoter;
      if (sortBy === "fii") return b.fii - a.fii;
      if (sortBy === "pledge") return b.promoterPledged - a.promoterPledged;
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/screener" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4" /> Screener
        </Link>
      </div>

      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <Users className="w-3.5 h-3.5" />
          High Promoter Stake · Dec 2025 BSE/NSE quarterly filings
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">High Promoter Stake Stocks India</h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Companies where promoters (founders, parent groups) hold a large ownership stake. High promoter holding (&gt;50%) signals conviction and alignment with minority shareholders — but check pledge levels too.
        </p>
      </div>

      {/* Insight card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-indigo-50 border-indigo-100">
          <div className="text-xs font-semibold text-indigo-700 mb-1">Why high promoter stake matters</div>
          <p className="text-xs text-gray-600">Founders with 60–75% stake have massive personal wealth tied to the company — strong incentive to run it well. They can't dump shares easily.</p>
        </div>
        <div className="card bg-amber-50 border-amber-100">
          <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Watch for pledge %</div>
          <p className="text-xs text-gray-600">Promoters with high pledge against their stake face forced selling risk. Any pledge above 20% of promoter holding warrants scrutiny.</p>
        </div>
        <div className="card bg-emerald-50 border-emerald-100">
          <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> MNC advantage</div>
          <p className="text-xs text-gray-600">MNCs (Nestle, 3M, Honeywell, Abbott) with 70–75% parent holding benefit from global expertise, brand, and technology access.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Minimum promoter stake:</span>
          <div className="inline-flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {THRESHOLDS.map(t => (
              <button
                key={t.key}
                onClick={() => setThreshold(t.key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${threshold === t.key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-500">Sort by:</span>
          <select className="input text-xs py-1" value={sortBy} onChange={e => setSortBy(e.target.value as "promoter" | "fii" | "pledge")}>
            <option value="promoter">Promoter % ↓</option>
            <option value="fii">FII % ↓</option>
            <option value="pledge">Pledge % ↓</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{filtered.length}</span> companies with promoter stake &gt;{minPct}%
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3 text-right">Promoter %</th>
                <th className="px-4 py-3 text-right">Pledge %</th>
                <th className="px-4 py-3 text-right">FII %</th>
                <th className="px-4 py-3 text-right">DII %</th>
                <th className="px-4 py-3 text-right">Retail %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/ticker/${d.slug}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600">
                      {d.company}
                    </Link>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">{d.symbol}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.sector ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold tabular-nums ${d.promoter >= 70 ? "text-indigo-700" : d.promoter >= 55 ? "text-indigo-600" : "text-gray-800"}`}>
                      {d.promoter.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm tabular-nums font-medium ${d.promoterPledged > 20 ? "text-red-600" : d.promoterPledged > 5 ? "text-amber-600" : "text-emerald-600"}`}>
                      {d.promoterPledged.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">{d.fii.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">{d.dii.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">{d.retail.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Data sourced from Dec 2025 BSE/NSE quarterly shareholding pattern disclosures. Updated quarterly. Covers selected large/mid-cap companies. For complete coverage, refer to exchange filings.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/shareholding" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">Full Shareholding Tracker →</div>
          <div className="text-xs text-gray-500 mt-0.5">QoQ changes in promoter, FII, DII holdings</div>
        </Link>
        <Link href="/screener" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900">Stock Screener →</div>
          <div className="text-xs text-gray-500 mt-0.5">Filter by P/E, ROE, market cap, sector</div>
        </Link>
      </div>
    </div>
  );
}
