# Agent URL — GitHub- en Vercelplan voor Kaasies

Laatste controle: 19 augustus 2026

## Korte conclusie

De huidige website kan technisch eenvoudig als statische website op Vercel worden gezet. Er is geen buildcommando nodig: Vercel kan `index.html` en de andere HTML-, CSS-, JavaScript- en afbeeldingsbestanden rechtstreeks publiceren.

**Nog niet als echte webshop publiceren.** Een besloten preview is wel een logische eerste stap. De checkout, Mollie, PocketBase en e-mails zijn nog prototypes. Bovendien staat `back.html` nu tussen de openbare websitebestanden en worden tijdelijke productfoto's gebruikt die volgens de site zelf niet voor publicatie bedoeld zijn.

De veiligste route is:

1. eerst een **privé GitHub-repository** maken;
2. de code daar naartoe sturen;
3. die repository aan Vercel koppelen;
4. eerst een **preview** controleren;
5. pas na de productiecheck het echte domein koppelen.

Ik heb bij deze controle niets gepubliceerd, geen repository gemaakt en niets naar GitHub of Vercel gestuurd.

## Wat ik lokaal heb aangetroffen

| Onderdeel | Status | Betekenis |
|---|---|---|
| Website | 12 statische HTML-pagina's met gedeelde CSS en JavaScript | Geschikt voor een eenvoudige Vercel-preview zonder buildstap |
| Git | Deze map is **nog geen Git-repository** | Eerst lokaal Git initialiseren |
| GitHub CLI | Geïnstalleerd, accountnaam `sirklaas`, maar de opgeslagen login is ongeldig | De gebruiker moet één keer opnieuw inloggen |
| GitHub remote | Niet aanwezig | Er is nog geen online GitHub-repository gekoppeld |
| Vercel CLI | Geïnstalleerd, versie 50.38.2 | Werkt, maar er is een nieuwere versie beschikbaar; upgraden is niet nodig voor de eerste preview |
| Vercel login | Geldige login als `klaas-8579` | Vercel hoeft waarschijnlijk niet opnieuw ingelogd te worden |
| Vercel projectlink | Geen `.vercel`-map aanwezig | Het lokale project is nog niet aan een Vercel-project gekoppeld |
| Vercel-config | Geen `vercel.json` aanwezig | Voor deze statische preview is dat niet direct nodig |
| Node-project | Geen `package.json` of buildconfiguratie | Vercel moet als statische site worden ingesteld, zonder framework/buildcommando |
| Geheimen | Geen `.env`-bestanden of herkenbare API-sleutels gevonden | Mollie- en PocketBase-geheimen moeten later alleen via Vercel Environment Variables worden ingesteld |

## Wat jij één keer zelf moet doen

### 1. Opnieuw inloggen bij GitHub

Open Terminal en voer uit:

```bash
PATH="/opt/homebrew/bin:$PATH" gh auth login -h github.com
```

Kies vervolgens:

1. `GitHub.com`
2. `HTTPS`
3. inloggen via de browser
4. toestemming geven aan GitHub CLI

Controleer daarna:

```bash
PATH="/opt/homebrew/bin:$PATH" gh auth status
```

Het resultaat moet aangeven dat account `sirklaas` is ingelogd. Deel nooit de getoonde token of een API-sleutel in deze chat of in Git.

### 2. Beslissen welke domeinnaam de hoofdnaam wordt

Kies vóór de echte lancering één hoofddomein, bijvoorbeeld `kaasies.nl` of een internationale merknaam. Andere domeinen kunnen later naar dit hoofddomein doorverwijzen. Voor een eerste preview is geen domeinkeuze nodig; Vercel geeft automatisch een tijdelijk adres zoals `kaasies.vercel.app`.

### 3. Rechten op beelden en teksten bevestigen

De website noemt de productbeelden expliciet tijdelijk en niet geschikt voor publicatie. Bevestig vóór een publieke productieplaatsing schriftelijk dat Kaasies de productfoto's, het logo en de productteksten mag gebruiken, of vervang ze door eigen/licentievrije content.

## Wat Agent URL daarna kan uitvoeren

De onderstaande handelingen veranderen GitHub of Vercel en mogen daarom pas worden uitgevoerd nadat jij daar opdracht voor geeft.

### Fase A — lokale Git-basis

Agent URL maakt eerst een kleine `.gitignore`, bijvoorbeeld voor:

```text
.DS_Store
.vercel
.env
.env.*
!.env.example
node_modules
```

