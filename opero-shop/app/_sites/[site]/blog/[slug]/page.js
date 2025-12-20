/**
 * Nome File: page.js
 * Percorso: opero-shop/app/_sites/[site]/blog/[slug]/page.js
 * Data: 18/12/2025
 * Descrizione: Pagina dettaglio articolo del blog con supporto PDF Viewer
 */

import { notFound } from 'next/navigation';
import { BLOCK_REGISTRY } from '../../../../components/BlockRegistry';

export default async function BlogPostPage({ params, searchParams }) {
  try {
    const { site, slug } = await params;

    // 1. Fetch dati del sito e dell'articolo
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/shop/${site}/blog/post/${slug}`, {
      cache: 'no-store', // Disable caching for fresh data
    });

    if (!response.ok) {
      return notFound();
    }

    const data = await response.json();

    if (!data.success || !data.post) {
      return notFound();
    }

    const { post, siteConfig } = data;

    // 2. Recupera layout dinamico del template
    const Layout = (await import(`../../../../components/templates/${siteConfig.template_code}/Layout.js`)).default;

    // 3. Componente BlogPostContent
    function BlogPostContent() {
      // Formatta data
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      };

      return (
        <article className="max-w-4xl mx-auto">
          {/* Header articolo */}
          <header className="mb-8">
            {/* Breadcrumb */}
            <nav className="text-sm mb-6">
              <ol className="flex items-center space-x-2 text-gray-600">
                <li>
                  <a href="/" className="hover:text-blue-600">Home</a>
                </li>
                <li>/</li>
                <li>
                  <a href="/blog" className="hover:text-blue-600">Blog</a>
                </li>
                <li>/</li>
                <li className="text-gray-900 font-medium">{post.titolo}</li>
              </ol>
            </nav>

            {/* Titolo */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.titolo}
            </h1>

            {/* Meta informazioni */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              {post.data_pubblicazione && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(post.data_pubblicazione)}
                </span>
              )}

              {post.autore && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {post.autore}
                </span>
              )}

              {post.categoria_nome && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: post.categoria_colore || '#2563eb' }}
                >
                  {post.categoria_nome}
                </span>
              )}

              {post.pdf_url && (
                <span className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                  Documento PDF
                </span>
              )}

              {post.visualizzazioni > 0 && (
                <span className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {post.visualizzazioni} visualizzazioni
                </span>
              )}
            </div>

            {/* Descrizione breve */}
            {post.descrizione_breve && (
              <div className="text-lg text-gray-600 leading-relaxed mb-8 italic">
                {post.descrizione_breve}
              </div>
            )}
          </header>

          {/* Contenuto principale */}
          <div className="prose prose-lg max-w-none">
            {(post.pdf_url || (post.allegati && post.allegati.length > 0)) ? (
              /* PDF Viewer */
              <div className="w-full">
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-blue-800 font-medium">Documento PDF: {
                        (() => {
                          const pdfAllegato = post.allegati && post.allegati.find(a =>
                            a.mime_type === 'application/pdf' ||
                            (a.file_name_originale && a.file_name_originale.toLowerCase().endsWith('.pdf'))
                          );
                          return pdfAllegato?.file_name_originale || post.pdf_filename;
                        })()
                      }</span>
                    </div>
                    <a
                      href={
                        (() => {
                          const pdfAllegato = post.allegati && post.allegati.find(a =>
                            a.mime_type === 'application/pdf' ||
                            (a.file_name_originale && a.file_name_originale.toLowerCase().endsWith('.pdf'))
                          );
                          return pdfAllegato?.previewUrl || post.pdf_url;
                        })()
                      }
                      download={
                        (() => {
                          const pdfAllegato = post.allegati && post.allegati.find(a =>
                            a.mime_type === 'application/pdf' ||
                            (a.file_name_originale && a.file_name_originale.toLowerCase().endsWith('.pdf'))
                          );
                          return pdfAllegato?.file_name_originale || post.pdf_filename;
                        })()
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Scarica PDF
                    </a>
                  </div>
                </div>

                {/* PDF Viewer with controls */}
                <div className="w-full">
                  {/* Controls bar */}
                  <div className="bg-gray-50 border border-gray-200 rounded-t-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        PDF Viewer
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Download button - only show if PDF is downloadable */}
                      {post.pdf_downloadable && (
                        <a
                          href={
                            (() => {
                              const pdfAllegato = post.allegati && post.allegati.find(a =>
                                a.mime_type === 'application/pdf' ||
                                (a.file_name_originale && a.file_name_originale.toLowerCase().endsWith('.pdf'))
                              );
                              return pdfAllegato?.previewUrl || post.pdf_url;
                            })()
                          }
                          download={
                            (() => {
                              const pdfAllegato = post.allegati && post.allegati.find(a =>
                                a.mime_type === 'application/pdf' ||
                                (a.file_name_originale && a.file_name_originale.toLowerCase().endsWith('.pdf'))
                              );
                              return pdfAllegato?.file_name_originale || post.pdf_filename;
                            })()
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download PDF
                        </a>
                      )}

                      {/* Open in new tab button */}
                      <a
                        href={
                          (() => {
                            const pdfAllegato = post.allegati && post.allegati.find(a =>
                              a.mime_type === 'application/pdf' ||
                              (a.file_name_originale && a.file_name_originale.toLowerCase().endsWith('.pdf'))
                            );
                            return pdfAllegato?.previewUrl || post.pdf_url;
                          })()
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Apri in nuova finestra
                      </a>
                    </div>
                  </div>

                  {/* PDF Viewer iframe */}
                  <div className="bg-white border border-gray-200 rounded-b-lg shadow-lg overflow-hidden">
                    <iframe
                      src={
                        (() => {
                          const pdfAllegato = post.allegati && post.allegati.find(a =>
                            a.mime_type === 'application/pdf' ||
                            (a.file_name_originale && a.file_name_originale.toLowerCase().endsWith('.pdf'))
                          );
                          return `${pdfAllegato?.previewUrl || post.pdf_url}#toolbar=1&navpanes=1&scrollbar=1`;
                        })()
                      }
                      className="w-full h-96 lg:h-screen max-h-4xl"
                      style={{ height: '600px' }}
                      title={`PDF Viewer - ${post.titolo}`}
                      frameBorder="0"
                    />
                  </div>
                </div>

                {/* Fallback link per dispositivi mobile */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Se il PDF non è visibile,{' '}
                    <a
                      href={
                        (() => {
                          const pdfAllegato = post.allegati && post.allegati.find(a =>
                            a.mime_type === 'application/pdf' ||
                            (a.file_name_originale && a.file_name_originale.toLowerCase().endsWith('.pdf'))
                          );
                          return pdfAllegato?.previewUrl || post.pdf_url;
                        })()
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      aprilo in una nuova finestra
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              /* Contenuto HTML */
              <div
                dangerouslySetInnerHTML={{ __html: post.contenuto_html }}
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-pink-600 prose-pre:bg-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-a:text-blue-600 prose-a:hover:text-blue-700 prose-img:rounded-lg prose-img:shadow-md"
              />
            )}
          </div>

          {/* Articoli correlati */}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <section className="mt-16 pt-16 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Articoli correlati</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {post.relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {relatedPost.copertina_url && (
                      <div className="h-48 bg-gray-200">
                        <img
                          src={relatedPost.copertina_url}
                          alt={relatedPost.titolo}
                          className="w-full h-full object-cover"
                        />
                        {relatedPost.pdf_url && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                            PDF
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                        <a
                          href={`/blog/${relatedPost.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedPost.titolo}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {formatDate(relatedPost.data_pubblicazione)}
                      </p>
                      {relatedPost.descrizione_breve && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {relatedPost.descrizione_breve}
                        </p>
                      )}
                      <a
                        href={`/blog/${relatedPost.slug}`}
                        className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm"
                      >
                        {relatedPost.pdf_url ? 'Leggi il PDF' : 'Leggi tutto'}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Back to blog */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <a
              href="/blog"
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Torna al blog
            </a>
          </div>
        </article>
      );
    }

    // Apply theme styles including block background color
    const themeStyles = {
      '--primary-color': siteConfig.colors.primary || '#000000',
      '--secondary-color': siteConfig.colors.secondary || '#ffffff',
      '--background-color': siteConfig.colors.background || '#ffffff',
      '--block-background-color': siteConfig.colors.blockBackground || '#ffffff',
    };

    return (
      <div style={themeStyles}>
        <Layout siteConfig={siteConfig} page={{ title: post.titolo, description: post.meta_descrizione || post.descrizione_breve }}>
          <BlogPostContent />
        </Layout>
      </div>
    );
  } catch (error) {
    console.error('Blog Post Page Error:', error);
    return notFound();
  }
}