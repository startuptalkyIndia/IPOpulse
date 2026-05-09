import Link from "next/link";
import { TrendingUp, User as UserIcon, ChevronDown } from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { SearchPalette } from "./SearchPalette";
import { MobileNav } from "./MobileNav";

interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  href?: string; // if set, the label itself is also a link
  items: NavItem[][];  // array of columns
}

const navGroups: NavGroup[] = [
  {
    label: "IPO",
    href: "/ipo",
    items: [
      [
        { href: "/ipo/live",      label: "Live IPOs",         badge: "🔴" },
        { href: "/ipo/upcoming",  label: "Upcoming IPOs" },
        { href: "/ipo/closed",    label: "Closed IPOs" },
        { href: "/ipo/listed",    label: "Listed IPOs" },
        { href: "/ipo/sme",       label: "SME IPOs" },
      ],
      [
        { href: "/ipo/this-week",    label: "This Week" },
        { href: "/ipo/calendar",     label: "IPO Calendar" },
        { href: "/ipo/allotment",    label: "Allotment Status" },
        { href: "/ipo/stats",        label: "IPO Statistics" },
        { href: "/ipo/process",      label: "IPO Process Guide" },
      ],
      [
        { href: "/ipo/gmp-accuracy", label: "GMP Accuracy" },
        { href: "/ipo/drhp",         label: "DRHP AI Search" },
        { href: "/ipo/allotment-probability", label: "Allotment Probability" },
        { href: "/ipo/year/2026",    label: "IPOs of 2026" },
        { href: "/ipo/compare",      label: "Compare IPOs" },
      ],
    ],
  },
  {
    label: "Markets",
    items: [
      [
        { href: "/ticker",          label: "Stock Ticker" },
        { href: "/screener",        label: "Stock Screener" },
        { href: "/movers",          label: "Gainers / Losers" },
        { href: "/sectors",         label: "Sectors" },
        { href: "/indices",         label: "Nifty Indices" },
      ],
      [
        { href: "/fii-dii",           label: "FII / DII Activity" },
        { href: "/super-investor",    label: "Super Investors" },
        { href: "/market/breadth",    label: "Market Breadth" },
        { href: "/market/holidays",   label: "Market Holidays 2026" },
        { href: "/daily-summary",     label: "Daily Market Wrap" },
      ],
      [
        { href: "/mutual-funds",          label: "Mutual Funds" },
        { href: "/earnings-calendar",     label: "Earnings Calendar" },
        { href: "/dividend-yield",        label: "Dividend Yield" },
        { href: "/unlisted-shares",       label: "Unlisted Shares" },
        { href: "/corporate-actions",     label: "Corporate Actions" },
      ],
    ],
  },
  {
    label: "Research",
    items: [
      [
        { href: "/research",            label: "Research Hub" },
        { href: "/research/next-day",   label: "Tomorrow's Watch List" },
        { href: "/sectors/momentum",    label: "Sector Momentum" },
        { href: "/sectors/fpi-flows",   label: "FPI Sector Flows" },
      ],
      [
        { href: "/deals/bulk",          label: "Bulk Deals" },
        { href: "/deals/block",         label: "Block Deals" },
        { href: "/insider-trading",     label: "Insider Trading" },
        { href: "/tools/concall-summary", label: "Concall AI" },
      ],
    ],
  },
  {
    label: "Learn",
    items: [
      [
        { href: "/learn",       label: "Learning Hub", badge: "35 guides" },
        { href: "/glossary",    label: "Financial Glossary" },
        { href: "/ipo/process", label: "How IPO Works" },
        { href: "/market/holidays", label: "Market Holidays" },
      ],
      [
        { href: "/calculators",        label: "All Calculators" },
        { href: "/calculators/sip",    label: "SIP Calculator" },
        { href: "/calculators/emi",    label: "EMI Calculator" },
        { href: "/calculators/tax",    label: "Income Tax" },
      ],
      [
        { href: "/compare/brokers",       label: "Compare Brokers" },
        { href: "/compare/credit-cards",  label: "Credit Cards" },
        { href: "/compare/insurance",     label: "Insurance Plans" },
        { href: "/us-ipo",                label: "US IPO Tracker" },
        { href: "/us-listing",            label: "Indian ADRs" },
      ],
    ],
  },
];

export async function Nav() {
  const session = await auth();
  const authed = !!session?.user;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 text-lg">
            IPO<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">pulse</span>
          </span>
        </Link>

        {/* Desktop nav — dropdown groups */}
        <nav className="hidden md:flex items-center gap-1">
          {navGroups.map((group) => (
            <div key={group.label} className="group relative">
              {/* Trigger */}
              <div className="flex items-center gap-0.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors select-none">
                {group.href ? (
                  <Link href={group.href} className="font-medium">{group.label}</Link>
                ) : (
                  <span className="font-medium">{group.label}</span>
                )}
                <ChevronDown className="w-3.5 h-3.5 mt-0.5 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:rotate-180" />
              </div>

              {/* Dropdown panel */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 hidden group-hover:block">
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 min-w-max">
                  <div className={`flex gap-6 ${group.items.length === 2 ? "min-w-[340px]" : "min-w-[540px]"}`}>
                    {group.items.map((column, ci) => (
                      <div key={ci} className="space-y-0.5 flex-1 min-w-[140px]">
                        {column.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors whitespace-nowrap"
                          >
                            {item.badge && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-semibold">
                                {item.badge}
                              </span>
                            )}
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <MobileNav authed={authed} />
          <SearchPalette />
          <ThemeToggle />
          {authed ? (
            <Link
              href="/my/watchlist"
              className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-full hover:bg-indigo-100"
            >
              <UserIcon className="w-3.5 h-3.5" /> My
            </Link>
          ) : (
            <>
              <Link href="/signin" className="hidden sm:inline-block text-sm text-gray-500 hover:text-gray-900">
                Sign in
              </Link>
              <Link href="/signup" className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                Sign up
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
