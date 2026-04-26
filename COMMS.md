# IPOpulse — COMMS

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
