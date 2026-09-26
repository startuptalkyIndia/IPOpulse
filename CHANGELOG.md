# Changelog — IPOpulse

## 2026-09-26 (one more) · feat: screener CSV export + saved screens (2 of the 10 competitor gaps found earlier today)

**Ask:** "keep building" — after the competitor gap analysis, picked the two items the research explicitly called "low effort": CSV/column export and saved screens, both missing vs. Screener.in/Finology.

**CSV export:** the display table already capped at 200 rows for render performance — export now uses the FULL filtered set (`filteredAll`, pre-slice) rather than just the visible 200, since a user filtering down to say 350 mid-caps expects all 350 in their export, not the first 200 shown on screen. 15 columns (company, symbol, sector, market cap, LTP, 1D%, 52W range, P/E, P/B, ROE, D/E, div yield, EPS, volume), proper CSV-escaping for names with commas, pure client-side (`Blob` + anchor download, zero server round-trip). Button shows the live match count and disables when there's nothing to export. The "Showing X of Y" line was also corrected to distinguish "Y filtered matches" from "Z total companies" now that a truncation can happen independently of the total universe size.

**Saved screens:** localStorage-based (not a DB table) — this is a personal convenience like a bookmark, not shared or critical state, so it doesn't need an account or schema change. Captures the full filter/sort combination (search, sector, market-cap band, listing type, all 4 fundamental thresholds, the 3 signal toggles, sort order) under a name the user picks; click to reload, × to delete. Wrapped every `localStorage` read/write in `try/catch` per the platform's storage-reliability guidance — a private window or blocked site data degrades to "saves don't persist" rather than a crash.

**Verified locally** (not just tsc/vitest): started `docker-compose.dev.yml` + seeded 30 companies, ran the actual save → filter-applies → reset → reload-restores-filter → delete → gone flow through the live dev server, confirmed the CSV export button doesn't touch the network (a stray "can't reach database" console message during testing was confirmed stale from an earlier page load before the dev DB started, not caused by the export click — the export function makes zero server calls). `npx tsc --noEmit` — 0 errors. `npx vitest run` — 125/125.

**Not done in this pass, per the original gap-analysis prioritization:** the bigger competitor gaps (custom-formula query builder, DCF calculator, composite quality score, live GMP refresh, momentum scans, MF-holding-trend view, portfolio P&L) — each needs its own scoping pass given schema/UI size, unchanged from the earlier assessment.

## 2026-09-26 (the one after that) · sweep through the standing backlog: sector-map filenames, SME misclassification audit, date-validation audit, dead code, competitor gap analysis

**Ask:** "build/fix all" — worked through TASKS.md's remaining backlog items systematically.

**Fixed — sector-map: 5 (not 4) dead CSV filenames.** Re-checking live turned up a 5th dead URL (`ind_niftyinfrastructure.csv`, Infrastructure) alongside the 4 already known. Confirmed via NSE's own `/api/allIndices` that all 5 underlying indices (Auto, Metal, Energy, Infrastructure, Media) are genuinely active — only the hardcoded archive filenames were stale. Brute-forced the correct current names live: all use a `...list.csv` pattern (`ind_niftyautolist.csv`, `ind_niftymetallist.csv`, `ind_niftyenergylist.csv`, `ind_niftyinfralist.csv`, `ind_niftymedialist.csv`) rather than what was hardcoded. Also fixed the bare `catch {}` that let this sit broken silently for months — failures now surface in `ingestion_runs.notes`/`rowsError`. This is a partial fix only — the sector-map's structural ~900-company ceiling (Nifty-index-constituent approach) remains open per the existing TASKS.md scoping note.

