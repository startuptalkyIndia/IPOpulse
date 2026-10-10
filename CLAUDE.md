# PROJECT IDENTITY — Read This First
**You are the IPOpulse agent.**
- **What it does:** India IPO tracker — BSE APIs, allotment, GMP, subscription data
- **Domain:** ipopulse.talkytools.com
- **Port:** 3065
- **Status:** Active
- **Server folder:** /home/ubuntu/IPOpulse
- **Server:** 13.202.189.233 (SSH: `ssh -i ~/.ssh/linkbuilder-deploy.pem ubuntu@13.202.189.233`)
- **Stack:** Next.js · TypeScript · Prisma · Postgres · Docker

> After `/clear` or a fresh session, re-read `COMMS.md` (no `PRODUCT.md` exists in this project as of 2026-08-14 — the "Product" section further down this file is the current substitute; a 2026-05-17 broadcast asked every project to create one but IPOpulse never did).

---

@../_shared/TOKEN_EFFICIENCY_BLOCK.md

@../_shared/USER_PROFILE.md

@../_shared/SESSION_START.md


# 🚦 START HERE — Run This Every Session Before Anything Else

**Step 1 — Read context (5 min)**
- Read the "Product" section in this file → understand what this product does and what's built (`PRODUCT.md` doesn't exist for this project — don't try to read it)
- Read `COMMS.md` → see all pending tasks (work through them TOP TO BOTTOM, in order)
- Read `CHANGELOG.md` → know what broke before, don't repeat it

**Step 2 — Health check (2 min)**
```bash
curl -s http://localhost:3065/api/health        # is the app healthy?
docker compose logs app --tail 50 | grep -iE "error|warn|fail|crash" | head -20
npx tsc --noEmit 2>&1 | head -20               # any TypeScript errors?
```

**Step 3 — Fix broken things first**
If Step 2 finds errors → fix them BEFORE starting any new feature. No new code on broken foundations.

**Step 4 — Do COMMS.md tasks in order**
Top of COMMS.md = highest priority. Complete in order. Don't skip to easier tasks.

**Step 5 — Update COMMS.md when done**
Mark completed tasks. Note what you built. Log any new issues found.

---

## Standing rules (digest — full text in `_shared/PROJECT_STANDARDS.md`; READ IT before any deploy, schema change, security review, or when closing a task)
- **Never deploy without an explicit "go".** Deploys are sequential, via `bash /home/ubuntu/scripts/safe-deploy.sh FOLDER PORT`; use `--build` only when code changed.
- **Session start:** read COMMS.md, then TASKS.md; fix anything broken before new features. Health-check the port in the Identity block.
- **Before saying "done":** `npx tsc --noEmit` = 0 errors, tested end to end, no `console.log` with user data, CHANGELOG.md + COMMS.md updated.
- **End every session** with the status table (Task | Status | Notes) in COMMS.md and in the final message.
- **Security:** auth check on every `/api` route, rate-limit auth endpoints, Zod on user input, no hardcoded secrets, `/sup-min` guarded in middleware.
- **Database:** additive changes only, back up first, soft delete (`deletedAt`), never reset prod.

## Staying In Sync — Full 12-Point Checklist
1. Code: local changes committed and pushed to GitHub main
2. Security: headers, auth guards, no hardcoded secrets, rate limiting
3. Dependencies: npm audit fix run, no high/critical vulns
4. Server: git pull done, docker rebuild done, container healthy
5. Database: migrations applied (prisma db push), seed data exists
6. Env vars: all required vars set in server .env (email, AI, payments, auth)
7. Functional: login works, core feature works, admin panel works
8. Email: transactional emails sending (test with real inbox)
9. Payments: payment flow tested (if applicable)
10. Domain/SSL: subdomain resolves, SSL cert valid
11. Monitoring: daily automated check running, errors logged
12. Legal: Privacy Policy, Terms of Service pages exist

# ⚠️ WORKSPACE BOUNDARY — READ THIS FIRST

**You are the IPOpulse agent.** You MUST only edit files inside this directory:
`/Users/shubhamkumar/Developer/Claude Code/IPOpulse/`

