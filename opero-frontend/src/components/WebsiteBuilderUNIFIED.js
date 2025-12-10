/**
 * @file WebsiteBuilderUNIFIED.js
 * @description Componente SEMPLIFICATO per generazione pagine da template
 * - Creazione pagine con sezioni predefinite
 * - Gestione componenti: Immagine, Blog, Maps, Social, Galleria
 * - Integrazione con Next.js per rendering finale
 * @version 3.0 - Semplificato per template generation
 */

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Import componenti semplificati
import TemplatePageBuilder from './website/builder/TemplatePageBuilder';
import { api } from '../services/api';

const WebsiteBuilderUNIFIED = ({
  site: initialSite,
  websiteId,
  onSave,
  onCancel,
  mode = 'create'
}) => {
  // Stati principali semplificati
  const [site, setSite] = useState(initialSite || {});
  const [activeView, setActiveView] = useState('template'); // 'template' | 'pages' | 'builder'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Stati per pagine
  const [pages, setPages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentBuilderTemplate, setCurrentBuilderTemplate] = useState(null);
  const [editingPage, setEditingPage] = useState(null);

  // Template predefiniti
  const templates = [
    {
      id: 'business-landing',
      name: 'Business Landing',
      description: 'Landing page professionale per aziende',
      icon: '🏢',
      sections: [
        {
          id: 'hero-1',
          type: 'image',
          data: {
            title: 'Scopri la Nostra Azienda',
            subtitle: 'Soluzioni innovative per il tuo business',
            description: 'Siamo leader nel settore da oltre 10 anni, offrendo servizi di alta qualità personalizzati per le esigenze dei nostri clienti.',
            layout: 'center',
            buttonText: 'Scopri di più',
            buttonUrl: '#contact',
            imageBorder: 'rounded',
            buttonStyle: 'primary'
          }
        },
        {
          id: 'services-1',
          type: 'blog',
          data: {
            title: 'I Nostri Servizi',
            layout: 'grid',
            postsToShow: 3,
            columns: 3,
            showAuthor: false,
            showDate: false,
            showReadTime: false,
            showMeta: false
          }
        },
        {
          id: 'gallery-1',
          type: 'gallery',
          data: {
            layout: 'grid',
            columns: 3,
            gap: 'medium',
            showCaptions: true,
            enableLightbox: true,
            transition: 'fade',
            images: []
          }
        },
        {
          id: 'contact-1',
          type: 'maps',
          data: {
            address: '',
            zoom: 15,
            height: '400px',
            showInfoWindow: true,
            markerTitle: 'La Nostra Sede',
            markerDescription: 'Vieni a trovarci!',
            mapStyle: 'default',
            markerColor: 'red'
          }
        },
        {
          id: 'social-1',
          type: 'social',
          data: {
            platforms: ['facebook', 'instagram', 'linkedin'],
            layout: 'horizontal',
            iconStyle: 'rounded',
            showFollowers: true,
            showFeed: false
          }
        }
      ]
    },
    {
      id: 'creative-portfolio',
      name: 'Portfolio Creativo',
      description: 'Portfolio per creativi e designer',
      icon: '🎨',
      sections: [
        {
          id: 'hero-2',
          type: 'gallery',
          data: {
            layout: 'carousel',
            images: [],
            autoplay: true,
            interval: 4000,
            showNavigation: true
          }
        },
        {
          id: 'blog-2',
          type: 'blog',
          data: {
            title: 'Ultimi Lavori',
            layout: 'masonry',
            postsToShow: 6,
            showAuthor: true,
            showDate: true,
            showMeta: true
          }
        },
        {
          id: 'social-2',
          type: 'social',
          data: {
            platforms: ['instagram', 'tiktok', 'youtube'],
            layout: 'grid',
            iconSize: 'large',
            showFeed: true
          }
        }
      ]
    },
    {
      id: 'local-business',
      name: 'Attività Locale',
      description: 'Pagina per negozi e attività locali',
      icon: '🏪',
      sections: [
        {
          id: 'hero-3',
          type: 'image',
          data: {
            title: 'Benvenuti nel Nostro Negozio',
            subtitle: 'Prodotti di qualità dal 1990',
            layout: 'left',
            imageBorder: 'shadow',
            buttonText: 'Scopri i prodotti',
            buttonUrl: '#products'
          }
        },
        {
          id: 'map-3',
          type: 'maps',
          data: {
            address: '',
            height: '500px',
            showDirections: true,
            showStreetView: true,
            markerColor: 'blue'
          }
        },
        {
          id: 'gallery-3',
          type: 'gallery',
          data: {
            layout: 'masonry',
            columns: 4,
            gap: 'small',
            showCaptions: false,
            enableLightbox: true
          }
        },
        {
          id: 'social-3',
          type: 'social',
          data: {
            platforms: ['facebook', 'instagram'],
            layout: 'vertical',
            showFollowers: true,
            openInNewTab: true
          }
        }
      ]
    },
    {
      id: 'blog-magazine',
      name: 'Blog Magazine',
      description: 'Sito dedicato a blog e articoli',
      icon: '📰',
      sections: [
        {
          id: 'blog-4',
          type: 'blog',
          data: {
            title: 'Articoli Recenti',
            layout: 'list',
            postsToShow: 8,
            showAuthor: true,
            showDate: true,
            showReadTime: true,
            showMeta: true,
            showReadMore: true
          }
        },
        {
          id: 'categories-4',
          type: 'blog',
          data: {
            title: 'Esplora per Categoria',
            layout: 'grid',
            postsToShow: 6,
            columns: 2,
            category: 'all'
          }
        },
        {
          id: 'social-4',
          type: 'social',
          data: {
            platforms: ['twitter', 'facebook'],
            layout: 'horizontal',
            iconSize: 'medium',
            showFeed: true
          }
        }
      ]
    }
  ];

  // Carica pagine esistenti
  useEffect(() => {
    if (websiteId) {
      loadPages();
    }
  }, [websiteId]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/website/${websiteId}/pages`);
      if (response.data.success) {
        setPages(response.data.pages || []);
      }
    } catch (error) {
      console.error('Errore caricamento pagine:', error);
      setError('Impossibile caricare le pagine esistenti');
    } finally {
      setLoading(false);
    }
  };

  // Apre il builder con template selezionato
  const openTemplateBuilder = (template) => {
    setCurrentBuilderTemplate(template);
    setEditingPage(null);
    setActiveView('builder');
  };

  // Apre il builder per modificare una pagina esistente
  const editPage = (page) => {
    try {
      // Parse del contenuto JSON della pagina
      let sections = [];

      // 1. Prova prima con il formato JSON nuovo
      if (page.contenuto_json) {
        const jsonData = JSON.parse(page.contenuto_json);
        sections = jsonData.sections || [];
        console.log('Caricate', sections.length, 'sezioni dal JSON:', sections);
      }
      // 2. Se non c'è JSON, prova a convertire da HTML vecchio
      else if (page.contenuto_html) {
        sections = convertHtmlToSections(page.contenuto_html);
        console.log('Convertite', sections.length, 'sezioni da HTML');
      }
      // 3. Se non c'è nulla, parti da array vuoto
      else {
        console.log('Nessun contenuto trovato, partendo da array vuoto');
        sections = [];
      }

      // Crea un template virtuale basato sulla pagina esistente
      const pageTemplate = {
        id: `edit_${page.id}`,
        name: `Modifica: ${page.titolo}`,
        description: 'Modifica pagina esistente',
        icon: '✏️',
        sections: sections
      };

      setCurrentBuilderTemplate(pageTemplate);
      setEditingPage(page);
      setActiveView('builder');
    } catch (error) {
      console.error('Errore caricamento pagina per modifica:', error);
      setError('Impossibile caricare la pagina per la modifica');
    }
  };

  // Funzione per convertire HTML vecchio in sezioni template
  const convertHtmlToSections = (htmlContent) => {
    try {
      // Parse basilare per estrarre dati da HTML esistente
      const sections = [];

      // Prova a estrarre immagini
      const imgMatches = htmlContent.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g);
      if (imgMatches && imgMatches.length > 0) {
        imgMatches.forEach((match, index) => {
          const srcMatch = match.match(/src="([^"]+)"/);
          const altMatch = match.match(/alt="([^"]*)"/);

          if (srcMatch) {
            sections.push({
              id: `imported_image_${Date.now()}_${index}`,
              type: 'image',
              data: {
                imageUrl: srcMatch[1],
                altText: altMatch ? altMatch[1] : '',
                title: '',
                description: '',
                layout: 'center',
                buttonText: '',
                buttonUrl: '',
                imageBorder: 'rounded'
              }
            });
          }
        });
      }

      // Se non troviamo sezioni, crea una sezione vuota per permettere all'utente di aggiungere
      if (sections.length === 0) {
        sections.push({
          id: `empty_${Date.now()}`,
          type: 'image',
          data: {
            imageUrl: '',
            altText: '',
            title: '',
            description: '',
            layout: 'left',
            buttonText: '',
            buttonUrl: '',
            imageBorder: 'rounded'
          }
        });
      }

      return sections;
    } catch (error) {
      console.error('Errore conversione HTML in sezioni:', error);
      // Restituisci una sezione vuota in caso di errore
      return [{
        id: `fallback_${Date.now()}`,
        type: 'image',
        data: {
          imageUrl: '',
          altText: '',
          title: '',
          description: '',
          layout: 'left',
          buttonText: '',
          buttonUrl: '',
          imageBorder: 'rounded'
        }
      }];
    }
  };

  // Gestisce salvataggio pagina dal builder
  const handleSaveFromTemplate = async (pageData) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let response;

      if (editingPage) {
        // Modifica pagina esistente
        response = await api.put(`/website/${websiteId}/pages/${editingPage.id}`, pageData);
      } else {
        // Creazione nuova pagina
        response = await api.post(`/website/${websiteId}/pages`, pageData);
      }

      if (response.data.success) {
        const action = editingPage ? 'modificata' : 'creata';
        setSuccess(`Pagina ${action} con successo!`);

        // Ricarica pagine
        await loadPages();
        // Rimani nella vista pagine (non tornare ai template)
        setActiveView('pages');
        setCurrentBuilderTemplate(null);
        setEditingPage(null);

        // NOTA: Non chiamiamo onCancel() perché vogliamo rimanere nel contesto del WebsiteBuilder

        if (onSave) {
          onSave(response.data.page);
        }
      } else {
        setError(response.data.error || 'Errore nel salvataggio');
      }
    } catch (error) {
      console.error('Errore salvataggio pagina:', error);
      setError('Errore nel salvataggio della pagina');
    } finally {
      setSaving(false);
    }
  };

  // Chiudi builder e torna ai template
  const closeBuilder = () => {
    setActiveView('template');
    setCurrentBuilderTemplate(null);
    setEditingPage(null);
  };

  // Genera anteprima HTML della pagina
  const handlePreviewPage = (page) => {
    try {
      let pageContent = '';

      if (page.contenuto_json) {
        const jsonData = JSON.parse(page.contenuto_json);
        console.log('Preview: sezioni trovate', jsonData.sections?.length || 0);
        pageContent = generateHtmlFromSections(jsonData.sections || []);
      } else {
        console.log('Preview: nessun contenuto_json trovato');
        pageContent = '<p>Nessun contenuto disponibile</p>';
      }

      const html = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.meta_title || page.titolo || 'Anteprima Pagina'}</title>
    <meta name="description" content="${page.meta_description || ''}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .header { background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
        .header h1 { font-size: 1.5rem; color: #111827; }
        .preview-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 0.5rem; text-align: center; font-size: 0.875rem; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
        .hero { background: #3b82f6; color: white; padding: 4rem 0; text-align: center; margin-top: 2rem; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.25rem; opacity: 0.9; }
        .btn { background: white; color: #3b82f6; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; margin-top: 1rem; }
        section { padding: 4rem 0; }
        section:nth-child(even) { background: #f9fafb; }
        h2 { font-size: 2.5rem; margin-bottom: 1rem; color: #111827; }
        .text-xl { font-size: 1.25rem; color: #6b7280; margin-bottom: 2rem; }
        img { max-width: 100%; height: auto; border-radius: 0.5rem; }
        .footer { background: #111827; color: white; padding: 2rem 0; text-align: center; margin-top: 2rem; }
        .section-margin { margin-top: 2rem; }
        .image-section { display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem; }
        .image-section img { flex: 1; max-width: 50%; }
        .image-section .content { flex: 1; }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .gallery-grid img { width: 100%; height: 200px; object-fit: cover; }
        .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .blog-card { background: white; border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="preview-notice">
        📋 Modalità anteprima - Questa è un'anteprima della pagina generata dal template
    </div>

    <header class="header">
        <div class="container">
            <h1>${site?.ragione_sociale || 'Nome Azienda'}</h1>
        </div>
    </header>

    <main style="margin-top: 2rem;">
        <div class="container">
            ${pageContent}
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 ${site?.ragione_sociale || 'Nome Azienda'}. Tutti i diritti riservati.</p>
            <p style="font-size: 0.875rem; opacity: 0.7; margin-top: 0.5rem;">Creato con Opero Cloud Website Builder</p>
        </div>
    </footer>
</body>
</html>`;

      // Apre l'HTML in una nuova finestra
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(html);
      previewWindow.document.close();

    } catch (error) {
      console.error('Errore generazione anteprima:', error);
      alert('Errore nella generazione dell\'anteprima');
    }
  };

  // Funzione per generare HTML dalle sezioni
  const generateHtmlFromSections = (sections) => {
    return sections.map(section => {
      switch (section.type) {
        case 'image':
          return generateImageSection(section.data);
        case 'gallery':
          return generateGallerySection(section.data);
        case 'blog':
          return generateBlogSection(section.data);
        case 'maps':
          return generateMapsSection(section.data);
        case 'social':
          return generateSocialSection(section.data);
        default:
          return '';
      }
    }).join('');
  };

  // Genera sezione immagine
  const generateImageSection = (data) => {
    const imageUrl = data.imageUrl || '';
    const title = data.title || '';
    const description = data.description || '';
    const buttonText = data.buttonText || '';
    const buttonUrl = data.buttonUrl || '';

    return `
      <div class="section-margin">
        <div class="image-section">
          ${imageUrl ? `<img src="${imageUrl}" alt="${title}" />` : ''}
          <div class="content">
            ${title ? `<h2>${title}</h2>` : ''}
            ${description ? `<p>${description}</p>` : ''}
            ${buttonText && buttonUrl ? `<a href="${buttonUrl}" class="btn">${buttonText}</a>` : ''}
          </div>
        </div>
      </div>
    `;
  };

  // Genera sezione galleria
  const generateGallerySection = (data) => {
    const images = data.images || [];
    return `
      <div class="section-margin">
        <h2>Galleria Fotografica</h2>
        <div class="gallery-grid">
          ${images.map(img => `<img src="${img.url}" alt="${img.alt || ''}" />`).join('')}
        </div>
      </div>
    `;
  };

  // Genera sezione blog
  const generateBlogSection = (data) => {
    return `
      <div class="section-margin">
        <h2>${data.title || 'Articoli Recenti'}</h2>
        <p style="color: #6b7280; font-size: 1.25rem;">Questa sezione mostrerà gli articoli più recenti del blog.</p>
      </div>
    `;
  };

  // Genera sezione maps
  const generateMapsSection = (data) => {
    return `
      <div class="section-margin">
        <h2>${data.markerTitle || 'La Nostra Sede'}</h2>
        <p>${data.markerDescription || 'Vieni a trovarci!'}</p>
        <div style="background: #e5e7eb; height: 400px; display: flex; align-items: center; justify-content: center; border-radius: 0.5rem; margin-top: 1rem;">
          Mappa interattiva (richiede Google Maps API)
        </div>
      </div>
    `;
  };

  // Genera sezione social
  const generateSocialSection = (data) => {
    return `
      <div class="section-margin">
        <h2>Seguici sui Social</h2>
        <p style="color: #6b7280;">Questa sezione mostrerà i link ai profili social.</p>
      </div>
    `;
  };

  // Genera HTML statico per Next.js
  const generateStaticHTML = async (pageData) => {
    try {
      const response = await api.post(`/website/${websiteId}/generate-html`, pageData);
      return response.data.html;
    } catch (error) {
      console.error('Errore generazione HTML:', error);
      return null;
    }
  };

  // Render vista template selection
  const renderTemplateSelection = () => (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          {onCancel && (
            <button
              onClick={onCancel}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Crea Pagina da Template
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Scegli un template e personalizzalo con le sezioni disponibili
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setActiveView('pages')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Pagine Esistenti ({pages.length})
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer ${
              selectedTemplate?.id === template.id ? 'border-blue-500 shadow-lg' : ''
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{template.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Preview sections */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500">Sezioni incluse:</div>
              <div className="flex flex-wrap gap-1">
                {template.sections.map((section) => (
                  <span
                    key={section.id}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                  >
                    {section.type === 'image' && '🖼️ Immagine'}
                    {section.type === 'blog' && '📝 Blog'}
                    {section.type === 'maps' && '🗺️ Mappa'}
                    {section.type === 'social' && '📱 Social'}
                    {section.type === 'gallery' && '🎨 Galleria'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Crea template personalizzato */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Crea Template Personalizzato
        </h3>
        <p className="text-gray-600 mb-4">
          Parti da zero e aggiungi le sezioni che preferisci
        </p>
        <button
          onClick={() => setSelectedTemplate({ id: 'custom', name: 'Personalizzato', sections: [] })}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          Inizia da Zero
        </button>
      </div>

      {/* Actions */}
      {selectedTemplate && (
        <div className="flex items-center justify-center mt-8 space-x-4">
          <button
            onClick={() => setSelectedTemplate(null)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annulla Selezione
          </button>
          <button
            onClick={() => openTemplateBuilder(selectedTemplate)}
            className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Usa Questo Template
          </button>
        </div>
      )}
    </div>
  );

  // Render vista elenco pagine
  const renderPagesList = () => (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => setActiveView('template')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Le Tue Pagine
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestisci le pagine create dai template
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('template')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuova Pagina
        </button>
      </div>

      {/* Pages Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Caricamento pagine...</div>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna pagina creata
          </h3>
          <p className="text-gray-600 mb-4">
            Crea la tua prima pagina utilizzando i template disponibili
          </p>
          <button
            onClick={() => setActiveView('template')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Crea Prima Pagina
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {page.titolo}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                  page.is_published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {page.is_published ? 'Pubblicata' : 'Bozza'}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <div>Slug: <code className="bg-gray-100 px-1 rounded">/{page.slug}</code></div>
                <div>Sezioni: {JSON.parse(page.contenuto_json || '{}').sections?.length || 0}</div>
                <div>Modificato: {new Date(page.updated_at).toLocaleDateString()}</div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreviewPage(page)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  <EyeIcon className="h-3 w-3 mr-1" />
                  Anteprima
                </button>
                <button
                  onClick={() => editPage(page)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Modifica
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render main content
  const renderContent = () => {
    if (activeView === 'template') {
      return renderTemplateSelection();
    } else if (activeView === 'pages') {
      return renderPagesList();
    } else if (activeView === 'builder') {
      return (
        <TemplatePageBuilder
          initialTemplate={currentBuilderTemplate}
          websiteId={websiteId}
          site={site}
          onSave={handleSaveFromTemplate}
          onCancel={closeBuilder}
          editingPage={editingPage}
        />
      );
    }
  };

  // Render main component
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error/Success messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default WebsiteBuilderUNIFIED;