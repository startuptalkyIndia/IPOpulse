import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  Users,
  Calculator,
  Activity,
  ArrowRight,
  LineChart,
  PieChart,
  FileText,
  Filter,
  Coins,
  Globe,
  Newspaper,
  Scale,
  CreditCard,
  Shield,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const dynamic = "force-dynamic";

const moduleCards = [
  {
    title: "IPO Center",
    icon: TrendingUp,
    href: "/ipo",
    color: "bg-emerald-50 text-emerald-600",
    accent: "group-hover:text-emerald-700",
    lines: ["Upcoming · Live · Closed · Listed", "GMP · Subscription · Allotment"],
  },
  {
    title: "Screener",
    icon: Filter,
    href: "/screener",
    color: "bg-indigo-50 text-indigo-600",
    accent: "group-hover:text-indigo-800",
    lines: ["Filter 2,500+ stocks", "P/E · ROE · D/E · sector · market cap"],
  },
  {
    title: "Super Investor",
    icon: Users,
    href: "/super-investor",
    color: "bg-violet-50 text-violet-600",
    accent: "group-hover:text-violet-800",
    lines: ["Track 40+ big-name portfolios", "Rekha · Damani · Kacholia · Kedia"],
  },
  {
    title: "FII / DII",
    icon: Activity,
    href: "/fii-dii",
    color: "bg-rose-50 text-rose-600",
    accent: "group-hover:text-rose-800",
    lines: ["Daily cash + F&O flows", "20-year history & trends"],
  },
  {
    title: "Insider Trading",
    icon: Users,
    href: "/insider-trading",
    color: "bg-orange-50 text-orange-600",
    accent: "group-hover:text-orange-800",
    lines: ["Promoter buy/sell disclosures", "SEBI SAST filings daily"],
  },
  {
    title: "Bulk & Block Deals",
    icon: Activity,
    href: "/deals/bulk",
    color: "bg-amber-50 text-amber-600",
    accent: "group-hover:text-amber-800",
    lines: ["Large institutional trades", "NSE bulk + block deals daily"],
  },
  {
    title: "US Markets",
    icon: Globe,
    href: "/us-ipo",
    color: "bg-sky-50 text-sky-600",
    accent: "group-hover:text-sky-800",
    lines: ["US IPO tracker", "Indian ADRs · LRS calculator"],
  },
  {
    title: "Market Breadth",
    icon: LineChart,
    href: "/market/breadth",
    color: "bg-teal-50 text-teal-600",
    accent: "group-hover:text-teal-800",
    lines: ["Advance / decline ratio", "52-week highs · Circuit breakers"],
  },
  {
    title: "Ticker",
    icon: LineChart,
    href: "/ticker",
    color: "bg-blue-50 text-blue-600",
    accent: "group-hover:text-blue-800",
    lines: ["2,500+ listed companies", "Price, volume, market cap"],
  },
  {
    title: "Sectors",
    icon: PieChart,
    href: "/sectors",
    color: "bg-purple-50 text-purple-600",
    accent: "group-hover:text-purple-800",
    lines: ["Sectoral indices & heatmaps", "FII flows by sector"],
  },
  {
    title: "Gainers / Losers",
    icon: TrendingUp,
    href: "/movers",
    color: "bg-lime-50 text-lime-600",
    accent: "group-hover:text-lime-800",
    lines: ["Today's top movers", "Delivery %, 52-week highs/lows"],
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/corporate-actions",
    color: "bg-fuchsia-50 text-fuchsia-600",
    accent: "group-hover:text-fuchsia-800",
    lines: ["Dividends, splits, bonus, rights", "Board meetings & AGMs"],
  },
  {
    title: "Calculators",
    icon: Calculator,
    href: "/calculators",
    color: "bg-cyan-50 text-cyan-600",
    accent: "group-hover:text-cyan-800",
    lines: ["SIP, EMI, Tax, FD, Brokerage", "20+ tools, all free"],
  },
  {
    title: "DRHP Library",
    icon: FileText,
    href: "/ipo/drhp",
    color: "bg-slate-100 text-slate-600",
    accent: "group-hover:text-slate-800",
    lines: ["Every IPO prospectus", "AI-powered risk analysis"],
  },
  {
    title: "Unlisted Shares",
    icon: Coins,
    href: "/unlisted-shares",
    color: "bg-yellow-50 text-yellow-600",
    accent: "group-hover:text-yellow-800",
    lines: ["Pre-IPO grey market prices", "Multi-dealer median index"],
  },
  {
    title: "Daily Wrap",
    icon: Newspaper,
    href: "/daily-summary",
    color: "bg-pink-50 text-pink-600",
    accent: "group-hover:text-pink-800",
    lines: ["AI market summary at 4:30 PM", "Gainers · losers · FII/DII · IPOs"],
  },
  {
    title: "Tomorrow's Picks",
    icon: TrendingUp,
    href: "/research/next-day",
    color: "bg-rose-50 text-rose-600",
    accent: "group-hover:text-rose-800",
    lines: ["AI pre-market watch list", "Stocks · sector · FII signal · events"],
  },
  {
    title: "Compare Brokers",
    icon: Scale,
    href: "/compare/brokers",
    color: "bg-indigo-50 text-indigo-600",
    accent: "group-hover:text-indigo-800",
    lines: ["Zerodha · Groww · Upstox · Angel", "Fees, platforms, API access"],
  },
  {
    title: "Credit Cards",
    icon: CreditCard,
    href: "/compare/credit-cards",
    color: "bg-green-50 text-green-600",
    accent: "group-hover:text-green-800",
    lines: ["Top 6 Indian credit cards", "Rewards · lounge · annual fee"],
  },
  {
    title: "Insurance",
    icon: Shield,
    href: "/compare/insurance",
    color: "bg-blue-50 text-blue-600",
    accent: "group-hover:text-blue-800",
    lines: ["Term life & health plans", "Premium · claim ratio · features"],
  },
];

