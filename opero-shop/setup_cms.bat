@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   OPERO CMS MULTI-TENANT - AUTOMATED SETUP
echo ========================================================
echo.

REM --- 1. Controllo Posizione ---
if not exist "package.json" (
    echo [ERRORE] Esegui questo script nella root del progetto Next.js (dove c'e' package.json)
    pause
    exit /b
)

echo [1/5] Creazione Struttura Cartelle...

REM Cartella per i siti tenant
if not exist "app\_sites\[site]\[[...slug]]" mkdir "app\_sites\[site]\[[...slug]]"

REM Cartella per i blocchi componenti
if not exist "components\blocks" mkdir "components\blocks"

REM Cartella per i template grafici (Standard, Fashion, ecc.)
if not exist "components\templates\Standard" mkdir "components\templates\Standard"
if not exist "components\templates\Fashion" mkdir "components\templates\Fashion"
if not exist "components\templates\Industrial" mkdir "components\templates\Industrial"

echo.
echo [2/5] Generazione Middleware (Routing)...

(
echo /**
echo  * Nome File: middleware.js
echo  * Percorso: middleware.js
echo  * Data: 15/12/2025
echo  * Versione: 1.0.0
echo  * Descrizione: Gestisce il routing multi-tenant.
echo  */
echo.
echo import { NextResponse } from "next/server";
echo.
echo export const config = {
echo   matcher: [
echo     "/((?!api|_next/static|_next/image|favicon.ico).*)",
echo   ],
echo };
echo.
echo export default function middleware(req) {
echo   const url = req.nextUrl;
echo   let hostname = req.headers.get("host") ^|^| "";
echo   hostname = hostname.split(":")[0];
echo   const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ^|^| "localhost";
echo.
echo   const isSubdomain =
echo     hostname.includes(rootDomain) ^&^&
echo     hostname !== rootDomain ^&^&
echo     hostname !== "www." + rootDomain;
echo.
echo   if (isSubdomain) {
echo     const subdomain = hostname.replace("." + rootDomain, "");
echo     console.log("🌍 Middleware: Tenant rilevato [" + subdomain + "] per path [" + url.pathname + "]");
echo     return NextResponse.rewrite(
echo       new URL(`/_sites/${subdomain}${url.pathname}`, req.url)
echo     );
echo   }
echo   return NextResponse.next();
echo }
) > middleware.js

echo.
echo [3/5] Generazione Registro Componenti e Layout...

REM --- BlockRegistry.js ---
(
echo /**
echo  * Nome File: BlockRegistry.js
echo  * Percorso: components/BlockRegistry.js
echo  */
echo import dynamic from 'next/dynamic';
echo.
echo const HeroBlock = dynamic^((^) =^> import('./blocks/HeroBlock'^)^);
echo const VetrinaBlock = dynamic^((^) =^> import('./blocks/VetrinaBlock'^)^);
echo const MapsBlock = dynamic^((^) =^> import('./blocks/MapsBlock'^)^);
echo const HtmlBlock = dynamic^((^) =^> import('./blocks/HtmlBlock'^)^);
echo.
echo export const BLOCK_REGISTRY = {
echo   'HERO': HeroBlock,
echo   'VETRINA': VetrinaBlock,
echo   'MAPS': MapsBlock,
echo   'HTML': HtmlBlock,
echo };
) > components\BlockRegistry.js

REM --- Root Site Layout ---
(
echo /**
echo  * Nome File: layout.js (Root Site)
echo  * Percorso: app/_sites/[site]/layout.js
echo  */
echo import { Inter } from 'next/font/google';
echo const inter = Inter^({ subsets: ['latin'] }^);
echo.
echo export default function SiteRootLayout({ children }) {
echo   return ^<div className={inter.className}^^>{children}^</div^>;
echo }
) > "app\_sites\[site]\layout.js"

