"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Minus, AlertTriangle, Info } from "lucide-react";

interface ShareholdingData {
  company: string;
  symbol: string;
  slug: string;
  quarter: string;
  promoter: number;
  promoterPledged: number;
  fii: number;
  dii: number;
  retail: number;
  qoqPromoterChange: number;
  qoqFiiChange: number;
  qoqDiiChange: number;
}

const shareholdingData: ShareholdingData[] = [
  {
    company: "Reliance Industries",
    symbol: "RELIANCE",
    slug: "reliance-industries",
    quarter: "Dec 2025",
    promoter: 50.33,
    promoterPledged: 0.0,
    fii: 23.48,
    dii: 16.22,
    retail: 9.97,
    qoqPromoterChange: 0.0,
    qoqFiiChange: 0.82,
    qoqDiiChange: -0.34,
  },
  {
    company: "HDFC Bank",
    symbol: "HDFCBANK",
    slug: "hdfc-bank",
    quarter: "Dec 2025",
    promoter: 0.0,
    promoterPledged: 0.0,
    fii: 51.20,
    dii: 28.40,
    retail: 20.40,
    qoqPromoterChange: 0.0,
    qoqFiiChange: 1.40,
    qoqDiiChange: -0.80,
  },
  {
    company: "ICICI Bank",
    symbol: "ICICIBANK",
    slug: "icici-bank",
    quarter: "Dec 2025",
    promoter: 0.0,
    promoterPledged: 0.0,
    fii: 45.60,
    dii: 32.10,
    retail: 22.30,
    qoqPromoterChange: 0.0,
    qoqFiiChange: 2.10,
    qoqDiiChange: -1.20,
  },
  {
    company: "TCS",
    symbol: "TCS",
    slug: "tata-consultancy-services",
    quarter: "Dec 2025",
    promoter: 72.30,
    promoterPledged: 0.0,
    fii: 13.20,
    dii: 8.80,
    retail: 5.70,
    qoqPromoterChange: -0.10,
    qoqFiiChange: 0.60,
    qoqDiiChange: 0.20,
  },
  {
    company: "Infosys",
    symbol: "INFY",
    slug: "infosys",
    quarter: "Dec 2025",
    promoter: 14.80,
    promoterPledged: 0.0,
    fii: 34.60,
    dii: 29.40,
    retail: 21.20,
    qoqPromoterChange: -0.40,
    qoqFiiChange: 1.80,
    qoqDiiChange: 0.60,
  },
  {
    company: "Bajaj Finance",
    symbol: "BAJFINANCE",
    slug: "bajaj-finance",
    quarter: "Dec 2025",
    promoter: 54.78,
    promoterPledged: 0.0,
    fii: 18.40,
    dii: 16.80,
    retail: 10.02,
    qoqPromoterChange: 0.0,
    qoqFiiChange: 1.20,
    qoqDiiChange: 0.80,
  },
  {
    company: "Hindustan Unilever",
    symbol: "HINDUNILVR",
    slug: "hindustan-unilever",
    quarter: "Dec 2025",
    promoter: 61.90,
    promoterPledged: 0.0,
    fii: 12.30,
    dii: 15.60,
    retail: 10.20,
    qoqPromoterChange: 0.0,
    qoqFiiChange: -0.80,
    qoqDiiChange: 1.20,
  },
  {
    company: "ITC",
    symbol: "ITC",
    slug: "itc",
    quarter: "Dec 2025",
    promoter: 0.0,
    promoterPledged: 0.0,
    fii: 41.80,
    dii: 32.60,
    retail: 25.60,
    qoqPromoterChange: 0.0,
    qoqFiiChange: -1.40,
    qoqDiiChange: 2.10,
  },
  {
    company: "Larsen & Toubro",
    symbol: "LT",
    slug: "larsen-toubro",
    quarter: "Dec 2025",
    promoter: 0.0,
    promoterPledged: 0.0,
    fii: 26.40,
    dii: 39.20,
    retail: 34.40,
    qoqPromoterChange: 0.0,
    qoqFiiChange: -0.60,
    qoqDiiChange: 1.60,
  },
  {
    company: "Adani Enterprises",
    symbol: "ADANIENT",
    slug: "adani-enterprises",
    quarter: "Dec 2025",
    promoter: 72.60,
    promoterPledged: 18.40,
    fii: 15.20,
    dii: 5.80,
    retail: 6.40,
    qoqPromoterChange: -0.20,
    qoqFiiChange: 2.40,
    qoqDiiChange: 0.40,
  },
  {
    company: "State Bank of India",
    symbol: "SBIN",
    slug: "state-bank-of-india",
    quarter: "Dec 2025",
    promoter: 57.54,
    promoterPledged: 0.0,
    fii: 11.80,
    dii: 20.40,
    retail: 10.26,
    qoqPromoterChange: 0.0,
    qoqFiiChange: 0.40,
    qoqDiiChange: -0.20,
  },
  {
    company: "Kotak Mahindra Bank",
    symbol: "KOTAKBANK",
    slug: "kotak-mahindra-bank",
    quarter: "Dec 2025",
    promoter: 25.90,
    promoterPledged: 0.0,
    fii: 38.60,
    dii: 22.40,
    retail: 13.10,
    qoqPromoterChange: -0.30,
    qoqFiiChange: 1.60,
    qoqDiiChange: 0.80,
  },
  {
    company: "Asian Paints",
    symbol: "ASIANPAINT",
    slug: "asian-paints",
    quarter: "Dec 2025",
    promoter: 52.63,
    promoterPledged: 0.0,
    fii: 16.20,
    dii: 21.40,
    retail: 9.77,
    qoqPromoterChange: 0.0,
    qoqFiiChange: -1.20,
    qoqDiiChange: 1.80,
  },
  {
    company: "Maruti Suzuki India",
    symbol: "MARUTI",
    slug: "maruti-suzuki-india",
    quarter: "Dec 2025",
    promoter: 58.19,
    promoterPledged: 0.0,
    fii: 22.60,
    dii: 13.40,
    retail: 5.81,
    qoqPromoterChange: 0.0,
    qoqFiiChange: 1.00,
    qoqDiiChange: -0.40,
  },
  {
    company: "Sun Pharmaceutical",
    symbol: "SUNPHARMA",
    slug: "sun-pharmaceutical-industries",
    quarter: "Dec 2025",
    promoter: 54.48,
    promoterPledged: 0.0,
    fii: 18.80,
    dii: 17.40,
    retail: 9.32,
    qoqPromoterChange: 0.0,
    qoqFiiChange: 0.80,
    qoqDiiChange: 0.40,
  },
  {
    company: "Wipro",
    symbol: "WIPRO",
    slug: "wipro",
    quarter: "Dec 2025",
    promoter: 72.86,
    promoterPledged: 0.0,
    fii: 7.40,
    dii: 10.60,
    retail: 9.14,
    qoqPromoterChange: -1.80,
    qoqFiiChange: 0.60,
    qoqDiiChange: 0.40,
  },
  {
    company: "NTPC",
    symbol: "NTPC",
    slug: "ntpc",
    quarter: "Dec 2025",
    promoter: 54.37,
    promoterPledged: 0.0,
    fii: 8.60,
    dii: 24.80,
    retail: 12.23,
    qoqPromoterChange: 0.0,
    qoqFiiChange: 0.20,
    qoqDiiChange: 0.60,
  },
  {
    company: "Tata Motors",
    symbol: "TATAMOTORS",
    slug: "tata-motors",
    quarter: "Dec 2025",
    promoter: 46.36,
    promoterPledged: 0.0,
    fii: 21.40,
    dii: 20.80,
    retail: 11.44,
    qoqPromoterChange: 0.0,
    qoqFiiChange: -1.60,
    qoqDiiChange: 2.20,
  },
  {
    company: "Vedanta",
    symbol: "VEDL",
    slug: "vedanta",
    quarter: "Dec 2025",
    promoter: 56.38,
    promoterPledged: 52.40,
    fii: 10.20,
    dii: 16.40,
    retail: 17.02,
    qoqPromoterChange: -0.60,
    qoqFiiChange: -0.80,
    qoqDiiChange: 1.40,
  },
  {
    company: "Bharat Petroleum",
    symbol: "BPCL",
    slug: "bharat-petroleum",
    quarter: "Dec 2025",
    promoter: 52.98,
    promoterPledged: 0.0,
    fii: 12.40,
    dii: 22.60,
    retail: 12.02,
    qoqPromoterChange: 0.0,
    qoqFiiChange: 0.40,
    qoqDiiChange: 0.60,
  },
];

