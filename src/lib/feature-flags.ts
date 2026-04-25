import { prisma } from "./db";

/**
 * Feature flags — simple DB-backed on/off toggles managed by admin.
 * Cached in-process for 60 seconds so we don't hammer the DB on every page load.
 *
 * Default-on: most features ship enabled. Admin can disable any in /sup-min/feature-flags.
 */

export const FLAG_DEFINITIONS: Array<{
  key: string;
  label: string;
  description: string;
  category: "community" | "revenue" | "seo" | "ai" | "data" | "ux";
  defaultEnabled: boolean;
}> = [
  // Community
  { key: "community.discussion", label: "Discussion threads on IPO & stock pages", description: "Show comment threads at the bottom of every IPO and stock detail page.", category: "community", defaultEnabled: true },
  { key: "community.poll", label: "Apply / Avoid / Watching poll on IPO pages", description: "Three-way community sentiment poll on IPO detail pages.", category: "community", defaultEnabled: true },

  // Revenue / affiliates
  { key: "revenue.affiliate_ctas", label: "Affiliate CTAs (Apply broker, Apply card, etc.)", description: "Show all 'Apply via [partner]' buttons across the site (IPO pages, /finance, /compare).", category: "revenue", defaultEnabled: true },
  { key: "revenue.mobile_sticky_cta", label: "Mobile sticky bottom CTA", description: "Sticky 'Apply via Angel One →' bar on live IPO pages on mobile.", category: "revenue", defaultEnabled: true },
  { key: "revenue.newsletter_signup", label: "Newsletter signup widget", description: "Newsletter capture forms on homepage and footer.", category: "revenue", defaultEnabled: true },
  { key: "revenue.market_ticker", label: "Live market news ticker (top of every page)", description: "Right-to-left scrolling ticker with FII/DII, IPO updates, recent listings.", category: "revenue", defaultEnabled: true },

  // AI
  { key: "ai.drhp_search", label: "DRHP AI Q&A page", description: "Show /ipo/drhp page with Claude-powered prospectus search. Requires ANTHROPIC_API_KEY.", category: "ai", defaultEnabled: true },

  // SEO / data
  { key: "seo.email_digest", label: "Email digest (admin preview + send)", description: "Render and send daily email digest. Requires RESEND_API_KEY.", category: "data", defaultEnabled: false },
  { key: "data.bse_scraper", label: "BSE IPO scraper (cron + manual trigger)", description: "Auto-pull IPO data from bseindia.com every 4h.", category: "data", defaultEnabled: true },
  { key: "data.amfi_scraper", label: "AMFI MF NAV scraper (daily 23:00 IST)", description: "Pull all MF schemes' NAV nightly.", category: "data", defaultEnabled: true },
  { key: "data.nse_fii_dii", label: "NSE FII/DII scraper (weekdays 19:15 IST)", description: "Pull provisional FII/DII numbers from NSE.", category: "data", defaultEnabled: true },

  // UX
  { key: "ux.dark_mode", label: "Dark mode toggle in nav", description: "Show the moon/sun icon in the top nav.", category: "ux", defaultEnabled: true },
  { key: "ux.search_palette", label: "⌘K global search", description: "Cmd/Ctrl-K opens a global search palette across IPOs, stocks, calculators.", category: "ux", defaultEnabled: true },
];

let cache: { fetchedAt: number; flags: Map<string, boolean> } | null = null;
const CACHE_MS = 60_000;

async function loadFlags(): Promise<Map<string, boolean>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) return cache.flags;
  try {
    const rows = await prisma.featureFlag.findMany({ select: { key: true, enabled: true } });
    const m = new Map<string, boolean>();
    for (const r of rows) m.set(r.key, r.enabled);
    cache = { fetchedAt: Date.now(), flags: m };
    return m;
  } catch {
    // DB unreachable / table missing — fall back to defaults
    return new Map();
  }
}

/**
 * Server-side check. Returns true/false; falls back to definition default
 * if the flag is missing in DB.
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flags = await loadFlags();
  if (flags.has(key)) return flags.get(key) === true;
  const def = FLAG_DEFINITIONS.find((d) => d.key === key);
  return def?.defaultEnabled ?? true;
}

/**
 * Bulk loader for several flags in one DB hit.
 */
export async function loadFeatureMap(keys: string[]): Promise<Record<string, boolean>> {
  const flags = await loadFlags();
  const result: Record<string, boolean> = {};
  for (const k of keys) {
    if (flags.has(k)) {
      result[k] = flags.get(k) === true;
    } else {
      const def = FLAG_DEFINITIONS.find((d) => d.key === k);
      result[k] = def?.defaultEnabled ?? true;
    }
  }
  return result;
}

export function clearFeatureFlagCache() {
  cache = null;
}

/**
 * Idempotent seeding — call from admin or migration to ensure all
 * defined flags exist in DB.
 */
export async function seedFlagDefinitions() {
  for (const d of FLAG_DEFINITIONS) {
    await prisma.featureFlag.upsert({
      where: { key: d.key },
      update: { label: d.label, description: d.description, category: d.category },
      create: {
        key: d.key,
        label: d.label,
        description: d.description,
        category: d.category,
        enabled: d.defaultEnabled,
      },
    });
  }
}
