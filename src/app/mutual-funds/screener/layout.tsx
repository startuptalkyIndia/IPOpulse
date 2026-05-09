import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Mutual Funds India 2026 — Top SIP Funds Ranked by 1Y 3Y 5Y Returns | IPOpulse",
  description:
    "Screen 20 top Indian mutual funds by category, risk level, and returns. Compare Large Cap, Mid Cap, Small Cap, ELSS, Index, Hybrid funds. Filter by 1Y, 3Y, 5Y returns.",
  alternates: { canonical: "/mutual-funds/screener" },
};

export default function MFScreenerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
