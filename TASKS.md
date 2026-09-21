# TASKS — IPOpulse

> **The live to-do list for this project. ONE source of truth for "what's left."**
> Rules (every agent + both accounts):
> 1. Before building → add the task under **To Do** (top = highest priority, work top-down).
> 2. While building → leave it in To Do (optionally mark `🔨 in progress`).
> 3. When done → **move it to Done and STRIKE IT THROUGH**: `- [x] ~~the task~~ — ✅ YYYY-MM-DD (commit/proof)`.
> 4. Keep it current: this file + `COMMS.md` are what the other account reads to know project state.
>
> _Last updated: 2026-09-22_

---

## 🔲 To Do  (priority order — top = next)

- [ ] Founder approval needed (data change): remap `ZOMATO`→`ETERNAL`, `TATAMOTORS`→`TMPV`, mark `VISASTEEL` inactive — Yahoo no longer serves the old symbols; fundamentals frozen since 2026-05-09 until applied.
- [ ] `super_investor` cron needs a new data source — BSE blocks this server's IP (verified); `screener.in`/`moneycontrol.com` both reachable but not yet confirmed to expose named individual holders. Scope before building.
- [ ] 111 lint findings surfaced now that the lint gate works again (74 errors, 37 warnings) — mostly cosmetic, but 13 `react-hooks/set-state-in-effect` touch live components.
- [ ] Apply `connection_limit=5&pool_timeout=10` to the real server `.env` `DATABASE_URL` (documented in `.env.example` since `e8fc259`, 2026-08-28, but not yet applied where it counts).
- [ ] Re-plan growth/marketing strategy now that the site is deindexed (see Done entry below) — the CLAUDE.md "Goal" section's SEO-led traffic projections no longer apply while this policy stands.

## 🔨 In Progress

- _nothing in flight_

## ✅ Done  (strike through, newest at top)

- [x] ~~Learn articles + legal pages had no heading/list CSS (headings looked like body text, no bullets)~~ — ✅ 2026-09-22 (root cause: `@tailwindcss/typography` was never installed despite `prose`/`prose-*` classes used throughout `/learn/[slug]` + Terms/Privacy/Refund; installed + registered via `@plugin` in `globals.css`. Verified locally: built CSS now generates real `.prose h2`/`.prose ul` rules. Reported by founder on `/learn/what-are-futures-options`.)
- [x] ~~Deindex ipopulse.talkytools.com (robots.txt + noindex meta)~~ — ✅ 2026-08-30, actually reaching prod 2026-09-05 (commits `4cc67ae` then `a519379` — a leftover static `public/robots.txt` was shadowing the fix for 6 days; caught by checking the live `robots.txt` response, not the deploy log. Founder policy: all `*.talkytools.com` subdomains deindexed regardless of live/paying status. Verified live 2026-09-22.)
- [x] ~~Reload once on stale Server Action ID instead of dead-ending~~ — ✅ 2026-09-04 (commit `75f6117`, deployed)
- [x] ~~Document required `connection_limit=5&pool_timeout=10` on `DATABASE_URL`~~ — ✅ 2026-08-28 (commit `e8fc259`, docs + `.env.example` only — real server `.env` still needs it, tracked above)
- [x] ~~GMP tracker: multi-source failover so a single site outage doesn't stall GMP updates~~ — ✅ 2026-08-19 (root cause: `gmp_tracker` had one hardcoded source, `ipowatch.in`, which returned HTTP 522 for a full day with no fallback. Fix: ordered source list in `src/lib/scrapers/gmp-sources.ts` — `ipowatch.in` then new `ipoji.com` — tries each until rows come back; also fixed a sign-inversion bug on negative GMP values. Commit `b0bb7b8`. **DEPLOYED + verified live 2026-08-19** — real failover exercised in production while ipowatch was still down: `{"ok":true,"rowsIn":12,"notes":"source=ipoji"}`. Rollback SHA `9da0432`.)
- [x] ~~Fix 3 red cron jobs (yahoo_fundamentals, super_investor) + dead lint gate + permanently-degraded health check~~ — ✅ 2026-08-19 (commit `c1a5d66`, **DEPLOYED + verified live**. `super_investor` stays blocked by design — BSE blocks this server's IP, needs a new data source, not a retry — tracked as a separate open item below.)
- [x] ~~Fix Postgres numeric overflow on `opm` (operating profit margin) ingest~~ — ✅ 2026-08-19 (widened `Decimal(6,2)`→`Decimal(10,2)` on AnnualFinancial + QuarterlyFinancial, matching roe/roce. Commit `4acae8c`, additive schema change, **DEPLOYED**.)
- [x] ~~Project scaffolded with TASKS.md~~ — ✅ 2026-06-22
