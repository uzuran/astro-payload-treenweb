#!/usr/bin/env bash
# pg_dump the running `db` service to a gzipped file, prune old local dumps, and
# (optionally) copy the dump off-box to S3-compatible storage.
#
#   infra/scripts/db-backup.sh                     # -> infra/backups/treenweb-<utc>.sql.gz
#   BACKUP_DIR=/mnt/backups infra/scripts/db-backup.sh
#   COMPOSE_FILES=infra/docker-compose.yml:infra/docker-compose.prod.yml infra/scripts/db-backup.sh
#
# Off-box copy (best-effort — a failure here does not fail the backup):
#   BACKUP_S3_DEST=s3://my-bucket/treenweb        # required to enable it
#   BACKUP_S3_ENDPOINT=https://…                  # optional (MinIO / R2 / B2 / …)
#   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_DEFAULT_REGION   # aws-cli auth
#
# Prints the local backup path on stdout.
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

# Keep only the newest $KEEP local dumps.
ls -1t "$BACKUP_DIR"/treenweb-*.sql.gz 2>/dev/null | tail -n "+$((KEEP + 1))" | xargs -r rm -f

# Off-box copy.
if [[ -n "${BACKUP_S3_DEST:-}" ]]; then
  if command -v aws >/dev/null 2>&1; then
    endpoint_args=()
    [[ -n "${BACKUP_S3_ENDPOINT:-}" ]] && endpoint_args=(--endpoint-url "$BACKUP_S3_ENDPOINT")
    if aws "${endpoint_args[@]}" s3 cp --only-show-errors "$out" "${BACKUP_S3_DEST%/}/$(basename "$out")"; then
      echo "off-box: ${BACKUP_S3_DEST%/}/$(basename "$out")" >&2
    else
      echo "WARNING: off-box copy to $BACKUP_S3_DEST failed (local dump kept)" >&2
    fi
  else
    echo "WARNING: BACKUP_S3_DEST set but 'aws' CLI not found — off-box copy skipped" >&2
  fi
fi

echo "$out"
