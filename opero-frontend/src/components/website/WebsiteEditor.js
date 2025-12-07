/**
 * Website Editor Component
 * Form per la creazione e modifica di un sito web
 */

import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  DocumentTextIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon,
  ServerIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

// Import componenti
import PagesManagerStatic from './PagesManagerStatic';

const WebsiteEditor = ({ site, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id_ditta: site?.id_ditta || '',
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

  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);

  // Monitoriamo quando il componente viene smontato o quando activeTab cambia
  useEffect(() => {
    console.log('WebsiteEditor: activeTab cambiato a:', activeTab);

    return () => {
      console.log('WebsiteEditor: cleanup - activeTab era:', activeTab);
    };
  }, [activeTab]);

  useEffect(() => {
    console.log('WebsiteEditor: componente montato/aggiornato, site:', site?.id);

    return () => {
      console.log('WebsiteEditor: componente smontato!');
    };
  }, [site?.id]);

  const [showPagesManager, setShowPagesManager] = useState(false);

  const tabs = [
    { id: 'basic', name: 'Impostazioni Base', icon: GlobeAltIcon },
    { id: 'pages', name: 'Pagine Sito', icon: DocumentTextIcon },
    { id: 'seo', name: 'SEO & Contenuti', icon: DocumentTextIcon },
    { id: 'media', name: 'Media & Brand', icon: PhotoIcon },
    { id: 'social', name: 'Social & Analytics', icon: ChartBarIcon },
    { id: 'catalog', name: 'Catalogo', icon: ShoppingBagIcon },
    { id: 'advanced', name: 'Avanzate', icon: Cog6ToothIcon }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/website/${site?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'basic',
          data: formData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        onSave(formData);
      } else {
        throw new Error(data.error || 'Errore durante il salvataggio');
      }
    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert(`Errore durante il salvataggio del sito: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const renderBasicSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sottodominio
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleInputChange}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="nomeditta"
              disabled={!!site?.id}
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              .operocloud.it
            </span>
          </div>
          {site?.id && (
            <p className="mt-1 text-sm text-gray-500">
              Il sottodominio non può essere modificato dopo la creazione
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stato Dominio
          </label>
          <select
            name="domain_status"
            value={formData.domain_status}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="pending">In Attesa</option>
            <option value="active">Attivo</option>
            <option value="inactive">Inattivo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Titolo Sito Web
        </label>
        <input
          type="text"
          name="site_title"
          value={formData.site_title}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Azienda Alpha Srl"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Template
        </label>
        <select
          name="template_id"
          value={formData.template_id}
          onChange={handleInputChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value={1}>Professional</option>
          <option value={2}>Modern</option>
          <option value={3}>Creative</option>
          <option value={4}>Ecommerce</option>
          <option value={5}>Corporate</option>
        </select>
      </div>
    </div>
  );

  const renderSeoSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrizione SEO
        </label>
        <textarea
          name="site_description"
          value={formData.site_description}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Descrizione del sito web per i motori di ricerca..."
        />
        <p className="mt-2 text-sm text-gray-500">
          Massimo 160 caratteri. Apparirà nei risultati di ricerca.
        </p>
      </div>
    </div>
  );

  const renderMediaSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL Logo
          </label>
          <input
            type="url"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL Favicon
          </label>
          <input
            type="url"
            name="favicon_url"
            value={formData.favicon_url}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );

  const renderSocialSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Google Analytics ID
          </label>
          <input
            type="text"
            name="google_analytics_id"
            value={formData.google_analytics_id}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="G-XXXXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Facebook URL
          </label>
          <input
            type="url"
            name="facebook_url"
            value={formData.facebook_url}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://facebook.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Instagram URL
          </label>
          <input
            type="url"
            name="instagram_url"
            value={formData.instagram_url}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            LinkedIn URL
          </label>
          <input
            type="url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://linkedin.com/..."
          />
        </div>
      </div>
    </div>
  );

  const renderCatalogSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Abilita Vetrina Prodotti</h3>
          <p className="mt-1 text-sm text-gray-500">
            Mostra i prodotti del catalogo aziendale sul sito web
          </p>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="enable_catalog"
            checked={formData.enable_catalog}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>

      {formData.enable_catalog && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            I prodotti del catalogo saranno visibili sul sito web. Puoi configurare le impostazioni specifiche nella sezione avanzata.
          </p>
        </div>
      )}
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800">Impostazioni Avanzate</h3>
        <p className="mt-1 text-sm text-yellow-700">
          Questa sezione conterrà impostazioni tecniche avanzate come CDN, certificati SSL, etc.
        </p>
      </div>
    </div>
  );

  const renderPagesTab = () => {
    console.log('WebsiteEditor: renderPagesTab chiamato, site:', site?.id);

    // Test con return immediato
    try {
      console.log('WebsiteEditor: inizio rendering pagine tab');

      if (!site?.id) {
        console.log('WebsiteEditor: nessun site.id, mostro messaggio');
        return (
          <div style={{ backgroundColor: 'yellow', padding: '20px', border: '3px solid red' }}>
            <h1>NESSUN SITE ID - TEST DI RENDERING</h1>
            <p>Site è: {JSON.stringify(site)}</p>
          </div>
        );
      }

      console.log('WebsiteEditor: site.id trovato:', site.id);

      // Return immediato senza componenti complessi
      return (
        <div style={{ backgroundColor: 'lightblue', padding: '20px', border: '3px solid green' }}>
          <h1>PAGINE SITO - FUNZIONA!</h1>
          <p>Site ID: {site.id}</p>
          <p>Site Title: {site.site_title}</p>
          <p>Subdomain: {site.subdomain}</p>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => alert('Button clicked! Site: ' + site.id)}
              style={{ padding: '10px 20px', fontSize: '16px' }}
            >
              TEST BUTTON
            </button>
          </div>
          <p style={{ marginTop: '20px', fontSize: '12px' }}>
            Se vedi questo, il rendering funziona!
          </p>
        </div>
      );

    } catch (error) {
      console.error('WebsiteEditor: ERRORE renderPagesTab:', error);
      return (
        <div style={{ backgroundColor: 'red', color: 'white', padding: '20px' }}>
          <h1>ERRORE RENDERING:</h1>
          <pre>{error.message}</pre>
        </div>
      );
    }
  };

  const renderTabContent = () => {
    console.log('WebsiteEditor: renderTabContent chiamato, activeTab:', activeTab);

    try {
      switch (activeTab) {
        case 'basic':
          console.log('WebsiteEditor: rendering basic tab');
          return renderBasicSettings();
        case 'pages':
          console.log('WebsiteEditor: rendering pages tab - QUI!');
          const result = renderPagesTab();
          console.log('WebsiteEditor: renderPagesTab result:', result ? 'ha restituito JSX' : 'ha restituito null/falsy');
          return result;
        case 'seo':
          console.log('WebsiteEditor: rendering seo tab');
          return renderSeoSettings();
        case 'media':
          console.log('WebsiteEditor: rendering media tab');
          return renderMediaSettings();
        case 'social':
          console.log('WebsiteEditor: rendering social tab');
          return renderSocialSettings();
        case 'catalog':
          console.log('WebsiteEditor: rendering catalog tab');
          return renderCatalogSettings();
        case 'advanced':
          console.log('WebsiteEditor: rendering advanced tab');
          return renderAdvancedSettings();
        default:
          console.log('WebsiteEditor: rendering default basic tab');
          return renderBasicSettings();
      }
    } catch (error) {
      console.error('WebsiteEditor: ERRORE renderTabContent:', error);
      return (
        <div style={{ backgroundColor: 'red', color: 'white', padding: '20px' }}>
          <h1>ERRORE IN renderTabContent:</h1>
          <pre>{error.message}</pre>
        </div>
      );
    }
  };

  try {
    console.log('WebsiteEditor: inizio rendering del componente principale');

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    console.log('WebsiteEditor: click su tab:', tab.id);
                    setActiveTab(tab.id);
                  }}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Icon
                    className={`${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } -ml-0.5 mr-2 h-5 w-5`}
                    aria-hidden="true"
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              console.log('WebsiteEditor: click annulla');
              onCancel();
            }}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <XMarkIcon className="h-5 w-5 inline mr-2" />
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                Salvataggio...
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5 inline mr-2" />
                Salva Sito Web
              </>
            )}
          </button>
        </div>
      </form>
    );
  } catch (error) {
    console.error('WebsiteEditor: ERRORE FATALE nel rendering:', error);
    return (
      <div style={{ backgroundColor: 'red', color: 'white', padding: '20px', margin: '20px' }}>
        <h1>ERRORE FATALE WEBSITE EDITOR:</h1>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </div>
    );
  }
};

export default WebsiteEditor;