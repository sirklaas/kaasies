# Task 10 — SEO, route states and audit

## Delivered

- `app/sitemap.ts` builds the public sitemap from the catalog, campaign and public-route adapters. It contains 12 canonical `https://kaasies.com` URLs and omits the draft story.
- `app/robots.ts` permits crawling and advertises `https://kaasies.com/sitemap.xml`.
- Root, shop, product, stories, story and each published static page declare a per-route canonical alternate.
- Added resilient root route states: `not-found.tsx`, client-side `error.tsx` with reset, and `loading.tsx`.
- Added a sitemap unit test and a Playwright audit for every sitemap URL: HTTP 200, one H1, title, description, production canonical, no horizontal overflow and no browser `console.error`.
- Playwright now starts a local Next server unless `BASE_URL` is supplied for preview/deployed auditing.

## TDD evidence

- RED: `npm run test:run -- tests/unit/seo.test.ts` failed because the sitemap module did not exist.
- GREEN: the same test passed after the adapter-backed sitemap was added.
- The browser audit found a real overflow on `/shop/oud`; `overflow-wrap: anywhere` on the product H1 fixes the long product name without changing route content.

## Final verification

```text
npm run test:run -- tests/unit/seo.test.ts  # 1 passed
npm run build                                # succeeded
npm run test:e2e -- tests/e2e/site-audit.spec.ts  # 1 passed
```

The Next development server emits its existing LCP image advisory during the browser run; the audit observed no browser `console.error` messages.

## Fix round 1

- Playwright preview runs now use `PLAYWRIGHT_BASE_URL`; its presence disables the local `webServer`.
- `/mandje` and `/checkout` now provide distinct title, description and canonical metadata, and set `noindex, nofollow`. They remain outside the 12-route content sitemap.
- The browser audit includes both transactional routes and waits for two client animation frames after navigation before checking console errors.
- Added durable ignores for framework-generated `AGENTS.md` and `CLAUDE.md`. A final production build restored the tracked `next-env.d.ts` file, leaving no generated files to commit.

Verification for this round: 39 unit tests, 6 domain tests, typecheck, lint, production build, and the expanded Playwright route audit all completed successfully.
