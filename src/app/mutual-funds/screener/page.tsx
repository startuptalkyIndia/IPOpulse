"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ArrowLeft, ExternalLink, Info, Star } from "lucide-react";

interface MutualFund {
  slug: string;
  name: string;
  amc: string;
  category: "Large Cap" | "Mid Cap" | "Small Cap" | "Flexi Cap" | "ELSS" | "Index" | "Hybrid" | "Debt" | "International";
  subCategory: string;
  aum: string;
  nav: number;
  expenseRatioDirect: number;
  returns1y: number;
  returns3y: number;
  returns5y: number;
  rating: number;
  minSip: number;
  exitLoad: string;
  riskLevel: "Low" | "Moderate" | "High" | "Very High";
}

const mutualFunds: MutualFund[] = [
  {
    slug: "sbi-nifty-50-index-fund",
    name: "SBI Nifty 50 Index Fund",
    amc: "SBI Mutual Fund",
    category: "Index",
    subCategory: "Nifty 50 Index",
    aum: "₹28,500 Cr",
    nav: 228.45,
    expenseRatioDirect: 0.10,
    returns1y: 14.2,
    returns3y: 13.8,
    returns5y: 17.4,
    rating: 5,
    minSip: 500,
    exitLoad: "Nil",
    riskLevel: "Very High",
  },
  {
    slug: "uti-nifty-50-index-fund",
    name: "UTI Nifty 50 Index Fund",
    amc: "UTI Mutual Fund",
    category: "Index",
    subCategory: "Nifty 50 Index",
    aum: "₹21,200 Cr",
    nav: 145.60,
    expenseRatioDirect: 0.08,
    returns1y: 14.3,
    returns3y: 13.9,
    returns5y: 17.6,
    rating: 5,
    minSip: 500,
    exitLoad: "Nil",
    riskLevel: "Very High",
  },
  {
    slug: "hdfc-mid-cap-opportunities",
    name: "HDFC Mid-Cap Opportunities Fund",
    amc: "HDFC Mutual Fund",
    category: "Mid Cap",
    subCategory: "Mid Cap Fund",
    aum: "₹85,400 Cr",
    nav: 184.30,
    expenseRatioDirect: 0.72,
    returns1y: 21.8,
    returns3y: 26.4,
    returns5y: 29.2,
    rating: 5,
    minSip: 100,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "nippon-india-small-cap",
    name: "Nippon India Small Cap Fund",
    amc: "Nippon India Mutual Fund",
    category: "Small Cap",
    subCategory: "Small Cap Fund",
    aum: "₹62,800 Cr",
    nav: 178.90,
    expenseRatioDirect: 0.68,
    returns1y: 18.5,
    returns3y: 31.2,
    returns5y: 34.8,
    rating: 5,
    minSip: 100,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "parag-parikh-flexi-cap",
    name: "Parag Parikh Flexi Cap Fund",
    amc: "PPFAS Mutual Fund",
    category: "Flexi Cap",
    subCategory: "Flexi Cap Fund",
    aum: "₹78,200 Cr",
    nav: 92.40,
    expenseRatioDirect: 0.55,
    returns1y: 19.6,
    returns3y: 21.3,
    returns5y: 25.8,
    rating: 5,
    minSip: 1000,
    exitLoad: "2% within 365 days",
    riskLevel: "Very High",
  },
  {
    slug: "axis-bluechip-fund",
    name: "Axis Bluechip Fund",
    amc: "Axis Mutual Fund",
    category: "Large Cap",
    subCategory: "Large Cap Fund",
    aum: "₹42,100 Cr",
    nav: 62.30,
    expenseRatioDirect: 0.45,
    returns1y: 12.4,
    returns3y: 14.2,
    returns5y: 16.8,
    rating: 4,
    minSip: 500,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "mirae-asset-large-cap",
    name: "Mirae Asset Large Cap Fund",
    amc: "Mirae Asset Mutual Fund",
    category: "Large Cap",
    subCategory: "Large Cap Fund",
    aum: "₹38,600 Cr",
    nav: 108.20,
    expenseRatioDirect: 0.50,
    returns1y: 13.8,
    returns3y: 15.6,
    returns5y: 18.2,
    rating: 5,
    minSip: 1000,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "hdfc-elss-tax-saver",
    name: "HDFC ELSS Tax Saver",
    amc: "HDFC Mutual Fund",
    category: "ELSS",
    subCategory: "ELSS (Tax Saver)",
    aum: "₹16,800 Cr",
    nav: 1092.50,
    expenseRatioDirect: 0.72,
    returns1y: 16.2,
    returns3y: 19.4,
    returns5y: 21.6,
    rating: 4,
    minSip: 500,
    exitLoad: "Nil (3-year lock-in)",
    riskLevel: "Very High",
  },
  {
    slug: "quant-small-cap-fund",
    name: "Quant Small Cap Fund",
    amc: "Quant Mutual Fund",
    category: "Small Cap",
    subCategory: "Small Cap Fund",
    aum: "₹26,400 Cr",
    nav: 268.60,
    expenseRatioDirect: 0.62,
    returns1y: 22.4,
    returns3y: 36.8,
    returns5y: 42.1,
    rating: 4,
    minSip: 1000,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "motilal-oswal-midcap",
    name: "Motilal Oswal Midcap Fund",
    amc: "Motilal Oswal Mutual Fund",
    category: "Mid Cap",
    subCategory: "Mid Cap Fund",
    aum: "₹18,200 Cr",
    nav: 102.80,
    expenseRatioDirect: 0.60,
    returns1y: 28.4,
    returns3y: 32.1,
    returns5y: 30.6,
    rating: 4,
    minSip: 500,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "sbi-contra-fund",
    name: "SBI Contra Fund",
    amc: "SBI Mutual Fund",
    category: "Flexi Cap",
    subCategory: "Contra Fund",
    aum: "₹38,900 Cr",
    nav: 384.20,
    expenseRatioDirect: 0.68,
    returns1y: 17.2,
    returns3y: 28.4,
    returns5y: 30.2,
    rating: 4,
    minSip: 500,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "icici-pru-bluechip",
    name: "ICICI Prudential Bluechip Fund",
    amc: "ICICI Prudential Mutual Fund",
    category: "Large Cap",
    subCategory: "Large Cap Fund",
    aum: "₹58,400 Cr",
    nav: 98.70,
    expenseRatioDirect: 0.90,
    returns1y: 14.8,
    returns3y: 17.2,
    returns5y: 19.4,
    rating: 4,
    minSip: 100,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "kotak-flexicap-fund",
    name: "Kotak Flexicap Fund",
    amc: "Kotak Mutual Fund",
    category: "Flexi Cap",
    subCategory: "Flexi Cap Fund",
    aum: "₹46,200 Cr",
    nav: 78.40,
    expenseRatioDirect: 0.55,
    returns1y: 15.4,
    returns3y: 18.6,
    returns5y: 20.2,
    rating: 4,
    minSip: 100,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "dsp-small-cap-fund",
    name: "DSP Small Cap Fund",
    amc: "DSP Mutual Fund",
    category: "Small Cap",
    subCategory: "Small Cap Fund",
    aum: "₹16,600 Cr",
    nav: 186.40,
    expenseRatioDirect: 0.72,
    returns1y: 14.8,
    returns3y: 24.6,
    returns5y: 28.4,
    rating: 4,
    minSip: 100,
    exitLoad: "1% within 12 months",
    riskLevel: "Very High",
  },
  {
    slug: "axis-midcap-fund",
    name: "Axis Midcap Fund",
    amc: "Axis Mutual Fund",
    category: "Mid Cap",
    subCategory: "Mid Cap Fund",
    aum: "₹28,400 Cr",
    nav: 96.80,
    expenseRatioDirect: 0.48,
    returns1y: 16.4,
    returns3y: 22.4,
    returns5y: 24.8,
    rating: 4,
    minSip: 500,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "franklin-india-prima-fund",
    name: "Franklin India Prima Fund",
    amc: "Franklin Templeton",
    category: "Mid Cap",
    subCategory: "Mid Cap Fund",
    aum: "₹12,400 Cr",
    nav: 2684.50,
    expenseRatioDirect: 0.96,
    returns1y: 18.2,
    returns3y: 24.8,
    returns5y: 26.4,
    rating: 3,
    minSip: 500,
    exitLoad: "1% within 1 year",
    riskLevel: "Very High",
  },
  {
    slug: "canara-robeco-equity-hybrid",
    name: "Canara Robeco Equity Hybrid Fund",
    amc: "Canara Robeco Mutual Fund",
    category: "Hybrid",
    subCategory: "Aggressive Hybrid",
    aum: "₹8,600 Cr",
    nav: 286.40,
    expenseRatioDirect: 0.60,
    returns1y: 13.2,
    returns3y: 16.8,
    returns5y: 18.2,
    rating: 4,
    minSip: 1000,
    exitLoad: "1% within 1 year",
    riskLevel: "High",
  },
  {
    slug: "hdfc-balanced-advantage",
    name: "HDFC Balanced Advantage Fund",
    amc: "HDFC Mutual Fund",
    category: "Hybrid",
    subCategory: "Balanced Advantage",
    aum: "₹92,400 Cr",
    nav: 448.60,
    expenseRatioDirect: 0.75,
    returns1y: 12.4,
    returns3y: 18.6,
    returns5y: 19.8,
    rating: 5,
    minSip: 100,
    exitLoad: "1% within 1 year",
    riskLevel: "Moderate",
  },
  {
    slug: "aditya-birla-sunlife-liquid",
    name: "Aditya Birla Sun Life Liquid Fund",
    amc: "Aditya Birla Sun Life AMC",
    category: "Debt",
    subCategory: "Liquid Fund",
    aum: "₹48,200 Cr",
    nav: 402.80,
    expenseRatioDirect: 0.10,
    returns1y: 7.2,
    returns3y: 6.8,
    returns5y: 5.8,
    rating: 5,
    minSip: 1000,
    exitLoad: "Nil (after 7 days)",
    riskLevel: "Low",
  },
  {
    slug: "sbi-magnum-gilt-fund",
    name: "SBI Magnum Gilt Fund",
    amc: "SBI Mutual Fund",
    category: "Debt",
    subCategory: "Gilt Fund",
    aum: "₹9,200 Cr",
    nav: 68.40,
    expenseRatioDirect: 0.46,
    returns1y: 8.4,
    returns3y: 7.6,
    returns5y: 7.2,
    rating: 4,
    minSip: 500,
    exitLoad: "Nil",
    riskLevel: "Moderate",
  },
];

