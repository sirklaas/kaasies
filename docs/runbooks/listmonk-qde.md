# Listmonk on QDE

## Observed host state

QDE runs Ubuntu 22.04.5 LTS with 22 GB free on its root filesystem and about
3.0 GiB available memory. Docker and Docker Compose are not installed. The
current host is therefore not ready for the Listmonk Compose stack; provision
the container runtime in Task 3 only after a least-privilege operational path
is available.

Nginx is active and owns the existing public HTTP and HTTPS listeners. Caddy
and Traefik are inactive. Nginx configuration validated successfully during
the read-only inspection. Existing proxy upstream definitions are present, but
no Listmonk route exists.

The temporary root SSH exception used for the read-only Task 1 inspection must
not be used for deployment. Establish the approved least-privilege operations
account or constrained deployment path before executing this runbook.

## Deployment and backup directories

No Listmonk application, backup, or secret path existed during the Task 1
inspection. The following are proposed Task 2/3 layout choices, subject to
approval when the least-privilege operational path is created:

- Application: `/opt/kaasies-listmonk`
- Backups: `/var/backups/kaasies-listmonk`
- Host-only secret file: `/etc/kaasies-listmonk/listmonk.env`

The backup directory is outside the application and Docker volumes. Keep the
secret file owned by the operations account or root with mode `0600`; never add
it to Git or print it in logs.

## Existing reverse proxy and shared network

Nginx is the existing reverse proxy. There is no Docker engine and therefore
no existing Docker network to join. The Listmonk service must bind its HTTP
port only to the loopback interface; Nginx will proxy `nieuwsbrief.kaasies.com`
to that loopback listener. Do not install a competing proxy or publish the
database port.

Port `9000` is a proposed Task 2/3 loopback-only Listmonk listener, not an
observed Task 1 service. Configure its host binding to the loopback interface
using the Compose syntax supported by the installed Docker version.

The PostgreSQL service belongs only on the Compose-internal network and has no
host `ports` entry.

## Firewall and public ports

UFW is inactive. Public listeners currently include SSH on 22 and Nginx on 80
and 443; an unrelated service also listens on 8000. Retain the existing
firewall policy and expose no new public ports for Listmonk or PostgreSQL.

If a firewall policy is enabled later, allow only the already-required public
services (22, 80, and 443) and keep 9000 and 5432 private.

## Pre-deploy checks

Run these checks as the approved least-privilege operations path before each
deployment:

```sh
test -x "$(command -v docker)"
docker compose version
sudo nginx -t
df -h /opt /var/backups
free -h
test -f /etc/kaasies-listmonk/listmonk.env
test ! -d /opt/kaasies-listmonk/.git
```

Confirm the Compose definition pins both the Listmonk and PostgreSQL image
tags, has no database `ports` entry, mounts persistent database storage, and
binds port 9000 only on the loopback interface for the application. Confirm the Resend SMTP,
Listmonk administrator, database, and API values are present only in the host
secret file.

## Repository Compose validation

Before copying the stack to QDE, validate the checked-in Compose contract with
its intentionally non-secret example environment:

```bash
docker compose --env-file ops/listmonk/.env.example -f ops/listmonk/compose.yml config --quiet
```

On QDE, validate the same definition with `/etc/kaasies-listmonk/listmonk.env`
instead. Do not deploy with `.env.example`, which contains placeholders rather
than credentials.

## Deploy commands

After Docker, Docker Compose, the operational account, the secret file, and
the reviewed Compose definition are in place, create the dedicated directories
with a restricted backup-reader group. Task 3 must create the
`kaasies-listmonk-ops` group and add only the approved operations account to
it; this is a proposed deployment control, not observed Task 1 state. Deploy
from the application directory:

```sh
sudo install -d -o root -g kaasies-listmonk-ops -m 0750 /opt/kaasies-listmonk
sudo install -d -o root -g kaasies-listmonk-ops -m 2750 /var/backups/kaasies-listmonk
cd /opt/kaasies-listmonk
sudo docker compose --env-file /etc/kaasies-listmonk/listmonk.env config --quiet
sudo docker compose --env-file /etc/kaasies-listmonk/listmonk.env pull
sudo docker compose --env-file /etc/kaasies-listmonk/listmonk.env up -d
sudo docker compose ps
```

Record the pinned Listmonk image tag in the change record before every deploy.
Do not use a floating `latest` tag.

## Proxy validation and reload

Create an Nginx server block for `nieuwsbrief.kaasies.com` that terminates TLS
and proxies only to `http://localhost:9000`. Keep any existing Nginx access
controls intact, and do not copy authentication values into the server block
or this repository.

Validate and reload only after the server block has passed review:

```sh
sudo nginx -t
sudo systemctl reload nginx
```

## Health checks

Check the service both locally and through the public HTTPS route:

```sh
curl --fail --silent --show-error http://localhost:9000/
curl --fail --silent --show-error --location https://nieuwsbrief.kaasies.com/
cd /opt/kaasies-listmonk
sudo docker compose ps
sudo docker compose logs --tail=100 listmonk
```

Verify that the Listmonk container is healthy, the database is reachable only
from the Compose network, the certificate is valid, and no secret appears in
the logs.

### Mandatory production publication gates

Do not enable the production double-opt-in list or publish any customer-facing
newsletter entry point until every gate below has recorded passing evidence:

