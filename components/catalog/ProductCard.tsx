import Image from 'next/image';
import Link from 'next/link';

import { formatEuros, priceForWeight } from '@/lib/catalog/money';
import type { Product } from '@/lib/catalog/types';

import styles from './catalog.module.css';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const firstWeight = product.allowedWeightsGrams[0];
  const fromPrice = priceForWeight(product.pricePerKgCents, firstWeight);

  return (
    <article className={styles.productCard}>
      <div className={styles.productImage}>
        <Image
          alt={product.image.alt}
          height={product.image.height}
          sizes="(max-width: 42rem) 100vw, (max-width: 72rem) 50vw, 33vw"
          src={product.image.src}
          width={product.image.width}
        />
      </div>
      <div className={styles.productCopy}>
        <p className={styles.productMaturation}>{product.maturation}</p>
        <h2>{product.name}</h2>
        <p>{product.shortDescription}</p>
        <p className={styles.productPrice}>Vanaf {formatEuros(fromPrice)}</p>
        <p className={styles.weightHint}>
          Stukken van {product.allowedWeightsGrams.map((weight) => `${weight} g`).join(', ')}
        </p>
        <Link aria-label={`Bekijk kaas: ${product.name}`} className={styles.productLink} href={`/shop/${product.slug}`}>
          Bekijk kaas <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