**NEVER edit files in:**
- Any sibling project folder (BillForge, SeizeLead, Optimo, OutreachIQ, etc.)
- The parent `Claude Code/` directory
- Global config files (`~/.claude/INSTRUCTIONS.md`, `~/.claude/projects/`)
- Any other project's COMMS.md, TASKS.md, CLAUDE.md, or source code

If the user mentions another project by mistake, politely say: "That's not my project. Please ask the [project name] agent."

---

# IPOpulse

## Product
India's comprehensive IPO + stock + market data website — structured data only, no blogs. Beats Chittorgarh, IPO Central, Finology Ticker, Moneycontrol, Screener.

## Tech Stack
- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- PostgreSQL 16 + Prisma ORM
- Tailwind CSS 4 (Indigo theme — see `src/app/globals.css`)
- NextAuth v5 (credentials, bcrypt)
- node-cron for ingestion jobs
- Recharts for charts

## Hosting
- Domain: https://ipopulse.talkytools.com (subdomain of talkytools.com)
- Port: 3065 (internal + external)
- Server path: /home/ubuntu/IPOpulse (Lightsail 16GB, 13.202.189.233)
- Docker services: postgres (db) + ipopulse (app)

## Data Sources (see project_ipopulse.md memory for full list)
- Zerodha Kite Connect (₹500/mo) — live prices, OHLC historical
- BSE JSON APIs (open) — IPOs, announcements, corporate actions, bulk/block deals, shareholding, insider trading
- NSE APIs (Akamai-protected, cookie-session scrape) — FII/DII, option chain
- NSDL — FPI AUC monthly, sector flows
- AMFI — MF NAVs
- SEBI — DRHP / RHP PDFs
- Manual GMP via admin panel daily entry

## Build Phases
- **Phase 1 (weeks 1-8):** 20 calculators, IPO hub, corporate actions, FII/DII daily
- **Phase 2 (weeks 9-16):** Super Investor tracker, SME deep dive, sector FPI, screener MVP
- **Phase 3 (weeks 17-24):** Credit card compare, CIBIL, broker compare, GMP accuracy, allotment multi-registrar
- **Phase 4 (weeks 25-36):** DRHP AI search, concall AI, advanced screener, push alerts, premium tier

## Admin Panel
- URL: `/sup-min` (login) → `/sup-min/dashboard`
- Daily GMP entry: `/sup-min/gmp` (30-min/day founder workflow)

## Key Rules
- Local-first: always test with `docker-compose -f docker-compose.dev.yml up` + `npm run dev` before pushing
- UI style guide: Indigo Theme from `ui-reference-style.md` memory is mandatory
- Never deploy directly from local — push to GitHub, deploy from GitHub
- No blogs — everything structured in tables/cards/dashboards

---

## 🗄️ DATABASE STANDARD — Follow Before Any Schema Change

Read the full standard: `/Users/shubhamkumar/Developer/Claude Code/_shared/DB_STANDARD.md`

