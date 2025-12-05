/**
 * @file StaticPagesManager.js
 * @description Componente per la gestione delle pagine statiche dei siti web
 * - Home page con hero section, services, testimonials
 * - Chi siamo con company story e team
 * - Contatti con mappa e form
 * - Blog con articoli
 * @version 1.0
 */

import React, { useState, useCallback } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  NewspaperIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const StaticPagesManager = ({ websiteId, pages, onPagesChange, onSave }) => {
  const [selectedPage, setSelectedPage] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);

  // Template pagine predefinite
  const pageTemplates = [
    {
      slug: 'home',
      title: 'Home Page',
      description: 'Pagina principale del sito web',
      icon: BuildingOfficeIcon,
      defaultContent: {
        sections: [
          {
            type: 'hero',
            title: 'Benvenuto nel Nostro Sito',
            subtitle: 'Scopri i nostri servizi e prodotti',
            backgroundImage: '',
            buttonText: 'Scopri di più',
            buttonLink: '#services'
          },
          {
            type: 'services',
            title: 'I Nostri Servizi',
            subtitle: 'Soluzioni innovative per la tua azienda',
            services: []
          },
          {
            type: 'testimonials',
            title: 'Dicono di Noi',
            subtitle: 'Cosa pensano i nostri clienti',
            testimonials: []
          },
          {
            type: 'cta',
            title: 'Pronto a Iniziare?',
            subtitle: 'Contattaci oggi per una consulenza gratuita',
            buttonText: 'Contattaci',
            buttonLink: '#contatti'
          }
        ]
      }
    },
    {
      slug: 'chi-siamo',
      title: 'Chi Siamo',
      description: 'La storia della nostra azienda',
      icon: BuildingOfficeIcon,
      defaultContent: {
        sections: [
          {
            type: 'company-story',
            title: 'La Nostra Storia',
            content: 'Dal [anno] ad oggi, il nostro impegno è...'
          },
          {
            type: 'mission',
            title: 'Missione e Visione',
            mission: 'La nostra missione è...',
            vision: 'La nostra visione per il futuro è...'
          },
          {
            type: 'team',
            title: 'Il Nostro Team',
            members: []
          }
        ]
      }
    },
    {
      slug: 'contatti',
      title: 'Contatti',
      description: 'Informazioni di contatto e mappa',
      icon: PhoneIcon,
      defaultContent: {
        sections: [
          {
            type: 'contact-info',
            title: 'Informazioni di Contatto',
            address: 'Via Roma 1, 00100 Roma, Italia',
            phone: '+39 06 123456',
            email: 'info@azienda.it',
            hours: 'Lun-Ven: 9:00-18:00'
          },
          {
            type: 'map',
            title: 'Dove Siamo',
            latitude: 41.9028,
            longitude: 12.4964,
            zoom: 15
          },
          {
            type: 'contact-form',
            title: 'Invia un Messaggio',
            fields: [
              { name: 'name', label: 'Nome', type: 'text', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'phone', label: 'Telefono', type: 'tel' },
              { name: 'message', label: 'Messaggio', type: 'textarea', required: true }
            ]
          }
        ]
      }
    },
    {
      slug: 'blog',
      title: 'Blog',
      description: 'Articoli e news dal settore',
      icon: NewspaperIcon,
      defaultContent: {
        sections: [
          {
            type: 'featured-articles',
            title: 'Articoli in Evidenza',
            count: 3
          },
          {
            type: 'categories',
            title: 'Categorie',
            categories: []
          }
        ]
      }
    }
  ];

  // Crea nuova pagina
  const createPage = useCallback(async (template) => {
    try {
      setSaving(true);

      const newPage = {
        id_sito_web: websiteId,
        slug: template.slug,
        titolo: template.title,
        contenuto_json: template.defaultContent,
        meta_title: template.title,
        meta_description: template.description,
        is_published: false,
        menu_order: pages.length
      };

      if (editingPage?.id) {
        // Update pagina esistente
        await api.put(`/website/${websiteId}/pages/${editingPage.id}`, newPage);
        setEditingPage(null);
      } else {
        // Create nuova pagina
        const response = await api.post(`/website/${websiteId}/pages`, newPage);
        newPage.id = response.data.id;
        onPagesChange([...pages, newPage]);
      }

      setShowEditor(false);
      onSave('pages', pages);

    } catch (error) {
      console.error('Errore creazione pagina:', error);
    } finally {
      setSaving(false);
    }
  }, [websiteId, pages, editingPage, onPagesChange, onSave]);

  // Elimina pagina
  const deletePage = useCallback(async (pageId) => {
    if (!confirm('Sei sicuro di voler eliminare questa pagina?')) return;

    try {
      await api.delete(`/website/${websiteId}/pages/${pageId}`);
      onPagesChange(pages.filter(p => p.id !== pageId));
      onSave('pages', pages);
    } catch (error) {
      console.error('Errore eliminazione pagina:', error);
    }
  }, [websiteId, pages, onPagesChange, onSave]);

  // Pubblica/depubblica pagina
  const togglePagePublish = useCallback(async (page) => {
    try {
      const updatedPage = { ...page, is_published: !page.is_published };
      await api.put(`/website/${websiteId}/pages/${page.id}`, updatedPage);
      onPagesChange(pages.map(p => p.id === page.id ? updatedPage : p));
      onSave('pages', pages);
    } catch (error) {
      console.error('Errore pubblicazione pagina:', error);
    }
  }, [websiteId, pages, onPagesChange, onSave]);

  // Editor per pagina specifica
  const PageEditor = ({ page, template, onClose }) => {
    const [content, setContent] = useState(page?.contenuto_json || template.defaultContent);

    const savePage = async () => {
      try {
        setSaving(true);

        const pageData = {
          titolo: page?.titolo || template.title,
          contenuto_json: content,
          meta_title: page?.meta_title || template.title,
          meta_description: page?.meta_description || template.description
        };

        await api.put(`/website/${websiteId}/pages/${page.id}`, pageData);
        onPagesChange(pages.map(p => p.id === page.id ? { ...p, ...pageData } : p));
        onClose();
      } catch (error) {
        console.error('Errore salvataggio pagina:', error);
      } finally {
        setSaving(false);
      }
    };

    const renderSectionEditor = (section, index) => {
      switch (section.type) {
        case 'hero':
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Hero Section</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Titolo"
                  value={section.title || ''}
                  onChange={(e) => {
                    const newContent = { ...content };
                    newContent.sections[index].title = e.target.value;
                    setContent(newContent);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Sottotitolo"
                  value={section.subtitle || ''}
                  onChange={(e) => {
                    const newContent = { ...content };
                    newContent.sections[index].subtitle = e.target.value;
                    setContent(newContent);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Testo pulsante"
                    value={section.buttonText || ''}
                    onChange={(e) => {
                      const newContent = { ...content };
                      newContent.sections[index].buttonText = e.target.value;
                      setContent(newContent);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Link pulsante"
                    value={section.buttonLink || ''}
                    onChange={(e) => {
                      const newContent = { ...content };
                      newContent.sections[index].buttonLink = e.target.value;
                      setContent(newContent);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          );

        case 'services':
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Sezione Servizi</h4>
              <input
                type="text"
                placeholder="Titolo sezione"
                value={section.title || ''}
                onChange={(e) => {
                  const newContent = { ...content };
                  newContent.sections[index].title = e.target.value;
                  setContent(newContent);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
              />
              <textarea
                placeholder="Sottotitolo sezione"
                value={section.subtitle || ''}
                onChange={(e) => {
                  const newContent = { ...content };
                  newContent.sections[index].subtitle = e.target.value;
                  setContent(newContent);
                }}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          );

        case 'contact-info':
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Informazioni di Contatto</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Indirizzo"
                  value={section.address || ''}
                  onChange={(e) => {
                    const newContent = { ...content };
                    newContent.sections[index].address = e.target.value;
                    setContent(newContent);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Telefono"
                  value={section.phone || ''}
                  onChange={(e) => {
                    const newContent = { ...content };
                    newContent.sections[index].phone = e.target.value;
                    setContent(newContent);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={section.email || ''}
                  onChange={(e) => {
                    const newContent = { ...content };
                    newContent.sections[index].email = e.target.value;
                    setContent(newContent);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Orari di apertura"
                  value={section.hours || ''}
                  onChange={(e) => {
                    const newContent = { ...content };
                    newContent.sections[index].hours = e.target.value;
                    setContent(newContent);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          );

        default:
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Sezione {section.type}</h4>
              <ReactQuill
                value={section.content || ''}
                onChange={(value) => {
                  const newContent = { ...content };
                  newContent.sections[index].content = value;
                  setContent(newContent);
                }}
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>
          );
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Modifica: {page?.titolo || template.title}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            <div className="space-y-4">
              {content.sections?.map((section, index) => renderSectionEditor(section, index))}

              <button
                onClick={() => {
                  const newContent = { ...content };
                  newContent.sections.push({
                    type: 'text',
                    content: '',
                    title: 'Nuova Sezione'
                  });
                  setContent(newContent);
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                + Aggiungi Sezione
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              onClick={savePage}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Lista pagine esistenti */}
      {pages.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pagine Esistenti</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pages.map((page) => {
              const template = pageTemplates.find(t => t.slug === page.slug);
              const Icon = template?.icon || DocumentTextIcon;

              return (
                <div key={page.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">{page.titolo}</h4>
                        <p className="text-sm text-gray-500">
                          /{page.slug} • {template?.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {page.is_published ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Pubblicata
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          Bozza
                        </span>
                      )}

                      <button
                        onClick={() => setSelectedPage(page)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Anteprima"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => setEditingPage(page)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Modifica"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => togglePagePublish(page)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title={page.is_published ? 'Rendi privata' : 'Pubblica'}
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => deletePage(page.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Elimina"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Template pagine disponibili */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Crea Nuova Pagina</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pageTemplates.map((template) => {
              const Icon = template.icon;
              const exists = pages.some(p => p.slug === template.slug);

              return (
                <div
                  key={template.slug}
                  className={`border rounded-lg p-4 ${
                    exists
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-gray-300 hover:border-blue-400 cursor-pointer hover:bg-blue-50'
                  }`}
                  onClick={() => !exists && createPage(template)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {template.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                    {exists ? (
                      <span className="text-sm text-green-600">Già creata</span>
                    ) : (
                      <PlusIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modali */}
      {showEditor && (
        <PageEditor
          page={editingPage}
          template={pageTemplates.find(t => t.slug === editingPage?.slug)}
          onClose={() => {
            setShowEditor(false);
            setEditingPage(null);
          }}
        />
      )}

      {selectedPage && (
        <PagePreview
          page={selectedPage}
          onClose={() => setSelectedPage(null)}
        />
      )}
    </div>
  );
};

// Componente anteprima pagina
const PagePreview = ({ page, onClose }) => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    // Carica contenuto HTML generato dal backend
    api.get(`/website/${page.id_sito_web}/preview/${page.slug}`)
      .then(response => setContent(response.data.html))
      .catch(error => console.error('Errore caricamento preview:', error));
  }, [page]);

  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Anteprima: {page.titolo}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="p-4"
          />
        </div>
      </div>
    </div>
  );
};

export default StaticPagesManager;