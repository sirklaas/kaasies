import type { Campaign } from './types';

export const campaigns = [
  {
    slug: 'geef-kaas-haar-tijd-terug',
    status: 'active',
    publishedAt: '2026-08-19',
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
