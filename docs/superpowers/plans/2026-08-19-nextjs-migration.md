# Kaasies Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vervang het statische Kaasies-prototype door een complete, responsieve Next.js-storefront met typed lokale content, een werkend prototype-mandje en een veilige grens voor latere PocketBase- en Mollie-integraties.

**Architecture:** De App Router rendert marketing-, catalogus- en verhaalpagina’s server-side vanuit kleine typed adapters. Alleen gewichtsselectie, mandje en checkout zijn Client Components; bedragen blijven eurocenten en gewicht blijft grammen. De oude site wordt eerst controleerbaar gearchiveerd en de nieuwe site gaat pas naar `main` na unit-, component-, build-, browser- en visuele controles.

**Tech Stack:** Next.js 16.3, React 19, TypeScript strict, Node 24, npm, CSS Modules, Vitest + Testing Library, Playwright, ESLint, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-19-nextjs-migration-design.md`

## Global Constraints

- Gebruik Next.js 16.3 stable, React 19, App Router en Node.js `24.x`.
- Gebruik TypeScript strict en een vastgelegde `package-lock.json`.
- Gebruik geen Tailwind; vertaal het bestaande ontwerp naar `app/globals.css` en gerichte CSS Modules.
- Gebruik Bricolage Grotesque voor headings, Asap 400 voor body en Bungee voor het logotype waar het beeldlogo niet wordt gebruikt.
- Geld is altijd een integer aantal eurocenten; gewicht en voorraad zijn altijd integer grammen.
- De publieke routes bevatten geen live betaling, database-mutatie, beheerroute of geheime sleutel.
- De homepage bevat precies Jong, Belegen en Oud; Grand Cru is geen alias voor Oud.
- Het aangeleverde logo wordt zonder vervorming gebruikt en de geïntegreerde payoff wordt niet in HTML herhaald.
- `kaasies.com` is de canonical origin; Nederlands is de enige actieve locale in deze mijlpaal.
- Een bestand krijgt één duidelijke verantwoordelijkheid; routebestanden blijven dun.

## File Map

- `app/`: route entrypoints, metadata, error states, sitemap en robots.
- `components/layout/`: header en footer; geen commerce-logica.
- `components/campaign/`: server-rendered campagnepresentatie.
- `components/catalog/`: productkaarten en interactieve gewichtskeuze.
- `components/cart/`: client-side v2-mandstatus en mandweergave.
- `components/checkout/`: formulier en pure validatiefuncties.
- `lib/catalog/`: producttypen, regels, seeddata en lokale adapter.
- `lib/content/`: campagnetypen, verhalen en selectors.
- `lib/cart/`: mandtypen, migratie, reducers en prijsberekening.
- `public/`: gecontroleerde merk-, product- en illustratiebestanden.
- `tests/unit/`, `tests/components/`, `tests/e2e/`: gedrag op oplopend integratieniveau.

---

### Task 1: Archiveer en bewijs het legacy-prototype

**Files:**
- Create: `/Volumes/SAN2/kaasies/legacy-html-2026-08-19/`
- Create: `/Volumes/SAN2/kaasies/legacy-html-2026-08-19/SHA256SUMS.txt`
- Read: repository-root legacy HTML, CSS, JS, assets, tests en docs

**Interfaces:**
- Consumes: de werkboom op commit `d8ac838`.
- Produces: een niet-destructieve archiefkopie plus hashmanifest vóór iedere legacyverwijdering.

- [ ] **Step 1: Leg de bronstaat vast**

Run: `git status --short && git rev-parse HEAD && find . -type f -not -path './.git/*' -not -path './.vercel/*' -not -path './node_modules/*' -not -path './.superpowers/*' | sort`

Expected: branch is schoon en HEAD is minimaal `d8ac838`; de uitvoer bevat alle prototypepagina’s en assets.

- [ ] **Step 2: Kopieer het prototype zonder lokale tooling**

Run: `mkdir -p /Volumes/SAN2/kaasies/legacy-html-2026-08-19 && rsync -a --exclude .git --exclude .vercel --exclude node_modules --exclude .superpowers ./ /Volumes/SAN2/kaasies/legacy-html-2026-08-19/`

Expected: de doelmap bestaat; bestaande bestanden erbuiten zijn niet gewijzigd.

- [ ] **Step 3: Maak bron- en doelhashes**

Run in beide roots: `find . -type f | sort | xargs shasum -a 256`

Expected: na uitsluiting van `SHA256SUMS.txt` zijn relatieve paden en SHA-256-hashes identiek. Schrijf de doeluitvoer naar `SHA256SUMS.txt`.

- [ ] **Step 4: Stop bij verschil**

Run: vergelijk bestandenaantal, relatieve paden en hashes met `diff`.

Expected: lege diff. Verwijder geen legacybestand als de diff niet leeg is.

### Task 2: Maak een minimale, bouwbare Next.js-basis

**Files:**
- Create: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `next-env.d.ts`, `vitest.config.ts`, `playwright.config.ts`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Modify: `.gitignore`, `.vercelignore`
- Remove after Task 1 passes: root `*.html`, `assets/site.css`, `assets/store.js`, `assets/store-core.mjs`, `assets/back.*`, legacy root photography duplicates
- Test: `tests/unit/smoke.test.ts`

**Interfaces:**
- Consumes: succesvol Task 1-archief.
- Produces: scripts `dev`, `build`, `lint`, `typecheck`, `test`, `test:run`, `test:e2e`; alias `@/*` naar root.

- [ ] **Step 1: Schrijf de falende smoke-test**

```ts
import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/lib/site-config';

describe('siteConfig', () => {
  it('uses the production canonical origin', () => {
    expect(siteConfig.origin).toBe('https://kaasies.com');
    expect(siteConfig.locale).toBe('nl-NL');
  });
});
```

- [ ] **Step 2: Installeer de vastgepinde runtime- en testdependencies**

Use exact stable versions returned by npm on execution day for `next@16.3.x`, React 19, TypeScript, ESLint, Vitest, jsdom, Testing Library and Playwright; commit the generated lockfile. Set `engines.node` to `24.x`.

- [ ] **Step 3: Implementeer de minimale config**

```ts
// lib/site-config.ts
export const siteConfig = {
  name: 'Kaasies',
  origin: 'https://kaasies.com',
  locale: 'nl-NL',
  description: 'Eigenwijze, echte kaas gemaakt met liefde en vakmanschap.',
} as const;
```

`app/layout.tsx` exports `metadata` with `metadataBase: new URL(siteConfig.origin)` and loads Bricolage Grotesque and Asap via `next/font/google` CSS variables.

- [ ] **Step 4: Controleer de basis**

Run: `npm run test:run -- tests/unit/smoke.test.ts && npm run lint && npm run typecheck && npm run build`

Expected: alle commando’s slagen en `/` is statisch gegenereerd.

- [ ] **Step 5: Verwijder alleen de nu gearchiveerde legacy runtimebestanden en commit**

Run: `git add -A && git commit -m "build: scaffold Next.js storefront"`

Expected: docs, moderne domeinmodules en het gecontroleerde archief buiten Git blijven behouden; legacy runtimefiles verdwijnen uit de actieve root.

### Task 3: Vertaal catalogusregels en productdata naar TypeScript

**Files:**
- Create: `lib/catalog/types.ts`, `lib/catalog/money.ts`, `lib/catalog/products.ts`, `lib/catalog/local-adapter.ts`
- Test: `tests/unit/catalog.test.ts`

**Interfaces:**
- Produces: `Product`, `CatalogAdapter`, `formatEuros(cents)`, `priceForWeight(pricePerKgCents, weightGrams)`, `getActiveProducts()`, `getProductBySlug(slug)`.

- [ ] **Step 1: Schrijf falende domeintests**

```ts
expect(priceForWeight(2495, 750)).toBe(1871);
expect(formatEuros(1871)).toBe('€ 18,71');
expect(await getActiveProducts()).toHaveLength(3);
expect((await getActiveProducts()).map((p) => p.slug)).toEqual(['jong', 'belegen', 'oud']);
expect(await getProductBySlug('grand-cru')).toBeNull();
```

- [ ] **Step 2: Definieer het contract**

```ts
export type Product = {
  id: string; slug: string; name: string; shortDescription: string;
  description: string; maturation: string; tasteNotes: readonly string[];
  pricePerKgCents: number; stockGrams: number;
  allowedWeightsGrams: readonly (250 | 500 | 750 | 1000)[];
  image: { src: string; alt: string; width: number; height: number };
  active: boolean; seo: { title: string; description: string };
};
export interface CatalogAdapter {
  getActiveProducts(): Promise<readonly Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
}
```

- [ ] **Step 3: Implementeer regels en precies drie products**

Gebruik de gecontroleerde Stompetorenfeiten: Jong circa 4 weken, Belegen 3–4 maanden, Oud circa 10–12 maanden. Valideer bij module-load dat centen/grammen integers zijn, toegestane gewichten positief en niet boven voorraad, slugs uniek en SEO gevuld.

- [ ] **Step 4: Test en commit**

Run: `npm run test:run -- tests/unit/catalog.test.ts && npm run typecheck`

Run: `git add lib/catalog tests/unit/catalog.test.ts && git commit -m "feat: add typed local cheese catalog"`

### Task 4: Bouw het gedeelde visuele systeem en de layout

**Files:**
- Create: `components/brand/BrandLogo.tsx`, `components/layout/SiteHeader.tsx`, `components/layout/SiteFooter.tsx`, `components/layout/layout.module.css`
- Copy: `public/brand/kaasies-logo.webp`, `public/images/products/*.jpg`, `public/illustrations/time-is-an-ingredient-v1.png`
- Modify: `app/layout.tsx`, `app/globals.css`
- Test: `tests/components/site-header.test.tsx`

**Interfaces:**
- Produces: `BrandLogo({ priority?, className? })`, `SiteHeader()`, `SiteFooter()` and CSS tokens `--ink`, `--cream`, `--signal-pink`, `--signal-yellow`, `--signal-green`.

- [ ] **Step 1: Schrijf de falende headertest**

```tsx
render(<SiteHeader />);
expect(screen.getByRole('link', { name: /kaasies, naar homepage/i })).toHaveAttribute('href', '/');
expect(screen.getByRole('navigation', { name: /hoofdnavigatie/i })).toBeInTheDocument();
expect(screen.getByRole('link', { name: /mandje/i })).toHaveAttribute('href', '/mandje');
```

- [ ] **Step 2: Implementeer logo, header, footer en tokens**

Gebruik `next/image` met de echte 1759×534-verhouding. Headerlogo is ongeveer 1,6× de oorspronkelijke prototypegrootte. Voeg een skiplink, zichtbare focusstijl, responsieve navigatie en `prefers-reduced-motion` toe.

- [ ] **Step 3: Controleer component en build**

Run: `npm run test:run -- tests/components/site-header.test.tsx && npm run build`

- [ ] **Step 4: Commit**

Run: `git add app components public tests/components/site-header.test.tsx && git commit -m "feat: build Kaasies visual shell"`

### Task 5: Maak het herbruikbare campagne- en verhalenmodel

**Files:**
- Create: `lib/content/types.ts`, `lib/content/campaigns.ts`, `lib/content/local-adapter.ts`
- Create: `components/campaign/CampaignHero.tsx`, `components/campaign/campaign-hero.module.css`
- Create: `app/verhalen/page.tsx`, `app/verhalen/[slug]/page.tsx`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Produces: `Campaign`, `getActiveCampaign()`, `getCampaigns()`, `getCampaignBySlug(slug)`.

- [ ] **Step 1: Schrijf falende selectortests**

```ts
expect((await getActiveCampaign()).slug).toBe('geef-kaas-haar-tijd-terug');
expect((await getCampaigns()).every((item) => item.status !== 'draft')).toBe(true);
expect(await getCampaignBySlug('bestaat-niet')).toBeNull();
```

- [ ] **Step 2: Definieer en vul één gedeeld recordmodel**

```ts
export type Campaign = {
  slug: string; status: 'active' | 'archived' | 'draft'; publishedAt: string;
  title: string; intro: string; body: readonly string[];
  cta: { label: string; href: string };
  image: { src: string; alt: string; width: number; height: number };
  seo: { title: string; description: string };
};
```

Activeer “Geef kaas haar tijd terug”; geef een gearchiveerde campagne een eigen verhaalroute. Sorteer actief eerst, daarna aflopend op datum.

- [ ] **Step 3: Bouw hero en verhaalroutes**

Gebruik `generateStaticParams`, `generateMetadata` en `notFound()` op detailniveau. Hero krijgt alleen een serialiseerbare `Campaign` en bevat één CTA.

- [ ] **Step 4: Test en commit**

Run: `npm run test:run -- tests/unit/content.test.ts && npm run typecheck && npm run build`

Run: `git add lib/content components/campaign app/verhalen tests/unit/content.test.ts && git commit -m "feat: add reusable campaign stories"`

### Task 6: Bouw homepage, shop en productdetail

**Files:**
- Create: `components/catalog/ProductCard.tsx`, `components/catalog/ProductGrid.tsx`, `components/catalog/WeightPicker.tsx`, `components/catalog/catalog.module.css`
- Modify: `app/page.tsx`
- Create: `app/shop/page.tsx`, `app/shop/[slug]/page.tsx`
- Test: `tests/components/weight-picker.test.tsx`, `tests/unit/route-content.test.ts`

**Interfaces:**
- Consumes: catalogus- en campagne-adapters.
- Produces: `WeightPicker({ product })`; productlink query `?gewicht=<grams>` is optioneel en nooit de prijsbron.

- [ ] **Step 1: Schrijf falende UI-tests**

```tsx
render(<WeightPicker product={productFixture} />);
expect(screen.getAllByRole('radio')).toHaveLength(productFixture.allowedWeightsGrams.length);
await user.click(screen.getByRole('radio', { name: /750 gram/i }));
expect(screen.getByText('€ 18,71')).toBeInTheDocument();
```

Test daarnaast dat homepage en shop exact de actieve slugs `jong`, `belegen`, `oud` ontvangen.

- [ ] **Step 2: Bouw serverkaarten en interactieve picker**

`ProductCard` gebruikt `next/image`, rijping, korte copy, vanafprijs en een semantische link. `WeightPicker` accepteert alleen `allowedWeightsGrams`, initialiseert met 500 g indien beschikbaar en berekent via `priceForWeight`.

- [ ] **Step 3: Bouw routes en metadata**

Homepagevolgorde: CampaignHero → drie kazen → directe shop-CTA → manifestfragment. Productdetail gebruikt `generateStaticParams`, `generateMetadata` en `notFound()`.

- [ ] **Step 4: Test en commit**

Run: `npm run test:run -- tests/components/weight-picker.test.tsx tests/unit/route-content.test.ts && npm run build`

Run: `git add app components/catalog tests && git commit -m "feat: build catalog shopping routes"`

### Task 7: Implementeer het versioned mandje

**Files:**
- Create: `lib/cart/types.ts`, `lib/cart/cart.ts`, `components/cart/CartProvider.tsx`, `components/cart/AddToCartButton.tsx`, `components/cart/CartView.tsx`, `components/cart/cart.module.css`
- Create: `app/mandje/page.tsx`
- Modify: `app/layout.tsx`, `components/catalog/WeightPicker.tsx`
- Test: `tests/unit/cart.test.ts`, `tests/components/cart.test.tsx`

**Interfaces:**
- Produces: `CartStateV2`, `lineId(productId, weightGrams)`, `parseStoredCart(raw)`, `cartReducer`, `useCart()`.

- [ ] **Step 1: Schrijf falende migratie- en rekentests**

```ts
expect(lineId('oud', 750)).toBe('oud:750');
expect(parseStoredCart('{broken')).toEqual({ version: 2, lines: [] });
expect(parseStoredCart(JSON.stringify({ version: 1, lines: [{ productId: 'jong', quantity: 2 }] })))
  .toEqual({ version: 2, lines: [{ productId: 'jong', weightGrams: 500, quantity: 2 }] });
```

- [ ] **Step 2: Implementeer pure mandregels**

Clamp quantity naar integers 1–20, voeg gelijke `productId + weightGrams` samen, verwijder nulregels en bereken subtotalen opnieuw vanuit catalogusdata; sla nooit een vertrouwde totaalprijs op.

- [ ] **Step 3: Implementeer clientprovider en view**

Lees `kaasies-cart-v2` alleen na mount, vang beschadigde JSON af, schrijf alleen geldige v2-state en toon een hydration-veilige lege status.

- [ ] **Step 4: Test en commit**

Run: `npm run test:run -- tests/unit/cart.test.ts tests/components/cart.test.tsx && npm run build`

Run: `git add lib/cart components/cart app/mandje app/layout.tsx components/catalog/WeightPicker.tsx tests && git commit -m "feat: add versioned shopping cart"`

### Task 8: Bouw de prototype-checkout met toegankelijke validatie

**Files:**
- Create: `components/checkout/types.ts`, `components/checkout/validation.ts`, `components/checkout/CheckoutForm.tsx`, `components/checkout/checkout.module.css`
- Create: `app/checkout/page.tsx`
- Test: `tests/unit/checkout-validation.test.ts`, `tests/components/checkout-form.test.tsx`

**Interfaces:**
- Produces: `CheckoutFields`, `validateCheckout(fields): CheckoutErrors`, `CheckoutForm()`; geen netwerkrequest.

- [ ] **Step 1: Schrijf falende validatietests**

```ts
expect(validateCheckout(validFields)).toEqual({});
expect(validateCheckout({ ...validFields, email: 'fout' })).toMatchObject({ email: 'Vul een geldig e-mailadres in.' });
expect(validateCheckout({ ...validFields, postalCode: '' })).toMatchObject({ postalCode: 'Vul je postcode in.' });
```

- [ ] **Step 2: Implementeer velden en validatie**

Velden: naam, straat + huisnummer, postcode, woonplaats, telefoon, e-mail en niet-vooraf-aangevinkte nieuwsbriefcheckbox. Errors gebruiken `aria-describedby`; focus gaat na submit naar het eerste ongeldige veld en waarden blijven staan.

- [ ] **Step 3: Implementeer veilige prototype-submit**

Bij geldige input toont de pagina: “Je gegevens zijn gecontroleerd. Betalen met Mollie activeren we in de volgende beveiligde stap.” Maak geen `fetch`, order of betaling.

- [ ] **Step 4: Test en commit**

Run: `npm run test:run -- tests/unit/checkout-validation.test.ts tests/components/checkout-form.test.tsx && npm run build`

Run: `git add components/checkout app/checkout tests && git commit -m "feat: add validated checkout prototype"`

### Task 9: Migreer merk- en servicepagina’s

**Files:**
- Create: `lib/content/pages.ts`
- Create: `app/manifest/page.tsx`, `app/makers/page.tsx`, `app/service/page.tsx`, `app/contact/page.tsx`
- Test: `tests/unit/static-pages.test.ts`

**Interfaces:**
- Produces: `staticPages` records met `slug`, `title`, `description`, `sections`; iedere route gebruikt één record en één `h1`.

- [ ] **Step 1: Schrijf falende contenttests**

```ts
expect(Object.keys(staticPages).sort()).toEqual(['contact', 'makers', 'manifest', 'service']);
for (const page of Object.values(staticPages)) {
  expect(page.title.length).toBeGreaterThan(0);
  expect(page.description.length).toBeGreaterThanOrEqual(50);
}
```

- [ ] **Step 2: Herschrijf en centraliseer prototypecontent**

Gebruik de merkstem: eigenwijs, direct, bewust, geen palmolie/shortcuts, geen ongefundeerde gezondheids- of herkomstclaims. Contact toont nog geen werkend formulier maar heldere contact- en reactietijdplaceholdertekst.

- [ ] **Step 3: Bouw semantische routes en commit**

Run: `npm run test:run -- tests/unit/static-pages.test.ts && npm run build`

Run: `git add lib/content/pages.ts app/manifest app/makers app/service app/contact tests/unit/static-pages.test.ts && git commit -m "feat: migrate brand and service pages"`

### Task 10: Voeg SEO, fouten en route-audit toe

**Files:**
- Create: `app/robots.ts`, `app/sitemap.ts`, `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx`
- Create: `tests/unit/seo.test.ts`, `tests/e2e/site-audit.spec.ts`

**Interfaces:**
- Produces: canonical metadata, robotsbeleid en sitemap voor alle publieke routes.

- [ ] **Step 1: Schrijf falende SEO-tests**

Test dat sitemap `/`, `/shop`, drie productroutes, vier merk/servicepagina’s, `/verhalen` en alle gepubliceerde verhaalroutes bevat; dat URLs met `https://kaasies.com` beginnen; en dat drafts ontbreken.

- [ ] **Step 2: Implementeer metadata-infrastructuur**

`robots.ts` staat crawling toe en verwijst naar `/sitemap.xml`. `sitemap.ts` bouwt routes uitsluitend uit adapters. `not-found.tsx` biedt routes naar shop en homepage; `error.tsx` is client-side, bevat `reset()` en toont geen stackdetails.

- [ ] **Step 3: Voeg pagina-audit toe**

Playwright bezoekt iedere sitemaproute en assert status 200, exact één `h1`, non-empty title/description, canonical naar kaasies.com, geen horizontale overflow en geen `console.error`.

- [ ] **Step 4: Test en commit**

Run: `npm run test:run -- tests/unit/seo.test.ts && npm run build && npm run test:e2e -- tests/e2e/site-audit.spec.ts`

Run: `git add app tests && git commit -m "feat: add SEO and resilient route states"`

### Task 11: Verifieer de volledige journey en responsive presentatie

**Files:**
- Create: `tests/e2e/storefront.spec.ts`
- Create: `artifacts/visual/home-desktop.png`, `artifacts/visual/home-mobile.png`, `artifacts/visual/checkout-mobile.png` (niet committen tenzij expliciet gewenst)
- Modify: CSS files alleen voor waargenomen defects

**Interfaces:**
- Consumes: alle publieke storefrontroutes.
- Produces: browserbewijs voor homepage → shop → product → 750 g → mandje → checkout.

- [ ] **Step 1: Schrijf de end-to-end journey**

```ts
await page.goto('/');
await page.getByRole('link', { name: /bekijk alle kazen/i }).click();
await page.getByRole('link', { name: /oud/i }).first().click();
await page.getByRole('radio', { name: /750 gram/i }).check();
await page.getByRole('button', { name: /in mijn mandje/i }).click();
await page.getByRole('link', { name: /naar afrekenen/i }).click();
await expect(page.getByRole('heading', { name: /jouw gegevens/i })).toBeVisible();
```

- [ ] **Step 2: Test desktop en mobiel**

Gebruik Playwright-projecten met Chromium 1440×1000 en iPhone 13 390×844. Neem full-page screenshots van homepage en mobiele checkout. Bevestig focusnavigatie, reduced motion, menu, gewichtselectie, persistente cart en veldfouten.

- [ ] **Step 3: Voer de complete lokale poort uit**

Run: `npm run lint && npm run typecheck && npm run test:run && npm run build && npm run test:e2e`

Expected: exitcode 0 voor elk commando; geen testskip voor kernjourney.

- [ ] **Step 4: Commit fixes en E2E-test**

Run: `git add app components lib tests package.json package-lock.json && git commit -m "test: verify complete storefront journey"`

### Task 12: Deploy preview, controleer live en rond de branch af

**Files:**
- Modify only if required by verified deployment: `next.config.ts`, `.vercelignore`, `docs/agents/URL-DEPLOYMENT.md`

**Interfaces:**
- Produces: een Vercel preview voor `agent/nextjs-migration`; productie blijft onaangeraakt tot expliciete branchafronding.

- [ ] **Step 1: Push de featurebranch**

Run: `git status --short && git push -u origin agent/nextjs-migration`

Expected: schone worktree en een GitHub-branch die de Vercel preview activeert.

- [ ] **Step 2: Inspecteer deployment en logs**

Run: `vercel inspect <preview-url> --logs`

Expected: status Ready, Next.js framework herkend, geen buildwarnings over secrets of ontbrekende routes.

- [ ] **Step 3: Herhaal de browserjourney tegen preview**

Run: `PLAYWRIGHT_BASE_URL=<preview-url> npm run test:e2e`

Expected: dezelfde route-audit en storefrontjourney slagen tegen HTTPS.

- [ ] **Step 4: Controleer visueel en technisch**

Bekijk 1440 px en 390 px screenshots; controleer logoverhouding, headingkleuren, typografie, productbeelden, illustraties, CLS, console, canonicals en dat `/back`/`back.html` niet publiek zijn.

- [ ] **Step 5: Gebruik de branch-afrondingsskill**

Lees en volg `superpowers:finishing-a-development-branch`. Breng pas na geslaagde verificatie en gekozen integratieoptie de branch naar `main`; controleer daarna `https://kaasies.com` en `https://www.kaasies.com`.

## Self-review

- Spec coverage: archief, platform, alle routes, drie kazen, campaign→verhaalmodel, cart v2, prototype-checkout, metadata, fouten, security, tests en previewdeployment hebben elk een taak.
- Scope boundary: PocketBase-mutaties, Mollie, orderreservering en publiek beheer zijn nergens als implementatie opgenomen.
- Placeholder scan: implementatiestappen benoemen exacte velden, functies, routes, asserts en verwachte outputs; externe prijzen/voorraad worden niet verzonnen.
- Type consistency: `Product`, `Campaign`, `CartStateV2`, `lineId`, `priceForWeight`, adaptermethoden en checkoutvelden worden één keer gedefinieerd en daarna identiek geconsumeerd.
