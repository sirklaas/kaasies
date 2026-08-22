# Kaasies Listmonk Mailing List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a fully Kaasies-branded, double-opt-in mailing list on kaasies.com using Listmonk on QDE and Resend for delivery, without making browsing or checkout dependent on newsletter availability.

**Architecture:** A dedicated Docker Compose stack on QDE runs Listmonk and PostgreSQL behind the server's existing HTTPS reverse proxy at `nieuwsbrief.kaasies.com`. The Next.js storefront exposes a server-only subscription endpoint, rate-limited through Upstash Redis, and sends only email, optional first name, consent source, and required subscription metadata to Listmonk. Listmonk remains the source of truth and owns confirmation, unsubscribe, campaign, bounce, and suppression behavior.

**Tech Stack:** Ubuntu VPS, Docker Compose, Listmonk, PostgreSQL, existing QDE reverse proxy, Resend SMTP, Next.js 16.3.1 App Router, React 19.2.8, TypeScript 6.0.3, Upstash Redis rate limiting, Vitest 4.1.11, Testing Library, Playwright 1.62.1.

**Spec:** `docs/superpowers/specs/2026-08-22-listmonk-mailing-list-design.md`

## Global Constraints

- Treat Kaasies branding as an acceptance requirement for every customer-visible form, page, and email.
- Use `nieuwsbrief.kaasies.com` as the public Listmonk origin.
- Use double opt-in; consent controls are explicit and unchecked by default.
- Never send address, phone, cart, order, or payment data to Listmonk.
- Never expose Listmonk, PostgreSQL, SMTP, or Upstash credentials to browser code or Git.
- Never use or copy the plaintext PocketBase administrator credentials found in the local PocketBase skill.
- Listmonk failure must not break browsing or block checkout.
- Preserve the existing uncommitted `tests/e2e/storefront.spec.ts` changes and do not fold them into newsletter commits accidentally.
- Use email-safe markup and system-font fallbacks; webfont rendering is not a release requirement for inboxes.
- Keep unsubscribe and preference controls clear and accessible.
- Run each infrastructure mutation only after its preceding read-only inspection has established the exact target.
- Do not publish live customer forms until test-list delivery, DNS authentication, unsubscribe, and backup restoration have passed.

## File map

### Infrastructure and operations

- Create `ops/listmonk/compose.yml`: isolated Listmonk and PostgreSQL services, health checks, volumes, and private networking.
- Create `ops/listmonk/.env.example`: variable names and non-secret safe defaults only.
- Create `ops/listmonk/backup.sh`: PostgreSQL dump, permissions, retention, and failure behavior.
- Create `ops/listmonk/restore-test.sh`: isolated restore validation without overwriting production.
- Create `ops/listmonk/templates/public/`: mounted Listmonk public-page templates.
- Create `ops/listmonk/templates/email/`: system and campaign email templates.
- Create `docs/runbooks/listmonk-qde.md`: inspection, deployment, proxy, TLS, rollback, backup, and restore commands.
- Create `docs/runbooks/resend-listmonk.md`: DNS authentication, SMTP, test-list, throttling, and verification procedure.

### Storefront domain and server boundary

- Create `lib/newsletter/types.ts`: stable request, result, source, and upstream interfaces.
- Create `lib/newsletter/validation.ts`: normalization and validation with no network dependencies.
- Create `lib/newsletter/config.ts`: server-only environment parsing.
- Create `lib/newsletter/rate-limit.ts`: injectable Upstash-backed limiter.
- Create `lib/newsletter/listmonk.ts`: timeout-bounded Listmonk adapter and response mapping.
- Create `lib/newsletter/subscribe.ts`: orchestration independent from HTTP and React.
- Create `app/api/newsletter/subscribe/route.ts`: HTTP request/response adapter.

### Customer interface

- Create `components/newsletter/NewsletterForm.tsx`: reusable accessible client form.
- Create `components/newsletter/newsletter.module.css`: Kaasies visual system and responsive/reduced-motion states.
- Modify `components/layout/SiteFooter.tsx`: add the standalone newsletter block.
- Modify `components/layout/layout.module.css`: footer layout integration only.
- Modify `components/checkout/CheckoutForm.tsx`: perform optional non-blocking signup after valid local checkout submission.
- Modify `components/checkout/checkout.module.css`: newsletter-specific checkout status treatment.

### Tests

- Create `tests/unit/newsletter-validation.test.ts`.
- Create `tests/unit/newsletter-listmonk.test.ts`.
- Create `tests/unit/newsletter-subscribe.test.ts`.
- Create `tests/unit/newsletter-route.test.ts`.
- Create `tests/components/newsletter-form.test.tsx`.
- Modify `tests/components/checkout-form.test.tsx`.
- Create `tests/e2e/newsletter.spec.ts`.

---

