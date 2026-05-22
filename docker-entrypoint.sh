#!/bin/sh
set -e

echo "[entrypoint] Running prisma db push (additive schema sync)..."
# IPOpulse uses prisma db push (no migration files). Safe for additive-only changes.
npx prisma db push --accept-data-loss 2>&1 || echo "[entrypoint] prisma db push skipped or failed — schema may be current"

# Restore Claude CLI config from backup if missing (mount wipes .claude.json on each restart)
if [ ! -f /root/.claude.json ] && [ -d /root/.claude/backups ]; then
  BACKUP=$(ls -t /root/.claude/backups/.claude.json.backup.* 2>/dev/null | head -1)
  if [ -n "$BACKUP" ]; then
    cp "$BACKUP" /root/.claude.json
    echo "[entrypoint] Claude CLI config restored from backup."
  fi
fi

echo "[entrypoint] Starting Next.js on port ${PORT:-3065}..."
exec node server.js
