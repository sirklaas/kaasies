# Task 6 — Catalogusroutes

## Status

Voltooid. De homepage laadt de actieve campagne en precies de actieve catalogusproducten. `/shop` toont dezelfde drie producten en `/shop/[slug]` is statisch gegenereerd voor `jong`, `belegen` en `oud`.

## Geleverd

- Server Components: `ProductCard`, `ProductGrid`, homepage, shop en productdetail.
- Één clientboundary: `WeightPicker`. De picker krijgt uitsluitend seriële productvelden, biedt alleen toegestane gewichten, kiest 500 g wanneer beschikbaar en berekent bedragen met `priceForWeight`.
- Productdetail bevat `generateStaticParams`, dynamische metadata en `notFound()` voor onbekende slugs.
- Dutch-poppresentatie met productfotografie als bewijs, een illustratieve campagne als commentaarlaag, zichtbare focus, 44px-keuzevlakken en reduced-motion fallback.
- Geen mandje- of checkoutstate toegevoegd; dat blijft voor Task 7.

## Verificatie

- RED → GREEN: homepage-linktest en gewichtpicker-test.
- `npm run test:run -- tests/components/weight-picker.test.tsx tests/unit/route-content.test.ts` — 3 tests geslaagd.
- `npm run test:run` — 14 tests geslaagd.
- `npm run typecheck` — geslaagd.
- `npm run lint` — geslaagd.
- `npm run build` — geslaagd; `/`, `/shop` en de drie `/shop/[slug]` routes zijn statisch gegenereerd.

## Aandachtspunt

Productprijzen en voorraad zijn nog expliciet tijdelijke lokale catalogusdata; de picker gebruikt die uitsluitend als weergavebron en bewaart geen commerce-state.
