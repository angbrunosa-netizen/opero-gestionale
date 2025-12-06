/**
 * Website Builder Component
 * Gestione completa siti web aziendali
 */

import React, { useState } from 'react';
import {
  GlobeAltIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import WebsiteList from './WebsiteList';
import CompanySelector from './CompanySelector';

const WebsiteBuilder = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'new'
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewSite = () => {
    console.log('Opening company selector...');
    setCurrentView('new');
    setSelectedCompany(null);
  };

  const handleCompanySelected = (data) => {
    console.log('Company selected:', data);
    setSelectedCompany(data);
    setCurrentView('list');
    setRefreshTrigger(prev => prev + 1); // Trigger refresh lista
  };

  const handleBack = () => {
    console.log('Going back to list...');
    setCurrentView('list');
    setSelectedCompany(null);
  };

  const handleEdit = (site) => {
    console.log('Editing site:', site);
    // TODO: Implementare modifica sito esistente
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GlobeAltIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Website Builder</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Crea e gestisci siti web professionali per le tue aziende
                </p>
              </div>
            </div>

            {currentView === 'new' && (
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Indietro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && (
          <WebsiteList
            key={refreshTrigger}
            sites={[]} // TODO: Implementare caricamento dati reali
            loading={false} // TODO: Implementare stato loading
            onEdit={handleEdit}
            onNewSite={handleNewSite}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}

        {currentView === 'new' && (
          <CompanySelector
            onCompanySelected={handleCompanySelected}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default WebsiteBuilder;