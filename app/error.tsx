'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="pageIntro">
      <p>Even wachten</p>
      <h1>Deze kaas wil nog niet meewerken.</h1>
      <p>Probeer het gerust nog eens.</p>
      <button onClick={reset} type="button">Probeer opnieuw</button>
    </section>
  );
}
