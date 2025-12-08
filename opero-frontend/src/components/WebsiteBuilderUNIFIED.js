/**
 * @file WebsiteBuilderUNIFIED.js
 * @description Componente UNIFICATO per la gestione siti web aziendali
 * - Gestione configurazione sito (impotazioni base)
 * - Gestione contenuti (pagine statiche)
 * - Personalizzazione template e colori
 * - Gestione gallerie fotografiche
 * - Gestione catalogo prodotti
 * - SEO e Analytics
 * @version 2.0 - Componente unificato
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  GlobeAltIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  ServerIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  SparklesIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Import componenti specializzati
import TemplateCustomizer from './website/TemplateCustomizer';
import StaticPagesManager from './website/StaticPagesManager';
import ImageGalleryManager from './website/ImageGalleryManager';
import { api } from '../services/api';

const WebsiteBuilderUNIFIED = ({
  site: initialSite,
  onSave,
  onCancel,
  mode = 'edit' // 'edit' | 'create'
}) => {
  // Stati principali
  const [site, setSite] = useState(initialSite || {});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Stati per sezioni specifiche
  const [templateConfig, setTemplateConfig] = useState({});
  const [pages, setPages] = useState([]);
  const [images, setImages] = useState([]);
  const [catalogSettings, setCatalogSettings] = useState({});

  // Stati per configurazione sito
  const [siteConfig, setSiteConfig] = useState({
    subdomain: site?.subdomain || '',
    site_title: site?.site_title || '',
    site_description: site?.site_description || '',
    template_id: site?.template_id || 1,
    enable_catalog: site?.enable_catalog || false,
    domain_status: site?.domain_status || 'pending',
    logo_url: site?.logo_url || '',
    favicon_url: site?.favicon_url || '',
    google_analytics_id: site?.google_analytics_id || '',
    facebook_url: site?.facebook_url || '',
    instagram_url: site?.instagram_url || '',
    linkedin_url: site?.linkedin_url || '',
    catalog_settings: site?.catalog_settings || {}
  });

  // Definizione tabs unificati
  const tabs = [
    {
      id: 'overview',
      name: 'Panoramica',
      icon: GlobeAltIcon,
      description: 'Stato e configurazione generale'
    },
    {
      id: 'pages',
      name: 'Pagine Statiche',
      icon: DocumentTextIcon,
      description: 'Gestione contenuti delle pagine'
    },
    {
      id: 'template',
      name: 'Aspetto',
      icon: PaintBrushIcon,
      description: 'Colori, font e layout'
    },
    {
      id: 'images',
      name: 'Media',
      icon: PhotoIcon,
      description: 'Immagini e gallerie'
    },
    {
      id: 'catalog',
      name: 'Catalogo',
      icon: ShoppingBagIcon,
      description: 'Prodotti e servizi'
    },
    {
      id: 'seo',
      name: 'SEO & Analytics',
      icon: ChartBarIcon,
      description: 'Ottimizzazione motori di ricerca'
    },
    {
      id: 'settings',
      name: 'Impostazioni',
      icon: Cog6ToothIcon,
      description: 'Configurazione avanzata'
    }
  ];

  // Caricamento dati sito
  const loadSiteData = useCallback(async () => {
    if (!site?.id && !initialSite?.id) return;

    setLoading(true);
    setError(null);

    try {
      const siteId = site?.id || initialSite?.id;

      // Carica dati completi
      console.log('🔥 WebsiteBuilderUNIFIED: Caricamento immagini per sito', siteId);
      const [websiteRes, pagesRes, imagesRes, catalogRes] = await Promise.all([
        api.get(`/website/${siteId}`),
        api.get(`/website/${siteId}/pages`),
        api.get(`/website/${siteId}/images`),
        api.get(`/website/${siteId}/catalog-settings`)
      ]);

      // DEBUG: Controlla risposta delle immagini
      console.log('🔥 WebsiteBuilderUNIFIED - Risposta images:', {
        status: imagesRes.status,
        data: imagesRes.data,
        success: imagesRes.data.success,
        images: imagesRes.data.images,
        imagesCount: imagesRes.data.images?.length || 0
      });

      const websiteData = websiteRes.data.website || {};

      setSite(websiteData);
      setSiteConfig({
        subdomain: websiteData.subdomain || '',
        site_title: websiteData.site_title || '',
        site_description: websiteData.site_description || '',
        template_id: websiteData.template_id || 1,
        enable_catalog: websiteData.enable_catalog || false,
        domain_status: websiteData.domain_status || 'pending',
        logo_url: websiteData.logo_url || '',
        favicon_url: websiteData.favicon_url || '',
        google_analytics_id: websiteData.google_analytics_id || '',
        facebook_url: websiteData.facebook_url || '',
        instagram_url: websiteData.instagram_url || '',
        linkedin_url: websiteData.linkedin_url || '',
        catalog_settings: websiteData.catalog_settings || {}
      });

      setTemplateConfig(websiteData.template_config || {});
      setPages(pagesRes.data.pages || []);
      setImages(imagesRes.data.images || []);
      setCatalogSettings(catalogRes.data.settings || {});

    } catch (error) {
      console.error('Errore caricamento dati sito:', error);
      setError('Impossibile caricare i dati del sito web');
    } finally {
      setLoading(false);
    }
  }, [site?.id, initialSite?.id]);

  // Auto-save con debounce
  const autoSave = useCallback((section, data) => {
    if (!site?.id && !initialSite?.id) return;

    // Clear timeout precedente
    if (window.siteSaveTimeout) {
      clearTimeout(window.siteSaveTimeout);
    }

    // Imposta nuovo timeout
    window.siteSaveTimeout = setTimeout(async () => {
      try {
        setSaving(true);
        const siteId = site?.id || initialSite?.id;
        await api.put(`/website/${siteId}`, { section, data });
        setSuccess('Dati salvati automaticamente');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.error('Errore auto-save:', error);
        setError('Errore nel salvataggio automatico');
        setTimeout(() => setError(null), 5000);
      } finally {
        setSaving(false);
      }
    }, 2000); // 2 secondi di debounce
  }, [site?.id, initialSite?.id]);

  // Handler per cambiamenti configurazione sito
  const handleSiteConfigChange = (newConfig) => {
    setSiteConfig(prev => ({ ...prev, ...newConfig }));
    autoSave('site_config', { ...siteConfig, ...newConfig });
  };

  // Handler per cambiamenti template
  const handleTemplateConfigChange = (newConfig) => {
    setTemplateConfig(prev => ({ ...prev, ...newConfig }));
    autoSave('template_config', newConfig);
  };

  // Render tabs navigation
  const renderTabs = () => (
    <div className="border-b border-gray-200 mb-8">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title={tab.description}
            >
              <Icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );

  // Render content per ogni tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Caricamento...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab site={site} siteConfig={siteConfig} onChange={handleSiteConfigChange} />;

      case 'pages':
        return (
          <StaticPagesManager
            websiteId={site?.id || initialSite?.id}
            pages={pages}
            onPagesChange={setPages}
            onSave={() => loadSiteData()}
          />
        );

      case 'template':
        return (
          <TemplateCustomizer
            config={templateConfig}
            onConfigChange={handleTemplateConfigChange}
          />
        );

      case 'images':
        return (
          <ImageGalleryManager
            images={images}
            onUpload={async (files) => {
              // Implementa upload immagini
              const uploadedImages = files.map(fileItem => {
                // Estrai il File object dalla struttura data
                const actualFile = fileItem.file || fileItem;

                // Verifica che il file sia valido
                if (!actualFile || !(actualFile instanceof File)) {
                  console.error('File non valido:', actualFile);
                  return null;
                }

                try {
                  const objectUrl = URL.createObjectURL(actualFile);
                  return {
                    id: Date.now() + Math.random(),
                    file_name_originale: actualFile.name || fileItem.name || 'unknown',
                    url_file: objectUrl,
                    preview_url: objectUrl,
                    mime_type: actualFile.type || fileItem.type || 'application/octet-stream',
                    file_size_bytes: actualFile.size || fileItem.size || 0,
                    name: actualFile.name || fileItem.name || 'unknown',
                    url: objectUrl,
                    size: actualFile.size || fileItem.size || 0,
                    category: 'general'
                  };
                } catch (error) {
                  console.error('Errore creazione object URL:', error);
                  return null;
                }
              }).filter(Boolean); // Rimuovi elementi nulli

              setImages(prev => [...prev, ...uploadedImages]);
            }}
            onDelete={(imageId) => {
              // Revoca l'object URL prima di rimuovere l'immagine
              const imageToDelete = images.find(img => img.id === imageId);
              if (imageToDelete && imageToDelete.url_file) {
                URL.revokeObjectURL(imageToDelete.url_file);
              }
              setImages(prev => prev.filter(img => img.id !== imageId));
            }}
          />
        );

      case 'catalog':
        return <CatalogTab catalogSettings={catalogSettings} onChange={setCatalogSettings} />;

      case 'seo':
        return <SEOTab siteConfig={siteConfig} onChange={handleSiteConfigChange} />;

      case 'settings':
        return <SettingsTab site={site} siteConfig={siteConfig} onChange={handleSiteConfigChange} />;

      default:
        return (
          <div className="text-center py-12">
            <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sezione non trovata</h3>
            <p className="mt-1 text-sm text-gray-500">La sezione richiesta non è disponibile.</p>
          </div>
        );
    }
  };

  // Componenti per tabs specifici
  const OverviewTab = ({ site, siteConfig, onChange }) => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informazioni Sito Web</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Sito</label>
            <input
              type="text"
              value={siteConfig.site_title}
              onChange={(e) => onChange({ site_title: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sottodominio</label>
            <input
              type="text"
              value={siteConfig.subdomain}
              onChange={(e) => onChange({ subdomain: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Descrizione</label>
          <textarea
            value={siteConfig.site_description}
            onChange={(e) => onChange({ site_description: e.target.value })}
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiche</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pages.length}</div>
            <div className="text-sm text-gray-500">Pagine create</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{images.length}</div>
            <div className="text-sm text-gray-500">Immagini caricate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {siteConfig.enable_catalog ? 'Attivo' : 'Non attivo'}
            </div>
            <div className="text-sm text-gray-500">Catalogo prodotti</div>
          </div>
        </div>
      </div>
    </div>
  );

  const CatalogTab = ({ catalogSettings, onChange }) => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Impostazioni Catalogo</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={catalogSettings.enable_catalog || false}
              onChange={(e) => onChange({ ...catalogSettings, enable_catalog: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Abilita catalogo prodotti</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={catalogSettings.show_prices !== false}
              onChange={(e) => onChange({ ...catalogSettings, show_prices: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Mostra prezzi</span>
          </label>
        </div>
      </div>
    </div>
  );

  const SEOTab = ({ siteConfig, onChange }) => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SEO & Analytics</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Google Analytics ID</label>
            <input
              type="text"
              value={siteConfig.google_analytics_id}
              onChange={(e) => onChange({ google_analytics_id: e.target.value })}
              placeholder="GA-XXXXXXXX-X"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsTab = ({ site, siteConfig, onChange }) => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
            <input
              type="url"
              value={siteConfig.facebook_url}
              onChange={(e) => onChange({ facebook_url: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
            <input
              type="url"
              value={siteConfig.instagram_url}
              onChange={(e) => onChange({ instagram_url: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
            <input
              type="url"
              value={siteConfig.linkedin_url}
              onChange={(e) => onChange({ linkedin_url: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
            <input
              type="url"
              value={siteConfig.logo_url}
              onChange={(e) => onChange({ logo_url: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Effetti per caricamento dati
  useEffect(() => {
    loadSiteData();
  }, [loadSiteData]);

  // Cleanup degli object URLs quando il componente si smonta
  useEffect(() => {
    return () => {
      // Revoca tutti gli object URLs per evitare memory leaks
      images.forEach(image => {
        if (image.url_file && image.url_file.startsWith('blob:')) {
          URL.revokeObjectURL(image.url_file);
        }
      });
    };
  }, [images]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Crea Nuovo Sito Web' : 'Gestione Sito Web'}
              </h1>
              {site?.site_title && (
                <p className="mt-1 text-sm text-gray-500">{site.site_title}</p>
              )}
            </div>
          </div>

          {saving && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">Salvataggio...</span>
            </div>
          )}

          {success && (
            <div className="flex items-center text-green-600">
              <CheckIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">{success}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Errore</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      {renderTabs()}

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WebsiteBuilderUNIFIED;