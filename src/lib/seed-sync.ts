/**
 * Create-if-missing helpers for scripts/seed-ipos.ts.
 *
 * The seed used to `deleteMany` every anchor, subscription and GMP row of an IPO and re-create them, which wiped rows captured
 * live (the nse-ipo-subscription cron, the admin GMP page, the GMP tracker) and any admin edit. Now a seeded row is added only when
 * no row with its natural key exists; existing rows are never deleted or overwritten (hard-delete audit 2026-11-01).
 */
type Find<W> = { findFirst(a: { where: W }): Promise<unknown> };
type Create<D> = { create(a: { data: D }): Promise<unknown> };

export interface SeedAnchor { name: string; allocation: number | bigint; price: number; value: number }
export interface SeedSubscription { offsetDays: number; retail: number; hni: number; qib: number; total: number }
export interface SeedGmp { offsetDays: number; gmp: number; source?: string }

export interface SeedDb {
  ipoAnchor: Find<{ ipoId: number; investorName: string }> & Create<Record<string, unknown>>;
  ipoSubscription: Find<{ ipoId: number; capturedAt: { gte: Date; lt: Date } }> & Create<Record<string, unknown>>;
  ipoGmp: Find<{ ipoId: number; date: Date }> & Create<Record<string, unknown>>;
}

/** Returns how many rows were added (0 when everything already exists). */
export async function seedAnchors(db: SeedDb, ipoId: number, anchors: SeedAnchor[]): Promise<number> {
  let added = 0;
  for (const a of anchors) {
    if (await db.ipoAnchor.findFirst({ where: { ipoId, investorName: a.name } })) continue;
    await db.ipoAnchor.create({ data: { ipoId, investorName: a.name, allocation: BigInt(a.allocation), pricePerShare: a.price, value: a.value } });
    added++;
  }
  return added;
}

export async function seedSubscriptions(db: SeedDb, ipoId: number, openDate: Date, subs: SeedSubscription[]): Promise<number> {
  let added = 0;
  for (const s of subs) {
    const capturedAt = new Date(openDate.getTime() + s.offsetDays * 86400000);
    // 5:30 PM IST = 12:00 UTC, built from UTC fields only, so the row's timestamp is the same on any machine's timezone.
    // The table has no unique index, and older seed rows exist at other hours (17:30 UTC, made on a UTC machine), so "already seeded" means:
    // ANY row of this IPO on the same UTC day (create-only: nothing is updated or deleted).
    capturedAt.setUTCHours(12, 0, 0, 0);
    const dayStart = new Date(capturedAt); dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    if (await db.ipoSubscription.findFirst({ where: { ipoId, capturedAt: { gte: dayStart, lt: dayEnd } } })) continue;
    await db.ipoSubscription.create({ data: { ipoId, capturedAt, retailX: s.retail, hniX: s.hni, qibX: s.qib, totalX: s.total } });
    added++;
  }
  return added;
}

export async function seedGmp(db: SeedDb, ipoId: number, openDate: Date, rows: SeedGmp[]): Promise<number> {
  let added = 0;
  for (const g of rows) {
    const date = new Date(openDate.getTime() + g.offsetDays * 86400000);
    date.setHours(0, 0, 0, 0);
    if (await db.ipoGmp.findFirst({ where: { ipoId, date } })) continue;
    await db.ipoGmp.create({ data: { ipoId, date, gmp: g.gmp, source: g.source, enteredBy: "seed" } });
    added++;
  }
  return added;
}
