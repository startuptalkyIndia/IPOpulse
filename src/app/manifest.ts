import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IPOpulse — India's IPO, Stock & Market Data Hub",
    short_name: "IPOpulse",
    description: "Live IPO GMP, allotment, 20+ calculators, FII/DII, super investor portfolios.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png" },
    ],
    categories: ["finance", "productivity", "business"],
  };
}