1. A message sent to the internal test list is successfully delivered to a
   test mailbox and its links work.
2. Resend DNS authentication is verified: SPF, DKIM, and DMARC alignment pass
   for the sending domain.
3. The unsubscribe link works end to end and the subscriber is no longer sent
   to by a follow-up internal test campaign.
4. The newest database backup has been restored successfully into an isolated
   test PostgreSQL database without mounting or changing production volumes.
5. Kaasies branding is reviewed and accepted for every public newsletter form,
   Listmonk public page, and customer email, including the confirmation,
   welcome, campaign, preference, unsubscribe, error, and plain-text states.

An internal test list and conservative send rate are required rollout controls;
they are not substitutes for any publication gate.

## Backup and restore test

Take a custom-format PostgreSQL backup before each deployment and daily
thereafter. Use the database service’s environment variables inside the
container so the command never places a database password in shell history or
the runbook. The final write uses `sudo tee`, so the restricted backup
directory remains root-owned and the shell never attempts an unprivileged
redirection into it:

```bash
set -euo pipefail
cd /opt/kaasies-listmonk
backup_file=/var/backups/kaasies-listmonk/listmonk-$(date -u +%Y%m%dT%H%M%SZ).dump
temporary_backup_file="${backup_file}.partial"
trap 'sudo rm -f "$temporary_backup_file"' EXIT
sudo docker compose exec -T db sh -lc 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' | sudo tee "$temporary_backup_file" >/dev/null
sudo chown root:kaasies-listmonk-ops "$temporary_backup_file"
sudo chmod 0640 "$temporary_backup_file"
sudo mv "$temporary_backup_file" "$backup_file"
trap - EXIT
```

Retain backups according to the approved retention policy in access-restricted
storage. At least once per release cycle, restore the newest custom-format
backup into an isolated test PostgreSQL database using the same pinned
PostgreSQL image and `pg_restore`:

```bash
set -Eeuo pipefail
cd /opt/kaasies-listmonk
backup_file=$(sudo find /var/backups/kaasies-listmonk -maxdepth 1 -type f -name 'listmonk-*.dump' -printf '%T@ %p\n' | sort -nr | head -n 1 | cut -d ' ' -f 2-)
test -n "$backup_file"
postgres_image=$(sudo docker compose --env-file /etc/kaasies-listmonk/listmonk.env config --images db)
test -n "$postgres_image"
restore_container=listmonk-restore-test
cleanup_restore() { sudo docker rm -f "$restore_container" >/dev/null 2>&1 || true; }
trap cleanup_restore EXIT
sudo docker run -d --rm --name "$restore_container" --network none --tmpfs /var/lib/postgresql/data:rw,noexec,nosuid,size=1g --env-file /etc/kaasies-listmonk/listmonk.env -v "$backup_file:/restore.dump:ro" "$postgres_image" >/dev/null
restore_ready=false
for attempt in $(seq 1 30); do
  if sudo docker exec "$restore_container" sh -lc 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; then
    restore_ready=true
    break
  fi
  sleep 1
done
if [ "$restore_ready" != true ]; then
  printf '%s\n' 'Timed out waiting 30 seconds for the isolated restore database.' >&2
  exit 1
fi
sudo docker exec "$restore_container" sh -lc 'pg_restore --clean --if-exists -U "$POSTGRES_USER" -d "$POSTGRES_DB" /restore.dump'
restore_probe=$(sudo docker exec "$restore_container" sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "select 1"')
test "$restore_probe" = 1
cleanup_restore
trap - EXIT
```

The temporary restore container has no network and uses an in-memory data
directory; it never mounts a production database volume. Capture the passing
restore output in the change record. A successful restore is a mandatory
production publication gate. The snippets require Bash: `set -o pipefail`
propagates a failed database dump or privileged write, and `set -e` stops the
restore before it can be recorded as successful after a failed restore or
validation query.

## Upgrade procedure

1. Confirm the least-privilege deployment path, available disk space, healthy
   current containers, valid Nginx configuration, and a recent verified backup.
2. Record the current pinned Listmonk and PostgreSQL image tags in the change
   record.
3. Review release notes and update only the intended pinned image tag in the
   Compose definition.
4. Run the deploy commands above, then the local and HTTPS health checks.
5. Re-run every mandatory production publication gate, including successful
   test-list delivery, DNS authentication, unsubscribe verification, isolated
   backup restoration, and Kaasies branding review for every public form,
   page, and customer email. Production remains disabled until all evidence is
   recorded as passing.

## Rollback procedure

1. Stop the release only after preserving the failed-release logs and taking a
   current backup.
2. Restore the prior known-good pinned Listmonk image tag in the Compose
   definition. Keep the prior pinned PostgreSQL tag unless its upgrade was
   explicitly part of the approved rollback plan.
3. Redeploy the prior images without removing volumes:

```sh
cd /opt/kaasies-listmonk
sudo docker compose --env-file /etc/kaasies-listmonk/listmonk.env pull
sudo docker compose --env-file /etc/kaasies-listmonk/listmonk.env up -d
sudo docker compose ps
```

4. Run the proxy validation and health checks. Restore a database backup only
   when the approved incident decision requires it, and restore first into an
   isolated test database when time permits.

Never run `docker compose down -v`, `docker volume rm`, or any command that
deletes PostgreSQL volumes as part of rollback.
