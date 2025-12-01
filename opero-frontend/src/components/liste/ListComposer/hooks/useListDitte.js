//useListDitte.js
//src/components/liste/ListComposer/hooks/useListDitte.js
//Questo hook si occupa di recuperare le ditte associate a una causale di movimento specifica.
//30/11/2025 versione 1.0 - Creazione iniziale
//z useListDitte.js


import { useState, useEffect } from 'react';
import { api } from '../../../../services/api';

export const useListDitte = (idCausale) => {
  const [ditte, setDitte] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idCausale) {
      setDitte([]);
      return;
    }

    const fetchDitte = async () => {
      try {
        setIsLoading(true);

        // Recuperiamo tutte le causali e troviamo quella con l'ID richiesto
        const causaliResponse = await api.get('/magazzino/causali');
        const causale = causaliResponse.data.find(c => c.id == idCausale);

        if (!causale) {
          console.warn(`Causale con ID ${idCausale} non trovata`);
          setDitte([]);
          return;
        }

        // Usiamo la stessa logica del componente registrazione contabili
        let params = {};

        if (causale.tipo === 'scarico') {
          // Documento ATTIVO: Cerca Clienti (C) o Enti Convenzionati (E)
          params.relazioni = 'C,E';
        } else if (causale.tipo === 'carico') {
          // Documento PASSIVO: Cerca Fornitori (F)
          params.relazioni = 'F,E';
        } else {
          // Per altri tipi, non servono ditte esterne
          setDitte([]);
          return;
        }

        // Usiamo l'API sicura e testata del componente registrazione contabili
        const response = await api.get('/amministrazione/ditte', { params });
        setDitte(response.data?.data || []);
        setError(null);
      } catch (err) {
        console.error("Errore nel caricamento delle ditte:", err);
        setError(err.response?.data?.error || 'Impossibile caricare le ditte.');
        setDitte([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDitte();
  }, [idCausale]);

  return { ditte, isLoading, error };
};