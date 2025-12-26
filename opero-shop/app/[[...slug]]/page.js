/**
 * Homepage principale - Routing Multi-Tenant Completo
 */

import { headers } from 'next/headers';
import StandardLayout from '../../components/templates/Standard/Layout';
import FashionLayout from '../../components/templates/Fashion/Layout';
import IndustrialLayout from '../../components/templates/Industrial/Layout';
import MainSitePageClient from './MainSitePageClient';
import TenantPageClient from './TenantPageClient';


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
    return <TenantPageClient site={subdomain} slug={slug} />;
  }

  // Homepage principale per il dominio root - Recupera il sito principale
  return <MainSitePageClient slug={getSlug()} />;
}

// Mappa dei Template Grafici
export const TEMPLATES = {
    'standard': StandardLayout,
    'fashion': FashionLayout,
    'industrial': IndustrialLayout
};

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
