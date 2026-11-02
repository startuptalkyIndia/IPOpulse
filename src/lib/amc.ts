// AMC list for /mutual-funds/amc/[slug]: one groupBy cached 1 hour in memory instead of a
// scan of every fund on each view (lists standard, LS-09). A slug that is not in the cache
// re-reads the list at most once a minute, so a newly added AMC appears fast and a flood of
// bad slugs still costs at most one query a minute.
export const amcSlug = (amc: string) => amc.toLowerCase().replace(/\s+/g, "-");

export const AMC_TTL_MS = 60 * 60 * 1000;
export const AMC_MISS_REFRESH_MS = 60 * 1000;
export const AMC_PAGE_SIZE = 200;

export function createAmcResolver(fetchNames: () => Promise<string[]>, now: () => number = Date.now) {
  let names: string[] = [];
  let loadedAt = 0;
  async function load() {
    names = await fetchNames();
    loadedAt = now();
  }
  return async function resolveAmc(slug: string): Promise<string | null> {
    const age = now() - loadedAt;
    if (loadedAt === 0 || age > AMC_TTL_MS) await load();
    let hit = names.find((n) => amcSlug(n) === slug);
    if (!hit && now() - loadedAt > AMC_MISS_REFRESH_MS) {
      await load();
      hit = names.find((n) => amcSlug(n) === slug);
    }
    return hit ?? null;
  };
}

/** page from the URL: fallback 1, clamp 1..1000; repeated values use the first. */
export function parsePage(v: string | string[] | undefined): number {
  const s = Array.isArray(v) ? v[0] : v;
  return Math.min(Math.max(parseInt(s ?? "", 10) || 1, 1), 1000);
}

/** Page number as the page body uses it: parsed safely, then limited to the last page. */
export function resolvePage(raw: string | string[] | undefined, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / AMC_PAGE_SIZE));
  return { totalPages, page: Math.min(parsePage(raw), totalPages) };
}

/** Page 1 keeps the plain URL; later pages canonical to themselves (never noindex). */
export function amcCanonical(slug: string, page: number): string {
  return page > 1 ? `/mutual-funds/amc/${slug}?page=${page}` : `/mutual-funds/amc/${slug}`;
}

export function amcMetadata(amc: string, slug: string, page: number) {
  const suffix = page > 1 ? ` - page ${page}` : "";
  return {
    title: { absolute: `${amc} — All Mutual Fund Schemes & NAV${suffix} | IPOpulse` },
    description: `Every mutual fund scheme by ${amc} with latest daily NAV from AMFI${suffix}. Browse equity, debt, hybrid and other categories.`,
    alternates: { canonical: amcCanonical(slug, page) },
  };
}

/** Stable order: equal names never swap between pages. */
export const AMC_FUND_ORDER = [
  { category: "asc" as const },
  { schemeName: "asc" as const },
  { slug: "asc" as const },
];
