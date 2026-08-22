#!/usr/bin/env bash
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/compose.yml"
ENV_FILE="${LISTMONK_ENV_FILE:-/etc/kaasies-listmonk/listmonk.env}"
BACKUP_DIR=/var/backups/kaasies-listmonk

test -r "$COMPOSE_FILE"
test -r "$ENV_FILE"

set -a
# The host-only file is controlled by the operations account and must be mode 0600.
. "$ENV_FILE"
set +a

: "${BACKUP_RETENTION_DAYS:?BACKUP_RETENTION_DAYS is required}"
case "$BACKUP_RETENTION_DAYS" in
  ''|*[!0-9]*)
    printf '%s\n' 'BACKUP_RETENTION_DAYS must be a non-negative integer.' >&2
    exit 2
    ;;
esac

test -d "$BACKUP_DIR"
test -w "$BACKUP_DIR"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="$BACKUP_DIR/listmonk-$timestamp.dump"
temporary_backup_file="$backup_file.partial.$$"

cleanup() {
  rm -f -- "$temporary_backup_file"
}
trap cleanup EXIT

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
  pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB" >"$temporary_backup_file"

test -s "$temporary_backup_file"
mv -- "$temporary_backup_file" "$backup_file"
trap - EXIT

find "$BACKUP_DIR" -type f -name '*.dump' -mtime +"$BACKUP_RETENTION_DAYS" -delete
printf '%s\n' "$backup_file"