### Task 1: Inspect QDE and freeze the deployment runbook

**Files:**
- Create: `docs/runbooks/listmonk-qde.md`

**Interfaces:**
- Consumes: SSH access through the user's key and the approved QDE host.
- Produces: a committed runbook naming the detected proxy, public web network, available ports, deployment directory, backup directory, and rollback commands.

- [ ] **Step 1: Record local preconditions without connecting**

Run:

```bash
ssh -G qde | sed -n 's/^\(hostname\|user\|identityfile\|port\) /\1 /p'
```

Expected: a resolved hostname, non-root SSH user, explicit key path, and SSH port. If the `qde` alias is absent, stop and ask the user to add a scoped SSH host entry; do not place an IP or private key in Git.

- [ ] **Step 2: Inspect the VPS read-only**

Run:

```bash
ssh qde 'set -eu; uname -a; cat /etc/os-release; df -h /; free -h; docker --version; docker compose version; docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"; sudo ss -lntup; sudo ufw status verbose; systemctl is-active caddy || true; systemctl is-active nginx || true; systemctl is-active traefik || true'
```

Expected: Ubuntu details, sufficient free disk and memory, detected Docker/Compose status, listening ports, firewall state, and exactly identified reverse-proxy owner. This step makes no changes.

- [ ] **Step 3: Inspect proxy and Docker network configuration read-only**

For Caddy run:

```bash
ssh qde 'sudo caddy validate --config /etc/caddy/Caddyfile; sudo sed -n "1,240p" /etc/caddy/Caddyfile; docker network ls'
```

For Nginx run:

```bash
ssh qde 'sudo nginx -T; docker network ls'
```

For a Dockerized Traefik proxy run:

```bash
ssh qde 'docker ps --filter name=traefik; docker inspect traefik --format "{{json .NetworkSettings.Networks}}"; docker network ls'
```

Expected: one applicable command succeeds and identifies how a container becomes reachable from the existing proxy. Do not run all mutation paths.

- [ ] **Step 4: Write the exact runbook**

Create `docs/runbooks/listmonk-qde.md` with these fixed headings and fill them only with observed values from Steps 1–3:

```markdown
# Listmonk on QDE
## Observed host state
## Deployment and backup directories
## Existing reverse proxy and shared network
## Firewall and public ports
## Pre-deploy checks
## Deploy commands
## Proxy validation and reload
## Health checks
## Backup and restore test
## Upgrade procedure
## Rollback procedure
```

The deploy directory must be a dedicated path such as `/opt/kaasies-listmonk`; backups must be outside the application volume. The rollback procedure must use the prior pinned image tag and must not delete database volumes.

- [ ] **Step 5: Verify and commit the runbook**

Run:

```bash
if rg -n 'TBD|TODO|FIXME' docs/runbooks/listmonk-qde.md; then exit 1; fi
git diff --check -- docs/runbooks/listmonk-qde.md
git add docs/runbooks/listmonk-qde.md
git commit -m "docs: add QDE Listmonk deployment runbook"
```

Expected: the first command finds no placeholders or secrets, diff check passes, and only the runbook is committed.

### Task 2: Add the isolated Listmonk stack and backup tooling

**Files:**
- Create: `ops/listmonk/compose.yml`
- Create: `ops/listmonk/.env.example`
- Create: `ops/listmonk/backup.sh`
- Create: `ops/listmonk/restore-test.sh`
- Test: Docker Compose config validation and ShellCheck when available.

**Interfaces:**
- Consumes: exact proxy network and directories recorded by Task 1.
- Produces: `listmonk`, `db`, named volumes, private `listmonk_internal` network, `GET /health`, daily dump files, and a non-destructive restore check.

- [ ] **Step 1: Write a Compose validation script that initially fails**

Add this verification block to the runbook and run it before creating `compose.yml`:

```bash
docker compose --env-file ops/listmonk/.env.example -f ops/listmonk/compose.yml config --quiet
```

Expected: FAIL because the Compose and environment files do not exist.

- [ ] **Step 2: Create the safe environment contract**

Create `ops/listmonk/.env.example` containing variable names and safe local-only sample values:

```dotenv
LISTMONK_IMAGE=knadh/listmonk:v6.2.0
POSTGRES_IMAGE=postgres:17.9-alpine
POSTGRES_DB=listmonk
POSTGRES_USER=listmonk
POSTGRES_PASSWORD=change-through-server-secret-file
LISTMONK_ADMIN_USER=change-on-first-login
LISTMONK_ADMIN_PASSWORD=change-through-server-secret-file
LISTMONK_PUBLIC_URL=https://nieuwsbrief.kaasies.com
LISTMONK_PORT=127.0.0.1:9000
BACKUP_RETENTION_DAYS=14
```

These are the stable versions verified during plan authoring. Before execution, compare them once against the official Listmonk releases and PostgreSQL image tags; change them only to a newer stable, non-beta exact tag, and never use `latest`.

