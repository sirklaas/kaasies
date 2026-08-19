import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/lib/site-config';

describe('siteConfig', () => {
  it('uses the production canonical origin', () => {
    expect(siteConfig.origin).toBe('https://kaasies.com');
    expect(siteConfig.locale).toBe('nl-NL');
  });
});
