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
        const response = await api.get(`/liste/ditte-per-causale/${idCausale}`);
        setDitte(response.data);
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