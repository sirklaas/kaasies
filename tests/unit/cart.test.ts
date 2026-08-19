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

  it('migrates valid v1 lines to the 500 gram variant', () => {
    expect(parseStoredCart(JSON.stringify({ version: 1, lines: [{ productId: 'stompetoren-jong', quantity: 2 }] })))
      .toEqual({
        version: 2,
        lines: [{ productId: 'stompetoren-jong', weightGrams: 500, quantity: 2 }],
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

  it('merges equal variants and keeps the total quantity within the 1–20 range', () => {
    const state = cartReducer(
      { version: 2, lines: [{ productId: 'stompetoren-oud', weightGrams: 750, quantity: 19 }] },
      { type: 'add', productId: 'stompetoren-oud', weightGrams: 750, quantity: 4 },
    );

    expect(state).toEqual({
      version: 2,
      lines: [{ productId: 'stompetoren-oud', weightGrams: 750, quantity: 20 }],
    });
  });

  it('removes a line when its requested quantity is zero', () => {
    expect(cartReducer(
      { version: 2, lines: [{ productId: 'stompetoren-oud', weightGrams: 750, quantity: 2 }] },
      { type: 'setQuantity', id: 'stompetoren-oud:750', quantity: 0 },
    )).toEqual({ version: 2, lines: [] });
  });

  it('derives current prices from the catalog instead of persisted totals', () => {
    const cart = deriveCart({
      version: 2,
      lines: [{ productId: 'stompetoren-oud', weightGrams: 750, quantity: 2 }],
    });

    expect(cart.lines[0]).toMatchObject({
      id: 'stompetoren-oud:750',
      priceCents: 1943,
      lineTotalCents: 3886,
    });
    expect(cart.subtotalCents).toBe(3886);
    expect(cart.shippingCents).toBe(695);
    expect(cart.totalCents).toBe(4581);
  });

  it('charges the prototype shipping price below the free-shipping threshold', () => {
    expect(SHIPPING_CENTS).toBe(695);
    expect(FREE_SHIPPING_THRESHOLD_CENTS).toBe(6000);
    expect(shippingCostForSubtotal(5999)).toBe(695);
  });

  it('makes prototype shipping free at and above the threshold', () => {
    expect(shippingCostForSubtotal(6000)).toBe(0);
    expect(shippingCostForSubtotal(8123)).toBe(0);
  });
});
