/**
 * Page Editor Component - Versione semplificata per debug
 */

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const PageEditorSimple = ({ page, site, onSave, onCancel }) => {
  const [pageMeta, setPageMeta] = useState({
    titolo: page?.titolo || '',
    slug: page?.slug || '',
    meta_title: page?.meta_title || '',
    meta_description: page?.meta_description || '',
    is_published: page?.is_published || false,
    menu_order: page?.menu_order || 0
  });

  const [content, setContent] = useState(page?.contenuto_html || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      const pageData = {
        ...pageMeta,
        contenuto_html: content
      };

      await onSave(pageData);
    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert('Errore durante il salvataggio della pagina');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {page ? 'Modifica Pagina' : 'Nuova Pagina'}
          </h1>
          <p className="text-gray-600 mt-1">
            Sito: {site?.site_title}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Annulla
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvataggio...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Salva Pagina
              </>
            )}
          </button>
        </div>
      </div>

      {/* Meta informazioni pagina */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Impostazioni Pagina</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo Pagina *
            </label>
            <input
              type="text"
              value={pageMeta.titolo}
              onChange={(e) => setPageMeta({...pageMeta, titolo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug URL *
            </label>
            <input
              type="text"
              value={pageMeta.slug}
              onChange={(e) => setPageMeta({...pageMeta, slug: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="md:col-span-2 mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={pageMeta.is_published}
              onChange={(e) => setPageMeta({...pageMeta, is_published: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Pubblica pagina</span>
          </label>
        </div>
      </div>

      {/* Contenuto pagina */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Contenuto Pagina</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenuto HTML
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="<h1>Titolo pagina</h1><p>Contenuto della pagina...</p>"
          />
          <p className="text-sm text-gray-500 mt-1">
            Inserisci il codice HTML della pagina
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Anteprima:</p>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500">Nessun contenuto...</p>' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PageEditorSimple;