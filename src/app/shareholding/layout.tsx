import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promoter FII DII Shareholding Pattern India 2026 — Quarterly Changes Nifty 50 | IPOpulse",
  description:
    "Track promoter, FII, and DII shareholding changes quarter-on-quarter for Nifty 50 companies. See pledged shares, FII buying, promoter selling signals.",
  alternates: { canonical: "/shareholding" },
};

export default function ShareholdingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
