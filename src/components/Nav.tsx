import Link from "next/link";
import { TrendingUp } from "lucide-react";

const links = [
  { href: "/ipo", label: "IPO" },
  { href: "/ticker", label: "Ticker" },
  { href: "/sectors", label: "Sectors" },
  { href: "/super-investor", label: "Super Investor" },
  { href: "/fii-dii", label: "FII/DII" },
  { href: "/calculators", label: "Calculators" },
  { href: "/compare", label: "Compare" },
];

export function Nav() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 text-lg">
            IPO<span className="text-indigo-600">pulse</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/ipo/live"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-600 px-2.5 py-1 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live IPOs
          </Link>
        </div>
      </div>
    </header>
  );
}
