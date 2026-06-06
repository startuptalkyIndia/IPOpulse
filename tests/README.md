# IPOpulse — Test Suite

## Running tests

### Unit tests (Vitest)
```bash
npm test                  # run all unit tests
npm run test:coverage     # run with coverage report
```

No external services needed. All DB and auth calls are mocked with vi.hoisted().

### E2E / Smoke tests (Playwright)
```bash
# Requires the app running locally on port 3065
npm run dev               # in one terminal

npm run test:e2e          # in another
# or
npm run test:smoke
```

E2E tests use BASE_URL env var (default: http://localhost:3065).

## Environment variables needed for E2E
None strictly required. The smoke tests only check that pages load without errors.
For full auth E2E (not yet written), a test DB with seeded users would be needed.

## What's mocked in unit tests
- `@/lib/db` (Prisma client) — never hits a real DB
- `@/lib/auth` (NextAuth) — returns fake session objects
- `bcryptjs` — returns a static hash string

## Test files

| File | What it covers |
|---|---|
| `unit/calculators.spec.ts` | All calculator math functions (SIP, EMI, FD, PPF, HRA, Tax, etc.) |
| `unit/format.spec.ts` | formatCurrency, formatPercent, formatPlain, formatByType |
| `unit/rate-limit.spec.ts` | rateLimit(), clientIp() — in-memory rate limiter |
| `unit/feature-flags.spec.ts` | FLAG_DEFINITIONS structure + clearFeatureFlagCache |
| `unit/api-alerts.spec.ts` | GET + POST /api/alerts — auth guard, Zod validation, 409 dedup, 201 create |
| `unit/api-signup.spec.ts` | POST /api/signup — validation, dedup 409, rate-limit 429 |
| `unit/api-watchlist.spec.ts` | POST + DELETE /api/watchlist — auth guard, slug regex, upsert |
| `e2e/smoke.spec.ts` | Homepage loads, login page renders |