Daarna:

```bash
cd /Users/mac/GitHubLocal/kaas
git init
git add .
git commit -m "Initial Kaasies storefront prototype"
```

Voor het eerste commitmoment moet worden gecontroleerd dat tijdelijke of niet-publiceerbare bestanden niet onbedoeld meekomen.

### Fase B — privé GitHub-repository

Aanbevolen naam: `kaasies-site`. Start privé zolang beeldrechten, betaalverwerking en beheerbeveiliging niet gereed zijn.

```bash
cd /Users/mac/GitHubLocal/kaas
PATH="/opt/homebrew/bin:$PATH" gh repo create kaasies-site --private --source=. --remote=origin --push
```

Daarna controleert Agent URL:

```bash
git remote -v
git status
```

### Fase C — Vercel-preview via GitHub

Aanbevolen: verbind de GitHub-repository in het Vercel-dashboard. Daardoor maakt iedere latere GitHub-wijziging automatisch een testpreview en wordt de hoofdbranch automatisch opnieuw gepubliceerd.

Wat jij in Vercel doet:

1. Open [Vercel New Project](https://vercel.com/new).
2. Kies de GitHub-repository `kaasies-site`.
3. Kies bij Framework Preset: **Other**.
4. Laat Build Command leeg.
5. Laat Output Directory leeg of gebruik `.` als Vercel dit vereist.
6. Root Directory blijft de repository-root.
7. Klik op **Deploy**.

Er zijn voor de statische preview nog geen environment variables nodig.

Alternatief kan Agent URL na expliciete toestemming de CLI gebruiken:

```bash
cd /Users/mac/GitHubLocal/kaas
PATH="/opt/homebrew/bin:$PATH" vercel link
PATH="/opt/homebrew/bin:$PATH" vercel
```

De eerste opdracht koppelt het lokale project; de tweede maakt alleen een preview. Een echte productieplaatsing gebeurt later met `vercel --prod`.

### Fase D — preview controleren

Controlelijst vóór productie:

- homepage, shop, drie productpagina's, mandje, checkout, FAQ en contact openen;
- desktop en mobiel controleren;
- alle interne links en afbeeldingen controleren;
- browserconsole op fouten controleren;
- controleren dat tijdelijke teksten duidelijk als prototype zijn gemarkeerd;
- bevestigen dat `back.html` niet publiek als onbeveiligd beheer bereikbaar is;
- controleren dat er geen geheime sleutels in de browsercode staan.

### Fase E — hoofddomein koppelen

Pas na de productiecheck:

1. Open in Vercel het project.
2. Ga naar **Settings → Domains**.
3. Voeg het gekozen hoofddomein toe.
4. Neem de door Vercel getoonde DNS-records exact over bij de domeinprovider.
5. Voeg `www` toe en laat één versie permanent naar het hoofddomein doorverwijzen.
6. Wacht tot Vercel aangeeft dat DNS en het SSL-certificaat geldig zijn.

Verander DNS pas wanneer duidelijk is waar de domeinnaam nu voor wordt gebruikt. E-mailrecords zoals MX, SPF, DKIM en DMARC mogen daarbij niet worden verwijderd.

## `kaasies.com` bij HostSlim — actuele DNS-controle

### Update 19 augustus 2026 · Vercel-project aangemaakt

- Vercel-project: `kaasies` onder team `klaas-projects-a2386724`.
- Publieke storefront: `https://kaasies.vercel.app`.
- `kaasies.com` en `www.kaasies.com` zijn aan dit project toegevoegd.
- Vercel vraagt voor beide hosts expliciet een A-record naar `76.76.21.21`.
- HostSlim blijft DNS-provider; de nameservers worden niet gewijzigd, zodat bestaande mailrecords intact blijven.
- De publieke upload sluit `back.html`, back-officecode, tests, interne documenten en brandspecificaties uit via `.vercelignore`.
- Nog uit te voeren bij HostSlim: bestaande web-A-records vervangen, conflicterende web-AAAA-records verwijderen en daarna Vercel-verificatie uitvoeren.

Aanvullende controle: 19 augustus 2026. Bronnen voor de technische Vercel-doelen zijn uitsluitend de officiële documentatie van Vercel:

- [Setting up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain), bijgewerkt 12 maart 2026;
- [Adding & Configuring a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain);
- [Deploying & Redirecting Domains](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting);
- [Vercel CLI: domains](https://vercel.com/docs/cli/domains).

### Wat nu vaststaat

- `kaasies.com` gebruikt nog de nameservers van HostSlim:
  - `ns01.sh-woe014.hostslim.nl`
  - `ns02.sh-woe014.hostslim.nl`
- Het hoofddomein wijst momenteel naar HostSlim met A-record `103.214.6.202`.
- Het hoofddomein heeft daarnaast twee AAAA-records:
  - `2a06:5b82:2070:8300::11`
  - `2a06:5b82:2070:8300::12`
- `www.kaasies.com` heeft geen CNAME en komt momenteel eveneens uit op `103.214.6.202`.
- E-mail loopt via `mail.kaasies.com`; MX en SPF bestaan al. Deze records mogen bij de verhuizing van alleen de website niet worden verwijderd.
- `mail.kaasies.com` gebruikt nog HostSlim-adressen. De mailhostrecords moeten daarom eveneens intact blijven.
- Vercel is geldig ingelogd als `klaas-8579`, onder team/scope `klaas-projects-a2386724`.
- Er bestaat in die scope nog geen Vercel-project voor Kaasies in de getoonde projectlijst.
- De lokale map is nog niet aan een Vercel-project gekoppeld: er is geen `.vercel`-map.
- `vercel domains inspect kaasies.com` meldt dat het domein nog niet in deze Vercel-scope aanwezig is.

### Aanbevolen domeinopzet

Vercel adviseert `www` als primaire host met een CNAME en een redirect van het kale domein naar `www`. Dat geeft Vercel meer flexibiliteit dan een vast A-record. Voor Kaasies wordt daarom aanbevolen:

- primaire website: `www.kaasies.com`;
- redirect: `kaasies.com` → `www.kaasies.com`;
- DNS blijft voorlopig bij HostSlim;
- uitsluitend de webrecords worden bij HostSlim aangepast;
- MX, SPF en alle records voor `mail.kaasies.com` blijven behouden.

### Welke records waarschijnlijk nodig zijn

De officiële algemene Vercel-doelen zijn:

| HostSlim-veld | Type | Algemeen Vercel-doel |
|---|---|---|
| `@` of leeg | A | `76.76.21.21` |
| `www` | CNAME | `cname.vercel-dns-0.com` |

**Deze waarden zijn nog geen definitieve invulinstructie.** Vercel zegt expliciet dat een project een eigen aanbevolen A- of CNAME-doel kan krijgen. Na het toevoegen van `kaasies.com` en `www.kaasies.com` aan het uiteindelijke Vercel-project moet daarom eerst de exacte uitvoer van `vercel domains inspect` of **Project → Settings → Domains** worden gevolgd.

### Wat nog ontbreekt voordat Agent URL exacte HostSlim-records kan geven

1. Het definitieve Vercel-project moet bestaan en minimaal één production deployment hebben.
2. De lokale map of GitHub-repository moet aan dat project gekoppeld zijn.
3. `kaasies.com` en `www.kaasies.com` moeten aan dat project zijn toegevoegd. Dit is een externe wijziging en is nog niet uitgevoerd.
4. Vercel moet tonen welk project-specifiek A-record, CNAME-record en eventueel TXT-verificatierecord het verwacht.
5. Er moet worden bevestigd dat `www.kaasies.com` de primaire versie wordt en het kale domein daarnaartoe redirect.
6. Een export of screenshot van de volledige HostSlim DNS-zone is nodig voordat records worden aangepast. De publieke DNS-controle laat niet altijd ongepubliceerde of provider-specifieke records zien.
7. De gewenste TTL moet bekend zijn. Praktisch is om de TTL van alleen de webrecords vóór de overgang tijdelijk laag te zetten, als HostSlim dit ondersteunt.

Zonder punten 1–4 kan niemand betrouwbaar het **definitieve** A/CNAME-doel geven. De algemene waarden gebruiken voordat Vercel het project heeft geïnspecteerd kan werken, maar is volgens Vercels actuele documentatie niet de veilige voorkeursroute.

### Records die bij de latere omschakeling aandacht vragen

- Het bestaande A-record voor `@` moet worden **vervangen**, niet naast een tweede concurrerend A-record blijven staan.
- Het bestaande webrecord voor `www` moet worden vervangen door het door Vercel opgegeven CNAME-record.
- De twee bestaande AAAA-records op het kale domein moeten bij de webverhuizing waarschijnlijk worden verwijderd. Vercel ondersteunt volgens de officiële DNS-documentatie geen IPv6-records voor deze aansluiting; als ze blijven staan kan een deel van de bezoekers nog bij HostSlim uitkomen.
- Verwijder **niet** de A/AAAA-records van `mail.kaasies.com`.
- Verwijder **niet** het MX-record `10 mail.kaasies.com.` of het bestaande SPF TXT-record.
- Als Vercel een TXT-record voor domeineigendom toont, voeg alleen dat specifieke record toe; vervang daarmee geen SPF- of ander TXT-record.
- Nameservers naar Vercel verhuizen is voor deze situatie niet nodig. DNS bij HostSlim houden verkleint het risico dat mailrecords verloren gaan.

### Veilige volgorde zodra deployment is toegestaan

1. Maak en test eerst de Vercel-production deployment op het tijdelijke `.vercel.app`-adres.
2. Voeg in Vercel `www.kaasies.com` en `kaasies.com` aan precies dat project toe.
3. Noteer de exacte waarden die Vercel per host toont of gebruik read-only:

   ```bash
   vercel domains inspect kaasies.com
   vercel domains inspect www.kaasies.com
   ```

4. Maak vóór wijzigingen een export/screenshot van alle HostSlim DNS-records.
5. Wijzig bij HostSlim alleen de webrecords volgens de exacte Vercel-uitvoer.
6. Controleer na DNS-propagatie beide domeinen, HTTPS en de redirect.
7. Test daarna expliciet ontvangst en verzending van e-mail op `@kaasies.com`.

Er zijn tijdens deze controle geen DNS-records, Vercel-domeinen, projecten of deployments aangemaakt of gewijzigd.

## Blokkerende productiepunten

Deze punten hoeven een besloten ontwerp-preview niet tegen te houden, maar wel een echte winkel:

1. **`back.html` is geen beveiligde backoffice.** Het gebruikt demodata en `localStorage`. Op een normale statische Vercel-deployment is de pagina openbaar als iemand het adres kent. Verplaats beheer later naar een beveiligde applicatie met login en rollen, of sluit `back.html` uit van de productie-output.
2. **Bestellingen bestaan alleen in de browser.** Mandje en workflow gebruiken `localStorage`; gegevens worden niet centraal opgeslagen en synchroniseren niet tussen apparaten.
3. **Checkout voert geen bestelling of betaling uit.** Mollie moet server-side worden gestart en via een geverifieerde webhook worden bevestigd. Een Mollie-geheime sleutel mag nooit in HTML of browser-JavaScript staan.
4. **PocketBase is nog niet gekoppeld.** Producten, voorraad, klanten en orders hebben nog geen productie-database.
5. **Formulieren versturen niets.** Het contactformulier en de checkout tonen alleen prototypegedrag.
6. **Tijdelijke productgegevens en beelden.** Prijzen, levering, teksten, productbeelden, allergenen en voedingsinformatie moeten worden geverifieerd.
7. **Juridische basis ontbreekt of is niet afgerond.** Nodig zijn onder andere bedrijfsgegevens, privacyverklaring, algemene voorwaarden, verzend- en retourbeleid en regels voor voedingsmiddelen/allergenen.
8. **Google Fonts wordt extern geladen.** Controleer de privacykeuze; lokaal hosten is een eenvoudige optie als dat juridisch of qua snelheid gewenst is.
9. **Geen productie-observatie.** Foutregistratie, uptimecontrole, analytics en back-ups moeten nog worden gekozen.

## Environment variables voor later

Wanneer Mollie en PocketBase worden gebouwd, komen geheimen uitsluitend in Vercel onder **Project → Settings → Environment Variables**, bijvoorbeeld:

```text
MOLLIE_API_KEY
MOLLIE_WEBHOOK_SECRET
POCKETBASE_URL
POCKETBASE_ADMIN_EMAIL
POCKETBASE_ADMIN_PASSWORD
```

De precieze namen worden door de implementatie bepaald. Maak voor Preview en Production bij voorkeur aparte Mollie-sleutels en aparte dataomgevingen. Zet echte geheimen nooit in `.env.example`, GitHub, HTML of client-side JavaScript.

## Aanbevolen eerstvolgende beslissing

Geef Agent URL toestemming voor alleen **Fase A t/m C als besloten preview**. Dan wordt eerst de GitHub-login hersteld, vervolgens een privé repository gemaakt en daarna een Vercel-preview opgebouwd. Publiceer pas onder het echte domein nadat de lijst met productiepunten is afgewerkt.
