import assert from 'node:assert/strict';
import { chromium } from '/opt/homebrew/lib/node_modules/playwright/index.mjs';

const base = process.env.KAASIES_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Users/mac/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell',
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${base}/back.html`);
  await page.evaluate(() => localStorage.removeItem('kaasies-back-workflow-v1'));
  await page.reload();
  assert.equal(await page.locator('.step').count(), 13, 'renders the complete default journey');
  assert.equal(await page.locator('.order-card').count(), 6, 'renders prototype orders');
  await page.locator('[data-edit="upsell"]').click();
  await page.locator('[name="name"]').fill('Extra kaas erbij?');
  await page.locator('[data-save-step]').click();
  assert.equal(await page.locator('[data-step-id="upsell"] h3').textContent(), 'Extra kaas erbij?');
  await page.reload();
  assert.equal(await page.locator('[data-step-id="upsell"] h3').textContent(), 'Extra kaas erbij?', 'persists edits');
  const toggle = page.locator('[data-step-id="upsell"] .switch');
  const before = await toggle.getAttribute('aria-pressed');
  await toggle.click();
  assert.notEqual(await toggle.getAttribute('aria-pressed'), before, 'toggles editable actions');
  await page.locator('[data-step-id="review"] [data-move="-1"]').click();
  const ids = await page.locator('.step').evaluateAll(nodes => nodes.map(node => node.dataset.stepId));
  assert.ok(ids.indexOf('review') < ids.indexOf('delivery'), 'moves actions upward');
  await page.locator('[data-order-filter="attention"]').click();
  assert.equal(await page.locator('.order-card').count(), 2, 'filters attention orders');
  await page.locator('[data-edit="label"]').click();
  assert.match(await page.locator('.label-preview').textContent(), /K-1048/, 'shows the selected order on the label');

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${base}/back.html`);
  await mobile.locator('[data-mobile-panel="editor"]').click();
  assert.ok(await mobile.locator('[data-panel="editor"]').evaluate(el => el.classList.contains('active')));
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `mobile horizontal overflow is ${overflow}px`);
  await mobile.close();
  console.log('Back-office browser journey: interactions, persistence, label and mobile layout OK.');
} finally {
  await browser.close();
}
