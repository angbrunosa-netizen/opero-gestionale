/**
 * @file WebsiteBuilder.js
 * @description Componente completo per la gestione siti web aziendali
 * - Gestione contenuti pagine statiche (home, chi siamo, etc.)
 * - Personalizzazione template e colori
 * - Integrazione AllegatiManager per immagini
 * - Gestione catalogo prodotti dinamico (future ecommerce)
 * @version 1.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BuildingStorefrontIcon,
  PaintBrushIcon,
  PhotoIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  EyeIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import AllegatiManager from '../shared/AllegatiManager';

// Sotto-componenti
import StaticPagesManager from './website/StaticPagesManager';
import TemplateCustomizer from './website/TemplateCustomizer';
import ImageGalleryManager from './website/ImageGalleryManager';
import CatalogManager from './website/CatalogManager';
import WebsitePreview from './website/WebsitePreview';

const WebsiteBuilder = () => {
  const { user, currentDitta } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showAllegatiManager, setShowAllegatiManager] = useState(false);

  // Stati per diverse sezioni
  const [templateConfig, setTemplateConfig] = useState({});
  const [pages, setPages] = useState([]);
  const [images, setImages] = useState([]);
  const [catalogSettings, setCatalogSettings] = useState({});

  // Refs per ottimizzazione
  const saveTimeoutRef = useRef(null);

  // Carica dati sito web
  const loadWebsiteData = useCallback(async () => {
    if (!currentDitta) return;

    try {
      setLoading(true);
      setError(null);

      const [websiteRes, pagesRes, imagesRes, catalogRes] = await Promise.all([
        api.get(`/website/${currentDitta}`),
        api.get(`/website/${currentDitta}/pages`),
        api.get(`/website/${currentDitta}/images`),
        api.get(`/website/${currentDitta}/catalog-settings`)
      ]);

      setWebsiteData(websiteRes.data.website);
      setTemplateConfig(websiteRes.data.website?.template_config || {});
      setPages(pagesRes.data.pages || []);
      setImages(imagesRes.data.images || []);
      setCatalogSettings(catalogRes.data.settings || {});

    } catch (error) {
      console.error('Errore caricamento dati sito:', error);
      setError('Impossibile caricare i dati del sito web');
    } finally {
      setLoading(false);
    }
  }, [currentDitta]);

  // Auto-save con debounce
  const autoSave = useCallback((section, data) => {
    if (!websiteData?.id) return;

    // Clear timeout precedente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Imposta nuovo timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await api.put(`/website/${websiteData.id}`, {
          section,
          data
        });
        setSuccess('Dati salvati automaticamente');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.error('Errore auto-save:', error);
        setError('Errore nel salvataggio automatico');
      } finally {
        setSaving(false);
      }
    }, 2000); // 2 secondi di debounce
  }, [websiteData?.id]);

  // Creazione nuovo sito web
  const createWebsite = async () => {
    if (!currentDitta) return;

    try {
      setLoading(true);
      const response = await api.post('/website/create', {
        id_ditta: currentDitta,
        subdomain: `company${Date.now()}`,
        site_title: `Sito Web - ${user.nome} ${user.cognome}`,
        template_config: {
          theme: 'professional',
          primary_color: '#3B82F6',
          secondary_color: '#1E40AF',
          font_family: 'Inter'
        }
      });

      setWebsiteData(response.data.website);
      setTemplateConfig(response.data.website.template_config);
      setSuccess('Sito web creato con successo!');

      // Ricarica dati completi
      await loadWebsiteData();

    } catch (error) {
      console.error('Errore creazione sito:', error);
      setError('Impossibile creare il sito web');
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna configurazione template
  const updateTemplateConfig = useCallback((config) => {
    setTemplateConfig(config);
    autoSave('template_config', config);
  }, [autoSave]);

  // Gestione immagini
  const handleImageUpload = async (uploadedFiles) => {
    if (!websiteData?.id) return;

    try {
      const newImages = await Promise.all(
        uploadedFiles.map(async (file) => {
          // Usa AllegatiManager per caricare su dm_files
          const formData = new FormData();
          formData.append('file', file.file);
          formData.append('entita_tipo', 'WEBSITE_IMAGES');
          formData.append('entita_id', websiteData.id);
          formData.append('id_ditta', currentDitta);

          const response = await api.post('/documenti/upload', formData);

          return {
            id: response.data.id_file,
            name: file.name,
            url: response.data.url,
            type: file.type,
            size: file.size,
            category: 'website',
            created_at: new Date().toISOString()
          };
        })
      );

      setImages(prev => [...newImages, ...prev]);
      setSuccess('Immagini caricate con successo');

    } catch (error) {
      console.error('Errore upload immagini:', error);
      setError('Errore nel caricamento delle immagini');
    }
  };

  // Gestione immagini sito web
  const handleWebsiteImageSelect = (selectedFiles) => {
    const websiteImages = selectedFiles.filter(file =>
      file.mime_type?.startsWith('image/')
    );
    handleImageUpload(websiteImages);
    setShowAllegatiManager(false);
  };

  // Elimina immagine
  const deleteImage = async (imageId) => {
    try {
      await api.delete(`/website/${websiteData.id}/images/${imageId}`);
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSuccess('Immagine eliminata');
    } catch (error) {
      console.error('Errore eliminazione immagine:', error);
      setError('Errore nell\'eliminazione dell\'immagine');
    }
  };

  // Pubblica sito web
  const publishWebsite = async () => {
    if (!websiteData?.id) return;

    try {
      setSaving(true);
      await api.post(`/website/${websiteData.id}/publish`);
      setSuccess('Sito web pubblicato con successo!');
    } catch (error) {
      console.error('Errore pubblicazione:', error);
      setError('Errore nella pubblicazione del sito web');
    } finally {
      setSaving(false);
    }
  };

  // Preview sito web
  const openPreview = () => {
    setPreviewMode(true);
  };

  useEffect(() => {
    if (currentDitta) {
      loadWebsiteData();
    }
  }, [currentDitta, loadWebsiteData]);

  if (loading && !websiteData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BuildingStorefrontIcon className="h-8 w-8 mr-3 text-blue-600" />
              Website Builder
            </h1>
            <p className="text-gray-600 mt-2">
              Crea e gestisci il sito web della tua azienda
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {websiteData?.subdomain && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">URL:</span>{' '}
                <a
                  href={`https://${websiteData.subdomain}.operocloud.it`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {websiteData.subdomain}.operocloud.it
                </a>
              </div>
            )}

            {websiteData && (
              <>
                <button
                  onClick={openPreview}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Anteprima
                </button>

                <button
                  onClick={publishWebsite}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <GlobeAltIcon className="h-5 w-5 mr-2" />
                  {saving ? 'Pubblicazione...' : 'Pubblica Sito'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stati e notifiche */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {saving && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-700">Salvataggio automatico...</span>
          </div>
        )}
      </div>

      {/* Nessun sito creato */}
      {!websiteData && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <BuildingStorefrontIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun sito web configurato
          </h3>
          <p className="text-gray-600 mb-6">
            Crea il tuo sito web professionale in pochi minuti
          </p>
          <button
            onClick={createWebsite}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            Crea il tuo sito web
          </button>
        </div>
      )}

      {/* Sito web esistente */}
      {websiteData && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: 'Panoramica', icon: BuildingStorefrontIcon },
                { id: 'pages', name: 'Pagine Statiche', icon: DocumentTextIcon },
                { id: 'template', name: 'Aspetto', icon: PaintBrushIcon },
                { id: 'images', name: 'Immagini', icon: PhotoIcon },
                { id: 'catalog', name: 'Catalogo', icon: ShoppingBagIcon },
                { id: 'settings', name: 'Impostazioni', icon: Cog6ToothIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {activeTab === 'overview' && (
              <WebsiteOverview
                websiteData={websiteData}
                pages={pages}
                images={images}
                catalogSettings={catalogSettings}
              />
            )}

            {activeTab === 'pages' && (
              <StaticPagesManager
                websiteId={websiteData.id}
                pages={pages}
                onPagesChange={setPages}
                onSave={autoSave}
              />
            )}

            {activeTab === 'template' && (
              <TemplateCustomizer
                config={templateConfig}
                onConfigChange={updateTemplateConfig}
              />
            )}

            {activeTab === 'images' && (
              <ImageGalleryManager
                images={images}
                onUpload={handleImageUpload}
                onDelete={deleteImage}
                onOpenAllegatiManager={() => setShowAllegatiManager(true)}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogManager
                websiteId={websiteData.id}
                companyId={currentDitta}
                settings={catalogSettings}
                onSettingsChange={setCatalogSettings}
                onSave={autoSave}
              />
            )}

            {activeTab === 'settings' && (
              <WebsiteSettings
                websiteData={websiteData}
                onUpdate={loadWebsiteData}
              />
            )}
          </div>
        </>
      )}

      {/* Modal AllegatiManager */}
      {showAllegatiManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Seleziona Immagini dal Documentale</h3>
              <button
                onClick={() => setShowAllegatiManager(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <AllegatiManager
                entitaTipo="WEBSITE_IMAGES"
                entitaId={websiteData?.id}
                onFileSelect={handleWebsiteImageSelect}
                allowMultiple={true}
                filterType="image"
                showOnly={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {previewMode && websiteData && (
        <WebsitePreview
          websiteData={websiteData}
          templateConfig={templateConfig}
          pages={pages}
          images={images}
          onClose={() => setPreviewMode(false)}
        />
      )}
    </div>
  );
};

// Componente Panoramica
const WebsiteOverview = ({ websiteData, pages, images, catalogSettings }) => {
  const stats = [
    { name: 'Pagine Pubblicate', value: pages.filter(p => p.is_published).length, icon: DocumentTextIcon },
    { name: 'Immagini Caricate', value: images.length, icon: PhotoIcon },
    { name: 'Prodotti Catalogo', value: catalogSettings.total_products || 0, icon: ShoppingBagIcon },
    { name: 'Stato Sito', value: websiteData.domain_status, icon: GlobeAltIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
            Modifica Home Page
          </button>
          <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <PhotoIcon className="h-5 w-5 text-blue-600 mr-2" />
            Carica Nuove Immagini
          </button>
          <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <ShoppingBagIcon className="h-5 w-5 text-blue-600 mr-2" />
            Configura Catalogo
          </button>
        </div>
      </div>

      {/* Site Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informazioni Sito</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-600">Subdomain</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {websiteData.subdomain}.operocloud.it
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Stato</dt>
            <dd className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                websiteData.domain_status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {websiteData.domain_status === 'active' ? 'Attivo' : 'In Costruzione'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Template</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {websiteData.template_id || 'Professional'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Ultima modifica</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(websiteData.updated_at).toLocaleDateString('it-IT')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

// Componente Impostazioni
const WebsiteSettings = ({ websiteData, onUpdate }) => {
  const [formData, setFormData] = useState({
    site_title: websiteData?.site_title || '',
    site_description: websiteData?.site_description || '',
    subdomain: websiteData?.subdomain || '',
    google_analytics_id: websiteData?.google_analytics_id || '',
    facebook_url: websiteData?.facebook_url || '',
    instagram_url: websiteData?.instagram_url || '',
    linkedin_url: websiteData?.linkedin_url || ''
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/website/${websiteData.id}`, {
        section: 'settings',
        data: formData
      });
      await onUpdate();
    } catch (error) {
      console.error('Errore salvataggio impostazioni:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informazioni Sito</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titolo Sito
            </label>
            <input
              type="text"
              value={formData.site_title}
              onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nome del sito web"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain
            </label>
            <div className="flex">
              <input
                type="text"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                placeholder="azienda"
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-lg">
                .operocloud.it
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrizione Sito
          </label>
          <textarea
            value={formData.site_description}
            onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Breve descrizione del sito web per SEO"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook URL
            </label>
            <input
              type="url"
              value={formData.facebook_url}
              onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://facebook.com/tuaazienda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram URL
            </label>
            <input
              type="url"
              value={formData.instagram_url}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://instagram.com/tuaazienda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://linkedin.com/company/tuaazienda"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Analytics ID
          </label>
          <input
            type="text"
            value={formData.google_analytics_id}
            onChange={(e) => setFormData({ ...formData, google_analytics_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="GA_MEASUREMENT_ID"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
        </button>
      </div>
    </form>
  );
};

export default WebsiteBuilder;