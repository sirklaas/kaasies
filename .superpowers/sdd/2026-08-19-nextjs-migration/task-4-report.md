# Task 4 — Kaasies visual shell

## Opgeleverd

- Gedeelde server-rendered `SiteHeader`, `SiteFooter` en `BrandLogo` in de root layout.
- Een lichte Dutch-pop shell: warm papier als grond, scherpe bosgroene lijnen, roze mandje en aqua voettekst. De beeldlogo's blijven het merkanker; er is geen concurrerend tekstwoordmerk toegevoegd.
- Een mobiele navigatie die niet wordt weggelaten: ze blijft als horizontaal bereikbare rij beschikbaar wanneer de ruimte klein is.
- Globale semantische tokens, focusstijlen, skiplink en reduced-motion fallback.

## Designbesluiten

- Bricolage Grotesque en Asap blijven via `next/font/google` uit de bestaande layout geladen. Bungee is niet gebruikt, omdat het primaire aangeleverde beeldlogo in header en footer staat.
- De headerlogo heeft op grotere schermen een cap van 352 CSS-px (1,6× de gemeten 220px-prototypegrootte) en behoudt zijn intrinsieke 1759×534-verhouding via `next/image`.
- Interactie gebruikt alleen een korte transform/box-shadow feedback op het mandje en een markering onder een navigatielink; `prefers-reduced-motion` reduceert alle overgangen.

## Assets

- `public/brand/kaasies-logo.webp` — 1759×534, gekopieerd uit het bewaarde merkasset.
- `public/illustrations/time-is-an-ingredient-v1.png` — 1536×1024.
- `public/images/products/{jong,belegen,oud}.jpg` — ieder 956×647, gekoppeld aan de bestaande typed catalogus.

## RED → GREEN

1. RED: `tests/components/site-header.test.tsx` toegevoegd, met het zichtbare home-link-, navigatie- en mandjecontract. De eerste run stopte terecht op het nog niet bestaande `SiteHeader`-modulecontract.
2. GREEN: de servercomponent, logo en stijlen toegevoegd. Daarna onthulde de runner een ontbrekende peer dependency van `@testing-library/react`; `@testing-library/dom` is expliciet als devDependency vastgelegd.
3. De componenttest slaagt nu en de Vitest-discovery omvat zowel `tests/unit` als `tests/components`.

## Checks

- `npm run test:run -- tests/components/site-header.test.tsx` — groen, 1 test.
- `npm run test:run` — groen, 3 bestanden / 6 tests.
- `npm run typecheck` — groen.
- `npm run lint` — groen.
- `npm run build` — groen; alle huidige routes statisch gegenereerd.
- Visuele smoke-check met lokale Next-server op 1280 px en 390 px: logo, navigatie, mandje en footer renderen zonder horizontale pagina-overflow. De dev-server gaf uitsluitend zijn verwachte waarschuwing voor `127.0.0.1` als niet-toegestane HMR-origin; de productiebuild is schoon.

## Zelfreview

- Semantische `header`, benoemde `nav`-elementen, `main`-landmark en `footer` aanwezig.
- Skiplink richt naar `#main-content`; keyboardfocus is duidelijk contrastrijk. Header- en footerlinks hebben minimaal 44 px hoogte.
- De productbeelden zijn alleen voorbereid in `public`; de volgende pagina-/cataloguscomponenten moeten ze als bewijs inzetten via `next/image`, terwijl de illustratie voor redactioneel commentaar blijft.
- Lokale shell draaide op Node 23.10.0; npm meldt dat het project Node 24 verwacht. Dit is bestaand omgevingsverschil, geen buildfout.

## Fixronde 1 — 2026-08-19

- RED: een tweede componenttest rendert de echte root-layout statisch en verwacht dat de skiplink naar een `main#main-content` met `tabindex="-1"` verwijst. Hij faalde eerst gericht op het ontbrekende tabindex-attribuut. `next/font/google` is alleen in deze test gemockt, omdat dit een compile-time fontloader is en niet de layoutsemantiek onder test.
- GREEN: `main` is programmatically focusable; de test borgt daarnaast het header-`banner`-landmark naast de benoemde hoofdnavigatie en mandjeroute.
- De desktoplogo-cap is gecorrigeerd van 196px naar 352px. Op smalle schermen blijft de bestaande compacte 172px-cap actief zonder vervorming.
- De horizontaal overloopbare navigatie krijgt block- en scrollruimte; haar focusring is naar binnen gezet zodat de globale 3px-focusindicator niet door de scroller wordt afgeknipt.
- Asap-bodycopy is 1.125rem; compacte navigatie blijft bewust 0.9rem.
- Checks: componenttest 2/2, volledig Vitest 7/7, typecheck, lint, build en `git diff --check` groen. Visueel gecontroleerd op 1440px en 390px: volledige navigatie beschikbaar, logo proportioneel en geen pagina-overflow.
