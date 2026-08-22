import type { Product } from './types';

const STOCK_GRAMS = 16_000;
const SELLING_WEIGHTS = [1000] as const;

type Seed = { slug: string; label: string; maturation: string; notes: readonly [string, string, string]; pricePerKgCents: number; image: string };

function product(seed: Seed): Product {
  const character = seed.notes.join(', ');
  return {
    id: `stompetoren-${seed.slug}`,
    slug: seed.slug,
    name: `Stompetoren ${seed.label}`,
    shortDescription: `${seed.notes[0]}, ${seed.notes[1]} en ${seed.notes[2]}.`,
    description: `${seed.label} krijgt bij Stompetoren rustig de tijd. Het resultaat is echte Noord-Hollandse kaas: ${character}, zonder onnodige omwegen.`,
    maturation: seed.maturation,
    tasteNotes: seed.notes,
    pricePerKgCents: seed.pricePerKgCents,
    stockGrams: STOCK_GRAMS,
    allowedWeightsGrams: SELLING_WEIGHTS,
    image: { src: `/images/products/stompetoren/${seed.image}.jpg`, alt: `Stompetoren ${seed.label}`, width: 800, height: 1000 },
    active: true,
    seo: {
      title: `Stompetoren ${seed.label} per kilo kopen — Kaasies’`,
      description: `Bestel Stompetoren ${seed.label} per kilo bij Kaasies’: ${character}.`,
    },
  };
}

/**
 * Startassortiment, augustus 2026. Iedere voorraadregel staat voor één kaas
 * van 16 kg; aan klanten verkopen we uitsluitend stukken van 1 kg.
 * Verifieerbare 1 kg-prijzen van Kaaswinkel.nl zijn overgenomen. Voor overige
 * specialiteiten geldt tijdelijk € 19,95/kg tot leveranciersbevestiging.
 */
export const products = [
  product({ slug: 'jong', label: 'Jong', maturation: 'Circa 4 weken', notes: ['zacht', 'soepel', 'fris'], pricePerKgCents: 1650, image: 'jong' }),
  product({ slug: 'jong-belegen', label: 'Jong Belegen', maturation: 'Circa 2 maanden', notes: ['romig', 'zacht', 'smeuïg'], pricePerKgCents: 1700, image: 'jong-belegen' }),
  product({ slug: 'belegen', label: 'Belegen', maturation: '3–4 maanden', notes: ['vol', 'smeuïg', 'rond'], pricePerKgCents: 1750, image: 'belegen' }),
  product({ slug: 'extra-belegen', label: 'Extra Belegen', maturation: '7–8 maanden', notes: ['pikant', 'romig', 'krachtig'], pricePerKgCents: 1790, image: 'extra-belegen' }),
  product({ slug: 'oud', label: 'Oud', maturation: '10–12 maanden', notes: ['vol', 'pikant', 'kristallijn'], pricePerKgCents: 1850, image: 'oud' }),
  product({ slug: 'grand-cru', label: 'Grand Cru', maturation: 'Circa 18 maanden', notes: ['intens', 'snijdbaar', 'kristallijn'], pricePerKgCents: 2390, image: 'grand-cru' }),
  product({ slug: 'komijn-jong', label: 'Komijn Jong', maturation: 'Jong', notes: ['mild', 'romig', 'nootachtig'], pricePerKgCents: 1525, image: 'komijn-jong' }),
  product({ slug: 'komijn-jong-belegen', label: 'Komijn Jong Belegen', maturation: 'Jong belegen', notes: ['zacht', 'kruidig', 'nootachtig'], pricePerKgCents: 1575, image: 'komijn-jong-belegen' }),
  product({ slug: 'komijn-belegen', label: 'Komijn Belegen', maturation: 'Belegen', notes: ['vol', 'kruidig', 'romig'], pricePerKgCents: 1650, image: 'komijn-jong-belegen' }),
  product({ slug: 'komijn-oud', label: 'Komijn Oud', maturation: 'Oud', notes: ['pikant', 'kruidig', 'krachtig'], pricePerKgCents: 1725, image: 'komijn-oud' }),
  product({ slug: '35-plus-jong-belegen', label: '35+ Jong Belegen', maturation: 'Circa 2 maanden', notes: ['licht', 'romig', 'soepel'], pricePerKgCents: 1995, image: '35-plus' }),
  product({ slug: '35-plus-belegen', label: '35+ Belegen', maturation: '3–4 maanden', notes: ['rond', 'smeuïg', 'lichtzoet'], pricePerKgCents: 1700, image: '35-plus' }),
  product({ slug: '35-plus-extra-belegen', label: '35+ Extra Belegen', maturation: '7–8 maanden', notes: ['pikant', 'smeuïg', 'lichtzoet'], pricePerKgCents: 1750, image: '35-plus' }),
  product({ slug: '35-plus-oud', label: '35+ Oud', maturation: 'Circa 12 maanden', notes: ['zoetpikant', 'krachtig', 'kristallijn'], pricePerKgCents: 1995, image: '35-plus-oud' }),
  product({ slug: '35-plus-kruiden', label: '35+ Kruiden', maturation: 'Circa 2 maanden', notes: ['kruidig', 'vol', 'smeuïg'], pricePerKgCents: 1995, image: '35-plus-kruiden' }),
  product({ slug: 'minder-zout', label: 'Minder Zout', maturation: 'Circa 2 maanden', notes: ['romig', 'zacht', 'bewust'], pricePerKgCents: 1995, image: '35-plus' }),
] satisfies readonly Product[];

function assertCatalog(productsToValidate: readonly Product[]): void {
  const slugs = new Set<string>();
  for (const item of productsToValidate) {
    if (!Number.isInteger(item.pricePerKgCents) || !Number.isInteger(item.stockGrams)) throw new TypeError(`Product ${item.slug} must use integer cents and grams.`);
    if (item.pricePerKgCents < 0 || item.stockGrams < 0) throw new RangeError(`Product ${item.slug} cannot have negative price or stock.`);
    if (slugs.has(item.slug)) throw new Error(`Duplicate catalog slug: ${item.slug}.`);
    slugs.add(item.slug);
    if (!item.seo.title.trim() || !item.seo.description.trim()) throw new Error(`Product ${item.slug} must include SEO metadata.`);
    for (const weightGrams of item.allowedWeightsGrams) {
      if (!Number.isInteger(weightGrams) || weightGrams <= 0 || weightGrams > item.stockGrams) throw new RangeError(`Product ${item.slug} has an invalid allowed weight.`);
    }
  }
}

assertCatalog(products);
