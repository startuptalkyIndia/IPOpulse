import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MarketTicker } from "@/components/MarketTicker";
import { Suspense } from "react";

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
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
      : undefined,
  },
};

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevents dark-mode flash: apply theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const t=localStorage.getItem('ipopulse-theme');const d=window.matchMedia('(prefers-color-scheme: dark)').matches;const x=t==='dark'?'dark':t==='light'?'light':d?'dark':'light';document.documentElement.dataset.theme=x}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://ipopulse.talkytools.com/#organization",
                  name: "IPOpulse",
                  url: "https://ipopulse.talkytools.com",
                  logo: "https://ipopulse.talkytools.com/icon",
                  description: "India's structured IPO, stock and market data hub.",
                  areaServed: { "@type": "Country", name: "India" },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://ipopulse.talkytools.com/#website",
                  url: "https://ipopulse.talkytools.com",
                  name: "IPOpulse",
                  publisher: { "@id": "https://ipopulse.talkytools.com/#organization" },
                  inLanguage: "en-IN",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: { "@type": "EntryPoint", urlTemplate: "https://ipopulse.talkytools.com/api/search?q={search_term_string}" },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      {GA4_ID ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}',{anonymize_ip:true});`,
            }}
          />
        </>
      ) : null}
      <body className="min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <MarketTicker />
        </Suspense>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
