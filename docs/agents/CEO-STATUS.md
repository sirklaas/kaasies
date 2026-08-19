# KAASIES’ — CEO-status

**Laatste controle:** 19 augustus 2026  
**Rol:** Agent CEO  
**Doel:** één controlepunt voor voortgang, afhankelijkheden, risico’s en acceptatie van de eerste verkoopbare versie.

## Statuslegenda

- [x] Aanwezig en lokaal gecontroleerd
- [ ] Nog te bouwen of nog niet aantoonbaar geverifieerd
- **Geblokkeerd** betekent dat een concrete keuze, toegang of eerder werk nodig is.

## Nulmeting

- [x] **Storefront-prototype — bestaand** — Eigenaar: Agent Shop / Agent Stomp
  - Homepage, shop, drie productpagina’s, winkelmand, checkout, servicepagina’s en back office bestaan als statische HTML.
  - 12 unit-tests slagen; 12 HTML-pagina’s slagen voor structuur en lokale bestandsverwijzingen.
- [x] **Merkbasis — bestaand** — Eigenaar: Agent Hero / Agent Text
  - Het aangeleverde logo staat op alle bestaande pagina’s.
  - `BRANDVOICE.md` bevat bruikbare regels voor directe, rebelse Nederlandse copy.
- [x] **Winkelmandprototype — bestaand** — Eigenaar: Agent Shop
  - Product toevoegen, aantallen, subtotalen en verzendkosten werken via `localStorage`.
- [x] **Order Journey Board-prototype — bestaand** — Eigenaar: Agent Back Office
  - Bewerkbare stappen, demobestellingen en labelvoorbeeld werken lokaal.
- [ ] **Productieplatform — ontbreekt**
  - Geen Git-repository, packageconfiguratie of Vercel-configuratie aangetroffen.
  - Geen PocketBase-, Mollie-, e-mail-, webhook- of vervoerdersintegratie aangetroffen.
  - Checkout slaat geen bestelling op en start geen betaling.
  - Back office gebruikt alleen `localStorage` en vaste demodata.

## Beslis- en bouwvolgorde

### Fase 0 — Contracten, veiligheid en eigenaarschap

- [ ] **0.1 Gezamenlijk domeincontract vastleggen** — Eigenaar: Agent CEO + Agent PocketBase
  - Definieer één bron voor `products`, `weight_options`, `inventory_lots`, `customers`, `orders`, `order_items`, `payments`, `campaigns`, `blog_posts` en `workflow_events`.
  - Bedragen worden als gehele eurocenten opgeslagen; gewicht en voorraad als gehele grammen.
  - Orderregels bewaren een momentopname van productnaam, prijs per gewichtsoptie en BTW, zodat latere productwijzigingen oude orders niet veranderen.
  - Orderstatussen minimaal: `draft`, `pending_payment`, `paid`, `processing`, `label_ready`, `shipped`, `delivered`, `cancelled`, `refunded`.
  - **Acceptatie:** Shop, Back Office, PocketBase en Mollie gebruiken exact dezelfde veldnamen en statusovergangen.
- [ ] **0.2 Geheimen en omgevingen beveiligen** — Eigenaar: Agent PocketBase + Agent Mollie + Agent URL
  - PocketBase-admin- en Mollie-sleutels uitsluitend server-side in omgevingsvariabelen; nooit in browsercode of Git.
  - De PocketBase-skill bevat momenteel vaste beheergegevens in platte tekst. Deze vóór productie roteren en vervangen door omgevingsvariabelen.
  - Scheid test en productie voor Mollie, PocketBase en Vercel.
  - **Acceptatie:** secretscan van repository en gebouwde browserassets vindt geen beheerderswachtwoord, API-key of webhooksecret.
- [ ] **0.3 Wettelijke verkoopinformatie vaststellen** — Eigenaar: Agent CEO, input nodig van eigenaar
  - Bedrijfsnaam, KvK, BTW, retour/klachten, privacy, algemene voorwaarden, verzendgebied, gekoelde levering, allergenen en definitieve BTW-regels.
  - **Acceptatie:** verplichte informatie is zichtbaar vóór betaling en wordt bij de orderversie bewaard.

### Fase 1 — Inhoud en campagnefundament

