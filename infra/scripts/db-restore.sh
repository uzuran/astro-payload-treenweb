#!/usr/bin/env bash
# Restore a gzipped pg_dump into the running `db` service. DESTRUCTIVE — the
# dump is taken with --clean --if-exists, so it drops and recreates every
# object it contains.
#
#   infra/scripts/db-restore.sh infra/backups/treenweb-20260909T120000Z.sql.gz
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

DUMP="${1:?usage: db-restore.sh <path-to-*.sql.gz>}"
[[ -f "$DUMP" ]] || { echo "no such file: $DUMP" >&2; exit 1; }

COMPOSE_FILES="${COMPOSE_FILES:-infra/docker-compose.yml:infra/docker-compose.dev.yml}"
DB_USER="${POSTGRES_USER:-treenweb}"
DB_NAME="${POSTGRES_DB:-treenweb}"

compose_args=()
IFS=':' read -ra _files <<<"$COMPOSE_FILES"
for f in "${_files[@]}"; do
  [[ -f "$f" ]] || { echo "compose file not found: $f" >&2; exit 1; }
  compose_args+=(-f "$f")
done

read -rp "Restore $DUMP into database '$DB_NAME'? This overwrites current data. [y/N] " reply
[[ "$reply" == [yY] ]] || { echo "aborted"; exit 1; }

gunzip -c "$DUMP" | docker compose "${compose_args[@]}" exec -T db psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1
echo "restored from $DUMP"
