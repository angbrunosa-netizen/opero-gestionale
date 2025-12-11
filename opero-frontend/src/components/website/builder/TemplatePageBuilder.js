/**
 * Template Page Builder
 * Componente semplificato per creare pagine da template con sezioni predefinite
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Import componenti sezione
import ImageSection from './sections/ImageSection';
import BlogSection from './sections/BlogSection';
import MapsSection from './sections/MapsSection';
import SocialSection from './sections/SocialSection';
import GallerySection from './sections/GallerySection';

// Fallback temporanei nel caso ci siano problemi di import
const FallbackSection = ({ type, data, onChange, onRemove }) => (
  <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-800">
    <h3>Sezione {type}</h3>
    <p>Componente in sviluppo o temporaneamente non disponibile</p>
    <pre>{JSON.stringify(data, null, 2)}</pre>
    {onRemove && (
      <button
        onClick={onRemove}
        className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
      >
        Rimuovi
      </button>
    )}
  </div>
);

const TemplatePageBuilder = ({
  initialTemplate = null,
  websiteId,
  site,
  onSave,
  onCancel,
  editingPage = null
}) => {
  const [page, setPage] = useState({
    title: editingPage?.titolo || '',
    slug: editingPage?.slug || '',
    meta_title: editingPage?.meta_title || '',
    meta_description: editingPage?.meta_description || '',
    is_published: editingPage?.is_published || false,
    sections: [] // Inizializza come array vuoto, verrà popolato dall'useEffect
  });

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Sync delle sezioni quando cambia il template o la pagina di editing
  useEffect(() => {
    console.log('🔥 TemplatePageBuilder - useEffect triggered');
    console.log('🔥 TemplatePageBuilder - editingPage:', editingPage);
    console.log('🔥 TemplatePageBuilder - initialTemplate:', initialTemplate);

    if (editingPage) {
      // Modalità modifica: prima prova a parsare contenuto_json dalla pagina
      let sections = [];

      if (editingPage.contenuto_json) {
        try {
          let jsonData;

          // Primo tentativo: parsing normale
          try {
            jsonData = JSON.parse(editingPage.contenuto_json);
          } catch (firstError) {
            // Secondo tentativo: parsing doppio (se è double-escaped)
            console.log('🔥 TemplatePageBuilder - Primo parsing fallito, provo parsing doppio');
            jsonData = JSON.parse(JSON.parse(editingPage.contenuto_json));
          }

          sections = jsonData.sections || [];
          console.log('🔥 TemplatePageBuilder - Sezioni caricate da contenuto_json:', sections.length);
          console.log('🔥 TemplatePageBuilder - Dati JSON parsati:', jsonData);
        } catch (error) {
          console.error('🔥 TemplatePageBuilder - Errore parsing contenuto_json:', error);
          console.error('🔥 TemplatePageBuilder - Valore grezzo di contenuto_json:', editingPage.contenuto_json);
        }
      }

      // Fallback: usa le sezioni del template (già parsate in WebsiteBuilderUNIFIED)
      if (sections.length === 0 && initialTemplate?.sections) {
        sections = initialTemplate.sections;
        console.log('🔥 TemplatePageBuilder - Sezioni caricate da initialTemplate fallback:', sections.length);
      }

      console.log('🔥 TemplatePageBuilder - caricamento sezioni per modifica', sections.length, 'sezioni');
      console.log('🔥 TemplatePageBuilder - sezioni:', sections);

      setPage(prev => ({
        ...prev,
        sections: sections
      }));
    } else if (initialTemplate) {
      // Modalità creazione: usa le sezioni del template
      const sections = initialTemplate.sections || [];
      console.log('🔥 TemplatePageBuilder - caricamento sezioni da template', sections.length, 'sezioni');
      setPage(prev => ({
        ...prev,
        sections: sections
      }));
    }
  }, [initialTemplate, editingPage]);

  // Tipi di sezioni disponibili
  const sectionTypes = [
    {
      id: 'image',
      name: 'Immagine',
      icon: '🖼️',
      description: 'Sezione con immagine e testo'
    },
    {
      id: 'blog',
      name: 'Blog',
      icon: '📝',
      description: 'Articoli di blog recenti'
    },
    {
      id: 'maps',
      name: 'Mappa',
      icon: '🗺️',
      description: 'Mappa interattiva Google Maps'
    },
    {
      id: 'social',
      name: 'Social',
      icon: '📱',
      description: 'Integrazione social media'
    },
    {
      id: 'gallery',
      name: 'Galleria',
      icon: '🎨',
      description: 'Galleria fotografica con effetti'
    }
  ];

  // Aggiungi nuova sezione
  const addSection = useCallback((sectionType) => {
    const newSection = {
      id: `section_${Date.now()}`,
      type: sectionType,
      data: getDefaultSectionData(sectionType)
    };

    setPage(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  }, []);

  // Dati di default per ogni tipo di sezione
  const getDefaultSectionData = (type) => {
    switch (type) {
      case 'image':
        return {
          imageUrl: '',
          altText: '',
          title: '',
          description: '',
          layout: 'left', // left, right, center
          buttonText: '',
          buttonUrl: ''
        };

      case 'blog':
        return {
          title: 'Ultimi Articoli',
          layout: 'grid', // grid, list, carousel
          postsToShow: 3,
          showReadMore: true,
          categories: []
        };

      case 'maps':
        return {
          address: '',
          zoom: 15,
          height: '400px',
          showInfoWindow: true,
          markerTitle: '',
          markerDescription: ''
        };

      case 'social':
        return {
          platforms: ['facebook', 'twitter', 'instagram', 'linkedin'],
          layout: 'horizontal', // horizontal, vertical, grid
          showFollowers: true,
          showFeed: false
        };

      case 'gallery':
        return {
          images: [],
          layout: 'grid', // grid, masonry, carousel
          columns: 3,
          gap: 'medium',
          showCaptions: true,
          enableLightbox: true,
          transition: 'fade', // fade, slide, zoom
          autoplay: false,
          interval: 3000
        };

      default:
        return {};
    }
  };

  // Rimuovi sezione
  const removeSection = useCallback((sectionId) => {
    setPage(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  }, []);

  // Sposta sezione su/giù
  const moveSection = useCallback((index, direction) => {
    setPage(prev => {
      const newSections = [...prev.sections];
      const [removed] = newSections.splice(index, 1);

      if (direction === 'up' && index > 0) {
        newSections.splice(index - 1, 0, removed);
      } else if (direction === 'down' && index < newSections.length) {
        newSections.splice(index + 1, 0, removed);
      }

      return {
        ...prev,
        sections: newSections
      };
    });
  }, []);

  // Aggiorna dati sezione
  const updateSection = useCallback((sectionId, data) => {
    setPage(prev => {
      const updatedSections = prev.sections.map(section =>
        section.id === sectionId ? { ...section, data } : section
      );

      return {
        ...prev,
        sections: updatedSections
      };
    });
  }, []);

  // Render sezione in base al tipo
  const renderSection = (section, index) => {
    const commonProps = {
      data: section.data,
      onChange: (newData) => updateSection(section.id, newData),
      onRemove: () => removeSection(section.id),
      onMoveUp: index > 0 ? () => moveSection(index, 'up') : null,
      onMoveDown: index < page.sections.length - 1 ? () => moveSection(index, 'down') : null,
      websiteId: websiteId
    };

    try {
      switch (section.type) {
        case 'image':
          return <ImageSection key={section.id} {...commonProps} />;
        case 'blog':
          return <BlogSection key={section.id} {...commonProps} />;
        case 'maps':
          return <MapsSection key={section.id} {...commonProps} />;
        case 'social':
          return <SocialSection key={section.id} {...commonProps} />;
        case 'gallery':
          return <GallerySection key={section.id} {...commonProps} />;
        default:
          return <FallbackSection key={section.id} type={section.type} data={section.data} onRemove={commonProps.onRemove} />;
      }
    } catch (error) {
      console.error(`Errore nel render della sezione ${section.type}:`, error);
      return <FallbackSection key={section.id} type={section.type} data={section.data} onRemove={commonProps.onRemove} />;
    }
  };

  // Salva pagina
  const handleSave = async () => {
    console.log('🔥 TemplatePageBuilder - handleSave chiamato');
    console.log('🔥 TemplatePageBuilder - page.sections:', page.sections);
    console.log('🔥 TemplatePageBuilder - page.sections.length:', page.sections.length);

    setSaving(true);
    try {
      const pageData = {
        titolo: page.title,
        slug: page.slug || generateSlug(page.title),
        contenuto_json: JSON.stringify({ sections: page.sections }),
        meta_title: page.meta_title || page.title,
        meta_description: page.meta_description,
        is_published: page.is_published
      };

      console.log('🔥 TemplatePageBuilder - pageData creato:', pageData);
      console.log('🔥 TemplatePageBuilder - contenuto_json string:', pageData.contenuto_json);

      await onSave(pageData);
    } catch (error) {
      console.error('Errore salvataggio:', error);
    } finally {
      setSaving(false);
    }
  };

  // Genera slug da titolo
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim() || 'pagina-senza-titolo';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingPage ? 'Modifica Pagina' : 'Crea Pagina da Template'}
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            {showPreview ? 'Nascondi' : 'Mostra'} Anteprima
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !page.title}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            {saving ? 'Salvataggio...' : (editingPage ? 'Salva Modifiche' : 'Salva Pagina')}
          </button>
        </div>
      </div>

      {/* Info base pagina */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Informazioni Pagina</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo Pagina *
            </label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => setPage(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Es: I Nostri Servizi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)
            </label>
            <input
              type="text"
              value={page.slug}
              onChange={(e) => setPage(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="servizi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title (SEO)
            </label>
            <input
              type="text"
              value={page.meta_title}
              onChange={(e) => setPage(prev => ({ ...prev, meta_title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Titolo per motori di ricerca"
              maxLength={60}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description (SEO)
            </label>
            <textarea
              value={page.meta_description}
              onChange={(e) => setPage(prev => ({ ...prev, meta_description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrizione per motori di ricerca"
              maxLength={160}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={page.is_published}
              onChange={(e) => setPage(prev => ({ ...prev, is_published: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Pubblica pagina</span>
          </label>
        </div>
      </div>

      {/* Selettori di sezioni */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Aggiungi Sezioni</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {sectionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => addSection(type.id)}
              className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                {type.icon}
              </div>
              <div className="font-medium text-gray-900 text-sm">
                {type.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {type.description}
              </div>
              <PlusIcon className="h-4 w-4 mx-auto mt-2 text-gray-400 group-hover:text-blue-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Sezioni aggiunte */}
      <div className="space-y-4">
        {page.sections.map((section, index) => renderSection(section, index))}
      </div>

      {/* Messaggio se nessuna sezione */}
      {page.sections.length === 0 && (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-gray-400 text-lg mb-2">Nessuna sezione aggiunta</div>
          <div className="text-gray-500">Clicca sui pulsanti sopra per aggiungere sezioni alla tua pagina</div>
        </div>
      )}

      {/* Anteprima */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-auto w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Anteprima Pagina</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{page.title || 'Pagina Senza Titolo'}</h1>
              <div className="space-y-8">
                {page.sections.map((section, index) => (
                  <div key={section.id} className="border-b border-gray-200 pb-8 last:border-0">
                    <div className="text-sm text-gray-500 mb-2">Sezione {index + 1}: {section.type}</div>
                    <div className="bg-gray-50 p-4 rounded">
                      {JSON.stringify(section.data, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePageBuilder;