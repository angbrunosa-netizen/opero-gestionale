/**
 * Nome File: page.js (Blog Post Detail - Root Level)
 * Percorso: opero-shop/app/blog/[slug]/page.js
 * Descrizione: Blog post detail page with support for multi-tenant routing
 */

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import StandardLayout from '../../../components/templates/Standard/Layout';
import PDFViewer from '../../../components/PDFViewer';

// Funzione per estrarre slug del sito e del post
async function getSiteAndPostSlug() {
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

// Metadata dinamici per SEO
export async function generateMetadata({ params }) {
    const { siteSlug } = await getSiteAndPostSlug();
    const resolvedParams = await params;
    const postSlug = resolvedParams.slug;

    if (!siteSlug) {
        return {
            title: 'Blog Post Non Trovato',
            description: 'Impossibile identificare il sito'
        };
    }

    return {
        title: `${postSlug} | Blog`,
        description: `Articolo dal blog di ${siteSlug}`,
    };
}

// Componente principale della pagina
export default async function BlogPostPage({ params }) {
    const { siteSlug } = await getSiteAndPostSlug();
    const resolvedParams = await params;
    const postSlug = resolvedParams.slug;

    console.log(`🚀 BlogPostPage: site=${siteSlug}, post=${postSlug}`);

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

    // Fetch dei dati del sito e del post
    const [siteConfigResponse, response] = await Promise.all([
        fetch(`/api/public/shop/${siteSlug}/config`, {
            cache: 'no-store',
        }),
        fetch(`/api/public/shop/${siteSlug}/blog/post/${postSlug}`, {
            cache: 'no-store',
        })
    ]);

    // Recupera siteConfig con fallback
    let siteConfig = {
        nome: siteSlug,
        colors: {
            primary: '#06215b',
            secondary: '#1e40af',
            blockBackground: '#ffffff',
            headerBackground: '#ffffff',
            headerText: '#333333',
            logoPosition: 'left'
        },
        navigation: [
            { slug: 'home', titolo_seo: 'Home' },
            { slug: 'chi-siamo', titolo_seo: 'Chi Siamo' },
            { slug: 'blog', titolo_seo: 'Blog' }
        ]
    };

    if (siteConfigResponse.ok) {
        const siteData = await siteConfigResponse.json();
        if (siteData.success) {
            siteConfig = siteData.siteConfig;
            // Assicurati che Blog sia nel menu di navigazione
            const hasBlog = siteConfig.navigation.find(item => item.slug === 'blog');
            if (!hasBlog) {
                siteConfig.navigation.push({ slug: 'blog', titolo_seo: 'Blog' });
            }
        }
    }

    if (!response.ok) {
        console.log(`❌ Response non OK: ${response.status} ${response.statusText}`);
        notFound();
    }

    const data = await response.json();

    if (!data.success) {
        console.log(`❌ Post "${postSlug}" non trovato per il sito "${siteSlug}"`);
        notFound();
    }

    const { post, relatedPosts } = data;

    // Componente contenuto del post del blog
    const blogPostContent = (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            {/* Breadcrumb */}
            <nav style={{ marginBottom: '2rem' }}>
                <ol style={{ display: 'flex', listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#666' }}>
                    <li><a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</a></li>
                    <li style={{ margin: '0 0.5rem' }}>/</li>
                    <li><a href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</a></li>
                    <li style={{ margin: '0 0.5rem' }}>/</li>
                    <li style={{ fontWeight: 'bold', color: '#333' }}>{post.titolo}</li>
                </ol>
            </nav>

            <article>
                <header>
                    <h1>{post.titolo}</h1>
                    <p><em>Di {post.autore} • {new Date(post.data_pubblicazione).toLocaleDateString('it-IT')}</em></p>
                </header>

                {post.copertina_url && (
                    <div style={{ margin: '2rem 0' }}>
                        <img
                            src={post.copertina_url}
                            alt={post.copertina_alt || post.titolo}
                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                    </div>
                )}

                {post.descrizione_breve && (
                    <div style={{
                        background: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '8px',
                        margin: '2rem 0',
                        fontStyle: 'italic'
                    }}>
                        {post.descrizione_breve}
                    </div>
                )}

                {post.contenuto && (
                    <div
                        dangerouslySetInnerHTML={{ __html: post.contenuto }}
                        style={{
                            lineHeight: '1.6',
                            margin: '2rem 0'
                        }}
                    />
                )}

                {post.pdf_url && (
                    <PDFViewer pdfUrl={post.pdf_url} pdfFilename={post.pdf_filename} />
                )}

                {relatedPosts && relatedPosts.length > 0 && (
                    <div style={{ marginTop: '3rem' }}>
                        <h3>Articoli Correlati</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {relatedPosts.map((relatedPost) => (
                                <div key={relatedPost.slug} style={{
                                    border: '1px solid #ddd',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    background: '#f8f9fa'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>
                                        <a
                                            href={`/blog/${relatedPost.slug}`}
                                            style={{ textDecoration: 'none', color: '#007bff' }}
                                        >
                                            {relatedPost.titolo}
                                        </a>
                                    </h4>
                                    {relatedPost.descrizione_breve && (
                                        <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                                            {relatedPost.descrizione_breve}
                                        </p>
                                    )}
                                    {relatedPost.data_pubblicazione && (
                                        <small style={{ color: '#999' }}>
                                            {new Date(relatedPost.data_pubblicazione).toLocaleDateString('it-IT')}
                                        </small>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );

    return (
        <StandardLayout siteConfig={siteConfig} slug={siteSlug}>
            {blogPostContent}
        </StandardLayout>
    );
}