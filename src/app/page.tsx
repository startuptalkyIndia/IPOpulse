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
    lines: ["Upcoming · Live · Closed · Listed", "GMP · Subscription · Allotment"],
  },
  {
    title: "Ticker",
    icon: LineChart,
    href: "/ticker",
    lines: ["5,500+ listed companies", "10-yr financials, ratios, peers"],
  },
  {
    title: "Sectors",
    icon: PieChart,
    href: "/sectors",
    lines: ["Sectoral indices & heatmaps", "FII flows by sector"],
  },
  {
    title: "Super Investor",
    icon: Users,
    href: "/super-investor",
    lines: ["Track 40+ big-name portfolios", "Free alerts on their buys/sells"],
  },
  {
    title: "FII / DII",
    icon: Activity,
    href: "/fii-dii",
    lines: ["Daily cash + F&O flows", "20-year history & trends"],
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/corporate-actions",
    lines: ["Dividends, splits, bonus, rights", "Board meetings & AGMs"],
  },
  {
    title: "Calculators",
    icon: Calculator,
    href: "/calculators",
    lines: ["SIP, EMI, Tax, FD, Brokerage", "20+ tools, all free"],
  },
  {
    title: "DRHP Library",
    icon: FileText,
    href: "/ipo/drhp",
    lines: ["Every IPO prospectus", "AI-powered search (coming)"],
  },
];

const calcShortcuts = [
  { href: "/calculators/sip", label: "SIP Calculator" },
  { href: "/calculators/emi", label: "EMI Calculator" },
  { href: "/calculators/tax", label: "Income Tax" },
  { href: "/calculators/lumpsum", label: "Lumpsum" },
  { href: "/calculators/fd", label: "FD Calculator" },
  { href: "/calculators/brokerage", label: "Brokerage" },
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
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 via-white to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="badge badge-info mb-4">India's structured market data hub</span>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Every IPO, every stock, every number — in one clean dashboard.
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-700 max-w-2xl">
              Live GMP with history. Allotment in one click. 10-year financials. Sector-wise FII flows.
              Super-investor portfolios. 20+ free calculators. Built mobile-first, ad-light, and structured
              — so you find what you need in seconds.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/ipo" className="btn-primary inline-flex items-center gap-1">
                Explore IPOs <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/calculators" className="btn-secondary">
                Try Calculators
              </Link>
            </div>
            {/* Live stats strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                <div className="text-[11px] text-gray-500">Open IPOs</div>
                <div className="text-lg font-bold text-indigo-700 tabular-nums">{liveCount}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                <div className="text-[11px] text-gray-500">Upcoming IPOs</div>
                <div className="text-lg font-bold text-indigo-700 tabular-nums">{upcomingCount}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                <div className="text-[11px] text-gray-500">FII net (today)</div>
                <div className={`text-lg font-bold tabular-nums ${fiiNet == null ? "text-gray-400" : fiiNet >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {fiiNet == null ? "—" : formatCurrency(fiiNet)}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                <div className="text-[11px] text-gray-500">DII net (today)</div>
                <div className={`text-lg font-bold tabular-nums ${diiNet == null ? "text-gray-400" : diiNet >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {diiNet == null ? "—" : formatCurrency(diiNet)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Everything in one place</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleCards.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                href={m.href}
                className="card hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{m.title}</h3>
                {m.lines.map((line) => (
                  <p key={line} className="text-xs text-gray-500 leading-relaxed">
                    {line}
                  </p>
                ))}
                <div className="mt-3 text-xs font-medium text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1">
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Calculator shortcuts */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Popular Calculators
            </h2>
            <Link href="/calculators" className="text-sm text-indigo-600 hover:text-indigo-800">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {calcShortcuts.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="text-center text-sm text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 rounded-lg px-3 py-3 transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <NewsletterSignup variant="card" />
      </section>

      {/* Coming soon data teasers */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Live IPOs</h3>
              <span className="badge badge-warning">Wiring up</span>
            </div>
            <p className="text-xs text-gray-500">
              Real-time subscription status (Retail / NII / QIB / Employee), anchor allocations, and
              GMP with full history.
            </p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">FII / DII Today</h3>
              <span className="badge badge-warning">Wiring up</span>
            </div>
            <p className="text-xs text-gray-500">
              Daily cash and F&amp;O flows from NSE, plus NSDL's monthly FPI AUC with sector-wise
              breakdown charts.
            </p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Super Investor Moves</h3>
              <span className="badge badge-warning">Wiring up</span>
            </div>
            <p className="text-xs text-gray-500">
              Rekha Jhunjhunwala, Damani, Kacholia, Kedia and 40+ others — every quarterly move,
              with free email alerts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
