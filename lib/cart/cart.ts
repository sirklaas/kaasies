import { priceForWeight } from '@/lib/catalog/money';
import { products } from '@/lib/catalog/products';

import type { CartAction, CartLine, CartProduct, CartStateV2, DerivedCart } from './types';

export const CART_STORAGE_KEY = 'kaasies-cart-v2';
export const EMPTY_CART: CartStateV2 = { version: 2, lines: [] };
/** Temporary prototype pricing, pending commerce configuration. */
export const SHIPPING_CENTS = 695;
export const FREE_SHIPPING_THRESHOLD_CENTS = 6000;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 20;

const catalog: readonly CartProduct[] = products;

export function lineId(productId: string, weightGrams: number): string {
  return `${productId}:${weightGrams}`;
}

export function shippingCostForSubtotal(subtotalCents: number): number {
  if (!Number.isInteger(subtotalCents)) {
    throw new TypeError('subtotalCents must be an integer.');
  }
  if (subtotalCents < 0) {
    throw new RangeError('subtotalCents must not be negative.');
  }

  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_CENTS;
}

function validQuantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  const quantity = Math.trunc(value);
  if (quantity < MIN_QUANTITY) {
    return 0;
  }

  return Math.min(quantity, MAX_QUANTITY);
}

function findAvailableProduct(productId: unknown, weightGrams: unknown, catalogToUse: readonly CartProduct[]): CartProduct | null {
  if (typeof productId !== 'string' || typeof weightGrams !== 'number' || !Number.isInteger(weightGrams)) {
    return null;
  }

  const product = catalogToUse.find((candidate) => candidate.id === productId);
  if (!product || !product.active || product.stockGrams < weightGrams || !product.allowedWeightsGrams.includes(weightGrams)) {
    return null;
  }

  return product;
}

export function isAvailableCartVariant(productId: string, weightGrams: number): boolean {
  return findAvailableProduct(productId, weightGrams, catalog) !== null;
}

function normalizeLines(lines: unknown, catalogToUse: readonly CartProduct[] = catalog): CartLine[] {
  if (!Array.isArray(lines)) {
    return [];
  }

  const quantitiesById = new Map<string, CartLine>();

  for (const item of lines) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const { productId, weightGrams, quantity } = item as Partial<CartLine>;
    const product = findAvailableProduct(productId, weightGrams, catalogToUse);
    const normalizedQuantity = validQuantity(quantity);
    if (!product || !normalizedQuantity || typeof weightGrams !== 'number') {
      continue;
    }

    const id = lineId(product.id, weightGrams);
    const current = quantitiesById.get(id);
    quantitiesById.set(id, {
      productId: product.id,
      weightGrams,
      quantity: Math.min((current?.quantity ?? 0) + normalizedQuantity, MAX_QUANTITY),
    });
  }

  return [...quantitiesById.values()];
}

function toState(lines: unknown, catalogToUse: readonly CartProduct[] = catalog): CartStateV2 {
  return { version: 2, lines: normalizeLines(lines, catalogToUse) };
}

export function parseStoredCart(raw: string | null, catalogToUse: readonly CartProduct[] = catalog): CartStateV2 {
  if (!raw) {
    return { ...EMPTY_CART };
  }

  try {
    const stored = JSON.parse(raw) as { version?: unknown; lines?: unknown };
    if (!stored || typeof stored !== 'object') {
      return { ...EMPTY_CART };
    }

    if (stored.version === 1) {
      const v1Lines = Array.isArray(stored.lines)
        ? stored.lines.map((line) => ({
          productId: typeof line === 'object' && line ? (line as { productId?: unknown }).productId : undefined,
          weightGrams: 500,
          quantity: typeof line === 'object' && line ? (line as { quantity?: unknown }).quantity : undefined,
        }))
        : [];
      return toState(v1Lines, catalogToUse);
    }

    return stored.version === 2 ? toState(stored.lines, catalogToUse) : { ...EMPTY_CART };
  } catch {
    return { ...EMPTY_CART };
  }
}

export function cartReducer(state: CartStateV2, action: CartAction): CartStateV2 {
  const current = toState(state.lines);

  switch (action.type) {
    case 'add':
      return toState([...current.lines, action]);
    case 'setQuantity':
      return toState(current.lines.map((line) => (
        lineId(line.productId, line.weightGrams) === action.id ? { ...line, quantity: action.quantity } : line
      )));
    case 'remove':
      return toState(current.lines.filter((line) => lineId(line.productId, line.weightGrams) !== action.id));
    case 'replace':
      return toState(action.state.lines);
  }
}

export function deriveCart(state: CartStateV2, catalogToUse: readonly CartProduct[] = catalog): DerivedCart {
  const lines = normalizeLines(state.lines, catalogToUse).flatMap((line) => {
    const product = findAvailableProduct(line.productId, line.weightGrams, catalogToUse);
    if (!product) {
      return [];
    }

    const priceCents = priceForWeight(product.pricePerKgCents, line.weightGrams);
    return [{
      ...line,
      id: lineId(line.productId, line.weightGrams),
      name: product.name,
      priceCents,
      lineTotalCents: priceCents * line.quantity,
    }];
  });

  const subtotalCents = lines.reduce((total, line) => total + line.lineTotalCents, 0);
  const shippingCents = shippingCostForSubtotal(subtotalCents);

  return { lines, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}
