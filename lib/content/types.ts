export type CampaignStatus = 'active' | 'archived' | 'draft';

export type Campaign = {
  slug: string;
  status: CampaignStatus;
  publishedAt: string;
  title: string;
  intro: string;
  body: readonly string[];
  cta: { label: string; href: string };
  image: { src: string; alt: string; width: number; height: number };
  seo: { title: string; description: string };
};

export interface CampaignAdapter {
  getActiveCampaign(): Promise<Campaign>;
  getCampaigns(): Promise<readonly Campaign[]>;
  getCampaignBySlug(slug: string): Promise<Campaign | null>;
}
