import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartView } from '@/components/cart/CartView';

const product = {
  id: 'stompetoren-oud',
  name: 'De Oude Oproerkraaier',
  allowedWeightsGrams: [1000] as const,
};

describe('cart components', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('announces that the selected permitted variant was added and persists only v2 state', () => {
    render(
      <CartProvider>
        <AddToCartButton product={product} weightGrams={1000} />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /in mijn mandje/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/1000 gram.*toegevoegd/i);
    expect(JSON.parse(window.localStorage.getItem('kaasies-cart-v2') ?? '')).toEqual({
      version: 2,
      lines: [{ productId: 'stompetoren-oud', weightGrams: 1000, quantity: 1 }],
    });
  });

  it('shows an empty cart safely before a shopper adds a product', () => {
    render(
      <CartProvider>
        <CartView />
      </CartProvider>,
    );

    expect(screen.getByText(/je mandje is leeg/i)).toBeInTheDocument();
  });

  it('disables a weight that is not available in the current catalog', () => {
    render(
      <CartProvider>
        <AddToCartButton product={{ ...product, allowedWeightsGrams: [600] }} weightGrams={600} />
      </CartProvider>,
    );

    expect(screen.getByRole('button', { name: /in mijn mandje/i })).toBeDisabled();
  });

  it('renders catalog-derived line values and a checkout link', () => {
    render(
      <CartProvider>
        <AddToCartButton product={product} weightGrams={1000} />
        <CartView />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /in mijn mandje/i }));

    expect(screen.getByText('Stompetoren Oud')).toBeInTheDocument();
    expect(screen.getAllByText('€\u00a018,50', { normalizer: (value) => value })).toHaveLength(2);
    expect(screen.getByText('€\u00a06,95', { normalizer: (value) => value })).toBeInTheDocument();
    expect(screen.getByText('Gratis verzending vanaf €\u00a050,00.', { normalizer: (value) => value })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /naar afrekenen/i })).toHaveAttribute('href', '/checkout');
  });
});
