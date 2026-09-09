#!/usr/bin/env bash
# Deploy a tagged release of the treenweb stack.
#
#   IMAGE_TAG=v1.4.0 infra/scripts/deploy.sh
#
# back up the DB -> pull images -> show pending migrations -> start
# (health-gated) -> run migrations -> smoke-check /readyz.
#
# On any failure the script stops; nothing is reverted automatically — use
# infra/scripts/rollback.sh with the previous IMAGE_TAG.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

export IMAGE_TAG="${IMAGE_TAG:?set IMAGE_TAG to the release to deploy, e.g. v1.4.0}"
COMPOSE_FILES="${COMPOSE_FILES:-infra/docker-compose.yml:infra/docker-compose.prod.yml}"
READYZ_URL="${READYZ_URL:-http://127.0.0.1:4321/readyz}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-180}"

compose_args=()
IFS=':' read -ra _files <<<"$COMPOSE_FILES"
for f in "${_files[@]}"; do
  [[ -f "$f" ]] || { echo "compose file not found: $f" >&2; exit 1; }
  compose_args+=(-f "$f")
done
compose() { docker compose "${compose_args[@]}" "$@"; }
step() { printf '\n\033[1;36m▸ %s\033[0m\n' "$*"; }

step "Deploying IMAGE_TAG=$IMAGE_TAG"

step "1/5  Back up the database"
COMPOSE_FILES="$COMPOSE_FILES" "$ROOT/infra/scripts/db-backup.sh"

step "2/5  Pull images"
compose pull

step "3/5  Start services (wait for healthy)"
compose up -d --wait --wait-timeout "$WAIT_TIMEOUT"

step "4/5  Migrations (status, then apply)"
compose exec -T backend pnpm --filter @treenweb/backend run migrate:status || true
compose exec -T backend pnpm --filter @treenweb/backend run migrate

step "5/5  Smoke check $READYZ_URL"
for _ in $(seq 1 30); do
  if curl -fsS "$READYZ_URL" >/dev/null 2>&1; then
    echo "ready — deploy OK"
    exit 0
  fi
  sleep 2
done
echo "readiness check failed — investigate, then rollback.sh if needed" >&2
exit 1
