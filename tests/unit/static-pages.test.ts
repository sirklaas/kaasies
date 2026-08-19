import { describe, expect, it } from 'vitest';

import { staticPages } from '@/lib/content/pages';

describe('static brand and service page content', () => {
  it('publishes the four agreed page records', () => {
    expect(Object.keys(staticPages).sort()).toEqual(['contact', 'makers', 'manifest', 'service']);
  });

  it('gives every page a useful title and metadata description', () => {
    for (const page of Object.values(staticPages)) {
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.description.length).toBeGreaterThanOrEqual(50);
    }
  });
});
