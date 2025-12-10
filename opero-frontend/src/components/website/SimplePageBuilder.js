/**
 * Simple Page Builder
 * Componente semplificato per creare/modificare pagine con PageEditor
 */

import React, { useState } from 'react';
import {
  EyeIcon,
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Importa il PageEditor esistente
import PageEditor from './PageEditor';
import SitePreview from './components/SitePreview';
import { api } from '../../services/api';

// Funzione per generare slug da titolo
const generateSlug = (title) => {
  if (!title) return 'pagina-senza-titolo';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Rimuovi caratteri speciali
    .replace(/\s+/g, '-') // Sostituisci spazi con trattini
    .replace(/-+/g, '-') // Rimuovi trattini multipli
    .trim() || 'pagina';
};

// Funzione per generare HTML dalle sezioni (copiata dal backend)
const generateHtmlFromSections = (sections) => {
  if (!Array.isArray(sections)) return '';

  let html = '';
  sections.forEach(section => {
    switch (section.type) {
      case 'hero':
        html += `
          <section class="hero" style="background-color: ${section.backgroundColor || '#f3f4f6'}; padding: 80px 0; text-align: center;">
            <div class="container mx-auto px-4">
              <h1 class="text-4xl font-bold mb-4">${section.title || ''}</h1>
              <p class="text-xl mb-6">${section.subtitle || ''}</p>
              ${section.buttonText ? `<a href="${section.buttonUrl || '#'}" class="bg-blue-500 text-white px-6 py-3 rounded-lg inline-block">${section.buttonText}</a>` : ''}
            </div>
          </section>
        `;
        break;
      case 'text':
        html += `
          <section class="text-section" style="padding: 60px 0;">
            <div class="container mx-auto px-4">
              ${section.content || ''}
            </div>
          </section>
        `;
        break;
      case 'image':
        html += `
          <section class="image-section" style="padding: 60px 0;">
            <div class="container mx-auto px-4 text-center">
              ${section.imageUrl ? `<img src="${section.imageUrl}" alt="${section.altText || ''}" class="max-w-full h-auto rounded-lg">` : ''}
              ${section.caption ? `<p class="mt-4 text-gray-600">${section.caption}</p>` : ''}
            </div>
          </section>
        `;
        break;
      case 'contact':
        html += `
          <section class="contact-section" style="padding: 60px 0; background-color: #f9fafb;">
            <div class="container mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-8">Contatti</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 class="text-xl font-semibold mb-4">Informazioni</h3>
                  <p>Email: ${section.email || ''}</p>
                  <p>Telefono: ${section.phone || ''}</p>
                  <p>Indirizzo: ${section.address || ''}</p>
                </div>
                <div>
                  <h3 class="text-xl font-semibold mb-4">Messaggio</h3>
                  <form class="space-y-4">
                    <input type="text" placeholder="Nome" class="w-full p-2 border rounded">
                    <input type="email" placeholder="Email" class="w-full p-2 border rounded">
                    <textarea placeholder="Messaggio" rows="4" class="w-full p-2 border rounded"></textarea>
                    <button type="submit" class="bg-blue-500 text-white px-6 py-2 rounded">Invia</button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        `;
        break;
      default:
        html += `<section class="unknown-section"><p>Sezione non riconosciuta: ${section.type}</p></section>`;
    }
  });

  return html;
};

const SimplePageBuilder = ({ websiteId, initialPage = null, site, onSave, onCancel }) => {
  // DEBUG: Log per capire cosa riceviamo
  console.log('🔥 SimplePageBuilder - Dati ricevuti:', {
    websiteId,
    initialPage: initialPage ? {
      id: initialPage.id,
      titolo: initialPage.titolo,
      slug: initialPage.slug,
      has_contenuto_json: !!initialPage.contenuto_json,
      sections_count: initialPage.contenuto_json?.sections?.length || 0
    } : 'null',
    site: site ? `ID: ${site.id}` : 'null'
  });

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Se siamo in modalità modifica e abbiamo una pagina esistente
  const isEditing = !!initialPage?.id;

  // Handler per il salvataggio
  const handleSave = async (pageData) => {
    setSaving(true);
    try {
      const data = {
        titolo: pageData.titolo,
        slug: pageData.slug || generateSlug(pageData.titolo),
        contenuto_json: pageData.contenuto_json || { sections: [] },
        contenuto_html: generateHtmlFromSections(pageData.contenuto_json?.sections || []),
        meta_title: pageData.meta_title || pageData.titolo,
        meta_description: pageData.meta_description || '',
        is_published: pageData.is_published || false,
        menu_order: pageData.menu_order || 0
      };

      console.log('🔥 SimplePageBuilder - Salvataggio dati:', {
        isEditing,
        pageId: initialPage?.id,
        data
      });

      let response;
      if (isEditing) {
        response = await api.put(`/website/${websiteId}/pages/${initialPage.id}`, data);
      } else {
        response = await api.post(`/website/${websiteId}/pages`, data);
      }

      if (response.data.success) {
        console.log('✅ SimplePageBuilder - Salvataggio completato');
        onSave && onSave();
      } else {
        console.error('❌ SimplePageBuilder - Errore salvataggio:', response.data);
      }
    } catch (error) {
      console.error('❌ SimplePageBuilder - Errore salvataggio:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onCancel}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifica Pagina' : 'Crea Nuova Pagina'}
            </h1>
            {isEditing && initialPage && (
              <p className="mt-1 text-sm text-gray-500">Stai modificando: {initialPage.titolo || initialPage.slug}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!showPreview && (
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Anteprima
            </button>
          )}

          {showPreview && (
            <button
              onClick={() => setShowPreview(false)}
              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Chiudi Anteprima
            </button>
          )}

          {saving && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">Salvataggio...</span>
            </div>
          )}
        </div>
      </div>

      {/* PageEditor - Passa direttamente i dati iniziali */}
      <PageEditor
        // Dati pagina esistente (PageEditor si aspetta 'page' non 'initialPage')
        page={initialPage}
        websiteId={websiteId}
        site={site}

        // Callbacks
        onSave={handleSave}
        onCancel={onCancel}
      />

      {/* SitePreview Modal */}
      {showPreview && site && (
        <SitePreview
          site={site}
          pages={[initialPage || {
            id: 'preview',
            titolo: 'Anteprima Pagina',
            slug: 'preview',
            contenuto_json: '{"sections":[]}',
            contenuto_html: '<p>Anteprima in costruzione...</p>',
            is_published: true
          }]}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default SimplePageBuilder;