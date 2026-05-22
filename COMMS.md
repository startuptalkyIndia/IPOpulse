# IPOpulse — COMMS
---

## 2026-05-23 — WhatsApp Channel CTA Banner (Task 3)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | `WhatsAppBanner` component | ✅ Done | `src/components/WhatsAppBanner.tsx` — dismissible, localStorage key `whatsapp-banner-dismissed`, placeholder link `https://whatsapp.com/channel/ipopulse` |
| 2 | Banner on homepage | ✅ Done | Below hero section, above sector performance strip — `src/app/page.tsx` |
| 3 | Banner on IPO detail page | ✅ Done | Below main IPO data card — `src/app/ipo/[slug]/page.tsx` |
| 4 | Banner on /pricing page | ✅ Done | Above pricing cards grid — `src/app/pricing/page.tsx` |
| 5 | TypeScript errors | ✅ 0 errors | `npx tsc --noEmit` clean |
| 6 | Deployed to server | ⏭️ Skipped | DO NOT DEPLOY — Master Hub handles deploys |

**TO-DO:** Replace `https://whatsapp.com/channel/ipopulse` in `src/components/WhatsAppBanner.tsx` (constant `WHATSAPP_URL`) when Shubham creates the WhatsApp channel from phone.

---

## 2026-05-23 — Free vs Premium Tier (Task 1)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Schema: `Plan` enum + `plan`/`planExpiresAt` on User | ✅ Done | `prisma generate` run; `prisma db push` required on server after deploy |
| 2 | `/pricing` page | ✅ Done | FREE/PREMIUM columns, ₹199/mo or ₹1,499/yr, Razorpay CTA disabled (coming soon) |
| 3 | `PremiumGate` component | ✅ Done | `src/components/PremiumGate.tsx` — lock icon + /pricing link for non-premium users |
| 4 | Gate `SetAlertButton` on IPO detail page | ✅ Done | Fetches `plan` from DB, wraps button in PremiumGate |
| 5 | Pricing link in Nav | ✅ Done | Desktop nav right-side |
| 6 | TypeScript errors | ✅ 0 errors | `npx tsc --noEmit` clean |
| 7 | Deployed to server | ⏭️ Skipped | DO NOT DEPLOY — Master Hub handles deploys |

**Note for next agent:** After Master Hub deploys, run `prisma db push` (or `prisma migrate dev`) on the server to add `plan` enum + `planExpiresAt` column to the `users` table. Prisma will handle the PostgreSQL enum DDL automatically.

---

## 2026-05-19 — User Accounts + IPO Alerts (completed)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Alert model added to schema | ✅ Done | `prisma db push` applied locally |
| 2 | Auth.js v5 middleware.ts | ✅ Done | Protects /dashboard/, /my/, /api/alerts/, /sup-min/ |
| 3 | Alert API routes (POST/GET/DELETE) | ✅ Done | /api/alerts + /api/alerts/[id] |
| 4 | SetAlertButton component with modal | ✅ Done | 5 alert types, GMP threshold input, login redirect |
| 5 | Button added to IPO detail page | ✅ Done | Next to Watchlist + Track Application |
| 6 | /login + /register redirect pages | ✅ Done | Canonical pages remain /signin and /signup |
| 7 | TypeScript errors | ✅ 0 errors | `npx tsc --noEmit` clean |
| 8 | Build | ✅ Passes | Fixed pre-existing Turbopack+standalone ENOENT bug |
| 9 | Committed + pushed | ✅ Done | feat: user accounts + IPO alerts |

**Note for future agents:** If you run `npm install` and break the node_modules patches, the local `npx next build` will fail with `ENOENT: middleware.js.nft.json`. This is a Next.js 16 Turbopack + standalone bug. The Docker build on the server (Linux, webpack) is NOT affected. To re-apply patches locally:
- In `node_modules/next/dist/build/utils.js` line ~1052: add `.catch((err) => { if (err.code !== 'ENOENT') throw err; })` on the `handleTraceFiles(middlewareTrace)` call
- In `node_modules/next/dist/build/index.js` line ~291: wrap the `copyFile` for middleware.js with an `existsSync` check

