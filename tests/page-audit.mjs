import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const failures = [];
const requiredPages = ['index.html', 'shop.html', 'cart.html', 'checkout.html', 'back.html'];

for (const page of requiredPages) {
  if (!pages.includes(page)) failures.push(`${page}: required page is missing`);
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const h1s = html.match(/<h1\b/gi) || [];
  if (h1s.length !== 1) failures.push(`${page}: expected 1 h1, found ${h1s.length}`);
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${page}: missing title`);
  if (!/<meta name="description" content="[^"]+"/i.test(html)) failures.push(`${page}: missing description`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const ref = match[1];
    if (/^(?:https?:|#|mailto:|data:)/.test(ref)) continue;
    const target = ref.split('#')[0].split('?')[0];
    if (target && !fs.existsSync(path.join(root, target))) failures.push(`${page}: missing ${target}`);
  }
}

assert.deepEqual(failures, [], failures.join('\n'));
console.log(`Audited ${pages.length} HTML pages: structure and local references OK.`);
