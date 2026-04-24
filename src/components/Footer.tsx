import Link from "next/link";

const columns = [
  {
    title: "IPO",
    links: [
      { href: "/ipo/upcoming", label: "Upcoming" },
      { href: "/ipo/live", label: "Live" },
      { href: "/ipo/closed", label: "Closed" },
      { href: "/ipo/listed", label: "Listed" },
      { href: "/ipo/sme", label: "SME IPOs" },
      { href: "/ipo/calendar", label: "IPO Calendar" },
    ],
  },
  {
    title: "Markets",
    links: [
      { href: "/ticker", label: "Stock Ticker" },
      { href: "/sectors", label: "Sectors" },
      { href: "/fii-dii", label: "FII/DII Activity" },
      { href: "/super-investor", label: "Super Investor" },
      { href: "/corporate-actions", label: "Corporate Actions" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/calculators/sip", label: "SIP Calculator" },
      { href: "/calculators/emi", label: "EMI Calculator" },
      { href: "/calculators/tax", label: "Income Tax Calculator" },
      { href: "/calculators/lumpsum", label: "Lumpsum Calculator" },
      { href: "/compare/brokers", label: "Compare Brokers" },
      { href: "/compare/credit-cards", label: "Compare Cards" },
      { href: "/calculators", label: "All Calculators" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
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
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} IPOpulse. All rights reserved.</p>
          <p>
            Data sourced from BSE, NSE, SEBI, NSDL. Not investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
