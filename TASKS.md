# TASKS — IPOpulse

> **The live to-do list for this project. ONE source of truth for "what's left."**
> Rules (every agent + both accounts):
> 1. Before building → add the task under **To Do** (top = highest priority, work top-down).
> 2. While building → leave it in To Do (optionally mark `🔨 in progress`).
> 3. When done → **move it to Done and STRIKE IT THROUGH**: `- [x] ~~the task~~ — ✅ YYYY-MM-DD (commit/proof)`.
> 4. Keep it current: this file + `COMMS.md` are what the other account reads to know project state.
>
> _Last updated: 2026-09-24_

---

## 🔲 To Do  (priority order — top = next)

- [ ] Audit `bse_bhavcopy` and `nse_indices` scrapers for the same class of bug (trusting a requested date instead of validating the source's own embedded date) — not checked in the 2026-09-24 pass; BSE's source was confirmed unaffected by *this specific* duplication pattern but that doesn't rule out a different bug in its own scraper.
- [ ] Broader historical audit for other pre-existing SME→mainboard IPO misclassifications beyond the 3 caught by the 2026-09-24 live complaint (Green Asia Impex, Pooja Logistics, Coreintegra Consulting Services) — those were fixed because a user happened to check the SME tab for them specifically; there could be older, currently-invisible cases.
- [ ] Monitor the insider-trading backlog catch-up (`~2,700 filings`, 50/run cap) over the next several days — `crawler_health` and `ingestion_runs.notes` report remaining backlog count each run.
- [ ] Known limitation: a revised NSE filing (`prevAppId`) is treated as independent, not a correction to the original — could produce duplicate/stale rows in rare cases. Not fixed this pass.
- [ ] Build an admin UI to add future RBI repo rate rows (currently: re-run `scripts/seed-rbi-repo-rate.ts` with new rows appended after each MPC meeting, ~6x/year — acceptable stopgap given the low frequency).
- [ ] Consider more Finology-parity calculators (DCF/intrinsic value, GST, Gratuity Exemption, Compound Interest, Investment-% Planner, Children Education Planner, Stock-vs-FD, Education Loan EMI) — deprioritized vs. peer-compare/repo-rate since the site is currently `noindex`'d and these are mostly SEO-search-term plays, not standalone utility features. Revisit if/when the deindex policy lifts.
- [ ] Founder approval needed (data change): remap `ZOMATO`→`ETERNAL`, `TATAMOTORS`→`TMPV`, mark `VISASTEEL` inactive — Yahoo no longer serves the old symbols; fundamentals frozen since 2026-05-09 until applied.
- [ ] `super_investor` cron needs a new data source — BSE blocks this server's IP (verified); `screener.in`/`moneycontrol.com` both reachable but not yet confirmed to expose named individual holders. Scope before building.
- [ ] 111 lint findings surfaced now that the lint gate works again (74 errors, 37 warnings) — mostly cosmetic, but 13 `react-hooks/set-state-in-effect` touch live components.
- [ ] Re-plan growth/marketing strategy now that the site is deindexed (see Done entry below) — the CLAUDE.md "Goal" section's SEO-led traffic projections no longer apply while this policy stands.
- [ ] Cosmetic: `src/lib/drhp-analyzer.ts` reimplements its own inline `claude` CLI spawn instead of reusing `src/lib/claude-runner.ts` — still CLI-only/correct, just duplicated code (found in 2026-09-22 AI-insight audit).
- [ ] Dead code, confirm before deleting: `src/lib/claude-cli.ts` (unused second CLI wrapper) and `src/lib/byok.ts`'s `callUserAI` (per-user BYOK keys saved via `/my/account` but never actually used anywhere) — found in 2026-09-22 audit, not touched.

## 🔨 In Progress

- _nothing in flight_

## ✅ Done  (strike through, newest at top)

- [x] ~~AI market news brief~~ — ✅ 2026-09-24 `/news` "Market Brief" card, ~60-word AI summary generated 3x/day from the same headlines `/api/news` already fetches, new `news_briefs` table, CLI-first via `callClaudeJson` matching `daily_market_summary`'s pattern
- [x] ~~SME IPOs (Green Asia Impex, Pooja Logistics, Coreintegra Consulting) permanently misfiled as mainboard~~ — ✅ 2026-09-24 (`/api/all-upcoming-issues?category=sme` was silently dead — returns `{}`; `category=ipo` leaks SME rows through and the old code trusted the category param over each row's own `series` field to set `type`, and `update` never corrected it once wrong. Switched to `/api/ipo-current-issue` + fixed type-derivation to use `series`; `update` now self-heals. 3 known-wrong production rows manually corrected.)
- [x] ~~NSE bhavcopy scraper duplicated prices under the wrong date on every weekend + market holiday~~ — ✅ 2026-09-24 (found by checking a user-reported "data looks wrong" complaint against Reliance's raw DB rows, not the rendered page — NSE's archive serves stale Friday content under a Sunday's URL instead of 404ing; `fetchNseBhavcopy` now validates the CSV's own DATE1 column instead of trusting the requested date. 109,312 corrupted rows found back to 2024-03-08, backed up, and deleted. `compute_signals` triggered manually same day to refresh derived stats from the clean data.)
- [x] ~~`amfi_navs` silently returning 0 rows for 15+ days~~ — ✅ 2026-09-23 (AMFI added new Plan/Option columns, breaking the fixed 6-column parser; fixed by parsing by column count; verified against the real live file, 14,393 funds now parse vs 0 before)
- [x] ~~`nse_insider` silently returning 0 rows, NSE endpoint fully replaced~~ — ✅ 2026-09-23 full rebuild kept on NSE (founder call, not switching to a 3rd-party source): new `src/lib/scrapers/nse-insider-filing.ts` parses each filing's HTML by flattening its rowspan/colspan header (robust to column reordering), new `processed_insider_filings` table tracks incremental catch-up through the ~2,700-filing backlog (50/run cap). Verified against 5 real live filings end-to-end before deploying. Not yet deployed to prod (tracked above).
- [x] ~~Stock peer comparison page~~ — ✅ 2026-09-22 `/ticker/compare`, up to 3 stocks, no new data (reused existing Company fundamentals + canonical price helper)
- [x] ~~RBI repo rate history page~~ — ✅ 2026-09-22 `/repo-rate`, new `rbi_repo_rates` table, admin-curated (like GMP) since MPC only meets ~6x/year — seeded in prod (21 rows), confirmed live same day
- [x] ~~`nse_company_master` + `nse_sector_map` never actually scheduled since 2026-08-19 (34-day recurrence of the same incident)~~ — ✅ 2026-09-22 (weekly Sunday 4 AM IST cron added in `scheduler.ts`; catch-up run triggered live same day — companies 2565→2598, +33 new)
- [x] ~~`nse_bhavcopy_historical` coverage tracked per-date instead of per-company, so it could never backfill a newly-added company~~ — ✅ 2026-09-22 (rewrote coverage to `Map<date, Set<companyId>>`; a date only counts as done once every known company has a row for it)
- [x] ~~Audit every AI-insight feature for Claude-CLI compliance (B.20)~~ — ✅ 2026-09-22 (all live features correctly use `claude-runner.ts`'s CLI-first `callClaude`/`callClaudeJson`; no raw `ANTHROPIC_API_KEY` reads found. 2 minor findings logged above, not fixed: `drhp-analyzer.ts` duplicate CLI-spawn code, and dead code in `claude-cli.ts`/`byok.ts`)
- [x] ~~Learn articles + legal pages had no heading/list CSS (headings looked like body text, no bullets)~~ — ✅ 2026-09-22 (root cause: `@tailwindcss/typography` was never installed despite `prose`/`prose-*` classes used throughout `/learn/[slug]` + Terms/Privacy/Refund; installed + registered via `@plugin` in `globals.css`. Verified locally: built CSS now generates real `.prose h2`/`.prose ul` rules. Reported by founder on `/learn/what-are-futures-options`.)
- [x] ~~Deindex ipopulse.talkytools.com (robots.txt + noindex meta)~~ — ✅ 2026-08-30, actually reaching prod 2026-09-05 (commits `4cc67ae` then `a519379` — a leftover static `public/robots.txt` was shadowing the fix for 6 days; caught by checking the live `robots.txt` response, not the deploy log. Founder policy: all `*.talkytools.com` subdomains deindexed regardless of live/paying status. Verified live 2026-09-22.)
- [x] ~~Reload once on stale Server Action ID instead of dead-ending~~ — ✅ 2026-09-04 (commit `75f6117`, deployed)
- [x] ~~Actually apply `connection_limit=5&pool_timeout=10` in production~~ — ✅ 2026-09-22 (commit `e809aa1` — `e8fc259` had documented it in `.env.example` but production's `DATABASE_URL` is hardcoded in `docker-compose.yml`'s `environment:` block, which overrides `.env` entirely; server `.env` was never the right place. Fixed on the actual line, deployed, confirmed live in the running container.)
- [x] ~~Document required `connection_limit=5&pool_timeout=10` on `DATABASE_URL`~~ — ✅ 2026-08-28 (commit `e8fc259`, docs + `.env.example` only)
- [x] ~~GMP tracker: multi-source failover so a single site outage doesn't stall GMP updates~~ — ✅ 2026-08-19 (root cause: `gmp_tracker` had one hardcoded source, `ipowatch.in`, which returned HTTP 522 for a full day with no fallback. Fix: ordered source list in `src/lib/scrapers/gmp-sources.ts` — `ipowatch.in` then new `ipoji.com` — tries each until rows come back; also fixed a sign-inversion bug on negative GMP values. Commit `b0bb7b8`. **DEPLOYED + verified live 2026-08-19** — real failover exercised in production while ipowatch was still down: `{"ok":true,"rowsIn":12,"notes":"source=ipoji"}`. Rollback SHA `9da0432`.)
- [x] ~~Fix 3 red cron jobs (yahoo_fundamentals, super_investor) + dead lint gate + permanently-degraded health check~~ — ✅ 2026-08-19 (commit `c1a5d66`, **DEPLOYED + verified live**. `super_investor` stays blocked by design — BSE blocks this server's IP, needs a new data source, not a retry — tracked as a separate open item below.)
- [x] ~~Fix Postgres numeric overflow on `opm` (operating profit margin) ingest~~ — ✅ 2026-08-19 (widened `Decimal(6,2)`→`Decimal(10,2)` on AnnualFinancial + QuarterlyFinancial, matching roe/roce. Commit `4acae8c`, additive schema change, **DEPLOYED**.)
- [x] ~~Project scaffolded with TASKS.md~~ — ✅ 2026-06-22