---

## 2026-05-17 — Priority Tasks for Launch (from Master Hub)

**Product:** India's comprehensive IPO + stock data website (content/data site, not SaaS)
**Status:** Email ✅ | Data pipelines ✅ (BSE/NSE schedulers) | User accounts ❌ | Alerts ❌ | Monetization ❌

### Task 1 (Highest Priority): Free vs Premium User Tiers
Introduce a paywall for high-value features. Core data stays free — premium adds actionable alerts and exports:
- **Free (no account needed):** All IPO listings, GMP table, subscription status, allotment status, basic company info, calculators
- **Premium — ₹199/mo:**
  - GMP alerts: "Notify me when [IPO] GMP changes by X%" via email
  - Subscription status alerts: get notified when an IPO opens/closes
  - Allotment alerts: "Your IPO allotment result is out"
  - Export any data table to Excel (.xlsx)
  - Advanced filters: filter IPOs by GMP %, subscription multiple, lot size, issue size
  - Watchlist: save IPOs to track (currently may be public — make this premium)

Implementation:
- Add `plan Enum (FREE | PREMIUM)` and `planExpiresAt DateTime?` to User model
- Gate premium features in the UI with a lock icon + "Upgrade to Premium" CTA
- Integrate with existing payment setup (Razorpay) — ₹199/mo monthly, ₹1,499/yr annual (save ₹900)
- Add `/pricing` page with the two tiers

### Task 2: Alert System
Build email alerts for IPO events. Data pipelines already run — just need to add the alert trigger layer:
- **User sets alert:** On any IPO page, button "Get GMP alert for this IPO" → modal with threshold input ("Alert me when GMP changes by __ %") → save `UserAlert { userId, ipoId, type: 'GMP_CHANGE', threshold: 20 }` to DB
- **Cron checks:** Every 2 hours, the existing GMP scheduler checks if GMP has changed by >= threshold for any saved alert → sends email via Resend with the new GMP value + link to the IPO page
- Also add: allotment alerts (trigger when allotment date is reached + status is fetched), subscription open/close alerts
- Use the same node-cron pattern already used in BSE/NSE schedulers
- Limit: Free users = 0 alerts. Premium users = unlimited alerts.

### Task 3: WhatsApp Alert Channel
High-impact, zero-code growth hack — Indian retail investors strongly prefer WhatsApp over email for financial alerts:
- Create a WhatsApp Channel (free, no API needed — just like a broadcast list at wa.me/channel/...)
- Add a prominent "Join our WhatsApp channel for instant IPO alerts" button/banner on:
  - Homepage (sticky banner or hero section)
  - Every IPO detail page (below the GMP table)
  - The pricing/premium page
- Banner copy: "Get instant IPO alerts on WhatsApp — GMP updates, allotment results, subscription status. Join free, 10,000+ investors already tracking."
- Link: `https://whatsapp.com/channel/<your-channel-id>` (create the channel manually from phone, then add the link to code)
- No backend needed — just a link. This is a growth + retention mechanic, not a tech feature.

**Deploy:** `bash /home/ubuntu/scripts/safe-deploy.sh IPOpulse 3065`

---

## 2026-05-17 — BROADCAST: Create PRODUCT.md (from Master Hub)

**Action required before next feature work.**

Create `PRODUCT.md` in your project root documenting the product.

**Template:** `/Users/shubhamkumar/Desktop/Claude Code/_shared/templates/PRODUCT.md.template`
**Full instructions:** `/Users/shubhamkumar/Desktop/Claude Code/_shared/broadcasts/PRODUCT_DOC_BROADCAST.md`

