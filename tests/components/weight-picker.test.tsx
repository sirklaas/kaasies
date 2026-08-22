import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CartProvider } from '@/components/cart/CartProvider';
import { WeightPicker } from '@/components/catalog/WeightPicker';

const productFixture = {
  id: 'test-oud',
  name: 'De Oude Oproerkraaier',
  pricePerKgCents: 2495,
  allowedWeightsGrams: [1000] as const,
};

describe('WeightPicker', () => {
  it('offers only a one-kilogram piece and shows its kilogram price', () => {
    render(
      <CartProvider>
        <WeightPicker product={productFixture} />
      </CartProvider>,
    );

    expect(screen.getAllByRole('radio')).toHaveLength(1);
    expect(screen.getByRole('radio', { name: /1000 gram/i })).toBeChecked();
    expect(screen.getByRole('status').textContent).toBe('€\u00a024,95');
  });
});
