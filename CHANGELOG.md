# Changelog — IPOpulse

> **Read last 10 entries before starting any work. Every fix and root cause is documented here.**


All notable changes to IPOpulse are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/)

---

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
