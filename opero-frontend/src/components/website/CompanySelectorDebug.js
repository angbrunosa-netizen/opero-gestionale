/**
 * Company Selector Debug Component
 * Versione per debug dell'errore
 */

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const CompanySelectorDebug = ({ onCompanySelected, onBack }) => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Configurazione form
  const [configForm, setConfigForm] = useState({
    subdomain: '',
    site_title: '',
    template_id: 1,
    theme_config: {
      primary_color: '#0066cc'
    },
    catalog_settings: {
      enable_catalog: false,
      show_prices: false
    }
  });

  const fetchEligibleCompanies = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Fetching eligible companies...');
      const response = await fetch('http://localhost:3002/api/website/eligible-companies', {
        headers: {
          'Authorization': 'Bearer test-token'  // token di test temporaneo
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('Companies loaded:', data.companies);
        setCompanies(data.companies || []);
        setFilteredCompanies(data.companies || []);
      } else {
        console.error('API error:', data.error);
        setError(data.error || 'Errore nel caricamento delle ditte');
        setCompanies([]);
        setFilteredCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError(`Errore di connessione: ${error.message}`);
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('CompanySelectorDebug mounted');
    fetchEligibleCompanies();
  }, []);

  useEffect(() => {
    // Filtra ditte in base al termine di ricerca
    const filtered = companies.filter(company =>
      company.ragione_sociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.citta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.partita_iva.includes(searchTerm)
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const handleCompanySelect = (company) => {
    console.log('Selected company:', company);
    setSelectedCompany(company);

    // Auto-genera subdomain
    const subdomain = company.ragione_sociale
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 20);

    setConfigForm(prev => ({
      ...prev,
      site_title: company.ragione_sociale,
      subdomain: subdomain
    }));
    setShowConfigForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      console.log('Creating site for company:', selectedCompany);
      console.log('Config form:', configForm);

      const response = await fetch('http://localhost:3002/api/website/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          ditta_id: selectedCompany.id,
          subdomain: configForm.subdomain,
          site_title: configForm.site_title,
          template_id: configForm.template_id,
          theme_config: configForm.theme_config,
          catalog_settings: configForm.catalog_settings
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('Site created successfully:', data);
        onCompanySelected({
          company: selectedCompany,
          site: {
            id: data.sito_id,
            url: data.url,
            subdomain: configForm.subdomain
          }
        });
      } else {
        console.error('API error creating site:', data.error);
        setError(data.error || 'Errore durante la creazione del sito');
      }
    } catch (error) {
      console.error('Error creating site:', error);
      setError(`Errore di connessione: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Seleziona quale vista mostrare
  if (!showConfigForm) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Seleziona Azienda</h2>
              <p className="text-gray-600 mt-1">
                Scegli l'azienda a cui associare il nuovo sito web
              </p>
            </div>
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Indietro
            </button>
          </div>

          {/* Ricerca */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Cerca per nome azienda, città o P.IVA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Statistiche */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-900 font-medium">
                {filteredCompanies.length} aziende disponibili per sito web
              </span>
              {filteredCompanies.length < companies.length && (
                <span className="text-blue-700 ml-2">
                  (di {companies.length} totali)
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Elenco Ditte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              onClick={() => handleCompanySelect(company)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {company.ragione_sociale}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    P.IVA: {company.partita_iva}
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 transition-colors" />
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {company.citta} {company.provincia && `(${company.provincia})`}
                </div>

                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{company.email}</span>
                </div>

                {company.telefono && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {company.telefono}
                  </div>
                )}

                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-green-700">
                    {company.prodotti_count || 0} prodotti disponibili
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-blue-600">
                  <GlobeAltIcon className="h-3 w-3 mr-1" />
                  Clicca per configurare sito web
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Form Configurazione Sito
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configura Sito Web
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-900">
              {selectedCompany?.ragione_sociale}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm border p-6">
        {/* Subdomain */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indirizzo Sito Web
          </label>
          <div className="flex">
            <input
              type="text"
              value={configForm.subdomain}
              onChange={(e) => setConfigForm(prev => ({...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')}))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="nomeditta"
              required
            />
            <div className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
              .operocloud.it
            </div>
          </div>
        </div>

        {/* Site Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titolo del Sito
          </label>
          <input
            type="text"
            value={configForm.site_title}
            onChange={(e) => setConfigForm(prev => ({...prev, site_title: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Design
          </label>
          <select
            value={configForm.template_id}
            onChange={(e) => setConfigForm(prev => ({...prev, template_id: parseInt(e.target.value)}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1">Professional</option>
            <option value="2">Modern</option>
            <option value="3">Classic</option>
            <option value="4">Creative</option>
          </select>
        </div>

        {/* Anteprima URL */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <GlobeAltIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-900">
              URL Sito: <strong>https://{configForm.subdomain}.operocloud.it</strong>
            </span>
          </div>
        </div>

        {/* Bottoni */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setShowConfigForm(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            ← Indietro
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creazione in corso...
              </span>
            ) : (
              'Crea Sito Web'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySelectorDebug;