'use client';

import Link from 'next/link';

import { formatEuros } from '@/lib/catalog/money';

import { useCart } from './CartProvider';
import styles from './cart.module.css';

export function CartView() {
  const { cart, remove, setQuantity } = useCart();

  if (!cart.lines.length) {
    return (
      <section aria-labelledby="cart-title" className={styles.cartPage}>
        <h1 id="cart-title">Jouw mandje</h1>
        <p className={styles.emptyState}>Je mandje is leeg. Kies een kaas die bij je past.</p>
        <Link className={styles.shopLink} href="/shop">Bekijk onze kazen</Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="cart-title" className={styles.cartPage}>
      <h1 id="cart-title">Jouw mandje</h1>
      <ul className={styles.cartLines}>
        {cart.lines.map((line) => (
          <li className={styles.cartLine} key={line.id}>
            <div className={styles.lineCopy}>
              <h2>{line.name}</h2>
              <p>{line.weightGrams} gram · {formatEuros(line.priceCents)} per stuk</p>
            </div>
            <label className={styles.quantityLabel}>
              <span>Aantal</span>
              <input
                aria-label={`Aantal ${line.name} van ${line.weightGrams} gram`}
                max={16}
                min={1}
                onChange={(event) => setQuantity(line.id, Number(event.target.value))}
                type="number"
                value={line.quantity}
              />
            </label>
            <p className={styles.lineTotal}>{formatEuros(line.lineTotalCents)}</p>
            <button className={styles.removeButton} onClick={() => remove(line.id)} type="button">Verwijder</button>
          </li>
        ))}
      </ul>
      <dl className={styles.summary}>
        <div><dt>Subtotaal</dt><dd>{formatEuros(cart.subtotalCents)}</dd></div>
        <div><dt>Verzendkosten</dt><dd>{cart.shippingCents ? formatEuros(cart.shippingCents) : 'Gratis'}</dd></div>
        <div><dt>Totaal</dt><dd>{formatEuros(cart.totalCents)}</dd></div>
      </dl>
      <p className={styles.shippingNote}>Gratis verzending vanaf €&nbsp;50,00.</p>
      <Link className={styles.checkoutLink} href="/checkout">Naar afrekenen</Link>
    </section>
  );
}
