import type { Metadata } from "next";
import Link from "next/link";
import { Wallet, Home, Landmark, Briefcase, Car, ArrowRight, Shield, CreditCard, Scale } from "lucide-react";
import { financeCategories, productsForCategory } from "@/lib/finance-products";

export const metadata: Metadata = {
  title: "Compare Loans, Savings Accounts & Insurance India | IPOpulse Finance",
  description:
    "One place to compare every Indian financial product — personal loans, home loans, car loans, business loans, savings accounts, neobanks, credit cards, term insurance, health insurance.",
  alternates: { canonical: "/finance" },
};

const iconMap = { Wallet, Home, Landmark, Briefcase, Car };

const otherFinanceTiles = [
  { href: "/compare/credit-cards", icon: CreditCard, title: "Credit Cards", desc: "Top 6 Indian credit cards — rewards, fees, lounge access" },
  { href: "/compare/insurance", icon: Shield, title: "Term & Health Insurance", desc: "Top 6 each — premium, claim ratio, network" },
  { href: "/compare/brokers", icon: Scale, title: "Stock Brokers", desc: "Zerodha, Groww, Upstox, Angel One, Dhan, ICICI Direct" },
];

export default function FinanceHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">IPOpulse Finance — every financial product, compared</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Free, unbiased comparisons of every major Indian financial product. Apply directly via partner — no
          middleman. Curated to surface the cheapest rates, highest interest, best features.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Loans &amp; Banking</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {financeCategories.map((c) => {
            const Icon = (iconMap as Record<string, typeof Wallet>)[c.iconName] ?? Wallet;
            const productCount = productsForCategory(c.slug).length;
            return (
              <Link
                key={c.slug}
                href={`/finance/${c.slug}`}
                className="card hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{c.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">{productCount} options compared</span>
                      <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-800 inline-flex items-center gap-0.5">
                        Compare <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Other comparisons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {otherFinanceTiles.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href} className="card hover:border-indigo-300 hover:shadow-sm transition group">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{t.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.desc}</p>
                    <div className="mt-2 text-xs font-medium text-indigo-600 inline-flex items-center gap-0.5">
                      Compare <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <span className="font-semibold">How we&apos;re paid:</span> When you apply through these links, IPOpulse may
          earn a referral fee. This never costs you anything extra — and we never rank or recommend a product based
          on payout alone. Read our <Link className="underline" href="/terms">terms</Link>.
        </p>
      </div>
    </div>
  );
}