REM --- Standard Template Layout ---
(
echo /**
echo  * Nome File: Layout.js
echo  * Percorso: components/templates/Standard/Layout.js
echo  */
echo import React from 'react';
echo import Link from 'next/link';
echo.
echo export default function StandardLayout({ children, meta, slug, siteConfig }) {
echo   const { name, logo, colors } = siteConfig ^|^| {};
echo   return (
echo     ^<div className="flex flex-col min-h-screen font-sans text-gray-800"^>
echo       ^<nav className="bg-white border-b border-gray-200 sticky top-0 z-50"^>
echo         ^<div className="container mx-auto px-4 h-16 flex items-center justify-between"^>
echo           ^<Link href="/" className="flex items-center gap-2"^>
echo             {logo ? ^<img src={logo} alt={name} className="h-10 w-auto object-contain" /^> : ^<span className="text-xl font-bold text-gray-900"^>{name}^</span^>}
echo           ^</Link^>
echo           ^<div className="hidden md:flex gap-6"^>
echo             ^<Link href="/" className="hover:text-[var(--primary-color)] transition"^>Home^</Link^>
echo             ^<Link href="/chi-siamo" className="hover:text-[var(--primary-color)] transition"^>Chi Siamo^</Link^>
echo             ^<Link href="/catalogo" className="hover:text-[var(--primary-color)] transition"^>Catalogo^</Link^>
echo             ^<Link href="/contatti" className="hover:text-[var(--primary-color)] transition"^>Contatti^</Link^>
echo           ^</div^>
echo         ^</div^>
echo       ^</nav^>
echo       ^<main className="flex-grow"^>{children}^</main^>
echo       ^<footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-6"^>
echo         ^<div className="container mx-auto px-4 text-center text-xs text-gray-400"^>
echo           ^&copy; {new Date^(.^).getFullYear^(.^)} {name}. Powered by Opero.
echo         ^</div^>
echo       ^</footer^>
echo     ^</div^>
echo   ^);
echo }
) > "components\templates\Standard\Layout.js"

echo.
echo [4/5] Generazione Componenti Base (Blocks)...

REM --- HeroBlock.js ---
(
echo /**
echo  * Nome File: HeroBlock.js
echo  * Percorso: components/blocks/HeroBlock.js
echo  */
echo import React from 'react';
echo.
echo export default function HeroBlock({ config }) {
echo   const { titolo, sottotitolo, immagine_url, allineamento } = config ^|^| {};
echo   const alignClass = allineamento === 'center' ? 'text-center' : 
echo                      allineamento === 'right' ? 'text-right' : 'text-left';
echo   return (
echo     ^<div className="relative bg-gray-100 py-20 px-4 overflow-hidden"^>
echo       {immagine_url ^&^& (
echo         ^<div className="absolute inset-0 z-0"^>
echo           ^<img src={immagine_url} alt="Hero Background" className="w-full h-full object-cover opacity-30" /^>
echo         ^</div^>
echo       )}
echo       ^<div className={`relative z-10 container mx-auto ${alignClass}`}^>
echo         ^<h1 className="text-4xl md:text-6xl font-extrabold text-[var(--primary-color)] mb-4"^>
echo           {titolo ^|^| "Titolo Hero"}
echo         ^</h1^>
echo         {sottotitolo ^&^& ^<p className="text-xl text-gray-700 max-w-2xl mx-auto md:mx-0"^>{sottotitolo}^</p^>}
echo       ^</div^>
echo     ^</div^>
echo   ^);
echo }
) > "components\blocks\HeroBlock.js"

REM --- HtmlBlock.js (Placeholder) ---
(
echo /**
echo  * Placeholder per HtmlBlock
echo  */
echo export default function HtmlBlock({ config }) {
echo   return ^<div className="container mx-auto p-4" dangerouslySetInnerHTML={{ __html: config?.html ^|^| "" }} /^>;
echo }
) > "components\blocks\HtmlBlock.js"