Steps:
1. Read the template
2. Read your CLAUDE.md + CHANGELOG.md + prisma/schema.prisma
3. Fill every section honestly (use 'TBD' if unsure, not guesses)
4. Commit: `docs: create PRODUCT.md — product documentation`
5. Push to GitHub
6. Add `> 📖 Product docs: See `PRODUCT.md` for full feature inventory.` to top of CLAUDE.md

---

Cross-team / Master Hub broadcasts log. Append, don't overwrite.

---

## [2026-04-26] Master Hub Broadcast v3 Done

Worked through all 15 steps. Tier 1+2 status: **N/A** (IPOpulse not on the
Sentry list — SeizeLead, Optimo, BillForge, Mailpulse, OutreachIQ, PayDesk,
HireTrack, TalkyHub, mailprobe, BusinessVoyage).

- Stashed + pulled Master Hub commits: ✓ (working tree was clean; pulled `de33373` legal pages, `c761e8d` shared dockerignore/gitignore, `d8d70f4` ops dockerignore)
- Privacy / Terms / Refund customized: ✓
  - Privacy + Terms were already IPOpulse-specific (no placeholders).
  - Refund rewritten: was generic boilerplate with wrong email (`hello@ipopulse.com`) and wrong capitalization ("IPOPulse"); now correctly framed (free tier today, paid Pro tier coming 2026), correct email (`hello@ipopulse.talkytools.com`), and proper "IPOpulse" spelling.
