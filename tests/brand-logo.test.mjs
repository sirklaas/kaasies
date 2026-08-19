import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const logoPath = 'assets/brand/kaasies-logo.webp';

test('every page uses the supplied logo asset instead of a text wordmark', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, new RegExp(`<img[^>]+src="${logoPath.replace('.', '\\.')}"`), `${page} must use the supplied logo`);
    assert.doesNotMatch(html, /class="(?:logo|brand)"[^>]*>\s*KAASIES/i, `${page} still contains the old text wordmark`);
    assert.doesNotMatch(html, /class="(?:tagline|payoff)"/i, `${page} still contains the separate old payoff`);
  }
});

test('the supplied logo is present in the project asset folder', () => {
  assert.equal(fs.existsSync(path.join(root, logoPath)), true);
});
