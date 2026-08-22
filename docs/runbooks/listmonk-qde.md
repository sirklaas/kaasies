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

Reserve these dedicated paths:

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

Use port `9000` for the loopback-only Listmonk listener in the Compose file.
Configure its host binding to the loopback interface using the Compose syntax
supported by the installed Docker version.

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

## Deploy commands

After Docker, Docker Compose, the operational account, the secret file, and
the reviewed Compose definition are in place, create the dedicated directories
and deploy from the application directory:

```sh
sudo install -d -m 0750 /opt/kaasies-listmonk /var/backups/kaasies-listmonk
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
the logs. Then use an internal test list and a low send rate before enabling
the production double-opt-in list.

## Backup and restore test

Take a compressed database backup before each deployment and daily thereafter.
Use the database service’s environment variables inside the container so the
command never places a database password in shell history or the runbook:

```sh
cd /opt/kaasies-listmonk
backup_file=/var/backups/kaasies-listmonk/listmonk-$(date -u +%Y%m%dT%H%M%SZ).sql.gz
sudo docker compose exec -T db sh -lc 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip -9 > "$backup_file"
gzip -t "$backup_file"
sudo chmod 0640 "$backup_file"
```

Retain backups according to the approved retention policy in access-restricted
storage. At least once per release cycle, restore the newest backup into an
isolated test PostgreSQL database using the same pinned PostgreSQL image, run
`pg_restore` or `psql` against that isolated database as appropriate for the
dump format, and verify that the production database volumes were never
mounted by the test container.

## Upgrade procedure

1. Confirm the least-privilege deployment path, available disk space, healthy
   current containers, valid Nginx configuration, and a recent verified backup.
2. Record the current pinned Listmonk and PostgreSQL image tags in the change
   record.
3. Review release notes and update only the intended pinned image tag in the
   Compose definition.
4. Run the deploy commands above, then the local and HTTPS health checks.
5. Run a double-opt-in flow only against the internal test list; confirm the
   branded confirmation, unsubscribe, and preference paths work.

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
