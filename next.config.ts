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
        ],
      },
    ];
  },
};

export default nextConfig;
