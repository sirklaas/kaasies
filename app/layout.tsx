import type { Metadata } from 'next';
import { Asap, Bricolage_Grotesque } from 'next/font/google';
import type { ReactNode } from 'react';

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
      <body>{children}</body>
    </html>
  );
}