**Fixed — `bse_bhavcopy`/`nse_indices` date-validation audit: no bug found, confirmed via live fetches.** Both were suspected of the same bug class that caused the 109,312-row HDFC-era corruption in `nse-bhavcopy.ts` (trusting a requested date over the source's own embedded date). Verified both already handle this correctly, via different-but-sound patterns — BSE stores each row's own `BizDt`/`TradDt`; NSE indices parses each row's own `Index Date` and only falls back to the requested date on a parse failure. No code changed.

**Fixed — 27 more SME IPOs misclassified as mainboard**, beyond the 3 caught by the 2026-09-24 live complaint. All 64 `mainboard` rows without other strong mainboard signals were checked against real external sources (Chittorgarh, Kotak, IPO Watch, etc.) — not DB heuristics alone. Applied via `scripts/fix-sme-misclassification-20260926.ts` (kept for the record), mirroring the ORIGINAL incident's own safety lesson exactly: look up each row by name, compute the new SME slug, and skip (never force) if a different row already holds that slug. One name ("IC Electricals") resolved to 2 distinct rows (two separate issue attempts, `ICELCO`/`ICEL`) — both were genuinely SME and got distinct slugs, so both were fixed by hand after confirming no collision. Verified table-wide afterward: 0 duplicate slugs, 0 unexpected duplicate names introduced. One medium-confidence case (Steamhouse India) deliberately left untouched pending a human call.

**New finding, not yet investigated:** while doing the table-wide duplicate check above, found two `Hyundai Motor India` rows (ids 7 and 9) — Oct 2024 (the real, well-known IPO) and a suspicious Mar 2026 with no corresponding real-world news. Possible phantom duplicate row. Logged in TASKS.md, not touched.

**Fixed — `super_investor` completely broken since its own rebuild.** See the dedicated entry below — found while checking why TASKS.md's "deploy the rebuilt job" item hadn't actually produced any post-rebuild runs.

**Cleanup:** deleted confirmed-dead `src/lib/claude-cli.ts` (a duplicate, unused CLI wrapper); removed `byok.ts`'s unused `callUserAI` + `BYOKUser` (per-user BYOK keys are saved but nothing ever calls this) along with its now-orphaned `decryptApiKey` import; deduped `drhp-analyzer.ts`'s hand-rolled CLI spawn to reuse `claude-runner.ts`'s `callClaude()` (confirmed functionally identical — same spawn/stdio pattern), keeping the DRHP-specific "refuse api_key mode" guard in place since only this call site needs the CLI's live PDF-fetch tool use.

**Research, no code changes — competitor calculator/feature gap analysis** against Chittorgarh, Finology Ticker, Screener.in, Trendlyne, InvestorGain, Moneycontrol. Top findings, framed by utility value (not SEO, since the site is deliberately `noindex`'d): our screener has only 7 fixed filter fields vs. Screener.in's full custom-formula query builder (biggest gap); no CSV/column export; no DCF/intrinsic-value calculator (a genuine analysis tool, distinct from the already-deprioritized SEO-calculator list); no composite quality/red-flag score (Trendlyne-style); GMP/subscription refresh is once-daily manual vs. competitors' ~2-hourly automated refresh (our most visible weak spot); no saved screens, momentum scans, aggregate MF-holding-trend view, or portfolio P&L tracking. Full list and detail in TASKS.md — none built yet, each needs its own scoping pass given the size.

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 125/125.

## 2026-09-26 (actually truly final) · fix: `super_investor` was completely broken since its own rebuild — missing table, not missing deployment

**Ask:** "what else" (standing TASKS.md backlog check) — TASKS.md said "deploy the rebuilt `super_investor` job and trigger it a few times," phrased as if the code just hadn't been run yet. Checked `ingestion_runs` for `super_investor` and only found OLD pre-rebuild failures (BSE-block errors from Aug/Sep), no post-rebuild run at all — worth checking why before assuming it just needed triggering.

**Root cause:** the `CompanyShareholdingSync` model was added to `prisma/schema.prisma` as part of the 2026-09-26 rebuild, but the table was never actually created in production. `prisma db push` (dry run) confirmed only the 4 known `_bak_*` backup tables were flagged as pending changes — `company_shareholding_sync` wasn't even in that list, meaning it had silently never been pushed at all (this project uses `db push`, not `prisma migrate`, and the standing `_bak_*` blocker means every schema change needs this same manual-DDL workaround). Every `super_investor` run since the rebuild would have failed at the very first `prisma.companyShareholdingSync.findUnique(...)` call for every single company — but that's inside a per-company `try/catch { errors++ }`, so it silently looked like "0 rowsIn, N errors" in the logs rather than crashing loudly. Nobody had actually looked at a post-rebuild run until now, because there wasn't one.

**Fix:** generated the exact `CREATE TABLE` DDL Prisma would emit (`npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`, filtered to this table) and applied it directly to production. Re-ran `prisma db push` afterward to confirm it now agrees the schema matches (only the expected `_bak_*` tables flagged, same as before this change — the safety guard is working as intended, not blocking anything new). First real run: **100 companies processed, 7 holdings upserted, 0 errors** — the feature is genuinely live for the first time since its rebuild.

**Lesson for next time:** a per-item `try/catch` that increments an error counter is good for not letting one bad row kill a whole batch run — but it also means a systemic bug (a missing table, a wrong credential, a dead endpoint) that fails on 100% of items looks IDENTICAL in the logs to "100% of items individually had bad data." `crawler_health`/`ingestion_runs.notes` should probably flag "0 rowsIn AND rowsError == candidate count" as a distinct, louder signal from "some rows failed" — filed as a follow-up, not fixed this pass.

**Still to do:** trigger `super_investor` several more times to work through the ~2,600-company backfill (100/run cap).

## 2026-09-26 (truly final) · fix: screener silently capped at 2000 companies, excluding ~600 real ones

**Ask:** founder tried searching "nse" in the screener's own filter box (not the site-wide search fixed earlier) and got no result, plus noticed the page header said "1,994 companies" against a "2,500+ stocks" marketing claim.

**Two separate findings, only one was a bug:**
1. **"nse" genuinely has no result — not a bug.** National Stock Exchange of India Limited has no `Company` row yet (only an `Ipo` row, `status='closed'`) — confirmed live by grepping NSE's own official `EQUITY_L.csv` equity-listing file for the `NSE` symbol: zero matches. The exchange's own IPO hasn't completed trading yet as of today. The screener's filter logic itself was already correct (checks name/symbol/sector substrings) — there was simply nothing to find.
2. **The 1,994/2,000 count was a real bug.** `screener/page.tsx` had `take: 2000` on its company query, but the DB has 2,602 active companies — meaning ~600 of the smallest-by-market-cap companies were silently excluded from the screener entirely, regardless of any filter, contradicting the page's own "2,500+ stocks" metadata. First fix raised it to `take: 3000` (headroom over today's count); then removed the `take` limit entirely, since any hard number is just a future version of the exact same bug once the company count grows past it — which is precisely how 2000 went stale unnoticed in the first place.

**Tradeoff, made explicit:** `ScreenerClient.tsx` filters/sorts entirely client-side, so an uncapped query means every active company's row ships to the browser (~2,600 rows today) — the actual cost of that architecture, documented in the query's own comment. This is the same payload the perf investigation earlier today flagged as the residual ~3.5s CPU-bound cost on `/screener` after the DB-side fixes. If the company count grows enough to make this slow again, the correct fix is moving filtering to the server (pagination), not another silent row cap — noted inline for whoever picks that up.

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 125/125.

## 2026-09-26 (final) · feat: IPO static details (lot size, issue size, face value, registrar, lead managers) — scoped and built, closes the 152-184/190 gap found in today's bug sweep

**Ask:** "go" — scoping the IPO static-details gap flagged in TASKS.md from today's bug sweep, same treatment as the `super_investor` BSE-block rebuild.

**Investigation:** `nse-ipos.ts`'s two source APIs (`ipo-current-issue`, `all-upcoming-issues`) genuinely never carry lot size/issue size/face value/registrar/lead managers — confirmed by fetching each live and inspecting the full JSON, not a parsing gap. Found the real source: NSE's own **`/api/ipo-detail?symbol=X`** endpoint (already known to this codebase for subscription bid-category data) has an `issueInfo.dataList` array — the same "Issue Details" table NSE's IPO page renders — carrying exactly these fields as human-readable `{title, value}` pairs (e.g. `"Bid Lot": "441 Equity Shares and in multiples thereof"`, `"Name of the Registrar": "MUFG Intime India Private Limited"`). Verified live against an active issue (Moneyview), and two already-LISTED ones (Shiprocket, Milky Mist) — the data persists after listing, so this also backfills historical IPOs, not just current ones. BSE code is NOT in this data source and remains a separate, smaller open gap.

**Built:**
- `src/lib/scrapers/nse-ipo-detail.ts` — `parseIpoIssueDetails()`, extracting lot size, face value, issue size (₹cr), registrar, and lead managers from the `dataList`.
- `src/crons/jobs/nse-ipo-static-details.ts` — `ingestIpoStaticDetails()`, backfills IPOs with a known `nseSymbol` but no `lotSize` yet (108 candidates found), 40/run cap, triggerable from `/sup-min/ingestion` to work through the backlog faster than the daily schedule alone.
- Scheduled daily 3:30 AM IST in `scheduler.ts`.

**A parsing bug caught before shipping, not after:** my first pass at the "Issue Size" parser summed every `"Rs. X million"` figure in the string — but Shiprocket's text reads *"...Fresh Issue aggregating upto Rs. 8,855 million and Offer for Sale aggregating upto Rs.7,319.85 million (**including** Employee Reservation Portion aggregating up to Rs. 10 million & Anchor Investor portion of ... Equity Shares)"* — the parenthetical Employee Reservation figure is a **subset** already counted inside the Fresh Issue/OFS totals, not additional value, so summing it too would overcount by ₹10m. Fixed by matching only the "Fresh Issue aggregating..." and "Offer for Sale aggregating..." figures specifically. Separately discovered Moneyview's own text omits the "Rs." prefix entirely for its single-figure phrasing ("...aggregating up to 7500 million...", no "Rs.") — the fallback path (used when an issue has no separate Fresh Issue/OFS breakdown) doesn't require "Rs." for exactly this reason. Both cases covered by `tests/unit/nse-ipo-detail.spec.ts`, using the real live text captured from each symbol.

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 125/125 (4 new). Not yet deployed/backfilled as of writing this entry — see the end-of-session status table.

## 2026-09-26 (yet even later) · fix: screener 4.8s load (real cause: Prisma `distinct` scanning 1.5M rows) + best-stocks 14-vs-15 duplicate card

**Ask:** "check all internal links and feature" + "check whole ui and ux of the platform" — ran a bug-sweep audit (talkytools-bug-sweep) and a perf investigation (talkytools-perf) in parallel.

**Perf — `/screener` was 4.5–4.9s (Yahoo/Chittorgarh-competing feature, worst page on the site):**
The perf agent's first pass found `canonicalRange()` (52-week high/low) had no cache and cost 1.26s per request — fixed by wrapping it in `unstable_cache` (same pattern as its sibling `canonicalRowsForDate`), matching what the rest of `src/lib/price.ts` already does. Deployed, but re-measuring live showed **no real improvement** (still 4.5–4.9s) — so I traced it further myself with `pg_stat_activity` during a live request and found the actual dominant cost: `recentDates` in `src/app/screener/page.tsx` used Prisma's `distinct: ["date"]`, which does **not** push down to a SQL `DISTINCT` — it fetches every `(id, date)` row in the whole `bhavcopy_daily` table (~1.5M rows), ordered by date, then dedupes in Node. Caught it live taking 4+ seconds in `pg_stat_activity`. The equivalent raw `SELECT DISTINCT date FROM bhavcopy_daily ORDER BY date DESC LIMIT 2` lets Postgres short-circuit the backward index scan after finding 2 dates — `EXPLAIN ANALYZE`: **3.5ms**. Fixed by replacing the Prisma `distinct` call with `prisma.$queryRaw`. This pattern (`distinct: [...]` on a Prisma `findMany`) doesn't appear anywhere else in the codebase — confirmed via grep, so this isn't systemic.
**Lesson:** Prisma's `distinct` looks like it should map to SQL `DISTINCT ON`/`DISTINCT`, but doesn't always — always verify with `pg_stat_activity`/`EXPLAIN ANALYZE` against the live DB rather than trusting that an ORM convenience method is doing what its name implies, especially on a large table.

**Bug sweep — confirmed and fixed:**
`/best-stocks` header claimed "14 curated stock lists" (a live count from `bestStocksCategories.length`, which is genuinely 14) but rendered 15 cards — a "High Dividend" card was hand-coded into the page linking to the separate standalone `/dividend-yield` page, duplicating the real 14th category (`high-dividend` → `/best-stocks/high-dividend`), which was already being rendered correctly in the "By Strategy" section. Removed the duplicate hardcoded card. `/dividend-yield` still exists and is still linked from the main nav/search — just no longer duplicated on the hub page.

**Bug sweep — everything else came back clean:** all nav sections, footer legal pages, the recently-fixed ticker-symbol search, `/sup-min` auth gate, and sampled dynamic routes (ticker/ipo/super-investor detail pages) all loaded with zero console errors.

**Found during this investigation, NOT yet fixed — flagged in TASKS.md for a scoping decision:**
1. **IPO static details missing on 152-184 of 190 IPOs** (lot size, issue size in ₹cr, face value: 152 missing; registrar, lead managers, BSE code: 182-184 missing) — confirmed via direct DB query, not a display bug. Root cause: NSE's `ipo-current-issue`/`all-upcoming-issues`/`ipo-detail` APIs (the only source `nse-ipos.ts` currently reads) genuinely don't return any of these fields — verified by fetching each live and inspecting the full JSON. A real fix needs either a different NSE/BSE endpoint or DRHP/RHP PDF parsing (Phase 4 territory) — same class of problem as the `super_investor` BSE-block rebuild, needs the same scope-first treatment.
2. **80% of active companies (2,098 of 2,602) have no `sector` at all** — `nse_sector_map` (added to the schedule earlier this session) is running successfully but its own run history shows it only ever maps ~500 symbols, not the ~2,000 its own header comment claims. Confirmed 4 of its 14 source CSV URLs are dead (`ind_niftyautomobilelist.csv`, `ind_niftymetal.csv`, `ind_niftyenergy.csv`, `ind_niftymediaindex.csv` all 404 — silently swallowed by a bare `catch {}`), and even the working files may structurally cap out around the Nifty500+Midcap150+Smallcap250 universe (~900 companies at best), leaving the long tail of small/micro-caps permanently uncovered by this approach. This is what the bug-sweep's "sectors/paints" note was actually surfacing (Berger Paints mis-tagged `sector="Consumer Durables"`, Kansai Nerolac has no sector at all) — a symptom of this much larger gap, not an isolated taxonomy typo.

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121.

## 2026-09-26 (latest) · fix: 52-week high wrong for any stock with a leftover "seed" placeholder row — HDFC Bank showed ₹1,838 (real: ~₹1,020)

**Ask:** "there is pricing difference also" → "hdfc bank". Reproduced live: `/ticker/hdfc-bank` showed 52W Range ₹1,838 / ₹682. Yahoo Finance's real 52-week range for HDFCBANK.NS: ₹1,020.50 / ₹681.90 — the low matched almost exactly, only the high was wrong. Current price, % change, market cap and P/E all matched Yahoo exactly, ruling out a broader data problem.

**Root cause:** `bhavcopy_daily` still had 160 leftover rows (80 companies) with `source='seed'`, all dated 2026-04-24/25 — one-time placeholder prices from `scripts/seed-bhavcopy.ts`, written before real ingestion existed, never real market data. `src/lib/price.ts`'s canonical-price layer (`canonicalRange`, `canonicalSeries`, etc.) picks ONE row per (company, date) via `DISTINCT ON ... ORDER BY` source precedence (nse > bse > kite > fyers > yahoo > seed) — but that precedence only works to pick the BEST of several sources on a date. For 2026-04-24/25, `seed` wasn't the real ingestion job's only-ever-run day for real data — the daily bhavcopy job only clears seed rows for the exact date it just ingested (`nse-bhavcopy.ts` line 63), so seed rows sitting on OTHER, unvisited past dates are never cleaned up. For those two dates, `seed` was the ONLY row per company, so `DISTINCT ON` picked it anyway (nothing to out-rank), and its fake ₹1,820/₹1,830 "close" fed straight into `MAX(high)` for the 52-week window.

**Fix:**
1. `src/lib/price.ts` — every canonical read (`queryRowsForDate`, `canonicalSeries`, `canonicalRange`, `canonicalCloseOnOrAfter`, `latestCanonicalRow`) now excludes `source='seed'` outright, not just ranks it last. Confirmed first that no company relies solely on seed rows for its price (`SELECT company_id ... HAVING COUNT(*) FILTER (WHERE source != 'seed') = 0` → 0 rows), so excluding it entirely can't blank out any company that currently has a working price.
2. `src/crons/jobs/bse-listing-sync.ts` — same anti-pattern for the listing-day price pick (feeds the public GMP-accuracy/listing-gain scorecard); added `source: { not: "seed" }` to the query.
3. Backed up the 160 rows to `_bak_bhavcopy_seed_placeholder_20260926` on the server, then deleted them from `bhavcopy_daily` (same pattern as the earlier 109,312-row bhavcopy cleanup) — belt-and-suspenders with fix #1, since the reader-side fix alone would leave the fake rows sitting in the table for anyone querying it directly.

**Lesson for next time:** a source-precedence "pick the best available" pattern silently breaks when the *only* available source for a given key is itself invalid data (a placeholder/seed/test row) — precedence order only protects against a worse source out-ranking a better one on the SAME row-set; it does nothing when the bad source is the sole entry. Any such precedence list should say explicitly which sources are real market data and which are non-market placeholders that must be excluded outright, not merely ranked last.

**Verified:** `npx tsc --noEmit` — 0 errors. Confirmed 0 companies had `seed` as their only data source before deleting. Not yet re-checked live post-deploy — do that next (curl `/ticker/hdfc-bank` and confirm 52W high now shows ~₹1,020, and spot-check a couple of the other 79 affected companies for a sane 52-week high).

## 2026-09-26 (yet later) · fix: search never checked ticker symbol for IPOs — "NSE" found nothing relevant

**Ask:** "I tried search for nse in search and no relevant search result came." Reproduced live: `/api/search?q=nse` returned 9 hits, none of them the actual National Stock Exchange of India Limited IPO — its ticker is literally `NSE`, an exact match, yet it never appeared.

**Root cause:** `/api/search`'s IPO query only matched against `name` (`{ name: { contains: q, mode: "insensitive" } }`) — never `nseSymbol` or `bseCode`, even though the Company query right next to it already checked all three. "National Stock Exchange of India Limited" doesn't contain the substring "nse" anywhere in its name (verified character-by-character — "stock" and "exchange" don't join into it), so a name-only search could never find it by name, and nothing else was checked. The 9 hits that did appear were unrelated companies whose ticker or name happened to contain "nse" as a substring (`DCMFINSERV`, `Insecticides (India)`, etc.) — noise, not a fix, and not ranked by relevance either.

**Fix:** added `nseSymbol`/`bseCode` matching to the IPO query (parity with the Company query). Also added exact-match prioritization — a result whose ticker or name is an exact match for the query now sorts first, so a real ticker search doesn't get buried under unrelated substring hits.

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121.


## 2026-09-26 (later still) · feat: `super_investor` rebuilt on NSE's shareholding-pattern XBRL — restores a feature dead for ~65 days

**Ask:** scope, then build, a replacement for `super_investor`'s BSE data source, permanently blocked from this server's IP.

**Scoped first (no guessing):** checked both candidates named in the original ticket against live data before writing any code.
- **Screener.in** — free, but only exposes aggregate Promoter/FII/DII/Public percentages. No named individual shareholders anywhere. Confirmed live on Titan. Not usable.
- **MoneyControl** — has a genuinely good free investor *directory* (55+ named investors, more than our tracked 15) and free per-investor overview pages, but the actual per-stock holdings table is paywalled behind Moneycontrol Pro — every row locked. Not usable without a paid subscription.
- **NSE's own shareholding-pattern filing** (same regulatory disclosure BSE was blocked for, but NSE isn't blocked from this server) — the one that actually works. Filing index at `/api/corporate-share-holdings-master?index=equities&symbol=X`, each filing linking to a real XBRL document. Confirmed live against Titan's real 2026-06-30 filing: genuine per-holder facts (`NameOfTheShareholder`, `NumberOfShares`, `ShareholdingAsAPercentageOfTotalNumberOfShares`) — not aggregate categories.

**Harder than the insider-trading rebuild:** these are genuine dimensional XBRL documents (contexts + typed members + separate fact elements linked only by a shared `contextRef`), not a readable HTML table — no single "row" element exists; a shareholder's name, share count, and percentage live in three separate places in the file and have to be reassembled. Built `src/lib/scrapers/nse-shareholding-xbrl.ts` to do that via context-keyed maps (regex-based, matching this codebase's existing scraper style rather than a namespace-aware XML DOM).

**Verified against real live data before deploying:** parsed Titan's actual filing end-to-end — 398 shareholder facts, all complete (0 missing values). "Rekha Jhunjhunwala" appeared as **two separate entries** (different demat folios) summing to ~5.31%, matching the ~5.35% figure already on record elsewhere — the parser, the percent-is-a-fraction scaling (filing stores 0.0424, not 4.24), and the multi-folio-summing logic are all confirmed correct against a real, known-answer case, not assumed.

**Cost control:** at 500 companies × ~1-2 MB XBRL per company, re-fetching everyone every run would be wasteful for data that only changes quarterly. New `CompanyShareholdingSync` table tracks the last filing date already parsed per company — the cheap filing-index check runs for every company every time, but the expensive XBRL fetch+parse only happens when a genuinely new quarterly filing exists. A per-run cap (`SUPER_INVESTOR_MAX_NEW_PER_RUN`, default 100) bounds any single run; the first-time backfill across all 500 companies needs several manual triggers (same pattern already used for the insider-trading backlog), not one shot.

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121. Not yet deployed/backfilled in production (queued next).

## 2026-09-26 (later) · fix: apply the 3 Yahoo symbol remaps waiting for approval since May — via a new `yahooSymbol` override, not by touching `nseSymbol`

**Ask:** founder approved the 3 remaps flagged since 2026-05-09 (`ZOMATO`→`ETERNAL`, `TATAMOTORS`→`TMPV`, `VISASTEEL`→inactive) — "go."

**Before applying, checked something the original diagnosis didn't:** does NSE's own bhavcopy still use the OLD symbols, or has NSE itself also renamed them? Checked live: `TATAMOTORS` and `ZOMATO` both had bhavcopy price rows **as of yesterday** — NSE's own EOD file still lists them under the original symbols; only Yahoo's data provider has moved on. Naively overwriting `nseSymbol` (as the original note implied) would have **broken daily price ingestion** for two actively-trading companies — `nse_bhavcopy` matches rows by `nseSymbol`, and NSE's CSV would no longer contain a row under the new name. `VISASTEEL`, by contrast, has had genuinely stale bhavcopy since 2026-05-19 (4+ months) — consistent with delisted/suspended.