const categoryColors: Record<string, string> = {
  "Large Cap": "bg-blue-100 text-blue-700",
  "Mid Cap": "bg-violet-100 text-violet-700",
  "Small Cap": "bg-orange-100 text-orange-700",
  "Flexi Cap": "bg-indigo-100 text-indigo-700",
  "ELSS": "bg-green-100 text-green-700",
  "Index": "bg-gray-100 text-gray-700",
  "Hybrid": "bg-teal-100 text-teal-700",
  "Debt": "bg-yellow-100 text-yellow-700",
  "International": "bg-pink-100 text-pink-700",
};

const riskColors: Record<string, string> = {
  "Low": "bg-green-100 text-green-700",
  "Moderate": "bg-yellow-100 text-yellow-700",
  "High": "bg-orange-100 text-orange-700",
  "Very High": "bg-red-100 text-red-700",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

const categories = ["All", "Large Cap", "Mid Cap", "Small Cap", "Flexi Cap", "ELSS", "Index", "Hybrid", "Debt", "International"];
const riskLevels = ["All", "Low", "Moderate", "High", "Very High"];
const sortOptions = [
  { value: "returns1y", label: "1Y Returns" },
  { value: "returns3y", label: "3Y Returns" },
  { value: "returns5y", label: "5Y Returns" },
  { value: "rating", label: "Rating" },
  { value: "aum", label: "AUM" },
  { value: "expenseRatioDirect", label: "Expense Ratio (Low)" },
];

export default function MFScreenerPage() {
  const [category, setCategory] = useState("All");
  const [risk, setRisk] = useState("All");
  const [minReturn1y, setMinReturn1y] = useState("");
  const [minReturn3y, setMinReturn3y] = useState("");
  const [sortBy, setSortBy] = useState("returns3y");

  const filtered = useMemo(() => {
    let funds = [...mutualFunds];
    if (category !== "All") funds = funds.filter((f) => f.category === category);
    if (risk !== "All") funds = funds.filter((f) => f.riskLevel === risk);
    if (minReturn1y) funds = funds.filter((f) => f.returns1y >= Number(minReturn1y));
    if (minReturn3y) funds = funds.filter((f) => f.returns3y >= Number(minReturn3y));

    funds.sort((a, b) => {
      if (sortBy === "expenseRatioDirect") return a.expenseRatioDirect - b.expenseRatioDirect;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "returns1y") return b.returns1y - a.returns1y;
      if (sortBy === "returns3y") return b.returns3y - a.returns3y;
      if (sortBy === "returns5y") return b.returns5y - a.returns5y;
      return 0;
    });

    return funds;
  }, [category, risk, minReturn1y, minReturn3y, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mutual-funds" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mutual Fund Screener</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Top 20 Indian mutual funds ranked by 1Y, 3Y, 5Y returns — filter by category and risk
          </p>
        </div>
      </div>

      {/* Direct vs Regular info box */}
      <div className="card p-4 flex gap-3 bg-indigo-50 border-indigo-200">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-indigo-800">Direct vs Regular Plans</p>
          <p className="text-sm text-indigo-700 mt-0.5">
            <strong>Direct plans</strong> have lower expense ratios (no distributor commission) and generate higher returns over time.
            Expense ratios shown below are for <strong>Direct</strong> plans. Invest via{" "}
            <a href="https://mfcentral.com" target="_blank" rel="noopener" className="underline">MF Central</a>,{" "}
            <a href="https://coin.zerodha.com" target="_blank" rel="noopener" className="underline">Zerodha Coin</a>, or
            any SEBI-registered MFD.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</label>
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {riskLevels.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Min 1Y Return %</label>
            <input
              type="number"
              placeholder="e.g. 15"
              value={minReturn1y}
              onChange={(e) => setMinReturn1y(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Min 3Y Return %</label>
            <input
              type="number"
              placeholder="e.g. 20"
              value={minReturn3y}
              onChange={(e) => setMinReturn3y(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <button
            onClick={() => { setCategory("All"); setRisk("All"); setMinReturn1y(""); setMinReturn3y(""); setSortBy("returns3y"); }}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2">{filtered.length} funds shown</p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[220px]">Fund Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[120px]">AMC</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">AUM</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Exp. Ratio</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">1Y %</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">3Y %</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">5Y %</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Risk</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Min SIP</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((fund) => (
                <tr key={fund.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{fund.name}</div>
                    <div className="text-xs text-gray-400">NAV ₹{fund.nav.toFixed(2)} · Exit: {fund.exitLoad}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{fund.amc}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[fund.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {fund.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">{fund.aum}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${fund.expenseRatioDirect <= 0.20 ? "text-green-700" : fund.expenseRatioDirect >= 0.80 ? "text-red-600" : "text-gray-700"}`}>
                      {fund.expenseRatioDirect.toFixed(2)}%
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${fund.returns1y >= 20 ? "text-green-700" : fund.returns1y >= 12 ? "text-gray-800" : "text-red-600"}`}>
                    {fund.returns1y.toFixed(1)}%
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${fund.returns3y >= 25 ? "text-green-700" : fund.returns3y >= 15 ? "text-gray-800" : "text-red-600"}`}>
                    {fund.returns3y.toFixed(1)}%
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${fund.returns5y >= 25 ? "text-green-700" : fund.returns5y >= 15 ? "text-gray-800" : "text-red-600"}`}>
                    {fund.returns5y.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${riskColors[fund.riskLevel]}`}>
                      {fund.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">₹{fund.minSip.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <StarRating rating={fund.rating} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="card p-5 flex flex-wrap gap-3 items-center">
        <p className="text-sm text-gray-700 font-medium flex-1">Ready to invest? Use a direct plan platform:</p>
        <a
          href="https://mfcentral.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          MF Central <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href="https://coin.zerodha.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Zerodha Coin <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <p className="text-xs text-gray-400">
        Returns are approximate, based on publicly available AMFI data as of May 2026. Past returns do not guarantee future performance.
        Expense ratios shown are for Direct plans. Star ratings are indicative based on Value Research / Morningstar methodology.
        Not investment advice.
      </p>
    </div>
  );
}
