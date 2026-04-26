# IPOpulse — Admin Credentials

Per Master Hub broadcast v3 + `_shared/templates/seed.template.ts`, every
TalkyTools project ships with three standard accounts:

| Role         | Email                       | Where used                | Password location |
|--------------|-----------------------------|---------------------------|-------------------|
| Super Admin  | `superadmin@ipopulse.com`   | `/sup-min` (full power)   | `CREDENTIALS.local.md` (gitignored) + 1Password |
| Admin        | `admin@ipopulse.com`        | `/sup-min` (regular admin)| `CREDENTIALS.local.md` (gitignored) + 1Password |
| Demo User    | `user@ipopulse.com`         | `/signin` (public app)    | `CREDENTIALS.local.md` (gitignored) + 1Password |

Passwords are FIXED at the standard TalkyTools values so the master dashboard
login works uniformly across all 49 projects. Override only via env vars if
absolutely necessary.

**Login URL:** https://ipopulse.talkytools.com/sup-min  
**Local dev login URL:** http://localhost:3065/sup-min

## Where the passwords live

Actual passwords are **never** committed. They live in:

1. `CREDENTIALS.local.md` (this repo, gitignored) — for the platform owner's local checkout
2. 1Password vault `Talkytools/IPOpulse` — primary source of truth

## How accounts are created

The seed (`scripts/seed.ts`) upserts:
- two rows into `admin_users` (superadmin + admin)
- one row into `users` (demo user)

Safe to re-run — it updates `passwordHash`/`role`/`name` without duplicating rows.

Default fixed passwords are baked into the seed. To rotate or use custom
values, supply env vars:

```bash
SUPERADMIN_PASSWORD='<new>' \
ADMIN_PASSWORD='<new>' \
DEMO_USER_PASSWORD='<new>' \
npm run db:seed
```

## Production seed (one-shot Docker pattern)

```bash
ssh ubuntu@13.202.189.233
cd /home/ubuntu/IPOpulse && git pull
docker run --rm --network ipopulse_default \
  -v /home/ubuntu/IPOpulse:/app -w /app \
  -e DATABASE_URL="<from server .env>" \
  -e SUPERADMIN_EMAIL=superadmin@ipopulse.com \
  -e SUPERADMIN_PASSWORD='<from 1Password>' \
  -e ADMIN_EMAIL=admin@ipopulse.com \
  -e ADMIN_PASSWORD='<from 1Password>' \
  node:20-alpine sh -c \
  "npm install --silent && npx prisma generate && npx tsx scripts/seed.ts"
```

## Security notes

- `/sup-min` route is `noindex, nofollow` and never linked from the public UI
- Passwords are stored as bcrypt hashes (cost factor 10) in `admin_users.passwordHash`
- Public users live in a separate `users` table — admins and users share the same login form but resolve to different roles
- If a credential leaks: rotate immediately by re-running the seed with a new password (it overwrites the existing hash)

## Last verified

- 2026-04-26 — both accounts upserted on production DB; login flow returns correct roles via `/api/auth/session`
