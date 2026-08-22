import type { Campaign } from './types';

export const campaigns = [
  {
    slug: 'soms-is-kaas-geen-kaas',
    status: 'active',
    publishedAt: '2026-08-22',
    kicker: 'De E-fabriek',
    title: 'Soms is kaas helemaal geen kaas.',
    intro: 'Ik kwam er laatst achter dat kaas soms helemaal geen kaas is. Maar gewoon een chemisch zootje.',
    heroBody: [
      'Palmolie. Kleurstoffen. Smaakstoffen. Conserveringsmiddelen.',
      'De hele E-fabriek zit erin.',
      'Dat kan niet. Dat mag niet. Daarom kaasies.com.',
    ],
    payoff: 'Echt alleen echte kaas. Dat is Kaasies',
    body: [
      'Palmolie. Kleurstoffen. Smaakstoffen. Conserveringsmiddelen. De hele E-fabriek zit erin.',
      'Dat kan niet. Dat mag niet. Daarom kaasies.com.',
      'Echt alleen echte kaas. Dat is Kaasies',
    ],
    cta: { label: 'Bekijk echte kaas →', href: '/shop' },
    image: {
      src: '/illustrations/e-fabriek-v1.jpg',
      alt: 'Een grafische kaas die vanbinnen een chemische fabriek met leidingen, vaten en laboratoriumflessen blijkt te zijn.',
      width: 1536,
      height: 1024,
    },
    seo: {
      title: 'Soms is kaas helemaal geen kaas',
      description: 'Palmolie en een E-fabriek zijn geen kaas. Kaasies kiest echt alleen echte kaas.',
    },
  },
  {
    slug: 'geef-kaas-haar-tijd-terug',
    status: 'archived',
    publishedAt: '2026-08-19',
    kicker: 'Geen nepkaas',
    title: 'Rijpen kun je niet haasten.',
    intro: 'Smaak houdt zich niet aan kwartaalcijfers. Geef melk, culturen en vakmanschap de tijd.',
    body: [
      'Tijd is geen vertraging. Het is een ingrediënt.',
      'Wij kiezen kaas die mag rijpen. Zodat je iets proeft dat niet haastig is gemaakt.',
    ],
    cta: { label: 'Proef wat tijd doet →', href: '/shop' },
    image: {
      src: '/illustrations/time-is-an-ingredient-v1.png',
      alt: 'Een grafisch geel klokje met een kaaswiel in plaats van een kaart.',
      width: 1536,
      height: 1024,
    },
    seo: {
      title: 'Geef kaas haar tijd terug',
      description: 'Tijd is een ingrediënt. Lees waarom Kaasies’ kiest voor kaas die mag rijpen.',
    },
  },
  {
    slug: 'breekbaar-is-een-compliment',
    status: 'archived',
    publishedAt: '2026-08-12',
    kicker: 'Kaas met karakter',
    title: 'Breekbaar is een compliment.',
    intro: 'Een kaas die brokkelt hoeft zich niet te verontschuldigen.',
    body: [
      'Kaas met karakter blijft niet braaf in vorm. Hij breekt, kraakt en vraagt om een scherp mes.',
      'Geen keurige blokjes om naar te kijken. Wel een stuk waar je nog een plak van wilt snijden.',
    ],
    cta: { label: 'Snijd echte kaas →', href: '/shop' },
    image: {
      src: '/images/products/oud.jpg',
      alt: 'Een stuk oude Stompetoren-kaas met een ruwe, brokkelige snijrand.',
      width: 956,
      height: 647,
    },
    seo: {
      title: 'Breekbaar is een compliment',
      description: 'Waarom een brokkelige kaas juist iets te vertellen heeft.',
    },
  },
  {
    slug: 'lees-de-achterkant',
    status: 'draft',
    publishedAt: '2026-08-26',
    kicker: 'Lees wat je eet',
    title: 'Draai ’m eens om.',
    intro: 'Een voorkant kan alles roepen. De achterkant moet vertellen wat erin zit.',
    body: ['Lees. Vraag. Proef. Kies bewust.'],
    cta: { label: 'Leer kaas lezen →', href: '/verhalen' },
    image: {
      src: '/illustrations/time-is-an-ingredient-v1.png',
      alt: 'Een grafische illustratie voor een nog niet gepubliceerd kaasverhaal.',
      width: 1536,
      height: 1024,
    },
    seo: {
      title: 'Lees de achterkant',
      description: 'Een conceptverhaal over kaasetiketten.',
    },
  },
] satisfies readonly Campaign[];
