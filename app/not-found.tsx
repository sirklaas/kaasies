import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="pageIntro">
      <p>Verdwaald tussen de kazen</p>
      <h1>Deze pagina heeft geen korstje.</h1>
      <p>De pagina die je zoekt bestaat niet, of is inmiddels van de plank verdwenen.</p>
      <p>
        <Link href="/shop">Bekijk onze kazen</Link>
        {' of '}
        <Link href="/">ga naar de homepage</Link>.
      </p>
    </section>
  );
}
