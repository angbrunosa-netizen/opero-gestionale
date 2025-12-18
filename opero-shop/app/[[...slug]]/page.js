/**
 * Homepage principale - Routing Multi-Tenant Completo
 */

import { headers } from 'next/headers';
import StandardLayout from '../../components/templates/Standard/Layout';
import FashionLayout from '../../components/templates/Fashion/Layout';
import IndustrialLayout from '../../components/templates/Industrial/Layout';


export default async function HomePage({ params }) {
  // Unwrap params con await (Next.js 16 requirement)
  const resolvedParams = await params;

  // Funzione helper per estrarre lo slug in modo sicuro
  const getSlug = () => {
    if (resolvedParams && resolvedParams.slug && Array.isArray(resolvedParams.slug) && resolvedParams.slug.length > 0) {
      return resolvedParams.slug.join('/');
    }
    return 'home';
  };

  // Estrai l'hostname per determinare se è un sottodominio
  const headersList = await headers();
  let hostname = headersList.get('host') || '';
  hostname = hostname.split(':')[0]; // Rimuovi porta

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";
  const isSubdomain = hostname.includes(rootDomain) && hostname !== rootDomain;

  if (isSubdomain) {
    const subdomain = hostname.replace(`.${rootDomain}`, "");
    const slug = getSlug();
    return <TenantPage site={subdomain} slug={slug} />;
  }

  // Homepage principale per il dominio root
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Benvenuto in Opero Shop</h1>
      <p>Sistema multi-tenant per e-commerce</p>
      <p>Usa un sottodominio per accedere a un sito specifico (es. mia-azienda.localhost:3002)</p>
    </div>
  );
}

// Mappa dei Template Grafici
const TEMPLATES = { 
    'standard': StandardLayout,
    'fashion': FashionLayout,
    'industrial': IndustrialLayout
};

// Componente per gestire i siti tenant con CMS
async function TenantPage({ site, slug }) {
  // Import dinamico dei componenti CMS
  const { BLOCK_REGISTRY } = await import('../../components/BlockRegistry');

  // Fetch dati dal backend CMS
  async function getPageData(siteSlug, pageSlug) {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/shop/${siteSlug}/page/${pageSlug}`;

    try {
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("Errore connessione Backend CMS:", e);
      return null;
    }
  }

  const data = await getPageData(site, slug);

  // Se il backend non risponde, mostra una pagina di fallback
  if (!data || !data.success) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>🏪 {site}</h1>
        <p>Sito e-commerce in costruzione</p>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Il backend CMS non è raggiungibile o il sito non esiste nel database.
        </p>
        <p style={{ fontSize: '0.8rem', color: '#999' }}>
          Assicurati che il backend sia attivo su http://localhost:3001
        </p>
      </div>
    );
  }

  const { siteConfig, components } = data;
  const LayoutComponent = TEMPLATES[siteConfig.template] || TEMPLATES['standard'];

  const themeStyles = {
      '--primary-color': siteConfig.colors?.primary || '#2563eb',
      '--secondary-color': siteConfig.colors?.secondary || '#64748b',
  };

  return (
    <div style={themeStyles}>
        <LayoutComponent siteConfig={siteConfig} slug={site}>
            {components && components.map((block, index) => {
                const BlockComponent = BLOCK_REGISTRY[block.tipo_componente];

                if (!BlockComponent) {
                  return (
                    <section key={index} className="cms-block block-unknown">
                      <div style={{
                        padding: '1rem',
                        border: '1px dashed #ccc',
                        margin: '1rem 0',
                        textAlign: 'center',
                        color: '#666'
                      }}>
                        ⚠️ Componente "{block.tipo_componente}" non trovato
                      </div>
                    </section>
                  );
                }

                // Parsifica la configurazione JSON dal DB
                let config = block.dati_config;
                if (typeof config === 'string') {
                    try { config = JSON.parse(config); } catch(e) {
                      console.error('Errore parsing config:', e);
                      config = {};
                    }
                }

                return (
                    <section key={index} className={`cms-block block-${block.tipo_componente.toLowerCase()}`}>
                        <BlockComponent config={config} dittaId={site} />
                    </section>
                );
            })}

            {/* Fallback se non ci sono componenti */}
            {(!components || components.length === 0) && (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                background: '#f8f9fa',
                margin: '1rem 0',
                borderRadius: '8px'
              }}>
                <h2>🎉 {siteConfig.name || site}</h2>
                <p>Sito e-commerce pronto per essere configurato</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Aggiungi componenti dal CMS per personalizzare questa pagina.
                </p>
              </div>
            )}
        </LayoutComponent>
    </div>
  );
}

// Metadata dinamici per SEO
export async function generateMetadata() {
  const headersList = await headers();
  let hostname = headersList.get('host') || '';
  hostname = hostname.split(':')[0];

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";
  const isSubdomain = hostname.includes(rootDomain) && hostname !== rootDomain;

  if (isSubdomain) {
    const subdomain = hostname.replace(`.${rootDomain}`, "");
    return {
      title: `${subdomain} - Opero Shop`,
      description: `Sito e-commerce di ${subdomain} su piattaforma Opero Shop`,
    };
  }

  return {
    title: 'Opero Shop - Piattaforma E-commerce Multi-Tenant',
    description: 'Sistema multi-tenant per creare siti e-commerce personalizzati',
  };
}