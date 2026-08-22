import { describe, expect, it } from 'vitest';
import { getActiveProducts, getProductBySlug } from '@/lib/catalog/local-adapter';
import { formatEuros, priceForWeight } from '@/lib/catalog/money';

describe('catalog money rules', () => {
  it('calculates a 750 gram price from integer eurocents per kilogram', () => {
    expect(priceForWeight(2495, 750)).toBe(1871);
  });

  it('formats eurocents as a Dutch euro amount', () => {
    expect(formatEuros(1871)).toBe('€\u00a018,71');
  });
});

describe('local catalog adapter', () => {
  it('returns the complete sixteen-cheese Stompetoren starter range', async () => {
    const products = await getActiveProducts();

    expect(products).toHaveLength(16);
    expect(products.map((product) => product.slug)).toEqual([
      'jong', 'jong-belegen', 'belegen', 'extra-belegen', 'oud', 'grand-cru',
      'komijn-jong', 'komijn-jong-belegen', 'komijn-belegen', 'komijn-oud',
      '35-plus-jong-belegen', '35-plus-belegen', '35-plus-extra-belegen',
      '35-plus-oud', '35-plus-kruiden', 'minder-zout',
    ]);
    expect(products.every((product) => product.stockGrams === 16_000)).toBe(true);
    expect(products.every((product) => product.allowedWeightsGrams.length === 1)).toBe(true);
    expect(products.every((product) => product.allowedWeightsGrams[0] === 1000)).toBe(true);
    expect(products.every((product) => product.image.src.startsWith('/images/products/stompetoren/'))).toBe(true);
    expect(new Set(products.map((product) => product.image.src)).size).toBe(12);
  });

  it('exposes Grand Cru as its own product rather than treating it as Oud', async () => {
    expect((await getProductBySlug('grand-cru'))?.id).toBe('stompetoren-grand-cru');
    expect((await getProductBySlug('oud'))?.id).toBe('stompetoren-oud');
  });
});
