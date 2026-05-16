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

