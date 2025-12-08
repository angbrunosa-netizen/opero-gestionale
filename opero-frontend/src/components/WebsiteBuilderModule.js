/**
 * Website Builder Module
 * Componente principale per la gestione dei siti web aziendali
 */

import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
  EyeIcon,
  EditIcon
} from '@heroicons/react/24/outline';

// Importa il servizio API per autenticazione automatica
import { api } from '../services/api';

// Lazy load sub-components per evitare circular dependency
const WebsiteList = React.lazy(() => import('./website/WebsiteList'));
const WebsiteBuilderUNIFIED = React.lazy(() => import('./WebsiteBuilderUNIFIED'));
const TemplateSelector = React.lazy(() => import('./website/TemplateSelector'));
const AnalyticsDashboard = React.lazy(() => import('./website/AnalyticsDashboard'));
const CompanySelector = React.lazy(() => import('./website/CompanySelector'));

const WebsiteBuilderModule = () => {
  const [activeTab, setActiveTab] = useState('sites');
  const [selectedSite, setSelectedSite] = useState(null);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Caricamento dati reali
  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setLoading(true);
    try {
      const response = await api.get('/website/list');
      const data = response.data;

      if (data.success) {
        setSites(data.data || data.sites); // Supporta entrambi i formati
      } else {
        console.error('Errore caricamento siti:', data.error);
      }
    } catch (error) {
      console.error('Errore caricamento siti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSite = () => {
    console.log('Opening company selector...');
    setShowCompanySelector(true);
    setSelectedSite(null);
  };

  const handleCompanySelected = (data) => {
    console.log('Company selected:', data);
    setShowCompanySelector(false);
    // Ricarica la lista dei siti
    loadSites();
  };

  const handleBack = () => {
    console.log('Going back to sites list...');
    setShowCompanySelector(false);
    setSelectedSite(null);
  };

  const tabs = [
    { id: 'sites', name: 'Siti Web', icon: GlobeAltIcon },
    { id: 'templates', name: 'Template', icon: PaintBrushIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'Impostazioni', icon: Cog6ToothIcon }
  ];

  const renderContent = () => {
    // Mostra CompanySelector se attivo
    if (showCompanySelector) {
      return (
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <CompanySelector
            onCompanySelected={handleCompanySelected}
            onBack={handleBack}
          />
        </React.Suspense>
      );
    }

    switch (activeTab) {
      case 'sites':
        return selectedSite ? (
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <WebsiteBuilderUNIFIED
              site={selectedSite}
              onSave={() => {
                setSelectedSite(null);
                loadSites();
              }}
              onCancel={() => setSelectedSite(null)}
            />
          </React.Suspense>
        ) : (
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <WebsiteList
              sites={sites}
              loading={loading}
              onEdit={(site) => setSelectedSite(site)}
              onNewSite={handleNewSite}
              onRefresh={loadSites}
            />
          </React.Suspense>
        );

      case 'templates':
        return (
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <TemplateSelector />
          </React.Suspense>
        );

      case 'analytics':
        return (
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <AnalyticsDashboard sites={sites} />
          </React.Suspense>
        );

      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Impostazioni Website Builder</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">Configurazione generale del sistema Website Builder...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Website Builder</h1>
                <p className="text-sm text-gray-500">Gestione siti web aziendali</p>
              </div>
            </div>

            {activeTab === 'sites' && !selectedSite && !showCompanySelector && (
              <button
                onClick={handleNewSite}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Crea Nuovo Sito
              </button>
            )}

            {showCompanySelector && (
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                ← Indietro
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedSite(null); // Resetta il sito selezionato quando si cambia tab
                  }}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {renderContent()}
      </div>
    </div>
  );
};

export default WebsiteBuilderModule;