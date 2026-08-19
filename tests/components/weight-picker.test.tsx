import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WeightPicker } from '@/components/catalog/WeightPicker';

const productFixture = {
  id: 'test-oud',
  name: 'De Oude Oproerkraaier',
  pricePerKgCents: 2495,
  allowedWeightsGrams: [250, 500, 750, 1000] as const,
};

describe('WeightPicker', () => {
  it('offers only permitted weights, defaults to 500 gram and recalculates the visible price', () => {
    render(<WeightPicker product={productFixture} />);

    expect(screen.getAllByRole('radio')).toHaveLength(productFixture.allowedWeightsGrams.length);
    expect(screen.getByRole('radio', { name: /500 gram/i })).toBeChecked();

    fireEvent.click(screen.getByRole('radio', { name: /750 gram/i }));

    expect(screen.getByRole('status').textContent).toBe('€\u00a018,71');
  });
});
