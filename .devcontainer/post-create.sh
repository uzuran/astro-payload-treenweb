#!/usr/bin/env bash
# Runs once after the dev container is created (and captured by Codespaces
# prebuilds). Keep it idempotent: it may run again on "Rebuild Container".
set -euo pipefail

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }

cd "$(dirname "$0")/.."

# ─── Corepack / pnpm ────────────────────────────────────────────────────────
log "Enabling Corepack + activating the pinned pnpm"
PM_VERSION="$(node -p "(require('./package.json').packageManager || 'pnpm@10').split('@').pop()")"
sudo corepack enable
corepack prepare "pnpm@${PM_VERSION}" --activate || true
pnpm --version

# ─── Local env file ────────────────────────────────────────────────────────
log "Ensuring .env exists"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  created .env from .env.example — fill in real secrets before using external services"
else
  echo "  .env already present — left untouched"
fi

# ─── Dependencies ──────────────────────────────────────────────────────────
log "Installing workspace dependencies"
pnpm install --frozen-lockfile || pnpm install

# ─── Playwright browsers (only once Playwright is a dependency — Step 9) ────
if pnpm exec playwright --version >/dev/null 2>&1; then
  log "Installing Playwright chromium + system deps"
  sudo pnpm exec playwright install-deps chromium
  pnpm exec playwright install chromium
else
  log "Playwright not installed yet — skipping browser download (added in Step 9)"
fi

# ─── Summary ───────────────────────────────────────────────────────────────
log "Environment ready"
echo "  node    $(node --version)"
echo "  pnpm    $(pnpm --version)"
if docker version --format '{{.Server.Version}}' >/dev/null 2>&1; then
  echo "  docker  $(docker version --format '{{.Server.Version}}')"
else
  echo "  docker  daemon still starting — give it a few seconds, then 'docker info'"
fi
printf '\nRun \033[1mmake help\033[0m for available tasks.\n'