- [ ] **1.1 Tien hero-campagneconcepten** — Eigenaar: Agent Hero
  - Elk concept bevat kernstelling, headline, korte body, CTA, beeldrichting, toegankelijk alt-concept en bron/claimcontrole.
  - Schrijf volgens `BRANDVOICE.md`; vermijd onbewezen feitelijke beschuldigingen over specifieke supermarktproducten.
  - **Acceptatie:** 10 onderling verschillende concepten, waarvan één als eerste campagne kan worden gekozen zonder nieuwe copyronde.
- [ ] **1.2 Wekelijkse hero → blog-levenscyclus** — Eigenaar: Agent Hero + Agent PocketBase
  - Campagne heeft `draft`, `scheduled`, `active` en `archived` status, publicatieperiode, slug, hero-inhoud en volledige blogtekst.
  - Bij activering van een nieuwe campagne wordt de vorige niet verwijderd maar als openbare blogpost gearchiveerd.
  - **Acceptatie:** activeren van campagne B toont B in de hero en campagne A blijft via een unieke blog-URL bereikbaar; slechts één campagne is actief.
- [ ] **1.3 Stompetoren-bronteksten verwerken** — Eigenaar: Agent Text + Agent Stomp
  - Gebruik de drie opgegeven Stompetoren-pagina’s als inhoudelijke bron en herschrijf aantoonbaar in Kaasies’-stijl.
  - Bevestig productmapping: jong, belegen en oud versus de bronpagina’s `jong-tm-belegen`, `extra-belegen-tm-oud` en `grand-cru`.
  - Verifieer rijping, ingrediënten, allergenen, herkomst en claims vóór publicatie.
  - **Acceptatie:** elk product heeft bronnotities plus eigen copy; geen lange letterlijke overname en geen verzonnen productspecificaties.

### Fase 2 — Productcatalogus en voorraad

- [ ] **2.1 PocketBase-schema en toegangsregels** — Eigenaar: Agent PocketBase — Afhankelijk van 0.1 en 0.2
  - Maak een idempotent schemascript; collections worden in afhankelijkheidsvolgorde aangemaakt.
  - Publiek mag alleen actieve producten/campagnes lezen. Product-, voorraad-, order- en betalingsmutaties verlopen via geauthenticeerde servercode of bevoegde back-officegebruikers.
  - **Acceptatie:** schema kan tweemaal veilig worden uitgevoerd; onbevoegde schrijfverzoeken worden geweigerd; seeddata bevat de drie kazen.
- [ ] **2.2 Back-office productbeheer** — Eigenaar: Agent Back Office — Afhankelijk van 2.1
  - Product aanmaken/bewerken, actief zetten, afbeeldingen, prijs per gewichtsoptie en voorraad in grammen beheren.
  - Voorraadmutaties hebben reden, actor, tijdstip en delta; geen stille overschrijving.
  - **Acceptatie:** prijs- of voorraadwijziging verschijnt na herladen in shop; negatieve voorraad wordt geweigerd; auditlog toont de wijziging.
- [ ] **2.3 Homepage Stompetoren-blok** — Eigenaar: Agent Stomp — Afhankelijk van 1.3 en productseed uit 2.1
  - Toon exact jong, belegen en oud onder de hero met beeld, korte karaktercopy, prijs vanaf en directe shoplinks.
  - **Acceptatie:** alle drie kaarten komen uit de catalogus, linken naar de juiste productpagina en blijven bruikbaar op 390 px breedte.
- [ ] **2.4 Shop en productkeuze per gewicht** — Eigenaar: Agent Shop — Afhankelijk van 2.1 en 2.2
  - Shop leest actieve kazen uit PocketBase; productdetail vereist een beschikbare gewichtsoptie vóór toevoegen.
  - Mandregel identificeert product én gewichtsoptie; prijs en voorraadcontrole gebeuren opnieuw op de server bij orderaanmaak.
  - **Acceptatie:** klant kiest een gewicht, ziet de juiste prijs, kan alleen beschikbare varianten bestellen en krijgt duidelijke uitverkochtmelding.

### Fase 3 — Klant- en orderinvoer

- [ ] **3.1 Klantformulier voltooien** — Eigenaar: Agent Formulier — Afhankelijk van 0.1
  - Vereist: naam, straat/huisnummer, postcode, woonplaats, telefoon en e-mail.
  - Nieuwsbrieftoestemming is optioneel, standaard uit, apart van koopvoorwaarden en voorzien van tijdstip/tekstversie.
  - Validatie werkt client- én server-side; gegevens blijven beschikbaar na een terugkeer van Mollie.
  - **Acceptatie:** onvolledige/ongeldige invoer start geen betaling; geldige invoer maakt één `pending_payment` order; dubbele submit maakt geen dubbele order.
