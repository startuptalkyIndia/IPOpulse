# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install --legacy-peer-deps

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

# Workaround for Next.js 16.2.6 standalone + middleware bug:
# build crashes with `ENOENT: middleware.js.nft.json` when
# `output: "standalone"` is combined with a root `middleware.ts`.
# Patches node_modules/next/dist/build/{index,utils}.js to handle the
# missing NFT file gracefully. Idempotent. See script header for detail.
RUN node scripts/patch-next-middleware-nft.js

RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Stage 3: Production runner
# node:20-slim (Debian/glibc) instead of Alpine — required for Claude CLI
# which is a glibc binary and cannot run on Alpine's musl libc.
FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Install Claude CLI — works on Debian/glibc. Credentials mounted from host.
# Falls back gracefully if install fails (claude-runner.ts handles unavailability).
RUN npm install -g @anthropic-ai/claude-code --legacy-peer-deps 2>/dev/null || true

ENV NODE_ENV=production
ENV PORT=3065
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
# tsconfig for tsx path resolution of @/* aliases (even though seed scripts don't use it, tsx inspects)
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# bcryptjs is needed by the seed script (admin upsert)
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

ENV PATH="/app/node_modules/.bin:${PATH}"

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Drop to non-root user — security hardening. Done last so global npm install
# (Claude CLI) above runs as root. App writes to /app (prisma migrations,
# .next runtime cache), so own the whole WORKDIR.
RUN useradd -m -u 1001 app && chown -R app:app /app
USER app

EXPOSE 3065

ENTRYPOINT ["./docker-entrypoint.sh"]