**Also resolved a real ambiguity for TATAMOTORS→TMPV:** Tata Motors' 2025 demerger produced conflicting reporting across sources about which entity (passenger vehicles vs. commercial vehicles) kept the "Tata Motors" name and which ticker is which (`TMPV` vs `TMCV` vs `TMCVL` all appear across different secondary sources). Resolved via Yahoo's own `TMPV.NS` profile (MD/CEO is Shailesh Chandra, the real passenger-vehicles-business CEO) cross-referenced with Screener.in's explicit statement that the entity keeping the original listing was renamed "Tata Motors Ltd" after commercial vehicles was spun out — confirms `TMPV` is the same entity our `TATAMOTORS`-symbol record already tracks, not a different one.

**Fix:** added `Company.yahooSymbol` (nullable, additive) — when set, `yahoo-fundamentals.ts` builds the Yahoo ticker from it instead of `nseSymbol`; `nseSymbol` itself is never touched, so bhavcopy matching is unaffected. Set `yahooSymbol='ETERNAL'` for Zomato, `yahooSymbol='TMPV'` for Tata Motors, and `active=false` for Visa Steel (removing it from every ingestion job's query, not just Yahoo's).

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121. Both target Yahoo tickers confirmed live and current (real profile pages, real recent prices) before applying, not assumed from months-old notes.

## 2026-09-26 · fix: `next_day_preview` got permanently stuck on templated fallback text after a transient AI outage

**Ask:** "what to improve" — checked for anything that changed since the last pass rather than re-reading the standing backlog.

**Found:** a genuine (now-resolved) Claude CLI outage occurred yesterday, roughly 07:30–15:00 UTC — `claude -p` was returning exit 1 ("subscription access is down"). During that window, `market_news_brief` correctly skipped generation (it never writes a fallback row — by design, no fabricated content), but `daily_market_summary` and `next_day_preview` both fell back to generic templated text, which is also correct *in the moment*. The bug: `next_day_preview` checks `if (existing) return { notes: "already exists" }` before generating — it never re-checks whether that existing row is real AI content or the templated fallback. Once the outage produced one templated row for tomorrow's date, the job would skip regenerating it for the rest of the day, and that placeholder ("Paints in focus; FII sellers" — clearly generic, not the real per-day narrative) would have shipped to the live page as tomorrow's actual preview.

**Fix:** the skip condition now checks `existing?.generatedBy` (only real AI-generated rows set this field) instead of just row existence — a templated placeholder gets retried on the next scheduled run instead of sticking permanently. `daily_market_summary` has no equivalent guard (always regenerates via upsert) and wasn't affected. `market_news_brief` never persists a fallback row on failure, so it wasn't affected either.

**Verified live:** confirmed Claude CLI was back (`/api/health` → `anthropic: ok`, direct `claude -p 'say ok'` → `ok`) before re-triggering `daily_market_summary` (now `claude-cli`, not templated) and `market_news_brief` (generated fresh) manually to backfill today's content immediately rather than waiting for the next scheduled run.

**Scope correction, found after deploying the fix:** cleaning up the stuck placeholder to force a fresh regeneration turned up **78 rows** with `generated_by='templated'` in `next_day_previews`, not just the one from yesterday's outage — this bug has apparently been silently sticking low-quality fallback content in place every time the CLI had a brief hiccup, for a long time before this pass, not just once. Deleted all 78 and confirmed the next scheduled run regenerates a real one (`claude-cli`, verified live).

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121.

## 2026-09-24 (fleet check) · fix: unknown or unsafe /r/ links sent visitors to a dead page (https://0.0.0.0:3065/)

