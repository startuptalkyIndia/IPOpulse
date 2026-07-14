#!/bin/sh
set -e

echo "[entrypoint] Running prisma db push (additive schema sync)..."
# IPOpulse uses prisma db push (no migration files). Safe for additive-only changes.
# NOTE: --accept-data-loss was REMOVED (audit CRIT-1). Without it, a destructive
# diff (dropped/truncated column) makes db push REFUSE and exit non-zero instead
# of silently destroying prod data. Additive changes still apply. The refusal is
# swallowed below so the app still boots on the existing (intact) schema.
npx prisma db push 2>&1 || echo "[entrypoint] ⚠ prisma db push refused or failed — likely a DESTRUCTIVE schema diff was blocked (this is intended; data left intact). Booting on existing schema."

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
