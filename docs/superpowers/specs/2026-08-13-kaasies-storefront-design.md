# Kaasies’ Storefront Design

## Scope

Create a complete, clickable Dutch-language premium cheese storefront prototype around the approved homepage direction. The flow includes homepage, collection, three product details, manifest, makers, cart, prototype checkout, FAQ/shipping, and contact. Payments remain explicitly non-live.

## Audience and position

The primary customer is a conscious, design-aware Dutch cheese lover willing to pay for genuine quality. Kaasies’ is principled, playful, and premium through evidence rather than conventional luxury.

## Visual system

- Bungee for the `KAASIES’` wordmark.
- Bricolage Grotesque 700 for display headings and interface labels.
- Asap 400 for short, slightly oversized body copy.
- Bright pink, butter yellow, tomato, aqua, grape, forest ink, and warm paper.
- Photography proves product, texture, origin, and makers.
- Original line illustrations add sparse editorial commentary; they never replace necessary product photography.
- Sharp dividers, asymmetric grids, large type, restrained pill controls, no gold/brown delicatessen clichés.

## Information architecture

- `/` — landing page and featured products.
- `/shop.html` — full collection with useful taste filters.
- `/product-*.html` — individual product story, taste, provenance, serving, quantity, and add-to-cart.
- `/manifest.html` — principles, anti-shortcut position, and selection policy.
- `/makers.html` — maker, milk, landscape, and ripening process.
- `/cart.html` — persistent prototype cart, quantities, totals, and shipping threshold.
- `/checkout.html` — customer, delivery, and payment-method UI clearly marked as prototype.
- `/faq.html` — shipping, storage, allergens, freshness, returns, and European expansion.
- `/contact.html` — service form and business/collaboration routes.

## Behavior

- Cart state persists in `localStorage` across pages.
- Adding and removing provides immediate visual and screen-reader feedback.
- Collection filters work without navigation.
- Checkout validates required fields but never initiates payment.
- Navigation is responsive and all key controls meet 44px touch targets.
- Motion uses transform/opacity only and respects reduced-motion settings.

## Content and legal boundaries

Product names, prices, claims, photography, and maker information are prototype content and must be replaced or verified before launch. Stompetoren photographs remain temporary internal assets. No live Mollie call, order submission, or external deployment is in scope.

## Verification

Every HTML page must return HTTP 200, contain one `h1`, have a unique title and description, link to shared assets without 404s, and expose no broken internal navigation. Cart math and checkout validation are covered by deterministic JavaScript unit tests.