- [ ] **3.2 Server-side orderberekening en voorraadreservering** — Eigenaar: Agent PocketBase + Agent Shop — Afhankelijk van 2.4 en 3.1
  - Negeer prijzen uit browserdata; herbereken producten, gewicht, BTW, verzending en totaal vanuit de catalogus.
  - Reserveer voorraad tijdelijk bij `pending_payment`; geef vrij na verlopen/mislukte betaling en boek definitief bij `paid`.
  - **Acceptatie:** gemanipuleerde browserprijs verandert het ordertotaal niet; twee gelijktijdige orders kunnen dezelfde laatste voorraad niet beide verkopen.

### Fase 4 — Mollie en betrouwbare betaling

- [ ] **4.1 Mollie-testintegratie** — Eigenaar: Agent Mollie — Afhankelijk van 3.2 en serverruntime
  - Maak betaling server-side met uniek ordernummer, bedrag uit serverberekening, redirect-URL en webhook-URL.
  - Bewaar Mollie payment-id en status; gebruik idempotency zodat retry geen tweede betaling/order maakt.
  - **Acceptatie:** testbetaling leidt naar Mollie en keert terug naar een statuspagina die de serverstatus toont, niet alleen een queryparameter vertrouwt.
- [ ] **4.2 Webhook als bron voor betaalstatus** — Eigenaar: Agent Mollie + Agent PocketBase
  - Verifieer webhook door de betaling opnieuw bij Mollie op te halen; verwerk herhaalde en verkeerd geordende callbacks veilig.
  - Alleen bevestigde `paid` status start fulfillment; `failed`, `expired`, `cancelled` en refunds zijn afgehandeld.
  - **Acceptatie:** dubbele webhook verstuurt geen dubbele mail en boekt geen dubbele voorraad; redirect zonder betaalde webhook start geen fulfillment.

### Fase 5 — Fulfillment, communicatie en label

- [ ] **5.1 Orderbevestiging en interne workflow** — Eigenaar: Agent Back Office — Afhankelijk van 4.2
  - Na `paid`: betaalbevestiging, picklijst, weeg/kwaliteitscontrole en verpakkingsstappen met echte orderregels.
  - **Acceptatie:** betaalde testorder verschijnt eenmaal in Back Office; statuswijzigingen zijn persistent en hebben tijdstip/actor.
- [ ] **5.2 Verzendlabel ontwerpen én integreren** — Eigenaar: Agent Back Office — Afhankelijk van vervoerder/printerkeuze
  - Bestaand Kaasies-label is visuele basis; maak printformaat, afzender, ontvanger, ordernummer, gewicht, barcode/trackcode en foutstaat concreet.
  - Automatisch printen pas na expliciete printer- en vervoerderskeuze; bied eerst gecontroleerde print/downloadactie.
  - **Acceptatie:** label gebruikt echte orderdata, past zonder afsnijden op gekozen formaat en wordt niet aangemaakt vóór betaal- en adrescontrole.
- [ ] **5.3 Verzend- en nazorgmails** — Eigenaar: Agent Back Office
  - Verzendmail pas na bevestigde trackcode; daarna bezorgcheck, review en herhaalaankoop volgens configureerbare journey.
  - Upsell vóór fulfillment mag de reeds betaalde order niet stil wijzigen; gebruik een aparte aanvullende betaling of nieuwe order.
  - **Acceptatie:** mail heeft juiste ontvanger, orderreferentie en tracklink; herhaald event verstuurt niet dubbel; opt-out wordt gerespecteerd.

### Fase 6 — GitHub, Vercel en livegang

- [ ] **6.1 Repository en preview deployment** — Eigenaar: Agent URL
  - Initialiseer/bevestig GitHub-repository, `.gitignore`, build/startinstructies en Vercel-preview.
  - Leg de gebruiker steeds één kleine handeling tegelijk uit als login, repositorykeuze of domeininstelling nodig is.
  - **Acceptatie:** iedere wijziging heeft een preview-URL; productiegeheimen staan alleen in Vercel Environment Variables; preview gebruikt testdiensten.
- [ ] **6.2 Productiearchitectuur bevestigen** — Eigenaar: Agent URL + Agent PocketBase + Agent Mollie
  - De huidige statische site kan geen veilige Mollie-adminhandelingen of geheime PocketBase-operaties uitvoeren. Voeg een serverruntime/API-laag toe vóór live betaling.
  - **Acceptatie:** browserbundle bevat geen secrets; webhooks zijn publiek bereikbaar via HTTPS; logs tonen request-id/order-id zonder persoonsgegevens te lekken.
