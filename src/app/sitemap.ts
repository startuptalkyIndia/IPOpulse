import type { MetadataRoute } from "next";
import { calculators } from "@/lib/calculators/configs";
import { superInvestors } from "@/lib/super-investors";
import { prisma } from "@/lib/db";

const BASE = "https://ipopulse.talkytools.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE}/ipo`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/ipo/live`, lastModified: now, priority: 0.9, changeFrequency: "hourly" },
    { url: `${BASE}/ipo/upcoming`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/ipo/closed`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/ipo/listed`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/ipo/sme`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/ipo/calendar`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/calculators`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/fii-dii`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/super-investor`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/corporate-actions`, lastModified: now, priority: 0.6, changeFrequency: "daily" },
  ];

  const calcPages: MetadataRoute.Sitemap = calculators.map((c) => ({
    url: `${BASE}/calculators/${c.slug}`,
    lastModified: now,
    priority: 0.8,
    changeFrequency: "monthly",
  }));

  const investorPages: MetadataRoute.Sitemap = superInvestors.map((s) => ({
    url: `${BASE}/super-investor/${s.slug}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  let ipoPages: MetadataRoute.Sitemap = [];
  try {
    const ipos = await prisma.ipo.findMany({ select: { slug: true, updatedAt: true } });
    ipoPages = ipos.map((i) => ({
      url: `${BASE}/ipo/${i.slug}`,
      lastModified: i.updatedAt,
      priority: 0.7,
      changeFrequency: "daily",
    }));
  } catch {
    // fine at build time when DB may be unreachable
  }

  return [...staticPages, ...calcPages, ...investorPages, ...ipoPages];
}
