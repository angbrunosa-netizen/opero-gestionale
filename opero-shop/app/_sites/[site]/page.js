/**
 * Nome File: page.js (CMS Engine Home)
 * Percorso: opero-shop/app/_sites/[site]/page.js
 * Descrizione: Motore di rendering per la HOME PAGE.
 * Sostituisce la pagina di debug.
 */
import { notFound } from 'next/navigation';
import { BLOCK_REGISTRY } from '../../../components/BlockRegistry';
import StandardLayout from '../../../components/templates/Standard/Layout';

import FashionLayout from '../../../components/templates/Fashion/Layout';
import IndustrialLayout from '../../../components/templates/Industrial/Layout';
// Mappa dei Template Grafici
const TEMPLATES = {
    'standard': StandardLayout,
    'fashion': FashionLayout,
    'industrial': IndustrialLayout
};


// Funzione per chiamare l'API del Backend
async function getPageData(siteSlug) {
  // Nota: Assicurati che la porta qui sotto (3001) corrisponda al tuo Backend Node.js
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/shop/${siteSlug}/page/home`;
  
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Errore connessione Backend:", e);
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
  const { site } = params; 
  const data = await getPageData(site);

  if (!data || !data.success) {
      return notFound();
  }

  const { siteConfig, components } = data;
  const LayoutComponent = TEMPLATES[siteConfig.template] || TEMPLATES['standard'];
  const themeStyles = {
      '--primary-color': siteConfig.colors.primary || '#000000',
      '--secondary-color': siteConfig.colors.secondary || '#ffffff',
      '--background-color': siteConfig.colors.background || '#ffffff',
      '--block-background-color': siteConfig.colors.blockBackground || '#ffffff',
  };

  

  return (
    <div style={themeStyles}>
        <LayoutComponent siteConfig={siteConfig} slug={site}>
            {components && components.map((block, index) => {
                const BlockComponent = BLOCK_REGISTRY[block.tipo_componente];
                
                if (!BlockComponent) return null;

                // Parsifica la configurazione JSON dal DB
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