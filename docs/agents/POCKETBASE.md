# Agent PocketBase — veilig domeincontract

## Status

De lokale basis staat klaar. Er is **geen verbinding met een externe PocketBase gemaakt**, er zijn geen collecties extern aangemaakt en er staan geen credentials in de Kaasies-code.

De aangetroffen PocketBase-skill bevatte hard-gecodeerde beheerdersgegevens. Die gegevens worden hier niet herhaald. **Roteer het betreffende beheerderswachtwoord voordat PocketBase wordt gekoppeld** en verwijder vaste credentials uit de skill.

## Architectuur

De browser praat straks niet rechtstreeks met afgeschermde PocketBase-collecties. Checkout, voorraadmutaties, Mollie-webhooks en orderstatussen lopen via een serverfunctie. Alleen actieve productpresentatie mag publiek leesbaar zijn.

| Collectie | Functie | Publiek |
|---|---|---|
| `kaasies_products` | Producttekst, afbeelding en SEO | Alleen actieve producten lezen |
| `kaasies_product_variants` | Gewicht, SKU en prijs | Nee; via server/storefront-API |
| `kaasies_inventory` | Voorraad en reserveringen in grammen | Nee |
| `kaasies_customers` | Contact-, adres- en toestemmingsgegevens | Nee |
| `kaasies_orders` | Totalen, betaal- en fulfilmentstatus | Nee |
| `kaasies_order_lines` | Immutable snapshots van prijs en gewicht | Nee |
| `kaasies_workflow_events` | Audit trail voor statuswijzigingen | Nee |

Het volledige declaratieve schema staat in `assets/pocketbase/schema.mjs`.

## Belangrijke contractregels

- Gewichten en voorraad zijn altijd gehele **grammen**. Zo ontstaan geen afrondingsfouten met kilo-kommagetallen.
- Bedragen zijn altijd gehele **eurocenten**.
- Een orderregel bewaart snapshots van naam, SKU, gewicht en prijs. Een latere productwijziging verandert een bestaande order dus niet.
- `stockGrams` is fysieke voorraad; `reservedGrams` is tijdelijk gereserveerd. Beschikbaar is `stockGrams - reservedGrams`.
- Nieuwsbriefinschrijving is standaard `false`. Bij toestemming worden boolean en tijdstip samen vastgelegd.
- Mollie bepaalt alleen de betaalstatus via een geverifieerde webhook. De browser mag een order nooit zelf op `paid` zetten.
- Workflow-events hebben een unieke `idempotencyKey`, zodat dezelfde webhook niet dubbel wordt verwerkt.
- Orderstatussen volgen: `draft → pending_payment → paid → processing → ready_to_ship → shipped → delivered`. Annuleren en terugbetalen zijn gecontroleerde zijpaden.

## Omgevingsvariabelen

Voor browser/build-configuratie:

```text
KAASIES_POCKETBASE_URL=https://jouw-pocketbase-host
```

Alleen voor de toekomstige serverfunctie, als deployment secrets — nooit met een `PUBLIC_`-prefix en nooit committen:

```text
KAASIES_POCKETBASE_SERVICE_EMAIL=...
KAASIES_POCKETBASE_SERVICE_PASSWORD=...
```

Mollie- en PocketBase-servicecredentials horen uitsluitend in Vercel Environment Variables. Gebruik aparte test- en productiegegevens.

## Eenvoudige vervolgstappen

1. Roteer eerst de eerder blootgestelde PocketBase-beheerdersgegevens.
2. Maak een beperkte Kaasies-serviceaccount aan; gebruik niet dagelijks de globale superuser.
3. Voeg bovenstaande variabelen als Vercel secrets toe.
4. Laat een server-side migratiescript de collecties in de volgorde uit `KAASIES_COLLECTION_ORDER` aanmaken.
5. Vul Jong, Belegen en Oud via de back office; prijzen in centen, voorraad in grammen.
6. Koppel de storefront via een serverfunctie die alleen actieve producten en verkoopbare varianten teruggeeft.
7. Koppel Mollie pas daarna en test webhooks met idempotency voordat live betalingen worden aangezet.

## Lokale bestanden

- `assets/pocketbase/domain.mjs` — validatie, orderberekening en statusovergangen
- `assets/pocketbase/config.mjs` — veilige URL-configuratie
- `assets/pocketbase/schema.mjs` — collectiecontract en toegangsregels
- `assets/data/catalog-contract.mjs` — gedeeld catalogusformaat
- `tests/pocketbase-domain.test.mjs` — domeintests zonder netwerk of mocks
