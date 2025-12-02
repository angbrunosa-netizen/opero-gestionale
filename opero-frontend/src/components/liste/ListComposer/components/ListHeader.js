import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useListCausali } from '../hooks/useListCausali';
import { useListDitte } from '../hooks/useListDitte';
import styles from '../styles/ListComposer.module.css';
// PERCORSO CORRETTO DA components/liste/ListComposer/components a services/
import { api } from '../../../../services/api';

const ListHeader = ({ listData, setListData }) => {
  const { causali, isLoading: isLoadingCausali } = useListCausali();
  const { ditte, isLoading: isLoadingDitte } = useListDitte(listData.id_causale_movimento);
  const { user } = useAuth();
  const [magazzini, setMagazzini] = useState([]);
  const [clientiInfo, setClientiInfo] = useState({});
  const [showListiniModal, setShowListiniModal] = useState(false);
  const [listiniDisponibili, setListiniDisponibili] = useState([]);
  
  useEffect(() => {
    const fetchMagazzini = async () => {
      try {
        const response = await api.get('/magazzino/magazzini');
        setMagazzini(response.data);
      } catch (error) {
        console.error("Errore nel caricamento dei magazzini:", error);
      }
    };
    fetchMagazzini();
  }, []);

  // Carica informazioni cliente quando selezionato (solo per documenti di vendita)
  useEffect(() => {
    if (listData.id_ditta_destinataria && causali.length > 0) {
      const causaleSelezionata = causali.find(c => c.id == listData.id_causale_movimento);
      if (causaleSelezionata && causaleSelezionata.tipo === 'scarico') {
        loadClientiInfo(listData.id_ditta_destinataria);
      }
    }
  }, [listData.id_ditta_destinataria, causali]);

  const loadClientiInfo = async (idCliente) => {
    try {
      // Ottieni informazioni cliente
      const clienteResponse = await api.get(`/anagrafica/clienti/${idCliente}`);
      setClientiInfo(clienteResponse.data);

      // Se il cliente non ha listini configurati, carica tutti i listini disponibili
      if (!clienteResponse.data.listino_cessione || !clienteResponse.data.listino_pubblico) {
        const listiniResponse = await api.get('/anagrafica/listini-disponibili');
        setListiniDisponibili(listiniResponse.data || []);
        setShowListiniModal(true);
      }
    } catch (error) {
      console.error('Errore caricamento informazioni cliente:', error);
    }
  };

  const handleFieldChange = (field, value) => {
    setListData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCausaleChange = (idCausale) => {
    setListData(prev => ({
      ...prev,
      id_causale_movimento: idCausale,
      id_ditta_destinataria: null 
    }));
  };

  const causaleSelezionata = causali.find(c => c.id == listData.id_causale_movimento);
  const needsDittaDestinataria = causaleSelezionata && ['carico', 'scarico'].includes(causaleSelezionata.tipo);

  return (
    <div className={styles.listHeader}>
      <h2 className="text-xl font-bold mb-4">Dettagli Lista</h2>

      {/* Informazioni cliente e listini */}
      {Object.keys(clientiInfo).length > 0 && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-semibold text-green-800 mb-2">Informazioni Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Listino Cessione:</span>
              <span className="font-medium ml-1">{clientiInfo.listino_cessione || 'Non configurato'}</span>
            </div>
            <div>
              <span className="text-gray-600">Listino Pubblico:</span>
              <span className="font-medium ml-1">{clientiInfo.listino_pubblico || 'Non configurato'}</span>
            </div>
            {user?.livello > 60 && (
              <button
                onClick={() => setShowListiniModal(true)}
                className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Modifica Listini
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Causale Movimento</label>
          <select value={listData.id_causale_movimento || ''} onChange={(e) => handleCausaleChange(e.target.value)} disabled={isLoadingCausali} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Seleziona causale...</option>
            {causali.map(causale => (<option key={causale.id} value={causale.id}>{causale.descrizione}</option>))}
          </select>
        </div>

        {needsDittaDestinataria && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{causaleSelezionata.tipo === 'scarico' ? 'Cliente' : 'Fornitore'}</label>
            <select value={listData.id_ditta_destinataria || ''} onChange={(e) => handleFieldChange('id_ditta_destinataria', e.target.value)} disabled={isLoadingDitte} className="w-full p-2 border border-gray-300 rounded-md">
              <option value="">Seleziona...</option>
              {ditte.map(ditta => (<option key={ditta.id} value={ditta.id}>{ditta.ragione_sociale}</option>))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Magazzino</label>
          <select value={listData.id_magazzino || ''} onChange={(e) => handleFieldChange('id_magazzino', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Seleziona magazzino...</option>
            {magazzini.map(magazzino => (<option key={magazzino.id} value={magazzino.id}>{magazzino.descrizione}</option>))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
          <input type="text" value={listData.descrizione} onChange={(e) => handleFieldChange('descrizione', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Riferimento</label>
          <input type="date" value={listData.data_riferimento} onChange={(e) => handleFieldChange('data_riferimento', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
          <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{listData.stato}</div>
        </div>
      </div>

      {/* Modale scelta listini globali */}
      {showListiniModal && listiniDisponibili.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurazione Listini Globali
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Seleziona i listini predefiniti per questo documento. I listini selezionati verranno utilizzati come default per tutti gli articoli.
                </p>
              </div>
              <button
                onClick={() => setShowListiniModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listino Cessione Predefinito
                </label>
                <select
                  value={clientiInfo.listino_cessione || ''}
                  onChange={(e) => {
                    const newClientiInfo = { ...clientiInfo, listino_cessione: parseInt(e.target.value) };
                    setClientiInfo(newClientiInfo);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona listino...</option>
                  {listiniDisponibili.map((listino) => (
                    <option key={`cesione-global-${listino.numero}`} value={listino.numero}>
                      Listino {listino.numero}: €{listino.prezzo_cessione?.toFixed(2) || '0.00'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listino Pubblico Predefinito
                </label>
                <select
                  value={clientiInfo.listino_pubblico || ''}
                  onChange={(e) => {
                    const newClientiInfo = { ...clientiInfo, listino_pubblico: parseInt(e.target.value) };
                    setClientiInfo(newClientiInfo);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona listino...</option>
                  {listiniDisponibili.map((listino) => (
                    <option key={`pubblico-global-${listino.numero}`} value={listino.numero}>
                      Listino {listino.numero}: €{listino.prezzo_pubblico?.toFixed(2) || '0.00'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Riepilogo selezione */}
            <div className="border-t pt-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Riepilogo Configurazione</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-gray-600">Listino Cessione Default:</p>
                  <p className="font-medium">{clientiInfo.listino_cessione ? `Listino ${clientiInfo.listino_cessione}` : 'Non selezionato'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Listino Pubblico Default:</p>
                  <p className="font-medium">{clientiInfo.listino_pubblico ? `Listino ${clientiInfo.listino_pubblico}` : 'Non selezionato'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowListiniModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  // Salva la configurazione dei listini nello stato della lista
                  setListData(prev => ({
                    ...prev,
                    meta_dati: {
                      ...prev.meta_dati,
                      listini_configurazione: clientiInfo
                    }
                  }));
                  setShowListiniModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Salva Configurazione
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListHeader;