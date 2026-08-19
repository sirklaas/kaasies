import { expect, test } from '@playwright/test';

import sitemap from '../../app/sitemap';

test('every sitemap route has complete, crawlable page metadata', async ({ page }) => {
  const sitemapEntries = await sitemap();
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  for (const { url } of sitemapEntries) {
    const route = new URL(url).pathname;
    const response = await page.goto(route);

    expect(response?.status(), `${route} should return 200`).toBe(200);
    await expect(page.locator('h1'), `${route} should have one h1`).toHaveCount(1);

    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const expectedCanonical = route === '/' ? 'https://kaasies.com' : url;

    expect(title.trim(), `${route} should have a title`).not.toBe('');
    expect(description?.trim(), `${route} should have a description`).toBeTruthy();
    expect(canonical, `${route} should use the production canonical`).toBe(expectedCanonical);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      `${route} should not overflow horizontally`,
    ).toBe(true);
    expect(consoleErrors, `${route} should not log console errors`).toEqual([]);
  }
});
