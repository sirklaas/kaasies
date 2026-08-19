# Kaasies’ Next.js Migration Design

> Datum: 2026-08-19  
> Status: goedgekeurde architectuurrichting; wacht op controle vóór implementatie

## Doel

Vervang het statische HTML-prototype door een productiegerichte Next.js-webshop in de repository-root. De bestaande visuele identiteit blijft leidend, maar routing, rendering, data en toekomstige betalingen krijgen veilige server-side grenzen.

## Afbakening

Deze migratie levert de Next.js-basis en een volledige storefront zonder echte betaling of externe database-mutaties. PocketBase en Mollie volgen als afzonderlijke mijlpalen nadat de storefront, het cataloguscontract en de checkoutgrens stabiel zijn.

Niet onderdeel van deze migratie:

- Een live Mollie-betaling.
- Een Mollie-webhook.
- Product-CRUD tegen een externe PocketBase-instance.
- Een publiek toegankelijke back office.
- Gebruikersaccounts of beheerrollen.
- Definitieve juridische teksten of definitief gelicenseerde productfotografie.

## Archivering

Voor implementatie wordt het huidige prototype volledig gekopieerd naar:

`/Volumes/SAN2/kaasies/legacy-html-2026-08-19/`

De kopie bevat HTML, CSS, JavaScript, afbeeldingen, tests en documentatie zoals die bij aanvang van de migratie bestaan, maar niet `.git`, `.vercel`, `node_modules` of lokale tijdelijke tooling. Na bestandscontrole en vergelijking mag de actieve repository-root worden omgebouwd. Git-commit `e7a807b` blijft een aanvullend herstelpunt.

## Platform

- Next.js 16.3 stable.
- React 19 zoals ondersteund door Next.js 16.3.
- App Router.
- TypeScript in strict mode.
- Node.js `24.x` voor lokaal bouwen en Vercel.
- npm met vastgelegde `package-lock.json`.
- ESLint via de ESLint CLI.
- Geen Tailwind-verplichting; de bestaande Kaasies-stijl wordt vertaald naar `app/globals.css` en gerichte CSS Modules.

## Repositorystructuur

```text
app/
  layout.tsx
  page.tsx
  error.tsx
  not-found.tsx
  loading.tsx
  shop/page.tsx
  shop/[slug]/page.tsx
  mandje/page.tsx
  checkout/page.tsx
  manifest/page.tsx
  makers/page.tsx
  service/page.tsx
  contact/page.tsx
  verhalen/page.tsx
  verhalen/[slug]/page.tsx
components/
  brand/
  cart/
  catalog/
  campaign/
  layout/
lib/
  catalog/
  cart/
  content/
  pocketbase/
public/
  brand/
  images/
  illustrations/
tests/
```

Configuratiebestanden komen in de repository-root: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs` en `next-env.d.ts`.

## Routes en inhoud

### `/`

De homepage bevat een verwisselbare activistische Hero-campagne, gevolgd door precies drie kazen: Jong, Belegen en Oud. Onder deze producten staat een directe route naar `/shop`. De campagne wordt vanuit een typed contentrecord geladen, niet rechtstreeks in JSX geschreven.

### `/shop`

De shop toont de drie actieve producten en laat per product de beschikbare gewichten zien. De productkaart linkt naar `/shop/[slug]`.

### `/shop/[slug]`

De productpagina gebruikt `generateStaticParams` en `generateMetadata`. De klant kiest uit 250, 500, 750 en 1000 gram voor zover de productvariant dit toestaat. De prijs wordt berekend uit `pricePerKgCents`, uitsluitend met integers.

### `/mandje`

Het mandje is een Client Component met versiebeheer in `localStorage`. Een regel wordt geïdentificeerd door `productId + weightGrams`. Het mandje toont gewicht, prijs per regel, subtotaal en verzendkosten.

### `/checkout`

De checkout verzamelt naam, adres, woonplaats, telefoonnummer, e-mail en expliciete toestemming voor de mailinglijst. De submitactie valideert lokaal en toont uitsluitend een prototypestatus. Er wordt geen betaling of externe opslag gestart.

### Merk- en servicepagina’s

`/manifest`, `/makers`, `/service` en `/contact` behouden de relevante prototype-inhoud, vertaald naar semantische Server Components.

### `/verhalen` en `/verhalen/[slug]`

De actuele Hero-campagne heeft hetzelfde contentmodel als een verhaal. Wanneer een nieuwe campagne actief wordt, blijft de vorige campagne als artikel beschikbaar zonder duplicatie van tekstvelden. Iedere campagne bevat status, publicatiedatum, titel, intro, body, CTA, beeld en SEO-metadata.

## Componentgrenzen

- `SiteHeader` en `SiteFooter` zijn Server Components.
- `BrandLogo` gebruikt het aangeleverde bestand via `next/image` zonder vervorming.
- `CampaignHero` is server-rendered en krijgt één serialiseerbaar campaignrecord.
- `ProductCard` en `ProductGrid` zijn Server Components.
- `WeightPicker`, `AddToCartButton`, `CartProvider`, `CartView` en het checkoutformulier zijn Client Components.
- Presentatiecomponenten kennen PocketBase of Mollie niet.

## Cataloguscontract

Het bestaande contract in `assets/data/catalog-contract.mjs` en de veilige domeinregels uit `assets/pocketbase/domain.mjs` worden naar TypeScript vertaald.

Een product bevat minimaal:

- `id`
- `slug`
- `name`
- `shortDescription`
- `description`
- `maturation`
- `tasteNotes`
- `pricePerKgCents`
- `stockGrams`
- `allowedWeightsGrams`
- `image`
- `active`
- SEO-metadata

Geld blijft integer eurocenten. Gewicht en voorraad blijven integer grammen. UI-code mag geen eigen prijs of voorraad verzinnen.

## Data-adapter

De eerste mijlpaal gebruikt een typed lokale catalogusadapter. Componenten consumeren alleen functies zoals:

- `getActiveProducts()`
- `getProductBySlug(slug)`
- `getActiveCampaign()`
- `getCampaigns()`
- `getCampaignBySlug(slug)`

Een latere PocketBase-adapter implementeert dezelfde interface. Daardoor vereist de databaseaansluiting geen herschrijving van de UI.

## Rendering en caching

- Marketing-, product- en verhaalpagina’s zijn statisch renderbaar.
- De eerste lokale adapter vereist geen dynamische runtime.
- PocketBase-fetches komen later uitsluitend in servercode.
- Mollie gebruikt later Node.js Route Handlers; nooit Client Components.
- Geen `use client` op route- of layoutniveau tenzij technisch noodzakelijk.

## Metadata en SEO

- Nederlandse `metadataBase` gebruikt `https://kaasies.com`.
- Iedere route heeft een unieke titel en description.
- Producten en verhalen gebruiken `generateMetadata`.
- Canonicals gebruiken één primaire domeinvariant.
- Er komen `robots.ts` en `sitemap.ts`.
- Iedere pagina bevat precies één betekenisvolle `h1`.

