import { afterEach, describe, expect, it, vi } from 'vitest';

const savedPreviewUrl = process.env.PLAYWRIGHT_BASE_URL;

afterEach(() => {
  if (savedPreviewUrl === undefined) {
    delete process.env.PLAYWRIGHT_BASE_URL;
  } else {
    process.env.PLAYWRIGHT_BASE_URL = savedPreviewUrl;
  }
  vi.resetModules();
});

describe('Playwright configuration', () => {
  it('uses PLAYWRIGHT_BASE_URL and skips the local web server for preview audits', async () => {
    process.env.PLAYWRIGHT_BASE_URL = 'https://preview.kaasies.example';
    vi.resetModules();

    const config = (await import('../../playwright.config')).default;

    expect(config.use?.baseURL).toBe('https://preview.kaasies.example');
    expect(config.webServer).toBeUndefined();
  });
});
