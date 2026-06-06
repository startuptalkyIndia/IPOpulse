import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Price Forecast Calculator — PE-based target price tool",
  description:
    "Estimate a stock's fair value using earnings growth + PE expansion. Input current price, EPS, growth rate and see 1-5 year price targets.",
  alternates: { canonical: "/calculators/stock-forecast" },
  openGraph: {
    title: "Stock Price Forecast Calculator — IPOpulse",
    description:
      "Estimate fair value using earnings growth + PE expansion. Free tool for Indian stocks.",
    url: "https://ipopulse.talkytools.com/calculators/stock-forecast",
    siteName: "IPOpulse",
    locale: "en_IN",
    type: "website",
  },
};

export default function StockForecastLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
