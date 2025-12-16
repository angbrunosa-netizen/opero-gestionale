/**
 * Versione semplificata per test
 */
export default function TestPage({ params }) {
  return (
    <div>
      <h1>Test Page for {params.site}</h1>
      <p>Questa è una pagina di test per verificare che il routing funzioni.</p>
    </div>
  );
}