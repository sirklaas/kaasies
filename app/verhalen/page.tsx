import Image from 'next/image';
import Link from 'next/link';

import styles from '@/components/campaign/campaign-hero.module.css';
import { getCampaigns } from '@/lib/content/local-adapter';

export const metadata = {
  title: 'Verhalen',
  description: 'Korte verhalen over kaas die tijd, aandacht en een scherp mes verdient.',
};

export default async function StoriesPage() {
  const campaigns = await getCampaigns();

  return (
    <section aria-labelledby="stories-title" className={styles.archive}>
      <p className={styles.archiveEyebrow}>Geen wegwerpweek</p>
      <h1 id="stories-title">Verhalen met een korstje.</h1>
      <div className={styles.archiveGrid}>
        {campaigns.map((campaign) => (
          <article className={styles.card} key={campaign.slug}>
            <div className={styles.cardImage}>
              <Image
                alt={campaign.image.alt}
                height={campaign.image.height}
                sizes="(max-width: 55.99rem) 100vw, 50vw"
                src={campaign.image.src}
                width={campaign.image.width}
              />
            </div>
            <div className={styles.cardCopy}>
              <h2>{campaign.title}</h2>
              <p>{campaign.intro}</p>
              <Link className={styles.cardLink} href={`/verhalen/${campaign.slug}`}>
                Lees het verhaal →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
