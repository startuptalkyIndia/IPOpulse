import type { MetadataRoute } from "next";

const BASE = "https://ipopulse.talkytools.com";

// Platform-wide SEO policy (founder-confirmed 2026-08-30): talkytools.com is a
// pure portfolio brand — every *.talkytools.com subdomain, including ones that
// are a product's only live domain, is deindexed from Google/Bing. Blanket
// disallow, no sitemap advertised.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
    host: BASE,
  };
}
