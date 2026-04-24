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
