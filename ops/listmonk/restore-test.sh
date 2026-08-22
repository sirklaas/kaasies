#!/usr/bin/env bash
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/compose.yml"
ENV_FILE="${LISTMONK_ENV_FILE:-/etc/kaasies-listmonk/listmonk.env}"
BACKUP_DIR=/var/backups/kaasies-listmonk

test -r "$COMPOSE_FILE"
test -r "$ENV_FILE"
test -d "$BACKUP_DIR"

set -a
# The host-only file is controlled by the operations account and must be mode 0600.
. "$ENV_FILE"
set +a

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"

newest_dump="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'listmonk-*.dump' -printf '%T@ %p\n' | sort -nr | head -n 1 | cut -d ' ' -f 2-)"
test -n "$newest_dump"
test -s "$newest_dump"

postgres_image="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config --images db)"
test -n "$postgres_image"

run_id="$(date -u +%Y%m%dT%H%M%SZ)-$$"
temporary_volume="listmonk-restore-test-$run_id"
temporary_container="listmonk-restore-test-$run_id"
volume_created=false

cleanup() {
  docker rm -f "$temporary_container" >/dev/null 2>&1 || true
  if [ "$volume_created" = true ]; then
    docker volume rm "$temporary_volume" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

docker volume create "$temporary_volume" >/dev/null
volume_created=true
docker run -d --name "$temporary_container" --network none --env-file "$ENV_FILE" \
  -v "$temporary_volume:/var/lib/postgresql/data" \
  -v "$newest_dump:/restore.dump:ro" \
  "$postgres_image" >/dev/null

ready=false
for _ in $(seq 1 30); do
  if docker exec "$temporary_container" sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done

if [ "$ready" != true ]; then
  printf '%s\n' 'Timed out waiting for the isolated restore database.' >&2
  exit 1
fi

docker exec "$temporary_container" sh -c \
  'pg_restore --exit-on-error -U "$POSTGRES_USER" -d "$POSTGRES_DB" /restore.dump'
schema_table_count="$(docker exec "$temporary_container" sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "SELECT count(*) FROM information_schema.tables WHERE table_schema = '\''public'\'';"')"
case "$schema_table_count" in
  ''|*[!0-9]*|0)
    printf '%s\n' 'The isolated restore did not contain public schema tables.' >&2
    exit 1
    ;;
esac

printf 'Restored %s into isolated container %s using temporary volume %s.\n' \
  "$newest_dump" "$temporary_container" "$temporary_volume"
