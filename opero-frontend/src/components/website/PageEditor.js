/**
 * Page Editor Component
 * Editor visuale per i contenuti delle pagine web con sistema a blocchi
 */

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  Bars3Icon,
  XMarkIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  NewspaperIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

// Componenti per i blocchi
import TextBlock from './blocks/TextBlock';
import HeroBlock from './blocks/HeroBlock';
import ImageBlock from './blocks/ImageBlock';
import ContactBlock from './blocks/ContactBlock';
import ProductsBlock from './blocks/ProductsBlock';
import './PageEditor.css';

const PageEditor = ({ page, site, onSave, onCancel }) => {
  const [content, setContent] = useState({
    sections: []
  });
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [pageMeta, setPageMeta] = useState({
    titolo: page?.titolo || '',
    slug: page?.slug || '',
    meta_title: page?.meta_title || '',
    meta_description: page?.meta_description || '',
    is_published: page?.is_published || false,
    menu_order: page?.menu_order || 0
  });

  // Carica contenuto pagina esistente
  useEffect(() => {
    if (page?.contenuto_html) {
      try {
        // Se il contenuto è HTML vecchio formato, convertilo in sezioni
        if (typeof page.contenuto_html === 'string') {
          setContent({
            sections: [
              {
                id: 'section-1',
                type: 'text',
                content: page.contenuto_html
              }
            ]
          });
        } else {
          setContent(page.contenuto_html);
        }
      } catch (error) {
        console.error('Errore parsing contenuto:', error);
        setContent({ sections: [] });
      }
    }
  }, [page]);

  const blockTypes = [
    {
      type: 'hero',
      name: 'Hero Section',
      icon: GlobeAltIcon,
      description: 'Sezione principale con titolo, sottotitolo e bottone'
    },
    {
      type: 'text',
      name: 'Testo',
      icon: DocumentTextIcon,
      description: 'Blocco di testo con editor visuale'
    },
    {
      type: 'image',
      name: 'Immagine',
      icon: PhotoIcon,
      description: 'Immagine singola con didascalia'
    },
    {
      type: 'contact',
      name: 'Contatti',
      icon: PhoneIcon,
      description: 'Form contatti e informazioni aziendali'
    },
    {
      type: 'products',
      name: 'Prodotti',
      icon: NewspaperIcon,
      description: 'Vetrina prodotti dal catalogo'
    }
  ];

  const addSection = (type) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type: type,
      content: getDefaultContent(type)
    };

    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));

    setShowBlockSelector(false);
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case 'hero':
        return {
          title: 'Titolo Principale',
          subtitle: 'Sottotitolo descrittivo',
          buttonText: 'Scopri di più',
          buttonUrl: '#',
          backgroundImage: '',
          backgroundColor: '#3B82F6'
        };
      case 'text':
        return {
          html: '<h2>Titolo Sezione</h2><p>Inserisci qui il tuo contenuto...</p>'
        };
      case 'image':
        return {
          url: '',
          alt: 'Descrizione immagine',
          caption: 'Didascalia immagine',
          width: 'full'
        };
      case 'contact':
        return {
          showForm: true,
          showInfo: true,
          email: site?.email_azienda || 'info@example.com',
          phone: site?.tel1 || '+39 123 456789',
          address: site?.indirizzo || 'Via Roma 1, Milano'
        };
      case 'products':
        return {
          title: 'I Nostri Prodotti',
          showPrices: false,
          maxProducts: 6,
          columns: 3
        };
      default:
        return {};
    }
  };

  const updateSection = (sectionId, newContent) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, content: newContent }
          : section
      )
    }));
  };

  const deleteSection = (sectionId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa sezione?')) {
      setContent(prev => ({
        ...prev,
        sections: prev.sections.filter(section => section.id !== sectionId)
      }));
    }
  };

  const moveSection = (sectionId, direction) => {
    setContent(prev => {
      const sections = [...prev.sections];
      const index = sections.findIndex(s => s.id === sectionId);

      if (direction === 'up' && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
      } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      }

      return { ...prev, sections };
    });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Prepara i dati da salvare
      const pageData = {
        ...pageMeta,
        contenuto_html: content,
        contenuto_json: content // Salviamo anche come JSON per futuro uso
      };

      await onSave(pageData);
    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert('Errore durante il salvataggio della pagina');
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (section, index) => {
    const commonProps = {
      content: section.content,
      onChange: (newContent) => updateSection(section.id, newContent),
      site: site
    };

    return (
      <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
        {/* Header sezione */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bars3Icon className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">
                {blockTypes.find(b => b.type === section.type)?.name || section.type}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {index > 0 && (
                <button
                  onClick={() => moveSection(section.id, 'up')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Sposta su"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
              )}

              {index < content.sections.length - 1 && (
                <button
                  onClick={() => moveSection(section.id, 'down')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Sposta giù"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={() => deleteSection(section.id)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Elimina sezione"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenuto sezione */}
        <div className="p-4">
          {section.type === 'text' && <TextBlock {...commonProps} />}
          {section.type === 'hero' && <HeroBlock {...commonProps} />}
          {section.type === 'image' && <ImageBlock {...commonProps} />}
          {section.type === 'contact' && <ContactBlock {...commonProps} />}
          {section.type === 'products' && <ProductsBlock {...commonProps} />}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {page ? 'Modifica Pagina' : 'Nuova Pagina'}
          </h1>
          <p className="text-gray-600 mt-1">
            Sito: {site?.site_title} ({site?.subdomain}.operocloud.it)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
              previewMode
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            {previewMode ? 'Modifica' : 'Anteprima'}
          </button>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title (SEO)
            </label>
            <input
              type="text"
              value={pageMeta.meta_title}
              onChange={(e) => setPageMeta({...pageMeta, meta_title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Titolo per motori di ricerca"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordine Menu
            </label>
            <input
              type="number"
              value={pageMeta.menu_order}
              onChange={(e) => setPageMeta({...pageMeta, menu_order: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description (SEO)
            </label>
            <textarea
              value={pageMeta.meta_description}
              onChange={(e) => setPageMeta({...pageMeta, meta_description: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrizione per motori di ricerca (max 160 caratteri)"
              maxLength={160}
            />
            <p className="text-sm text-gray-500 mt-1">
              {pageMeta.meta_description?.length || 0}/160 caratteri
            </p>
          </div>

          <div className="md:col-span-2">
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
      </div>

      {/* Editor contenuto */}
      {previewMode ? (
        <div className="bg-gray-100 p-8 rounded-lg">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Preview delle sezioni */}
            {content.sections.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Nessun contenuto da visualizzare
              </div>
            ) : (
              content.sections.map((section) => {
                const commonProps = {
                  content: section.content,
                  site: site,
                  preview: true
                };

                switch (section.type) {
                  case 'hero':
                    return <HeroBlock key={section.id} {...commonProps} />;
                  case 'text':
                    return <TextBlock key={section.id} {...commonProps} />;
                  case 'image':
                    return <ImageBlock key={section.id} {...commonProps} />;
                  case 'contact':
                    return <ContactBlock key={section.id} {...commonProps} />;
                  case 'products':
                    return <ProductsBlock key={section.id} {...commonProps} />;
                  default:
                    return null;
                }
              })
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Lista sezioni */}
          {content.sections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessuna sezione
              </h3>
              <p className="text-gray-500 mb-4">
                Aggiungi la prima sezione per iniziare a costruire la pagina
              </p>
            </div>
          ) : (
            content.sections.map((section, index) => renderSection(section, index))
          )}

          {/* Add Section Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowBlockSelector(true)}
              className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Aggiungi Sezione
            </button>
          </div>
        </div>
      )}

      {/* Block Selector Modal */}
      {showBlockSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Scegli tipo di sezione</h3>
              <button
                onClick={() => setShowBlockSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blockTypes.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    onClick={() => addSection(block.type)}
                    className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left"
                  >
                    <Icon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">{block.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{block.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageEditor;