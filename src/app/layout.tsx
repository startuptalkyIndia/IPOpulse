import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "IPOpulse — India's IPO, Stock & Market Data Hub",
    template: "%s · IPOpulse",
  },
  description:
    "Live IPO GMP, subscription status, allotment tracker, stock research, FII/DII flows, financial calculators — all in one clean, structured dashboard.",
  metadataBase: new URL("https://ipopulse.talkytools.com"),
  openGraph: {
    title: "IPOpulse — India's IPO, Stock & Market Data Hub",
    description:
      "Live IPO GMP, subscription, allotment, stock research, FII/DII flows, 20+ calculators.",
    url: "https://ipopulse.talkytools.com",
    siteName: "IPOpulse",
    locale: "en_IN",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
