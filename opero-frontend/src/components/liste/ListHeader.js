// ListHeader.js (versione adattata)
import React, { useState, useEffect } from 'react';
import { useListCausali } from '../hooks/useListCausali'; // Hook custom per fetchare le causali
import { useListDitte } from '../hooks/useListDitte';   // Hook custom per fetchare le ditte

const ListHeader = ({ listData, setListData }) => {
  const [causali, setCausali] = useState([]);
  const [ditteDisponibili, setDitteDisponibili] = useState([]);
  const [isLoadingCausali, setIsLoadingCausali] = useState(true);
  
  // Fetch delle causali al montaggio del componente
  useEffect(() => {
    const fetchCausali = async () => {
      try {
        const response = await api.get('/liste/causali');
        setCausali(response.data);
      } catch (error) {
        console.error("Errore nel caricamento delle causali:", error);
      } finally {
        setIsLoadingCausali(false);
      }
    };
    fetchCausali();
  }, []);

  // Quando cambia la causale, fetchiamo le ditte corrette
  useEffect(() => {
    if (listData.id_causale_movimento) {
      const fetchDitte = async () => {
        try {
          const response = await api.get(`/liste/ditte-per-causale/${listData.id_causale_movimento}`);
          setDitteDisponibili(response.data);
        } catch (error) {
          console.error("Errore nel caricamento delle ditte:", error);
          setDitteDisponibili([]);
        }
      };
      fetchDitte();
    } else {
      setDitteDisponibili([]);
    }
  }, [listData.id_causale_movimento]);

  const handleCausaleChange = (idCausale) => {
    // Troviamo la causale selezionata per capire il tipo
    const causaleSelezionata = causali.find(c => c.id == idCausale);
    
    setListData(prev => ({
      ...prev,
      id_causale_movimento: idCausale,
      // Resetta la ditta destinataria quando cambia la causale
      id_ditta_destinataria: null 
    }));
  };
  
  const handleFieldChange = (field, value) => {
    setListData(prev => ({ ...prev, [field]: value }));
  };

  // Determina se il campo ditta è necessario
  const causaleSelezionata = causali.find(c => c.id == listData.id_causale_movimento);
  const needsDittaDestinataria = causaleSelezionata && ['carico', 'scarico'].includes(causaleSelezionata.tipo);

  return (
    <div className="list-header p-4 bg-white rounded shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Selezione Causale Movimento (ora il campo principale) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Causale Movimento
          </label>
          <select
            value={listData.id_causale_movimento || ''}
            onChange={(e) => handleCausaleChange(e.target.value)}
            disabled={isLoadingCausali}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Seleziona causale...</option>
            {causali.map(causale => (
              <option key={causale.id} value={causale.id}>
                {causale.descrizione}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Campo Ditta Destinataria (condizionale) */}
        {needsDittaDestinataria && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {causaleSelezionata.tipo === 'scarico' ? 'Cliente' : 'Fornitore'}
            </label>
            <select
              value={listData.id_ditta_destinataria || ''}
              onChange={(e) => handleFieldChange('id_ditta_destinataria', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Seleziona...</option>
              {ditteDisponibili.map(ditta => (
                <option key={ditta.id} value={ditta.id}>
                  {ditta.ragione_sociale}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3. Campo Magazzino (sempre visibile per movimenti) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Magazzino
          </label>
          {/* Qui inserirai un componente per selezionare il magazzino, es. <SearchableMagazzinoInput /> */}
          <input
            type="text"
            placeholder="Seleziona magazzino..."
            // ... logica per la selezione del magazzino
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* Altri campi rimangono uguali */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
          <input
            type="text"
            value={listData.descrizione}
            onChange={(e) => handleFieldChange('descrizione', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Riferimento</label>
          <input
            type="date"
            value={listData.data_riferimento}
            onChange={(e) => handleFieldChange('data_riferimento', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

      </div>
    </div>
  );
};

export default ListHeader;