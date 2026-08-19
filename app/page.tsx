import { siteConfig } from '@/lib/site-config';

export default function HomePage() {
  return (
    <section aria-labelledby="home-title" className="pageIntro">
      <h1 id="home-title">{siteConfig.name}</h1>
      <p>{siteConfig.description}</p>
    </section>
  );
}
