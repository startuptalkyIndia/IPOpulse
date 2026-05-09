"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, TrendingUp, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "IPO",
    links: [
      { href: "/ipo", label: "All IPOs" },
      { href: "/ipo/live", label: "Live IPOs" },
      { href: "/ipo/upcoming", label: "Upcoming" },
      { href: "/ipo/listed", label: "Listed" },
      { href: "/ipo/sme", label: "SME IPOs" },
      { href: "/ipo/gmp-accuracy", label: "GMP Accuracy" },
      { href: "/ipo/allotment", label: "Allotment Check" },
      { href: "/ipo/drhp", label: "DRHP AI Search" },
    ],
  },
  {
    title: "Markets",
    links: [
      { href: "/ticker", label: "Stock Ticker" },
      { href: "/screener", label: "Screener" },
      { href: "/movers", label: "Gainers / Losers" },
      { href: "/daily-summary", label: "Daily Market Wrap" },
      { href: "/research", label: "Research Hub" },
      { href: "/research/next-day", label: "Tomorrow's Watch List" },
      { href: "/sectors", label: "Sectors" },
      { href: "/indices", label: "Nifty Indices" },
      { href: "/fii-dii", label: "FII / DII" },
      { href: "/market/breadth", label: "Market Breadth" },
      { href: "/super-investor", label: "Super Investor" },
      { href: "/deals/bulk", label: "Bulk Deals" },
      { href: "/deals/block", label: "Block Deals" },
      { href: "/insider-trading", label: "Insider Trading" },
      { href: "/corporate-actions", label: "Corporate Actions" },
      { href: "/unlisted-shares", label: "Unlisted Shares" },
    ],
  },
  {
    title: "US & Tools",
    links: [
      { href: "/us-ipo", label: "US IPO Tracker" },
      { href: "/us-listing", label: "Indian ADRs" },
      { href: "/calculators", label: "All Calculators" },
      { href: "/calculators/sip", label: "SIP Calculator" },
      { href: "/calculators/lrs-tcs", label: "LRS / TCS" },
      { href: "/tools/concall-summary", label: "Concall AI" },
      { href: "/tools/promoter-check", label: "Promoter Check" },
      { href: "/compare/brokers", label: "Compare Brokers" },
      { href: "/compare/credit-cards", label: "Credit Cards" },
      { href: "/compare/insurance", label: "Insurance Plans" },
    ],
  },
];

export function MobileNav({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-200 ease-in-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-gray-900">
              IPO<span className="text-indigo-600">pulse</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto h-[calc(100%-56px-56px)]">
          {sections.map((section) => (
            <div key={section.title} className="border-b border-gray-100">
              <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                {section.title}
              </div>
              <nav className="py-1">
                {section.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      pathname === l.href
                        ? "text-indigo-700 bg-indigo-50 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {l.label}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Auth footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 flex gap-2">
          {authed ? (
            <Link
              href="/my/watchlist"
              className="flex-1 text-center text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg"
            >
              My Watchlist
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="flex-1 text-center text-sm text-gray-700 border border-gray-200 px-3 py-2 rounded-lg"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center text-sm font-medium bg-indigo-600 text-white px-3 py-2 rounded-lg"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
