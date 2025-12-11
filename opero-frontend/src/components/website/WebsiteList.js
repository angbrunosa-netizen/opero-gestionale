/**
 * Website List Component
 * Lista dei siti web aziendali con azioni di gestione
 */

import React, { useState } from 'react';
import {
  GlobeAltIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ServerIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';

const WebsiteList = ({ sites, loading, onEdit, onNewSite, onRefresh }) => {
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    siteId: null,
    siteTitle: '',
    confirmText: '',
    isDeleting: false
  });
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'inactive':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {getStatusIcon(status)}
        <span className="ml-1">
          {status === 'active' ? 'Attivo' : status === 'pending' ? 'In attesa' : 'Inattivo'}
        </span>
      </span>
    );
  };

  // Apre dialog di conferma eliminazione
  const handleDeleteClick = (site) => {
    setDeleteDialog({
      isOpen: true,
      siteId: site.id,
      siteTitle: site.site_title || 'Sito senza titolo',
      confirmText: '',
      isDeleting: false
    });
  };

  // Gestisce eliminazione sito
  const handleDeleteConfirm = async () => {
    if (deleteDialog.confirmText !== 'Sono Sicuro') {
      alert('Devi scrivere esattamente "Sono Sicuro" per procedere');
      return;
    }

    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      const response = await api.delete(`/website-generator/delete/${deleteDialog.siteId}`, {
        data: { confirmText: deleteDialog.confirmText }
      });

      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
        setDeleteDialog({ isOpen: false, siteId: null, siteTitle: '', confirmText: '', isDeleting: false });
        onRefresh(); // Ricarica la lista siti
      } else {
        alert(`❌ Errore: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Errore eliminazione sito:', error);
      alert(`❌ Errore durante l'eliminazione: ${error.response?.data?.error || error.message}`);
    } finally {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Chiudi dialog
  const handleDeleteCancel = () => {
    if (!deleteDialog.isDeleting) {
      setDeleteDialog({ isOpen: false, siteId: null, siteTitle: '', confirmText: '', isDeleting: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="text-center py-12">
        <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun sito web trovato</h3>
        <p className="mt-1 text-sm text-gray-500">
          Inizia creando il tuo primo sito web aziendale.
        </p>
        <div className="mt-6">
          <button
            onClick={onNewSite}
            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            Crea il Tuo Primo Sito Web
          </button>
        </div>

        {/* Info aggiuntiva */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-blue-800 text-center">
            <strong>Info:</strong> Puoi creare siti web solo per ditte con id_tipo_ditta = 1 che non hanno già un sito.
          </p>
          <p className="text-sm text-blue-700 text-center mt-2">
            <strong>Passaggi:</strong> 1) Seleziona azienda → 2) Configura sito → 3) Pubblica
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Siti Web Aziendali</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestisci tutti i siti web delle aziende associate.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={onNewSite}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <GlobeAltIcon className="h-4 w-4 mr-2" />
            Crea Nuovo Sito
          </button>
        </div>

        {/* Messaggio informativo */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Suggerimento:</strong> Crea un sito per qualsiasi azienda con id_tipo_ditta = 1
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sito Web
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titolo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catalogo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creato il
                    </th>
                    <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sites.map((site) => (
                    <tr key={site.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <GlobeAltIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {site.subdomain}.operocloud.it
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <ServerIcon className="h-4 w-4 mr-1" />
                              Server Web
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="text-sm text-gray-900">{site.site_title}</div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Template {site.template_id}
                        </div>
                        <div className="text-sm text-gray-500">Base</div>
                      </td>
                      <td className="whitespace-nowrap">
                        {site.enable_catalog ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Attivo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Disattivo
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {getStatusBadge(site.domain_status)}
                      </td>
                      <td className="whitespace-nowrap text-sm text-gray-500">
                        {new Date(site.created_at).toLocaleDateString('it-IT')}
                      </td>
                      <td className="whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <a
                            href={`https://${site.subdomain}.operocloud.it`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900"
                            title="Visualizza sito"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </a>
                          <button
                            onClick={() => onEdit(site)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifica"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(site)}
                            className="text-red-600 hover:text-red-900"
                            title="Elimina"
                            disabled={deleteDialog.isDeleting}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Conferma Eliminazione */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Conferma Eliminazione Sito
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Sei sicuro di voler eliminare definitivamente il sito:<br/>
                  <strong>"{deleteDialog.siteTitle}"</strong>
                </p>
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ Questa azione è irreversibile e cancellerà:
                </p>
                <ul className="text-sm text-red-600 mt-1 text-left">
                  <li>• Tutte le pagine del sito</li>
                  <li>• I collegamenti alle immagini e gallerie</li>
                  <li>• I file generati sul server</li>
                  <li>• Tutti i dati correlati</li>
                </ul>
                <p className="text-sm text-green-600 mt-2">
                  ✅ Le immagini <strong>NON</strong> saranno cancellate dallo storage S3
                </p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Per confermare, scrivi <strong>"Sono Sicuro"</strong>:
                  </label>
                  <input
                    type="text"
                    value={deleteDialog.confirmText}
                    onChange={(e) => setDeleteDialog(prev => ({ ...prev, confirmText: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Sono Sicuro"
                    disabled={deleteDialog.isDeleting}
                  />
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteDialog.isDeleting || deleteDialog.confirmText !== 'Sono Sicuro'}
                  className={`px-4 py-2 text-white text-base font-medium rounded-md w-full mr-2 ${
                    deleteDialog.confirmText === 'Sono Sicuro' && !deleteDialog.isDeleting
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {deleteDialog.isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminazione in corso...
                    </>
                  ) : (
                    'Elimina Sito'
                  )}
                </button>
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteDialog.isDeleting}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteList;