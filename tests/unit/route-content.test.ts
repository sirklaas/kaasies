import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import ShopPage from '@/app/shop/page';

describe('catalog route content', () => {
  afterEach(cleanup);

  it('shows exactly the active catalog products on the homepage', async () => {
    render(await HomePage());

    const productLinks = screen.getAllByRole('link', { name: /bekijk kaas/i });

    expect(productLinks).toHaveLength(16);
    expect(productLinks.map((link) => link.getAttribute('href'))).toContain('/shop/grand-cru');
    expect(screen.getAllByText(/per kg/i)).toHaveLength(16);
  });

  it('shows exactly the active catalog products in the shop', async () => {
    render(await ShopPage());

    const productLinks = screen.getAllByRole('link', { name: /bekijk kaas/i });

    expect(productLinks).toHaveLength(16);
    expect(productLinks.map((link) => link.getAttribute('href'))).toContain('/shop/minder-zout');
    expect(screen.getAllByText('Per 1 kg')).toHaveLength(16);
  });
});
