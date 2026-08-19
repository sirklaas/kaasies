import type { Metadata } from 'next';
import { Asap, Bricolage_Grotesque } from 'next/font/google';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { siteConfig } from '@/lib/site-config';

import './globals.css';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage-grotesque',
});

const asap = Asap({
  subsets: ['latin'],
  variable: '--font-asap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="nl-NL" className={`${bricolageGrotesque.variable} ${asap.variable}`}>
      <body>
        <a className="skipLink" href="#main-content">Sla navigatie over</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
