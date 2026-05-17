import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "High Promoter Stake Stocks India — Promoter Holding >45% NSE BSE",
  description:
    "Screen Indian stocks with high promoter stake (>45%, >60%, >70%). MNCs, Tata Group, founder-led companies with high ownership alignment. Dec 2025 BSE/NSE quarterly filings.",
  alternates: { canonical: "/screener/promoter" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
