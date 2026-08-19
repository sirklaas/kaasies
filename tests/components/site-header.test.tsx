import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Asap: () => ({ variable: '--font-asap' }),
  Bricolage_Grotesque: () => ({ variable: '--font-bricolage-grotesque' }),
}));

import RootLayout from '@/app/layout';
import { SiteHeader } from '@/components/layout/SiteHeader';

describe('SiteHeader', () => {
  it('gives shoppers a labelled home link, primary navigation and cart route', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /kaasies, naar homepage/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('navigation', { name: /hoofdnavigatie/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mandje/i })).toHaveAttribute('href', '/mandje');
  });

  it('connects the skip link to a programmatically focusable main landmark', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <p>Hoofdinhoud</p>
      </RootLayout>,
    );
    const layoutDocument = new DOMParser().parseFromString(markup, 'text/html');
    const skipLink = layoutDocument.querySelector('a[href="#main-content"]');
    const main = layoutDocument.querySelector('main#main-content');

    expect(skipLink?.textContent).toMatch(/sla navigatie over/i);
    expect(main?.getAttribute('tabindex')).toBe('-1');
  });
});
