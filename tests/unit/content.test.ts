import { describe, expect, it } from 'vitest';

import { getActiveCampaign, getCampaignBySlug, getCampaigns } from '@/lib/content/local-adapter';

describe('local campaign adapter', () => {
  it('returns the E-fabriek story as this week’s active campaign', async () => {
    expect((await getActiveCampaign()).slug).toBe('soms-is-kaas-geen-kaas');
  });

  it('never exposes draft campaigns in the public archive', async () => {
    expect((await getCampaigns()).every((item) => item.status !== 'draft')).toBe(true);
  });

  it('orders the active campaign before archived campaigns', async () => {
    expect((await getCampaigns()).map((item) => item.slug)).toEqual([
      'soms-is-kaas-geen-kaas',
      'geef-kaas-haar-tijd-terug',
      'breekbaar-is-een-compliment',
    ]);
  });

  it('returns null for a campaign that does not exist', async () => {
    expect(await getCampaignBySlug('bestaat-niet')).toBeNull();
  });
});
