/**
 * Simple Page Builder
 * Entry point semplificato per creare pagine web con wizard guidato
 */

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  GlobeAltIcon,
  PhotoIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  EyeIcon,
  PencilIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

// Importa il PageEditor esistente
import PageEditor from './PageEditor';
import { api } from '../../services/api';

const SimplePageBuilder = ({ websiteId, initialPage = null, site, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [page, setPage] = useState({
    title: initialPage?.titolo || '',
    slug: initialPage?.slug || '',
    sections: initialPage?.contenuto_json?.sections || [],
    meta_title: initialPage?.meta_title || '',
    meta_description: initialPage?.meta_description || '',
    is_published: initialPage?.is_published || false,
    menu_order: initialPage?.menu_order || 0,
    templateName: initialPage?.template_name || '' // Carica dal DB se disponibile
  });

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  // Definizione dei passaggi del wizard
  const steps = [
    { number: 1, title: 'Informazioni Base', icon: '📝' },
    { number: 2, title: 'Contenuti', icon: '🏗️' },
    { number: 3, title: 'Impostazioni SEO', icon: '🔍' },
    { number: 4, title: 'Anteprima', icon: '👁️' }
  ];

  // Template rapidi
  const quickTemplates = [
    {
      name: 'Pagina Servizi',
      icon: '🔧',
      description: 'Presenta i servizi della tua azienda',
      sections: [
        { type: 'hero', title: 'I Nostri Servizi', subtitle: 'Soluzioni professionali per le tue esigenze', buttonText: 'Scopri di più', buttonUrl: '#contatti', backgroundColor: '#3B82F6' },
        { type: 'text', content: '<h2>I Nostri Servizi</h2><p>Siamo specializzati in...</p>' }
      ]
    },
    {
      name: 'Chi Siamo',
      icon: '👥',
      description: 'La storia della tua azienda',
      sections: [
        { type: 'hero', title: 'Chi Siamo', subtitle: 'La nostra storia e la nostra passione', buttonText: 'Contattaci', buttonUrl: '#contatti', backgroundColor: '#10B981' },
        { type: 'text', content: '<h2>La Nostra Storia</h2><p>Dal nostro fondo...</p>' }
      ]
    },
    {
      name: 'Contatti',
      icon: '📞',
      description: 'Form contatti e informazioni',
      sections: [
        { type: 'hero', title: 'Contattaci', subtitle: 'Siamo qui per aiutarti', buttonText: 'Scrivici', buttonUrl: '#form', backgroundColor: '#6366F1' },
        { type: 'contact', showForm: true, showInfo: true, email: '', phone: '', address: '' }
      ]
    },
    {
      name: 'Galleria',
      icon: '🖼️',
      description: 'Mostra i tuoi lavori',
      sections: [
        { type: 'hero', title: 'I Nostri Lavori', subtitle: 'Una selezione dei nostri progetti migliori', buttonText: 'Vedi tutti', buttonUrl: '#galleria', backgroundColor: '#F59E0B' },
        { type: 'gallery', title: 'Galleria Fotografica', columns: 3 }
      ]
    }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!page.title.trim()) newErrors.title = 'Il titolo è obbligatorio';
      if (!page.slug.trim()) newErrors.slug = 'Lo slug è obbligatorio';
      if (page.slug && !/^[a-z0-9-]+$/.test(page.slug)) {
        newErrors.slug = 'Lo slug può contenere solo lettere minuscole, numeri e trattini';
      }
    }

    if (step === 3) {
      if (page.meta_description && page.meta_description.length > 160) {
        newErrors.meta_description = 'La meta description non può superare 160 caratteri';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleQuickTemplate = (template) => {
    setPage(prev => ({
      ...prev,
      title: template.name,
      slug: template.name.toLowerCase().replace(/\s+/g, '-'),
      sections: template.sections,
      meta_title: template.name,
      meta_description: `Pagina ${template.name.toLowerCase()} di ${site?.site_title || 'azienda'}`,
      templateName: template.name
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const pageData = {
        slug: page.slug,
        titolo: page.title,
        contenuto_html: { sections: page.sections },
        contenuto_json: { sections: page.sections },
        meta_title: page.meta_title || page.title,
        meta_description: page.meta_description || '',
        is_published: page.is_published,
        menu_order: page.menu_order,
        template_name: page.templateName // Save the template used
      };

      if (initialPage?.id) {
        await api.put(`/website/${websiteId}/pages/${initialPage.id}`, pageData);
      } else {
        await api.post(`/website/${websiteId}/pages`, pageData);
      }

      if (onSave) onSave();

    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert('Errore durante il salvataggio della pagina');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">🚀 Inizia Veloce</h3>
              <p className="text-blue-700 text-sm mb-4">Scegli un template predefinito per iniziare subito</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickTemplate(template)}
                    className="bg-white border border-blue-200 rounded-lg p-3 hover:bg-blue-50 text-left transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-600">{template.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo Pagina *
                </label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Es: I Nostri Servizi"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug URL *
                </label>
                <input
                  type="text"
                  value={page.slug}
                  onChange={(e) => setPage({
                    ...page,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="servizi"
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  URL: https://{site?.subdomain || 'sottodominio'}.operocloud.it/{page.slug}
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Riepilogo template utilizzato */}
            {page.templateName && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Template utilizzato:</strong> {page.templateName}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Puoi modificare i contenuti usando l'editor qui sotto
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    Cambia Template
                  </button>
                </div>
              </div>
            )}

            {!page.templateName && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>💡 Suggerimento:</strong> Usa i blocchi per costruire la tua pagina. Puoi aggiungere testo, immagini, contatti e molto altro.
                </p>
              </div>
            )}

            <PageEditor
              page={{
                titolo: page.title,
                slug: page.slug,
                contenuto_html: { sections: page.sections },
                contenuto_json: { sections: page.sections },
                meta_title: page.meta_title,
                meta_description: page.meta_description,
                is_published: page.is_published,
                menu_order: page.menu_order
              }}
              site={site}
              onSave={async (pageData) => {
                try {
                  setSaving(true);

                  const saveData = {
                    slug: page.slug,
                    titolo: page.title,
                    contenuto_html: pageData.contenuto_html,
                    contenuto_json: pageData.contenuto_json,
                    meta_title: page.meta_title || page.title,
                    meta_description: page.meta_description || '',
                    is_published: page.is_published,
                    menu_order: page.menu_order,
                    template_name: page.templateName // Save also the template used
                  };

                  if (initialPage?.id) {
                    await api.put(`/website/${websiteId}/pages/${initialPage.id}`, saveData);
                  } else {
                    await api.post(`/website/${websiteId}/pages`, saveData);
                  }

                  setPage(prev => ({
                    ...prev,
                    sections: pageData.contenuto_json?.sections || []
                  }));

                  if (onSave) onSave();

                } catch (error) {
                  console.error('Errore salvataggio:', error);
                  alert('Errore durante il salvataggio');
                } finally {
                  setSaving(false);
                }
              }}
              onCancel={() => {}}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ottimizzazione SEO</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title (Titolo per Google)
                  </label>
                  <input
                    type="text"
                    value={page.meta_title}
                    onChange={(e) => setPage({ ...page, meta_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder={page.title || 'Titolo della pagina'}
                    maxLength={60}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {page.meta_title?.length || 0}/60 caratteri (ottimale per Google)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description (Descrizione per Google)
                  </label>
                  <textarea
                    value={page.meta_description}
                    onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.meta_description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Breve descrizione della pagina per i motori di ricerca"
                    maxLength={160}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {page.meta_description?.length || 0}/160 caratteri
                  </p>
                  {errors.meta_description && (
                    <p className="text-red-500 text-sm mt-1">{errors.meta_description}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={page.is_published}
                      onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Pubblica subito la pagina
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">
                    {!page.is_published ? 'La pagina sarà salvata come bozza' : 'La pagina sarà visibile pubblicamente'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">📊 Anteprima Google</h4>
              <div className="bg-white border rounded p-3 max-w-md">
                <div className="text-blue-700 text-sm hover:underline cursor-pointer">
                  {page.meta_title || page.title} - {site?.site_title || 'Nome Azienda'}
                </div>
                <div className="text-green-700 text-sm">
                  https://{site?.subdomain || 'sottodominio'}.operocloud.it/{page.slug}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {page.meta_description || `Pagina ${page.title} di ${site?.site_title || 'Nome Azienda'}`}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Riepilogo Pagina</h3>

              <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Titolo:</span>
                    <span className="text-gray-900">{page.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">URL:</span>
                    <span className="text-blue-600 text-sm">
                      /{page.slug}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Numero sezioni:</span>
                    <span className="text-gray-900">{page.sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Stato:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      page.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.is_published ? 'Pubblicata' : 'Bozza'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowPreview(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Anteprima Live
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Wizard */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {initialPage ? 'Modifica Pagina' : 'Crea Nuova Pagina'}
            </h1>
            <p className="text-gray-600">
              {initialPage?.id ? `Pagina ID: ${initialPage.id}` : `Sito: ${site?.site_title || 'N/D'}`}
            </p>
          </div>
          <button
            onClick={() => setCurrentStep(1)}
            className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
          >
            📝 Cambia Template
          </button>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-center ${
                currentStep > step.number ? 'text-green-600' :
                currentStep === step.number ? 'text-blue-600' :
                'text-gray-400'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep > step.number
                  ? 'bg-green-600 border-green-600 text-white'
                  : currentStep === step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 bg-white'
              }`}>
                {currentStep > step.number ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs">{step.icon}</div>
              </div>
              {step.number < steps.length && (
                <div className={`w-8 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenuto Step */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Azioni */}
      <div className="flex justify-between items-center">
        <div>
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Indietro
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Annulla
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Avanti
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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
          )}
        </div>
      </div>

      {/* Modal Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Anteprima Pagina</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <div className="border rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4">{page.title}</h1>
                {page.sections.length === 0 ? (
                  <p className="text-gray-500">Nessun contenuto da visualizzare</p>
                ) : (
                  page.sections.map((section, index) => (
                    <div key={index} className="mb-6">
                      {section.type === 'hero' && (
                        <div className="text-center p-8 bg-gray-100 rounded-lg">
                          <h2 className="text-3xl font-bold mb-2">{section.title}</h2>
                          {section.subtitle && <p className="text-gray-600 mb-4">{section.subtitle}</p>}
                          {section.buttonText && (
                            <button className="px-6 py-2 bg-blue-600 text-white rounded">
                              {section.buttonText}
                            </button>
                          )}
                        </div>
                      )}
                      {section.type === 'text' && (
                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                      )}
                      {section.type === 'contact' && (
                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold mb-4">Contatti</h3>
                          <p>Informazioni di contatto...</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplePageBuilder;