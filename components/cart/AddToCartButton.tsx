'use client';

import { useState } from 'react';

import { isAvailableCartVariant } from '@/lib/cart/cart';

import { useCart } from './CartProvider';
import styles from './cart.module.css';

type AddToCartProduct = {
  id: string;
  name: string;
  allowedWeightsGrams: readonly number[];
};

type AddToCartButtonProps = {
  product: AddToCartProduct;
  weightGrams: number;
};

export function AddToCartButton({ product, weightGrams }: AddToCartButtonProps) {
  const { add } = useCart();
  const [announcement, setAnnouncement] = useState('');
  const permitted = product.allowedWeightsGrams.includes(weightGrams) && isAvailableCartVariant(product.id, weightGrams);

  function handleAdd(): void {
    if (!permitted) {
      setAnnouncement('Dit gewicht is niet beschikbaar. Kies een van de getoonde gewichten.');
      return;
    }

    add(product.id, weightGrams);
    setAnnouncement(`${product.name} van ${weightGrams} gram is toegevoegd aan je mandje.`);
  }

  return (
    <div className={styles.addToCart}>
      <button className={styles.addButton} disabled={!permitted} onClick={handleAdd} type="button">
        In mijn mandje
      </button>
      {announcement ? <p aria-live="polite" className={styles.status} role="status">{announcement}</p> : null}
    </div>
  );
}
