#!/bin/sh
set -e

echo "[entrypoint] Running prisma migrate deploy..."
npx prisma migrate deploy || echo "[entrypoint] No migrations to apply (first boot may use db push)"

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
