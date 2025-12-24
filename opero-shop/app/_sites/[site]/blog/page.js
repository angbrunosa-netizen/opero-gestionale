/**
 * Nome File: page.js
 * Percorso: opero-shop/app/_sites/[site]/blog/page.js
 * Data: 18/12/2025
 * Descrizione: Pagina archivio blog che mostra tutti gli articoli con paginazione e filtri
 */

import { notFound } from 'next/navigation';
import { BLOCK_REGISTRY } from '../../../../components/BlockRegistry';

export default async function BlogArchivePage({ params, searchParams }) {
  try {
    const { site } = await params;
    const { category, page = 1, limit = 9 } = await searchParams;

    // 1. Fetch dati del sito e articoli
    const [siteResponse, postsResponse, categoriesResponse] = await Promise.all([
      // Dati sito
      fetch(`/api/public/shop/${site}/config`, {
        cache: 'no-store',
      }),
      // Articoli blog
      fetch(`/api/public/shop/${site}/blog/posts?limit=${limit}&page=${page}${category ? `&category=${category}` : ''}`, {
        cache: 'no-store',
      }),
      // Categorie
      fetch(`/api/public/shop/${site}/blog/categories`, {
        cache: 'no-store',
      }),
    ]);

    if (!siteResponse.ok) {
      return notFound();
    }

    const siteData = await siteResponse.json();

    if (!siteData.success) {
      return notFound();
    }

    const { siteConfig } = siteData;

    // Mapping template_code -> nome cartella corretto
    const templateMap = {
      'standard': 'Standard',
      'fashion': 'Fashion',
      'industrial': 'Industrial',
      'default': 'Standard'
    };

    const templateFolder = templateMap[siteConfig.template_code] || 'Standard';

    // Recupera layout dinamico
    const Layout = (await import(`../../../../components/templates/${templateFolder}/Layout.js`)).default;

    // Componente BlogArchiveContent
    function BlogArchiveContent() {
      // Dati statici per il componente
      const posts = postsResponse.ok ? (await postsResponse.json())?.success ? (await postsResponse.json()).posts : [] : [];
      const categories = categoriesResponse.ok ? (await categoriesResponse.json())?.success ? (await categoriesResponse.json()).categories : [] : [];
      const totalPages = postsResponse.ok ? (await postsResponse.json())?.totalPages || 1 : 1;

      const currentPage = parseInt(page);

      // Formatta data
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      };

      // Componente card articolo
      const PostCard = ({ post }) => (
        <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {/* Immagine copertina */}
          {post.copertina_url && (
            <div className="relative h-48 bg-gray-200">
              <img
                src={post.copertina_url}
                alt={post.titolo}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              {/* Badge categoria */}
              {post.categoria_nome && (
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: post.categoria_colore || '#2563eb' }}
                >
                  {post.categoria_nome}
                </div>
              )}

              {/* Badge PDF */}
              {post.pdf_url && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                  PDF
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            {/* Titolo */}
            <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
              <a
                href={`/blog/${post.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {post.titolo}
              </a>
            </h3>

            {/* Meta informazioni */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.data_pubblicazione)}
              </span>

              {post.autore && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {post.autore}
                </span>
              )}
            </div>

            {/* Descrizione breve */}
            {post.descrizione_breve && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.descrizione_breve}
              </p>
            )}

            {/* Link leggi tutto */}
            <a
              href={`/blog/${post.slug}`}
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              {post.pdf_url ? 'Leggi il PDF' : 'Leggi tutto'}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </article>
      );

      // Paginazione
      const Pagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }

        return (
          <div className="flex justify-center items-center space-x-2 mt-8">
            {currentPage > 1 && (
              <a
                href={`/blog?page=${currentPage - 1}${category ? `&category=${category}` : ''}`}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
            )}

            {pages.map((pageNum) => (
              <a
                key={pageNum}
                href={`/blog?page=${pageNum}${category ? `&category=${category}` : ''}`}
                className={`px-3 py-2 rounded-md transition-colors ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </a>
            ))}

            {currentPage < totalPages && (
              <a
                href={`/blog?page=${currentPage + 1}${category ? `&category=${category}` : ''}`}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        );
      };

      return (
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Blog & News
            </h1>
            <p className="text-xl text-gray-600">
              Scopri le ultime novità, articoli e approfondimenti
            </p>
          </header>

          {/* Filtri categorie */}
          {categories.length > 0 && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Filtra per categoria</h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/blog"
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tutti gli articoli
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                    {posts.length}
                  </span>
                </a>
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/blog?category=${cat.slug}`}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      category === cat.slug
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: category === cat.slug ? cat.colore : undefined,
                    }}
                  >
                    {cat.nome}
                    <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                      {cat.posts_count}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Lista articoli */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun articolo trovato</h3>
              <p className="text-gray-600">
                {category
                  ? 'Nessun articolo trovato in questa categoria.'
                  : 'Nessun articolo pubblicato al momento.'}
              </p>
              {category && (
                <a
                  href="/blog"
                  className="inline-flex items-center mt-4 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Vedi tutti gli articoli
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Paginazione */}
          <Pagination />
        </div>
      );
    }

    // Apply theme styles including block background color
    const themeStyles = {
      '--primary-color': siteConfig.colors.primary || '#000000',
      '--secondary-color': siteConfig.colors.secondary || '#ffffff',
      '--background-color': siteConfig.colors.background || '#ffffff',
      '--block-background-color': siteConfig.colors.blockBackground || '#ffffff',
    };

    // Debug: verifica i valori delle variabili CSS nella pagina blog
    console.log('🎨 DEBUG CSS Variables - blog/page.js:');
    console.log('  siteConfig.colors:', siteConfig.colors);
    console.log('  siteConfig.colors.blockBackground:', siteConfig.colors.blockBackground);
    console.log('  --block-background-color value:', themeStyles['--block-background-color']);

    return (
      <div style={themeStyles}>
        <Layout siteConfig={siteConfig} page={{ title: 'Blog & News', description: 'Scopri le ultime novità e approfondimenti sul nostro blog' }}>
          <BlogArchiveContent />
        </Layout>
      </div>
    );
  } catch (error) {
    console.error('Blog Archive Page Error:', error);
    return notFound();
  }
}