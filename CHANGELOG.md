# Changelog — IPOpulse

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
