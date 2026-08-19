import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { WeightPicker } from '@/components/catalog/WeightPicker';
import styles from '@/components/catalog/catalog.module.css';
import { getActiveProducts, getProductBySlug } from '@/lib/catalog/local-adapter';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const products = await getActiveProducts();

  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Kaas niet gevonden' };
  }

  return {
    title: { absolute: product.seo.title },
    description: product.seo.description,
    alternates: { canonical: `/shop/${product.slug}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <section aria-labelledby="product-title" className={styles.productPage}>
      <div className={styles.productLayout}>
        <div className={styles.detailImage}>
          <Image
            alt={product.image.alt}
            height={product.image.height}
            priority
            sizes="(max-width: 46rem) 100vw, 55vw"
            src={product.image.src}
            width={product.image.width}
          />
        </div>
        <div className={styles.productDetails}>
          <p className={styles.eyebrow}>{product.maturation} gerijpt</p>
          <h1 className={styles.productHeading} id="product-title">{product.name}</h1>
          <p className={styles.productDescription}>{product.description}</p>
          <ul aria-label="Smaaknotities" className={styles.tasteList}>
            {product.tasteNotes.map((note) => <li key={note}>{note}</li>)}
          </ul>
          <WeightPicker product={product} />
        </div>
      </div>
    </section>
  );
}
