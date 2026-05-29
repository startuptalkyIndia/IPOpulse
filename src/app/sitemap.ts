import type { MetadataRoute } from "next";
import { calculators } from "@/lib/calculators/configs";
import { superInvestors } from "@/lib/super-investors";
import { sectors } from "@/lib/sectors";
import { unlistedShares } from "@/lib/unlisted-shares";
import { articles } from "@/lib/learn-articles";
import { bestStocksCategories } from "@/lib/best-stocks-categories";
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
    { url: `${BASE}/compare/insurance`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/ipo/allotment`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/ipo/gmp-accuracy`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/ipo/drhp`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/earnings-calendar`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/dividend-yield`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/unlisted-shares`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/mutual-funds`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/mutual-funds/international`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/us-ipo`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/us-listing`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/tools/concall-summary`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/tools/promoter-check`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/daily-summary`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/sectors/momentum`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/deals/bulk`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/deals/block`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/insider-trading`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/market/breadth`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/calculators/lrs-tcs`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/calculators/usd-returns`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/movers`, lastModified: now, priority: 0.8, changeFrequency: "hourly" },
    { url: `${BASE}/ipo/this-week`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/sectors/fpi-flows`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/registrar/kfintech`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/registrar/linkintime`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/registrar/bigshare`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/registrar/cameo`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/registrar/integrated`, lastModified: now, priority: 0.6, changeFrequency: "weekly" },
    { url: `${BASE}/registrar/maashitla`, lastModified: now, priority: 0.6, changeFrequency: "weekly" },
    { url: `${BASE}/indices`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/screener`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/daily-summary`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/research`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/research/next-day`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/ipo/sme-risk`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/ipo/performance`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/ipo/merchant-bankers`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/ipo/by-sector`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/ipo/anchor-lock-in`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/ipo/compare`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/ipo/allotment-probability`, lastModified: now, priority: 0.7, changeFrequency: "daily" },
    { url: `${BASE}/registrar/skyline`, lastModified: now, priority: 0.6, changeFrequency: "weekly" },
    { url: `${BASE}/ipo/year/2024`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/ipo/year/2025`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/ipo/year/2026`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/learn`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/glossary`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/market/holidays`, lastModified: now, priority: 0.9, changeFrequency: "yearly" },
    { url: `${BASE}/market/fo-expiry`, lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/market/economic-calendar`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/calculators/capital-gains`, lastModified: now, priority: 0.8, changeFrequency: "yearly" },
    { url: `${BASE}/ipo/process`, lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/ipo/stats`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/reits`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/sgb`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/ncds`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/about`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/contact`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/privacy`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/terms`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/signin`, lastModified: now, priority: 0.4, changeFrequency: "yearly" },
    { url: `${BASE}/signup`, lastModified: now, priority: 0.5, changeFrequency: "yearly" },
    { url: `${BASE}/compare/stocks`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/mutual-funds/screener`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/corporate-actions/rights-bonus`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/shareholding`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/screener/promoter`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/news`, lastModified: now, priority: 0.9, changeFrequency: "hourly" },
    { url: `${BASE}/news/twitter`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/calculators/stock-forecast`, lastModified: now, priority: 0.8, changeFrequency: "yearly" },
    { url: `${BASE}/dividend-yield`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/best-stocks`, lastModified: now, priority: 0.9, changeFrequency: "weekly" },
  ];

  const bestStocksPages: MetadataRoute.Sitemap = bestStocksCategories.map((c) => ({
    url: `${BASE}/best-stocks/${c.slug}`,
    lastModified: now,
    priority: 0.8,
    changeFrequency: "daily" as const,
  }));

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

  const learnPages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/learn/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  return [...staticPages, ...calcPages, ...investorPages, ...sectorPages, ...ipoPages, ...tickerPages, ...unlistedPages, ...learnPages, ...bestStocksPages];
}
