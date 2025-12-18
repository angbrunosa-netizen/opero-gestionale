import { NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Applica il middleware a tutte le richieste, ESCLUSE:
     * - api (le rotte API interne di Next.js)
     * - _next/static (file statici come immagini, css, js)
     * - _next/image (API di ottimizzazione immagini)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export default function middleware(req) {
  const url = req.nextUrl;
  
  // Ottieni l'hostname (es. "mia-azienda.localhost:3000")
  let hostname = req.headers.get("host") || "";
  
  // Rimuovi la porta (per sviluppo locale) -> "mia-azienda.localhost"
  hostname = hostname.split(":")[0];

  // Definisci il dominio radice
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";

  // Verifica se è un sottodominio (es. "mia-azienda.localhost")
  const isSubdomain =
    hostname.includes(rootDomain) &&
    hostname !== rootDomain &&
    hostname !== "www." + rootDomain;

  if (isSubdomain) {
    // Estrai lo slug (es. "mia-azienda")
    const subdomain = hostname.replace(`.${rootDomain}`, "");

    // Riscrivi l'URL internamente verso la struttura [[...slug]]
    // Mantieni il pathname originale (es. /chi-siamo) e passa il sottodominio come parametro
    // Esempio: /chi-siamo -> /chi-siamo?site=mia-azienda
    const newUrl = new URL(url.pathname, req.url);
    newUrl.searchParams.set('site', subdomain);

    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}