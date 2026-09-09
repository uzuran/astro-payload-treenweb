#!/usr/bin/env bash
# pg_dump the running `db` service to a gzipped file and prune old dumps.
#
#   infra/scripts/db-backup.sh                     # -> infra/backups/treenweb-<utc>.sql.gz
#   BACKUP_DIR=/mnt/backups infra/scripts/db-backup.sh
#   COMPOSE_FILES=infra/docker-compose.yml:infra/docker-compose.prod.yml infra/scripts/db-backup.sh
#
# Prints the backup path on stdout (so callers can capture it).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

COMPOSE_FILES="${COMPOSE_FILES:-infra/docker-compose.yml:infra/docker-compose.dev.yml}"
BACKUP_DIR="${BACKUP_DIR:-infra/backups}"
KEEP="${KEEP:-14}"
DB_USER="${POSTGRES_USER:-treenweb}"
DB_NAME="${POSTGRES_DB:-treenweb}"

compose_args=()
IFS=':' read -ra _files <<<"$COMPOSE_FILES"
for f in "${_files[@]}"; do
  [[ -f "$f" ]] || { echo "compose file not found: $f" >&2; exit 1; }
  compose_args+=(-f "$f")
done

mkdir -p "$BACKUP_DIR"
out="$BACKUP_DIR/treenweb-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"

docker compose "${compose_args[@]}" exec -T db \
  pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists \
  | gzip >"$out"

# Keep only the newest $KEEP dumps.
ls -1t "$BACKUP_DIR"/treenweb-*.sql.gz 2>/dev/null | tail -n "+$((KEEP + 1))" | xargs -r rm -f

echo "$out"
