# PROJECT IDENTITY — Read This First
**You are the IPOpulse agent.**
- **What it does:** India IPO tracker — BSE APIs, allotment, GMP, subscription data
- **Domain:** ipopulse.talkytools.com
- **Port:** 3065
- **Status:** Active
- **Server folder:** /home/ubuntu/IPOpulse
- **Server:** 13.202.189.233 (SSH: `ssh -i ~/Downloads/linkbuilder-deploy.pem ubuntu@13.202.189.233`)
- **Stack:** Next.js · TypeScript · Prisma · Postgres · Docker

> After `/clear` or a fresh session, re-read `COMMS.md` and `PRODUCT.md` to restore full context.

---

@../_shared/TOKEN_EFFICIENCY_BLOCK.md

@../_shared/USER_PROFILE.md

@../_shared/SESSION_START.md


# 🚦 START HERE — Run This Every Session Before Anything Else

**Step 1 — Read context (5 min)**
- Read `PRODUCT.md` → understand what this product does and what's built
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

## ✅ MANDATORY — End Every Session With a Status Table

Every agent MUST end their session with this table in COMMS.md and final message:

```
| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | What you built/fixed | ✅ Done / ❌ Broken / ⏭️ Skipped | detail |
| 2 | TypeScript errors | ✅ 0 errors | or 🔴 N errors |
| 3 | Deployed to server | ✅ HTTP 200 | or ❌ not deployed |
```
Never write "done" without the table. Every attempted task = one row.


# PRODUCTION SYNC PROTOCOL
> Every agent working on this project MUST follow this checklist before considering any task done.
## ⚠️ DEPLOY RULE — READ BEFORE EVERY DEPLOY
**Only use `--build` if you changed code.**

| Situation | Command |
|---|---|
| Code changed (new feature, bug fix) | `docker compose up -d --build` |
| Config change only (.env, docker-compose.yml) | `docker compose up -d` |
| Git pull only (catching up, no local changes) | `docker compose up -d` |
| Container crashed, restart it | `docker compose up -d` |

**Never run `--build` just because you pulled new commits from git.**
Check: `git diff HEAD~1 --name-only` — if only non-code files changed, skip `--build`.
Unnecessary builds waste 5-10 min CPU + can crash the server if multiple run simultaneously.



## After Every Code Change
- [ ] Run `git add` + `git commit` + `git push origin main`
- [ ] No hardcoded passwords, secrets, or API keys in source code
- [ ] No sensitive data in console.log statements

## Before Every Deploy
- [ ] `git pull origin main` on server
- [ ] `docker compose up -d --build --force-recreate`
- [ ] Verify HTTP 200: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3065/`
- [ ] Check logs: `docker compose logs app --tail 20`

## Security Checklist (check on every PR)
- [ ] Security headers in next.config.ts (CSP, HSTS, X-Frame-Options)
- [ ] All API routes have auth guards
- [ ] No hardcoded secrets in source code
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with Zod on all user-facing endpoints
- [ ] /sup-min and /admin routes protected at middleware level

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

## Daily Automated Check
Runs at 9:17 AM IST — checks containers, RAM, HTTP status, logs, git sync.
Reports via push notification.

## Deep Check (Every 4 Days)
Runs at 10:23 AM IST — full audit including login test, SSL expiry, log analysis, security regression check.

---

# ⚠️ WORKSPACE BOUNDARY — READ THIS FIRST

**You are the IPOpulse agent.** You MUST only edit files inside this directory:
`/Users/shubhamkumar/Desktop/Claude Code/IPOpulse/`

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

## 🔄 AUTOSAVE — MANDATORY IMPLEMENTATION

Every multi-field form in this project MUST have autosave. Read the full spec:
`/Users/shubhamkumar/Desktop/Claude Code/_shared/AUTOSAVE_SPEC.md`

**Quick summary:**
1. Create `src/hooks/useAutosave.ts` — debounced autosave hook (delay: 1500ms)
2. Create `src/components/AutosaveIndicator.tsx` — shows Saving.../Saved ✓/error
3. Add to ALL multi-field edit forms, article writers, template editors, notes fields
4. Show AutosaveIndicator near form title
5. Use localKey for draft recovery on page refresh

This is a platform-wide standard. Do not skip it.



---

## 🕷️ APIFY — Use for Web Scraping

When you need to scrape data (LinkedIn, Google, Instagram, G2, contacts, news), use Apify instead of building custom scrapers. Read the full spec:
`/Users/shubhamkumar/Desktop/Claude Code/_shared/APIFY_SPEC.md`

**Quick summary:**
- Store token in `.env` as `APIFY_API_TOKEN`
- Key actors: google-search-scraper, linkedin-companies-scraper, contact-info-scraper, web-scraper
- Always cache results in DB — do not re-scrape same URL within 24h
- Max 3 concurrent actors
- Free $5/month credits — use sparingly



---

## 🔬 RESEARCH TASK — Do This Before Proposing New Features

Before building anything new, research what real users say online about this product category.
Read the full research spec: `/Users/shubhamkumar/Desktop/Claude Code/_shared/RESEARCH_TASK.md`

**Search terms specific to this product:**


Save findings to COMMS.md under "## Research Findings — [DATE IST]"


---

## 🔒 SECURITY — Non-Negotiable Rules

Read the full security standard: `/Users/shubhamkumar/Desktop/Claude Code/_shared/SECURITY_STANDARD.md`

**Must check before every deploy:**
1. Every `/api/*` route has auth check (session/token validation)
2. `/api/auth/*` has rate limiting
3. All user inputs validated with Zod
4. No secrets/API keys hardcoded in source (use process.env)
5. Security headers in next.config.ts (X-Frame-Options, X-Content-Type-Options etc)
6. `npm audit --audit-level=high` = 0 high/critical vulns
7. No `console.log` with user data in production code
8. `.env` is in `.gitignore` and NOT tracked by git

**Weekly automated check:** Runs every Sunday 01:00 IST. Results in `/home/ubuntu/logs/security-DATE.txt`

---

## ✅ QUALITY STANDARD — Definition of Done

Read the full standard: `/Users/shubhamkumar/Desktop/Claude Code/_shared/QUALITY_STANDARD.md`

**Before marking ANY task done:**
- [ ] Tested locally end-to-end
- [ ] `npx tsc --noEmit` — zero errors
- [ ] No `console.log` with user data
- [ ] Smoke test passes: `bash /home/ubuntu/scripts/enhanced-smoke-test.sh FOLDER PORT`
- [ ] CHANGELOG.md updated
- [ ] COMMS.md updated — task marked done

**Never deploy if:**
- `npm audit --audit-level=high` shows vulnerabilities
- TypeScript errors exist
- Previous smoke test failed

**Automated checks running:**
- Every 5 min: downtime monitor (ntfy.sh alerts)
- Daily 08:00 IST: SSL expiry + response times + error digest
- Every 6h: smoke tests
- Saturday 11 AM IST: full compliance + security + npm audit scan

## 🗄️ DATABASE STANDARD — Follow Before Any Schema Change

Read the full standard: `/Users/shubhamkumar/Desktop/Claude Code/_shared/DB_STANDARD.md`

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

## CHANGELOG — Read Before Starting

Before ANY work, read CHANGELOG.md (in this project root).
- Know what was previously broken and why
- Know what patterns to avoid
- Add your own entry before committing

Rule: If you fix a bug, document the root cause so the next agent doesn't repeat it.

Deploy rule: Use `bash /home/ubuntu/scripts/safe-deploy.sh FOLDER PORT` — includes smoke tests + auto-rollback.

## Token Efficiency (read first — applies to every session in this project)

Every message re-sends the whole chat, so long sessions get expensive. Keep context small.

- **New, unrelated task → `/clear`.** Don't drag old history into a fresh job.
- **One long task getting big → `/compact`** (summarizes and continues). Use `/context` to check how full the chat is.
- **Work in bounded slices**, not "fix everything at once" — one file / route / bug per pass, verify, then expand.
- **Read surgically**: grep/glob to the exact lines, don't slurp whole files.
- **Filter shell output**: pipe to `grep`/`head`/`tail`; never `cat` large files or dump full logs.
- **Reuse `_shared/` templates** instead of re-deriving boilerplate from scratch.
- **Prefer the right agent** for the job (deploy, security, health, etc.) over doing everything inline.

**Never cut these to save tokens:** reading the real source (no guessing from snippets), verification (run the test / fetch the real URL), research-before-planning, and accuracy. If a shortcut skips work needed to be *right*, don't take it.