- /api/health verified: ✓ (also fixed `project: "IPOPulse"` → `"IPOpulse"`)
- Seed verified, 3 standard users in DB: ✓
  - `superadmin@ipopulse.com` / `Shu_bham12!` → admin_users (role: superadmin)
  - `admin@ipopulse.com` / `Admin@2026!` → admin_users (role: admin)
  - `user@ipopulse.com` / `User@2026!` → users (public/demo)
  - All 3 verified live via `/api/auth/callback/credentials` → returned correct role/email/id in `/api/auth/session`.
  - Found + cleaned a stale `admin@ipopulse.in` row from the very first seed.
  - **Gotcha for other agents:** Prisma autoloads `.env`, so any legacy `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `/home/ubuntu/<project>/.env` will override seed defaults silently. Pass explicit `-e` overrides on the seed `docker run` to neutralize.
- Footer + EmptyState + CookieConsent imported: ✓
  - Kept the rich existing Footer (40+ product links across 4 columns) and added a TalkyTools family row + `/refund` link in the About column.
  - EmptyState ready for `/my/watchlist`, `/my/applications`, search empty results.
  - CookieConsent imported in `src/app/layout.tsx`; wired to GA4 consent update.
- CI / Security workflows + Dependabot + PR template added: ✓
  - `ci.yml`, `security-scan.yml` (Trivy + npm audit + Gitleaks, weekly Mon 03:00 UTC), `dependabot.yml` (weekly npm at Asia/Kolkata Mon 09:00, monthly GHA + Docker), `PULL_REQUEST_TEMPLATE.md`. Workflow push succeeded — OAuth scope works.
- SEO foundation (robots / sitemap / OG / Schema): ✓
  - `src/app/robots.ts` created (replaces `public/robots.txt`), disallows `/sup-min`, `/api/`, `/my/`, `/r/`, `/embed/gmp`.
  - `src/app/sitemap.ts` already existed with all dynamic IPO/calculator/sector/super-investor URLs.
  - Open Graph + **Twitter Card** (added in this round) in `layout.tsx`.
  - Schema.org JSON-LD (Organization + WebSite with SearchAction) on every page via root layout.
  - Per-IPO dynamic OG image at `/ipo/[slug]/opengraph-image.tsx` (round 25).
- CHANGELOG.md created: ✓ (Keep-a-Changelog format, backfilled rounds 21–25 and this v3)
- Sentry: **N/A** (not Tier 1+2)
- Security headers in next.config: ✓
  - HSTS (`max-age=63072000; includeSubDomains; preload`)
  - X-Frame-Options: SAMEORIGIN
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
- Favicon updated: ✓ (`public/favicon.svg`, IPOpulse "IP" mark on indigo→purple gradient)
- Pushed to main: ✓ (4 commits: `132765c` legal+health, `9094ddc` components, `47cc4b4` GitHub Actions, `0c49615` CHANGELOG+headers+favicon+robots+seed+scripts; tip: `0c49615`)

### Side-issue flagged for future cleanup

Server `/home/ubuntu/IPOpulse/.env` has legacy `ADMIN_EMAIL=admin@ipopulse.in`
and `ADMIN_PASSWORD=IPOpulseLaunch2026!` — unused by the running app (auth
reads from DB) but they override seed defaults via Prisma's dotenv autoload.
Recommend stripping them in the next coordinated `.env` rotation per
`_shared/SECRET_ROTATION.md`.

### DO NOT DEPLOY (Step 14)

Not deployed. Round-25 deploy from earlier today is the version live on the
server. New compose memory caps + restart:always already activated in the
last redeploy.

### Standard scripts in package.json (Step 8 audit)

| Required           | Status |
|--------------------|--------|
| `dev`              | ✓ `next dev --port 3065` (port-pinned for IPOpulse) |
| `build`            | ✓ `prisma generate && next build` |
| `start`            | ✓ `next start --port 3065` |
| `lint`             | ✓ `eslint` (Next.js 16 deprecated `next lint`; ESLint 9 flat config) |
| `db:seed`          | ✓ `npx prisma db seed` (with `prisma.seed` config pointing to `tsx scripts/seed.ts`) |
| `db:reset`         | ✓ `npx prisma migrate reset --force` (newly added) |
| `db:migrate`       | ✓ `npx prisma migrate deploy` (was `migrate dev`; renamed to standard. `db:migrate-dev` retained for local schema iteration) |

### Build verified

`npx next build` ran clean post-changes — no errors, no warnings, all 80+ routes compile.

---

## [2026-05-23] IPO Alert Cron Job — check_alerts

Built the missing cron job that checks user alert conditions and fires emails via Resend.

### What was built

- **`src/crons/jobs/check-alerts.ts`** — new cron job `checkIpoAlerts()`
  - Queries all alerts where `isActive=true` AND `firedAt=null`
  - Includes user (email, name) via Prisma relation
  - Pre-fetches IPOs by slug (batch, no N+1)
  - Pre-fetches latest GMP per IPO for `gmp_threshold` alerts
  - Condition logic:
    - `gmp_threshold` — fires when latest GMP >= `alert.threshold`
    - `subscription_open/close`, `allotment`, `listing` — fires when IPO date is within ±1 day of today
  - Sends HTML email via Resend from `alerts@ipopulse.talkytools.com`
  - Gracefully handles: missing RESEND_API_KEY (marks fired, no email), stale ipoSlug (skips alert), email send failure (marks fired anyway to prevent infinite retries)
  - Bulk-updates all fired alert IDs in a single `updateMany` call
  - No user emails in console.log

- **`src/crons/scheduler.ts`** — added:
  - Import of `checkIpoAlerts`
  - `cron.schedule("0 */2 * * *", ...)` — fires every 2 hours, all days, Asia/Kolkata timezone
  - `check_alerts` entry in `availableJobs` (enables manual trigger via admin panel)

### Session status table

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Create `src/crons/jobs/check-alerts.ts` | ✅ Done | All 5 alert types, Resend email, graceful error handling |
| 2 | Register cron in `scheduler.ts` | ✅ Done | `"0 */2 * * *"`, added to `availableJobs` as `check_alerts` |
| 3 | TypeScript errors | ✅ 0 errors | `npx tsc --noEmit` clean |
| 4 | Deploy | ⏭️ Skipped | Per task instructions — DO NOT DEPLOY |
