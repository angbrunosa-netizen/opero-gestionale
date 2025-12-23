/**
 * Nome File: page.js (Blog Listing - Root Level)
 * Percorso: opero-shop/app/blog/page.js
 * Descrizione: Blog listing page with support for multi-tenant routing
 */

import { headers } from 'next/headers';
import StandardLayout from '../../components/templates/Standard/Layout';

// Funzione per estrarre slug del sito
async function getSiteSlug() {
    const headersList = await headers();
    let hostname = headersList.get('host') || '';
    hostname = hostname.split(':')[0]; // Rimuovi porta per sviluppo locale

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";

    // Estrai site slug dal subdomain
    let siteSlug = null;
    if (hostname.includes(rootDomain) && hostname !== rootDomain) {
        siteSlug = hostname.replace(`.${rootDomain}`, "");
    }

    return { siteSlug };
}

// Fetch delle categorie del blog
async function getBlogCategories(siteSlug) {
    if (!siteSlug) return { categories: [] };

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/public/shop/${siteSlug}/blog/categories`;

    try {
        console.log(`🔍 Fetching blog categories: ${apiUrl}`);
        const res = await fetch(apiUrl, { cache: 'no-store' });

        if (!res.ok) {
            console.log(`❌ Response non OK: ${res.status} ${res.statusText}`);
            return { categories: [] };
        }

        const data = await res.json();
        console.log(`✅ Blog categories received:`, data.categories?.length || 0);
        return data;

    } catch (error) {
        console.error("💥 Errore fetch blog categories:", error);
        return { categories: [] };
    }
}

// Fetch della configurazione del sito
async function getSiteConfig(siteSlug) {
    if (!siteSlug) {
        return {
            nome: siteSlug,
            colors: {
                primary: '#06215b',
                secondary: '#1e40af',
                blockBackground: '#ffffff',
                headerBackground: '#ffffff',
                headerText: '#333333',
                logoPosition: 'left'
            }
        };
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/public/shop/${siteSlug}/config`;

    try {
        console.log(`🔍 Fetching site config: ${apiUrl}`);
        const res = await fetch(apiUrl, { cache: 'no-store' });

        if (!res.ok) {
            console.log(`❌ Site config response non OK: ${res.status} ${res.statusText}`);
            // Fallback config
            return {
                nome: siteSlug,
                colors: {
                    primary: '#06215b',
                    secondary: '#1e40af',
                    blockBackground: '#ffffff',
                    headerBackground: '#ffffff',
                    headerText: '#333333',
                    logoPosition: 'left'
                }
            };
        }

        const data = await res.json();
        console.log(`✅ Site config received:`, data.siteConfig);
        return data;

    } catch (error) {
        console.error("💥 Errore fetch site config:", error);
        // Fallback config
        return {
            nome: siteSlug,
            colors: {
                primary: '#06215b',
                secondary: '#1e40af',
                blockBackground: '#ffffff',
                headerBackground: '#ffffff',
                headerText: '#333333',
                logoPosition: 'left'
            }
        };
    }
}

// Metadata dinamici per SEO
export async function generateMetadata() {
    const { siteSlug } = await getSiteSlug();

    if (!siteSlug) {
        return {
            title: 'Blog',
            description: 'Blog del sito'
        };
    }

    return {
        title: 'Blog',
        description: `Articoli e notizie dal blog di ${siteSlug}`,
        openGraph: {
            title: 'Blog',
            description: `Articoli e notizie dal blog di ${siteSlug}`,
            type: 'website',
        },
    };
}

// Componente principale della pagina
export default async function BlogListingPage({ searchParams }) {
    const { siteSlug } = await getSiteSlug();
    const resolvedParams = await searchParams;

    console.log(`🚀 BlogListingPage: site=${siteSlug}`);

    // Verifica che siteSlug sia presente
    if (!siteSlug) {
        console.log('❌ Nessun siteSlug trovato nell\'hostname');
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Sito Non Rilevato</h1>
                <p>Impossibile determinare il sito dalla richiesta corrente.</p>
                <p>Assicurati di accedere tramite un sottodominio valido (es. nome-sito.localhost:3000)</p>
            </div>
        );
    }

    // Fetch dei dati del sito e dei post del blog
    const [siteConfigData, postsResponse] = await Promise.all([
        getSiteConfig(siteSlug),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/shop/${siteSlug}/blog/posts?published=true`, {
            cache: 'no-store',
        })
    ]);

    // Usa siteConfig dinamico con fallback
    let siteConfig = siteConfigData.siteConfig || siteConfigData;

    // Definisci le variabili CSS per il tema
    const themeStyles = {
        '--primary-color': siteConfig.colors.primary || '#06215b',
        '--secondary-color': siteConfig.colors.secondary || '#1e40af',
        '--background-color': siteConfig.colors.background || '#ffffff',
        '--block-background-color': siteConfig.colors.blockBackground || '#ffffff',
        // Header personalization
        '--header-background-color': siteConfig.colors.headerBackground || '#ffffff',
        '--header-text-color': siteConfig.colors.headerText || '#333333',
    };

    // Header personalization implemented - debug removed

    
    const posts = postsResponse.ok ? (await postsResponse.json()).posts || [] : [];

    // Componente contenuto del blog
    const blogContent = (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Breadcrumb */}
            <nav style={{ marginBottom: '2rem' }}>
                <ol style={{ display: 'flex', listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#666' }}>
                    <li><a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</a></li>
                    <li style={{ margin: '0 0.5rem' }}>/</li>
                    <li style={{ fontWeight: 'bold', color: '#333' }}>Blog</li>
                </ol>
            </nav>

            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1>Blog</h1>
                <p>Articoli e notizie dal blog di {siteConfig.nome}</p>
            </header>

            {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>Nessun articolo trovato</h3>
                    <p>Torna presto per leggere nuovi articoli!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {posts.map((post) => (
                        <article key={post.slug} style={{
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {post.copertina_url && (
                                <div style={{ height: '200px', overflow: 'hidden' }}>
                                    <img
                                        src={post.copertina_url}
                                        alt={post.copertina_alt || post.titolo}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    {post.categoria_nome && (
                                        <span style={{
                                            background: post.categoria_colore || '#007bff',
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {post.categoria_nome}
                                        </span>
                                    )}
                                </div>

                                <h2 style={{ margin: '0 0 1rem 0' }}>
                                    <a
                                        href={`/blog/${post.slug}`}
                                        style={{
                                            textDecoration: 'none',
                                            color: '#333',
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        {post.titolo}
                                    </a>
                                </h2>

                                {post.descrizione_breve && (
                                    <p style={{
                                        margin: '0 0 1rem 0',
                                        color: '#666',
                                        lineHeight: '1.5'
                                    }}>
                                        {post.descrizione_breve}
                                    </p>
                                )}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.9rem',
                                    color: '#999'
                                }}>
                                    <span>Di {post.autore}</span>
                                    <time>
                                        {new Date(post.data_pubblicazione).toLocaleDateString('it-IT', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </time>
                                </div>

                                {(post.pdf_url || post.contenuto) && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <a
                                            href={`/blog/${post.slug}`}
                                            style={{
                                                display: 'inline-block',
                                                padding: '0.5rem 1rem',
                                                background: '#007bff',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: '4px',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Leggi l'articolo {post.pdf_url && '📄'}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div style={themeStyles}>
            <StandardLayout siteConfig={siteConfig} slug={siteSlug}>
                {blogContent}
            </StandardLayout>
        </div>
    );
}