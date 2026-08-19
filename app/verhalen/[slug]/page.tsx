import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import styles from '@/components/campaign/campaign-hero.module.css';
import { getCampaignBySlug, getCampaigns } from '@/lib/content/local-adapter';

type StoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const campaigns = await getCampaigns();

  return campaigns.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    return { title: 'Verhaal niet gevonden' };
  }

  return {
    title: campaign.seo.title,
    description: campaign.seo.description,
    alternates: { canonical: `/verhalen/${campaign.slug}` },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  return (
    <article className={styles.story}>
      <header className={styles.storyHeader}>
        <p className={styles.storyDate}>
          <time dateTime={campaign.publishedAt}>{campaign.publishedAt}</time>
        </p>
        <h1>{campaign.title}</h1>
        <p className={styles.storyIntro}>{campaign.intro}</p>
      </header>
      <div className={styles.storyImage}>
        <Image
          alt={campaign.image.alt}
          height={campaign.image.height}
          sizes="(max-width: 50rem) 100vw, 48rem"
          src={campaign.image.src}
          width={campaign.image.width}
        />
      </div>
      <div className={styles.storyBody}>
        {campaign.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <Link className={styles.cta} href={campaign.cta.href}>
          {campaign.cta.label}
        </Link>
      </div>
    </article>
  );
}
