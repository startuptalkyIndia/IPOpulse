# PROJECT IDENTITY — Read This First
> **START OF EVERY SESSION (master instruction, 2026-10-26):** open `TASKS.md` and work the block 'From the fleet scan and security wave, 2026-10-26' top-down, following `_shared/docs/PRODUCT_SESSION_RUNBOOK.md` (gates, review, COMMS evidence). Stop before any deploy: a deploy happens only when the founder says "deploy <this product>", via the deploy agent, in the order of `_shared/docs/deploy-queue-20261026.md`.

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
- **Next build, ideas, competitors:** the top of `TASKS.md` **To Do** is what to build next; future ideas and product research live under `## Ideas & research` in `TASKS.md` (link long research files from there). When the founder sends a competitor site or link: read it fully, log it in `_shared/COMPETITOR_LINKS.md`, list their features there (what they have / what we lack / what to build first), and build only on a "go".

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

## State as of 2026-09-22 — ARCHIVED
Moved to COMMS.md (entry "Archived from CLAUDE.md", 2026-10-12) because dated state blocks go stale. Current state: read COMMS.md top entries and TASKS.md.

## AI integration standard (platform-wide B.20)

When adding ANY Claude AI call to this project: use the `runClaude()` helper from `lib/ai/claudeRunner.ts` (CLI primary, API fallback). Only use `runClaudeCustomer()` from `lib/ai/claudeApiOnly.ts` if the call is customer-facing AND you need per-customer billing isolation.

Standard: founder Claude Pro subscription is the default path. Per-token API billing is the exception, not the rule.

See `_shared/AGENT_OPERATING_STANDARDS.md` B.20 for the full standard.

