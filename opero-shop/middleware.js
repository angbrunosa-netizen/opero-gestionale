/**
 * Nome File: middleware.js
 * Percorso: middleware.js
 * Data: 16/12/2025
 * Versione: 1.1.0 (FIXED)
 * Descrizione: Gestisce il routing multi-tenant.
 */

import { NextResponse } from "next/server";

export const config = {
  // Versione più semplice del matcher. 
  // Ignora solo le cartelle interne di Next.js e i file statici.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export default function middleware(req) {
  const url = req.nextUrl;
  let hostname = req.headers.get("host") || "";
  hostname = hostname.split(":")[0];
  
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";

  const isSubdomain =
    hostname.includes(rootDomain) &&
    hostname !== rootDomain &&
    hostname !== "www." + rootDomain;

  if (isSubdomain) {
    const subdomain = hostname.replace(`.${rootDomain}`, "");

    // Rewrite a /_sites/[site]/[...slug]
    return NextResponse.rewrite(
      new URL(`/_sites/${subdomain}${url.pathname}`, req.url)
    );
  }
  
  // Se non è un sottodominio, reindirizza alla root (che dovrebbe essere una landing page statica, ma per ora lo lasciamo passare al 404 standard se non c'è app/page.js)
  return NextResponse.next();
}