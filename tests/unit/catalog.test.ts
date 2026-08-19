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
  it('returns the three active cheeses in maturity order', async () => {
    const products = await getActiveProducts();

    expect(products).toHaveLength(3);
    expect(products.map((product) => product.slug)).toEqual(['jong', 'belegen', 'oud']);
  });

  it('does not expose Grand Cru as the Oud product', async () => {
    expect(await getProductBySlug('grand-cru')).toBeNull();
  });
});
