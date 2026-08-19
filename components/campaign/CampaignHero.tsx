import Image from 'next/image';
import Link from 'next/link';

import type { Campaign } from '@/lib/content/types';

import styles from './campaign-hero.module.css';

type CampaignHeroProps = {
  campaign: Campaign;
};

export function CampaignHero({ campaign }: CampaignHeroProps) {
  return (
    <section aria-labelledby="campaign-title" className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>Geen nepkaas</p>
        <h1 id="campaign-title">{campaign.title}</h1>
        <p className={styles.intro}>{campaign.intro}</p>
        <Link className={styles.cta} href={campaign.cta.href}>
          {campaign.cta.label}
        </Link>
      </div>
      <div className={styles.heroImage}>
        <Image
          alt={campaign.image.alt}
          height={campaign.image.height}
          priority
          sizes="(max-width: 56rem) 100vw, 50vw"
          src={campaign.image.src}
          width={campaign.image.width}
        />
      </div>
    </section>
  );
}
