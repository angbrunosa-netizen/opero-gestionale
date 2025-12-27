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
export async function generateMetadata({ params }) {
  const headersList = await headers();
  let hostname = headersList.get('host') || '';
  hostname = hostname.split(':')[0];

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";
  const isSubdomain = hostname.includes(rootDomain) && hostname !== rootDomain;

  // URL completo della pagina
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const fullUrl = `${protocol}://${hostname}`;

  // Unwrap params con await (Next.js 16 requirement)
  const resolvedParams = await params;

  // Funzione helper per estrarre lo slug in modo sicuro
  const getSlug = () => {
    if (resolvedParams && resolvedParams.slug && Array.isArray(resolvedParams.slug) && resolvedParams.slug.length > 0) {
      return resolvedParams.slug.join('/');
    }
    return 'home';
  };

  const pageSlug = getSlug();

  if (isSubdomain) {
    const subdomain = hostname.replace(`.${rootDomain}`, "");
    let title = `${subdomain} - Opero Shop`;
    let description = `Sito e-commerce di ${subdomain} su piattaforma Opero Shop`;
    let ogImage = null;

    // Recupera i dati della pagina dal backend per ottenere Open Graph
    try {
      const apiUrl = `${protocol}://${hostname}/api/public/shop/${subdomain}/page/${pageSlug}`;
      const res = await fetch(apiUrl, { cache: 'no-store' });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.page) {
          const page = result.page;

          // Usa i dati Open Graph dal backend se disponibili
          if (page.og_title) {
            title = page.og_title;
          }
          if (page.og_description) {
            description = page.og_description;
          }
          if (page.og_image) {
            ogImage = page.og_image;
          }
        }
      }
    } catch (error) {
      console.error('Errore nel recupero dei metadati:', error);
      // Usa i valori di default in caso di errore
    }

    // Se non c'è un'immagine Open Graph, usa quella di default
    const images = ogImage
      ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
      : [{ url: `https://${hostname}/og-image.jpg`, width: 1200, height: 630, alt: title }];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: fullUrl,
        siteName: subdomain,
        type: 'website',
        locale: 'it_IT',
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage || `https://${hostname}/og-image.jpg`],
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
      siteName: 'Opero Cloud',
      type: 'website',
      locale: 'it_IT',
      images: [
        {
          url: `${fullUrl}/og-image.jpg`,
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