- [ ] **Step 3: Create the Compose stack**

Create `ops/listmonk/compose.yml` with:

```yaml
services:
  db:
    image: ${POSTGRES_IMAGE}
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 10
    volumes:
      - listmonk_db:/var/lib/postgresql/data
    networks: [listmonk_internal]

  listmonk:
    image: ${LISTMONK_IMAGE}
    restart: unless-stopped
    command:
      - sh
      - -c
      - >-
        ./listmonk --install --idempotent --yes --config '' &&
        ./listmonk --upgrade --yes --config '' &&
        ./listmonk --config '' --static-dir /listmonk/static
    depends_on:
      db:
        condition: service_healthy
    environment:
      LISTMONK_app__address: 0.0.0.0:9000
      LISTMONK_db__host: db
      LISTMONK_db__port: 5432
      LISTMONK_db__user: ${POSTGRES_USER}
      LISTMONK_db__password: ${POSTGRES_PASSWORD}
      LISTMONK_db__database: ${POSTGRES_DB}
      LISTMONK_db__ssl_mode: disable
      LISTMONK_ADMIN_USER: ${LISTMONK_ADMIN_USER}
      LISTMONK_ADMIN_PASSWORD: ${LISTMONK_ADMIN_PASSWORD}
    ports:
      - ${LISTMONK_PORT}:9000
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:9000/health"]
      interval: 15s
      timeout: 5s
      retries: 10
    volumes:
      - listmonk_uploads:/listmonk/uploads
      - ./templates/public:/listmonk/static/public:ro
      - ./templates/email:/listmonk/static/email:ro
    networks: [listmonk_internal]

networks:
  listmonk_internal:
    internal: true

volumes:
  listmonk_db:
  listmonk_uploads:
```

Adjust only the published-port or external-network section to match Task 1. If the proxy is containerized, attach `listmonk` to the observed external proxy network and remove host publishing; keep `db` private.

- [ ] **Step 4: Add backup and isolated restore scripts**

`backup.sh` must use `set -euo pipefail`, `umask 077`, `docker compose exec -T db pg_dump -Fc`, a timestamped `.dump` name, `find "$BACKUP_DIR" -type f -name '*.dump' -mtime +"$BACKUP_RETENTION_DAYS" -delete`, and a non-empty-file assertion.

`restore-test.sh` must create a temporary PostgreSQL container on a temporary Docker volume, restore the newest dump with `pg_restore --exit-on-error`, query the schema, then remove only the temporary container and its explicitly named temporary volume. It must never connect to or overwrite the production database.

- [ ] **Step 5: Validate the stack and scripts**

Run:

```bash
docker compose --env-file ops/listmonk/.env.example -f ops/listmonk/compose.yml config --quiet
bash -n ops/listmonk/backup.sh
bash -n ops/listmonk/restore-test.sh
git diff --check -- ops/listmonk
```

Expected: all commands exit zero.

- [ ] **Step 6: Commit**

```bash
git add ops/listmonk docs/runbooks/listmonk-qde.md
git commit -m "ops: add isolated Listmonk stack and backups"
```

### Task 3: Deploy Listmonk safely on QDE

**Files:**
- Modify: `docs/runbooks/listmonk-qde.md` only if observed deployment behavior requires a factual correction.

**Interfaces:**
- Consumes: Task 2 stack and a server-local secret environment file.
- Produces: healthy local Listmonk service and verified daily backup job; no public DNS dependency yet.

- [ ] **Step 1: Create server directories and copy non-secret files**

Use the exact paths from the runbook. The command shape is:

```bash
ssh qde 'sudo install -d -m 750 -o "$USER" -g "$USER" /opt/kaasies-listmonk /var/backups/kaasies-listmonk'
rsync -av --delete --exclude '.env' ops/listmonk/ qde:/opt/kaasies-listmonk/
```

Expected: only the dedicated application and backup directories change.

- [ ] **Step 2: Create server-only secrets interactively**

On QDE create `/opt/kaasies-listmonk/.env` with mode `600`, using independent random values for database and admin passwords. Do not print values back to the terminal transcript. Verify only names and permissions:

```bash
ssh qde 'stat -c "%a %U %G %n" /opt/kaasies-listmonk/.env; sed -E "s/=.*/=<redacted>/" /opt/kaasies-listmonk/.env'
```

Expected: mode `600`; all required keys present; values redacted. The one `POSTGRES_PASSWORD` value is shared by PostgreSQL and Listmonk because they authenticate to the same database role; it remains independent from the Listmonk administrator password.

- [ ] **Step 3: Validate then start**

```bash
ssh qde 'cd /opt/kaasies-listmonk && docker compose --env-file .env config --quiet && docker compose --env-file .env pull && docker compose --env-file .env up -d && docker compose --env-file .env ps'
```

