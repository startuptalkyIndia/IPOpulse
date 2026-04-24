#!/bin/sh
set -e

echo "[entrypoint] Running prisma migrate deploy..."
npx prisma migrate deploy || echo "[entrypoint] No migrations to apply (first boot may use db push)"

echo "[entrypoint] Starting Next.js on port ${PORT:-3065}..."
exec node server.js
