import type { MetadataRoute } from "next";

const BASE = "https://ipopulse.talkytools.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/sup-min",      // admin login + dashboard
          "/sup-min/",
          "/api/",         // internal APIs
          "/my/",          // private user pages
          "/embed/gmp",    // iframe target — index docs page only
          "/r/",           // affiliate redirects
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
