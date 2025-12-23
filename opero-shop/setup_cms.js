/**
 * Nome File: setup_cms.js
 * Descrizione: Script Node.js per generare l'architettura del CMS Multi-Tenant in Next.js.
 * Eseguire con: node setup_cms.js
 */

const fs = require('fs');
const path = require('path');

// Funzione helper per creare directory e file
const createFile = (filePath, content) => {
    const absolutePath = path.join(__dirname, filePath);
    const dir = path.dirname(absolutePath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📂 Creata cartella: ${dir}`);
    }
    fs.writeFileSync(absolutePath, content.trim());
    console.log(`✅ Creato file: ${filePath}`);
};

console.log("🚀 Avvio setup OPERO CMS Multi-Tenant...");

// ---------------------------------------------------------
// 1. MIDDLEWARE (Routing)
// ---------------------------------------------------------
const middlewareContent = `
/**
 * Nome File: middleware.js
 * Percorso: middleware.js
 * Data: 15/12/2025
 * Versione: 1.0.0
 * Descrizione: Gestisce il routing multi-tenant.
 */
import { NextResponse } from "next/server";

export const config = {
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
    const subdomain = hostname.replace("." + rootDomain, "");
    // Riscrive l'URL verso la cartella _sites/[site]
    return NextResponse.rewrite(
      new URL(\`/_sites/\${subdomain}\${url.pathname}\`, req.url)
    );
  }
  return NextResponse.next();
}
`;
createFile('middleware.js', middlewareContent);

// ---------------------------------------------------------
// 2. COMPONENT REGISTRY
// ---------------------------------------------------------
const registryContent = `
/**
 * Nome File: BlockRegistry.js
 * Percorso: components/BlockRegistry.js
 * Data: 15/12/2025
 * Versione: 1.0.0
 * Descrizione: Mappa i codici DB ai componenti React.
 */
import dynamic from 'next/dynamic';

const HeroBlock = dynamic(() => import('./blocks/HeroBlock'));
const VetrinaBlock = dynamic(() => import('./blocks/VetrinaBlock'));
const HtmlBlock = dynamic(() => import('./blocks/HtmlBlock'));
const MapsBlock = dynamic(() => import('./blocks/MapsBlock'));

export const BLOCK_REGISTRY = {
  'HERO': HeroBlock,
  'VETRINA': VetrinaBlock,
  'HTML': HtmlBlock,
  'MAPS': MapsBlock,
};
`;
createFile('components/BlockRegistry.js', registryContent);

// ---------------------------------------------------------
// 3. BLOCCHI (Blocks)
// ---------------------------------------------------------
const heroBlockContent = `
/**
 * Nome File: HeroBlock.js
 * Percorso: components/blocks/HeroBlock.js
 */
import React from 'react';

export default function HeroBlock({ config }) {
  const { titolo, sottotitolo, immagine_url, allineamento, cta_text } = config || {};
  const alignClass = allineamento === 'center' ? 'text-center' : 
                     allineamento === 'right' ? 'text-right' : 'text-left';

  return (
    <div className="relative bg-gray-100 py-20 px-4 overflow-hidden">
      {immagine_url && (
        <div className="absolute inset-0 z-0">
          <img src={immagine_url} alt="Hero" className="w-full h-full object-cover opacity-30" />
        </div>
      )}
      <div className={\`relative z-10 container mx-auto \${alignClass}\`}>
        <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--primary-color)] mb-4">
          {titolo || "Titolo Hero"}
        </h1>
        {sottotitolo && <p className="text-xl text-gray-700 max-w-2xl mx-auto">{sottotitolo}</p>}
        {cta_text && (
            <button className="mt-8 px-8 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90">
                {cta_text}
            </button>
        )}
      </div>
    </div>
  );
}
`;
createFile('components/blocks/HeroBlock.js', heroBlockContent);

createFile('components/blocks/VetrinaBlock.js', `
export default function VetrinaBlock() { 
    return <div className="p-10 text-center border border-dashed">Vetrina Prodotti (Placeholder)</div>; 
}`);
createFile('components/blocks/HtmlBlock.js', `
export default function HtmlBlock({ config }) { 
    return <div className="container mx-auto p-4" dangerouslySetInnerHTML={{ __html: config?.html || "" }} />; 
}`);
createFile('components/blocks/MapsBlock.js', `
export default function MapsBlock() { 
    return <div className="bg-gray-200 h-64 flex items-center justify-center">Mappa Google (Placeholder)</div>; 
}`);

// ---------------------------------------------------------
// 4. TEMPLATE STANDARD
// ---------------------------------------------------------
const standardLayoutContent = `
/**
 * Nome File: Layout.js
 * Percorso: components/templates/Standard/Layout.js
 * Data: 15/12/2025
 */
import React from 'react';
import Link from 'next/link';

export default function StandardLayout({ children, siteConfig }) {
  const { name, logo, colors } = siteConfig || {};
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {logo ? <img src={logo} alt={name} className="h-10" /> : <span className="text-xl font-bold">{name}</span>}
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-[var(--primary-color)]">Home</Link>
            <Link href="/chi-siamo" className="hover:text-[var(--primary-color)]">Chi Siamo</Link>
            <Link href="/catalogo" className="hover:text-[var(--primary-color)]">Catalogo</Link>
          </div>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} {name}. Powered by Opero.
      </footer>
    </div>
  );
}
`;
createFile('components/templates/Standard/Layout.js', standardLayoutContent);

// ---------------------------------------------------------
// 5. MOTORE DI RENDERING (Page Engine)
// ---------------------------------------------------------
const pageEngineContent = `
/**
 * Nome File: page.js
 * Percorso: app/_sites/[site]/[[...slug]]/page.js
 * Data: 15/12/2025
 * Descrizione: Motore universale di rendering pagine CMS.
 */
import { notFound } from 'next/navigation';
import { BLOCK_REGISTRY } from '../../../../components/BlockRegistry';
import StandardLayout from '../../../../components/templates/Standard/Layout';

const TEMPLATES = { 'standard': StandardLayout };

async function getPageData(siteSlug, slugArray) {
  const pageSlug = slugArray ? slugArray.join('/') : 'home';
  const apiUrl = \`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/public/shop/\${siteSlug}/page/\${pageSlug}\`;
  
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Errore fetch CMS:", e);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { site, slug } = params;
  const data = await getPageData(site, slug);
  if (!data || !data.success) return { title: 'Pagina non trovata' };
  return { title: \`\${data.page.title} | \${data.siteConfig.name}\`, description: data.page.description };
}

export default async function DynamicPage({ params }) {
  const { site, slug } = params;
  const data = await getPageData(site, slug);

  if (!data || !data.success) return notFound();

  const { siteConfig, components } = data;
  const LayoutComponent = TEMPLATES[siteConfig.template] || TEMPLATES['standard'];
  
  const themeStyles = {
    '--primary-color': siteConfig.colors.primary,
    '--secondary-color': siteConfig.colors.secondary,
  };

  return (
    <div className={\`min-h-screen template-\${siteConfig.template}\`} style={themeStyles}>
      <LayoutComponent siteConfig={siteConfig} slug={site}>
        {components.map((block, index) => {
          const BlockComponent = BLOCK_REGISTRY[block.tipo_componente];
          if (!BlockComponent) return null;
          return (
            <section key={index} className="cms-block">
              <BlockComponent config={block.dati_config} dittaId={site} />
            </section>
          );
        })}
      </LayoutComponent>
    </div>
  );
}
`;
createFile('app/_sites/[site]/[[...slug]]/page.js', pageEngineContent);

// ---------------------------------------------------------
// 6. LAYOUT TECNICO
// ---------------------------------------------------------
createFile('app/_sites/[site]/layout.js', `
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
export default function SiteRootLayout({ children }) {
  return <div className={inter.className}>{children}</div>;
}
`);

console.log("---------------------------------------------------");
console.log("✅ SETUP COMPLETATO!");
console.log("Ora esegui 'npm run dev' e verifica che le cartelle siano state create.");
console.log("---------------------------------------------------");