- [ ] **6.3 Domein, productiecontrole en launch** — Eigenaar: Agent URL + Agent CEO
  - Domein/DNS, canonical URL, redirects, foutpagina’s, backups, monitoring en rollback vastleggen.
  - End-to-end test: product → gewicht → adres → Mollie-test → webhook → voorraad → back office → label → verzendmail.
  - **Acceptatie:** volledige testmatrix slaagt op mobiel en desktop; daarna pas productiekeys activeren en één kleine echte bestelling uitvoeren.

## Agentenbord

| Agent | Eerstvolgende oplevering | Status | Blokkade/afhankelijkheid |
|---|---|---|---|
| CEO | Domeincontract reviewen en voortgang bijhouden | Actief | Input van alle agenten |
| URL | Git/GitHub/Vercel nulmeting en previewplan | Te starten | GitHub/Vercel-toegang gebruiker |
| Hero | 10 campagneconcepten + hero/blog contentmodel | Te starten | Brand Voice aanwezig |
| Stomp | Productmapping en homepageblok | Te starten | Gevalideerde broncopy/productdata |
| Text | Bronextractie en Kaasies’-herschrijving | Te starten | Stompetoren-bronnen |
| Shop | Gewichtsvariant-contract en shopflow | Te starten | Domeincontract/PocketBase-schema |
| Back Office | Product-/voorraadbeheer ontwerp | Te starten | PocketBase-schema en auth |
| Formulier | Veldschema, consent en validatie | Te starten | Domeincontract/privacytekst |
| Betalingspagina | Betaalstatus- en retourpagina UX | Te starten | Mollie statuscontract |
| PocketBase | Schema, regels, seeds en serverhelpers | Te starten | Unieke collection-prefix + secretsanering |
| Mollie | Testbetaling, webhook en idempotency | Te starten | Serverruntime + ordermodel |

## Belangrijkste risico’s

1. **Kritiek — secrets:** de lokale PocketBase-instructie bevat vaste admin-inloggegevens. Niet kopiëren naar projectcode; vóór productie roteren.
2. **Kritiek — betaald ≠ redirect:** fulfillment mag nooit starten op alleen de browserredirect; uitsluitend op servermatig geverifieerde Mollie-status.
3. **Hoog — voorraad per kilo:** voorraad in grammen en verkoopopties moeten atomair worden gereserveerd om overselling te voorkomen.
4. **Hoog — statische architectuur:** Vercel-hosting van alleen HTML/JS is onvoldoende voor veilige betalingen en adminoperaties.
5. **Hoog — productclaims en beeldrechten:** huidige foto’s/teksten zijn als tijdelijk/prototype gemarkeerd; publicatierechten en productspecificaties moeten vaststaan.
6. **Hoog — privacy:** telefoon, adres, e-mail en nieuwsbriefconsent vereisen bewaartermijnen, toegangsregels, export/verwijdering en privacytekst.
7. **Middel — agentconflicten:** agents mogen niet ieder eigen productnamen, prijzen of orderstatussen hardcoderen; het domeincontract is leidend.
8. **Middel — upsell na betaling:** een aanvulling kan niet zonder expliciete toestemming aan een betaald bedrag worden toegevoegd.

## Eerst doen

1. Agent CEO en Agent PocketBase leggen het gedeelde domeincontract en de collection-prefix vast.
2. Agent URL maakt parallel uitsluitend een veilige **preview**-route; geen productiekeys of live betaling.
3. Agent Hero en Agent Text leveren parallel content die geen backend nodig heeft.
4. Daarna bouwt Agent PocketBase schema + seeds; vervolgens Shop, Stomp, Back Office en Formulier tegen dezelfde data.
5. Mollie volgt pas wanneer server-side orderberekening en voorraadreservering aantoonbaar werken.
6. Fulfillment en livegang volgen pas na een idempotente betaalwebhook en volledige end-to-endtest.

## CEO-rapportageritme

- Werk dit document bij bij iedere agentoplevering.
- Markeer alleen `[x]` na controle van concrete bestanden én relevante tests.
- Rapporteer per ronde: **klaar**, **in uitvoering**, **geblokkeerd**, **volgende beslissing**, **risico veranderd**.
- Livegang blijft geblokkeerd zolang Fase 0, 2, 3, 4 en de end-to-endtest van 6.3 niet volledig zijn afgevinkt.
