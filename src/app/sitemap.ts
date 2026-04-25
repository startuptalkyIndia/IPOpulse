import type { MetadataRoute } from "next";
import { calculators } from "@/lib/calculators/configs";
import { superInvestors } from "@/lib/super-investors";
import { sectors } from "@/lib/sectors";
import { unlistedShares } from "@/lib/unlisted-shares";
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
    { url: `${BASE}/ticker`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/sectors`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/compare`, lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/compare/brokers`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/compare/credit-cards`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/ipo/allotment`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/ipo/gmp-accuracy`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/ipo/drhp`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/earnings-calendar`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/dividend-yield`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/unlisted-shares`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/mutual-funds`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/movers`, lastModified: now, priority: 0.8, changeFrequency: "hourly" },
    { url: `${BASE}/about`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/contact`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/privacy`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/terms`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/signin`, lastModified: now, priority: 0.4, changeFrequency: "yearly" },
    { url: `${BASE}/signup`, lastModified: now, priority: 0.5, changeFrequency: "yearly" },
  ];

  const unlistedPages: MetadataRoute.Sitemap = unlistedShares.map((u) => ({
    url: `${BASE}/unlisted-shares/${u.slug}`,
    lastModified: now,
    priority: 0.5,
    changeFrequency: "weekly",
  }));

  const sectorPages: MetadataRoute.Sitemap = sectors.map((s) => ({
    url: `${BASE}/sectors/${s.slug}`,
    lastModified: now,
    priority: 0.6,
    changeFrequency: "weekly",
  }));

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
  let tickerPages: MetadataRoute.Sitemap = [];
  try {
    const ipos = await prisma.ipo.findMany({ select: { slug: true, updatedAt: true } });
    ipoPages = ipos.map((i) => ({
      url: `${BASE}/ipo/${i.slug}`,
      lastModified: i.updatedAt,
      priority: 0.7,
      changeFrequency: "daily",
    }));
    const companies = await prisma.company.findMany({ select: { slug: true, updatedAt: true }, where: { active: true } });
    tickerPages = companies.map((c) => ({
      url: `${BASE}/ticker/${c.slug}`,
      lastModified: c.updatedAt,
      priority: 0.6,
      changeFrequency: "daily",
    }));
  } catch {
    // fine at build time when DB may be unreachable
  }

  return [...staticPages, ...calcPages, ...investorPages, ...sectorPages, ...ipoPages, ...tickerPages, ...unlistedPages];
}
