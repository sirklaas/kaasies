# Agent Shop · uitvoerbare shopspecificatie

Status: gereed voor afstemming en implementatie  
Datum: 2026-08-19  
Scope: `shop.html`, productdetailpagina’s, mandje en gedeeld product-/voorraadcontract  
Niet in scope: live PocketBase, Mollie, beheerinterface of definitieve productprijzen

## 1. Doel

De klant moet zonder kennis van kaas of kiloprijzen in één vloeiende route kunnen:

1. jong, belegen en oud vergelijken;
2. een kaas kiezen;
3. een beschikbaar gewicht kiezen;
4. direct de echte prijs en actuele voorraadstatus zien;
5. precies die kaas-gewichtvariant in het mandje leggen;
6. gewicht, stukprijs en aantallen tot en met checkout terugzien.

De flow blijft bewust compact: drie overtuigende kazen, geen eindeloos schap. Productfotografie bewijst de kaas; felle kleurvelden, stevige lijnen en korte, eigenwijze copy dragen de Kaasies’-stijl.

## 2. Huidige situatie en benodigde correctie

De huidige shop en productpagina’s behandelen iedere kaas als één artikel van circa 500 gram. `data-add` bevat een vaste `price`; `addItem()` voegt regels samen op alleen `product.id`. De voorraad is niet gemodelleerd en het mandje toont geen gewicht of regelprijs.

Voor meerdere gewichten is een variant-ID noodzakelijk. Anders worden bijvoorbeeld 250 g en 1 kg jong als één mandregel opgeteld. Bedragen blijven integer eurocenten; voorraad wordt integer grammen. Geen floating-point kilo’s in berekeningen.

## 3. Aanbevolen UX-richting

### Shop: kiezen zonder rekenwerk

Elke productkaart toont:

- echte productnaam plus korte Kaasies’-bijnaam;
- rijping en drie smaakwoorden;
- prijsanker `vanaf € …`;
- voorraadboodschap in gewone taal;
- primaire CTA `Kies je stuk →` naar de productpagina;
- secundaire quick choice voor terugkerende kopers: gewichtselectie plus `In mandje`.

De primaire route blijft productdetail → gewicht → mandje. De snelle keuze is progressieve disclosure en mag de kaart niet veranderen in een formuliermuur. Op schermen smaller dan 700 px staat quick choice standaard dicht onder `Snel bestellen`; de productpagina blijft met één tik bereikbaar.

Filters op `mild`, `vol` en `krachtig` zijn bij precies drie kazen visueel zwaarder dan hun nut. Voor de eerste release vervallen ze. De kaartvolgorde jong → belegen → oud is meteen de smaakroute. Wanneer later meer dan zes producten actief zijn, kan filtering terugkomen op eigenschappen uit het productmodel.

### Productdetail: het gewicht is onderdeel van de beslissing

Naast de foto staat één aankoopblok:

1. naam, rijping, korte smaakbelofte;
2. gewichtkeuze als vier duidelijke segmentknoppen;
3. live stukprijs;
4. prijs per kilo als rustige vergelijkingsinformatie;
5. voorraadstatus voor de gekozen variant;
6. CTA `Leg [gewicht] in je mandje →`;
7. korte leverbelofte onder de CTA.

Voorgestelde startgewichten: 250 g, 500 g, 750 g en 1 kg. Het productmodel bepaalt welke gewichten werkelijk zichtbaar zijn. Een uitverkochte variant blijft zichtbaar maar uitgeschakeld, zodat de klant begrijpt dat het formaat bestaat. Standaardselectie: 500 g als beschikbaar; anders de lichtste beschikbare variant.

De stukprijs verandert onmiddellijk bij een nieuwe selectie. Er is geen aparte bevestigingsstap en geen modal. Een succesvolle toevoeging geeft een `aria-live`-melding en een duidelijke keuze: `Bekijk mandje` of `Verder snijden`.

## 4. Gedeeld product- en voorraadmodel

Eén front-end catalogusmodule is tijdelijk de bron van waarheid. Later vervangt een PocketBase-adapter alleen de laadlaag; templates, mandje en prijslogica blijven hetzelfde contract gebruiken.

```js
{
  id: "stompetoren-jong",
  slug: "stompetoren-jong",
  status: "active",
  name: "Stompetoren Jong",
  nickname: "De frisse dwarsligger",
  maturityLabel: "Jong",
  agingLabel: "… weken gerijpt",
  description: "…",
  tasteTags: ["romig", "fris", "soepel"],
  image: "Stompetoren_Jong_Belegen-1-aspect-ratio-956-647.jpg",
  pricePerKgCents: 1790,
  stockGrams: 18000,
  lowStockThresholdGrams: 3000,
  allowedWeightsGrams: [250, 500, 750, 1000],
  version: 1
}
```

### Productregels

