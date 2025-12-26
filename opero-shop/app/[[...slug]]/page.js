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

  // URL completo della pagina
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const fullUrl = `${protocol}://${hostname}`;

  if (isSubdomain) {
    const subdomain = hostname.replace(`.${rootDomain}`, "");
    const title = `${subdomain} - Opero Shop`;
    const description = `Sito e-commerce di ${subdomain} su piattaforma Opero Shop`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: fullUrl,
        siteName: subdomain, // Nome del sito invece di "Opero Shop"
        type: 'website',
        locale: 'it_IT',
        // Immagine di default (puoi personalizzarla in seguito)
        images: [
          {
            url: `https://${hostname}/og-image.jpg`, // Immagine Open Graph
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`https://${hostname}/og-image.jpg`],
      },
    };
  }

  // Sito principale (main.operocloud.it)
  const title = 'Opero Cloud - Piattaforma E-commerce Multi-Tenant';
  const description = 'Sistema multi-tenant per creare siti e-commerce personalizzati';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Opero Cloud', // Nome corretto del sito principale
      type: 'website',
      locale: 'it_IT',
      images: [
        {
          url: `${fullUrl}/og-image.jpg`, // Immagine Open Graph del sito principale
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${fullUrl}/og-image.jpg`],
    },
  };
}
