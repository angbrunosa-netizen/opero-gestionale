import { useState, useEffect } from 'react';
// PERCORSO CORRETTO DA components/liste/ListComposer/hooks a services/
import { api } from '../../../../services/api';

export const useListCausali = () => {
  const [causali, setCausali] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCausali = async () => {
      try {
        setIsLoading(true);
        // Usiamo l'API sicura del magazzino invece di quella delle liste
        const response = await api.get('/magazzino/causali');
        setCausali(response.data);
        setError(null);
      } catch (err) {
        console.error("Errore nel caricamento delle causali:", err);
        setError(err.response?.data?.error || 'Impossibile caricare le causali.');
        setCausali([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCausali();
  }, []);

  return { causali, isLoading, error };
};