Expected: database and Listmonk become healthy; database has no public port.

- [ ] **Step 4: Verify health and persistence**

```bash
ssh qde 'curl --fail --silent http://127.0.0.1:9000/health; cd /opt/kaasies-listmonk && docker compose --env-file .env restart listmonk && docker compose --env-file .env ps'
```

Expected: health succeeds before and after restart.

- [ ] **Step 5: Install and test backup scheduling**

Install a root-owned systemd service and timer that run `backup.sh` daily. Then run the service manually and execute `restore-test.sh`.

```bash
ssh qde 'sudo systemctl daemon-reload; sudo systemctl enable --now kaasies-listmonk-backup.timer; sudo systemctl start kaasies-listmonk-backup.service; sudo systemctl status --no-pager kaasies-listmonk-backup.service kaasies-listmonk-backup.timer; sudo /opt/kaasies-listmonk/restore-test.sh'
```

Expected: a non-empty dump exists with restricted permissions and restore validation exits zero.

### Task 4: Publish the subdomain and authenticate Resend

**Files:**
- Create: `docs/runbooks/resend-listmonk.md`
- Modify: `docs/runbooks/listmonk-qde.md`

**Interfaces:**
- Consumes: healthy local Listmonk, HostSlim DNS access, and Resend account access.
- Produces: valid HTTPS origin, authenticated sending domain, working SMTP test, and documented throttling limits.

- [ ] **Step 1: Add the exact proxy route from the detected proxy**

For Caddy, the site block is:

```caddyfile
nieuwsbrief.kaasies.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:9000
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

For Nginx, use a dedicated server block with `proxy_pass http://127.0.0.1:9000`, forwarded host/protocol headers, and Certbot-managed TLS. For Traefik, add only the router/service labels and external network observed in Task 1. Validate configuration before reload.

- [ ] **Step 2: Add DNS and verify resolution**

At HostSlim create an `A` record for `nieuwsbrief` pointing to the QDE IPv4 address and an `AAAA` record only if QDE IPv6 routing and firewall were verified in Task 1. Do not alter apex, `www`, MX, mail host, or existing SPF records.

Run:

```bash
dig +short A nieuwsbrief.kaasies.com
dig +short AAAA nieuwsbrief.kaasies.com
curl --fail --silent --show-error --head https://nieuwsbrief.kaasies.com
```

Expected: DNS resolves only to verified QDE addresses and HTTPS presents a valid certificate.

- [ ] **Step 3: Configure Resend domain authentication**

Create the sending domain in Resend. Add its exact DKIM and return-path records at HostSlim. Merge, rather than replace, any existing SPF authorization. Begin DMARC with reporting enabled and a non-disruptive policy while results are observed.

Verify:

```bash
dig +short TXT kaasies.com
dig +short TXT _dmarc.kaasies.com
```

Expected: one valid SPF policy for the root, the Resend DKIM selector resolves, DMARC resolves, and Resend reports the domain as verified.

- [ ] **Step 4: Configure SMTP and test list inside Listmonk**

Add Resend SMTP host, port, username, and password through Listmonk's administrator settings. Create:

- `Kaasies intern` as a private test list;
- `Kaasies nieuwsbrief` as the public double-opt-in list.

Set the public origin to `https://nieuwsbrief.kaasies.com`, configure the envelope/from address on the authenticated domain, and set the initial send rate no higher than the active Resend daily allowance.

- [ ] **Step 5: Write and commit the Resend runbook**

Document DNS record purposes without secret values, sender identity, list names, daily plan limit, campaign splitting rule, bounce/unsubscribe ownership, and upgrade trigger. Then run:

```bash
if rg -n 'TBD|TODO|FIXME' docs/runbooks/resend-listmonk.md; then exit 1; fi
git diff --check -- docs/runbooks
git add docs/runbooks/listmonk-qde.md docs/runbooks/resend-listmonk.md
git commit -m "docs: add Listmonk delivery and DNS runbook"
```

Expected: no secrets or placeholders and a documentation-only commit.

### Task 5: Build and install Kaasies public and email templates

**Files:**
- Create: `ops/listmonk/templates/public/index.html`
- Create: `ops/listmonk/templates/public/optin.html`
- Create: `ops/listmonk/templates/public/subscription.html`
- Create: `ops/listmonk/templates/public/subscription-form.html`
- Create: `ops/listmonk/templates/public/message.html`
- Create: `ops/listmonk/templates/email/base.html`
- Create: `ops/listmonk/templates/email/subscriber-optin.html`
- Create: `ops/listmonk/templates/email/campaign.html`
- Create: `ops/listmonk/templates/email/campaign.txt`
- Test: rendered Listmonk templates through the internal list.