- `id` en `slug` zijn stabiel en veranderen niet wanneer marketingcopy verandert.
- `nickname` mag vanuit Agent Text wijzigen zonder mand- of voorraadlogica te breken.
- `pricePerKgCents`, `stockGrams`, gewichten en status komen uiteindelijk uit PocketBase.
- `allowedWeightsGrams` bevat alleen gehele positieve waarden, oplopend en zonder duplicaten.
- Een variant is verkoopbaar wanneer `status === "active"`, het gewicht is toegestaan en `stockGrams >= weightGrams`.
- De voorraadstatus wordt altijd opnieuw gecontroleerd door de backend vóór Mollie wordt gestart; browservoorraad is informatief, nooit autoritatief.

### Prijsregel

```js
variantPriceCents = Math.round(pricePerKgCents * weightGrams / 1000)
```

Dezelfde pure functie wordt gebruikt voor shop, productpagina, mandje, checkout en tests. Een toekomstige afwijkende actieprijs hoort als expliciete prijsregel in data, niet als HTML-hardcode.

### Bestelbare variant en mandregel

```js
{
  lineId: "stompetoren-jong:500",
  productId: "stompetoren-jong",
  weightGrams: 500,
  quantity: 2,
  unitPriceCents: 895,
  productVersion: 1,
  nameSnapshot: "Stompetoren Jong",
  nicknameSnapshot: "De frisse dwarsligger",
  imageSnapshot: "…jpg"
}
```

- `lineId = productId + ":" + weightGrams`; alleen identieke varianten worden samengevoegd.
- `totalWeightGrams = weightGrams * quantity` ondersteunt picklijst en label.
- Snapshotvelden houden een order leesbaar als productcopy later wijzigt.
- `unitPriceCents` is de geaccepteerde stukprijs op het moment van toevoegen. Checkout laat de backend prijzen opnieuw valideren en vraagt bevestiging als iets is veranderd.
- Migratie van `kaasies-cart-v1`: oude regels worden een 500 g-variant wanneer geldig; ongeldige regels worden genegeerd met een vriendelijke melding. Nieuwe opslagkey: `kaasies-cart-v2`.

## 5. Componenten en verantwoordelijkheden

### `catalog-data.mjs`

Tijdelijke statische catalogus met de drie Stompetoren-producten. Exporteert geen DOM-code. Later levert `pocketbase-catalog-adapter.mjs` hetzelfde resultaat.

### `catalog-core.mjs`

Pure, los testbare functies:

- `variantId(productId, weightGrams)`;
- `formatWeight(weightGrams)` (`250 g`, `1 kg`);
- `priceForWeight(product, weightGrams)`;
- `availableWeights(product)`;
- `stockState(product, weightGrams)`;
- `toCartLine(product, weightGrams)`;
- `validateProduct(product)`.

### `product-picker`

Herbruikbare DOM-controller voor kaart en productdetail. Ontvangt een productobject en rendert gewicht, prijs, voorraad en CTA-status. Hij muteert nooit de catalogus.

### `store-core.mjs`

Mandfuncties gaan van `id` naar `lineId`. Subtotaal gebruikt `unitPriceCents * quantity`. Voor tijdelijk terugwaarts gebruik kan een normalisatiefunctie oude velden lezen, maar nieuwe UI schrijft uitsluitend v2-regels.

### `store.js`

Orkestreert catalogus laden, pickers initialiseren, cart opslaan en meldingen tonen. Geen prijsberekening in event handlers of `data-add` JSON. HTML bevat alleen een stabiele `data-product-id`.

### Templates

- `shop.html`: catalogusgrid en progressive quick choice.
- drie productpagina’s: gedeeld aankoopblok met eigen `data-product-id`.
- `cart.html`: regel toont naam, `500 g × 2`, stukprijs en regeltotaal.
- `checkout.html`: samenvatting toont dezelfde variantinformatie; geen stille herberekening.

## 6. Interface-states en copy

### Laden

Statische data is direct beschikbaar. Bij toekomstige PocketBase-load blijven productnaam en foto staan; prijszone toont `Prijs laden…`. CTA is tijdelijk disabled. Geen spinner op de hele pagina.

### Beschikbaar

- Meer dan lage-voorraaddrempel: `Op voorraad. Snijden maar.`
- Op of onder drempel, maar genoeg voor gekozen gewicht: `Nog maar een paar stukken.`
- CTA: `Leg 500 g in je mandje →`

### Gekozen gewicht niet beschikbaar

- Keuzeknop disabled en benoemd als `750 g · op`.
- Als voorraad na selectie daalt: kies automatisch de dichtstbijzijnde lichtere beschikbare variant en meld `Die maat is net weg. Deze kan nog wel.`

### Hele product uitverkocht of inactief

