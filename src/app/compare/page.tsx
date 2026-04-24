import type { Metadata } from "next";
import Link from "next/link";
import { Scale, CreditCard as CC, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare Brokers & Credit Cards — IPOpulse",
  description: "Side-by-side comparison of Indian stock brokers and credit cards. Features, fees, best-fit use cases.",
};

const items = [
  { href: "/compare/brokers", icon: Scale, title: "Compare Brokers", desc: "Zerodha vs Groww vs Upstox vs Angel One vs Dhan — fees, platforms, API access" },
  { href: "/compare/credit-cards", icon: CC, title: "Compare Credit Cards", desc: "Top 6 Indian credit cards — annual fee, rewards, lounge access, best-fit use case" },
];

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Compare</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Side-by-side comparisons of Indian brokers and credit cards — not just specs, but honest "best for"
          guidance per product.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => {
          const Icon = i.icon;
          return (
            <Link key={i.href} href={i.href} className="card hover:border-indigo-300 hover:shadow-sm transition group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{i.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">{i.desc}</p>
                  <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-indigo-600 group-hover:text-indigo-800">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
