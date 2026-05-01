import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.bseindia.com" },
      { protocol: "https", hostname: "**.nseindia.com" },
      { protocol: "https", hostname: "**.sebi.gov.in" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Force HTTPS for 2 years, eligible for HSTS preload list
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Prevent clickjacking — same-origin iframes (we use them on /embed) still allowed
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer privacy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable risky browser APIs we never use
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Content Security Policy
          // unsafe-inline is required for Next.js inline scripts (theme, JSON-LD, GA4).
          // Tighten with nonces if CSP strictness is upgraded in the future.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: own origin + GA4 + unsafe-inline (Next.js requires for inline scripts)
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              // Styles: own origin + unsafe-inline (Tailwind/inline styles)
              "style-src 'self' 'unsafe-inline'",
              // Images: own origin + BSE/NSE/SEBI image CDNs + data URIs
              "img-src 'self' data: https://*.bseindia.com https://*.nseindia.com https://*.sebi.gov.in https://www.google-analytics.com",
              // Fonts: own origin only (no external font CDN)
              "font-src 'self'",
              // Connects: own origin + GA4 + NSE/BSE APIs (for client-side data fetches)
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.bseindia.com https://*.nseindia.com",
              // Frames: same-origin only (embed pages)
              "frame-src 'self'",
              // Objects: none
              "object-src 'none'",
              // Base URI: own origin only
              "base-uri 'self'",
              // Form actions: own origin only
              "form-action 'self'",
              // Upgrade insecure requests in production
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
