import { expect, test } from '@playwright/test';

const visualArtifacts = 'artifacts/visual';

function collectConsoleErrors(page: import('@playwright/test').Page): string[] {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return errors;
}

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test('takes a shopper from the homepage to checkout with a persistent 750 gram Oud cheese', async ({ page }, testInfo) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/');
  await expect(page.getByRole('link', { name: /bekijk alle kazen/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  if (testInfo.project.name === 'chromium-desktop') {
    await page.screenshot({ path: `${visualArtifacts}/home-desktop.png`, fullPage: true });
  }

  if (testInfo.project.name === 'iphone-13') {
    await page.screenshot({ path: `${visualArtifacts}/home-mobile.png`, fullPage: true });
  }

  await page.getByRole('link', { name: /bekijk alle kazen/i }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await page.getByRole('link', { name: /oud/i }).click();
  await expect(page).toHaveURL(/\/shop\/oud$/);

  await page.getByRole('radio', { name: /750 gram/i }).check();
  await expect(page.getByRole('radio', { name: /750 gram/i })).toBeChecked();
  await page.getByRole('button', { name: /in mijn mandje/i }).click();
  await expect(page.getByRole('status').filter({ hasText: /750 gram.*toegevoegd/i })).toBeVisible();

  await page.getByRole('link', { name: /mandje/i }).click();
  await expect(page).toHaveURL(/\/mandje$/);
  await expect(page.getByRole('heading', { name: /jouw mandje/i })).toBeVisible();
  await expect(page.getByText(/750 gram/i)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/750 gram/i)).toBeVisible();

  await page.getByRole('link', { name: /naar afrekenen/i }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { name: /afrekenen/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  if (testInfo.project.name === 'iphone-13') {
    await page.screenshot({ path: `${visualArtifacts}/checkout-mobile.png`, fullPage: true });
  }

  expect(consoleErrors).toEqual([]);
});

test('shows field errors, focuses the first invalid field, and preserves valid input', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/checkout');
  await page.getByLabel(/e-mailadres/i).fill('sanne@voorbeeld.nl');
  await page.getByRole('button', { name: /gegevens controleren/i }).click();

  await expect(page.getByLabel(/^naam$/i)).toBeFocused();
  await expect(page.getByLabel(/e-mailadres/i)).toHaveValue('sanne@voorbeeld.nl');
  await expect(page.getByLabel(/^naam$/i)).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText(/vul je naam in/i)).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('keeps core navigation keyboard-accessible and honors reduced motion', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /sla navigatie over/i })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  const navigation = page.getByRole('navigation', { name: /hoofdnavigatie/i });
  await expect(navigation.getByRole('link', { name: /kazen/i })).toHaveAttribute('href', '/shop');
  await expect(navigation.getByRole('link', { name: /waarom echt/i })).toHaveAttribute('href', '/manifest');
  await expect(navigation.getByRole('link', { name: /de makers/i })).toHaveAttribute('href', '/makers');
  await expect(navigation.getByRole('link', { name: /verhalen/i })).toHaveAttribute('href', '/verhalen');
  const reducedMotion = await page.evaluate(() => {
    const navLink = document.querySelector('nav[aria-label="Hoofdnavigatie"] a');
    const productImage = document.querySelector('article img');

    return {
      navigationIndicator: navLink ? parseFloat(getComputedStyle(navLink, '::after').transitionDuration) : Number.NaN,
      productImage: productImage ? parseFloat(getComputedStyle(productImage).transitionDuration) : Number.NaN,
    };
  });
  expect(reducedMotion.navigationIndicator).toBeLessThanOrEqual(0.01);
  expect(reducedMotion.productImage).toBeLessThanOrEqual(0.01);
  await expectNoHorizontalOverflow(page);
  expect(consoleErrors).toEqual([]);
});
