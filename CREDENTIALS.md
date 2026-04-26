# IPOpulse — Admin Credentials

Per `project_admin_access.md` rule, every project ships with two standard accounts:

| Role         | Email                       | Where used               | Password location            |
|--------------|-----------------------------|--------------------------|------------------------------|
| Super Admin  | `superadmin@ipopulse.com`   | `/sup-min` (full power)  | `CREDENTIALS.local.md` (gitignored) + 1Password |
| Admin        | `admin@ipopulse.com`        | `/sup-min` (regular admin) | `CREDENTIALS.local.md` (gitignored) + 1Password |

**Login URL:** https://ipopulse.talkytools.com/sup-min  
**Local dev login URL:** http://localhost:3065/sup-min

## Where the passwords live

Actual passwords are **never** committed. They live in:

1. `CREDENTIALS.local.md` (this repo, gitignored) — for the platform owner's local checkout
2. 1Password vault `Talkytools/IPOpulse` — primary source of truth

## How accounts are created

Run the seed script with passwords supplied via env vars:

```bash
SUPERADMIN_EMAIL=superadmin@ipopulse.com \
SUPERADMIN_PASSWORD='<from 1Password>' \
ADMIN_EMAIL=admin@ipopulse.com \
ADMIN_PASSWORD='<from 1Password>' \
npm run db:seed
```

The seed (`scripts/seed.ts`) upserts both rows into the `admin_users` table — safe to re-run; it updates the password hash without duplicating rows.

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
