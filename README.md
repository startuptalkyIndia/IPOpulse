# IPOpulse

India's structured IPO + stock + market data hub. Competing with Chittorgarh, IPO Central, Finology Ticker, Moneycontrol, Screener — in one clean, mobile-first site.

## Quick start (local dev)

```bash
# 1. Start the dev database
docker compose -f docker-compose.dev.yml up -d

# 2. Copy env file and set values
cp .env.example .env
# Generate a secret: openssl rand -base64 32
# Paste into NEXTAUTH_SECRET

# 3. Install deps, generate Prisma client, push schema, seed admin
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Run dev server
npm run dev

# Open http://localhost:3065
# Admin: http://localhost:3065/sup-min (email/password from .env)
```

## Production

```bash
# Set POSTGRES_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL in .env
docker compose up -d --build
```

## Scripts

- `npm run dev` — dev server on :3065
- `npm run build` — production build (Prisma generate + Next build)
- `npm run db:studio` — Prisma Studio UI
- `npm run db:migrate` — create/apply a new migration
- `npm run db:seed` — seed first admin user

## Stack

Next.js 16 · React 19 · TypeScript · PostgreSQL 16 · Prisma · Tailwind v4 (Indigo theme) · NextAuth v5
