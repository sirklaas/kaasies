import { describe, expect, it } from 'vitest';

import {
  cartReducer,
  deriveCart,
  FREE_SHIPPING_THRESHOLD_CENTS,
  lineId,
  parseStoredCart,
  SHIPPING_CENTS,
  shippingCostForSubtotal,
} from '@/lib/cart/cart';

describe('cart storage and rules', () => {
  it('identifies a product variant by product and selected weight', () => {
    expect(lineId('oud', 750)).toBe('oud:750');
  });

  it('falls back to an empty v2 cart when stored JSON is damaged', () => {
    expect(parseStoredCart('{broken')).toEqual({ version: 2, lines: [] });
  });

  it('migrates valid v1 lines to the only available one-kilogram variant', () => {
    expect(parseStoredCart(JSON.stringify({ version: 1, lines: [{ productId: 'stompetoren-jong', quantity: 2 }] })))
      .toEqual({
        version: 2,
        lines: [{ productId: 'stompetoren-jong', weightGrams: 1000, quantity: 2 }],
      });
  });

  it('rejects unavailable variants and ignores a persisted total', () => {
    expect(parseStoredCart(JSON.stringify({
      version: 2,
      totalCents: 1,
      lines: [
        { productId: 'stompetoren-jong', weightGrams: 600, quantity: 2 },
        { productId: 'not-in-the-catalog', weightGrams: 500, quantity: 2 },
      ],
    }))).toEqual({ version: 2, lines: [] });
  });

  it('merges equal variants without selling more than the sixteen-kilogram stock', () => {
    const state = cartReducer(
      { version: 2, lines: [{ productId: 'stompetoren-oud', weightGrams: 1000, quantity: 19 }] },
      { type: 'add', productId: 'stompetoren-oud', weightGrams: 1000, quantity: 4 },
    );

    expect(state).toEqual({
      version: 2,
      lines: [{ productId: 'stompetoren-oud', weightGrams: 1000, quantity: 16 }],
    });
  });

  it('removes a line when its requested quantity is zero', () => {
    expect(cartReducer(
      { version: 2, lines: [{ productId: 'stompetoren-oud', weightGrams: 1000, quantity: 2 }] },
      { type: 'setQuantity', id: 'stompetoren-oud:1000', quantity: 0 },
    )).toEqual({ version: 2, lines: [] });
  });

  it('derives current prices from the catalog instead of persisted totals', () => {
    const cart = deriveCart({
      version: 2,
      lines: [{ productId: 'stompetoren-oud', weightGrams: 1000, quantity: 2 }],
    });

    expect(cart.lines[0]).toMatchObject({
      id: 'stompetoren-oud:1000',
      priceCents: 1850,
      lineTotalCents: 3700,
    });
    expect(cart.subtotalCents).toBe(3700);
    expect(cart.shippingCents).toBe(695);
    expect(cart.totalCents).toBe(4395);
  });

  it('charges the prototype shipping price below the free-shipping threshold', () => {
    expect(SHIPPING_CENTS).toBe(695);
    expect(FREE_SHIPPING_THRESHOLD_CENTS).toBe(5000);
    expect(shippingCostForSubtotal(4999)).toBe(695);
  });

  it('makes prototype shipping free at and above the threshold', () => {
    expect(shippingCostForSubtotal(5000)).toBe(0);
    expect(shippingCostForSubtotal(8123)).toBe(0);
  });
});
