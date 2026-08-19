import type { Metadata } from 'next';

import { staticPages } from '@/lib/content/pages';

const page = staticPages.manifest;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

export default function ManifestPage() {
  return (
    <article aria-labelledby="manifest-title" className="pageIntro">
      <header>
        <p>{page.eyebrow}</p>
        <h1 id="manifest-title">{page.title}</h1>
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
