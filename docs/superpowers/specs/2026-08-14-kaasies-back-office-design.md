# Kaasies’ Back Office · Order Journey Board

> Datum: 2026-08-14  
> Status: ontwerp goedgekeurd in richting; wacht op laatste controle voor implementatie

## Doel

Een visuele back-officepagina waarop de eigenaar iedere stap na een bestelling kan zien, aanpassen, aan- of uitzetten en herschikken. Het scherm moet begrijpelijk voelen voor een winkelier en niet als een technisch automatiseringsplatform.

## Gekozen richting

De pagina gebruikt een **Order Journey Board**: een verticale, genummerde klantreis met kleurrijke actiekaarten. Links staat een compacte lijst met recente bestellingen. In het midden staat de actieve workflow. Rechts verschijnt een bewerk- en voorbeeldpaneel voor de geselecteerde stap.

De bestaande Kaasies’-huisstijl blijft intact: Bungee voor het woordmerk, Bricolage Grotesque voor headings, Asap voor interfacecopy, stevige contouren, uitgesproken kleuren en kleine beheerste micro-animaties.

## Pagina-opbouw

### Header

- Kaasies’-woordmerk met label `Back office`.
- Contextnavigatie: Bestellingen, Journey, Producten en Klanten.
- Statusmelding `Alle systemen werken` en een knop `Bekijk winkel`.

### Samenvatting

- Omzet vandaag.
- Openstaande bestellingen.
- Gemiddelde orderwaarde.
- Aantal workflow-acties dat aandacht vraagt.

Deze waarden zijn overtuigende prototypegegevens en worden duidelijk als demo-inhoud behandeld.

### Linkerkolom: bestellingen

- Recente ordernummers met klantnaam, bedrag, tijd en actuele status.
- Een order kan worden geselecteerd; de tijdlijn toont dan die order als voorbeeld.
- Filters voor `Alle`, `Actie nodig` en `Onderweg`.

### Middenkolom: Order Journey

De standaardflow bevat:

1. Bestelling ontvangen.
2. Betaling bevestigd.
3. Persoonlijke upsell aanbieden.
4. Lidmaatschap of nieuwsbrief voorstellen.
5. Interne picklijst maken.
6. Kaas wegen en kwaliteitscheck uitvoeren.
7. Verpakkingsinstructie tonen.
8. Verzendlabel maken en printen.
9. Track-and-trace koppelen.
10. Verzendbevestiging versturen.
11. Bezorging controleren.
12. Reviewverzoek versturen.
13. Herhaalaankoop of abonnement voorstellen.

Iedere kaart toont type, timing, status en eigenaar. Een schakelaar activeert of pauzeert de stap. Met `Bewerk` opent het rechterpaneel. Pijlen verplaatsen een stap omhoog of omlaag. Een knop onderaan voegt een nieuwe actie toe.

### Rechterkolom: editor en live voorbeeld

Het paneel bevat:

- Naam en actietype.
- Trigger of wachttijd.
- Onderwerpregel en korte berichttekst voor e-mailacties.
- Interne instructie voor handmatige acties.
- Aan/uit-status.
- Knoppen `Voorbeeld`, `Test actie` en `Wijzigingen opslaan`.

Wijzigingen worden in het prototype lokaal in de browser opgeslagen. Er worden geen echte e-mails verzonden en er worden geen echte labels geprint.

## Verzendlabel

De labelstap toont een printbaar labelvoorbeeld van 100 × 150 mm met:

- Kaasies’-woordmerk en payoff.
- Ordernummer en ontvanger.
- Adresgegevens.
- Verzendmethode en gewicht.
- Grote fictieve barcode en track-and-tracecode.
- Een korte Kaasies’-boodschap: `Pak open. Kaas aan.`

Het label blijft zwart-wit voor betrouwbare thermische labelprinters, met typografie en compositie als merkdragers. De browserprintactie is in het prototype bruikbaar.

## Interactie en opslag

- Workflow-instellingen worden als JSON in `localStorage` bewaard.
- De gebruiker kan wijzigingen terugzetten naar de standaardflow.
- Selectie, filters, schakelaars, editor, herschikken en toevoegen werken zonder backend.
- Testacties geven duidelijke prototypesfeedback via een toastmelding.
- De workflowlog registreert lokaal recente testhandelingen.

## Responsiviteit

- Desktop: drie kolommen met vaste orde: orders, journey, editor.
- Tablet: orderlijst boven de journey; editor als paneel eronder.
- Mobiel: één kolom, met compacte tabnavigatie tussen Orders, Journey en Editor.
- Alle bediening blijft toetsenbordtoegankelijk en ondersteunt `prefers-reduced-motion`.

## Grenzen van deze versie

- Geen echte Mollie-webhooks.
- Geen e-mailprovider of nieuwsbriefplatform.
- Geen vervoerders-API en geen echte barcodes.
- Geen gebruikersaccounts, rollen of cloudopslag.
- Geen mutaties aan echte klant- of ordergegevens.

De interfaces worden wel zo benoemd dat deze koppelingen later logisch kunnen worden toegevoegd.

## Foutafhandeling

- Ongeldige editorvelden blokkeren lokaal opslaan en tonen een concrete melding.
- Een workflow kan niet leeg worden gemaakt; de basisstap `Bestelling ontvangen` blijft vergrendeld.
- Beschadigde lokale data valt terug op de standaardflow.
- Een reset vraagt om bevestiging omdat lokale aanpassingen verloren gaan.

## Verificatie

- Unit tests voor workflowvolgorde, schakelaars, bewerken, toevoegen en herstel van ongeldige opslag.
- Pagina-audit voor titel, description, één h1 en geldige lokale verwijzingen.
- Playwright-controle op desktop en mobiel voor selectie, editor, herschikken, opslag en labelweergave.
- Visuele inspectie van het printlabel op 100 × 150 mm.

## Zelfcontrole

De scope is bewust één lokale prototypepagina. Alle demo-acties en beperkingen zijn expliciet. De orderflow, editor, opslag, foutafhandeling en verificatie spreken elkaar niet tegen en bevatten geen openstaande placeholders.