**Required on every model:**
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`  ← required for TalkyHub sync
- `deletedAt DateTime?`  ← soft delete, never hard-delete user data

**Always add to DATABASE_URL:**
`?connection_limit=5&pool_timeout=10`  ← already set on server, keep in local .env too

**Before every schema change:**
1. Back up DB first
2. Only additive changes on live tables
3. Test locally before deploying
4. Never `prisma migrate reset` on production

**Raw SQL:** Only use `$queryRaw` with `Prisma.sql` template tags — never string concatenation.

---

## State as of 2026-09-22

**Live:** Yes — https://ipopulse.talkytools.com confirmed HTTP 200 (home + `/api/health`), server `git rev-parse HEAD` matches local `main`/`origin/main` tip `a519379` (checked directly 2026-09-22 via the deploy agent — server was already current, nothing rebuilt this pass).
**⚠️ Deindexed from search since 2026-09-05:** `robots.txt` is a blanket `Disallow: /` and every page carries `noindex,nofollow,nocache` — a deliberate founder policy call (2026-08-30) that ALL `*.talkytools.com` subdomains are deindexed regardless of live/paying status, not a bug. **This invalidates the SEO-led growth strategy in the "Goal" section below and the 12/24/36-month traffic projections in the cross-session memory file** (`~/.claude/projects/.../memory/project_ipopulse.md`) — both assume organic search as the primary channel. Don't propose SEO-driven growth work here without first checking whether this policy still stands.
**Compliance score:** still stale — last numeric score was 88/100 on 2026-06-06 (pre-launch snapshot), qualitatively re-graded "C-→B-" on 2026-07-14. No numeric re-score since. Not re-scored this pass either (docs-only sync, not a full audit).
**Last commit:** `a519379` 2026-09-05 16:15 IST — fix: removed a leftover static `public/robots.txt` that had been silently shadowing the deindex fix above for 6 days.
**Tests:** unit + API integration suite last counted at 121/121 (2026-08-19, `npx vitest run`). Not re-run this pass — run `npm test` to confirm current count.
**TS errors:** 0 (`npx tsc --noEmit`, verified 2026-09-22).

**Recent work (verified against CHANGELOG.md + git + live server, this pass — 2026-09-22 docs-only sync, no code changed):**
Five commits between 2026-08-20 and 2026-09-05 had landed with no COMMS/CHANGELOG entries; backfilled into CHANGELOG.md this pass. Highlights: the deindex policy (`4cc67ae`, actually live only from `a519379`), required `DATABASE_URL` connection-pool params documented but **not yet applied to the real server `.env`** (`e8fc259`), and a stale-Server-Action-ID reload fix (`75f6117`). Full detail + verification evidence in COMMS.md's 2026-09-22 entry.

**Known gaps — as of 2026-08-14, not re-verified this pass:**
- Zerodha Kite Connect: live prices shipped, Fyers v3 backup added; `/api/health` shows `kite: ok` (env-configured only — doesn't confirm the live token is still valid).
- WhatsApp Channel CTA banner: built (`src/components/WhatsAppBanner.tsx`).
- Free vs Premium tier: `PremiumGate.tsx` + `/pricing` exist, but **no payment processor wired** (no `razorpay` in `package.json`) — a user still cannot actually purchase Premium; only an admin can flip the plan field manually.
- Three Yahoo symbol remaps (`ZOMATO`→`ETERNAL`, `TATAMOTORS`→`TMPV`, `VISASTEEL`→inactive) still awaiting founder approval (data change) — see TASKS.md.
- `super_investor` cron still blocked — BSE blocks this server's IP; needs a new data source, not a retry.
- 111 lint findings from the revived lint gate (74 errors, 37 warnings) still unaddressed — see TASKS.md.
- `connection_limit=5&pool_timeout=10` documented in `.env.example` (2026-08-28) but not yet applied to the live server's `DATABASE_URL`.

**Data source caution:** NSE APIs are Akamai-protected — use cookie-session approach, not raw fetch. BSE JSON APIs are open. See `project_ipopulse.md` memory.

**Deploy:** `/home/ubuntu/IPOpulse` — `docker compose up -d --build`
**SSH key:** `~/.ssh/linkbuilder-deploy.pem`

**Relevant lessons:** LESSON-006 (lazy-init secrets), LESSON-070 (DPDP), LESSON-038 (rate-limit external APIs)

**Known doc drift not fixed here (outside this file's/project's boundary):** `_shared/FLEET_INVENTORY.md` lists IPOpulse's protected route as `/advisor/dashboard`. That route is real but 404s by design (feature-flagged off, unrelated advisor/referral feature) — the actual universal post-login route is `/my/watchlist`. Already flagged in CHANGELOG.md's 2026-08-14 entry for whoever maintains that shared file; not edited here since it's outside `IPOpulse/`.


---

## AI integration standard (platform-wide B.20)

When adding ANY Claude AI call to this project: use the `runClaude()` helper from `lib/ai/claudeRunner.ts` (CLI primary, API fallback). Only use `runClaudeCustomer()` from `lib/ai/claudeApiOnly.ts` if the call is customer-facing AND you need per-customer billing isolation.

Standard: founder Claude Pro subscription is the default path. Per-token API billing is the exception, not the rule.

See `_shared/AGENT_OPERATING_STANDARDS.md` B.20 for the full standard.

