'use client';

import { useState } from 'react';

import { formatEuros, priceForWeight } from '@/lib/catalog/money';
import type { Product } from '@/lib/catalog/types';

import styles from './catalog.module.css';

type WeightPickerProduct = Pick<Product, 'id' | 'name' | 'pricePerKgCents' | 'allowedWeightsGrams'>;

type WeightPickerProps = {
  product: WeightPickerProduct;
};

function defaultWeight(allowedWeightsGrams: readonly number[]): number {
  return allowedWeightsGrams.includes(500) ? 500 : allowedWeightsGrams[0];
}

export function WeightPicker({ product }: WeightPickerProps) {
  const [selectedWeightGrams, setSelectedWeightGrams] = useState(() => defaultWeight(product.allowedWeightsGrams));
  const selectedPrice = priceForWeight(product.pricePerKgCents, selectedWeightGrams);

  return (
    <fieldset className={styles.weightPicker}>
      <legend>Kies gewicht</legend>
      <div className={styles.weightOptions}>
        {product.allowedWeightsGrams.map((weightGrams) => (
          <label className={styles.weightOption} key={weightGrams}>
            <input
              checked={selectedWeightGrams === weightGrams}
              name={`gewicht-${product.id}`}
              onChange={() => setSelectedWeightGrams(weightGrams)}
              type="radio"
              value={weightGrams}
            />
            <span>{weightGrams} gram</span>
          </label>
        ))}
      </div>
      <output aria-live="polite" className={styles.selectedPrice} key={selectedWeightGrams}>
        {formatEuros(selectedPrice)}
      </output>
    </fieldset>
  );
}
