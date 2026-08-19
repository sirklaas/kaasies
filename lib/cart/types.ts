export type CartLine = {
  productId: string;
  weightGrams: number;
  quantity: number;
};

export type CartStateV2 = {
  version: 2;
  lines: CartLine[];
};

export type CartAction =
  | { type: 'add'; productId: string; weightGrams: number; quantity: number }
  | { type: 'setQuantity'; id: string; quantity: number }
  | { type: 'remove'; id: string }
  | { type: 'replace'; state: CartStateV2 };

export type CartProduct = {
  id: string;
  name: string;
  pricePerKgCents: number;
  stockGrams: number;
  allowedWeightsGrams: readonly number[];
  active: boolean;
};

export type CartLineDetails = CartLine & {
  id: string;
  name: string;
  priceCents: number;
  lineTotalCents: number;
};

export type DerivedCart = {
  lines: CartLineDetails[];
  subtotalCents: number;
};
