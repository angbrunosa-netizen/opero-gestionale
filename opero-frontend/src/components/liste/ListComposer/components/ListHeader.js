import React, { useState, useEffect } from 'react';
import { useListCausali } from '../hooks/useListCausali';
import { useListDitte } from '../hooks/useListDitte';
import styles from '../styles/ListComposer.module.css';
// PERCORSO CORRETTO DA components/liste/ListComposer/components a services/
import { api } from '../../../../services/api';

const ListHeader = ({ listData, setListData }) => {
  const { causali, isLoading: isLoadingCausali } = useListCausali();
  const { ditte, isLoading: isLoadingDitte } = useListDitte(listData.id_causale_movimento);
  const [magazzini, setMagazzini] = useState([]);
  
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
    </div>
  );
};

export default ListHeader;