/**
 * Pages Manager Base Component
 * Versione semplificata e stabile per la gestione delle pagine
 */

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  XMarkIcon,
  CheckIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const PagesManagerBase = ({ site, onBack }) => {
  // Tutti gli hook devono essere dichiarati all'inizio
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [newPageForm, setNewPageForm] = useState({
    titolo: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    is_published: false,
    menu_order: 0
  });
  const [editingPage, setEditingPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // useEffect per caricare le pagine
  useEffect(() => {
    if (site?.id) {
      fetchPages();
    }
  }, [site]);

  // Verifica se site è valido
  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nessun sito selezionato</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Indietro
        </button>
      </div>
    );
  }

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/website/${site.id}/pages`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPages(data.pages || []);
        console.log(`Caricate ${data.pages?.length || 0} pagine per il sito ${site.id}`);
      } else {
        setError(data.error || 'Errore nel caricamento delle pagine');
      }
    } catch (error) {
      console.error('Errore fetch pagine:', error);
      setError(`Errore di connessione: ${error.message}`);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/website/${site.id}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPageForm,
          contenuto_html: ''
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowNewPageForm(false);
        setNewPageForm({
          titolo: '',
          slug: '',
          meta_title: '',
          meta_description: '',
          is_published: false,
          menu_order: 0
        });

        // Ricarica le pagine
        await fetchPages();

        // Mostra messaggio di successo
        alert('Pagina creata con successo!');
      } else {
        setError(data.error || 'Errore nella creazione della pagina');
      }
    } catch (error) {
      console.error('Errore creazione pagina:', error);
      setError(`Errore di connessione: ${error.message}`);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa pagina?')) {
      return;
    }

    try {
      const response = await fetch(`/api/website/${site.id}/pages/${pageId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchPages();
        alert('Pagina eliminata con successo!');
      } else {
        setError(data.error || 'Errore nell\'eliminazione della pagina');
      }
    } catch (error) {
      console.error('Errore eliminazione pagina:', error);
      setError(`Errore di connessione: ${error.message}`);
    }
  };

  const handleTogglePublish = async (pageId, currentStatus) => {
    try {
      const response = await fetch(`/api/website/${site.id}/pages/${pageId}/publish`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        await fetchPages();
      } else {
        setError(data.error || 'Errore nell\'aggiornamento dello stato');
      }
    } catch (error) {
      console.error('Errore toggle publish:', error);
      setError(`Errore di connessione: ${error.message}`);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setNewPageForm(prev => ({
      ...prev,
      titolo: title,
      slug: generateSlug(title)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestione Pagine</h2>
            <p className="text-gray-600 mt-1">
              Sito: {site?.site_title} ({site?.subdomain}.operocloud.it)
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Indietro
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {pages.length} pagine trovate
            </span>
            <span className="text-sm text-green-600">
              {pages.filter(p => p.is_published).length} pubblicate
            </span>
          </div>

          <button
            onClick={() => setShowNewPageForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuova Pagina
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-4 text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* New Page Form */}
      {showNewPageForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Crea Nuova Pagina</h3>
            <button
              onClick={() => setShowNewPageForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleCreatePage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo Pagina *
                </label>
                <input
                  type="text"
                  value={newPageForm.titolo}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Es: Chi Siamo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug URL *
                </label>
                <input
                  type="text"
                  value={newPageForm.slug}
                  onChange={(e) => setNewPageForm(prev => ({...prev, slug: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="es: chi-siamo"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={newPageForm.is_published}
                onChange={(e) => setNewPageForm(prev => ({...prev, is_published: e.target.checked}))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                Pubblica immediatamente
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowNewPageForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Crea Pagina
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna pagina trovata
          </h3>
          <p className="text-gray-500 mb-6">
            Crea la tua prima pagina per iniziare a costruire il sito web
          </p>
          <button
            onClick={() => setShowNewPageForm(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Crea Prima Pagina
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {pages.sort((a, b) => a.menu_order - b.menu_order).map((page) => (
              <div key={page.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {page.is_published ? (
                        <GlobeAltIcon className="h-8 w-8 text-green-500" />
                      ) : (
                        <EyeSlashIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {page.titolo}
                        </h3>
                        <span className="text-sm text-gray-500">/{page.slug}</span>
                      </div>

                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>Ordine: {page.menu_order}</span>
                        <span>Ultima modifica: {new Date(page.updated_at).toLocaleDateString('it-IT')}</span>
                        {page.is_published && (
                          <span className="text-green-600">Pubblicata</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePublish(page.id, page.is_published)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title={page.is_published ? 'Depubblica' : 'Pubblica'}
                    >
                      {page.is_published ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        alert(`Modifica pagina "${page.titolo}" - Funzionalità in arrivo!`);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Modifica contenuto"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Elimina pagina"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesManagerBase;