#!/usr/bin/env bash
# Wrapper that runs the DRHP analyzer via the local `claude` CLI binary.
# Useful when you don't have ANTHROPIC_API_KEY set but you ARE logged in to
# Claude Code on this machine.
#
# Usage:
#   ./scripts/analyze-drhp-cli.sh <ipo-slug>
#   ./scripts/analyze-drhp-cli.sh --pending
#   ./scripts/analyze-drhp-cli.sh --all
#
# Both produce identical output to the SDK path — same DB rows, same UI.
set -euo pipefail

if ! command -v claude >/dev/null 2>&1; then
  echo "✗ 'claude' CLI not found on PATH."
  echo "  Install: npm install -g @anthropic-ai/claude-code"
  echo "  Then sign in: run 'claude' once interactively."
  exit 1
fi

cd "$(dirname "$0")/.."

# Force the analyzer to use the CLI path
exec npx --yes tsx scripts/analyze-drhp.ts "$@" --cli
