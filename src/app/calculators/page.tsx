import type { Metadata } from "next";
import Link from "next/link";
import { calculators } from "@/lib/calculators/configs";
import {
  LineChart,
  TrendingUp,
  PiggyBank,
  ArrowDownFromLine,
  Home,
  Landmark,
  Shield,
  Sunset,
  Receipt,
  Scale,
} from "lucide-react";

const iconMap = {
  LineChart,
  TrendingUp,
  PiggyBank,
  ArrowDownFromLine,
  Home,
  Landmark,
  Shield,
  Sunset,
  Receipt,
  Scale,
};

export const metadata: Metadata = {
  title: "Free Financial Calculators — SIP, EMI, Tax, FD, PPF & more",
  description:
    "20+ free calculators for SIP, EMI, Income Tax, Lumpsum, FD, PPF, retirement, brokerage and more. Fast, mobile-friendly, India-ready.",
};

const categoryLabels: Record<string, string> = {
  investment: "Investment",
  loan: "Loan",
  tax: "Tax",
  retirement: "Retirement",
  trading: "Trading",
  other: "Other",
};

export default function CalculatorsHubPage() {
  const byCategory = calculators.reduce<Record<string, typeof calculators>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Free Financial Calculators</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Fast, accurate, India-ready. No sign-up, no ads, no gimmicks. SIP, EMI, tax, retirement,
          brokerage — all the numbers you need to make confident money decisions.
        </p>
      </div>

      {Object.entries(byCategory).map(([cat, calcs]) => (
        <section key={cat} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {categoryLabels[cat] ?? cat}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {calcs.map((c) => {
              const Icon = iconMap[c.iconName as keyof typeof iconMap] ?? LineChart;
              return (
                <Link
                  key={c.slug}
                  href={`/calculators/${c.slug}`}
                  className="card hover:border-indigo-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{c.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
