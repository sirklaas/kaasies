'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

import { CART_STORAGE_KEY, cartReducer, deriveCart, EMPTY_CART, lineId, parseStoredCart } from '@/lib/cart/cart';
import type { DerivedCart } from '@/lib/cart/types';

type CartContextValue = {
  cart: DerivedCart;
  hydrated: boolean;
  add: (productId: string, weightGrams: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const subscribeToHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const hydrated = useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydratedSnapshot);
  const skipFirstPersist = useRef(true);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      dispatch({ type: 'replace', state: parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)) });
    } catch {
      dispatch({ type: 'replace', state: EMPTY_CART });
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in private or locked-down browser sessions.
    }
  }, [hydrated, state]);

  const value = useMemo<CartContextValue>(() => ({
    cart: deriveCart(state),
    hydrated,
    add: (productId, weightGrams) => dispatch({ type: 'add', productId, weightGrams, quantity: 1 }),
    remove: (id) => dispatch({ type: 'remove', id }),
    setQuantity: (id, quantity) => dispatch({ type: 'setQuantity', id, quantity }),
  }), [hydrated, state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const cart = useContext(CartContext);
  if (!cart) {
    throw new Error('useCart must be used within CartProvider.');
  }
  return cart;
}

export { lineId };
