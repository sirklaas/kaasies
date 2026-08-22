# Kaasies Listmonk Mailing List Design

**Status:** approved design, awaiting written-spec review  
**Date:** 2026-08-22  
**Scope:** newsletter infrastructure, subscription journey, and Kaasies-branded customer touchpoints

## 1. Goal

Add a reliable, privacy-conscious mailing list to kaasies.com without making newsletter availability a dependency for shopping or checkout. Customers subscribe through the Kaasies website, confirm their address by email, and thereafter receive campaigns managed in Listmonk.

All customer-facing screens and messages must look and sound unmistakably like Kaasies. Brand quality is an acceptance requirement, not a later enhancement.

## 2. Selected approach

Run Listmonk and its own PostgreSQL database as an isolated Docker Compose stack on the existing QDE VPS. Publish Listmonk over HTTPS at `nieuwsbrief.kaasies.com`. Use Resend as the SMTP relay, beginning with its free allowance and enforcing a conservative sending rate.

The Next.js application on Vercel owns the public subscription form and exposes a server-only endpoint at `POST /api/newsletter/subscribe`. That endpoint talks to Listmonk; the browser never receives Listmonk administrative credentials.

This approach was selected over:

- embedding Listmonk directly in the storefront, which would expose implementation details and weaken design control;
- storing newsletter subscriptions in PocketBase and synchronizing later, which would introduce a second source of truth;
- using a hosted all-in-one newsletter platform, which would reduce control over styling, data, and operating cost.

## 3. System boundaries

### 3.1 QDE VPS

The VPS hosts:

- one Listmonk application container;
- one dedicated PostgreSQL container and persistent database volume;
- persistent Listmonk assets where required;
- a reverse-proxy route for `nieuwsbrief.kaasies.com` with automatic TLS;
- daily encrypted or access-restricted database backups with retention;
- firewall rules exposing only required public services.

Listmonk remains independent from PocketBase. It does not use PocketBase's database or administrative account.

Before installation, perform a read-only inspection of the VPS: operating system, Docker and Compose availability, free disk space, open ports, firewall, current reverse proxy, running containers, backup location, and existing resource usage. Installation must adapt to the proxy already in use instead of installing a competing proxy blindly.

### 3.2 Next.js on Vercel

The storefront contains:

- a reusable Kaasies newsletter form for a prominent standalone signup block;
- integration with the optional, unchecked newsletter checkbox in checkout;
- a server endpoint that validates and normalizes subscription requests;
- server-only Listmonk configuration through Vercel environment variables;
- neutral success responses that do not disclose whether an address already exists.

### 3.3 Resend

Resend provides SMTP delivery. Its credentials remain in Listmonk/VPS secrets only. The sending domain receives the SPF, DKIM, and DMARC records supplied by Resend. Initial sending is throttled to stay inside the selected plan limits. A campaign larger than the daily limit may be deliberately scheduled over multiple days, but time-sensitive campaigns require a plan with sufficient same-day capacity.

## 4. Customer journey

### 4.1 Standalone newsletter block

The form asks for:

- email address, required;
- first name, optional;
- explicit newsletter consent, required and unchecked by default;
- a hidden honeypot field that humans do not fill in.

On a valid request, the visible response is:

> Controleer je inbox om je inschrijving te bevestigen.

The response stays the same for a new subscriber, an existing subscriber, or a safely handled duplicate request.

### 4.2 Double opt-in

Listmonk sends a Kaasies-branded confirmation email. The customer becomes an active subscriber only after following the confirmation link. The confirmation, expired-link, already-confirmed, preference, and unsubscribe pages all use the Kaasies public-page theme.

### 4.3 Checkout

The checkout newsletter checkbox remains optional and unchecked. The newsletter request is made only after local checkout validation succeeds and only when the customer has opted in. Newsletter failure must never prevent checkout or payment. The interface may report a newsletter issue separately while preserving checkout progress.

The mailing system receives only the customer's email and optional first name. It never receives address, phone, order contents, payment state, or other checkout data.

## 5. API contract

`POST /api/newsletter/subscribe` accepts JSON containing:

- `email`: required string;
- `name`: optional string;
- `consent`: required boolean and must be `true`;
- `website`: honeypot string that must remain empty;
- `source`: allow-listed value such as `footer`, `newsletter-block`, or `checkout`.

The endpoint:

1. rejects malformed requests and oversized input;
2. normalizes the email and trims the name;
3. validates explicit consent;
4. silently treats a filled honeypot as accepted without creating a subscription;
5. rate-limits by a privacy-safe request key;
6. calls Listmonk's public subscription API with the one configured double-opt-in list;
7. applies a short upstream timeout;
8. maps safe duplicates to the normal success response;
9. logs operational failures without logging full customer data or secrets.

Expected responses:

- `200`: neutral success for accepted, duplicate, or honeypot requests;
- `400`: invalid fields or missing consent, with field-safe errors;
- `429`: excessive requests, with a friendly retry message;
- `503`: temporary upstream failure, with a retry message.

The exact Listmonk API path and payload must be verified against the installed Listmonk version during implementation. No administrative API credential may be exposed in browser code.

