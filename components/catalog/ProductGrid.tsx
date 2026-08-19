import type { Product } from '@/lib/catalog/types';

import { ProductCard } from './ProductCard';
import styles from './catalog.module.css';

type ProductGridProps = {
  products: readonly Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className={styles.productGrid}>
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
