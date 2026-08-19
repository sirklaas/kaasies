import { campaigns } from './campaigns';
import { staticPages } from './pages';
import type { Campaign, CampaignAdapter } from './types';

const isPublic = (campaign: Campaign): boolean => campaign.status !== 'draft';

const byPublicCampaignOrder = (left: Campaign, right: Campaign): number => {
  if (left.status === 'active' && right.status !== 'active') return -1;
  if (right.status === 'active' && left.status !== 'active') return 1;
  return right.publishedAt.localeCompare(left.publishedAt);
};

export const localCampaignAdapter: CampaignAdapter = {
  async getActiveCampaign(): Promise<Campaign> {
    const campaign = campaigns.find((item) => item.status === 'active');

    if (!campaign) {
      throw new Error('A public campaign requires one active record.');
    }

    return campaign;
  },

  async getCampaigns(): Promise<readonly Campaign[]> {
    return campaigns.filter(isPublic).toSorted(byPublicCampaignOrder);
  },

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    return campaigns.find((item) => item.slug === slug && isPublic(item)) ?? null;
  },
};

export function getActiveCampaign(): Promise<Campaign> {
  return localCampaignAdapter.getActiveCampaign();
}

export function getCampaigns(): Promise<readonly Campaign[]> {
  return localCampaignAdapter.getCampaigns();
}

export function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  return localCampaignAdapter.getCampaignBySlug(slug);
}

export const localPublicRouteAdapter = {
  async getStaticRoutes(): Promise<readonly string[]> {
    return ['/', '/shop', ...Object.values(staticPages).map((page) => `/${page.slug}`), '/verhalen'];
  },
};

export function getStaticRoutes(): Promise<readonly string[]> {
  return localPublicRouteAdapter.getStaticRoutes();
}