## 6. Brand and visual requirements

Every customer-visible newsletter touchpoint follows the current Kaasies design system:

- current Kaasies logo and bold palette;
- Bungee for the logotype where appropriate;
- Bricolage Grotesque-style display hierarchy and ASAP-style body hierarchy on the web;
- confident spacing, strong borders, generous buttons, and deliberate color contrast;
- concise, eigenwijze Dutch copy consistent with the brand voice;
- illustrations used selectively alongside product photography, never as generic decoration;
- purposeful micro-interactions on the website with reduced-motion support;
- no default Listmonk-blue or generic SaaS styling on public pages.

Email clients do not consistently support webfonts. Email templates therefore use robust system-font fallbacks while preserving the brand through scale, weight, palette, logo, layout, copy, and illustration. Templates use email-safe markup and inline or compatible CSS.

Required designed states include:

- idle, focus, validation, loading, success, rate-limit, and unavailable form states;
- double-opt-in email;
- welcome email;
- reusable campaign shell;
- confirmation and error pages;
- preference and unsubscribe pages;
- browser-hosted campaign archive;
- plain-text email fallback.

Unsubscribe controls remain easy to find and understand. Branding may make them attractive, but never obscure them.

The Listmonk administration interface may retain its standard functional appearance because customers do not see it.

## 7. Privacy and security

- Use double opt-in for the production list.
- Record consent source and subscription timestamps in Listmonk-compatible attributes where appropriate.
- Store only email, optional first name, subscription status, timestamps, and necessary delivery/bounce/unsubscribe data.
- Keep Listmonk admin, database, SMTP, and API secrets outside Git.
- Use a strong, unique Listmonk administrator account and rotate bootstrap credentials after setup.
- Protect the administrator surface with Listmonk authentication and, where compatible with operations, an additional reverse-proxy access control.
- Do not use or copy the plaintext PocketBase administrator credentials found in the local PocketBase skill. Those credentials must be rotated and removed independently before production use.
- Keep database ports private to the Docker network.
- Back up the database daily and verify that a backup can be restored.

## 8. Reliability and failure behavior

- If Listmonk is unavailable, the storefront remains available.
- A newsletter failure never blocks checkout.
- Client requests have a bounded timeout and do not wait indefinitely.
- Duplicate subscriptions are safe and idempotent from the customer's perspective.
- Listmonk remains the single source of truth for newsletter subscription status.
- Bounces and unsubscribes are handled by Listmonk and are never overwritten by storefront retries.
- Sending begins with an internal test list and low rate before real customers are activated.

## 9. Testing and verification

### 9.1 Automated tests

Add unit and integration coverage for:

- email and name normalization;
- required consent;
- source allow-listing;
- honeypot handling;
- neutral duplicate behavior;
- Listmonk timeout and outage behavior;
- rate limiting;
- secret-free browser bundles;
- checkout continuing when newsletter signup fails;
- accessible form labeling, keyboard behavior, focus, and status announcements.

Add browser coverage for the standalone form and the opted-in checkout path. Existing unrelated storefront test changes must be preserved and handled separately.

### 9.2 Manual acceptance

- Subscribe through kaasies.com and receive a branded double-opt-in message.
- Confirm, view the branded success page, and appear once on the intended Listmonk list.
- Receive Gmail, Outlook, and Apple Mail test messages on desktop and mobile.
- Check light and dark email modes.
- Verify links, hosted version, unsubscribe, preferences, and plain-text fallback.
- Verify SPF, DKIM, and DMARC alignment.
- Confirm that a Listmonk outage does not break browsing or checkout.
- Restore a backup into an isolated test database.

## 10. Rollout sequence

1. Obtain approved SSH-key access to QDE and inspect the server read-only.
2. Prepare the isolated Compose stack, secret files, volumes, and backups.
3. Add `nieuwsbrief.kaasies.com` to the existing reverse proxy and configure DNS/TLS.
4. Configure Resend and publish its verified SPF, DKIM, and DMARC records.
5. Create one production double-opt-in list and a separate internal test list.
6. Build the complete Kaasies email shell and public Listmonk theme.
7. Implement the Next.js endpoint and both signup entry points with tests.
8. Configure Vercel server environment variables.
9. Run end-to-end tests using the internal list and conservative sending rate.
10. Test backup restoration, then enable the production list.

## 11. Prerequisites and non-goals

Before infrastructure changes, the implementation requires SSH access through a user-controlled key, knowledge of the current reverse proxy, access to HostSlim DNS, and Resend SMTP/domain-verification credentials. Credentials must be provided through secure configuration, not chat or committed files.

This scope does not include marketing automation, customer segmentation based on purchases, abandoned-cart email, multilingual campaigns, or replacing transactional order email. Those can be designed as later, separate systems after the basic consented newsletter flow is stable.

## 12. Definition of done

The feature is complete when the QDE service is backed up and reachable over HTTPS, Resend authentication passes, both Kaasies signup paths work with double opt-in, customer-visible pages and messages meet the brand requirements, privacy and failure behavior are verified, automated checks pass, and an internal end-to-end campaign has been successfully sent and unsubscribed from without affecting checkout.
