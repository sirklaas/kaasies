import type { Metadata } from 'next';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import styles from '@/components/catalog/catalog.module.css';
import { getActiveProducts } from '@/lib/catalog/local-adapter';

export const metadata: Metadata = {
  title: 'Kazen met karakter',
  description: 'Kies Stompetoren Jong, Belegen of Oud: echte kaas, ruim de tijd gekregen.',
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <section aria-labelledby="shop-title" className={styles.shopPage}>
      <p className={styles.sectionKicker}>Stompetoren, Noord-Holland</p>
      <h1 className={styles.shopHeading} id="shop-title">Kazen met een eigen tempo.</h1>
      <p className={styles.shopIntro}>Eén kaasmakerij, drie rijpingen. Kies een stuk dat bij je trek past.</p>
      <ProductGrid products={products} />
    </section>
  );
}
