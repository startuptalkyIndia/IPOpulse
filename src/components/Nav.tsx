import Link from "next/link";
import { TrendingUp, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/ipo", label: "IPO" },
  { href: "/ticker", label: "Ticker" },
  { href: "/sectors", label: "Sectors" },
  { href: "/super-investor", label: "Super Investor" },
  { href: "/fii-dii", label: "FII/DII" },
  { href: "/calculators", label: "Calculators" },
  { href: "/compare", label: "Compare" },
];

export async function Nav() {
  const session = await auth();
  const authed = !!session?.user;

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