REM --- VetrinaBlock.js (Placeholder) ---
(
echo /**
echo  * Placeholder per VetrinaBlock
echo  */
echo export default function VetrinaBlock({ config }) {
echo   return ^<div className="container mx-auto p-4 border p-10 text-center"^>Vetrina Prodotti (Da Implementare)^</div^>;
echo }
) > "components\blocks\VetrinaBlock.js"

REM --- MapsBlock.js (Placeholder) ---
(
echo /**
echo  * Placeholder per MapsBlock
echo  */
echo export default function MapsBlock({ config }) {
echo   return ^<div className="container mx-auto p-4 bg-gray-200 h-64 flex items-center justify-center"^>Google Maps Block^</div^>;
echo }
) > "components\blocks\MapsBlock.js"

echo.
echo [5/5] Generazione Motore di Rendering (Page Engine)...

REM --- Dynamic Page Engine ---
(
echo /**
echo  * Nome File: page.js
echo  * Percorso: app/_sites/[site]/[[...slug]]/page.js
echo  */
echo import { notFound } from 'next/navigation';
echo import { BLOCK_REGISTRY } from '../../../components/BlockRegistry';
echo import StandardLayout from '../../../components/templates/Standard/Layout';
echo.
echo const TEMPLATES = { 'standard': StandardLayout };
echo.
echo async function getPageData(siteSlug, slugArray) {
echo   const pageSlug = slugArray ? slugArray.join('/') : 'home';
echo   const apiUrl = `${process.env.NEXT_PUBLIC_API_URL ^|^| 'http://localhost:3001'}/api/public/shop/${siteSlug}/page/${pageSlug}`;
echo   try {
echo     const res = await fetch(apiUrl, { cache: 'no-store' });
echo     if (!res.ok) return null;
echo     return await res.json();
echo   } catch (e) {
echo     console.error("Errore fetch CMS:", e);
echo     return null;
echo   }
echo }
echo.
echo export async function generateMetadata({ params }) {
echo   const { site, slug } = params;
echo   const data = await getPageData(site, slug);
echo   if (!data ^|^| !data.success) return { title: 'Pagina non trovata' };
echo   return {
echo     title: `${data.page.title} | ${data.siteConfig.name}`,
echo     description: data.page.description,
echo   };
echo }
echo.
echo export default async function DynamicPage({ params }) {
echo   const { site, slug } = params;
echo   const data = await getPageData(site, slug);
echo.
echo   if (!data ^|^| !data.success) {
echo     return notFound();
echo   }
echo.
echo   const { siteConfig, components } = data;
echo   const LayoutComponent = TEMPLATES[siteConfig.template] ^|^| TEMPLATES['standard'];
echo   const themeStyles = {
echo     '--primary-color': siteConfig.colors.primary,
echo     '--secondary-color': siteConfig.colors.secondary,
echo   };
echo.
echo   return (
echo     ^<div className={`min-h-screen template-${siteConfig.template}`} style={themeStyles}^>
echo       ^<LayoutComponent siteConfig={siteConfig} slug={site}^>
echo         {components.map((block, index) =^> {
echo           const BlockComponent = BLOCK_REGISTRY[block.tipo_componente];
echo           if (!BlockComponent) return null;
echo           return (
echo             ^<section key={index} id={`block-${index}`} className="cms-block"^>
echo               ^<BlockComponent config={block.dati_config} dittaId={site} /^>
echo             ^</section^>
echo           );
echo         })}
echo       ^</LayoutComponent^>
echo     ^</div^>
echo   );
echo }
) > "app\_sites\[site]\[[...slug]]\page.js"

echo.
echo ========================================================
echo   SETUP COMPLETATO CON SUCCESSO!
echo ========================================================
echo.
echo Prossimi Passi:
echo 1. Assicurati che nel file .env sia impostato NEXT_PUBLIC_ROOT_DOMAIN=localhost (per sviluppo)
echo 2. Esegui 'npm run dev'
echo 3. Testa accedendo a http://dittaprova.localhost:3000
echo.
pause