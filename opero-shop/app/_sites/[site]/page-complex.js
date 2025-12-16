/**
 * Nome File: page.js (CMS Engine - Home Page Tenant)
 * Percorso: opero-shop/app/_sites/[site]/page.js
 * Descrizione: Motore di rendering per la HOME PAGE del tenant.
 * Recupera la configurazione e i componenti dal Backend Opero.
 */
import { notFound } from 'next/navigation';
import { BLOCK_REGISTRY } from '../../../components/BlockRegistry';
import StandardLayout from '../../../components/templates/Standard/Layout';

// Mappa dei Template Grafici (espandibile in futuro)
const TEMPLATES = {
    'standard': StandardLayout,
    // 'fashion': FashionLayout,
};

// Funzione per chiamare l'API del Backend
async function getPageData(siteSlug) {
  // Chiamata specifica per la pagina 'home'
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/shop/${siteSlug}/page/home`;

  try {
    // cache: 'no-store' garantisce che le modifiche nel gestionale si vedano subito
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
        console.error(`Errore API Backend (${res.status}):`, res.statusText);
        return null;
    }

    return await res.json();
  } catch (e) {
    console.error("Errore di connessione al Backend:", e);
    return null;
  }
}

export async function generateMetadata({ params }) {
    const { site } = params;
    const data = await getPageData(site);

    if (!data || !data.success) return { title: 'Sito non trovato' };

    return {
        title: `${data.page.title} | ${data.siteConfig.name}`,
        description: data.page.description,
    };
}

export default async function TenantHomePage({ params }) {
  const { site } = params; // "site" è lo slug (es. mia-azienda)

  // 1. Recupera i dati
  const data = await getPageData(site);

  // 2. Se non ci sono dati, mostra 404
  if (!data || !data.success) {
      return notFound();
  }

  const { siteConfig, components } = data;

  // 3. Scegli il layout (Template)
  const LayoutComponent = TEMPLATES[siteConfig.template] || TEMPLATES['standard'];

  // 4. Applica i colori personalizzati come variabili CSS
  const themeStyles = {
      '--primary-color': siteConfig.colors.primary || '#000000',
      '--secondary-color': siteConfig.colors.secondary || '#ffffff',
  };

  return (
    <div style={themeStyles}>
        <LayoutComponent siteConfig={siteConfig} slug={site}>
            {/* 5. Renderizza i blocchi dinamici */}
            {components && components.map((block, index) => {
                const BlockComponent = BLOCK_REGISTRY[block.tipo_componente];

                if (!BlockComponent) {
                    // Fallback per blocchi non implementati
                    return (
                        <div key={index} className="p-4 border border-red-300 bg-red-50 text-red-600 text-center">
                            Blocco "{block.tipo_componente}" non trovato nel registro.
                        </div>
                    );
                }

                // Parsifica la configurazione se arriva come stringa JSON dal DB (caso comune con MySQL)
                let config = block.dati_config;
                if (typeof config === 'string') {
                    try { config = JSON.parse(config); } catch(e) {}
                }

                return (
                    <section key={index} className={`cms-block block-${block.tipo_componente.toLowerCase()}`}>
                        <BlockComponent config={config} dittaId={site} />
                    </section>
                );
            })}
        </LayoutComponent>
    </div>
  );
}