type FilterTab = "all" | "high-pledge" | "fii-buying" | "fii-selling";

function ChangeCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-gray-400 flex items-center gap-0.5 text-xs"><Minus className="w-3 h-3" /> 0</span>;
  if (value > 0) return (
    <span className="text-green-700 flex items-center gap-0.5 text-xs font-medium">
      <ArrowUp className="w-3 h-3" /> +{value.toFixed(2)}%
    </span>
  );
  return (
    <span className="text-red-600 flex items-center gap-0.5 text-xs font-medium">
      <ArrowDown className="w-3 h-3" /> {value.toFixed(2)}%
    </span>
  );
}

export default function ShareholdingPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<"fii-buy" | "promoter-sell" | "pledge">("fii-buy");

  const filtered = useMemo(() => {
    let data = [...shareholdingData];

    if (activeTab === "high-pledge") data = data.filter((d) => d.promoterPledged > 30);
    else if (activeTab === "fii-buying") data = data.filter((d) => d.qoqFiiChange > 0.5);
    else if (activeTab === "fii-selling") data = data.filter((d) => d.qoqFiiChange < -0.5);

    if (sortBy === "fii-buy") data.sort((a, b) => b.qoqFiiChange - a.qoqFiiChange);
    else if (sortBy === "promoter-sell") data.sort((a, b) => a.qoqPromoterChange - b.qoqPromoterChange);
    else if (sortBy === "pledge") data.sort((a, b) => b.promoterPledged - a.promoterPledged);

    return data;
  }, [activeTab, sortBy]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All Companies" },
    { id: "high-pledge", label: "High Pledge (>30%)" },
    { id: "fii-buying", label: "FII Buying" },
    { id: "fii-selling", label: "FII Selling" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Promoter & Shareholding Tracker</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl">
          Track how promoters, FIIs, and DIIs are changing their ownership every quarter across top Nifty 50 companies.
          Data for Dec 2025 quarter.
        </p>
      </div>

      {/* Red flags callout */}
      <div className="card p-4 flex gap-3 bg-red-50 border-red-200">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">Red Flags to Watch</p>
          <p className="text-sm text-red-700 mt-0.5">
            <strong>Promoter pledge above 50%</strong> is a high risk signal — pledged shares can be sold by lenders if the stock falls,
            creating a negative spiral. <strong>Promoter selling</strong> consistently over multiple quarters is also a caution sign.
            <strong> FII buying</strong> indicates international confidence in the company.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="fii-buy">FII Buying Most</option>
            <option value="promoter-sell">Promoter Selling Most</option>
            <option value="pledge">High Pledge First</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} companies shown</p>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[160px]">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Symbol</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Promoter %</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">QoQ Change</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Pledged %</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">FII %</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">FII Change</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">DII %</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">DII Change</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Retail %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d) => (
                <tr key={d.symbol} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/ticker/${d.slug}`}
                      className="font-medium text-indigo-700 hover:underline"
                    >
                      {d.company}
                    </Link>
                    <div className="text-xs text-gray-400">{d.quarter}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{d.symbol}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    {d.promoter > 0 ? `${d.promoter.toFixed(2)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChangeCell value={d.qoqPromoterChange} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.promoterPledged > 0 ? (
                      <span className={`font-semibold ${d.promoterPledged >= 50 ? "text-red-700" : d.promoterPledged >= 20 ? "text-orange-600" : "text-gray-700"}`}>
                        {d.promoterPledged.toFixed(2)}%
                        {d.promoterPledged >= 50 && " ⚠️"}
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs font-medium">Nil</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{d.fii.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right">
                    <ChangeCell value={d.qoqFiiChange} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{d.dii.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right">
                    <ChangeCell value={d.qoqDiiChange} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{d.retail.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>QoQ Change:</strong> Percentage point change from previous quarter.</p>
            <p><strong>Pledged %:</strong> % of promoter holding that is pledged as collateral. Red if &gt;50%, orange if &gt;20%.</p>
            <p><strong>FII:</strong> Foreign Institutional Investors. Rising FII indicates growing international confidence.</p>
            <p><strong>DII:</strong> Domestic Institutional Investors (mutual funds, insurance companies, etc.)</p>
            <p>Data for Dec 2025 quarter. Source: BSE/NSE exchange filings. Always verify at official sources before investing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
