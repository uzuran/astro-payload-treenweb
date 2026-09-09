#!/usr/bin/env bash
# Roll the stack back to a previous release.
#
#   IMAGE_TAG=v1.3.0 infra/scripts/rollback.sh                 # redeploy old images
#   IMAGE_TAG=v1.3.0 MIGRATE_DOWN=1 infra/scripts/rollback.sh  # + revert the last migration
#
# Only pass MIGRATE_DOWN=1 when the release you are leaving added a migration
# and the down() is safe to run against production data. When in doubt, restore
# a pre-deploy dump with infra/scripts/db-restore.sh instead.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

export IMAGE_TAG="${IMAGE_TAG:?set IMAGE_TAG to the known-good release}"
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
step() { printf '\n\033[1;33m▸ %s\033[0m\n' "$*"; }

step "Rolling back to IMAGE_TAG=$IMAGE_TAG"

step "1/4  Back up the database"
COMPOSE_FILES="$COMPOSE_FILES" "$ROOT/infra/scripts/db-backup.sh"

step "2/4  Pull + start $IMAGE_TAG (wait for healthy)"
compose pull
compose up -d --wait --wait-timeout "$WAIT_TIMEOUT"

if [[ "${MIGRATE_DOWN:-0}" == "1" ]]; then
  step "3/4  Revert the most recent migration"
  compose exec -T backend pnpm --filter @treenweb/backend run migrate:down
else
  step "3/4  Skipping migrate:down (set MIGRATE_DOWN=1 to run it)"
fi

step "4/4  Smoke check $READYZ_URL"
for _ in $(seq 1 30); do
  if curl -fsS "$READYZ_URL" >/dev/null 2>&1; then
    echo "ready — rollback OK"
    exit 0
  fi
  sleep 2
done
echo "readiness check failed after rollback" >&2
exit 1
