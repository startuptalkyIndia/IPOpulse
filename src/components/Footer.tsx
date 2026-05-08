import Link from "next/link";

const columns = [
  {
    title: "IPO",
    links: [
      { href: "/ipo/live", label: "Live IPOs" },
      { href: "/ipo/upcoming", label: "Upcoming IPOs" },
      { href: "/ipo/closed", label: "Closed IPOs" },
      { href: "/ipo/listed", label: "Listed IPOs" },
      { href: "/ipo/sme", label: "SME IPOs" },
      { href: "/ipo/calendar", label: "IPO Calendar" },
      { href: "/ipo/allotment", label: "Allotment Status" },
      { href: "/ipo/this-week", label: "IPO This Week" },
      { href: "/ipo/year/2026", label: "IPOs of 2026" },
      { href: "/ipo/gmp-accuracy", label: "GMP Accuracy" },
      { href: "/ipo/drhp", label: "DRHP AI Search" },
    ],
  },
  {
    title: "Markets",
    links: [
      { href: "/ticker", label: "Stock Ticker" },
      { href: "/screener", label: "Stock Screener" },
      { href: "/movers", label: "Gainers / Losers" },
      { href: "/daily-summary", label: "Daily Market Wrap" },
      { href: "/sectors", label: "Sectors" },
      { href: "/sectors/momentum", label: "Sector Momentum" },
      { href: "/fii-dii", label: "FII/DII Activity" },
      { href: "/super-investor", label: "Super Investor" },
      { href: "/market/breadth", label: "Market Breadth" },
      { href: "/deals/bulk", label: "Bulk Deals" },
      { href: "/deals/block", label: "Block Deals" },
      { href: "/insider-trading", label: "Insider Trading" },
      { href: "/unlisted-shares", label: "Unlisted Shares" },
      { href: "/corporate-actions", label: "Corporate Actions" },
      { href: "/mutual-funds", label: "Mutual Funds" },
    ],
  },
  {
    title: "Tools & US",
    links: [
      { href: "/calculators/sip", label: "SIP Calculator" },
      { href: "/calculators/emi", label: "EMI Calculator" },
      { href: "/calculators/tax", label: "Income Tax" },
      { href: "/calculators/lrs-tcs", label: "LRS / TCS" },
      { href: "/calculators/usd-returns", label: "USD Returns" },
      { href: "/calculators", label: "All Calculators" },
      { href: "/us-ipo", label: "US IPO Tracker" },
      { href: "/us-listing", label: "Indian ADRs" },
      { href: "/mutual-funds/international", label: "Intl Funds" },
      { href: "/tools/concall-summary", label: "Concall AI" },
      { href: "/tools/promoter-check", label: "Promoter Check" },
      { href: "/compare/brokers", label: "Compare Brokers" },
      { href: "/compare/credit-cards", label: "Credit Cards" },
      { href: "/compare/insurance", label: "Insurance Plans" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About IPOpulse" },
      { href: "/contact", label: "Contact" },
      { href: "/signup", label: "Create account" },
      { href: "/signin", label: "Sign in" },
      { href: "/my/watchlist", label: "My Watchlist" },
      { href: "/my/applications", label: "My Applications" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/refund", label: "Refund Policy" },
    ],
  },
];

const talkyToolsFamily = [
  { href: "https://talkytools.com", label: "TalkyTools Suite" },
  { href: "https://optimo.talkytools.com", label: "Optimo (SEO)" },
  { href: "https://billforge.in", label: "BillForge (Invoicing)" },
  { href: "https://seizelead.talkytools.com", label: "SeizeLead (Lead capture)" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-700 hover:text-indigo-600"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            TalkyTools Family
          </h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {talkyToolsFamily.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} TalkyTools (IPOpulse). All rights reserved.</p>
          <p>
            Data sourced from BSE, NSE, SEBI, NSDL, AMFI. Not investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
