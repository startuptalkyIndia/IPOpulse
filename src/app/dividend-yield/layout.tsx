import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Best Dividend Stocks India 2026 — NSE/BSE High Dividend Yield Companies List",
  description:
    "Curated screener of highest dividend yield stocks in India 2026 — Coal India, ONGC, HCL Tech, ITC, Power Grid and more. Filter by PSU, Private, MNC. Updated with approximate yields and payout ratios.",
  alternates: { canonical: "/dividend-yield" },
};

export default function DividendYieldLayout({ children }: { children: ReactNode }) {
  return children;
}
