/**
 * Nome File: page.js (CMS Engine Subpages)
 * Percorso: opero-shop/app/_sites/[site]/[...slug]/page.js
 * Descrizione: Motore di rendering per le SOTTOPAGINE.
 */
import { notFound } from 'next/navigation';
// Nota: qui saliamo di un livello in più (../../../../)
import { BLOCK_REGISTRY } from '../../../../components/BlockRegistry';
import StandardLayout from '../../../../components/templates/Standard/Layout';
import FashionLayout from '../../../../components/templates/Fashion/Layout';
import IndustrialLayout from '../../../../components/templates/Industrial/Layout';

const TEMPLATES = {
    'standard': StandardLayout,
    'fashion': FashionLayout,
    'industrial': IndustrialLayout
};

async function getPageData(siteSlug, slugArray) {
  const pageSlug = slugArray.join('/'); // es. "chi-siamo"
  // Usa URL relativo per sfruttare il proxy Next.js
  const apiUrl = `/api/public/shop/${siteSlug}/page/${pageSlug}`;

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

export async function generateMetadata({ params }) {
    const { site, slug } = params;
    const data = await getPageData(site, slug);
    if (!data || !data.success) return { title: 'Pagina non trovata' };
    return {
        title: `${data.page.title} | ${data.siteConfig.name}`,
        description: data.page.description,
    };
}

export default async function TenantSubPage({ params }) {
  const { site, slug } = params;
  const data = await getPageData(site, slug);

  if (!data || !data.success) return notFound();

  const { siteConfig, components } = data;
  const LayoutComponent = TEMPLATES[siteConfig.template] || TEMPLATES['standard'];
  
  const themeStyles = {
      '--primary-color': siteConfig.colors.primary || '#000000',
      '--secondary-color': siteConfig.colors.secondary || '#ffffff',
      '--background-color': siteConfig.colors.background || '#ffffff',
      '--block-background-color': siteConfig.colors.blockBackground || '#ffffff',
  };

  // Debug: verifica i valori delle variabili CSS
  console.log('🎨 DEBUG CSS Variables - [[...slug]]/page.js:');
  console.log('  siteConfig.colors:', siteConfig.colors);
  console.log('  siteConfig.colors.blockBackground:', siteConfig.colors.blockBackground);
  console.log('  siteConfig.colors.headerBackground:', siteConfig.colors.headerBackground);
  console.log('  siteConfig.colors.headerText:', siteConfig.colors.headerText);
  console.log('  siteConfig.colors.logoPosition:', siteConfig.colors.logoPosition);
  console.log('  --block-background-color value:', themeStyles['--block-background-color']);
  console.log('  --header-background-color value:', themeStyles['--header-background-color']);
  console.log('  --header-text-color value:', themeStyles['--header-text-color']);

  return (
    <div style={themeStyles}>
        <LayoutComponent siteConfig={siteConfig} slug={site}>
            {components.map((block, index) => {
                const BlockComponent = BLOCK_REGISTRY[block.tipo_componente];
                if (!BlockComponent) return null;

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