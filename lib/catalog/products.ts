import type { Product } from './types';

/**
 * Temporary local pre-commerce seeds. Prices come from the archived visual
 * prototype's ca. 500 g product cards: Jong €8,95, Belegen €10,95 and Oud
 * €12,95. The equivalent per-kilo prices, inventory and selling weights must
 * be verified with the supplier before commerce is enabled.
 */
export const products = [
  {
    id: 'stompetoren-jong',
    slug: 'jong',
    name: 'De Jonge Dwarsligger',
    shortDescription: 'Zacht, soepel en fris van karakter.',
    description:
      'Jong krijgt circa vier weken de tijd om zacht, soepel en haast smeltend op de tong te worden.',
    maturation: 'Circa 4 weken',
    tasteNotes: ['zacht', 'soepel', 'fris'],
    pricePerKgCents: 1790,
    stockGrams: 5000,
    allowedWeightsGrams: [250, 500, 750, 1000],
    image: {
      src: '/images/products/jong.jpg',
      alt: 'Stompetoren Jong, De Jonge Dwarsligger',
      width: 956,
      height: 647,
    },
    active: true,
    seo: {
      title: 'Stompetoren Jong | De Jonge Dwarsligger — Kaasies’',
      description: 'Stompetoren Jong, circa vier weken gerijpt: zacht, soepel en fris van karakter.',
    },
  },
  {
    id: 'stompetoren-belegen',
    slug: 'belegen',
    name: 'De Ronde Rakker',
    shortDescription: 'Vol van smaak en heerlijk smeuïg.',
    description:
      'Belegen rijpt drie tot vier maanden en komt vol van smaak en smeuïg voor de dag.',
    maturation: '3–4 maanden',
    tasteNotes: ['vol', 'smeuïg', 'rond'],
    pricePerKgCents: 2190,
    stockGrams: 5000,
    allowedWeightsGrams: [250, 500, 750, 1000],
    image: {
      src: '/images/products/belegen.jpg',
      alt: 'Stompetoren Belegen, De Ronde Rakker',
      width: 956,
      height: 647,
    },
    active: true,
    seo: {
      title: 'Stompetoren Belegen | De Ronde Rakker — Kaasies’',
      description: 'Stompetoren Belegen, drie tot vier maanden gerijpt: vol van smaak en smeuïg.',
    },
  },
  {
    id: 'stompetoren-oud',
    slug: 'oud',
    name: 'De Oude Oproerkraaier',
    shortDescription: 'Vol, pikant en met witte kristalletjes.',
    description:
      'Oud rijpt circa tien tot twaalf maanden en blijft snijdbaar met een volle, pikante smaak.',
    maturation: '10–12 maanden',
    tasteNotes: ['vol', 'pikant', 'kristallijn'],
    pricePerKgCents: 2590,
    stockGrams: 5000,
    allowedWeightsGrams: [250, 500, 750, 1000],
    image: {
      src: '/images/products/oud.jpg',
      alt: 'Stompetoren Oud, De Oude Oproerkraaier',
      width: 956,
      height: 647,
    },
    active: true,
    seo: {
      title: 'Stompetoren Oud | De Oude Oproerkraaier — Kaasies’',
      description: 'Stompetoren Oud, tien tot twaalf maanden gerijpt: vol, pikant en snijdbaar.',
    },
  },
] satisfies readonly Product[];

function assertCatalog(productsToValidate: readonly Product[]): void {
  const slugs = new Set<string>();

  for (const product of productsToValidate) {
    if (!Number.isInteger(product.pricePerKgCents) || !Number.isInteger(product.stockGrams)) {
      throw new TypeError(`Product ${product.slug} must use integer cents and grams.`);
    }

    if (product.pricePerKgCents < 0 || product.stockGrams < 0) {
      throw new RangeError(`Product ${product.slug} cannot have negative price or stock.`);
    }

    if (slugs.has(product.slug)) {
      throw new Error(`Duplicate catalog slug: ${product.slug}.`);
    }
    slugs.add(product.slug);

    if (!product.seo.title.trim() || !product.seo.description.trim()) {
      throw new Error(`Product ${product.slug} must include SEO metadata.`);
    }

    for (const weightGrams of product.allowedWeightsGrams) {
      if (!Number.isInteger(weightGrams) || weightGrams <= 0 || weightGrams > product.stockGrams) {
        throw new RangeError(`Product ${product.slug} has an invalid allowed weight.`);
      }
    }
  }
}

assertCatalog(products);
