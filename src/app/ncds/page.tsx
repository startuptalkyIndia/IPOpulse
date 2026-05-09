import type { Metadata } from "next";
import { NCDClient } from "./NCDClient";

export const metadata: Metadata = {
  title: "NCD Non-Convertible Debentures India 2026 — Rates, List, Best NCDs to Invest",
  description:
    "Complete list of listed NCDs in India with ratings, coupon rates, maturity dates, and issuer details. Muthoot, Bajaj Finance, Tata Capital, Shriram Finance and more. Compare NCD yields vs FD rates.",
  alternates: { canonical: "/ncds" },
};

export default function NCDPage() {
  return <NCDClient />;
}