const calcShortcuts = [
  { href: "/calculators/sip", label: "SIP Calculator", color: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200" },
  { href: "/calculators/emi", label: "EMI Calculator", color: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200" },
  { href: "/calculators/tax", label: "Income Tax", color: "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200" },
  { href: "/calculators/lumpsum", label: "Lumpsum", color: "hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200" },
  { href: "/calculators/fd", label: "FD Calculator", color: "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200" },
  { href: "/calculators/brokerage", label: "Brokerage", color: "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200" },
];

const whyStats = [
  { stat: "2,500+", label: "Companies tracked", color: "text-indigo-600", bg: "bg-indigo-50" },
  { stat: "20+", label: "Free calculators", color: "text-emerald-600", bg: "bg-emerald-50" },
  { stat: "Daily", label: "FII/DII & price updates", color: "text-sky-600", bg: "bg-sky-50" },
  { stat: "AI", label: "DRHP risk analysis", color: "text-violet-600", bg: "bg-violet-50" },
];

export default async function HomePage() {
  const [liveCount, upcomingCount, todayFiiDii] = await Promise.all([
    prisma.ipo.count({ where: { status: "live" } }).catch(() => 0),
    prisma.ipo.count({ where: { status: "upcoming" } }).catch(() => 0),
    prisma.fiiDiiDaily.findFirst({ where: { segment: "cash" }, orderBy: { date: "desc" } }).catch(() => null),
  ]);
  const fiiNet = todayFiiDii?.fiiNet ? Number(todayFiiDii.fiiNet) : null;
  const diiNet = todayFiiDii?.diiNet ? Number(todayFiiDii.diiNet) : null;

  return (
    <div>
      {/* Hero — dark gradient */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 mb-4">
              🇮🇳 India&apos;s structured market data hub
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Every IPO, every stock,{" "}
              <span className="text-indigo-300">every number</span>
              {" "}— in one clean dashboard.
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-300 max-w-2xl">
              Live GMP with history. Allotment in one click. 10-year financials. Sector-wise FII flows.
              Super-investor portfolios. 20+ free calculators. Built mobile-first, ad-light, and structured
              — so you find what you need in seconds.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/ipo"
                className="inline-flex items-center gap-1.5 bg-white text-indigo-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors"
              >
                Explore IPOs <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/screener"
                className="inline-flex items-center gap-1 border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Stock Screener
              </Link>
              <Link
                href="/calculators"
                className="inline-flex items-center gap-1 border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Calculators
              </Link>
            </div>

            {/* Live stats strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2.5">
                <div className="text-[11px] text-slate-400 mb-0.5">Open IPOs</div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">{liveCount}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2.5">
                <div className="text-[11px] text-slate-400 mb-0.5">Upcoming IPOs</div>
                <div className="text-xl font-bold text-amber-400 tabular-nums">{upcomingCount}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2.5">
                <div className="text-[11px] text-slate-400 mb-0.5">FII net (today)</div>
                <div className={`text-xl font-bold tabular-nums ${fiiNet == null ? "text-slate-500" : fiiNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {fiiNet == null ? "—" : formatCurrency(fiiNet)}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2.5">
                <div className="text-[11px] text-slate-400 mb-0.5">DII net (today)</div>
                <div className={`text-xl font-bold tabular-nums ${diiNet == null ? "text-slate-500" : diiNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {diiNet == null ? "—" : formatCurrency(diiNet)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Everything in one place</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {moduleCards.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                href={m.href}
                className="card hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
              >
                <div className={`w-9 h-9 rounded-lg ${m.color} flex items-center justify-center mb-2.5`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{m.title}</h3>
                {m.lines.map((line) => (
                  <p key={line} className="text-xs text-gray-500 leading-relaxed">
                    {line}
                  </p>
                ))}
                <div className={`mt-3 text-xs font-medium text-indigo-500 ${m.accent} flex items-center gap-1`}>
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Calculator shortcuts */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <Calculator className="w-3.5 h-3.5" />
              </span>
              Popular Calculators
            </h2>
            <Link href="/calculators" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {calcShortcuts.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`text-center text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 transition-all duration-150 hover:shadow-sm ${c.color}`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <NewsletterSignup variant="card" />
      </section>

      {/* Why IPOpulse — colourful stats */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-14">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-6 py-8 md:px-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHg9IjAiIHk9IjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=')] opacity-40" />
          <div className="relative">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-4">Why IPOpulse?</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {whyStats.map((item) => (
                <div key={item.stat} className="text-center">
                  <div className="text-3xl font-bold text-white">{item.stat}</div>
                  <div className="text-white/70 text-xs mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