**Cause:** the click redirector `/r/[slug]` sent visitors home with `new URL("/", url.origin)` whenever the slug was unknown or its partner URL was not https. Behind nginx, the request URL in a route handler holds the container's own address — Next builds it from the server's bind host and port (`0.0.0.0:3065`), not from the visitor's Host header — so those visitors landed on `https://0.0.0.0:3065/`. Confirmed live before the fix: `curl -sI https://ipopulse.talkytools.com/r/zz-not-a-real-slug` → `location: https://0.0.0.0:3065/`. Real partner links (e.g. `/r/zerodha`) were never affected: they redirect to the partner's own https URL. The `/sup-min` and `/signin` redirects in `src/proxy.ts` were also fine: Next rewrites its own address out of proxy/middleware redirects.
**Fix:** the three home fallbacks return `Location: /` (a path), which always resolves against the address the visitor used. Partner redirect and advisor click tracking unchanged.
**Verified:** `tsc --noEmit` 0 errors · `npm run build` passes · local production server (standalone, `HOSTNAME=0.0.0.0`, nginx's `Host` + `X-Forwarded-Proto: https`) against a throwaway Postgres: `/r/zz-not-a-real-slug` → `302 location: /`; `/r/zerodha` → `302 location: https://zerodha.com/open-account/?c=IPOPULSE` (unchanged). Clean server log.
**Not deployed** — waiting for the founder's "deploy". After deploy, re-run the curl above: it should show `location: /`.
**Context:** found in the 2026-09-24 fleet check for the GiftScene sign-in bug (GiftScene `f5609bb`). Built and verified in a separate git worktree so the IPOpulse session's working copy was never touched.
**Files:** `src/app/r/[slug]/route.ts`

## 2026-09-24 (later still) · fix: the SME type-correction below created duplicate rows for OTHER already-wrong companies

**Found live, right after deploying the fix below:** triggering `nse_ipos` fixed the 3 target companies correctly, but silently duplicated 2 *other* pre-existing wrong companies (Himalayan Solar, Bench Mark Infotech Services) — each ended up with two rows, one `mainboard` (the original, with accumulated GMP history) and one `sme` (a fresh, empty row the upsert created because a type correction changes the slug too, and `upsert({ where: { slug } })` can't find the existing row under its *old* slug — so it creates a new one instead of fixing the old one in place).

Manually cleaned up both (kept the row with accumulated data, deleted the empty duplicate, corrected type+slug on the real row) — but the underlying pattern would have silently repeated for any future company this job touches whose type was ever wrong historically. Fixed properly: `ingestIssues()` now looks up an existing row by **name** first; if found under a different slug than the freshly-computed one, it corrects that row in place (`update` by `id`) instead of upserting by the new slug. Verified `npx tsc --noEmit` 0 errors, `npx vitest run` 121/121 after this second fix.

**Lesson for next time:** after any fix that can change a record's natural key (slug, in this case), check for name/entity-level duplicates across the WHOLE table, not just the specific rows the original complaint was about — a self-healing `update` only helps when the lookup key stays the same.

## 2026-09-24 (later) · feat: AI market news brief + fix: SME IPOs wrongly classified as mainboard forever

**1. Market news brief — `/news`.** New "Market Brief" card: a ~60-word AI-generated summary of the day's top headlines, sitting above the existing raw headline feed. Reuses 100% of the existing headline-fetching (extracted the Google News RSS logic out of `/api/news/route.ts` into a shared `src/lib/scrapers/google-news.ts` so both consumers stay in sync) — no new scraping. Summarized via the same CLI-first `callClaudeJson` pattern already proven in `daily_market_summary`/`next_day_preview`, respecting the admin's subscription/api_key provider setting; skips generation entirely (rather than storing a fabricated fallback) if Claude is unavailable. New `news_briefs` table (additive) — one row per generation, not one per day, since it runs 3x daily (8:30 AM, 1 PM, 6 PM IST) to stay current through market hours.

**2. `nse_ipos` — SME companies silently misfiled as mainboard, permanently.** Reported live: "an NSE IPO is live but why can't I see it" — turned out to mean the SME tab, which showed "No SME IPOs in the pipeline" while 3 real SME IPOs (Green Asia Impex, Pooja Logistics, Coreintegra Consulting Services) were live on NSE right now. Root cause, confirmed against NSE's actual API responses directly:
- `/api/all-upcoming-issues?category=sme` — the endpoint this job used for SME issues — returns a bare `{}`, not an array. Silently dead the whole time (`fetchNseArray` already degrades this to `[]`, so no error, just zero SME rows from this call, ever).
- `?category=ipo` (used for mainboard) is a **leaky superset** — confirmed it returns SME-series rows too (forthcoming ones observed live). The old code trusted the *category parameter* to decide `type`, never checked each row's own `series` field (`EQ` vs `SME`), so any SME company leaking through the "ipo" call got stored as `type='mainboard'`. Made worse by the upsert's `update` branch never touching `type` — once wrong, a row stayed wrong forever, immune to every subsequent ingest run.

Fix: switched the data source to `/api/ipo-current-issue` — the endpoint NSE's own live IPO page actually uses for currently-active issues, verified to correctly return both EQ and SME rows with a reliable `series` field — merged with `?category=ipo` for forthcoming issues (its leaked SME rows are now harmless since `series` decides type, not which call found them). `update` now also corrects `type`, so a wrong row self-heals on its next ingest instead of staying wrong. Manually corrected the 3 already-known-wrong production rows (type + slug, since the slug's `-sme-` suffix depends on type and a slug change means the upsert's `where: {slug}` would otherwise create a duplicate row rather than fixing the existing one).

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121. Both the endpoint-merge logic and the 3-company fix verified against NSE's real live API responses before deploying, not guessed at.

**Not done this pass:** a broader historical audit for other pre-existing SME→mainboard misclassifications beyond the 3 caught by this specific live complaint — logged in TASKS.md.

## 2026-09-24 · fix(critical): NSE bhavcopy scraper silently duplicated prices under the wrong date on every weekend + market holiday since at least March 2024 — 109,312 corrupted rows cleaned up

**Ask:** "data I see is mostly wrong — check Reliance price." Checked Reliance directly against the raw DB rather than the rendered page.

**Found:** `bhavcopy_daily` had a row dated **Sunday 2026-09-20** for Reliance (and every other NSE-tracked company) that was byte-for-byte identical to the real Friday 2026-09-18 row. Confirmed by hand: `curl`-ing NSE's own archive URL for the (non-existent) Sunday file, `sec_bhavdata_full_20092026.csv`, returns **HTTP 200** with a body whose own `DATE1` column says `18-Sep-2026` — NSE's archive host silently serves the preceding Friday's file under a weekend's URL instead of 404ing. `src/lib/scrapers/nse-bhavcopy.ts`'s walk-back loop trusted the *requested* candidate date as the row's date and never checked the CSV's own date column, so it accepted this stale content and wrote it under the wrong (weekend) date.

**Scope, once quantified — much bigger than one Sunday:**
- **45,118 rows** dated on a Sunday (day-of-week check — Saturdays were unaffected; NSE's host 404s cleanly for that specific filename, only the Sunday one misbehaves).
- **64,194 more rows** on ~29 confirmed market holidays back to **2024-03-08** (Holi through Diwali-adjacent dates, Independence Day, Christmas, etc. each year) — found via a same-source (`nse` only — BSE and Yahoo have separate, unaffected scrapers), same-value, consecutive-calendar-day duplicate check, filtered to dates where the duplicate count exceeded 500 (to exclude the small, legitimate day-to-day coincidences of a handful of thin-trading stocks closing flat, which is normal and NOT this bug).
- **109,312 total corrupted rows**, ~7% of the entire `bhavcopy_daily` table (1.5M rows), spanning 2.5 years.

**Impact:** every affected date showed a fabricated "as of" date one day newer than the real last trading day, and doubled up rows in any date-ordered query — feeding into 1-day/1-year returns, 52-week ranges, "latest price," market breadth, and anything else built on `bhavcopy_daily`.

**Fix:** `fetchNseBhavcopy` now parses each response's own `DATE1` column and requires it to match the calendar day being requested; a mismatch is treated exactly like a 404 (falls through to the next day in the walk-back) instead of being accepted. Verified against the real live Sunday URL: now correctly resolves to Friday's date instead of mislabeling it. Since this is the *shared* scraper (both the daily `nse_bhavcopy` job and the `nse_bhavcopy_historical` backfill import it), the fix protects both call sites — and any future NSE holiday, not just the ones already found.

**Cleanup:** backed up all 109,312 affected rows to `_bak_bhavcopy_sunday_rows_20260924` and `_bak_bhavcopy_holiday_dup_20260924` (full row snapshots, not just IDs — restorable) before deleting them from `bhavcopy_daily`. Verified Reliance's history is clean post-cleanup (17th/18th/21st Sept only, no phantom 20th).

**Not yet done (queued):** trigger `compute_signals` to refresh RSI/returns/moat-flags now that the raw rows they're computed from are clean, rather than waiting for tonight's scheduled run. Also worth a similar audit pass on `bse_bhavcopy` and `nse_indices`, which weren't checked this pass (BSE's source was confirmed *not* affected by this specific bug via the per-source duplicate check, but that doesn't rule out a different bug in BSE's own scraper).

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121. Fix verified against the real live problematic NSE URL before deploying, not guessed at. Cleanup verified against the real production data (row counts before/after, spot-checked Reliance).

## 2026-09-23 · fix: AMFI NAVs silently broken for weeks (parser bug) + full rebuild of NSE insider-trading ingestion

**Ask:** "do we need to improve any data?" Ran a data-health check (crawler_health heartbeat flagged 3 issues) rather than assume everything was fine.

**1. `amfi_navs` — genuinely broken, fixed.** Reported "success" with `rowsIn=0` every single day for at least 15 consecutive days ("no funds parsed"). Root cause: AMFI split what used to be one combined field into two new columns, "Plan" and "Option" — `src/lib/scrapers/amfi.ts` still destructured a fixed 6-column layout, so `NAV` was read from the new "Plan" text column and `Date` from "Option", both non-numeric — every row failed validation and the parsed list came back empty, silently, for weeks. Fixed by parsing by column count (8 columns = new format with Plan/Option folded back into the scheme name for readability; 6 = old format, kept as a fallback). **Verified against the real live AMFI file**, not a fixture: 14,393 funds parsed (was 0).

**2. `nse_insider` (SEBI PIT / insider-trading disclosures) — rebuilt end-to-end, kept on NSE as the source.** Same "reports success, 0 rows" symptom, but the cause was much bigger: NSE didn't rename a field, they replaced the whole endpoint. The old `/api/corporates-pit?...&from_date=...&to_date=...` (full trade details in one JSON call) now returns HTTP 200 with a genuinely empty `{data: []}`. The real current endpoint, confirmed against NSE's own insider-trading page's actual network calls, is `/api/corporates-pit-gg?index=equities` — but it only returns a **filing index** (company, symbol, a link to a document per filing), no trade details inline.

Initially scoped this as "needs an XBRL parser, too big for this pass" — turned out to be wrong in a good way: fetched one of the linked documents directly and it's **not** binary XBRL, it's clean human-readable HTML with a real `<table>` (richer than the old API — includes CIN/DIN and full before/after holding detail). No NSE session/cookies needed to fetch it either (verified with a bare curl). Considered switching to a third-party aggregator (Trendlyne/MoneyControl/BSE) instead, but the founder's call was to stay on NSE as the primary source since it's the authoritative regulatory filing.

Built:
- `src/lib/scrapers/nse-insider-filing.ts` — parses a filing's HTML by first flattening its 3-row rowspan/colspan header into one label per column (robust to NSE reordering columns; falls back to "field not found" rather than crashing if a label changes), then reading values by label. Only "Equity" instrument-type rows are mapped (the vast majority of disclosures); other instrument types (Warrants, Options, etc.) are counted and skipped rather than force-mapped into the wrong columns.
- New table `processed_insider_filings` (additive) tracks which filing `appId`s have already been fetched, since the new index has ~2,700+ filings spanning months with no date-range filter — without this, every run would re-fetch NSE's entire history. A per-run cap (`INSIDER_MAX_FILINGS_PER_RUN`, default 50) plus a 10-minute wall-time cap bound each run's cost; newest filings are processed first, so a large backlog catches up over consecutive daily runs rather than blocking on one giant run.
- `src/crons/jobs/nse-insider.ts` rewritten around this: fetch index → filter to unprocessed appIds → fetch+parse each filing's HTML → upsert trades → mark the filing processed (only after a successful fetch+parse, so a transient network error leaves it for retry next run instead of silently skipping it forever).

**Verified against real live NSE data**, not fixtures: fetched the real filing index (2,767 filings) and parsed 5 real recent filings end-to-end — correctly extracted rows across different disclosure categories (Promoter Group, Designated Person, Trust, Promoter and Director) and modes (Market Purchase, ESOP, Inter-se-Transfer), both Buy and Sell.

**Why this pattern matters:** both jobs were reporting green while doing nothing, for weeks, with no alert — the same "success that lies" failure mode this project has hit and fixed before (yahoo_fundamentals, Aug 19). `crawler_health`'s heartbeat did flag both as issues, but nobody had read it since — worth checking that report proactively each session, not just when something's reported broken.

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121. Both fixes verified against real live external data before deploying, not guessed at.

**Known limitation, not solved this pass:** a revised filing (NSE's `prevAppId` field) is treated as an independent new filing rather than superseding the original — if a company files a correction, both the original and corrected trade rows could end up in the table if their unique key differs (e.g. corrected quantity). Rare in practice; flagged for whoever next touches this job.

## 2026-09-22 · feat: stock peer comparison (`/ticker/compare`) + RBI repo rate history (`/repo-rate`)

**Ask:** competitor research against Finology's Calculators + Ticker pages surfaced two real product gaps
that needed no new data pipeline — the fundamentals to power both were already sitting in the `Company`
table. Founder said "go."

**1. `/ticker/compare`** — search-driven picker (reuses the existing `/api/search` endpoint, filtered to
`type: "stock"`, rather than a 2,600-option `<select>`) for up to 3 stocks, comparing sector, price, market
cap, P/E, P/B, ROE, ROCE, debt/equity, dividend yield, EPS, book value, margins, 1-year return, and revenue
CAGR side-by-side. Modeled on the existing `/ipo/compare` pattern. No new data — every field already exists on
`Company` (fundamentals from `screener_deep`/`yahoo_fundamentals`, technicals from `compute_signals`) or comes
from the canonical price helper (`latestCanonicalRow`, already used elsewhere for cross-source price
precedence). Linked from `/ticker`, added to sitemap + Cmd+K search index.

**2. `/repo-rate`** — current RBI repo rate + full MPC decision history (hikes/cuts, October 2016 onward),
with FAQ and cross-links to the FD/loan/RD calculators. New data source, but NOT a live API — repo rate only
changes ~6x/year via scheduled MPC meetings, so this follows the same "admin-curated reference data" pattern
as GMP rather than a scraper. New table `rbi_repo_rates` (additive, `prisma db push` applies it on next
container boot — confirmed additive per DB standard, no destructive diff). Seeded via
`scripts/seed-rbi-repo-rate.ts` (idempotent, upsert-on-effectiveDate).

**Data integrity note:** cross-checked two independent sources for the rate history. One source
(stableinvestor.com) had a confirmed 2-year gap in its pre-2016 data (March 2011 → May 2013 missing
entirely) — rather than publish a dataset with a known hole, seeded data is deliberately scoped to the MPC
era only (Oct 2016–present), which was corroborated end-to-end against a second source
(tradingeconomics.com) with no gaps found. The 2025 rate-cut path specifically had a real discrepancy between
a WebSearch AI-summarized answer (claimed 5 separate 25bps cuts) and the granular per-meeting table (shows a
single 50bps cut in June 2025) — trusted the explicit dated table over the summarized prose. Full seed data +
sourcing rationale in `scripts/seed-rbi-repo-rate.ts`'s header comment.

**Not built this pass (scope cut, logged in TASKS.md):** an admin UI to add future repo rate rows. Given the
low update frequency (~6x/year), a one-off `npx tsx scripts/seed-rbi-repo-rate.ts`-style update run by whoever
does the next MPC-adjacent session is acceptable for now rather than building a full CRUD page immediately.

**Also considered and explicitly skipped:** a standalone "CAGR calculator" page. `/calculators/mf-returns`
already computes CAGR with near-identical copy — a new page would be near-duplicate content, and since the
whole site is currently `noindex`'d (2026-09-05 deindex policy), a new SEO-targeted page wouldn't get
discovered by search anyway. Flagged this reasoning rather than building it.

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121 passing. `npx prisma validate` —
schema valid. Not yet deployed/seeded in production (queued next).

## 2026-09-22 · fix: `nse_company_master`/`nse_sector_map` still never scheduled since Aug 19 (34-day recurrence of the same incident) + fixed `nse_bhavcopy_historical`'s per-date (not per-company) coverage bug

**Ask:** "check all features, make sure all data is latest and cron is set for it, and every AI insight uses the Claude CLI — the platform should run 100% on its own."

**Found (cron audit):** cross-referencing every job in `availableJobs` against what's actually registered in
`cron.schedule()` (scheduler.ts) and each job's real run history in `ingestion_runs` — `nse_company_master`
and `nse_sector_map` had each run **exactly once**, on 2026-08-19 (the manual trigger from that incident), and
**zero times since**. COMMS.md's own 2026-08-19 entry explicitly listed "Schedule `nse_company_master`
(weekly) — root cause" as still open and awaiting deploy; it was never actually done. Result: `companies`
table gained zero new rows in 34 days, silently reproducing the exact 2026-08-19 damage chain (new IPO
listings' bhavcopy rows dropped as unmatched symbols → stuck in `closed` status forever → invisible on
`/ticker`/`/screener`/`/movers`, no listing-gain/GMP-accuracy data) for every company that listed since then.

**Fix 1 — actually scheduled them:** `src/crons/scheduler.ts` — added a weekly Sunday 4:00 AM IST cron
running `nse_company_master` then `nse_sector_map` in sequence (before `screener_deep` at 5 AM, which needs
the company list current).

**Fix 2 — ran the catch-up now, not just next Sunday:** triggered both jobs live via
`/api/cron/run/[job]` (the existing `CRON_SECRET`-gated manual-trigger route). Result: `companies` went from
2565 → 2598 (**+33** new companies added since 2026-08-19), sector map updated 499 symbols.

**Found (second bug, same root cause family):** `src/crons/jobs/nse-bhavcopy-historical.ts` — the
2026-08-19 entry also flagged "`nse_bhavcopy_historical` skips any date already present, so re-running it
adds nothing for newly-added companies" as open, unfixed work. Confirmed still present: the job tracked
coverage as a flat `Set<dateKey>` — a trading day counted as "done" the moment **any** company had a row for
it, so once the first month of history existed, the 33 companies added today would never get backfilled no
matter how many times this job re-runs.

**Fix 3:** rewrote the coverage check to be per-(date, company): loads existing `(date, companyId)` pairs for
the backfill window into `Map<dateKey, Set<companyId>>`, and a date only counts as fully covered once **every**
currently-known company has a row for it. Preserves the original holiday-date-aliasing optimization (a
holiday `target` date now shares the same coverage Set reference as the real trading day it resolves to,
rather than a separate boolean flag) and the existing wall-time cap / bulk symbol-map load. Not deployed to
schedule (this job stays manual-trigger-only via `/sup-min/ingestion`, by design — it's a backfill utility,
not a recurring feed) — but now actually usable when triggered instead of being a permanent no-op for new
companies.

**AI-insight audit (no code change needed — verification only):** checked every feature that produces an
AI-generated insight (DRHP Q&A + deep-dive, concall summary, promoter check, daily market summary, next-day
preview) against the B.20 CLI-first standard. All of them correctly call through `src/lib/claude-runner.ts`'s
`callClaude`/`callClaudeJson`, which shells out to the local `claude` CLI by default and only falls to the
Anthropic SDK when an admin explicitly sets `api_key` mode — never a silent `process.env.ANTHROPIC_API_KEY`
read (confirmed via repo-wide grep, zero hits outside comments). One exception found: the DRHP background
extractor (`src/lib/drhp-analyzer.ts`) spawns the `claude` CLI directly with its own inline implementation
instead of reusing `claude-runner.ts` — still CLI-only, still correct, just duplicated code (cosmetic, not
fixed this pass). Two pieces of confirmed **dead code** noted, not touched: `src/lib/claude-cli.ts` (a second,
unused CLI wrapper, imported nowhere) and `src/lib/byok.ts`'s `callUserAI` (per-user BYOK keys — a `/my/account`
settings feature exists to save them, but nothing in the app ever calls `callUserAI` to actually use them for
anything). Also worth noting: the project's own CLAUDE.md/AGENT_OPERATING_STANDARDS.md reference
`lib/ai/claudeRunner.ts` (`runClaude()`) — that path doesn't exist in this repo; the real, correctly-used file
is `src/lib/claude-runner.ts` with `callClaude()`/`callClaudeJson()`. Doc drift, not a code bug.

**Verified:** `npx tsc --noEmit` — 0 errors. `npx vitest run` — 121/121 passing. Live catch-up run results
above (2598 companies, +33). Not yet re-run: `bhavcopy_historical` against the fixed code (queued for after
deploy).

## 2026-09-22 · fix: every Learn article + legal page rendered with no heading/list styling — `@tailwindcss/typography` was never installed

**Symptom (reported by founder on a live URL):** `/learn/what-are-futures-options` — headings like "F&O Lot
Sizes and Expiry" and "Is F&O Suitable for You?" rendered as plain paragraph text indistinguishable from body
copy, and bulleted lists ("Key features of futures:") showed no bullets and no indentation, reading as a
run-on paragraph.

**Root cause:** `src/app/learn/[slug]/page.tsx` (and the three legal pages — Terms/Privacy/Refund) wrap their
content in `prose prose-sm ... prose-h2:text-lg prose-h2:font-semibold ... prose-ul:pl-5 ... prose-li:mb-1.5
...` — Tailwind Typography plugin classes. But `@tailwindcss/typography` was **not in `package.json` at
all**, and Tailwind v4's CSS-first config had no `@plugin` directive registering it either. Unrecognized
utility classes generate zero CSS in Tailwind v4, so every `prose*` class was a no-op — meanwhile Tailwind's
own Preflight reset (which unsets default browser heading font-size/weight and strips list bullets/padding)
was still active with nothing to counteract it. The underlying HTML was always semantically correct
(`<h2>`, `<ul><li>`, `<strong>`) — this was purely a missing-CSS bug, not a content bug.

**Fix:** `npm install -D @tailwindcss/typography`, then `@plugin "@tailwindcss/typography";` added to
`src/app/globals.css` right after `@import "tailwindcss";` (Tailwind v4's CSS-first plugin registration —
there is no `tailwind.config.js` in this project). No content or component code changed.

**Verified locally before deploy:** built the CSS chunk for a real `/learn/[slug]` page render and confirmed
the plugin now generates real rules — `.prose-h2\:text-lg :where(h2)...{font-size:var(--text-lg)}`,
`.prose-h2\:font-semibold` → `font-weight: semibold`, and the base `.prose ul` rule now carries
`list-style-type: disc` + `padding-inline-start`. `npx tsc --noEmit` — 0 errors.

**Scope:** affects every `/learn/[slug]` article (35+) and `/terms`, `/privacy`, `/refund` — all four are the
only files in the repo using `prose`/`prose-*` classes. Nothing else in the site uses this pattern (checked
via `grep -rl "prose-h2:\|prose prose-sm" src/`).

## 2026-09-05 · fix: remove static `public/robots.txt` shadowing the dynamic noindex route — commit `a519379`

The 2026-08-30 deindex fix (below) built and deployed cleanly but was **never actually reaching
production**: a leftover `public/robots.txt` was silently overriding `src/app/robots.ts` (Next.js serves a
static `public/` file over an app-router dynamic route at the same path). Found by checking the live
`robots.txt` response after deploy instead of trusting the deploy script's green exit code — same root
cause independently found and fixed in DIYPR first. Deleted the static file. **Verified live 2026-09-21:**
`https://ipopulse.talkytools.com/robots.txt` now returns `Disallow: /` and the homepage carries
`<meta name="robots" content="noindex, nofollow, nocache">`.

## 2026-09-04 · fix: reload once on a stale Server Action ID instead of a dead-end error — commit `75f6117`

A browser tab left open across a deploy (or a stale cached page) can POST a build-specific Server Action ID
the current build no longer recognizes ("Failed to find Server Action" / "Server Reference ID did not match
the expected format") — not a real app bug, just a stale client. `global-error.tsx` now detects this case
and reloads the page once instead of showing the user a dead end. Existing branded error UI untouched.

## 2026-08-30 · seo: deindex ipopulse.talkytools.com per platform portfolio policy — commit `4cc67ae`

**Founder decision (2026-08-30): `talkytools.com` is a pure portfolio brand.** Every `*.talkytools.com`
subdomain — including IPOpulse — is deindexed from Google/Bing regardless of current live/paying status.
Blanket `Disallow: /` in `src/app/robots.ts` + `noindex,nofollow` meta on the root layout. This directly
supersedes the SEO-led growth strategy in this project's "Goal" section and its 12/24/36-month traffic
projections (see CLAUDE.md/memory correction dated 2026-09-22) — organic search is no longer a channel this
product can rely on while this policy stands. (Turned out not to be live until `a519379`, above — the static
`robots.txt` was shadowing it.)

## 2026-08-28 · docs(db): document required `connection_limit=5&pool_timeout=10` on `DATABASE_URL` — commit `e8fc259`

Per `_shared/DB_STANDARD.md` (SCALE-01). `.env.example` updated + a one-line comment in `src/lib/db.ts` noting
the requirement — `PrismaClient` reads `DATABASE_URL` as-is from env, so no code change was needed. **Not yet
applied:** the real server `.env` still needs the founder to append the params by hand.

## 2026-08-20 · docs(tasks): reflect 2026-08-19 work — commit `5388341`

`TASKS.md` updated to move the GMP failover + cron/lint/health fixes to Done, referencing deploy commits
`b0bb7b8`/`c1a5d66`/`796b251` and the verified-live entries in COMMS.md same date.

## 2026-08-19 · fix(db): widen `opm` (operating profit margin) from Decimal(6,2) to Decimal(10,2) on AnnualFinancial + QuarterlyFinancial

Production log check found `prisma.annualFinancial.upsert()` failing with Postgres `22003 numeric field overflow` ("A field with precision 6, scale 2 must round to an absolute value less than 10^4") during the `screener-deep` ingest job — 7 occurrences since the container's last restart (2026-08-15). `opm` (operating profit margin %) was the only ratio field on either model still at `Decimal(6,2)` (max ±9999.99); the sibling ratio fields `roe`/`roce` already use `Decimal(10,2)`. A margin computed as ≥10000% or ≤-10000% is almost certainly a divide-by-near-zero artifact from the scraper's own calculation (didn't change that logic — out of scope, no evidence it's wrong vs. just an extreme edge case), but the column should hold whatever the ingest computes rather than silently dropping the row. Widened both `opm` fields to match `roe`/`roce`'s precision — additive, no data loss (every value that fit in `Decimal(6,2)` fits in `Decimal(10,2)`).

Also investigated, NOT fixed: the earlier-flagged `prisma.ipo.findUnique()` invocation error (57x in an older scan) and a Next.js "functions cannot be passed to Client Components" error (14x) haven't recurred since the Aug 15 container restart — current logs show zero occurrences of either, and there are 11 different `findUnique` call sites, so there's no live evidence to safely pinpoint which one to fix. Left alone rather than guess.

**Verified:** `npx prisma validate` — valid. `npx tsc --noEmit` — 0 errors. Schema change committed, **not yet applied to the production DB** (this project runs `prisma db push` in its container entrypoint — the next deploy will apply it. Per DB standard: back up DB first, additive-only, confirmed additive here).

## 2026-08-19 · fix(crons+lint+health): the three remaining red jobs, the dead lint gate, and a permanently-degraded health check

Follow-up to the GMP failover entry below. Every job on the box is now green or honest; a 30-day audit of
`ingestion_runs` showed only three problem jobs out of 27 (`gmp_tracker`, `yahoo_fundamentals`,
`super_investor`) — everything else was 0 failures.

### 1. `yahoo_fundamentals` — a handful of dead tickers made a healthy job report FAILED

**Symptom:** 10 failed runs in 30 days, heartbeat red at "last success 56h ago", runs reporting
`updated=0 failed=2`.

**Root cause:** a failed fetch never stamps `fundamentalsAt`, so a symbol Yahoo no longer serves requeues
every single day, forever. `runIngestion` marks a run failed when `rowsIn === 0 && rowsError > 0`, so on any
day the stale queue held nothing *but* those dead symbols, the whole job was recorded as failed. Only 4
companies were even in the queue, and 2 of them had been frozen since 2026-05-09.

**Verified against Yahoo directly:** `ZOMATO.NS` → "Failed Yahoo Schema validation" (renamed —
**`ETERNAL.NS` works**, "Eternal Limited"); `TATAMOTORS.NS` → not found (demerged — **`TMPV.NS` works**,
"Tata Motors Passenger Vehicles Limited"); `VISASTEEL.NS` → not found (delisted/suspended); `RELIANCE.NS`
fine. So this was never a broken job — it is three stale symbol mappings.

**Fix:** errors are now classified. Permanently-dead symbols are collected and named in the log and in the
run's notes; only transient errors (network, rate-limit, timeout) count toward `rowsError` and can fail the
run. Also fixed the classifier itself: the old filter tested for `"Not Found"` while Yahoo actually says
`"Quote not found for symbol: X"` — different case, so it never matched anything.

**Not done — needs founder approval (data change):** remapping `ZOMATO`→`ETERNAL`, `TATAMOTORS`→`TMPV`, and
marking `VISASTEEL` inactive. Those three companies' fundamentals stay frozen until that is applied.

### 2. `super_investor` — has never ingested a single row; BSE blocks this server

**Symptom:** heartbeat "last success 1561h ago" (~65 days). Full history: 2026-05-15 "success" with 0 rows,
06-15 "success" with 0 rows, 07-15 and 08-15 "all 500 rows errored". It has never worked.

**Root cause:** `api.bseindia.com` refuses this server's cloud IP. It answers with a **302 to its own error
page** rather than a 4xx — so with `fetch`'s default redirect-following the job received a perfectly
healthy-looking 200 full of HTML, which then died in `res.json()` and was swallowed by a bare `catch`, 500
times per run. Verified from the server: 302 with browser headers, and still 302 with a cookie jar warmed
from `www.bseindia.com`. Plain `www.bseindia.com` downloads are unaffected, which is why `bse_bhavcopy` and
`bse_listing_sync` are healthy — only the API host is blocked.

**Fix:** the block is now detected explicitly (`redirect: "manual"`, plus a content-type check) and raised as
a distinct `BseBlockedError` that aborts the run immediately with the real reason, instead of spending ~3.5
minutes issuing 500 requests that cannot succeed and reporting a meaningless "all 500 rows errored".

**Still blocked, by design:** this does not restore the feature — no reachable source replaces BSE for
*named* individual holders. `screener.in` and `moneycontrol.com` both answer this server (verified), so a
rebuild against one of them, or an India residential proxy, is the path. That is scoped work, not a retry.

### 3. `npm run lint` — the gate had not run at all

**Root cause:** `eslint.config.mjs` loaded `eslint-config-next` through `FlatCompat.extends()`. That shim is
for old eslintrc-style configs, but `eslint-config-next@16` already exports **flat config arrays** — so it
failed schema validation, and then the validator's own error formatter crashed on the circular plugin object
("Converting circular structure to JSON"). ESLint died before linting a line, on every file, including files
untouched for months.

**Fix:** spread `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` directly, plus an
explicit `ignores` block. `npx eslint` now runs clean on every file this session touched.

**Newly revealed backlog (not fixed — reporting only):** with the gate working, the project reports **111
problems (74 errors, 37 warnings)** accumulated while it was silently off: 45 `react/no-unescaped-entities`,
36 `@typescript-eslint/no-unused-vars`, 13 `react-hooks/set-state-in-effect`, 5 `react-hooks/purity`, 5
`react-hooks/static-components`, and 7 others. The first two groups are cosmetic and safe; the `react-hooks`
ones touch live components and deserve their own pass.

### 4. `/api/health` — permanently "degraded", so the field carried no signal

**Root cause:** any dep in state `unconfigured` degraded the overall verdict. With Resend deliberately not
wired, the endpoint answered `"status":"degraded"` on every single call — the field could never change, so no
monitor could tell a known-missing integration from something newly broken. A permanently-degraded health
check is precisely the lie monitor the file's own honesty rule exists to prevent.

**Fix:** `unconfigured` is still reported per dep (nothing hidden), but only a **configured** dep actually
failing degrades the overall verdict; db failure still returns 503. This also matches the convention already
in Optimo and SeizeLead, where unconfigured never flips the verdict. Prod now returns `"status":"ok"` with
`resend: unconfigured` still visible.

**Verify:** `npx vitest run` → **121/121 passing** (+4 new for the dead-symbol classifier); `npx tsc --noEmit`
→ 0 errors; `npm run build` → compiled successfully; `npx eslint` → clean on all changed files.

**Not deployed** — needs founder "go".

## 2026-08-19 · fix(gmp): multi-source failover — GMP stopped updating for a whole day when one site went down

**Symptom:** `gmp_tracker` failed every run from 06:50 UTC on 2026-08-19 (`error=fetch failed`, then
`error=IPO Watch GMP page returned HTTP 522` at 10:50 and 14:50). Grey Market Premium — the number retail
investors check most before applying to an IPO, and the thing our GMP chart is built on — showed nothing new
for the day. The last good run was 02:50 UTC (`rowsIn=17`).

**Root cause:** the job had exactly one hardcoded source, `ipowatch.in`. That site's Cloudflare edge was
returning 522 (its origin was unreachable — verified from the server: 522 after a 19.5s wait). Nothing was
wrong on our side, but a single hardcoded upstream is a single point of failure on the product's most
important feature, and it had no fallback and no degraded mode: source down = feature dead.

**Fix:** fetching + parsing moved out of the cron job into `src/lib/scrapers/gmp-sources.ts`, which holds an
ordered list of sources and tries each until one yields rows:
  1. `ipowatch.in` — unchanged, still first.
  2. `ipoji.com` — new. Server-rendered table, absolute dates, verified live from the server the same day
     (HTTP 200, 22 rows, timestamps current to the hour).
A source is treated as broken — and skipped — if it 5xx's, times out, throws, *or* loads but parses to zero
rows (a silent layout change is a failure, not a successful empty run). Only when every source fails does the
job throw, with each source's reason in the message, so the crawler-health heartbeat still flags a real
outage instead of the job quietly reporting success. The winning source's name is written to `ipo_gmp.source`,
so any row's origin stays auditable.

**Second bug found while writing the tests (sign inversion):** GMP cells were matched with `/-?\d+/` *after*
only stripping commas, so on `-₹5` the minus is not adjacent to the digit — the regex skipped it and stored
**+5**. That inverts the sign on exactly the IPOs where a negative GMP is the entire signal (a discount, i.e.
the market expecting a listing below issue price). Currency symbols are now stripped before matching
(`parseSignedNumber`). Both parsers share it.

**Also:** `ipoji.com` glues name + type + status into one cell ("Shankesh Jewellers IPO Mainboard Open"), so
the parser peels the trailing status, type and "IPO" back off — otherwise no scraped name would ever match an
IPO in our DB and every row would land as `unmatched`.

**Verify:**
- `npx vitest run` → **117/117 passing** (was 98; +19 new in `tests/unit/gmp-sources.spec.ts`), covering both
  parsers against captured fixtures, the sign bug, both date formats, and all four failover paths
  (5xx → next source, zero-rows → next source, throw → next source, all-fail → throws with every reason).
- `npx tsc --noEmit` → 0 errors. `npm run build` → clean.
- Real `ipoji.com` HTML captured from the server as a fixture; parser output verified by hand against the live
  page (4 of 8 rows carry a quoted GMP; the 4 showing "—" are correctly skipped).

**Not done:** not deployed — needs founder "go". Until it ships, GMP stays stale whenever ipowatch is down.

**Pre-existing issue found, not fixed (out of scope):** `npm run lint` / `npx eslint <any file>` crashes with a
circular-reference error in `@eslint/eslintrc` config validation. Reproduced on files this change never
touched, so it predates it — the lint gate is currently not running at all for this project.

## 2026-08-15 · security(critical): next-auth CVE patch (GHSA-8fpg-xm3f-6cx3 auth-fail-open + GHSA-7rqj-j65f-68wh email homoglyph bypass)

**Symptom / risk:** `next-auth` was pinned to `^5.0.0-beta.30`, a version affected by two disclosed CVEs — an
auth-fail-open condition and an email-homoglyph account-takeover bypass in `@auth/core`. This CVE was
already patched fleet-wide in 7 other repos (SignalDrop, SeizeLead, ToolsTalky, DIYPR, Optimo, Mailprobe,
LaunchKit, HireTrack) using the same fix pattern.

**Root cause:** `next-auth@5.0.0-beta.30` transitively pinned `@auth/core@0.41.2` (the vulnerable version).
`@auth/prisma-adapter@2.11.2` independently pinned the same old `@auth/core@0.41.2`, so bumping `next-auth`
alone would not have deduped the fix — the adapter needed its own bump too (matches the pattern seen in the
other 7 repos this week).

**Fix:** bumped `next-auth` to `5.0.0-beta.32` and `@auth/prisma-adapter` to `2.11.3` in `package.json`. Ran
`npm install`; `npm ls @auth/core --all` confirms a single deduped `@auth/core@0.41.3` (patched) resolution
across both `next-auth` and `@auth/prisma-adapter` — no second, older copy hanging around.

**Verification (real, not assumed):**
- `npm audit --audit-level=high` — zero `next-auth` / `@auth/core` findings (previously present). 11
  unrelated pre-existing HIGH/CRITICAL findings remain (next.js core, sharp, undici, postcss, form-data,
  js-yaml, nanoid, brace-expansion) — out of scope for this fix, already flagged as a known gap in this
  file's 2026-08-14 state note; not touched here.
- `rm -rf .next && npm run build` — clean build, all routes compiled, zero errors.
- `npx tsc --noEmit` — 0 errors.
- `npm test` (vitest) — 98/98 tests passed across 8 files.
- Local dev server (port 3065, local Postgres dev container) login-stack smoke test: `GET /signin` → 200;
  `GET /api/auth/providers` → 200 with correct `credentials` provider JSON; `GET /api/auth/session` → 200
  (`null`, no session, as expected unauthenticated); `GET /api/auth/csrf` → 200 with a token; `GET /sup-min`
  (public login page) → 200; `GET /sup-min/dashboard` and `GET /my/watchlist` (protected routes) → both 302
  (auth gate intact, no `-L`). Zero errors in the dev server log across all of the above.

**Scope note:** this fix was applied and verified locally; commit is local only, **not pushed** — pushing to
`origin/main` is outside standing security-specialist authority (push/deploy require an explicit founder
"go" or `talkytools-deploy`), so it is deliberately withheld pending that authorization.

## 2026-08-14 · fix(critical): `/my/watchlist` crashed for every brand-new user — the page a fresh signup lands on immediately after login

**Symptom:** Confirmed via real-browser synthetic journey test: a freshly signed-up user with zero watchlist
items landed on `/my/watchlist` and got a server error screen ("Something went wrong... Reference: ...").
Browser console showed `Error: An error occurred in the Server Components render` — twice.

**Root cause:** `src/components/shared/EmptyState.tsx` had a `"use client"` directive, making it a Client
Component. Both `src/app/my/watchlist/page.tsx` and `src/components/ipo/IpoTable.tsx` are Server Components
that render it with `icon={Bookmark}` / `icon={Star}` / `icon={TrendingUp}` — a Lucide icon is a
function/forwardRef component, not a plain serializable value. Passing a non-serializable value from a
Server Component across the React Server Components boundary into a Client Component throws
`Error: Functions cannot be passed directly to Client Components...` at render time. This fired on
`/my/watchlist` specifically because it's the very first authenticated page every new signup hits, and a
fresh account always has an empty watchlist — which is exactly the code path (`ipos.length === 0` /
`stocks.length === 0`) that renders `<EmptyState icon={...} .../>`. Reproduced locally: dev server log showed
`⨯ Error: Functions cannot be passed directly to Client Components...` for both the `Bookmark` and `Star`
icons on every `GET /my/watchlist` for a fresh account (matches the "twice" the browser console showed).

**Fix:** removed the `"use client"` directive from `src/components/shared/EmptyState.tsx`. The component has
no hooks/state — it's pure presentation with an optional `onClick` prop — so it renders correctly as either a
Server or Client Component depending on where it's imported. This removes the serialization boundary
entirely for the Server Component call sites (`my/watchlist/page.tsx`, `ipo/IpoTable.tsx`, which had the
identical latent bug on any empty IPO list) while leaving the one Client Component call site
(`app/news/NewsClient.tsx`, which passes a real `onClick` function) working unchanged, since it's already
inside a client-rendered tree.

**Verification (real, not assumed):** local dev server against local Postgres — created a fresh account via
`POST /api/signup`, signed in via NextAuth credentials flow to get a real session cookie, hit
`/my/watchlist` before and after the fix. Before: dev log showed
`⨯ Error: Functions cannot be passed directly to Client Components... render: function Bookmark` /
`...function Star`, RSC payload showed the error digest embedded in the HTML. After: `HTTP 200`, RSC payload
contains `"No IPOs saved yet"` / `"No stocks saved yet"` empty-state copy, zero errors in the dev log. Fully
repeated end-to-end with a SECOND brand-new account after `rm -rf .next` (clean rebuild, no cache carryover)
— same clean result. `npx tsc --noEmit` — 0 errors. `npm run build` — `✓ Compiled successfully in 12.4s`.

**Also checked (documentation staleness, not fixed here — out of this project's workspace boundary):**
`_shared/FLEET_INVENTORY.md` lists IPOpulse's protected route as `/advisor/dashboard`. Confirmed
`/advisor/dashboard` is a real, separate route (not stale/removed) but 404s by design — it's gated behind
the `advisor.enabled` feature flag (`src/lib/feature-flags.ts`), which defaults OFF (`defaultEnabled: false`)
and is a whole separate advisor/referral-affiliate feature, not the general post-login landing page. The
actual universal protected route every logged-in user reaches is `/my/watchlist`. Flagging for whoever
maintains `FLEET_INVENTORY.md` to correct — did not edit that shared file from this session per the
IPOpulse workspace boundary (only edit files inside `IPOpulse/`).

## 2026-08-12 · feat(ai): per-product AI-provider setting (Subscription CLI vs API key), fail-closed — B.20 policy change

**Root cause / why:** platform policy change (AGENT_OPERATING_STANDARDS.md B.20, 2026-08-12): 5 TalkyTools
products shared one `ANTHROPIC_API_KEY` in `.env`, it silently hit its usage cap, and there was no
visibility into which product caused it. Every product now defaults to the founder's Claude subscription
(fixed cost, no per-token billing) via the local `claude` CLI, with per-token API billing only switched on
explicitly per product via an admin-pasted key — never auto-picked up from `.env`. IPOpulse's
`ANTHROPIC_API_KEY` was already removed from the server `.env` (done outside this change).

**What changed:**
- New `src/lib/ai-provider-setting.ts` — reads/writes `ai_provider_mode` ("subscription" default | "api_key")
  and the encrypted Anthropic key, reusing the EXISTING generic `settings` key-value table (same one
  `kite_access_token`/`fyers_access_token` already use — no new table, no migration needed) and the existing
  `encrypt.ts` AES helper (same one broker tokens use).
- New `src/lib/ai-errors.ts` — typed `AiError` (`rate_limit | timeout | auth | unavailable | unknown`),
  `friendlyAiError()`, `aiErrorStatus()`, `mapAnthropicApiError()`.
- `src/lib/claude-runner.ts` rewritten to be provider-gated: mode "subscription" tries the CLI ONLY and
  fails closed (never falls through to any API key, even a saved one, even one lingering in `.env`); mode
  "api_key" uses the Anthropic SDK ONLY with the DB-saved key (lazy-loaded, never `process.env.ANTHROPIC_API_KEY`)
  and fails closed if no key is saved. `callViaApi()` resolves the model from `ANTHROPIC_MODEL` env (Haiku-class
  default, `-latest` alias — never a hardcoded dated id), sets `max_tokens` (default 4096) and a 60s timeout,
  and maps SDK errors to typed `AiError`s (401/403→auth, 429→rate_limit with retry-after when present,
  timeout→timeout).
- `src/lib/drhp-analyzer.ts` (`analyzeDrhpViaClaudeCli`) and `src/app/api/drhp/analyze/route.ts` gated to
  Subscription mode only — both ask Claude to fetch a live PDF URL, which only the CLI's own tool-use loop
  can do; the plain Anthropic Messages API has no fetch tool wired up here, so api_key mode fails closed with
  an honest message instead of silently returning a broken "I can't access external URLs" answer.
  `src/crons/jobs/drhp-analyze.ts` checks the mode up front so a run under api_key mode skips cleanly with one
  note instead of marking every candidate IPO "failed".
- New admin UI: `/sup-min/ai-settings` (`src/app/sup-min/ai-settings/page.tsx` + `AiSettingsClient.tsx`,
  server-guarded like `/sup-min/kite-token`) — radio toggle Subscription/API key, masked key input, "•••• saved"
  state (never re-renders the raw key), tile added to `/sup-min/dashboard`.
- New `src/app/api/admin/ai-settings/route.ts` (GET status incl. live CLI-found check, POST to switch mode
  and/or save a key) — role-gated (admin/superadmin), and a pasted key is validated with a tiny live
  `messages.create` test call BEFORE it is encrypted and stored, so a bad paste is rejected immediately
  instead of silently "saving" and failing on the next real user request.
- `/api/health` — the `anthropic` check now reflects the CURRENT provider setting (CLI found in subscription
  mode / key saved in api_key mode) instead of a bare `ANTHROPIC_API_KEY` env-var presence check.
- The 4 live AI routes (`concall/summarize`, `promoter/check`, `drhp/ask`, `drhp/analyze`) and the 3
  "AI not configured" UI surfaces (`tools/concall-summary`, `tools/promoter-check`, `ipo/drhp`) now check
  `claudeAvailable()` (the real, current provider state) instead of `!!process.env.ANTHROPIC_API_KEY`, and use
  `friendlyAiError()`/`aiErrorStatus()` for typed, honest error messages (429 for rate limit, 504 for timeout,
  503 for unavailable/auth) instead of a flat "AI request failed" 500. `recordSpend()` calls now log the
  actual provider used (`claude-cli` vs `claude-api`) instead of a hardcoded `"claude-cli"`.
- `.env.example` — `ANTHROPIC_API_KEY` line removed with a comment explaining it's no longer read at all;
  the provider is a runtime DB setting now.
- **Note:** there is a separate, pre-existing, UNRELATED per-user BYOK feature at `/api/settings/ai` +
  `src/lib/byok.ts` + `src/components/AISettings.tsx` (rendered on `/my/account`) that lets an individual
  signed-in user connect their OWN Anthropic/OpenAI/Gemini key on the `User` model. It is dead-wired (`callUserAI`
  is exported but not called from any live AI route) and untouched by this change — different feature,
  different table, different purpose (customer BYOK vs platform billing-path control).

**Verified (local only — no deploy):**
- `npx tsc --noEmit` → 0 errors. `npm run build` → compiles clean (Next 16 route-type validation passes;
  the only errors during build were pre-existing "can't reach DB" static-generation warnings because no local
  DB was running at that point, unrelated to this change).
- Ran against a real local Postgres (`docker-compose.dev.yml`) with `prisma db push` confirming NO schema
  drift (no migration needed — reused the existing `settings` table). A direct script exercised
  `ai-provider-setting.ts` + `claude-runner.ts` against the live DB: default mode is `subscription`;
  encrypt/decrypt round-trips correctly; switching to `api_key` mode with no key saved makes
  `claudeAvailable()` report `{available:false}` and `callClaude()` throw `ClaudeUnavailableError` (fail
  closed, confirmed it never reads any API key or falls through); saving then clearing a key round-trips
  the masked status correctly.
- Ran the actual dev server end-to-end: `/api/health` anthropic check flips `ok`→`unconfigured` live when
  switching modes in the DB; `/sup-min/ai-settings` and `/api/admin/ai-settings` correctly redirect/403
  unauthenticated; `/tools/concall-summary`, `/tools/promoter-check`, `/ipo/drhp` correctly show the
  "currently unavailable" banner when api_key mode has no key saved, and show no banner (AI enabled) back
  in default subscription mode with the CLI present on this machine.

**Out of scope / not done:** deploy (awaiting founder "go" — someone else handles it per task boundary);
did not touch the unrelated per-user BYOK feature; did not attempt to give api_key mode PDF-fetching parity
with the CLI (would need a real tool-use loop — separate, larger piece of work if ever wanted).

## 2026-08-12 · fix(og): /ipo/[slug] Open Graph image — await params (Next 16) + Satori multi-child div

**Two bugs in one code path; the second was hidden by the first.**

**Bug 1 — params not awaited:** `src/app/ipo/[slug]/opengraph-image.tsx` typed `params` as a
plain object and read `params.slug` synchronously. Under Next 16 `params` is a Promise, so
`slug` was `undefined` → `prisma.ipo.findUnique({ where: { slug: undefined } })` rejected →
the route's `.catch(() => null)` swallowed it → EVERY `/ipo/[slug]` URL (and Twitter/X, which
falls back to the OG image since there is no `twitter-image.tsx`) rendered the generic
"IPOpulse" card instead of the IPO-specific one. Not a 500 and not deploy-blocking (Next does
not type-check opengraph-image routes, so `next build` passed) — but degraded every
social/SEO preview.

**Bug 2 — Satori multi-child div (previously invisible):** because Bug 1 meant the rich-card
branch never executed (always fell back), a latent error in the dates strip was masked:
`<div>📅 Opens {fmtDate(...)}</div>` has two children (text + value) with no explicit
`display`, which Satori rejects ("Expected <div> to have explicit display: flex … if it has
more than one child node"). Fixing Bug 1 alone would have turned "generic image (200)" into a
500 for every real IPO — a regression. Only a live render against a seeded IPO exposed it;
tsc and `next build` both passed clean.

**Fix:** (1) `params: Promise<{ slug: string }>` + `const { slug } = await params;` mirroring
the sibling `page.tsx`; log the catch instead of swallowing it. (2) the three date divs now
use single-string children with explicit `display: flex`.

**Verified:** tsc 0 errors; `next build` success (OG route is dynamic `ƒ`); live render of a
seeded IPO returns HTTP 200 `image/png` 1200×630 showing the full rich card (name, price band,
GMP, subscription, dates) — dev log shows the 500→200 flip after the Satori fix.

**Lesson:** opengraph-image / metadata image routes are NOT covered by Next 16 build-time
route type validation — a wrong `params` type compiles and ships. Always render dynamic OG
routes against real data; tsc + build are not sufficient. Also corrected `.claude/launch.json`
dev port 3145 → 3065 (matches `next dev --port 3065`).

## 2026-08-11 · fix(infra): Claude CLI auth mount pointed at /root/.claude, container runs as non-root 'app'

**Root cause found via platform log audit:** DRHP AI / Concall AI / daily market summary
were silently failing with "Not logged in · Please run /login" from the `claude` CLI.
docker-compose.yml mounted the host's shared Claude Code credential to `/root/.claude`,
but the Dockerfile (security hardening pass, `useradd -m -u 1001 app` + `USER app`)
runs the app as non-root user `app` with `HOME=/home/app` — so the container was reading
its own empty local `~/.claude` (created by the app itself, no `.credentials.json`) while
the real host credential sat inaccessible at `/root/.claude` (permission denied for `app`).
This has likely been broken since whichever commit added the non-root Dockerfile step.

**Fix:** mount target changed to `/home/app/.claude:rw`, matching the actual container user.

**Caveat:** the shared host credential itself is currently also rejected at the Anthropic
org level ("organization has disabled Claude subscription access for Claude Code") — this
mount fix alone does not restore the AI features; it only removes a second, independent
bug so they'll work once the org-level access is restored. See PayDesk CHANGELOG.md
2026-08-11 entry for the fuller root-cause writeup (same shared credential, same day).

## 2026-06-06 · Root cause: Pass 1 perf agent called nextDynamic({ssr:false}) inside Server Components — Next 16 build fails. Fix: extracted 6 Client Component loader files; pages import from loaders instead.

## 2026-06-06 · perf + seo: Stage 5 — performance optimizations + SEO improvements

### Performance
| # | Optimization | Before | After | Delta |
|---|---|---|---|---|
| 1 | Dynamic import recharts charts (6 components, 4 pages) | Recharts in initial SSR payload on ticker/ipo/fii-dii/stats pages | Recharts loads client-side only (ssr:false) | Removes ~45 KB recharts from initial JS on each page |
| 2 | Cache-Control on /api/news | No cache header (CDN passthrough) | public s-maxage=300, SWR=600 | Reduces origin hits up to 80% on repeated news fetches |
| 3 | Cache-Control on /api/search | No cache header | private max-age=60 | Browser reuses result for 60s per session |
| 4 | Remove unused icon imports (3 icons, 2 files) | TrendingUp, TrendingDown, ArrowLeft imported but unused | Removed | ~1.5 KB gzip saved per page |

### SEO
- /ipo: added openGraph + twitter card + canonical
- /fii-dii: added openGraph + twitter card + canonical + JSON-LD WebPage
- ticker/[slug]: added JSON-LD WebPage + Corporation (tickerSymbol, industry)
- /ipo (hub): added JSON-LD CollectionPage
- calculators/stock-forecast: new layout.tsx with metadata (client component)
- sitemap.ts: added /buybacks + /pricing (were missing)
- corporate-actions/page.tsx: added canonical URL

### DB indexes reviewed
- Existing indexes confirmed sufficient for all hot queries (fii_dii_daily, bhavcopy_daily, alerts, watchlist_items)
- ILIKE searches on Ipo.name + Company.name: B-tree indexes do not help; pg_trgm would require schema migration — skipped (LESSON applied)

**TypeScript: 0 errors before and after all changes.**

## 2026-06-06 · feat(ux): Stage 4 customer polish — empty states, loading states, error boundaries, onboarding, mobile, microcopy

### Hypothesis: users hitting empty/loading/error states with no direction will drop. Polished states reduce bounce and increase first-session depth.
### Metric to watch: pages/session on first visit, signup-from-IPO-hub rate.

**Empty states (12 instances improved):**
- `IpoTable` — replaced generic `<p>` with `EmptyState` component (icon, description, CTA to /ipo). Applies to live, upcoming, closed, listed, SME sections.
- `my/watchlist` — IPOs section: EmptyState with "Save an IPO and we'll track its allotment date, listing day, and GMP." Stocks section: EmptyState with CTA to screener. Previously both were bare `<p>` with no CTA.
- `deals/bulk`, `deals/block` — replaced bare text with structured empty state (bold title + plain-English explanation of when data appears).
- `fii-dii` — "Today's data isn't available yet" + explains 7 PM IST publishing schedule.
- `insider-trading` — "No insider trades reported this period" + explains 1-2 day disclosure lag.
- `news/NewsClient` — uses shared `EmptyState` component instead of bare text.

**Loading states (8 added):**
- `ipo/loading.tsx` — skeleton for stats row + 3 table sections.
- `fii-dii/loading.tsx` — skeleton for stat cards + chart placeholder.
- `insider-trading/loading.tsx` — skeleton for stat cards + two table sections.
- `deals/bulk/loading.tsx`, `deals/block/loading.tsx` — table skeleton.
- `my/watchlist/loading.tsx` — card grid skeleton.
- `my/applications/loading.tsx` — stat cards + table rows skeleton.
- `news/NewsClient` — replaced manual pulse divs with shared `SkeletonLoader`.

**Error boundaries:**
- `src/components/AsyncErrorBoundary.tsx` — new reusable React class error boundary. Shows "We couldn't load [section]. Try again" with Retry button. No stack traces exposed.
- `src/app/error.tsx` — removed `error.message` leak (was exposing internal error text). Now shows reference digest only. Indigo Tailwind buttons.

**Onboarding:**
- `IpoHubOnboarding` — 3-step dismissible checklist added to IPO hub page. Steps: Browse open IPOs → Save to watchlist → Check allotment. Persisted in localStorage, hidden once dismissed.
- Watchlist page already had `OnboardingChecklist` — preserved.

**Mobile (375px):**
- `my/applications` — added mobile card view (`sm:hidden`) alongside desktop table (`hidden sm:block`). Cards show name, status badge, applied date, lots, allotment date, and allotment link. Table was 6 columns — unreadable on mobile.

**Microcopy:**
- `insider-trading` — expanded SAST → "Substantial Acquisition of Shares and Takeovers (SAST)"; KMP → "Key Managerial Personnel (KMP)".
- `fii-dii` — stat card titles: "FII net (today)" → "Foreign (FII) net today" for first-time users.
- `error.tsx` — removed "500" banner number, replaced with human copy.
- Removed emoji from insider trading section headers (B2B rule).

**0 TypeScript errors after all changes.**

## 2026-06-06 · test: add Vitest unit + integration test suite — 89 tests, 0 failures
- Installed vitest + @vitest/coverage-v8 as devDeps. Added vitest.config.ts with @/* path alias.
- Added `npm test` and `npm run test:coverage` scripts to package.json.
- Unit tests (pure functions, zero DB):
  - tests/unit/calculators.spec.ts — 31 tests covering sipCalc, lumpsumCalc, emiCalc, fdCalc, ppfCalc, hraCalc, inflationCalc, mfReturnsCalc, ltcgStcgCalc, taxCalc, swpCalc, rdCalc, goalCalc, npsCalc
  - tests/unit/format.spec.ts — 11 tests for formatCurrency (Indian locale), formatPercent, formatPlain, formatByType
  - tests/unit/rate-limit.spec.ts — 10 tests for rateLimit() (isolation, remaining, blocking) + clientIp()
  - tests/unit/feature-flags.spec.ts — 8 tests for FLAG_DEFINITIONS integrity (uniqueness, valid categories, non-empty keys)
- API integration tests (mocked Prisma + auth via vi.hoisted):
  - tests/unit/api-alerts.spec.ts — 6 tests: 401 unauthed, 400 invalid input, 409 duplicate, 201 created
  - tests/unit/api-signup.spec.ts — 6 tests: 400 bad input, 409 duplicate, 200 created, lowercase email, 429 rate-limit
  - tests/unit/api-watchlist.spec.ts — 7 tests: POST + DELETE auth guard, slug regex, upsert/delete
- tests/README.md: documents how to run, what's mocked, env vars needed
- Coverage: format.ts 100%, calculators/math.ts 65.9%, rate-limit.ts 72.2%, API routes well-covered
- Root cause note: vi.mock factory hoisting requires vi.hoisted() for module-level variables (LESSON applied)

## 2026-06-06 · fix(types): clear all 14 TS errors — stale Prisma client + field name mismatches
- Root cause: Prisma client was never regenerated after DataDeletionLog, AiSpendLog, and User.deletedAt were added to the schema. Server Dockerfile already runs `prisma generate` so prod was unaffected.
- Fix 1 (HIGH): account/export/route.ts — WatchlistItem has no `ipoId` field; replaced with `type + targetSlug`. IpoApplication field `lots` → `lotsApplied`.
- Fix 2 (refactor): ipo/[slug]/page.tsx — replaced 10x unsafe `as never` casts on Prisma Json? fields with explicit `as unknown as DrhpAnalysis[field]|null` (imports DrhpAnalysis + EnrichedPeer types).
- Fix 3 (refactor): ai-budget.ts — added explicit `(s: number, l: { costInr: number })` types to reduce() callbacks.
- TS before: 14 errors. TS after: 0 errors. npm run lint: pre-existing circular JSON error in ESLint config (not introduced here).

## 2026-06-06 · feat(ai-budget): superadmin email exemption from ₹1.5K/month AI cap
- Root cause gap: superadmin/founder emails were hitting the same budget cap as regular users.
- Fix: `checkBudget()` does `prisma.user.findUnique` first; if email is in `AI_BUDGET_EXEMPT_EMAILS` env var, returns `{allowed:true, remaining:MAX_SAFE_INTEGER}` unconditionally.
- Default exempt list: `shubham@startuptalky.com,superadmin@startuptalky.com`. Override via env.
- Note: pre-existing TS errors in this file (`aiSpendLog` not in Prisma schema) are unrelated.

## 2026-06-06 · fix: /api/health — enumerate deps with {ok|unconfigured|fail}
- Replaced bare `{status:"ok"}` with canonical 3-state pattern.
- Checks: db (SELECT 1 + latency), kite (env-presence), anthropic (env-presence), resend (env-presence).
- DB fail → 503 unhealthy; unconfigured deps → 200 degraded; all ok → 200 ok.
- Cache-Control: no-store added. LESSON-039 fix.

## 2026-05-30 · (sha ae76f32) fix(sec): patch HIGH axios vuln 1.15.2→1.16.1 — root cause: 4 axios advisories (NO_PROXY bypass + prototype-pollution header injection/DoS/MITM). Non-force `npm audit fix`, within ^1 semver, build green.

## 2026-05-25 · (sha 1b8cad9) fix(docker): use UID 1001 to avoid conflict with node user
## 2026-05-25 · (sha a4be6a2) fix(lock): regenerate package-lock.json after @playwright/test add
## 2026-05-25 · (sha 17bd41f) fix(docker): replace wget healthcheck with Node fetch probe
## 2026-05-25 · (sha 0ee7a0c) feat(IPOpulse): add Playwright smoke test (homepage hydration + login)
## 2026-05-25 · (sha 573acb9) security(IPOpulse): add auth endpoint rate limit
## 2026-05-25 · (sha 64cd10f) feat(IPOpulse): add canonical URL meta for SEO
## 2026-05-25 · (sha 165f261) security(ipopulse): drop to non-root user in container
## 2026-05-23 · (sha 49a6ba9) Fix price-range pages: query bhavcopy first for under-100/50/penny
## 2026-05-23 · (sha 22b9394) Fix: show non-price pages even when LTP is missing from bhavcopy
## 2026-05-23 · (sha 7eb132c) fix: use prisma db push in entrypoint (no migration files in project)
## 2026-05-23 · (sha f00c478) feat: add WhatsApp channel CTA banner to homepage, IPO pages, pricing
## 2026-05-23 · (sha fa9777d) feat: add IPO alert cron — checks conditions every 2h, sends Resend email
## 2026-05-23 · (sha cdd6883) feat: free vs premium tier — Plan enum, pricing page, PremiumGate, alert gate
## 2026-05-21 · (sha de2af35) feat: Best Stocks SEO hub — 10 curated DB-driven lists
## 2026-05-21 · (sha 887be7a) fix: rename middleware.ts → proxy.ts (Next.js 16 convention for standalone builds)
## 2026-05-21 · (sha 0fc3e27) fix: Next.js 16 standalone + middleware build bug
## 2026-05-21 · (sha 3ef37c4) fix: remove duplicate force-dynamic exports from page files
## 2026-05-21 · (sha 45f2128) fix: force-dynamic on / to prevent build-time DB query failures
## 2026-05-19 · (sha 9d1e426) feat: user accounts + IPO alerts (Auth.js v5 + Alert model)
## 2026-05-19 · (sha e013dbd) fix: use Claude CLI for all AI features
## 2026-05-18 · (sha a88198a) fix: use native fetch in byok.ts — removes @anthropic-ai/sdk and openai import deps
## 2026-05-18 · (sha 88f9608) fix: lazy ENCRYPTION_KEY init + force-dynamic on AI settings route
## 2026-05-18 · (sha db96851) feat: add BYOK AI settings (Anthropic + OpenAI + Gemini)
## 2026-05-18 · (sha 76bb1d4) fix: guard IPO slug undefined Prisma error + add 4 new pages to sitemap (news, promoter screener, FORE calc, dividend yield)
## 2026-05-18 · (sha 4259593) fix: upgrade Next.js to 16.2.6 (0 high vulns)
## 2026-05-17 · (sha 87f4f62) fix: remove illegal metadata export from client component + add layout.tsx for screener/promoter SEO
## 2026-05-17 · (sha 414952e) feat: dividend stocks page + daily summary enrichment + 50 more company descriptions
## 2026-05-17 · (sha 52c5136) feat: 10 more learn articles (55 total) — CIBIL, SWP, ITR, NFO, Arbitrage, ELSS vs PPF vs NPS, T-Bill, Contra Fund, Quarterly Results, International Funds
## 2026-05-17 · (sha 64227ea) feat: promoter >45% screener page + nav link
## 2026-05-17 · (sha d247435) feat: add live news feed + fetchLatestNews() to homepage — shows 6 latest headlines from Google News RSS in 2-column card
## 2026-05-17 · (sha ff71b85) feat: add Market News, FORE Calculator, Dividend Stocks, Financial Twitter to homepage module grid; update calc shortcuts and stats
## 2026-05-17 · (sha d63e2e9) feat: screener preset screens + FORE calculator + 52W Low/High sort
## 2026-05-17 · (sha 89e129d) feat: news hub with 6 category RSS feeds + Financial Twitter India directory
## 2026-05-17 · (sha 0336880) feat: add security standard to CLAUDE.md — 8 non-negotiable rules + weekly scan
## 2026-05-17 · (sha a1f55e7) feat: add online research task to CLAUDE.md — agents research competitor feedback before building
## 2026-05-17 · (sha 105a8a3) feat: add Apify scraping standard to CLAUDE.md
## 2026-05-16 · (sha fee7208) feat: add autosave standard to CLAUDE.md — platform-wide mandate
## 2026-05-16 · (sha 691389d) feat: real-time data enrichment — Kite live prices + Yahoo v8 fix + faster crons
## 2026-05-16 · (sha d960c3e) fix: add force-dynamic to learn/[slug] so new articles work without rebuild
## 2026-05-16 · (sha ab3f947) feat: 8 new learn articles (45 total) — stocks beginner guide, circuit limits, EPS, candlesticks, smallcase, pledge shares, SEBI, diversification
## 2026-05-16 · (sha 0f40ba7) fix: Lighthouse issues — contrast ratio, robots.txt host directive removed, add llms.txt for AI crawlers
## 2026-05-11 · (sha 169650e) feat: super-investor smart money activity feed + conviction buys + fix seed data labels
## 2026-05-10 · (sha 26d96dd) fix: .claude mount :ro → :rw so CLI can auto-refresh OAuth token
## 2026-05-09 · (sha 1b75f45) fix: exclude scripts/ from Next.js TS compilation (seed scripts use null)
## 2026-05-09 · (sha fe701ce) fix: replace all dev-speak placeholder messages with professional empty states
## 2026-05-09 · (sha dbb526f) feat: add /api/health + robots.txt + sitemap/privacy where missing
## 2026-05-09 · (sha e917f3a) fix: screener sort — replace Infinity with concrete fallbacks to avoid JS comparison edge cases
## 2026-05-09 · (sha 02cc845) feat: stock comparison, MF screener, rights/bonus tracker, shareholding
## 2026-05-09 · (sha cbd554d) feat: REIT/InvIT tracker, SGB tracker, NCD tracker
## 2026-05-09 · (sha 030a142) feat: capital gains calculator, F&O expiry calendar, economic calendar


> **Read last 10 entries before starting any work. Every fix and root cause is documented here.**


All notable changes to IPOpulse are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/)

---

---

## 2026-05-23 IST

### Added
- `Plan` enum (`FREE | PREMIUM`) + `planExpiresAt DateTime?` on `User` model in `prisma/schema.prisma`. Run `prisma db push` on the server after deploy.
- `/pricing` page (`src/app/pricing/page.tsx`) — two-column FREE | PREMIUM layout, Indigo theme, Razorpay "Coming soon" CTA disabled.
- `PremiumGate` component (`src/components/PremiumGate.tsx`) — wraps premium-only UI; shows lock icon + "Upgrade to Premium" link to `/pricing` when `isPremium` is false.
- IPO detail page (`src/app/ipo/[slug]/page.tsx`) — fetches `plan` + `planExpiresAt` from DB, derives `isPremium`, wraps `SetAlertButton` in `PremiumGate`.
- "Pricing" link added to Nav desktop right-side actions.

### Notes
- TypeScript: 0 errors (`npx tsc --noEmit` clean).
- Razorpay integration deferred — Premium CTA is disabled with "Coming soon".

---

## 2026-05-21 IST

### Fixed
- Docker build crash `ENOENT: middleware.js.nft.json` (Next.js 16.2.6 + `output: "standalone"` + root `middleware.ts`). Root cause: Next 16 build code (`node_modules/next/dist/build/index.js` ~line 2520) renames `proxy.js.nft.json` → `middleware.js.nft.json` for the new `proxy.ts` convention; when the NFT trace file is absent the rename/readFile pair throws. The previous local-only patch to node_modules didn't propagate into Docker (fresh `npm install`). Fix: added `scripts/patch-next-middleware-nft.js` (idempotent, marker-tagged) and a `RUN node scripts/patch-next-middleware-nft.js` line in the Dockerfile builder stage, between `prisma generate` and `npm run build`. Patches wrap the rename block in a try/catch that swallows ENOENT, and short-circuit `handleTraceFiles` when the trace file is missing. Do NOT: remove `output: "standalone"` (breaks the runner stage which copies `.next/standalone`). Verified locally: `npm run build` completes and produces `.next/standalone/`.

---

## 2026-05-17 IST

### Fixed
- CI lint errors — Root cause: react-hooks rules flagging valid patterns, no-unescaped-entities on JSX text — Do NOT: add --force flag to disable all lint, fix rules properly in eslint.config.mjs

### Standard
- Autosave spec: /Users/shubhamkumar/Desktop/Claude Code/_shared/AUTOSAVE_SPEC.md
- Apify spec: /Users/shubhamkumar/Desktop/Claude Code/_shared/APIFY_SPEC.md
- Research task: /Users/shubhamkumar/Desktop/Claude Code/_shared/RESEARCH_TASK.md
- QC checklist: /Users/shubhamkumar/Desktop/Claude Code/_shared/QC_CHECKLIST.md

### Warning for future agents
- Smoke test: `bash /home/ubuntu/scripts/smoke-test.sh IPOpulse 3065`
- Safe deploy: `bash /home/ubuntu/scripts/safe-deploy.sh IPOpulse 3065`

## [Unreleased]

### Added
- `Alert` model in Prisma schema — saves user IPO alerts with type, threshold, ipoSlug, isActive, firedAt fields
- `GET /api/alerts` — list authenticated user's active alerts
- `POST /api/alerts` — create alert (auth required), supports types: gmp_threshold | allotment | listing | subscription_open | subscription_close
- `DELETE /api/alerts/[id]` — soft-delete alert (marks isActive=false, auth required, ownership checked)
- `middleware.ts` — explicit Next.js middleware consolidating all route protection: `/sup-min/`, `/dashboard/`, `/my/`, `/api/alerts/` routes
- `SetAlertButton` component (`src/components/ipo/SetAlertButton.tsx`) — bell icon button with modal to choose alert type + GMP threshold input; redirects to /signin if not logged in
- `/login` redirect page → `/signin` (alias for compatibility)
- `/register` redirect page → `/signup` (alias for compatibility)

### Changed
- Moved auth route protection from `authConfig.authorized` callback to explicit `middleware.ts` — cleaner separation and allows `/api/alerts` route protection
- IPO detail page: added "Set Alert" button alongside Watchlist and Track Application buttons
- `User` model now has `alerts Alert[]` relation

### Fixed
- Pre-existing build bug: Next.js 16 Turbopack + `output: standalone` failed with `ENOENT: middleware.js.nft.json` — patched `node_modules/next/dist/build/utils.js` and `index.js` to handle missing NFT file gracefully when Turbopack is used (Edge middleware has no NFT tracing). This is a macOS/local-only fix; Docker/Linux builds work correctly via webpack.

---

## [0.6.0] — 2026-04-26 — Master Hub Standardization v3

### Added
- Standard `/privacy`, `/terms`, `/refund` legal pages with IPOpulse-specific content.
- `/api/health` endpoint for Docker healthcheck and uptime monitors.
- Cookie consent banner (`<CookieConsent />`) for GDPR + India DPDP compliance.
- `EmptyState` shared component with product context, CTA, and help link.
- Shared TalkyTools family row in the footer.
- `src/app/robots.ts` (replaces static `public/robots.txt`) — disallows `/sup-min`, `/api/`, `/my/`, `/r/`, `/embed/gmp`.
- Twitter Card metadata in root layout.
- IPOpulse-branded `public/favicon.svg`.
- GitHub Actions: `ci.yml` (lint + tsc + build), `security-scan.yml` (npm audit + Trivy + Gitleaks), Dependabot config (weekly npm + monthly GHA + Docker), and `PULL_REQUEST_TEMPLATE.md`.
- HSTS and Permissions-Policy headers in `next.config.ts`.
- Standard `db:reset` and `db:seed` scripts in `package.json`.
- Per-IPO dynamic Open Graph image at `/ipo/[slug]/opengraph-image`.
- Embeddable GMP widget at `/embed/gmp` + docs page at `/embed`.
- Sitemap auto-ping to Google + Bing on cron success, GMP publish, and feature flag flips (1-hour internal throttle).
- Long-form SEO copy (300–500 words) on top 25 calculator + finance category pages.

### Changed
- Seed script now creates the 3 standard TalkyTools accounts:
  `superadmin@ipopulse.com / Shu_bham12!`,
  `admin@ipopulse.com / Admin@2026!`,
  `user@ipopulse.com / User@2026!`.
- `docker-compose.yml`: added `restart: always`, `mem_limit`, `memswap_limit`, `cpus` to both services per `_shared/templates/docker-compose.template.yml`.
- Footer: added `/refund` link in About column and a TalkyTools family row.

### Security
- Added `Strict-Transport-Security` (2-year HSTS with preload).
- Added `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- All admin passwords now stored in `CREDENTIALS.local.md` (gitignored) + 1Password.

---

## [0.5.0] — 2026-04-22 — Round 23–24

### Added
- Real BSE/NSE/AMFI/NSDL data crawlers via cron (replaces seed-only data).
- Advisor / referral program (gated by `advisor.enabled` feature flag, default OFF).
- FAQPage Schema.org JSON-LD on top calculator pages.
- Breadcrumb JSON-LD on every IPO/calculator/finance page.
- Related-pages component for internal linking.
- GA4 + Google Search Console + Bing site verification meta.
- DataDisclaimer banner on illustrative/seed-derived pages.

### Changed
- Feature flag fallback is now fail-closed (`?? false`); previously some flags defaulted to true.

---

## [0.4.0] — 2026-04-18 — Round 21

### Added
- Feature flag system: 14 flag definitions, 60-second in-process cache, admin toggle UI at `/sup-min/feature-flags`.
- Seed script for IPOs, GMP, subscriptions (offline demo data).

### Changed
- BankTalky absorbed: financial-product comparisons moved to `/finance/*`; advisor module integrated into IPOpulse.

---

## [0.1.0] — 2026-03-18 — Initial public preview

### Added
- IPO calendar, allotment tracker, GMP entry workflow.
- 20 financial calculators (SIP, EMI, FD, PPF, Tax, NPS, etc.).
- Sector pages, super-investor tracker, FII/DII flows.
- Indigo-themed UI per shared design system.
