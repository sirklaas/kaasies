import type { Metadata } from 'next';

import { staticPages } from '@/lib/content/pages';

const page = staticPages.service;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: '/service' },
};

export default function ServicePage() {
  return (
    <article aria-labelledby="service-title" className="pageIntro">
      <header>
        <p>{page.eyebrow}</p>
        <h1 id="service-title">{page.title}</h1>
      </header>
      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      ))}
    </article>
  );
}
