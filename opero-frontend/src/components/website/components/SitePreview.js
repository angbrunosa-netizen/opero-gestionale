/**
 * SitePreview Component
 * Componente per visualizzare l'anteprima del sito web basato sui template
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
  EyeIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  XMarkIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const SitePreview = ({ site, pages, onClose }) => {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [currentPage, setCurrentPage] = useState(pages[0] || null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug log quando il componente monta
  useEffect(() => {
    console.log('🎯 SitePreview MOUNTED', {
      site: site?.id,
      pagesCount: pages?.length,
      firstPage: pages[0]?.slug
    });
  }, []);

  // Carica l'anteprima HTML dal backend quando cambia la pagina
  useEffect(() => {
    console.log('🎯 SitePreview useEffect triggered', {
      currentPage: currentPage?.slug,
      siteId: site?.id,
      hasCurrentPage: !!currentPage,
      hasSiteId: !!site?.id
    });

    if (currentPage && site?.id) {
      loadPreviewHtml();
    }
  }, [currentPage, site?.id]);

  const loadPreviewHtml = async () => {
    if (!currentPage?.slug || !site?.id) {
      console.log('❌ SitePreview: missing data', {
        hasSlug: !!currentPage?.slug,
        hasSiteId: !!site?.id
      });
      return;
    }

    console.log('🔥 SitePreview: INIZIO caricamento preview', {
      slug: currentPage.slug,
      siteId: site.id,
      url: `/api/website/${site.id}/preview/${currentPage.slug}`
    });

    try {
      setLoading(true);
      setError('');

      // Chiama l'endpoint di anteprima del backend
      const response = await fetch(`/api/website/${site.id}/preview/${currentPage.slug}`);

      console.log('🔥 SitePreview: response status', response.status);
      console.log('🔥 SitePreview: response headers', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ SitePreview: error response body', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Ottieni l'HTML di risposta
      const html = await response.text();
      console.log('🔥 SitePreview: HTML ricevuto, length:', html.length);
      console.log('🔥 SitePreview: HTML preview:', html.substring(0, 200) + '...');

      setPreviewHtml(html);

    } catch (error) {
      console.error('❌ SitePreview: Errore caricamento anteprima:', error);
      setError(`Impossibile caricare l'anteprima: ${error.message}`);
      setPreviewHtml(null);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section) => {
    const { type, content } = section;

    switch (type) {
      case 'content':
        return renderContentSection(section);
      case 'media':
        return renderMediaSection(section);
      case 'contact':
        return renderContactSection(section);
      case 'social':
        return renderSocialSection(section);
      default:
        return <div>Section type {type} not implemented</div>;
    }
  };

  const renderContentSection = (section) => {
    const { content } = section;

    if (section.id === 'hero') {
      const sectionStyle = {};

      // Background image con fallback al colore
      if (content.background_image?.previewUrl) {
        sectionStyle.backgroundImage = `url(${content.background_image.previewUrl})`;
        sectionStyle.backgroundSize = 'cover';
        sectionStyle.backgroundPosition = 'center';
        sectionStyle.backgroundRepeat = 'no-repeat';
      } else {
        sectionStyle.backgroundColor = content.background_color || '#3B82F6';
      }

      return (
        <section
          className="relative py-20 px-6 text-center text-white"
          style={sectionStyle}
        >
          {/* Overlay per migliore leggibilità quando c'è l'immagine di sfondo */}
          {content.background_image?.previewUrl && (
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          )}

          <div className="relative max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {content.title || 'Titolo Hero'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {content.subtitle || 'Sottotitolo Hero'}
            </p>
            {content.cta_text && (
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                {content.cta_text}
              </button>
            )}
          </div>
        </section>
      );
    }

    if (section.id === 'about') {
      return (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {content.title || 'Chi Siamo'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.subtitle || 'La nostra storia'}
              </p>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
              content.layout === 'text-right' ? 'lg:grid-flow-col-dense' : ''
            }`}>
              {/* Testo */}
              <div className={content.layout === 'text-right' ? 'lg:col-start-2' : ''}>
                <div
                  className="prose prose-lg text-gray-700"
                  dangerouslySetInnerHTML={{ __html: content.content || '<p>Contenuto della sezione Chi Siamo.</p>' }}
                />
              </div>

              {/* Immagine */}
              {content.image?.previewUrl && (
                <div className={content.layout === 'text-right' ? 'lg:col-start-1' : ''}>
                  <img
                    src={content.image.previewUrl}
                    alt={content.image.file_name_originale || 'Azienda'}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (section.id === 'services') {
      const sectionStyle = {};

      // Background image per la sezione services
      if (content.background_image?.previewUrl) {
        sectionStyle.backgroundImage = `url(${content.background_image.previewUrl})`;
        sectionStyle.backgroundSize = 'cover';
        sectionStyle.backgroundPosition = 'center';
        sectionStyle.backgroundRepeat = 'no-repeat';
        sectionStyle.backgroundAttachment = 'fixed';
      }

      return (
        <section className="py-16 px-6 bg-white relative" style={sectionStyle}>
          {/* Overlay per migliorare leggibilità con immagine di sfondo */}
          {content.background_image?.previewUrl && (
            <div className="absolute inset-0 bg-white bg-opacity-90"></div>
          )}

          <div className="relative max-w-6xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {content.title || 'I Nostri Servizi'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.subtitle || 'Scopri le nostre soluzioni'}
            </p>
          </div>

          {content.services && (
            <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.services.map((service, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          )}

          {content.content && (
            <div className="relative max-w-4xl mx-auto mt-12">
              <div
                className="prose prose-lg text-gray-700"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </div>
          )}

          {content.cta_text && (
            <div className="relative text-center mt-8">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                {content.cta_text}
              </button>
            </div>
          )}
        </section>
      );
    }

    return (
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {content.title || 'Titolo'}
          </h2>
          {content.subtitle && (
            <p className="text-xl text-gray-600 mb-6">
              {content.subtitle}
            </p>
          )}
          {content.content && (
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          )}
        </div>
      </section>
    );
  };

  const renderMediaSection = (section) => {
    const { content } = section;

    return (
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {content.title || 'Galleria'}
            </h2>
            <p className="text-xl text-gray-600">
              {content.subtitle || 'Le nostre immagini'}
            </p>
          </div>

          {content.images && content.images.length > 0 ? (
            <div className={`grid gap-4 ${
              content.layout === 'grid-2' ? 'grid-cols-1 md:grid-cols-2' :
              content.layout === 'grid-3' ? 'grid-cols-1 md:grid-cols-3' :
              content.layout === 'grid-4' ? 'grid-cols-1 md:grid-cols-4' :
              'grid-cols-1 md:grid-cols-3'
            }`}>
              {content.images.slice(0, 8).map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.previewUrl || '/placeholder-image.jpg'}
                    alt={image.alt_text || image.file_name_originale}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-sm">
                      {image.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mt-2 text-gray-600">Nessuna immagine caricata</p>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderContactSection = (section) => {
    const { content } = section;

    return (
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {content.title || 'Contattaci'}
            </h2>
            <p className="text-xl text-gray-600">
              {content.subtitle || 'Siamo a tua disposizione'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              {content.show_form && (
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Invia un messaggio
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Il tuo nome"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                    <input
                      type="email"
                      placeholder="La tua email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                    <textarea
                      rows={4}
                      placeholder="Il tuo messaggio"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                    <button
                      className="w-full bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      disabled
                    >
                      Invia Messaggio
                    </button>
                  </div>
                </div>
              )}
            </div>

            {content.show_map && (
              <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-600">Mappa Google Maps</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {site?.indirizzo_sede || 'Indirizzo non configurato'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderSocialSection = (section) => {
    const { content } = section;

    if (!content.enabled) return null;

    return (
      <section className="py-8 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4">Condividi questa pagina</h3>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
              Facebook
            </button>
            <button className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg transition">
              Twitter
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition">
              LinkedIn
            </button>
            <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition">
              WhatsApp
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderPage = () => {
    if (!currentPage) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Nessuna pagina da visualizzare</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">
              Crea una pagina prima
            </button>
          </div>
        </div>
      );
    }

    // Parse template sections from page content
    let sections = [];
    let hasTemplateContent = false;

    try {
      if (currentPage.contenuto_json) {
        const parsed = JSON.parse(currentPage.contenuto_json);
        sections = parsed.sections || [];
        hasTemplateContent = sections.length > 0;
      } else if (currentPage.contenuto_html) {
        // Controlla se il contenuto_html contiene JSON invece di HTML
        try {
          const parsed = JSON.parse(currentPage.contenuto_html);
          sections = parsed.sections || [];
          hasTemplateContent = sections.length > 0;
        } catch (e) {
          // Se non è JSON, è HTML normale
          console.log('Contenuto HTML normale rilevato');
        }
      }
    } catch (e) {
      console.log('Errore parsing contenuto pagina:', e);
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  {site?.ragione_sociale || 'Nome Azienda'}
                </h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                {pages.filter(p => p.is_published).map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(page)}
                    className={`text-sm font-medium transition ${
                      currentPage.id === page.id
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {page.titolo}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {hasTemplateContent && sections.length > 0 ? (
            sections.map((section, index) => (
              <div key={index}>
                {renderSection(section)}
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              {/* Hero section per pagine senza template */}
              <div className="bg-blue-600 text-white py-20 px-6 -mt-16 mb-20">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    {currentPage.titolo || 'Pagina Sito'}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90">
                    {currentPage.meta_description || 'Descrizione della pagina'}
                  </p>
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                {currentPage.contenuto_html ? (
                  <div
                    className="prose prose-lg text-gray-700 text-left"
                    dangerouslySetInnerHTML={{ __html: currentPage.contenuto_html }}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
                    <p className="text-gray-600 mb-4">Contenuto della pagina in fase di configurazione.</p>
                    <p className="text-sm text-gray-500">
                      Usa l'editor di pagine per aggiungere contenuti e template.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-gray-400">
                © 2025 {site?.ragione_sociale || 'Nome Azienda'}. Tutti i diritti riservati.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Creato con Opero Cloud
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  const getPreviewClass = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-md mx-auto';
      case 'tablet':
        return 'max-w-3xl mx-auto';
      default:
        return '';
    }
  };

  const getPreviewHeight = () => {
    return previewMode === 'mobile' ? 'h-[800px]' : 'h-full';
  };

  // FORZA un render di debug per vedere se il componente monta
  console.log('🔥🔥 SitePreview: RENDERING!', {
    siteId: site?.id,
    pagesCount: pages?.length,
    currentPageSlug: currentPage?.slug,
    hasPreviewHtml: !!previewHtml
  });

  return (
    <div
      className="fixed inset-0 bg-white z-50 flex flex-col"
      style={{ zIndex: 999999 }}
    >
      {/* DEBUG HEADER VISIBILE */}
      <div className="bg-red-600 text-white p-4">
        <h2>DEBUG SITE PREVIEW - SEI VEDENDO QUESTO?</h2>
        <p>Site ID: {site?.id}</p>
        <p>Pagine: {pages?.length}</p>
        <p>Pagina corrente: {currentPage?.slug}</p>
        <p>Loading: {loading ? 'SI' : 'NO'}</p>
        <p>Error: {error || 'NESSUNO'}</p>
        <p>Preview HTML: {previewHtml ? 'CARICATO' : 'NON CARICATO'}</p>
      </div>

      {/* Header Controls */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">
              Anteprima: {site?.ragione_sociale || 'Sito Web'}
            </h3>

            {/* Page Selector */}
            <select
              value={currentPage?.id || ''}
              onChange={(e) => setCurrentPage(pages.find(p => p.id === parseInt(e.target.value)))}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              {pages.filter(p => p.is_published).map((page) => (
                <option key={page.id} value={page.id}>
                  {page.titolo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {/* Device Mode Buttons */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded transition ${
                  previewMode === 'desktop' ? 'bg-white text-gray-800' : 'text-gray-300 hover:text-white'
                }`}
                title="Desktop"
              >
                <ComputerDesktopIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded transition ${
                  previewMode === 'tablet' ? 'bg-white text-gray-800' : 'text-gray-300 hover:text-white'
                }`}
                title="Tablet"
              >
                <div className="h-4 w-4 bg-current"></div>
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded transition ${
                  previewMode === 'mobile' ? 'bg-white text-gray-800' : 'text-gray-300 hover:text-white'
                }`}
                title="Mobile"
              >
                <DevicePhoneMobileIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              className="flex items-center px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
              title="Aggiorna anteprima"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>

            {currentPage && (
              <a
                href={`https://${site?.subdomain}.operocloud.it/${currentPage.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition"
                title="Apri in nuova finestra"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            )}

            <button
              onClick={onClose}
              className="flex items-center px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
            >
              <XMarkIcon className="h-4 w-4" />
              Chiudi
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        <div className={`bg-white shadow-lg ${getPreviewClass()} ${getPreviewHeight()}`}>
          <div className="bg-gray-200 text-xs text-center py-1 flex items-center justify-between px-4">
            <span>
              {previewMode === 'mobile' ? '📱 Mobile View' :
               previewMode === 'tablet' ? '📱 Tablet View' :
               '🖥️ Desktop View'}
            </span>

            {loading && (
              <span className="text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 inline-block mr-1"></div>
                Caricamento...
              </span>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-3">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={loadPreviewHtml}
                className="mt-2 text-red-600 underline text-sm hover:text-red-800"
              >
                Riprova
              </button>
            </div>
          )}

          {/* DEBUG AREA */}
          <div className="bg-yellow-100 border-b border-yellow-300 p-4">
            <h3 className="font-bold mb-2">DEBUG AREA</h3>
            <p>PreviewHtml length: {previewHtml?.length || 0}</p>
            <p>HTML Preview: {previewHtml ? previewHtml.substring(0, 100) + '...' : 'NULL'}</p>
            <button
              onClick={() => console.log('HTML completo:', previewHtml)}
              className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
            >
              Log HTML completo
            </button>
          </div>

          {/* Mostra l'HTML dal backend se disponibile, altrimenti usa il render locale */}
          {previewHtml ? (
            <div className="h-full overflow-auto" style={{ height: '500px', border: '2px solid green' }}>
              <h3 className="bg-green-500 text-white p-2">IFRAME CON HTML DAL BACKEND</h3>
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Anteprima pagina"
                sandbox="allow-same-origin allow-scripts"
                onLoad={() => console.log('🎯 iframe loaded successfully')}
                onError={(e) => console.error('❌ iframe error:', e)}
              />
            </div>
          ) : (
            <div className="h-full" style={{ height: '500px', border: '2px solid orange' }}>
              <h3 className="bg-orange-500 text-white p-2">FALLBACK RENDER LOCALE</h3>
              {!loading && !error && renderPage()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitePreview;