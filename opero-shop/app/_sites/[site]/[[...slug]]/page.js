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
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/shop/${siteSlug}/page/${pageSlug}`;
  
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
  return { title: `${data.page.title} | ${data.siteConfig.name}`, description: data.page.description };
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
    <div className={`min-h-screen template-${siteConfig.template}`} style={themeStyles}>
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