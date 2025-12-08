/**
 * Pages Manager Component
 * Gestione delle pagine del sito web
 */

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// Importa il servizio API per autenticazione automatica
import { api } from '../../services/api';

// Import componenti
import PageEditorSimple from './PageEditorSimple';
import PageContentEditor from './components/PageContentEditor';
import ImageGallery from './components/ImageGallery';
import GoogleMap from './components/GoogleMap';
import SocialSharing from './components/SocialSharing';
import SitePreview from './components/SitePreview';
import { templateDefinitions, pageTypeTemplates } from './templates/TemplateDefinitions';

// Componente per gestire errori
const PagesManagerErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.error('PagesManager Error:', event.error);
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">Si è verificato un errore</p>
          <p className="text-sm mt-2">Ricarica la pagina e riprova</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Ricarica
        </button>
      </div>
    );
  }

  return children;
};

const PagesManager = ({ site, onBack }) => {
  // Dichiarazione degli hook PRIMA di qualsiasi return
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPageEditor, setShowPageEditor] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [selectedPageType, setSelectedPageType] = useState('custom');
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [pageSections, setPageSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form per nuova pagina
  const [newPageForm, setNewPageForm] = useState({
    titolo: '',
    slug: '',
    contenuto_html: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_published: false,
    menu_order: 0
  });

  // Carica pagine del sito
  useEffect(() => {
    if (site?.id) {
      fetchPages();
    }
  }, [site]);

  // Se non c'è un sito, mostra un messaggio (DOPO gli hook)
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

      const response = await api.get(`/website/${site.id}/pages`);
      const data = response.data;

      if (data.success) {
        setPages(data.pages || []);
      } else {
        setError(data.error || 'Errore nel caricamento delle pagine');
      }
    } catch (error) {
      console.error('Errore fetch pagine:', error);
      setError(`Errore di connessione: ${error.message}`);
      setPages([]); // Impostiamo array vuoto in caso di errore
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      // Invia solo i campi che il backend si aspetta, con template sections serializzato
      // Puliamo i dati delle immagini per rimuovere blob URLs non validi
      const cleanSections = pageSections.map(section => {
        if (section.type === 'media' && section.content.images) {
          return {
            ...section,
            content: {
              ...section.content,
              images: section.content.images.map(img => ({
                ...img,
                previewUrl: img.previewUrl?.startsWith('blob:') ? null : img.previewUrl
              })).filter(img => img.file_name_originale) // Rimuovi immagini senza nome file
            }
          };
        }
        return section;
      });

      const pageData = {
        slug: newPageForm.slug,
        titolo: newPageForm.titolo,
        // Usiamo contenuto_json per consistenza con l'aggiornamento
        contenuto_json: JSON.stringify({
          page_type: selectedPageType,
          sections: cleanSections,
          original_content: newPageForm.contenuto_html
        }),
        // Manteniamo anche contenuto_html come fallback per lettura
        contenuto_html: newPageForm.contenuto_html,
        meta_title: newPageForm.meta_title,
        meta_description: newPageForm.meta_description,
        is_published: newPageForm.is_published,
        menu_order: newPageForm.menu_order
      };

      const response = await api.post(`/website/${site.id}/pages`, pageData);
      const data = response.data;

      if (data.success) {
        setShowNewPageForm(false);
        setNewPageForm({
          titolo: '',
          slug: '',
          contenuto_html: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          is_published: false,
          menu_order: 0
        });
        setPageSections([]);
        setSelectedPageType('custom');

        // Apri subito l'editor per la nuova pagina
        const newPage = {
          id: data.id,
          titolo: newPageForm.titolo,
          slug: newPageForm.slug,
          contenuto_html: '',
          meta_title: newPageForm.meta_title,
          meta_description: newPageForm.meta_description,
          is_published: newPageForm.is_published,
          menu_order: newPageForm.menu_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setEditingPage(newPage);
        setShowPageEditor(true);
        fetchPages(); // Ricarica elenco
      } else {
        setError(data.error || 'Errore nella creazione della pagina');
      }
    } catch (error) {
      console.error('Errore creazione pagina:', error);
      setError(`Errore di connessione: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa pagina?')) {
      return;
    }

    try {
      const response = await api.delete(`/website/${site.id}/pages/${pageId}`);
      const data = response.data;

      if (data.success) {
        fetchPages(); // Ricarica elenco
      } else {
        setError(data.error || 'Errore nella eliminazione della pagina');
      }
    } catch (error) {
      console.error('Errore eliminazione pagina:', error);
      setError(`Errore di connessione: ${error.message}`);
    }
  };

  const handleEditPage = async (page) => {
  try {
    const response = await api.get(`/website/${site.id}/pages/${page.id}`);
    const data = response.data;

    if (data.success) {
      const pageData = data.page;

      console.log('🔥 [DEBUG] Pagina caricata:', pageData);
      console.log('🔥 [DEBUG] id_ditta:', pageData.id_ditta);
      console.log('🔥 [DEBUG] site:', site);

      // Controlla sia contenuto_json che contenuto_html per dati template
      let templateSections = [];
      let pageType = 'custom';

      try {
        // Prima controlla contenuto_json (formato nuovo)
        if (pageData.contenuto_json) {
          const parsedContent = JSON.parse(pageData.contenuto_json);
          if (parsedContent.sections) {
            templateSections = parsedContent.sections;
            pageType = parsedContent.page_type || 'custom';
          }
        }
        // Fallback su contenuto_html (formato vecchio)
        else if (pageData.contenuto_html) {
          const parsedContent = JSON.parse(pageData.contenuto_html);
          if (parsedContent.sections) {
            templateSections = parsedContent.sections;
            pageType = parsedContent.page_type || 'custom';
          }
        }
      } catch (e) {
        // Se non è JSON, è contenuto HTML normale
        console.log('Contenuto HTML normale, genero sezioni default');
      }

      // FORZA: Se non ci sono sezioni template, generale sempre sezioni default
      if (templateSections.length === 0) {
        // Determina il tipo di pagina dal titolo o genera default
        let detectedType = 'custom';
        const pageTitle = pageData.titolo?.toLowerCase() || '';

        if (pageTitle.includes('home')) detectedType = 'home';
        else if (pageTitle.includes('chi')) detectedType = 'about';
        else if (pageTitle.includes('conta')) detectedType = 'contact';
        else if (pageTitle.includes('serviz')) detectedType = 'services';
        else if (pageTitle.includes('galler')) detectedType = 'gallery';

        setSelectedPageType(detectedType);

        // Genera sezioni default per il tipo di pagina
        const pageTypeConfig = pageTypeTemplates[detectedType] || pageTypeTemplates.custom;
        if (site?.template_id) {
          const recommendedSections = pageTypeConfig.getRecommendedSections(site.template_id);
          templateSections = recommendedSections.map(section => ({
            ...section,
            content: {
              ...section.defaultContent,
              // Mantiene contenuti esistenti se presenti
              ...(section.id === 'about' && {
                content: pageData.contenuto_html || section.defaultContent.content
              })
            }
          }));
        }
      } else {
        setSelectedPageType(pageType);
      }

      setPageSections(templateSections);

      // FORZA: Aggiungi dati mancanti alla pagina
      const pageDataConDati = {
        ...pageData,
        id_ditta: pageData.id_ditta || site?.id_ditta,
        id_sito_web: pageData.id_sito_web || site?.id,
        template_type: pageType
      };

      console.log('🔥 [DEBUG] pagina con dati forzati:', pageDataConDati);

      setEditingPage(pageDataConDati);
      setShowPageEditor(true);
    } else {
      setError(data.error || 'Errore nel caricamento della pagina');
    }
  } catch (error) {
    console.error('Errore caricamento pagina:', error);
    setError(`Errore di connessione: ${error.message}`);
  }
};

const handleSavePage = async (pageData) => {
  console.log('🔥 [DEBUG] handleSavePage chiamato con dati:', pageData);
  console.log('🔥 [DEBUG] editingPage:', editingPage);
  console.log('🔥 [DEBUG] pageSections:', pageSections);

  try {
    // Pulisci le sezioni template prima dell'aggiornamento
    const cleanSections = (pageData.template_sections || pageSections).map(section => {
      if (section.type === 'media' && section.content.images) {
        return {
          ...section,
          content: {
            ...section.content,
            images: section.content.images.map(img => ({
              ...img,
              previewUrl: img.previewUrl?.startsWith('blob:') ? null : img.previewUrl
            })).filter(img => img.file_name_originale)
          }
        };
      }
      return section;
    });

    // Invia solo i campi che il backend si aspetta per l'aggiornamento
    const completePageData = {
      titolo: editingPage.titolo,
      contenuto_json: JSON.stringify({
        page_type: editingPage.page_type || 'custom',
        sections: cleanSections,
        original_content: editingPage.contenuto_html
      }),
      meta_title: editingPage.meta_title,
      meta_description: editingPage.meta_description,
      is_published: editingPage.is_published,
      // CAMPI ESSENZIALI PER IL BACKEND
      id_ditta: editingPage.id_ditta || site?.id_ditta,
      id_sito_web: editingPage.id_sito_web || site?.id
    };

    console.log('🔥 [DEBUG] Chiamata API:', `/website/${site.id}/pages/${editingPage.id}`);
    console.log('🔥 [DEBUG] Dati inviati:', completePageData);

    const response = await api.put(`/website/${site.id}/pages/${editingPage.id}`, completePageData);
    const data = response.data;
    console.log('🔥 [DEBUG] Response data:', data);

    if (data.success) {
      setShowPageEditor(false);
      setEditingPage(null);
      fetchPages(); // Ricarica elenco
    } else {
      console.error('🔥 [DEBUG] Errore backend:', data);
      throw new Error(data.error || 'Errore nel salvataggio della pagina');
    }
  } catch (error) {
    console.error('🔥 [DEBUG] Errore salvataggio pagina:', error);
    console.error('🔥 [DEBUG] Response status:', error.response?.status);
    console.error('🔥 [DEBUG] Response text:', error.response?.statusText);
    console.error('🔥 [DEBUG] Complete error:', error);

    // Mostra un errore più user-friendly
    alert(`Errore salvataggio: ${error.message || 'Errore sconosciuto'}`);

    throw error;
  }
};

const handleTogglePublish = async (pageId, currentStatus) => {
    try {
      const response = await api.post(`/website/${site.id}/pages/${pageId}/publish`);
      const data = response.data;

      if (data.success) {
        fetchPages(); // Ricarica elenco
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

  // Funzioni per gestione template-based
  const handlePageTypeSelection = (pageType) => {
    setSelectedPageType(pageType);
    setShowTemplateSelection(false);

    if (site?.template_id) {
      const template = templateDefinitions[site.template_id];
      if (template && pageTypeTemplates[pageType]) {
        const recommendedSections = pageTypeTemplates[pageType].getRecommendedSections(site.template_id);
        setPageSections(recommendedSections.map(section => ({
          ...section,
          content: section.defaultContent || {}
        })));
      }
    }
    setShowNewPageForm(true);
  };

  const handleSectionUpdate = (sectionIndex, sectionData) => {
    const updatedSections = [...pageSections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      content: sectionData
    };
    setPageSections(updatedSections);
  };

  const renderSectionComponent = (section, index) => {
    const { type, content } = section;

    switch (type) {
      case 'media':
        return (
          <ImageGallery
            key={section.id}
            pageId={editingPage?.id || 'new'}
            siteId={site?.id}
            sectionData={content}
            onSectionUpdate={(data) => handleSectionUpdate(index, data)}
            isEditing={true}
          />
        );

      case 'contact':
        return (
          <GoogleMap
            key={section.id}
            site={site}
            sectionData={content}
            onSectionUpdate={(data) => handleSectionUpdate(index, data)}
            isEditing={true}
          />
        );

      case 'social':
        return (
          <SocialSharing
            key={section.id}
            page={editingPage}
            site={site}
            sectionData={content}
            onSectionUpdate={(data) => handleSectionUpdate(index, data)}
            isEditing={true}
          />
        );

      case 'content':
      default:
        return (
          <PageContentEditor
            key={section.id}
            section={section}
            sectionData={content}
            onSectionUpdate={(data) => handleSectionUpdate(index, data)}
            isEditing={true}
            templateId={site?.template_id}
            websiteId={site?.id}
          />
        );
    }
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

          <div className="flex items-center space-x-3">
            {pages.length > 0 && (
              <button
                onClick={() => {
                  console.log('🔥 PagesManager: click anteprima', {
                    siteId: site?.id,
                    pagesCount: pages.length,
                    publishedPages: pages.filter(p => p.is_published).length
                  });
                  setShowPreview(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Anteprima Sito
              </button>
            )}
            <button
              onClick={() => setShowTemplateSelection(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuova Pagina
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <span className="text-red-800">{error}</span>
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

            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordine Menu
                </label>
                <input
                  type="number"
                  value={newPageForm.menu_order}
                  onChange={(e) => setNewPageForm(prev => ({...prev, menu_order: parseInt(e.target.value) || 0}))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
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
            onClick={() => setShowTemplateSelection(true)}
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
                      onClick={() => handleEditPage(page)}
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

      {/* Template Selection Modal */}
      {showTemplateSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Scegli Tipo Pagina</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Seleziona il tipo di pagina per auto-configurare le sezioni
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateSelection(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(pageTypeTemplates).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => handlePageTypeSelection(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">{config.name}</h4>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Page Form with Template Sections */}
      {showNewPageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Crea Pagina: {pageTypeTemplates[selectedPageType]?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configura i contenuti per la tua pagina
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowNewPageForm(false);
                    setPageSections([]);
                    setSelectedPageType('custom');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Page Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Informazioni Base</h4>
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
                      placeholder={pageTypeTemplates[selectedPageType]?.name}
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
                      onChange={(e) => setNewPageForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="es: chi-siamo"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={newPageForm.is_published}
                    onChange={(e) => setNewPageForm(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                    Pubblica immediatamente
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordine Menu
                  </label>
                  <input
                    type="number"
                    value={newPageForm.menu_order}
                    onChange={(e) => setNewPageForm(prev => ({ ...prev, menu_order: parseInt(e.target.value) || 0 }))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Template Sections */}
              {pageSections.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Contenuti della Pagina</h4>
                  <div className="space-y-6">
                    {pageSections.map((section, index) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                          <span className="mr-2">{section.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {section.type}
                          </span>
                        </h5>
                        {renderSectionComponent(section, index)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewPageForm(false);
                  setPageSections([]);
                  setSelectedPageType('custom');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                onClick={handleCreatePage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creazione...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Crea Pagina
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Page Editor Modal with Template Sections */}
      {showPageEditor && editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Modifica Pagina: {editingPage.titolo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Modifica i contenuti della pagina
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPageEditor(false);
                    setEditingPage(null);
                    setPageSections([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Template Sections for Editing */}
              {pageSections.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Contenuti della Pagina</h4>
                  <div className="space-y-6">
                    {pageSections.map((section, index) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                          <span className="mr-2">{section.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {section.type}
                          </span>
                          <span className="ml-auto text-xs text-gray-400">
                            {section.required && 'Richiesto'}
                          </span>
                        </h5>
                        {renderSectionComponent(section, index)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pageSections.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Nessuna sezione template configurata</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Le sezioni verranno generate automaticamente quando salvi
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPageEditor(false);
                  setEditingPage(null);
                  setPageSections([]);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                onClick={() => handleSavePage({
                  ...editingPage,
                  template_sections: pageSections
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Site Preview Modal */}
      {showPreview && (
        <>
          {console.log('🔥 PagesManager: rendering SitePreview', {
            site: site?.id,
            pages: pages.filter(p => p.is_published).length
          })}
          <SitePreview
            site={site}
            pages={pages.filter(p => p.is_published)}
            onClose={() => {
              console.log('🔥 PagesManager: closing SitePreview');
              setShowPreview(false);
            }}
          />
        </>
      )}
    </div>
  );
};

// Esportiamo il componente wrapped con ErrorBoundary
const PagesManagerWithErrorBoundary = (props) => (
  <PagesManagerErrorBoundary>
    <PagesManager {...props} />
  </PagesManagerErrorBoundary>
);

export default PagesManagerWithErrorBoundary;