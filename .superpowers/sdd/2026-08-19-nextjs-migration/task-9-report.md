# Task 9 report — merk- en servicepagina's

## Status

Completed. Added typed static content for exactly `manifest`, `makers`, `service`, and `contact`, along with static routes that each render one record and one H1.

The copy keeps unverified supplier, origin, operational, and contact information explicitly provisional. The contact route contains no form, contact details, or response-time promise.

## Verification

- `npm run test:run -- tests/unit/static-pages.test.ts` — 2 passing
- `npm run test:run` — 36 passing
- `npm run test:domain` — 6 passing
- `npm run typecheck` — passing
- `npm run lint` — passing
- `npm run build` — passing; `/manifest`, `/makers`, `/service`, and `/contact` are statically generated

## Concerns

No blocking concerns. The maker, service, and contact copy intentionally avoids publishing details until verified operating information exists.