- Geen gewicht wordt geselecteerd.
- CTA disabled: `Even uitverkocht`.
- Bied een tekstlink `Mail mij als hij terug is` als toekomstige uitbreiding; geen nepwerkende knop in de eerste implementatie.

### Toegevoegd

- CTA wordt kort `500 g toegevoegd ✓`, zonder permanent van functie te veranderen.
- Live region: `500 gram Stompetoren Jong toegevoegd. Mandje bevat nu 3 stukken.`
- Focus blijft op de CTA; het mandje wordt niet automatisch geopend.

### Data- of netwerkfout

- Boodschap bij het aankoopblok: `De voorraad doet moeilijk. Probeer het nog eens.`
- CTA `Opnieuw proberen`.
- De rest van de productinformatie blijft leesbaar.

### Prijs of voorraad gewijzigd bij checkout

- Toon de betreffende regel bovenaan de checkout met oud en nieuw bedrag of beschikbaar gewicht.
- Vraag expliciete bevestiging voordat een nieuwe totaalsom naar Mollie gaat.
- Als onvoldoende voorraad resteert, blokkeer alleen die regel en laat de gebruiker teruggaan naar het mandje.

## 7. Mobiele ervaring

- Productkaart: foto, kerncopy en CTA; quick choice in een native `<details>`-achtige disclosure met minstens 44 px hoge bediening.
- Productdetail: foto eerst, daarna aankoopblok. Na het voorbijscrollen van de hoofd-CTA verschijnt een compacte sticky koopbalk onderin met geselecteerd gewicht, prijs en `In mandje`.
- Sticky balk houdt rekening met `env(safe-area-inset-bottom)` en bedekt geen validatie- of cookiemelding.
- Gewichtkeuzes vormen op smalle schermen een 2×2-grid; nooit horizontaal afsnijden.
- Mandregels stapelen als: foto/naam → gewicht en stukprijs → aantal → regeltotaal.
- Geen essentiële actie bestaat alleen bij hover.

## 8. Toegankelijkheid

- Gewichtkeuze is een `<fieldset>` met zichtbare `<legend>Kies je gewicht</legend>` en echte radio-inputs; visuele knoppen zijn gekoppelde labels.
- De prijs is een `<output>` met programmatische relatie tot het fieldset.
- Voorraadtekst gebruikt niet alleen kleur; `Beschikbaar`, `Bijna op` en `Uitverkocht` staan letterlijk in de tekst.
- Disabled varianten blijven screenreader-begrijpelijk via labeltekst; ze zijn niet focusbaar.
- Toevoeg- en foutmeldingen gebruiken een persistente `role="status"`/`aria-live="polite"`; kritieke checkoutfouten krijgen focus via een foutsummary.
- Focusvolgorde volgt visuele volgorde. Minimaal 44×44 px touch targets en bestaande duidelijke focusring blijven behouden.
- Prijzen worden als Nederlandse eurobedragen geformatteerd; gewichten worden niet alleen als afkorting aan screenreaders aangeboden (`aria-label="500 gram"`).
- Animaties veranderen alleen opacity/transform, duren kort en vallen weg bij `prefers-reduced-motion`.

## 9. Visuele uitwerking binnen Kaasies

- Behoud het warme papier, grove zwarte lijnwerk en de bestaande productkleur per kaas: aqua voor jong, roze voor belegen, tomaat voor oud.
- Gebruik fotografie in de kaarten en detailhero; geen illustratie als productbewijs.
- Gewichtlabels zijn scherp omlijnd en grafisch, niet als generieke zachte UI-pills met schaduw.
- De gekozen maat krijgt botergeel en een kleine hoekmarkering, alsof een kaasboer het stuk met krijt heeft aangewezen — zonder krijtbordnostalgie.
- Prijs is groot genoeg om direct samen met gewicht gelezen te worden, maar productnaam en smaak blijven de eerste visuele hiërarchie.
- Copy blijft kort en concreet: `Kies je stuk`, `Snijden maar`, `Nog een paar stukken`. Vermijd `premium`, `assortiment` en `ambachtelijk`.

## 10. Validatie en bedrijfsregels

- Weigeren: ontbrekend product, niet-actief product, onbekend gewicht, gewicht ≤ 0, onvoldoende voorraad, ongeldige prijs of niet-geheel aantal.
- Maximum per mandregel in de browser: het laagste van 10 stuks of `floor(stockGrams / weightGrams)`. De server valideert opnieuw.
- Beschikbare voorraad wordt in de storefront niet als exact kilogramgetal getoond; exacte voorraad is backoffice-informatie.
- Het toevoegen aan een mand reserveert nog geen voorraad. Reservering start pas bij de server-side checkout/Mollie-flow en krijgt een beperkte vervaltijd.
- Een product met minder dan 250 g voorraad is storefront-uitverkocht, tenzij kleinere gewichten later expliciet worden toegestaan.
- Geen negatieve voorraad en geen afronding van voorraad naar kilo’s.

## 11. Testcriteria

### Pure unit-tests

1. 250/500/750/1000 g leveren met een integer kiloprijs correcte centbedragen.
2. `lineId` is uniek per product-gewichtcombinatie.
3. Twee identieke varianten worden samengevoegd; verschillende gewichten blijven aparte regels.
4. Subtotaal gebruikt stukprijs × aantal en blijft integer centen.
5. Beschikbare gewichten respecteren `allowedWeightsGrams` én `stockGrams`.
6. Lage voorraad, uitverkocht en inactief krijgen de juiste state.
7. Maximumaantal kan voorraad niet overschrijden.
8. V1-migratie maakt geldige 500 g-regels en verwerpt beschadigde data veilig.
9. Ongeldig productdata faalt met een begrijpelijke fout, niet met `NaN`.

### Browser-/integratietests

1. Shop toont exact de actieve drie kazen in jong → belegen → oud.
2. Gewicht wisselen verandert prijs en CTA zonder paginareload.
3. Een uitverkochte maat is zichtbaar, benoemd en niet te kiezen.
4. Productdetail voegt de gekozen variant toe en live region kondigt dit aan.
5. 250 g en 500 g van dezelfde kaas verschijnen als twee mandregels.
6. Aantal verhogen werkt tot de voorraadlimiet en geeft daarna feedback.
7. Mandje en checkout tonen gewicht, stukprijs, aantal, regeltotaal en totaal consistent.
8. Refresh bewaart v2-manddata.
9. De volledige route shop → product → mandje → formulier werkt op 390×844 en desktop.
10. Toetsenbordbediening kan gewicht kiezen, toevoegen en checkout bereiken zonder focusverlies.
11. Reduced motion voorkomt decoratieve beweging.
12. Catalogusfout toont retry zonder productcopy of navigatie te verwijderen.

### Definition of done

- Geen inline product-JSON of vaste productprijzen meer in HTML.
- Eén prijsfunctie en één voorraadfunctie worden door alle storefrontweergaven gebruikt.
- Alle bestaande cart-tests zijn aangepast of gemigreerd en slagen.
- Nieuwe catalogus-, variant- en browsertests slagen.
- Alle lokale pagina-audits en bestaande backoffice-tests blijven groen.
- Productdata kan later door een PocketBase-adapter worden geleverd zonder templatewijziging.

## 12. Afhankelijkheden en afstemming

### Agent Text / Agent Stomp

Moeten definitieve zichtbare naam, bijnaam, rijpingslabel, smaakcopy en bronclaims leveren voor jong, belegen en oud. Zij wijzigen geen stabiele `id`, `slug` of variantstructuur.

### Agent Back Office

Moet exact hetzelfde productcontract beheren: `status`, `pricePerKgCents`, `stockGrams`, `lowStockThresholdGrams` en `allowedWeightsGrams`. Voorraad invoeren in kilo’s mag in de UI, maar wordt bij opslaan veilig naar gehele grammen geconverteerd.

### Agent PocketBase

Moet een adapter leveren die de catalogus naar dit contract normaliseert. Benodigde collecties/velden: products, product weights of een gevalideerde weight-array, prijs per kilo, voorraad in grammen en versie/updated timestamp.

### Agent Formulier

Checkoutgegevens staan los van het mandmodel. Het formulier ontvangt orderregels met `productId`, `weightGrams`, `quantity`, `unitPriceCents` en snapshots.

### Agent Mollie

Mag nooit browserbedragen vertrouwen. De server haalt producten opnieuw op, valideert voorraad en prijs, berekent het totaal, reserveert voorraad en maakt daarna pas de Mollie-payment aan. Webhookbevestiging voltooit de order en boekt voorraad definitief af.

### Agent CEO

Beslissingen die vóór implementatie moeten worden bevroren:

1. definitieve winkelnaam/marketingnaam per Stompetoren-variant;
2. werkelijke kiloprijzen;
3. toegestane startgewichten per kaas;
4. voorraadreserveringsmoment en vervaltijd;
5. verzenddrempel en of die op bedrag of totaalgewicht wordt gebaseerd.

## 13. Aanbevolen implementatievolgorde

1. Productcontract en pure catalogus-/variantfuncties met tests.
2. Cart v2 en veilige v1-migratie met tests.
3. Productpicker op één productpagina en mobiele browsertest.
4. Alle drie productpagina’s en shopgrid aansluiten.
5. Mandje en checkout verrijken met gewicht en regelprijzen.
6. Fout-, voorraad- en toegankelijkheidsstates.
7. PocketBase-adapter toevoegen achter hetzelfde contract.
8. Server-side prijs/voorraadvalidatie en Mollie-reserveringsflow.

