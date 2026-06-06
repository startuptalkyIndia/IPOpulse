# Changelog — IPOpulse

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
