import Link from 'next/link';
import type { Metadata } from 'next';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CampaignHero } from '@/components/campaign/CampaignHero';
import { getActiveProducts } from '@/lib/catalog/local-adapter';
import { getActiveCampaign } from '@/lib/content/local-adapter';

import styles from '@/components/catalog/catalog.module.css';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [campaign, products] = await Promise.all([getActiveCampaign(), getActiveProducts()]);

  return (
    <>
      {/* De campagne-illustratie levert redactioneel commentaar; de kaarten eronder bewijzen de kaas met fotografie. */}
      <CampaignHero campaign={campaign} />
      <section aria-labelledby="home-cheeses-title" className={styles.catalogSection}>
        <p className={styles.sectionKicker}>Drie tempo’s, één kaasdorp</p>
        <h2 className={styles.sectionHeading} id="home-cheeses-title">Kies je rijping.</h2>
        <p className={styles.sectionIntro}>Van fris en soepel tot pikant met kristalletjes. Alle drie komen uit Stompetoren.</p>
        <ProductGrid products={products} />
        <Link className={styles.shopCta} href="/shop">Bekijk alle kazen <span aria-hidden="true">→</span></Link>
      </section>
      <aside aria-labelledby="manifest-teaser-title" className={styles.manifestTeaser}>
        <div>
          <p className={styles.sectionKicker}>Ons manifest</p>
          <h2 id="manifest-teaser-title">Echte kaas neemt de tijd.</h2>
          <p>Geen palmolie, geen haast en geen verhalen zonder bewijs. Alleen melk, geduld en mensen die hun vak verstaan.</p>
        </div>
        <Link className={styles.manifestLink} href="/manifest">Waarom wij moeilijk doen <span aria-hidden="true">→</span></Link>
      </aside>
    </>
  );
}