## Beeld en fonts

- Logo en lokale productbeelden verhuizen naar `public/`.
- Pagina’s gebruiken `next/image` met correcte afmetingen en `sizes`.
- Het LCP-beeld krijgt prioriteit; overige beelden laden lazy.
- Bricolage Grotesque en Asap worden via `next/font/google` geladen.
- De geïntegreerde logo-payoff wordt niet nogmaals als HTML-tekst geplaatst.

## Foutafhandeling

- Onbekende productslug of verhaalslug gebruikt `notFound()`.
- `error.tsx` geeft herstelbare feedback zonder technische details.
- Ontbrekende catalogusdata leidt tijdens build/test tot een expliciete fout.
- Beschadigde mandopslag valt terug op een leeg, geldig v2-mandje.
- Niet-beschikbare gewichten kunnen niet worden toegevoegd.
- Checkoutvalidatie benoemt het ongeldige veld en bewaart ingevulde waarden.

## Beveiliging

- Alleen `NEXT_PUBLIC_POCKETBASE_URL` mag later publiek zijn.
- Beheerdersgegevens, Mollie-sleutels en webhooksecrets blijven server-only.
- `.env*` blijft uit Git, behalve een documenterende `.env.example` zonder waarden.
- Back-officecode wordt in deze mijlpaal niet als publieke route geïmplementeerd.
- Server-side prijsherberekening en voorraadreservering zijn verplichte voorwaarden vóór live Mollie.

## Teststrategie

- Unit tests voor geld, gewicht, productvarianten, mandmigratie en contentselectors.
- Componenttests voor gewichtselectie en checkoutvalidatie.
- `npm run lint` en `npm run typecheck`.
- `npm run build` als verplichte productiecontrole.
- Playwright-smoke tests voor homepage → shop → product → gewicht → mandje → checkout.
- Visuele screenshots op 1440 px en 390 px.
- Link-, metadata- en één-h1-audit voor alle routes.

## Deployment

Ontwikkeling gebeurt op `agent/nextjs-migration`. De bestaande GitHub-Vercel-integratie maakt een previewdeployment. Na geslaagde tests en visuele controle wordt de branch naar `main` gebracht. Vercel bouwt de Next.js-app dan vanuit de repository-root en `kaasies.com` wordt de primaire productie-URL.

## Acceptatiecriteria

- Het SAN2-archief bestaat en is gecontroleerd voordat legacybestanden actief worden verwijderd.
- Alle genoemde routes renderen zonder console- of buildfouten.
- Homepage, shop, product, mandje en checkout vormen één werkende lokale flow.
- Jong, Belegen en Oud gebruiken één typed catalogusbron.
- Het nieuwe logo staat correct in header en footer.
- De wekelijkse Hero en het verhalenarchief delen één contentmodel.
- Geen echte betaling, database-mutatie of publiek beheeroppervlak is aanwezig.
- Lint, typecheck, unit tests, build en Playwright-smoke tests slagen.
- De Next.js-preview is visueel gecontroleerd vóór wijziging van `main`.

## Zelfcontrole

De migratie is één afgebakende mijlpaal: framework, routes, lokale typed data en prototype-commerce. PocketBase-mutaties, Mollie en back-office-authenticatie zijn expliciet vervolgmijlpalen. Er zijn geen open ontwerpbeslissingen, verborgen productieclaims of conflicterende prijs- en voorraadeenheden.
