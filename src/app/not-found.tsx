import Link from "next/link";
import { Home, Search, TrendingUp, Calculator, Users } from "lucide-react";

const popular = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/ipo", icon: TrendingUp, label: "IPO Dashboard" },
  { href: "/calculators", icon: Calculator, label: "Calculators" },
  { href: "/super-investor", icon: Users, label: "Super Investors" },
];

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl font-extrabold text-indigo-600 mb-2">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm text-gray-600 max-w-md mx-auto mb-8">
        Looks like that page either moved, was removed, or never existed. Try one of the popular destinations below,
        or use search (Cmd / Ctrl + K) to find what you're looking for.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {popular.map((p) => {
          const Icon = p.icon;
          return (
            <Link key={p.href} href={p.href} className="card hover:border-indigo-300 transition flex flex-col items-center gap-2 py-4">
              <Icon className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-900">{p.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-8 inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
        <Search className="w-3 h-3" />
        Press <kbd className="font-mono bg-white border border-gray-200 rounded px-1">⌘ K</kbd> to search
      </div>
    </div>
  );
}
