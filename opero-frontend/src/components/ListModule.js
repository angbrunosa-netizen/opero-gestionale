/**
 * List Module
 * Componente principale per la gestione delle liste operative
 */

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  ShareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// Import sub-components
import ListComposerWrapper from './liste/ListComposerWrapper';
import ListHeader from './liste/ListHeader';

const ListModule = () => {
  const [activeView, setActiveView] = useState('lists');
  const [selectedList, setSelectedList] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setLoading(true);
    try {
      // Simula chiamata API
      await new Promise(resolve => setTimeout(resolve, 800));
      setLists([
        {
          id: 1,
          numero: 1,
          descrizione: 'Lista Clienti Regione Lombardia',
          id_ditta: 1,
          ditta_nome: 'Azienda Alpha Srl',
          tipo: 'clienti',
          stato: 'attiva',
          created_at: '2025-01-10',
          totale_righe: 145
        },
        {
          id: 2,
          numero: 2,
          descrizione: 'Lista Fornitori Materiali Edili',
          id_ditta: 1,
          ditta_nome: 'Azienda Alpha Srl',
          tipo: 'fornitori',
          stato: 'bozza',
          created_at: '2025-01-12',
          totale_righe: 78
        },
        {
          id: 3,
          numero: 3,
          descrizione: 'Lista Prodotti in Promozione',
          id_ditta: 2,
          ditta_nome: 'Beta Solutions',
          tipo: 'prodotti',
          stato: 'attiva',
          created_at: '2025-01-15',
          totale_righe: 23
        }
      ]);
    } catch (error) {
      console.error('Errore caricamento liste:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa lista?')) {
      return;
    }

    try {
      // Simula chiamata API
      await new Promise(resolve => setTimeout(resolve, 500));
      setLists(lists.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Errore eliminazione lista:', error);
      alert('Errore durante l\'eliminazione della lista');
    }
  };

  const renderListsTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (lists.length === 0) {
      return (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna lista trovata</h3>
          <p className="mt-1 text-sm text-gray-500">
            Inizia creando una nuova lista operativa.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setSelectedList({})}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuova Lista
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrizione
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azienda
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Righe
              </th>
              <th className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lists.map((list) => (
              <tr key={list.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {list.numero}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{list.descrizione}</div>
                  <div className="text-sm text-gray-500">Creato il {new Date(list.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {list.ditta_nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {list.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    list.stato === 'attiva'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {list.stato}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {list.totale_righe}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setSelectedList(list)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifica"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: implementare anteprima */}}
                      className="text-green-600 hover:text-green-900"
                      title="Anteprima"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: implementare stampa */}}
                      className="text-gray-600 hover:text-gray-900"
                      title="Stampa"
                    >
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: implementare esportazione */}}
                      className="text-purple-600 hover:text-purple-900"
                      title="Esporta"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Elimina"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (selectedList !== null) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedList(null)}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← Indietro
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedList.id ? `Modifica Lista #${selectedList.numero}` : 'Nuova Lista'}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <ListComposerWrapper
            initialData={selectedList}
            onSave={() => {
              setSelectedList(null);
              loadLists();
            }}
            onCancel={() => setSelectedList(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ListHeader
        title="Gestione Liste"
        subtitle="Crea e gestisci liste operative personalizzate"
        onNewList={() => setSelectedList({})}
        onRefresh={loadLists}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {renderListsTable()}
      </div>
    </div>
  );
};

export default ListModule;