**Interfaces:**
- Consumes: current Kaasies logo, palette, Dutch brand voice, and Listmonk template variables.
- Produces: customer-visible confirmation, subscription management, unsubscribe, hosted archive, system email, campaign HTML, and plain-text campaign shell.

- [ ] **Step 1: Capture required Listmonk template contracts**

Against the installed version, export the current system templates and confirm the variable names for confirmation URL, unsubscribe URL, preferences URL, message URL, subscriber name, and campaign content. Record the exact version and variables in `docs/runbooks/resend-listmonk.md`.

Expected: template work uses installed-version contracts, not guessed variables.

- [ ] **Step 2: Write template contract checks before templates**

Add a shell verification section that asserts:

```bash
test "$(rg -l 'UnsubscribeURL' ops/listmonk/templates/email/campaign.html | wc -l | tr -d ' ')" = "1"
test "$(rg -l 'MessageURL' ops/listmonk/templates/email/campaign.html | wc -l | tr -d ' ')" = "1"
test "$(rg -l 'OptinURL' ops/listmonk/templates/email/subscriber-optin.html | wc -l | tr -d ' ')" = "1"
rg -n 'Kaasies|Controleer je inbox|Afmelden|Voorkeuren' ops/listmonk/templates
```

Run before files exist. Expected: FAIL.

- [ ] **Step 3: Implement the Kaasies public theme**

Use semantic HTML, the logo asset, cream/ink/signal colors, 44px minimum interactive targets, visible focus, responsive widths, and `prefers-reduced-motion`. Provide designed states for confirmation, expired link, already confirmed, subscription management, unsubscribe, and hosted message. Do not load customer tracking scripts.

- [ ] **Step 4: Implement email-safe templates**

Use a 600px fluid table shell, inline-compatible CSS, meaningful image alt text, hidden preheader, safe system-font stack, visible hosted-version link, one unsubscribe link, preference link, organization identity, and physical/contact footer required for legitimate sending. Include a plain-text campaign template with the same essential links.

- [ ] **Step 5: Run contract checks and visual email tests**

Run the checks from Step 2, mount templates on QDE, restart only Listmonk, and send the internal campaign to Gmail, Outlook, and Apple Mail test accounts. Check desktop, mobile, light mode, dark mode, image blocking, keyboard focus on hosted pages, confirmation, preferences, and unsubscribe.

Expected: all required URLs function and no public page presents default Listmonk styling.

- [ ] **Step 6: Commit**

```bash
git add ops/listmonk/templates docs/runbooks/resend-listmonk.md
git commit -m "feat: add branded Listmonk templates"
```

### Task 6: Define newsletter types and validation with TDD

**Files:**
- Create: `lib/newsletter/types.ts`
- Create: `lib/newsletter/validation.ts`
- Test: `tests/unit/newsletter-validation.test.ts`

**Interfaces:**
- Produces: `NewsletterSource`, `NewsletterInput`, `ValidatedNewsletterInput`, `NewsletterValidationResult`, and `validateNewsletterInput(input: unknown): NewsletterValidationResult`.

- [ ] **Step 1: Write failing validation tests**

Create tests covering this contract:

```ts
expect(validateNewsletterInput({
  email: '  KLAAS@Example.COM ',
  name: '  Klaas  ',
  consent: true,
  website: '',
  source: 'newsletter-block',
})).toEqual({
  ok: true,
  value: {
    email: 'klaas@example.com',
    name: 'Klaas',
    consent: true,
    website: '',
    source: 'newsletter-block',
  },
});
```

Also assert Dutch field errors for blank/invalid email, `consent !== true`, name longer than 100 characters, email longer than 254 characters, non-empty honeypot preservation, and sources outside `footer | newsletter-block | checkout`.

- [ ] **Step 2: Run tests to verify RED**

```bash
npm run test:run -- tests/unit/newsletter-validation.test.ts
```

Expected: FAIL because the newsletter modules do not exist.

- [ ] **Step 3: Implement focused types and validation**

Define:

```ts
export type NewsletterSource = 'footer' | 'newsletter-block' | 'checkout';
export type ValidatedNewsletterInput = {
  email: string;
  name: string;
  consent: true;
  website: string;
  source: NewsletterSource;
};
export type NewsletterValidationResult =
  | { ok: true; value: ValidatedNewsletterInput }
  | { ok: false; errors: Partial<Record<'email' | 'name' | 'consent' | 'source', string>> };
```

Validation must be pure, trim names, lowercase email, accept only plain-object input, and not treat a filled honeypot as a validation error.

- [ ] **Step 4: Run GREEN and commit**

```bash
npm run test:run -- tests/unit/newsletter-validation.test.ts
git add lib/newsletter/types.ts lib/newsletter/validation.ts tests/unit/newsletter-validation.test.ts
git commit -m "feat: validate newsletter subscriptions"
```

Expected: tests pass.

### Task 7: Implement the Listmonk adapter and orchestration with TDD

**Files:**
- Create: `lib/newsletter/config.ts`
- Create: `lib/newsletter/listmonk.ts`
- Create: `lib/newsletter/rate-limit.ts`
- Create: `lib/newsletter/subscribe.ts`
- Test: `tests/unit/newsletter-listmonk.test.ts`
- Test: `tests/unit/newsletter-subscribe.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `ValidatedNewsletterInput` from Task 6.
- Produces: `NewsletterConfig`, `ListmonkClient.subscribe(input, signal)`, `RateLimiter.limit(key)`, and `subscribeToNewsletter(rawInput, context, dependencies): Promise<NewsletterResult>`.

- [ ] **Step 1: Install the server-side rate-limit dependencies**

```bash
npm install @upstash/ratelimit @upstash/redis server-only
```

Expected: exact compatible versions are locked in `package-lock.json`; no client component imports them.

- [ ] **Step 2: Write failing adapter tests**

Test a successful Listmonk call, duplicate/already-subscribed response, non-2xx response, abort timeout, malformed upstream response, and payload privacy. Assert the outbound body contains only email, optional name, list identifier, source attribute, and double-opt-in flags supported by the installed API.

Use injected `fetch` and fake timers; do not make network calls in unit tests.

- [ ] **Step 3: Run adapter tests to verify RED**

```bash
npm run test:run -- tests/unit/newsletter-listmonk.test.ts
```

Expected: FAIL because the adapter does not exist.

- [ ] **Step 4: Implement config and adapter**

`config.ts` must import `server-only` and require:

```ts
type NewsletterConfig = {
  listmonkOrigin: string;
  listmonkListId: number;
  listmonkApiUser: string;
  listmonkApiToken: string;
  requestTimeoutMs: number;
  upstashUrl: string;
  upstashToken: string;
};
```

Reject non-HTTPS origins outside test mode, non-positive list IDs, missing credentials, and timeouts outside 500–10,000ms. Use an `AbortController` and map safe duplicate responses to `{ kind: 'accepted' }`; map timeouts and upstream failures to typed results without including response bodies or secrets in errors.

- [ ] **Step 5: Write failing orchestration tests**

Cover invalid input, filled honeypot, rate-limit rejection, accepted new subscription, accepted duplicate, timeout, upstream outage, and hashed rate-limit keys. Assert the limiter and Listmonk client are not called for invalid input; Listmonk is not called for honeypot or limited input.

- [ ] **Step 6: Implement orchestration and limiter**

Define:

```ts
export type NewsletterResult =
  | { kind: 'accepted' }
  | { kind: 'invalid'; errors: Record<string, string> }
  | { kind: 'rate-limited' }
  | { kind: 'unavailable' };

export type NewsletterContext = { requestKey: string };
```

Hash the request key with a server-only salt before sending it to Redis. Use a sliding window of 5 attempts per 15 minutes. The honeypot path returns `accepted` without writing to Redis or Listmonk.

- [ ] **Step 7: Run tests and commit**

```bash
npm run test:run -- tests/unit/newsletter-listmonk.test.ts tests/unit/newsletter-subscribe.test.ts
npm run typecheck
git add package.json package-lock.json lib/newsletter tests/unit/newsletter-listmonk.test.ts tests/unit/newsletter-subscribe.test.ts
git commit -m "feat: add resilient Listmonk subscription service"
```

### Task 8: Add the server-only newsletter route with TDD

**Files:**
- Create: `app/api/newsletter/subscribe/route.ts`
- Test: `tests/unit/newsletter-route.test.ts`
- Modify: `.env.example` or create it if absent.

**Interfaces:**
- Consumes: `subscribeToNewsletter` from Task 7.
- Produces: `POST /api/newsletter/subscribe` with JSON responses and no public secrets.

- [ ] **Step 1: Write failing route tests**

Test:

```ts
expect(await response.json()).toEqual({
  ok: true,
  message: 'Controleer je inbox om je inschrijving te bevestigen.',
});
```

Assert status `200` for accepted/duplicate/honeypot, `400` with field errors for invalid input, `429` for limited input, `503` for upstream unavailable, `405` for unsupported methods through framework behavior, and `Content-Type: application/json`. Test a body larger than 4KB and malformed JSON as `400`.

- [ ] **Step 2: Run RED**

```bash
npm run test:run -- tests/unit/newsletter-route.test.ts
```

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement the route**

Read at most 4KB, parse JSON safely, derive a request key from trusted Vercel forwarding headers with a constant fallback, and call the Task 7 orchestration. Return only public Dutch messages. Add `Cache-Control: no-store` and never log request bodies.

Document only these names in `.env.example`, using empty values:

```dotenv
LISTMONK_ORIGIN=
LISTMONK_LIST_ID=
LISTMONK_API_USER=
LISTMONK_API_TOKEN=
NEWSLETTER_REQUEST_TIMEOUT_MS=4000
NEWSLETTER_RATE_LIMIT_SALT=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

- [ ] **Step 4: Run GREEN, bundle guard, and commit**

```bash
npm run test:run -- tests/unit/newsletter-route.test.ts
npm run typecheck
npm run build
if rg -n 'LISTMONK_API_TOKEN|UPSTASH_REDIS_REST_TOKEN' .next/static; then exit 1; fi
git add app/api/newsletter/subscribe/route.ts tests/unit/newsletter-route.test.ts .env.example
git commit -m "feat: expose secure newsletter subscription route"
```

Expected: tests, typecheck, and build pass; secrets are absent from client assets.

### Task 9: Build the branded standalone form with TDD

**Files:**
- Create: `components/newsletter/NewsletterForm.tsx`
- Create: `components/newsletter/newsletter.module.css`
- Create: `tests/components/newsletter-form.test.tsx`
- Modify: `components/layout/SiteFooter.tsx`
- Modify: `components/layout/layout.module.css`

**Interfaces:**
- Consumes: `POST /api/newsletter/subscribe` from Task 8.
- Produces: `<NewsletterForm source="footer" | "newsletter-block" />` with accessible idle, validation, loading, success, limited, and unavailable states.

- [ ] **Step 1: Write failing component tests**

Cover optional first name, required email, unchecked required consent, hidden honeypot, source, disabled loading button, success copy, focus on first invalid field, neutral success, server field errors, rate-limit message, unavailable retry message, and no field clearing on failure. Assert the success status is announced with `role="status"` and errors use `aria-describedby`.

- [ ] **Step 2: Run RED**

```bash
npm run test:run -- tests/components/newsletter-form.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the form behavior**

Use a client component with controlled fields, an `AbortController`, `fetch('/api/newsletter/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body })`, and a stable request state union:

```ts
type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string; fieldErrors?: Record<string, string> };
```

Clear email/name only after success. Preserve them after errors. Prevent double submits.

- [ ] **Step 4: Implement the Kaasies visual treatment**

Use a strong signal-color panel, 2px ink borders, offset ink shadow, Bricolage heading, larger ASAP body copy, 48px inputs, 44px minimum button, visible focus, responsive single-column layout, and subtle button/panel movement disabled by `prefers-reduced-motion`. Include distinct but brand-consistent success and unavailable panels; do not use generic blue.

- [ ] **Step 5: Integrate in the footer and run GREEN**

Place the newsletter block before the existing footer identity/nav area so it is prominent without obscuring navigation. Then run:

```bash
npm run test:run -- tests/components/newsletter-form.test.tsx tests/components/site-header.test.tsx
npm run lint
npm run typecheck
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add components/newsletter components/layout tests/components/newsletter-form.test.tsx
git commit -m "feat: add branded newsletter signup"
```

### Task 10: Connect optional checkout consent without blocking checkout

**Files:**
- Modify: `components/checkout/CheckoutForm.tsx`
- Modify: `components/checkout/checkout.module.css`
- Modify: `tests/components/checkout-form.test.tsx`

**Interfaces:**
- Consumes: newsletter route from Task 8 and existing `CheckoutFields.newsletter` boolean.
- Produces: one optional checkout-triggered newsletter request with `source: 'checkout'`; checkout confirmation remains authoritative.

- [ ] **Step 1: Add failing checkout tests**

Assert:

- no newsletter request when the box is unchecked;
- no request when local checkout validation fails;
- one request after valid submission with the box checked;
- body contains email, first-name-or-name, `consent: true`, empty honeypot, and `source: 'checkout'` only;
- checkout confirmation appears even if the newsletter endpoint returns `503` or fetch rejects;
- a separate friendly newsletter status is announced on success or failure;
- the button cannot create duplicate requests while submission is active.

- [ ] **Step 2: Run RED**

```bash
npm run test:run -- tests/components/checkout-form.test.tsx
```

Expected: the new network-behavior assertions fail.

- [ ] **Step 3: Implement non-blocking checkout signup**

After `validateCheckout` succeeds, set the existing checkout confirmation immediately. If `fields.newsletter` is true, call the newsletter route in a separate guarded async path. Never remove or delay checkout confirmation because of newsletter outcome. Render the newsletter result in its own `role="status"` region.

- [ ] **Step 4: Style the secondary status and run GREEN**

Use a compact, bordered Kaasies status panel that is visually subordinate to checkout confirmation. Then run:

```bash
npm run test:run -- tests/components/checkout-form.test.tsx tests/components/newsletter-form.test.tsx
npm run lint
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add components/checkout tests/components/checkout-form.test.tsx
git commit -m "feat: connect optional checkout newsletter consent"
```

### Task 11: Configure production secrets and end-to-end activation

**Files:**
- Create: `tests/e2e/newsletter.spec.ts`
- Modify: `docs/runbooks/resend-listmonk.md`

**Interfaces:**
- Consumes: deployed QDE Listmonk, production list ID, Upstash Redis, and Vercel project.
- Produces: production-configured server endpoint and a verified internal browser-to-inbox flow.

- [ ] **Step 1: Write E2E tests against a controlled test adapter**

Create browser tests for keyboard-only footer signup, invalid email focus, unchecked consent, mocked success, mocked `429`, mocked `503`, responsive mobile layout, reduced motion, and opted-in checkout continuing after mocked newsletter failure. Route interception must prevent real subscriber creation in automated tests.

- [ ] **Step 2: Run E2E RED then GREEN**

Run before implementation completion to prove missing behavior, then after completion:

```bash
npm run test:e2e -- tests/e2e/newsletter.spec.ts --project=chromium
```

Expected final result: PASS. Preserve and do not silently rewrite the pre-existing uncommitted storefront E2E changes.

- [ ] **Step 3: Add production environment variables through Vercel CLI**

Use `vercel env add` interactively for production and preview as appropriate. Add the exact names from Task 8; never pass secret values in shell history. Pull only into a gitignored local file for verification.

Run:

```bash
vercel env ls
git status --short
```

Expected: variable names exist in Vercel and no secret file is staged.

- [ ] **Step 4: Deploy preview and run an internal live test**

Deploy a preview, point it at the Listmonk internal test list, subscribe a controlled address, confirm double opt-in, receive one internal campaign, view the hosted version, update preferences, and unsubscribe. Confirm one subscriber record and no checkout/address/order fields.

- [ ] **Step 5: Switch production to the production list and deploy**

After the internal path passes, set `LISTMONK_LIST_ID` to the production double-opt-in list for production only and deploy. Keep preview on the internal list.

- [ ] **Step 6: Verify production without adding a real campaign audience**

Run:

```bash
curl --fail --silent --show-error --head https://kaasies.com
curl --fail --silent --show-error --head https://nieuwsbrief.kaasies.com
dig +short TXT kaasies.com
dig +short TXT _dmarc.kaasies.com
```

Use one controlled production subscription to verify confirmation and immediate unsubscribe. Check Vercel and Listmonk logs for errors without copying personal data into the repository.

- [ ] **Step 7: Commit E2E coverage and final runbook facts**

```bash
git add tests/e2e/newsletter.spec.ts docs/runbooks/resend-listmonk.md
git commit -m "test: verify newsletter customer journey"
```

### Task 12: Full verification, operational handoff, and release gate

**Files:**
- Modify: `docs/runbooks/listmonk-qde.md`
- Modify: `docs/runbooks/resend-listmonk.md`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a reproducible release record and an explicit go/no-go decision.

- [ ] **Step 1: Run the complete local quality suite**

```bash
npm run test:run
npm run test:domain
npm run lint
npm run typecheck
npm run build
npm run test:e2e
git diff --check
```

Expected: every command exits zero. If unrelated pre-existing E2E changes fail, isolate and report them; do not discard them or claim newsletter completion until the relevant newsletter suite passes.

- [ ] **Step 2: Run production infrastructure checks**

Verify containers healthy, database private, HTTPS valid, proxy headers present, firewall unchanged except intended web access, backup timer active, newest dump non-empty, restore test successful, and disk/memory within safe margins.

- [ ] **Step 3: Run deliverability and brand acceptance checks**

Confirm SPF, DKIM, and DMARC pass in received-message headers. Review Gmail, Outlook, Apple Mail, mobile, dark mode, blocked images, hosted archive, double opt-in, preference, and unsubscribe views against the brand requirements in the spec. Reject release if any customer-visible view falls back to default Listmonk styling.

- [ ] **Step 4: Exercise failure paths**

Temporarily point preview to an unreachable test origin and confirm standalone signup reports availability failure while the site works. Confirm checkout still produces its normal confirmation with newsletter opted in. Restore preview configuration immediately after the test.

- [ ] **Step 5: Record operational facts and commit**

Add the verified backup schedule, retention, restore-test date, pinned image versions, sender identity, active list names, rate limit, monitoring checks, upgrade trigger, and rollback command to the runbooks without secrets.

```bash
if rg -n 'TBD|TODO|FIXME' docs/runbooks; then exit 1; fi
git diff --check
git add docs/runbooks/listmonk-qde.md docs/runbooks/resend-listmonk.md
git commit -m "docs: finalize newsletter operations handoff"
```

- [ ] **Step 6: Apply the release gate**

Release only when all automated checks pass, the production controlled-address cycle succeeds, backup restoration succeeds, brand review passes, and newsletter failure remains isolated from checkout. Otherwise keep the public form disabled and document the failing check rather than weakening the requirement.
